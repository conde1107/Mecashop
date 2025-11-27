const Solicitud = require("../models/solicitud");
const Servicio = require("../models/servicio");
const { crearNotificacion } = require("../utils/notificacionUtils");

// =====================================================================
// ✅ Crear solicitud (con múltiples servicios)
// =====================================================================
exports.crearSolicitud = async (req, res) => {
  try {
    const { clienteId, mecanicoId, vehiculoId, servicios, descripcion, fecha, hora } = req.body;

    if (!clienteId || !mecanicoId || !vehiculoId) {
      return res.status(400).json({ mensaje: "Faltan clienteId, mecanicoId o vehiculoId" });
    }

    if (!servicios || !Array.isArray(servicios) || servicios.length === 0) {
      return res.status(400).json({ mensaje: "Debe seleccionar al menos un servicio." });
    }

    // Normalizar servicios en caso de llegar con claves distintas
    const serviciosNormalizados = servicios.map(s => ({
      nombreServicio: s.nombreServicio || s.nombre || "",
      precio: s.precio || 0
    }));

    const precioTotal = serviciosNormalizados.reduce((acc, s) => acc + (s.precio || 0), 0);

    const nuevaSolicitud = new Solicitud({
      clienteId,
      mecanicoId,
      vehiculoId,
      servicios: serviciosNormalizados,
      precioTotal,
      descripcion,
      fecha,
      hora,
      estado: "pendiente"
    });

    await nuevaSolicitud.save();

    // 📬 Notificar al mecánico sobre la nueva solicitud
    try {
      console.log('🔍 Debug crear solicitud:', {
        mecanicoId: nuevaSolicitud.mecanicoId,
        servicios: serviciosNormalizados
      });
      
      await crearNotificacion(
        nuevaSolicitud.mecanicoId,
        "📋 Nueva Solicitud de Cita",
        `Nuevo cliente ha solicitado una cita para los servicios: ${serviciosNormalizados.map(s => s.nombreServicio).join(", ")}`,
        "solicitud",
        nuevaSolicitud._id
      );
      console.log('✅ Notificación de nueva solicitud enviada');
    } catch (err) {
      console.error("❌ Error al enviar notificación de nueva solicitud:", err);
    }

    res.status(201).json({
      mensaje: "Solicitud creada correctamente",
      solicitud: nuevaSolicitud,
    });
  } catch (error) {
    console.error("❌ Error al crear solicitud:", error);
    res.status(500).json({
      mensaje: "Error al crear solicitud",
      error: error.message,
    });
  }
};

// =====================================================================
// ✅ Obtener todas las solicitudes
// =====================================================================
exports.obtenerSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find()
      .populate("clienteId", "nombre correo")
      .populate("mecanicoId", "nombre correo")
      .sort({ fechaCreacion: -1 });

    res.json(solicitudes);
  } catch (error) {
    console.error("❌ Error al obtener solicitudes:", error);
    res.status(500).json({ mensaje: "Error al obtener solicitudes", error: error.message });
  }
};

// =====================================================================
// ✅ Aceptar cita
// =====================================================================
exports.aceptarCita = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id)
      .populate("clienteId", "nombre")
      .populate("mecanicoId", "nombre");
    if (!solicitud) return res.status(404).json({ mensaje: "Solicitud no encontrada" });

    solicitud.estado = "aceptada";
    await solicitud.save();

    // Crear un "Servicio" individual por cada servicio solicitado
    const serviciosCreados = [];
    for (const s of solicitud.servicios) {
      const nuevoServicio = new Servicio({
        solicitudId: solicitud._id,
        clienteId: solicitud.clienteId,
        mecanicoId: solicitud.mecanicoId,
        nombreServicio: s.nombreServicio,
        descripcion: solicitud.descripcion || "",
        estado: "pendiente",
        fecha: solicitud.fecha,
        hora: solicitud.hora,
        precio: s.precio,
      });

      await nuevoServicio.save();
      serviciosCreados.push(nuevoServicio);
    }

    // 📬 Notificar al cliente que su cita fue aceptada
    try {
      const clienteId = solicitud.clienteId._id || solicitud.clienteId;
      const mecanicoNombre = solicitud.mecanicoId.nombre || solicitud.mecanicoId;
      
      console.log('🔍 Debug aceptar cita:', {
        clienteId,
        mecanicoNombre,
        fecha: new Date(solicitud.fecha).toLocaleDateString()
      });
      
      await crearNotificacion(
        clienteId,
        "✅ Cita Aceptada",
        `El mecánico ${mecanicoNombre} ha aceptado tu solicitud de cita para el ${new Date(solicitud.fecha).toLocaleDateString()}`,
        "cita",
        solicitud._id
      );
      console.log('✅ Notificación de aceptación enviada');
    } catch (err) {
      console.error("❌ Error al notificar aceptación de cita:", err);
    }

    res.json({
      mensaje: "Cita aceptada y servicios creados correctamente",
      solicitud,
      servicios: serviciosCreados,
    });
  } catch (error) {
    console.error("🔥 ERROR aceptarCita:", error);
    res.status(500).json({ mensaje: "Error al aceptar cita", error: error.message });
  }
};

