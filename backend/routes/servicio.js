const express = require("express");
const router = express.Router();
const servicioController = require("../controllers/servicio");
const verifyToken = require('../middleware/auth');
const multer = require("multer");

// ✅ Configuración para PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Multer para imágenes de diagnóstico: limitar tipo y tamaño
const storageImgs = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const uploadImgs = multer({
  storage: storageImgs,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Formato de imagen no permitido'));
  }
});

// ✅ Obtener servicios del mecánico
router.get("/mecanico/:mecanicoId", servicioController.obtenerServiciosDeMecanico);

// ✅ Obtener servicios completados por vehículo (con PDFs)
router.get("/vehiculo/:vehiculoId", verifyToken, servicioController.obtenerServiciosPorVehiculo);

// ✅ Subir informe PDF
router.post("/:id/subirInforme", upload.single("informe"), servicioController.subirInforme);

// Subir diagnóstico con varias imágenes (mecánico autenticado)
router.post('/:id/diagnostico', verifyToken, uploadImgs.array('imagenes', 5), servicioController.subirDiagnostico);

// ✅ Crear servicio desde cita aceptada
router.post("/desde-cita/:solicitudId", servicioController.crearDesdeCita);

// ✅ Completar servicio
router.put("/:id/completar", servicioController.completarServicio);

// ✅ Calificar servicio
router.put("/:id/calificar", servicioController.calificarServicio);

// ✅ Servicios completados sin calificar
router.get("/pendientes/:clienteId", servicioController.obtenerServiciosPendientesDeCalificar);

// ✅ Historial de servicios calificados (FALTABA)
router.get("/historial/:clienteId", servicioController.obtenerHistorialCliente);

// ✅ Obtener calificaciones del mecánico
router.get("/mecanico/:mecanicoId/calificaciones", servicioController.obtenerCalificacionesDeMecanico);

module.exports = router;
