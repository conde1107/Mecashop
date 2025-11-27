const Vehiculo = require("../models/vehiculo");
const fs = require("fs");
const path = require("path");

// 📌 Listar vehículos del usuario autenticado
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

// 📌 Agregar un nuevo vehículo
exports.agregarVehiculo = async (req, res) => {
  try {
    const { marca, modelo, kilometraje, placa, tipo, color, combustible, tipoUso, tipoAceite, usoEspecial, fechaCompraSoat, fechaCompraTeconomecanica } = req.body;

    // Limpiar espacios en blanco
    const marcaLimpia = marca ? marca.trim() : "";
    const modeloLimpia = modelo ? modelo.trim() : "";
    const placaLimpia = placa ? placa.trim() : "";
    const colorLimpia = color ? color.trim() : "";

    if (!marcaLimpia || !modeloLimpia || !placaLimpia) {
      return res.status(400).json({ error: "Marca, modelo y placa son obligatorios" });
    }

    if (!req.userId) return res.status(401).json({ error: "Usuario no autenticado" });

    const imagen = req.file ? `/uploads/${req.file.filename}` : null;

    const nuevoVehiculo = new Vehiculo({
      usuario: req.userId,
      marca: marcaLimpia,
      modelo: modeloLimpia,
      kilometraje: parseInt(kilometraje) || 0,
      placa: placaLimpia,
      tipo: tipo || "Carro",
      color: colorLimpia || "", // Siempre guardar, aunque sea vacío
      combustible: combustible || "Gasolina", // Siempre guardar con valor por defecto
      tipoUso: tipoUso || "diario",
      tipoAceite: tipoAceite || "sintético",
      usoEspecial: usoEspecial || "normal",
      imagen,
      fechaCompraSoat: fechaCompraSoat && fechaCompraSoat.trim() !== "" ? new Date(fechaCompraSoat) : null,
      fechaCompraTeconomecanica: fechaCompraTeconomecanica && fechaCompraTeconomecanica.trim() !== "" ? new Date(fechaCompraTeconomecanica) : null,
    });

    console.log('📝 Guardando vehículo con datos:', {
      marca: marcaLimpia,
      modelo: modeloLimpia,
      placa: placaLimpia,
      color: colorLimpia,
      combustible,
      tipoUso,
      tipoAceite,
      usoEspecial
    });

    await nuevoVehiculo.save();
    console.log('✅ Vehículo guardado exitosamente:', nuevoVehiculo._id);
    res.json({ msg: "Vehículo agregado correctamente", vehiculo: nuevoVehiculo });
  } catch (error) {
    console.error("Error al agregar vehículo:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// 📌 Eliminar un vehículo del usuario autenticado
exports.eliminarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Usuario no autenticado" });

    const vehiculo = await Vehiculo.findOne({ _id: id, usuario: req.userId });
    if (!vehiculo) {
      return res.status(404).json({ error: "Vehículo no encontrado o no autorizado" });
    }

    // 🧹 Eliminar imagen del servidor si existe
    if (vehiculo.imagen) {
      const rutaImagen = path.join(__dirname, "..", vehiculo.imagen.replace(/^\/+/, ""));
      if (fs.existsSync(rutaImagen)) {
        fs.unlinkSync(rutaImagen);
      }
    }

    await vehiculo.deleteOne();
    res.json({ msg: "Vehículo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Actualizar kilometraje (nuevo endpoint)
exports.actualizarKilometraje = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoKilometraje, combustible, tipoAceite, color, usoEspecial } = req.body;

    // Verificar que al menos un campo esté siendo actualizado
    if (!nuevoKilometraje && !combustible && !tipoAceite && !color && !usoEspecial) {
      return res.status(400).json({ error: 'Actualiza al menos un campo' });
    }

    const vehiculo = await Vehiculo.findById(id).populate('usuario');
    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });
    if (vehiculo.usuario._id.toString() !== req.userId) return res.status(403).json({ error: 'No autorizado' });

    // Si hay km, validar que sea válido y mayor al actual
    if (nuevoKilometraje) {
      const nuevo = parseInt(nuevoKilometraje, 10);
      if (isNaN(nuevo) || nuevo < 0) return res.status(400).json({ error: 'Kilometraje inválido' });
      if (vehiculo.kilometraje != null && nuevo < vehiculo.kilometraje) {
        return res.status(400).json({ error: 'El kilometraje nuevo no puede ser menor al anterior' });
      }
      vehiculo.kilometraje = nuevo;
    }

    // Actualizar campos opcionales
    if (combustible) vehiculo.combustible = combustible;
    if (tipoAceite) vehiculo.tipoAceite = tipoAceite;
    if (color) vehiculo.color = color;
    if (usoEspecial) vehiculo.usoEspecial = usoEspecial;

    const vehiculoActualizado = await vehiculo.save();

    console.log('📝 Vehículo actualizado:', {
      placa: vehiculo.placa,
      kilometraje: vehiculo.kilometraje,
      combustible: vehiculo.combustible,
      tipoAceite: vehiculo.tipoAceite,
      color: vehiculo.color,
      usoEspecial: vehiculo.usoEspecial
    });

    // 🔔 Generar notificaciones solo si el km cambió
    if (nuevoKilometraje) {
      try {
        const { obtenerRecomendacionesPendientes, crearNotificacionMantenimiento } = require('../utils/mantenimientoUtils');
        
        // IMPORTANTE: Buscar de nuevo para asegurar que tenemos el documento actual
        const vehiculoParaVerificar = await Vehiculo.findById(id).populate('usuario');
        
        console.log('🔍 Verificando recomendaciones para:', vehiculoParaVerificar.placa, 'km:', vehiculoParaVerificar.kilometraje);
        const recomendaciones = obtenerRecomendacionesPendientes(vehiculoParaVerificar);
        console.log('✅ Recomendaciones encontradas:', recomendaciones.length);

        for (const recomendacion of recomendaciones) {
          console.log('📧 Creando notificación para:', recomendacion.tipo);
          await crearNotificacionMantenimiento(vehiculoParaVerificar.usuario._id, recomendacion, vehiculoParaVerificar);
        }
      } catch (err) {
        console.error('Error generando notificaciones de mantenimiento:', err.message);
        console.error(err.stack);
      }
    }

    res.json({ message: 'Vehículo actualizado', vehiculo: vehiculoActualizado });
  } catch (error) {
    console.error('Error actualizarKilometraje:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// 📌 Actualizar información general del vehículo
exports.actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaCompraSoat, fechaCompraTeconomecanica } = req.body;

    const vehiculo = await Vehiculo.findById(id);
    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });
    if (vehiculo.usuario.toString() !== req.userId) return res.status(403).json({ error: 'No autorizado' });

    if (fechaCompraSoat !== undefined) {
      vehiculo.fechaCompraSoat = fechaCompraSoat && fechaCompraSoat.trim() !== "" ? new Date(fechaCompraSoat) : null;
    }
    if (fechaCompraTeconomecanica !== undefined) {
      vehiculo.fechaCompraTeconomecanica = fechaCompraTeconomecanica && fechaCompraTeconomecanica.trim() !== "" ? new Date(fechaCompraTeconomecanica) : null;
    }

    await vehiculo.save();
    res.json({ message: 'Vehículo actualizado', vehiculo });
  } catch (error) {
    console.error('Error actualizarVehiculo:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
// 📄 Subir documentos (SOAT y Tecnomecánica)
exports.subirDocumentos = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findById(id);
    if (!vehiculo) return res.status(404).json({ error: "Vehículo no encontrado" });

    if (vehiculo.usuario.toString() !== req.userId)
      return res.status(403).json({ error: "No autorizado" });

    // Si no se enviaron archivos
    if (!req.files || ( !req.files.soat && !req.files.tecnomecanica )) {
      return res.status(400).json({ error: "Debes subir al menos un documento" });
    }

    // Guardar rutas de archivos
    if (req.files.soat) {
      vehiculo.soat = `/uploads/${req.files.soat[0].filename}`;
    }
    if (req.files.tecnomecanica) {
      vehiculo.tecnomecanica = `/uploads/${req.files.tecnomecanica[0].filename}`;
    }

    await vehiculo.save();
    res.json({ message: "Documentos subidos correctamente", vehiculo });
  } catch (error) {
    console.error("Error al subir documentos:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};
