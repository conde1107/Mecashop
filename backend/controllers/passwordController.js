const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendgrid = require('@sendgrid/mail');
const Usuario = require('../models/usuario');

// Configurar SendGrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// 📌 Enviar correo de recuperación
exports.forgotPassword = async (req, res) => {
  try {
    const { correo } = req.body;

    // Buscar usuario
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ msg: 'No existe un usuario con este correo.' });
    }

    // Generar token temporal
    const resetToken = crypto.randomBytes(32).toString('hex');

    usuario.resetPasswordToken = resetToken;
    usuario.resetPasswordExpire = Date.now() + 1000 * 60 * 10; // 10 minutos
    await usuario.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Contenido del correo
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
        <p style="color: #999; font-size: 12px;">Si no solicitaste cambiar tu contraseña, ignora este mensaje.</p>
      </div>
    `;

    // Enviar correo con SendGrid
    await sendgrid.send({
      to: correo,
      from: process.env.EMAIL_FROM, // Debe ser un remitente verificado en SendGrid
      subject: '🔐 Recuperación de contraseña - Mecashop',
      html,
    });

    return res.json({ msg: 'Correo enviado. Revisa tu bandeja de entrada.' });

  } catch (error) {
    console.error('❌ Error en forgotPassword:', error);
    return res.status(500).json({ msg: 'Error enviando el correo.' });
  }
};

// 📌 Restablecer contraseña
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

    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(newPassword, salt);

    usuario.resetPasswordToken = null;
    usuario.resetPasswordExpire = null;

    await usuario.save();

    return res.json({ msg: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('❌ Error en resetPassword:', error);
    return res.status(500).json({ msg: 'Error al restablecer la contraseña.' });
  }
};

// 📌 Verificar si el token es válido
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.params;

    const usuario = await Usuario.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!usuario) {
      return res.status(400).json({ msg: 'Token inválido o expirado.' });
    }

    const tiempoRestante = Math.floor((usuario.resetPasswordExpire - Date.now()) / 1000);

    return res.json({ 
      msg: 'Token válido',
      tiempoRestante: tiempoRestante > 0 ? tiempoRestante : 0,
    });
  } catch (error) {
    console.error('❌ Error en verifyToken:', error);
    return res.status(500).json({ msg: 'Error verificando el token.' });
  }
};
