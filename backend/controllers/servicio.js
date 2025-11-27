const path = require("path");
const Servicio = require("../models/servicio");
const Solicitud = require("../models/solicitud");

// ✅ Obtener servicios del mecánico
exports.obtenerServiciosDeMecanico = async (req, res) => {
  try {
    const servicios = await Servicio.find({ mecanicoId: req.params.mecanicoId })
      .populate("clienteId", "nombre correo")
      .populate("solicitudId", "fecha hora estado")
      .sort({ fechaCreacion: -1 });

    res.json(servicios);
  } catch (error) {
    console.error("❌ Error obtenerServiciosDeMecanico:", error);
    res.status(500).json({ mensaje: "Error al obtener servicios" });
  }
};

// ✅ Obtener servicios del cliente (nuevo)
exports.obtenerServiciosDeCliente = async (req, res) => {
  try {
    const servicios = await Servicio.find({ clienteId: req.params.clienteId })
      .populate("mecanicoId", "nombre correo")
      .sort({ fechaCreacion: -1 });

    res.json(servicios);
  } catch (error) {
    console.error("❌ Error obtenerServiciosDeCliente:", error);
    res.status(500).json({ mensaje: "Error al obtener servicios del cliente" });
  }
};

// ✅ Obtener servicios completados por vehículo (con informes PDF)
exports.obtenerServiciosPorVehiculo = async (req, res) => {
  try {
    const { vehiculoId } = req.params;
    const clienteId = req.userId; // Del token
    
    console.log(`🔍 Buscando servicios para vehículo ${vehiculoId}, cliente ${clienteId}`);
    
    // Obtener solicitudes del vehículo
    const Solicitud = require("../models/solicitud");
    const solicitudes = await Solicitud.find({ vehiculoId, clienteId });
    
    console.log(`📋 Solicitudes encontradas: ${solicitudes.length}`);
    if (solicitudes.length > 0) {
      solicitudes.forEach(s => console.log(`   - Solicitud ${s._id}: ${s.estado}`));
    }
    
    if (!solicitudes || solicitudes.length === 0) {
      console.log("⚠️ Sin solicitudes para este vehículo");
      // Intentar buscar servicios directamente por clienteId (sin pasar por solicitudes)
      const servicios = await Servicio.find({ clienteId })
        .populate("mecanicoId", "nombre correo")
        .populate("solicitudId", "fecha vehiculoId estado")
        .sort({ fechaCreacion: -1 });
      
      // Filtrar solo los que pertenecen a este vehículo (a través de la solicitud)
      const serviciosFiltrados = servicios.filter(s => s.solicitudId?.vehiculoId?.toString() === vehiculoId);
      
      console.log(`✅ Servicios encontrados (alternativo): ${serviciosFiltrados.length}`);
      return res.json(serviciosFiltrados);
    }
    
    const solicitudIds = solicitudes.map(s => s._id);
    
    // Buscar TODOS los servicios para este vehículo
    const todoServicios = await Servicio.find({
      solicitudId: { $in: solicitudIds }
    })
      .populate("mecanicoId", "nombre correo")
      .populate("solicitudId", "fecha vehiculoId estado")
      .sort({ fechaCreacion: -1 });
    
    console.log(`📊 Total de servicios encontrados: ${todoServicios.length}`);
    
    // Retornar todos (con o sin informe)
    const servicios = todoServicios;
    
    console.log(`✅ Servicios encontrados: ${servicios.length}`);
    servicios.forEach(s => {
      console.log(`   - ${s.nombreServicio} | Informe: ${s.informe || 'Sin informe'} | Estado: ${s.estado}`);
    });

    res.json(servicios);
  } catch (error) {
    console.error("❌ Error obtenerServiciosPorVehiculo:", error);
    res.status(500).json({ mensaje: "Error al obtener servicios del vehículo" });
  }
};

// ✅ Subir informe PDF del mecánico
exports.subirInforme = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: "Debes subir un archivo PDF." });
    }

    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      { informe: `uploads/${req.file.filename}` },
      { new: true }
    );

    if (!servicio) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    res.json({
      mensaje: "✅ Informe subido correctamente",
      servicio,
      urlInforme: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error("❌ Error subirInforme:", error);
    res.status(500).json({ mensaje: "Error al subir informe" });
  }
};

