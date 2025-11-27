// backend/routes/mantenimiento.js
const express = require("express");
const router = express.Router();

const {
  generarInformePDF,
  calificarServicio,
  obtenerServiciosRecientes,
  obtenerMantenimientosPorVehiculo
} = require("../controllers/mantenimiento");

const verifyToken = require("../middleware/auth");

router.get("/vehiculo/:vehiculoId/pdf", verifyToken, generarInformePDF);
router.get("/vehiculo/:vehiculoId", verifyToken, obtenerMantenimientosPorVehiculo);
router.post("/citas/:citaId/calificar", verifyToken, calificarServicio);
router.get("/servicios/recientes", verifyToken, obtenerServiciosRecientes);

module.exports = router;
