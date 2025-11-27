// backend/routes/auth.js
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/upload");

// LOGIN
router.post("/login", authController.login);

// REGISTER - Usar multer.single() para compatibilidad con archivos
router.post("/register", upload.single("pdf"), authController.register);

// RESET PASSWORD
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// ⭐ PERFIL
router.put("/perfil", verifyToken, upload.single("imagen"), authController.actualizarPerfil);

// 📌 VERIFICAR VENCIMIENTOS
router.get("/vencimientos", verifyToken, authController.verificarVencimientos);

module.exports = router;
