const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const nodemailer = require('nodemailer');
let sendgrid;
try {
  sendgrid = require('@sendgrid/mail');
} catch (e) {
  sendgrid = null;
}

// Route to inspect decoded token and headers for debugging
router.get('/whoami', verifyToken, (req, res) => {
  try {
    return res.json({
      userId: req.userId,
      userRole: req.userRole,
      authorizationHeader: req.headers && req.headers.authorization ? req.headers.authorization : null
    });
  } catch (err) {
    console.error('[debug/whoami] Error:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
});

// Debug: toggle disponibilidad sin auth (temporal)
router.put('/mecanicos/:id/disponible', async (req, res) => {
  try {
    const mecanicoId = req.params.id;
    let { disponible } = req.body;

    // Coercionar valores comunes a boolean
    if (typeof disponible !== 'boolean') {
      if (typeof disponible === 'string') {
        const lower = disponible.toLowerCase();
        if (lower === 'true') disponible = true;
        else if (lower === 'false') disponible = false;
      } else if (typeof disponible === 'number') {
        if (disponible === 1) disponible = true;
        else if (disponible === 0) disponible = false;
      }
    }

    if (typeof disponible !== 'boolean') return res.status(400).json({ mensaje: 'El campo "disponible" debe ser booleano.' });

    const Usuario = require('../models/usuario');
    const mecanico = await Usuario.findByIdAndUpdate(mecanicoId, { disponible }, { new: true });
    if (!mecanico) return res.status(404).json({ mensaje: 'Mecánico no encontrado (debug)' });

    console.log('[debug] disponibilidad actualizada (sin auth) id=', mecanicoId, '->', mecanico.disponible);
    return res.json({ mensaje: 'Disponibilidad actualizada (debug)', disponible: mecanico.disponible });
  } catch (err) {
    console.error('[debug/mecanicos/disponible] Error:', err);
    return res.status(500).json({ mensaje: 'Error interno (debug)' });
  }
});

module.exports = router;

// ------------------- SMTP TEST (guarded) -------------------
// POST /api/debug/test-smtp
// Enable by setting DEBUG_ALLOW_SMTP_TEST=true in environment (only temporary)
router.post('/test-smtp', async (req, res) => {
  try {
    if (process.env.DEBUG_ALLOW_SMTP_TEST !== 'true') {
      return res.status(403).json({ mensaje: 'Prueba SMTP deshabilitada en este entorno.' });
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;
    const emailSecure = process.env.EMAIL_SECURE === 'true';

    // Prefer SendGrid API if API key is present
    if (process.env.SENDGRID_API_KEY && sendgrid) {
      sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
      const testTo = process.env.DEBUG_SMTP_TEST_TO || process.env.EMAIL_USER;
      try {
        await sendgrid.send({
          to: testTo,
          from: process.env.EMAIL_USER,
          subject: 'Prueba SMTP (SendGrid)',
          html: '<p>Prueba de envío desde /api/debug/test-smtp</p>'
        });
        return res.json({ ok: true, mensaje: 'Conexión SendGrid verificada (correo enviado).' });
      } catch (err) {
        console.error('[debug/test-smtp] Error enviando con SendGrid:', err && err.message ? err.message : err);
        return res.status(500).json({ ok: false, mensaje: 'Error verificando SendGrid', detalle: err && err.message ? err.message : 'sin detalle' });
      }
    }

    let transporter;
    if (emailHost && emailPort) {
      transporter = nodemailer.createTransport({
        host: emailHost,
        port: parseInt(emailPort, 10),
        secure: !!emailSecure,
        auth: { user: emailUser, pass: emailPass },
        tls: { rejectUnauthorized: false }
      });
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass }
      });
    }

    try {
      await transporter.verify();
      return res.json({ ok: true, mensaje: 'Conexión SMTP verificada correctamente.' });
    } catch (err) {
      console.error('[debug/test-smtp] Error verificando SMTP:', err && err.message ? err.message : err);
      return res.status(500).json({ ok: false, mensaje: 'Error verificando SMTP', detalle: err && err.message ? err.message : 'sin detalle' });
    }
  } catch (err) {
    console.error('[debug/test-smtp] Unexpected error:', err);
    return res.status(500).json({ ok: false, mensaje: 'Error interno al probar SMTP' });
  }
});