// =====================================================================
// ❌ Rechazar cita
// =====================================================================
exports.rechazarCita = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id)
      .populate("clienteId", "nombre")
      .populate("mecanicoId", "nombre");
    if (!solicitud) return res.status(404).json({ mensaje: "Solicitud no encontrada" });

    solicitud.estado = "rechazada";
    await solicitud.save();

    // 📬 Notificar al cliente que su cita fue rechazada
    try {
      const clienteId = solicitud.clienteId._id || solicitud.clienteId;
      const mecanicoNombre = solicitud.mecanicoId.nombre || solicitud.mecanicoId;
      
      console.log('🔍 Debug rechazar cita:', {
        clienteId,
        mecanicoNombre
      });
      
      await crearNotificacion(
        clienteId,
        "❌ Cita Rechazada",
        `El mecánico ${mecanicoNombre} ha rechazado tu solicitud de cita. Por favor intenta con otro mecánico.`,
        "cita",
        solicitud._id
      );
      console.log('✅ Notificación de rechazo enviada');
    } catch (err) {
      console.error("❌ Error al notificar rechazo de cita:", err);
    }

    res.json({ mensaje: "Cita rechazada", solicitud });
  } catch (error) {
    console.error("🔥 ERROR rechazarCita:", error);
    res.status(500).json({ mensaje: "Error al rechazar cita", error: error.message });
  }
};

// =====================================================================
// ✅ Finalizar servicio(s)
// =====================================================================
exports.finalizarServicio = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id);
    if (!solicitud) return res.status(404).json({ mensaje: "Solicitud no encontrada" });

    solicitud.estado = "finalizado";
    await solicitud.save();

    await Servicio.updateMany({ solicitudId: solicitud._id }, { estado: "completado" });

    res.json({ mensaje: "Servicios finalizados correctamente" });
  } catch (error) {
    console.error("❌ Error en finalizarServicio:", error);
    res.status(500).json({ mensaje: "Error al finalizar servicio", error: error.message });
  }
};

// =====================================================================
// ✅ Obtener solicitudes de un mecánico
// =====================================================================
exports.obtenerCitasDeMecanico = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({ mecanicoId: req.params.mecanicoId })
      .populate("clienteId", "nombre correo")
      .sort({ fechaCreacion: -1 });

    res.json(solicitudes);
  } catch (error) {
    console.error("❌ Error obtenerCitasDeMecanico:", error);
    res.status(500).json({ mensaje: "Error al obtener citas del mecánico", error: error.message });
  }
};

// =====================================================================
// ✅ Obtener citas/servicios de un cliente (PENDIENTES Y NO COMPLETADAS)
// =====================================================================
exports.obtenerCitasDelCliente = async (req, res) => {
  try {
    // Usar el userId del token verificado, no del parámetro
    const clienteId = req.userId || req.params.clienteId;
    console.log('[obtenerCitasDelCliente] clienteId:', clienteId);
    
    if (!clienteId) {
      return res.status(400).json({ mensaje: "ClienteId no proporcionado" });
    }
    
    // Obtener SOLO servicios pendientes creados por el mecánico
    const servicios = await Servicio.find({ 
      clienteId: clienteId,
      estado: "pendiente"
    })
      .populate("mecanicoId", "nombre correo telefono zona")
      .sort({ fechaCreacion: -1 });

    console.log('[obtenerCitasDelCliente] servicios pendientes encontrados:', servicios.length);
    res.json(servicios);
  } catch (error) {
    console.error("❌ Error obtenerCitasDelCliente:", error);
    res.status(500).json({ mensaje: "Error al obtener citas del cliente", error: error.message });
  }
};

