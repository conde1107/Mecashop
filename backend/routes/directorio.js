const express = require("express");
const router = express.Router();
const { filtrarDirectorio, obtenerUsuarioPorId } = require("../controllers/directorio");

// GET /api/directorio -> Lista filtrada
router.get("/", filtrarDirectorio);

// GET /api/directorio/:id -> Perfil completo
router.get("/:id", obtenerUsuarioPorId);

module.exports = router;
