const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

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
