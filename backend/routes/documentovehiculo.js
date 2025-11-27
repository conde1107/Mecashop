// backend/routes/documentoVehiculo.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/auth');
const docController = require('../controllers/documentovehiculo');

// Multer simple (ya tienes upload middleware; puedes usar el tuyo o este)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

router.post('/', verifyToken, upload.single('archivo'), docController.subirDocumento);
router.get('/vehiculo/:vehiculoId', verifyToken, docController.listarDocumentosPorVehiculo);
router.delete('/:id', verifyToken, docController.eliminarDocumento);

module.exports = router;
