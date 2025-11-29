// backend/middleware/multer.js
import multer from "multer";

// Guardamos los archivos en memoria para subirlos a Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
