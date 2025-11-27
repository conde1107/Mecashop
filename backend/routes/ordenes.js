// backend/routes/ordenes.js
const express = require('express');
const router = express.Router();

// Ruta de prueba para verificar que las rutas de ordenes funcionan
router.get('/', (req, res) => {
  res.json({ message: 'Ruta ordenes funcionando correctamente' });
});

module.exports = router;