// =====================================================================
// ✅ Obtener solicitud por ID
// =====================================================================
exports.obtenerSolicitudPorId = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id)
      .populate("clienteId", "nombre correo")
      .populate("mecanicoId", "nombre correo");

    if (!solicitud) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }

    res.json(solicitud);
  } catch (error) {
    console.error("❌ Error obtenerSolicitudPorId:", error);
    res.status(500).json({ mensaje: "Error al obtener solicitud", error: error.message });
  }
};

// =====================================================================
// ✅ Cancelar cita (cliente)
// =====================================================================
exports.cancelarCita = async (req, res) => {
  try {
    const citaId = req.params.id;
    
    // Primero intentar como solicitud
    let solicitud = await Solicitud.findById(citaId);
    let esServicio = false;
    
    // Si no es solicitud, podría ser un servicio
    if (!solicitud) {
      const servicio = await Servicio.findById(citaId);
      if (!servicio) {
        return res.status(404).json({ mensaje: "Cita no encontrada" });
      }
      // Si es servicio, obtener la solicitud
      solicitud = await Solicitud.findById(servicio.solicitudId);
      esServicio = true;
    }

    if (!solicitud) {
      return res.status(404).json({ mensaje: "Solicitud asociada no encontrada" });
    }

    solicitud.estado = "cancelada";
    await solicitud.save();

    // Si hay servicios asociados, también marcarlos como cancelados
    await Servicio.updateMany(
      { solicitudId: solicitud._id },
      { estado: "cancelado" }
    );

    res.json({ 
      mensaje: "Cita cancelada correctamente",
      solicitud 
    });
  } catch (error) {
    console.error("❌ Error cancelarCita:", error);
    res.status(500).json({ mensaje: "Error al cancelar cita", error: error.message });
  }
};

// =====================================================================
// ✅ Reprogramar cita (cliente)
// =====================================================================
exports.reprogramarCita = async (req, res) => {
  try {
    const { fecha, hora } = req.body;
    console.log('[reprogramarCita] fecha:', fecha, 'hora:', hora);

    if (!fecha || !hora) {
      return res.status(400).json({ error: "Fecha y hora son requeridas" });
    }

    const citaId = req.params.id;
    
    // Primero intentar como solicitud
    let solicitud = await Solicitud.findById(citaId)
      .populate("clienteId", "nombre")
      .populate("mecanicoId", "nombre");
    
    // Si no es solicitud, podría ser un servicio
    if (!solicitud) {
      const servicio = await Servicio.findById(citaId);
      if (!servicio) {
        return res.status(404).json({ mensaje: "Cita no encontrada" });
      }
      // Si es servicio, obtener la solicitud
      solicitud = await Solicitud.findById(servicio.solicitudId)
        .populate("clienteId", "nombre")
        .populate("mecanicoId", "nombre");
    }

    if (!solicitud) {
      return res.status(404).json({ mensaje: "Solicitud asociada no encontrada" });
    }

    // Guardar fechas anteriores para la notificación
    const fechaAnterior = solicitud.fecha;
    const horaAnterior = solicitud.hora;

    // Actualizar la solicitud
    solicitud.fecha = fecha;
    solicitud.hora = hora;
    await solicitud.save();

    // Si hay servicios asociados, también actualizarlos
    await Servicio.updateMany(
      { solicitudId: solicitud._id },
      { fecha, hora }
    );

    // 📬 Notificar al mecánico sobre la reprogramación
    try {
      const fechaFormato = new Date(fecha).toLocaleDateString("es-ES");
      const mecanicoId = solicitud.mecanicoId._id || solicitud.mecanicoId;
      const clienteNombre = solicitud.clienteId.nombre || solicitud.clienteId;
      
      console.log('🔍 Debug reprogramación:', {
        mecanicoId,
        clienteNombre,
        fecha: fechaFormato,
        hora
      });
      
      await crearNotificacion(
        mecanicoId,
        "📅 Cita Reprogramada",
        `${clienteNombre} ha reprogramado la cita. Nueva fecha: ${fechaFormato} a las ${hora}. (Anterior: ${new Date(fechaAnterior).toLocaleDateString("es-ES")} a las ${horaAnterior})`,
        "cita",
        solicitud._id
      );
      console.log('✅ Notificación de reprogramación enviada');
    } catch (err) {
      console.error("❌ Error al notificar reprogramación de cita:", err);
    }

    console.log('[reprogramarCita] Cita reprogramada exitosamente:', solicitud._id);
    res.json({ 
      mensaje: "Cita reprogramada correctamente",
      solicitud 
    });
  } catch (error) {
    console.error("❌ Error reprogramarCita:", error);
    res.status(500).json({ error: error.message });
  }
};
