//backend/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🔧 Para usar __dirname en Node CommonJS no hace falta fileURLToPath
const uploadDir = path.join(__dirname, "../uploads");

// ✅ Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🧱 Configuración de almacenamiento con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = upload; // ✅ CommonJS
