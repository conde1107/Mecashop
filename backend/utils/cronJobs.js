/**
 * Servicios programados (cron) para notificaciones automáticas
 */

const Vehiculo = require('../models/vehiculo');
const Mantenimiento = require('../models/mantenimiento');
const DocumentoVehiculo = require('../models/documentovehiculo');
const Notificacion = require('../models/notificacion');
const { crearNotificacion } = require('./notificacionUtils');
const { obtenerRecomendacionesPendientes, crearNotificacionMantenimiento } = require('./mantenimientoUtils');

/**
 * Revisar vencimiento de documentos (cada día a las 8 AM)
 */
async function revisarVencimientosDocumentos() {
  try {
    console.log('🔍 [CRON] Verificando vencimiento de documentos...');
    
    const hoy = new Date();
    const tresDias = new Date();
    tresDias.setDate(hoy.getDate() + 3);

    // Documentos próximos a vencer
    const proximos = await DocumentoVehiculo.find({
      fechaVencimiento: { $gte: hoy, $lte: tresDias },
      notificadoExpiracion: false
    }).populate({ 
      path: 'vehiculo', 
      populate: { path: 'usuario' } 
    });

    for (const doc of proximos) {
      try {
        const usuario = doc.vehiculo?.usuario;
        if (usuario && usuario._id) {
          const diasRestantes = Math.ceil((doc.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
          
          await crearNotificacion(
            usuario._id,
            `⚠️ ${doc.tipo} por vencer`,
            `El ${doc.tipo} de tu vehículo ${doc.vehiculo.placa} vence en ${diasRestantes} día(s). Actualiza tu documentación.`,
            'documento',
            doc._id
          );

          doc.notificadoExpiracion = true;
          await doc.save();
          
          console.log(`✅ Notificación de vencimiento para usuario ${usuario._id}`);
        }
      } catch (err) {
        console.error('Error procesando documento:', err.message);
      }
    }

    // También revisar SOAT y Técnico-Mecánica de vehículos
    const vehiculos = await Vehiculo.find().populate('usuario');
    
    for (const vehiculo of vehiculos) {
      try {
        if (!vehiculo.usuario) continue;

        // Revisar SOAT
        if (vehiculo.fechaCompraSoat) {
          const fechaVencimientoSoat = new Date(vehiculo.fechaCompraSoat);
          fechaVencimientoSoat.setFullYear(fechaVencimientoSoat.getFullYear() + 1);
          
          if (fechaVencimientoSoat >= hoy && fechaVencimientoSoat <= tresDias) {
            const diasRestantesSoat = Math.ceil((fechaVencimientoSoat - hoy) / (1000 * 60 * 60 * 24));
            
            // Verificar si ya existe notificación reciente
            const hace7Dias = new Date();
            hace7Dias.setDate(hace7Dias.getDate() - 7);
            
            const existeSoat = await Notificacion.findOne({
              usuario_id: vehiculo.usuario._id,
              titulo: { $regex: 'SOAT' },
              referencia_id: vehiculo._id,
              fecha_creacion: { $gte: hace7Dias }
            });

            if (!existeSoat) {
              await crearNotificacion(
                vehiculo.usuario._id,
                `⚠️ SOAT por vencer - ${vehiculo.placa}`,
                `El SOAT de tu vehículo ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa}) vence en ${diasRestantesSoat} día(s). Actualiza tu documentación.`,
                'documento',
                vehiculo._id
              );
              console.log(`✅ Notificación SOAT para usuario ${vehiculo.usuario._id}`);
            }
          }
        }

        // Revisar Técnico-Mecánica
        if (vehiculo.fechaCompraTeconomecanica) {
          const fechaVencimientoTecno = new Date(vehiculo.fechaCompraTeconomecanica);
          fechaVencimientoTecno.setFullYear(fechaVencimientoTecno.getFullYear() + 1);
          
          if (fechaVencimientoTecno >= hoy && fechaVencimientoTecno <= tresDias) {
            const diasRestantesTecno = Math.ceil((fechaVencimientoTecno - hoy) / (1000 * 60 * 60 * 24));
            
            // Verificar si ya existe notificación reciente
            const hace7Dias = new Date();
            hace7Dias.setDate(hace7Dias.getDate() - 7);
            
            const existeTecno = await Notificacion.findOne({
              usuario_id: vehiculo.usuario._id,
              titulo: { $regex: 'Técnico-Mecánica' },
              referencia_id: vehiculo._id,
              fecha_creacion: { $gte: hace7Dias }
            });

            if (!existeTecno) {
              await crearNotificacion(
                vehiculo.usuario._id,
                `⚠️ Técnico-Mecánica por vencer - ${vehiculo.placa}`,
                `El Certificado Técnico-Mecánico de tu vehículo ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa}) vence en ${diasRestantesTecno} día(s). Actualiza tu documentación.`,
                'documento',
                vehiculo._id
              );
              console.log(`✅ Notificación Técnico-Mecánica para usuario ${vehiculo.usuario._id}`);
            }
          }
        }
      } catch (err) {
        console.error('Error procesando vehículo:', err.message);
      }
    }

    console.log(`✅ [CRON] Verificación de documentos completada (${proximos.length} notificaciones)`);
  } catch (error) {
    console.error('❌ Error en revisarVencimientosDocumentos:', error.message);
  }
}

/**
 * Revisar mantenimiento por kilometraje (cada 6 horas)
 */
async function verificarMantenimientoPorKilometraje() {
  try {
    console.log('🔍 [CRON] Verificando mantenimiento por kilometraje...');
    
    const vehiculos = await Vehiculo.find().populate('usuario');
    let notificacionesCreadas = 0;

    for (const vehiculo of vehiculos) {
      try {
        if (!vehiculo.usuario) continue;

        const kmActuales = vehiculo.kilometraje || 0;
        
        const ultimoMantenimiento = await Mantenimiento.findOne({
          vehiculo: vehiculo._id
        }).sort({ fecha: -1 });

        const kmUltimoMantenimiento = ultimoMantenimiento?.kilometraje || 0;
        const kmDesdeUltimo = kmActuales - kmUltimoMantenimiento;

        // Intervalos de mantenimiento
        const intervalos = [
          { km: 5000, tipo: 'Cambio de Aceite', urgencia: 'normal' },
          { km: 10000, tipo: 'Revisión General', urgencia: 'normal' },
          { km: 20000, tipo: 'Revisión de Frenos', urgencia: 'normal' },
          { km: 40000, tipo: 'Servicio Completo', urgencia: 'importante' },
          { km: 80000, tipo: 'Revisión Mayor', urgencia: 'urgente' }
        ];

        for (const intervalo of intervalos) {
          if (kmDesdeUltimo >= intervalo.km) {
            // Verificar si ya existe notificación similar reciente
            const hace7Dias = new Date();
            hace7Dias.setDate(hace7Dias.getDate() - 7);

            const existe = await Notificacion.findOne({
              usuario_id: vehiculo.usuario._id,
              titulo: { $regex: intervalo.tipo },
              referencia_id: vehiculo._id,
              fecha_creacion: { $gte: hace7Dias }
            });

            if (!existe) {
              const titulo = intervalo.urgencia === 'urgente' 
                ? `🚨 Mantenimiento URGENTE: ${intervalo.tipo}`
                : intervalo.urgencia === 'importante'
                ? `⚠️ Mantenimiento Importante: ${intervalo.tipo}`
                : `🔧 Recordatorio de Mantenimiento: ${intervalo.tipo}`;

              await crearNotificacion(
                vehiculo.usuario._id,
                titulo,
                `Tu ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.placa}) ha recorrido ${kmActuales.toLocaleString()} km. Se recomienda realizar ${intervalo.tipo.toLowerCase()}.`,
                'mantenimiento',
                vehiculo._id
              );

              notificacionesCreadas++;
              console.log(`✅ Notificación de mantenimiento para usuario ${vehiculo.usuario._id}`);
            }
          }
        }
      } catch (err) {
        console.error('Error procesando vehículo:', err.message);
      }
    }

    console.log(`✅ [CRON] Verificación de mantenimiento completada (${notificacionesCreadas} notificaciones)`);
  } catch (error) {
    console.error('❌ Error en verificarMantenimientoPorKilometraje:', error.message);
  }
}

/**
 * Verificar recomendaciones de mantenimiento según tipo de uso (cada 12 horas)
 */
async function verificarRecomendacionesMantenimiento() {
  try {
    console.log('🔧 [CRON] Verificando recomendaciones de mantenimiento...');
    
    const vehiculos = await Vehiculo.find().populate('usuario');
    let notificacionesCreadas = 0;

    for (const vehiculo of vehiculos) {
      try {
        if (!vehiculo.usuario) continue;

        const recomendaciones = obtenerRecomendacionesPendientes(vehiculo);

        for (const recomendacion of recomendaciones) {
          const creada = await crearNotificacionMantenimiento(
            vehiculo.usuario._id,
            recomendacion,
            vehiculo
          );
          if (creada) {
            notificacionesCreadas++;
            console.log(`✅ Notificación de mantenimiento para ${vehiculo.placa}`);
          }
        }
      } catch (err) {
        console.error('Error procesando vehículo:', err.message);
      }
    }

    console.log(`✅ [CRON] Verificación de mantenimiento completada (${notificacionesCreadas} notificaciones)`);
  } catch (error) {
    console.error('❌ Error en verificarRecomendacionesMantenimiento:', error.message);
  }
}

/**
 * Eliminar notificaciones antiguas (más de 10 días)
 */
async function limpiarNotificacionesAntiguas() {
  try {
    console.log('🗑️ [CRON] Limpiando notificaciones antiguas...');
    const resultado = await Notificacion.eliminarAntiguasAutomatic();
    console.log(`✅ [CRON] Se eliminaron ${resultado.deletedCount} notificaciones antiguas`);
  } catch (error) {
    console.error('❌ Error en limpiarNotificacionesAntiguas:', error.message);
  }
}

/**
 * Iniciar todos los cron jobs
 */
function iniciarCronjobs() {
  console.log('⏰ Iniciando servicios programados...');

  // Verificar mantenimiento cada 6 horas
  setInterval(() => {
    verificarMantenimientoPorKilometraje();
  }, 6 * 60 * 60 * 1000);

  // Verificar recomendaciones de mantenimiento cada 12 horas
  setInterval(() => {
    verificarRecomendacionesMantenimiento();
  }, 12 * 60 * 60 * 1000);

  // Ejecutar verificación de documentos diariamente a las 8 AM
  const ahora = new Date();
  const target = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 8, 0, 0);
  
  if (target <= ahora) {
    target.setDate(target.getDate() + 1);
  }

  const delayPrimera = target - ahora;
  
  setTimeout(() => {
    revisarVencimientosDocumentos();
    setInterval(() => {
      revisarVencimientosDocumentos();
    }, 24 * 60 * 60 * 1000);
  }, delayPrimera);

  // Limpiar notificaciones antiguas diariamente a las 2 AM
  const targetLimpieza = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 2, 0, 0);
  
  if (targetLimpieza <= ahora) {
    targetLimpieza.setDate(targetLimpieza.getDate() + 1);
  }

  const delayLimpieza = targetLimpieza - ahora;
  
  setTimeout(() => {
    limpiarNotificacionesAntiguas();
    setInterval(() => {
      limpiarNotificacionesAntiguas();
    }, 24 * 60 * 60 * 1000);
  }, delayLimpieza);

  console.log('✅ Servicios programados iniciados');
}

module.exports = {
  iniciarCronjobs,
  revisarVencimientosDocumentos,
  verificarMantenimientoPorKilometraje,
  verificarRecomendacionesMantenimiento,
  limpiarNotificacionesAntiguas
};
