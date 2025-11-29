// controllers/vehiculo.js
const Vehiculo = require("../models/vehiculo");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/Cloudinary"); // Cloudinary configurado

// =====================
// Listar vehículos del usuario
// =====================
exports.obtenerVehiculos = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Usuario no autenticado" });

    const vehiculos = await Vehiculo.find({ usuario: req.userId });
    res.json(vehiculos);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// =====================
// Agregar un nuevo vehículo
// =====================
exports.agregarVehiculo = async (req, res) => {
  try {
    const {
      marca, modelo, kilometraje, placa, tipo, color,
      combustible, tipoUso, tipoAceite, usoEspecial,
      fechaCompraSoat, fechaCompraTeconomecanica
    } = req.body;

    // Validaciones básicas
    if (!marca?.trim() || !modelo?.trim() || !placa?.trim()) {
      return res.status(400).json({ error: "Marca, modelo y placa son obligatorios" });
    }
    if (!req.userId) return res.status(401).json({ error: "Usuario no autenticado" });

    let imagenUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "vehiculos",
        public_id: `${req.userId}_${Date.now()}_vehiculo`,
        overwrite: true,
      });
      imagenUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const nuevoVehiculo = new Vehiculo({
      usuario: req.userId,
      marca: marca.trim(),
      modelo: modelo.trim(),
      kilometraje: parseInt(kilometraje) || 0,
      placa: placa.trim(),
      tipo: tipo || "Carro",
      color: color?.trim() || "",
      combustible: combustible || "Gasolina",
      tipoUso: tipoUso || "diario",
      tipoAceite: tipoAceite || "sintético",
      usoEspecial: usoEspecial || "normal",
      imagen: imagenUrl,
      fechaCompraSoat: fechaCompraSoat?.trim() ? new Date(fechaCompraSoat) : null,
      fechaCompraTeconomecanica: fechaCompraTeconomecanica?.trim() ? new Date(fechaCompraTeconomecanica) : null,
    });

    await nuevoVehiculo.save();
    res.json({ msg: "Vehículo agregado correctamente", vehiculo: nuevoVehiculo });
  } catch (error) {
    console.error("Error al agregar vehículo:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// =====================
// Eliminar un vehículo
// =====================
exports.eliminarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Usuario no autenticado" });

    const vehiculo = await Vehiculo.findOne({ _id: id, usuario: req.userId });
    if (!vehiculo) return res.status(404).json({ error: "Vehículo no encontrado o no autorizado" });

    // Eliminar imagen de Cloudinary si existe
    if (vehiculo.imagen) {
      try {
        const publicId = vehiculo.imagen.split("/").pop().split(".")[0]; // Extrae nombre del archivo
        await cloudinary.uploader.destroy(`vehiculos/${publicId}`);
      } catch (err) {
        console.error("Error eliminando imagen en Cloudinary:", err);
      }
    }

    await vehiculo.deleteOne();
    res.json({ msg: "Vehículo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// =====================
// Actualizar kilometraje y datos opcionales
// =====================
exports.actualizarKilometraje = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoKilometraje, combustible, tipoAceite, color, usoEspecial } = req.body;

    if (!nuevoKilometraje && !combustible && !tipoAceite && !color && !usoEspecial) {
      return res.status(400).json({ error: 'Actualiza al menos un campo' });
    }

    const vehiculo = await Vehiculo.findById(id).populate('usuario');
    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });
    if (vehiculo.usuario._id.toString() !== req.userId) return res.status(403).json({ error: 'No autorizado' });

    if (nuevoKilometraje) {
      const nuevo = parseInt(nuevoKilometraje, 10);
      if (isNaN(nuevo) || nuevo < 0) return res.status(400).json({ error: 'Kilometraje inválido' });
      if (vehiculo.kilometraje != null && nuevo < vehiculo.kilometraje) {
        return res.status(400).json({ error: 'El kilometraje nuevo no puede ser menor al anterior' });
      }
      vehiculo.kilometraje = nuevo;
    }
    if (combustible) vehiculo.combustible = combustible;
    if (tipoAceite) vehiculo.tipoAceite = tipoAceite;
    if (color) vehiculo.color = color;
    if (usoEspecial) vehiculo.usoEspecial = usoEspecial;

    const vehiculoActualizado = await vehiculo.save();

    // Generar notificaciones si cambió el km
    if (nuevoKilometraje) {
      try {
        const { obtenerRecomendacionesPendientes, crearNotificacionMantenimiento } = require('../utils/mantenimientoUtils');
        const vehiculoParaVerificar = await Vehiculo.findById(id).populate('usuario');
        const recomendaciones = obtenerRecomendacionesPendientes(vehiculoParaVerificar);
        for (const recomendacion of recomendaciones) {
          await crearNotificacionMantenimiento(vehiculoParaVerificar.usuario._id, recomendacion, vehiculoParaVerificar);
        }
      } catch (err) {
        console.error('Error generando notificaciones de mantenimiento:', err);
      }
    }

    res.json({ message: 'Vehículo actualizado', vehiculo: vehiculoActualizado });
  } catch (error) {
    console.error('Error actualizarKilometraje:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// =====================
// Actualizar información general
// =====================
exports.actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaCompraSoat, fechaCompraTeconomecanica } = req.body;

    const vehiculo = await Vehiculo.findById(id);
    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });
    if (vehiculo.usuario.toString() !== req.userId) return res.status(403).json({ error: 'No autorizado' });

    if (fechaCompraSoat !== undefined) {
      vehiculo.fechaCompraSoat = fechaCompraSoat?.trim() ? new Date(fechaCompraSoat) : null;
    }
    if (fechaCompraTeconomecanica !== undefined) {
      vehiculo.fechaCompraTeconomecanica = fechaCompraTeconomecanica?.trim() ? new Date(fechaCompraTeconomecanica) : null;
    }

    await vehiculo.save();
    res.json({ message: 'Vehículo actualizado', vehiculo });
  } catch (error) {
    console.error('Error actualizarVehiculo:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// =====================
// Subir documentos (SOAT y Tecnomecánica) a Cloudinary
// =====================
exports.subirDocumentos = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findById(id);
    if (!vehiculo) return res.status(404).json({ error: "Vehículo no encontrado" });
    if (vehiculo.usuario.toString() !== req.userId)
      return res.status(403).json({ error: "No autorizado" });

    if (!req.files || (!req.files.soat && !req.files.tecnomecanica)) {
      return res.status(400).json({ error: "Debes subir al menos un documento" });
    }

    // Subir SOAT
    if (req.files.soat) {
      const soatPath = req.files.soat[0].path;
      const result = await cloudinary.uploader.upload(soatPath, {
        folder: "vehiculos/documentos",
        public_id: `${req.userId}_${vehiculo._id}_soat`,
        overwrite: true,
      });
      vehiculo.soat = result.secure_url;
      fs.unlinkSync(soatPath);
    }

    // Subir Tecnomecánica
    if (req.files.tecnomecanica) {
      const tecPath = req.files.tecnomecanica[0].path;
      const result = await cloudinary.uploader.upload(tecPath, {
        folder: "vehiculos/documentos",
        public_id: `${req.userId}_${vehiculo._id}_tecnomecanica`,
        overwrite: true,
      });
      vehiculo.tecnomecanica = result.secure_url;
      fs.unlinkSync(tecPath);
    }

    await vehiculo.save();
    res.json({ message: "Documentos subidos correctamente", vehiculo });
  } catch (error) {
    console.error("Error al subir documentos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};
