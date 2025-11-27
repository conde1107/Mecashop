//controllers/auth.js 
const Usuario = require('../models/usuario');
const Vehiculo = require('../models/vehiculo');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { verificarVencimientosUsuario } = require('../utils/vencimientosUtils');

let intentosFallidos = {};
const TIEMPO_BLOQUEO = 30 * 1000; // 30 segundos en ms

// Función para limpiar bloqueos expirados
const limpiarBloqueoExpirado = (correo) => {
  if (intentosFallidos[correo] && intentosFallidos[correo].bloqueado) {
    const tiempoTranscurrido = Date.now() - intentosFallidos[correo].tiempoBloqueo;
    if (tiempoTranscurrido >= TIEMPO_BLOQUEO) {
      intentosFallidos[correo] = { count: 0, bloqueado: false, tiempoBloqueo: null };
    }
  }
};

// Función para obtener tiempo restante de bloqueo
const obtenerTiempoRestante = (correo) => {
  if (!intentosFallidos[correo] || !intentosFallidos[correo].bloqueado) {
    return 0;
  }
  const tiempoTranscurrido = Date.now() - intentosFallidos[correo].tiempoBloqueo;
  const tiempoRestante = TIEMPO_BLOQUEO - tiempoTranscurrido;
  return Math.ceil(tiempoRestante / 1000); // Retorna en segundos
};

// ------------------------ LOGIN ------------------------
exports.login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(400).json({ error: 'Usuario no encontrado' });

    if (usuario.activo === false) {
      return res.status(403).json({
        error: 'Tu cuenta está desactivada. Contacta al administrador.'
      });
    }
    if (!intentosFallidos[correo]) intentosFallidos[correo] = { count: 0, bloqueado: false, tiempoBloqueo: null };
    const registro = intentosFallidos[correo];

    // Limpiar bloqueo si ya expiró
    limpiarBloqueoExpirado(correo);

    if (registro.bloqueado) {
      const tiempoRestante = obtenerTiempoRestante(correo);
      const minutos = Math.ceil(tiempoRestante / 60);
      return res.status(403).json({
        error: `Cuenta bloqueada por intentos fallidos. Revisa tu correo para restablecer tu contraseña. Espera ${minutos} minuto${minutos > 1 ? 's' : ''} para volver a intentar.`,
        bloqueado: true,
        tiempoRestante: tiempoRestante
      });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      registro.count += 1;
      console.log(`[LOGIN] Intento fallido para ${correo}: ${registro.count}/3`);

      if (registro.count >= 3) {
        registro.bloqueado = true;
        registro.tiempoBloqueo = Date.now(); // Guardar timestamp del bloqueo
        console.log(`[LOGIN] Cuenta bloqueada para ${correo}`);

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const resetToken = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await transporter.sendMail({
          from: `"Soporte Mecashop" <${process.env.EMAIL_USER}>`,
          to: correo,
          subject: 'Cuenta bloqueada - Restablecer contraseña',
          html: `
            <h3>Cuenta bloqueada por seguridad</h3>
            <p>Tu cuenta ha sido bloqueada tras 3 intentos fallidos.</p>
            <p>Puedes restablecer tu contraseña aquí:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>Este enlace expira en 15 minutos.</p>
          `
        });

        console.log(`[LOGIN] Enviando respuesta bloqueada con tiempoRestante: 30s`);
        return res.status(403).json({
          error: 'Demasiados intentos fallidos. Se envió un correo para restablecer la contraseña.',
          bloqueado: true,
          tiempoRestante: 30 // 30 segundos
        });
      }

      return res.status(400).json({ error: `Contraseña incorrecta. Intento ${registro.count} de 3.` });
    }

    registro.count = 0;
    registro.bloqueado = false;
    registro.tiempoBloqueo = null;

    const token = jwt.sign(
      { id: usuario._id, correo: usuario.correo, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      userId: usuario._id,
      role: usuario.rol,
      nombre: usuario.nombre,
      correo: usuario.correo,
      pdfPath: usuario.pdfPath || null,
      imagen: usuario.imagen || null,
      especialidad: usuario.especialidad || null
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ------------------------ REGISTER ------------------------
exports.register = async (req, res) => {
  let { nombre, correo, password, rol, especialidad, telefono, direccion } = req.body;

  // DEBUG: registrar lo que llega (temporal)
  console.log('[auth.register] req.body:', req.body);
  console.log('[auth.register] telefono recibido:', telefono);
  console.log('[auth.register] direccion recibida:', direccion);
  if (req.file) console.log('[auth.register] req.file:', { originalname: req.file.originalname, filename: req.file.filename, path: req.file.path });

  // Normalizar correo
  if (correo && typeof correo === 'string') correo = correo.toLowerCase().trim();

  // Validaciones básicas
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) return res.status(400).json({ error: 'El correo ya está registrado' });

    const rolesPermitidos = ['cliente', 'mecanico', 'tienda', 'admin'];
    if (!rolesPermitidos.includes(rol)) return res.status(400).json({ error: 'Rol no permitido' });

    if ((rol === 'mecanico' || rol === 'tienda') && !req.file) {
      return res.status(400).json({ error: 'Debes adjuntar un archivo PDF.' });
    }

    // Validar especialidad para mecánicos
    if (rol === 'mecanico') {
      if (!especialidad || !especialidad.toString().trim()) {
        return res.status(400).json({ error: 'La especialidad es obligatoria para el rol mecánico.' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHasheado = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      password: passwordHasheado,
      rol,
      pdfPath: req.file ? `/uploads/${req.file.filename}` : null,
      especialidad: especialidad ? especialidad.toString().trim().toLowerCase() : "",
      imagen: null,
      disponible: true,
      telefono: telefono || "",
      direccion: direccion || ""
    });

    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: {
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        pdfPath: nuevoUsuario.pdfPath,
        especialidad: nuevoUsuario.especialidad || null,
        imagen: nuevoUsuario.imagen || null,
        telefono: nuevoUsuario.telefono || null,
        direccion: nuevoUsuario.direccion || null
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ------------------------ FORGOT PASSWORD ------------------------
exports.forgotPassword = async (req, res) => {
  try {
    const { correo } = req.body;

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ msg: 'No existe un usuario con este correo.' });
    }

    // Token temporal con crypto
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    usuario.resetPasswordToken = resetToken;
    usuario.resetPasswordExpire = Date.now() + 1000 * 60 * 10; // 10 minutos
    await usuario.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Configurar transporte de correo con Gmail
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Recuperación de contraseña</h2>
        <p>Hola <b>${usuario.nombre}</b>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Si no fuiste tú, ignora este mensaje.</p>
        <p>Haz clic en el enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}" 
          style="display: inline-block; background: #7c3aed; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; margin: 20px 0;">
          Restablecer contraseña
        </a>
        <p style="color: #666; font-size: 14px;">Este enlace es válido solo por 10 minutos.</p>
        <p style="color: #999; font-size: 12px;">Si no solicitaste cambiar tu contraseña, no hagas clic en el enlace.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Soporte Mecashop" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: '🔐 Recuperación de contraseña - Mecashop',
      html,
    });

    res.json({ msg: 'Correo enviado. Revisa tu bandeja de entrada.' });
  } catch (error) {
    console.error('❌ Error en forgotPassword:', error);
    res.status(500).json({ msg: 'Error enviando el correo.' });
  }
};

