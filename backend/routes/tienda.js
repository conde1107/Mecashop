const express = require("express");
const router = express.Router();
const tiendaController = require("../controllers/tienda");
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/upload");

// Obtener tienda por ID de propietario
router.get("/:tiendaId", verifyToken, tiendaController.obtenerTienda);

// Actualizar información de tienda
router.put("/:tiendaId", verifyToken, tiendaController.actualizarTienda);

// Actualizar foto de tienda
router.put("/:tiendaId/foto", upload.single("foto"), verifyToken, tiendaController.actualizarFotoTienda);

module.exports = router;
