// backend/controllers/mantenimiento.js
const Mantenimiento = require("../models/mantenimiento");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

// =============================
//  GENERAR INFORME PDF
// =============================
exports.generarInformePDF = async (req, res) => {
  try {
    const { vehiculoId } = req.params;
    const registros = await Mantenimiento.find({ vehiculo: vehiculoId }).populate("vehiculo");

    if (!registros.length)
      return res.status(404).json({ error: "No hay registros de mantenimiento." });

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../uploads/informe-${vehiculoId}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(18).text("Historial de Mantenimiento", { align: "center" });
    doc.moveDown();

    registros.forEach((m, i) => {
      doc.fontSize(14).text(`Registro #${i + 1}`);
      doc.text(`Fecha: ${new Date(m.fecha).toLocaleDateString()}`);
      doc.text(`Descripción: ${m.descripcion}`);
      doc.text(`Kilometraje: ${m.kilometraje || "N/A"}`);
      doc.text(`Costo total: $${m.costo_total || 0}`);
      doc.moveDown();
    });

    doc.end();

    doc.on("finish", () => {
      res.download(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando PDF" });
  }
};

// =============================
//  CALIFICAR SERVICIO
// =============================
exports.calificarServicio = async (req, res) => {
  try {
    const { citaId } = req.params;
    const { calificacion, comentario } = req.body;
    const userId = req.userId; // asumimos que se obtiene del token JWT

    if (!calificacion || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ error: "La calificación debe estar entre 1 y 5" });
    }

    const mantenimiento = await Mantenimiento.findById(citaId);
    if (!mantenimiento) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    mantenimiento.calificacion = calificacion;
    mantenimiento.comentario = comentario || "";
    mantenimiento.fechaCalificacion = new Date();
    mantenimiento.usuario = userId;

    await mantenimiento.save();

    res.json({ mensaje: " Calificación registrada correctamente" });
  } catch (error) {
    console.error(" Error al calificar servicio:", error);
    res.status(500).json({ error: "Error al registrar la calificación" });
  }
};

// =============================
//  OBTENER SERVICIOS RECIENTES (últimos 30 días)
// =============================
exports.obtenerServiciosRecientes = async (req, res) => {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    const servicios = await Mantenimiento.find({
      fecha: { $gte: fechaLimite },
      calificacion: { $exists: false } // aún no calificados
    }).populate("vehiculo");

    if (!servicios.length) {
      return res.status(404).json({ mensaje: "No hay servicios recientes para calificar." });
    }

    res.json(servicios);
  } catch (error) {
    console.error("❌ Error al obtener servicios recientes:", error);
    res.status(500).json({ error: "Error al obtener servicios recientes" });
  }
};

// =============================
//  ACTUALIZAR ÚLTIMO MANTENIMIENTO
// =============================
exports.registrarUltimoMantenimiento = async (req, res) => {
  try {
    const { vehiculoId, tipo, kilometraje } = req.body;

    if (!vehiculoId || !tipo) {
      return res.status(400).json({ error: "Vehículo y tipo de mantenimiento son obligatorios" });
    }

    const Vehiculo = require("../models/vehiculo");
    const update = {};
    const ahora = new Date();

    switch (tipo) {
      case 'cambioAceite':
        update.ultimoCambioAceite = ahora;
        update.ultimoKmCambioAceite = kilometraje || 0;
        break;
      case 'mantenimientoPreventivo':
        update.ultimoMantenimientoPreventivo = ahora;
        update.ultimoKmMantenimientoPreventivo = kilometraje || 0;
        break;
      case 'revisionLlantas':
        update.ultimaRevisionLlantas = ahora;
        update.ultimoKmRevisionLlantas = kilometraje || 0;
        break;
      case 'filtroAire':
        update.ultimaRevisionFiltroAire = ahora;
        update.ultimoKmFiltroAire = kilometraje || 0;
        break;
      case 'revisionFrenos':
        update.ultimaRevisionFrenos = ahora;
        update.ultimoKmFrenos = kilometraje || 0;
        break;
      case 'cambioLiquidoFreno':
        update.ultimoCambioLiquidoFreno = ahora;
        break;
      case 'revisionBateria':
        update.ultimaRevisionBateria = ahora;
        break;
      default:
        return res.status(400).json({ error: "Tipo de mantenimiento inválido" });
    }

    const vehiculo = await Vehiculo.findByIdAndUpdate(vehiculoId, update, { new: true });

    res.json({ 
      mensaje: "Mantenimiento registrado correctamente", 
      vehiculo 
    });
  } catch (error) {
    console.error("❌ Error al registrar mantenimiento:", error);
    res.status(500).json({ error: "Error al registrar mantenimiento" });
  }
};

// =============================
//  OBTENER MANTENIMIENTOS POR VEHÍCULO
// =============================
exports.obtenerMantenimientosPorVehiculo = async (req, res) => {
  try {
    const { vehiculoId } = req.params;
    const clienteId = req.userId; // Del token

    console.log(`🔍 Buscando mantenimientos para vehículo ${vehiculoId}, cliente ${clienteId}`);

    // Primero verificar que el vehículo pertenece al cliente
    const Vehiculo = require("../models/vehiculo");
    const vehiculo = await Vehiculo.findById(vehiculoId);
    
    if (!vehiculo || vehiculo.usuarioId.toString() !== clienteId) {
      console.log(" Vehículo no encontrado o no pertenece al usuario");
      return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    }

    // Obtener todos los mantenimientos del vehículo
    const mantenimientos = await Mantenimiento.find({ vehiculo: vehiculoId })
      .populate("usuario", "nombre")
      .sort({ fecha: -1 });

    console.log(` Mantenimientos encontrados: ${mantenimientos.length}`);
    mantenimientos.forEach(m => {
      console.log(`   - ${m.descripcion} | Fecha: ${m.fecha} | Km: ${m.kilometraje}`);
    });

    res.json(mantenimientos);
  } catch (error) {
    console.error(" Error obtenerMantenimientosPorVehiculo:", error);
    res.status(500).json({ mensaje: "Error al obtener mantenimientos del vehículo" });
  }
};