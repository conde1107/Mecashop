// backend/routes/profile.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const Usuario = require("../models/usuario");

// Obtener perfil del usuario autenticado
router.get("/", verifyToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.userId).select("-password");
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
});

module.exports = router;
