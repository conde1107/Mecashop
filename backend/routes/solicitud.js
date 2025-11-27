const express = require("express");
const router = express.Router();
const solicitudController = require("../controllers/solicitud");
const verifyToken = require("../middleware/auth");

// =========================
// Rutas específicas primero
// =========================
router.get("/mecanico/:mecanicoId", solicitudController.obtenerCitasDeMecanico);
router.get("/cliente/:clienteId", verifyToken, solicitudController.obtenerCitasDelCliente);

// =========================
// Acciones del cliente (ANTES de acciones genéricas)
// =========================
router.delete("/:id", solicitudController.cancelarCita);
router.put("/:id/reprogramar", solicitudController.reprogramarCita);

// =========================
// Acciones del mecánico
// =========================
router.put("/:id/aceptar", solicitudController.aceptarCita);
router.put("/:id/rechazar", solicitudController.rechazarCita);
router.put("/:id/finalizar", solicitudController.finalizarServicio);

// =========================
// Rutas genéricas después
// =========================
router.get("/", solicitudController.obtenerSolicitudes);
router.post("/", solicitudController.crearSolicitud);

// =========================
// Ruta genérica por ID al final
// =========================
router.get("/:id", solicitudController.obtenerSolicitudPorId);

module.exports = router;
