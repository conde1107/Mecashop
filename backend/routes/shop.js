// backend/routes/shop.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Ruta shop funcionando correctamente' });
});

module.exports = router;