// ======================== RESET PASSWORD ========================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const usuario = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!usuario) {
      return res.status(400).json({ msg: 'Token inválido o expirado.' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ msg: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    // 🔥 Hash de la nueva contraseña
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(newPassword, salt);

    usuario.resetPasswordToken = null;
    usuario.resetPasswordExpire = null;

    await usuario.save();

    return res.json({ msg: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('❌ Error en resetPassword:', error);
    res.status(500).json({ msg: 'Error al restablecer la contraseña.' });
  }
};

// ------------------------ ACTUALIZAR PERFIL ------------------------
exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, correo, descripcion } = req.body;
    const imagen = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (correo) updateData.correo = correo;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (imagen) updateData.imagen = imagen;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(req.userId, updateData, { new: true });
    res.json(usuarioActualizado);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// 📌 VERIFICAR VENCIMIENTOS DE DOCUMENTOS AL LOGIN
exports.verificarVencimientos = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "No autenticado" });

    const vehiculos = await Vehiculo.find({ usuario: req.userId });
    const alertas = verificarVencimientosUsuario(vehiculos);

    // 📌 Crear notificaciones para alertas críticas
    if (alertas && alertas.length > 0) {
      const Notificacion = require('../models/notificacion');
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);

      for (const alerta of alertas) {
        try {
          // Evitar duplicados en los últimos 7 días
          const existe = await Notificacion.findOne({
            usuario_id: req.userId,
            titulo: { $regex: alerta.tipo.toUpperCase() },
            referencia_id: alerta.vehiculoId,
            fecha_creacion: { $gte: hace7Dias }
          });

          if (!existe) {
            const emoji = alerta.estado === 'vencido' ? '⛔' : '🚨';
            const titulo = `${emoji} ${alerta.tipo.toUpperCase()} - ${alerta.vehiculo}`;
            
            await Notificacion.crear(
              req.userId,
              titulo,
              alerta.mensaje,
              'documento',
              alerta.vehiculoId
            );
          }
        } catch (err) {
          console.error(`Error creando notificación de ${alerta.tipo}:`, err.message);
        }
      }
    }

    res.json({ alertas, vehiculos });
  } catch (error) {
    console.error("Error al verificar vencimientos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};
