const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const {
  obtenerVehiculos,
  agregarVehiculo,
  eliminarVehiculo,
  actualizarKilometraje,
  actualizarVehiculo,
  subirDocumentos,
} = require("../controllers/vehiculo");

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// 📌 Listar vehículos
router.get("/", verifyToken, obtenerVehiculos);

// 📌 Agregar vehículo
router.post("/", verifyToken, upload.single("imagen"), agregarVehiculo);

// 📌 Eliminar vehículo
router.delete("/:id", verifyToken, eliminarVehiculo);

// 📌 Actualizar vehículo (fechas, etc)
router.put("/:id", verifyToken, actualizarVehiculo);

// 📌 Actualizar kilometraje
router.put("/:id/kilometraje", verifyToken, actualizarKilometraje);

// 📌 Verificar mantenimiento bajo demanda
router.post("/:id/verificar-mantenimiento", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const Vehiculo = require("../models/vehiculo");
    const { obtenerRecomendacionesPendientes, crearNotificacionMantenimiento } = require("../utils/mantenimientoUtils");

    const vehiculo = await Vehiculo.findById(id).populate("usuario");
    if (!vehiculo) return res.status(404).json({ error: "Vehículo no encontrado" });
    if (vehiculo.usuario._id.toString() !== req.userId) return res.status(403).json({ error: "No autorizado" });

    const recomendaciones = obtenerRecomendacionesPendientes(vehiculo);
    let notificacionesCreadas = 0;

    for (const recomendacion of recomendaciones) {
      const creada = await crearNotificacionMantenimiento(vehiculo.usuario._id, recomendacion, vehiculo);
      if (creada) notificacionesCreadas++;
    }

    res.json({ 
      mensaje: `Verificación completada. ${notificacionesCreadas} notificaciones generadas`,
      recomendacionesPendientes: recomendaciones,
      notificacionesCreadas 
    });
  } catch (error) {
    console.error("Error verificando mantenimiento:", error);
    res.status(500).json({ error: "Error al verificar mantenimiento" });
  }
});

// 📄 Subir documentos (SOAT / Tecnomecánica)
const uploadDocs = upload.fields([
  { name: "soat", maxCount: 1 },
  { name: "tecnomecanica", maxCount: 1 },
]);
router.post("/:id/documentos", verifyToken, uploadDocs, subirDocumentos);

module.exports = router;
