
// backend/routes/productos.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middleware/auth');

const { 
  crearProducto, 
  obtenerProductos, 
  obtenerProductoPorId,   // ✅ Importar
  actualizarProducto,     // ✅ Importar
  eliminarProducto 
} = require('../controllers/productos');

// === Asegurar carpeta uploads ===
const uploadDir = path.join(__dirname, '../uploads/productos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// === Configurar Multer ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Solo se permiten imágenes PNG o JPG'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// === Rutas ===

// ✅ Crear producto (requiere autenticación)
router.post('/', verifyToken, upload.single('imagen'), (req, res) => {
  crearProducto(req, res);
});

// ✅ Obtener todos los productos
router.get('/', obtenerProductos);

// ✅ Obtener un producto por ID (FUNDAMENTAL)
router.get('/:id', obtenerProductoPorId);

// ✅ Actualizar producto (requiere autenticación)
router.put('/:id', verifyToken, upload.single('imagen'), actualizarProducto);

// ✅ Eliminar producto (requiere autenticación)
router.delete('/:id', verifyToken, eliminarProducto);

module.exports = router;
