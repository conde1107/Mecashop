// controllers/usuario.js
const Usuario = require("../models/usuario");

// Obtener perfil
const obtenerPerfil = async (req, res) => {
  try {
    // Devolver campos adicionales para perfiles de mecánico
    const usuario = await Usuario.findById(req.userId).select(
      "nombre correo rol imagen descripcion telefono zona especialidad disponible activo direccion ubicacion horario"
    );

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(usuario);
  } catch (error) {
    console.error("[usuario.obtenerPerfil] Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Actualizar perfil
const actualizarPerfil = async (req, res) => {
  try {
    console.log('[usuario.actualizarPerfil] req.body:', req.body);
    if (req.file) console.log('[usuario.actualizarPerfil] req.file:', { originalname: req.file.originalname, filename: req.file.filename });

    const { nombre, correo, password, descripcion, telefono, zona, ubicacion, horario } = req.body;

    const actualizaciones = {};
    if (nombre !== undefined) actualizaciones.nombre = nombre;
    if (correo !== undefined) actualizaciones.correo = correo;
    if (descripcion !== undefined) actualizaciones.descripcion = descripcion;
    if (telefono !== undefined) actualizaciones.telefono = telefono;
    if (zona !== undefined) actualizaciones.zona = zona;
    if (horario !== undefined) actualizaciones.horario = horario; // 🔹 Incluido horario

    // Aceptar ubicacion como objeto { lat, lng }
    if (ubicacion && typeof ubicacion === 'object') {
      const lat = parseFloat(ubicacion.lat);
      const lng = parseFloat(ubicacion.lng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        actualizaciones.ubicacion = { lat, lng };
      }
    }

    if (password) actualizaciones.password = password;

    if (req.file) {
      actualizaciones.imagen = `/uploads/${req.file.filename}`;
    }

    console.log('[usuario.actualizarPerfil] actualizaciones a aplicar:', actualizaciones);

    // Buscar el documento y aplicar cambios
    const usuarioDoc = await Usuario.findById(req.userId);
    if (!usuarioDoc) return res.status(404).json({ error: 'Usuario no encontrado' });

    Object.keys(actualizaciones).forEach((key) => {
      if (key === 'telefono') {
        usuarioDoc.telefono = actualizaciones.telefono !== undefined && actualizaciones.telefono !== null
          ? String(actualizaciones.telefono).trim()
          : '';
      } else {
        usuarioDoc[key] = actualizaciones[key];
      }
    });

    await usuarioDoc.save();

    // Retornar usuario actualizado
    const usuario = await Usuario.findById(req.userId).select(
      "nombre correo rol imagen descripcion telefono zona especialidad disponible activo direccion ubicacion horario"
    );

    res.json({ ok: true, usuario, recibido: req.body, actualizaciones });
  } catch (error) {
    console.error("[usuario.actualizarPerfil] Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select(
      "nombre correo rol imagen descripcion telefono zona especialidad disponible activo direccion ubicacion horario"
    );

    res.json(usuarios);
  } catch (error) {
    console.error("Error en obtenerUsuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  obtenerUsuarios
};
