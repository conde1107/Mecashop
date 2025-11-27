// routes/usuario.js
const express = require("express");
const router = express.Router();

const {
  obtenerPerfil,
  actualizarPerfil,
  obtenerUsuarios
} = require("../controllers/usuario");
const upload = require("../middleware/upload");
const verifyToken = require("../middleware/auth");

// Ruta base
router.get("/", (req, res) => {
  res.json({ message: "Ruta de usuario funcionando 🚀" });
});

// Obtener perfil
router.get("/perfil", verifyToken, obtenerPerfil);

// Actualizar perfil (con imagen)
router.put("/perfil", verifyToken, upload.single("foto"), actualizarPerfil);

// Obtener lista de usuarios
router.get("/lista", obtenerUsuarios);

module.exports = router;

