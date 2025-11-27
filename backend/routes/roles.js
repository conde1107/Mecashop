// backend/routes/roles.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const verifyToken = require('../middleware/auth');

// Solo el superadmin puede cambiar el rol de otros
router.put('/asignar/:id', verifyToken, async (req, res) => {
  try {
    const { rol } = req.body;

    if (!['admin','tienda', 'mecanico', 'cliente'].includes(rol)) {
      return res.status(400).json({ error: 'Rol no válido' });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { rol },
      { new: true }
    );

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ mensaje: `Rol asignado: ${rol}`, usuario });
  } catch (error) {
    res.status(500).json({ error: 'Error asignando rol' });
  }
});

module.exports = router;
