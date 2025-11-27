// backend/routes/calificacionProducto.js 
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const controller = require("../controllers/calificacionProducto");

router.post("/", verifyToken, controller.crearCalificacion);
router.get("/:id", controller.obtenerCalificaciones);
router.get("/tienda/:tiendaId", controller.obtenerCalificacionesPorTienda);

module.exports = router;