// ✅ Crear servicio desde cita aceptada (admite múltiples servicios)
exports.crearDesdeCita = async (req, res) => {
  try {
    const { solicitudId } = req.params;

    const solicitud = await Solicitud.findById(solicitudId);
    if (!solicitud) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }

    solicitud.estado = "aceptada";
    await solicitud.save({ validateBeforeSave: false });

    const serviciosCreados = [];

    // Si la solicitud tiene varios servicios
    if (Array.isArray(solicitud.servicios) && solicitud.servicios.length > 0) {
      for (const serv of solicitud.servicios) {
        const nuevoServicio = new Servicio({
          solicitudId: solicitud._id,
          clienteId: solicitud.clienteId,
          mecanicoId: solicitud.mecanicoId,
          nombreServicio: serv.nombreServicio,
          descripcion: serv.descripcion,
          estado: "pendiente",
        });

        await nuevoServicio.save();
        serviciosCreados.push(nuevoServicio);
      }
    } else {
      // Si es una solicitud con un solo servicio (formato antiguo)
      const servicio = new Servicio({
        solicitudId: solicitud._id,
        clienteId: solicitud.clienteId,
        mecanicoId: solicitud.mecanicoId,
        nombreServicio: solicitud.nombreServicio || "Servicio general",
        descripcion: solicitud.descripcion || "",
        estado: "pendiente",
      });

      await servicio.save();
      serviciosCreados.push(servicio);
    }

    res.json({
      mensaje: "✅ Servicios creados correctamente",
      servicios: serviciosCreados,
    });
  } catch (error) {
    console.error("❌ Error crearDesdeCita:", error);
    res.status(500).json({ mensaje: "Error al crear servicios desde cita" });
  }
};

// ✅ Completar un servicio
exports.completarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    servicio.estado = "completado";
    await servicio.save();

    // Verificar si todos los servicios de la solicitud están completos
    const solicitud = await Solicitud.findById(servicio.solicitudId);
    if (solicitud) {
      const serviciosPendientes = await Servicio.countDocuments({
        solicitudId: solicitud._id,
        estado: { $ne: "completado" },
      });

      if (serviciosPendientes === 0) {
        solicitud.estado = "finalizado";
        await solicitud.save({ validateBeforeSave: false });
      }
    }

    res.json({ mensaje: "✅ Servicio completado correctamente", servicio });
  } catch (error) {
    console.error("❌ Error completarServicio:", error);
    res.status(500).json({ mensaje: "Error al completar servicio" });
  }
};

// ✅ Calificar servicio (cliente)
exports.calificarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    if (servicio.estado !== "completado") {
      return res.status(400).json({ mensaje: "Solo puedes calificar servicios completados" });
    }

    servicio.calificacion = req.body.calificacion;
    servicio.comentario = req.body.comentario;

    await servicio.save();

    res.json({ mensaje: "✅ Servicio calificado correctamente", servicio });
  } catch (error) {
    console.error("❌ Error calificarServicio:", error);
    res.status(500).json({ mensaje: "Error al calificar servicio" });
  }
};

// ✅ Servicios completados sin calificar
exports.obtenerServiciosPendientesDeCalificar = async (req, res) => {
  try {
    const servicios = await Servicio.find({
      clienteId: req.params.clienteId,
      estado: "completado",
      $or: [{ calificacion: null }, { calificacion: { $exists: false } }],
    }).populate("mecanicoId", "nombre");

    res.json(servicios);
  } catch (error) {
    console.error("❌ Error obtenerServiciosPendientesDeCalificar:", error);
    res.status(500).json({ mensaje: "Error al obtener servicios pendientes" });
  }
};

// ✅ Obtener calificaciones de servicios completados para el mecánico
exports.obtenerCalificacionesDeMecanico = async (req, res) => {
  try {
    const { mecanicoId } = req.params;

    const servicios = await Servicio.find({
      mecanicoId,
      estado: "completado",
      calificacion: { $ne: null },
    })
      .populate("clienteId", "nombre correo")
      .sort({ fechaCreacion: -1 });

    res.json(servicios);
  } catch (error) {
    console.error("❌ Error obtenerCalificacionesDeMecanico:", error);
    res.status(500).json({ mensaje: "Error al obtener calificaciones" });
  }
};

// ✅ Historial de servicios calificados (cliente)
exports.obtenerHistorialCliente = async (req, res) => {
  try {
    const servicios = await Servicio.find({
      clienteId: req.params.clienteId,
      estado: "completado",
      calificacion: { $ne: null },
    })
      .populate("mecanicoId", "nombre")
      .sort({ fechaCreacion: -1 });

    res.json(servicios);
  } catch (error) {
    console.error("❌ Error obtenerHistorialCliente:", error);
    res.status(500).json({ mensaje: "Error al obtener historial" });
  }
};

// Subir diagnóstico (imágenes JPG/PNG, máx 5 archivos de 5MB)
exports.subirDiagnostico = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ mensaje: 'Debes subir al menos una imagen (JPG/PNG).' });
    }

    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) return res.status(404).json({ mensaje: 'Servicio no encontrado' });

    // Guardar rutas relativas
    const imagenes = req.files.map(f => `/uploads/${f.filename}`);

    servicio.diagnosticos = servicio.diagnosticos || [];
    servicio.diagnosticos.push({ descripcion: req.body.descripcion || '', imagenes, tecnicoId: req.userId });

    await servicio.save();

    res.json({ mensaje: 'Diagnóstico guardado', diagnostico: servicio.diagnosticos[servicio.diagnosticos.length - 1], servicio });
  } catch (error) {
    console.error('❌ Error subirDiagnostico:', error);
    res.status(500).json({ mensaje: 'Error al subir diagnóstico' });
  }
};
