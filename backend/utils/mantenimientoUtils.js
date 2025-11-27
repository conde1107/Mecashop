/**
 * Utilidades para calcular recomendaciones de mantenimiento según tipo de uso
 */

// Configuración de cambio de aceite según tipo
const CAMBIO_ACEITE_CONFIG = {
  mineral: { km: 4500, meses: 5 },
  semisintético: { km: 6000, meses: 6 },
  sintético: { km: 10000, meses: 12 }
};

// Recomendaciones más agresivas en ciudad con trancones
const CAMBIO_ACEITE_CIUDAD = {
  mineral: { km: 4000, meses: 4 },
  semisintético: { km: 5500, meses: 5 },
  sintético: { km: 8000, meses: 10 }
};

// Recomendaciones según tipo de uso
const RECOMENDACIONES = {
  diario: {
    cambioAceite: {
      titulo: '🔧 Cambio de aceite recomendado',
      getMensajeYConfig: (vehiculo) => {
        const config = vehiculo.usoEspecial === 'ciudad_trancones' 
          ? CAMBIO_ACEITE_CIUDAD[vehiculo.tipoAceite]
          : CAMBIO_ACEITE_CONFIG[vehiculo.tipoAceite];
        
        let tipoAceiteLabel = vehiculo.tipoAceite.charAt(0).toUpperCase() + vehiculo.tipoAceite.slice(1);
        let mensaje = `Cambio de ${tipoAceiteLabel} cada ${config.km}-${config.km + 2000} km o ${config.meses} meses.`;
        
        if (vehiculo.usoEspecial === 'ciudad_trancones') {
          mensaje += ' ⚠️ En ciudad con trancones es mejor hacer el cambio más temprano.';
        }
        
        return { mensaje, config };
      }
    },
    mantenimientoPreventivo: {
      km: 10000,
      meses: 6,
      titulo: '⚙️ Mantenimiento preventivo recomendado',
      mensaje: 'Revisión de filtros, frenos, suspensión, niveles, fugas, alineación y escáner. Cada 10.000 km o 6 meses'
    },
    filtroAire: {
      km: 12500,
      meses: 12,
      titulo: '💨 Cambio de filtro de aire recomendado',
      mensaje: 'Filtro de aire cada 10.000-15.000 km (o antes si hay mucho polvo)'
    },
    filtroCombustible: {
      km: 30000,
      meses: 24,
      titulo: '⛽ Cambio de filtro de combustible recomendado',
      mensaje: 'Filtro de combustible cada 20.000-40.000 km'
    },
    filtroCabina: {
      km: 12500,
      meses: 6,
      titulo: '❄️ Cambio de filtro de cabina recomendado',
      mensaje: 'Filtro de aire acondicionado cada 10.000-15.000 km o cada 6 meses'
    },
    revisionLlantas: {
      km: 9000,
      meses: 0.5, // 2 semanas = ~0.5 meses
      titulo: '🛞 Revisión de presión de llantas',
      mensaje: 'Revisa presión cada 2 semanas y rotación cada 8.000-10.000 km'
    },
    revisionFrenos: {
      km: 10000,
      meses: 6,
      titulo: '🛑 Revisión de frenos recomendada',
      mensaje: 'Revisar pastillas de freno cada 10.000 km'
    },
    cambioLiquidoFreno: {
      km: 0,
      meses: 24,
      titulo: '🔴 Cambio de líquido de freno recomendado',
      mensaje: 'Cambiar líquido de freno cada 2 años'
    },
    revisionBateria: {
      km: 0,
      meses: 24,
      titulo: '🔋 Revisión de batería recomendada',
      mensaje: 'Vida útil promedio: 2-4 años. Revisa estado periódicamente'
    }
  },
  ocasional: {
    cambioAceite: {
      km: 6000,
      meses: 6,
      titulo: '🔧 Cambio de aceite - Uso ocasional',
      mensaje: 'Por el uso ocasional y trayectos cortos, el aceite se contamina más rápido. Cambio cada 6 meses máximo'
    },
    mantenimientoPreventivo: {
      km: 10000,
      meses: 12,
      titulo: '⚙️ Mantenimiento preventivo recomendado',
      mensaje: 'Aunque sea uso ocasional, hacer recorridos de 15-20 min para que el motor tome temperatura completa'
    },
    revisionLlantas: {
      km: 8000,
      meses: 12,
      titulo: '🛞 Revisión de llantas - Uso ocasional',
      mensaje: 'Verifica presión mensualmente. Rotación cada 8.000-10.000 km o anual si no se llega'
    }
  }
};

/**
 * Obtener recomendaciones pendientes para un vehículo
 */
const obtenerRecomendacionesPendientes = (vehiculo) => {
  const recomendaciones = [];
  const ahora = new Date();
  const tipoUso = vehiculo.tipoUso || 'diario';
  const config = RECOMENDACIONES[tipoUso];

  if (!config) return recomendaciones;

  // Verificar cambio de aceite (incluyendo primera vez cuando es null)
  if (vehiculo.ultimoCambioAceite === null || vehiculo.ultimoCambioAceite) {
    let mesesDesdeAceite = 0;
    let kmDesdeAceite = vehiculo.kilometraje || 0;

    if (vehiculo.ultimoCambioAceite) {
      mesesDesdeAceite = Math.floor((ahora - new Date(vehiculo.ultimoCambioAceite)) / (1000 * 60 * 60 * 24 * 30));
      kmDesdeAceite = (vehiculo.kilometraje || 0) - (vehiculo.ultimoKmCambioAceite || 0);
    } else {
      // Primera vez: asumir que nunca se ha hecho y necesita hacerse inmediatamente
      kmDesdeAceite = vehiculo.kilometraje || 0;
      mesesDesdeAceite = 100; // Un número grande para forzar que sea considerado como pendiente
    }

    const aceiteConfig = config.cambioAceite.getMensajeYConfig 
      ? config.cambioAceite.getMensajeYConfig(vehiculo)
      : { 
          mensaje: config.cambioAceite.mensaje, 
          config: { km: 6000, meses: 6 } 
        };

    // Si está vencido O es la primera vez (null)
    if (vehiculo.ultimoCambioAceite === null || mesesDesdeAceite >= aceiteConfig.config.meses || kmDesdeAceite >= aceiteConfig.config.km) {
      recomendaciones.push({
        tipo: 'cambioAceite',
        urgencia: vehiculo.ultimoCambioAceite === null ? 'urgente' : (mesesDesdeAceite > aceiteConfig.config.meses ? 'urgente' : 'importante'),
        titulo: config.cambioAceite.titulo,
        mensaje: vehiculo.ultimoCambioAceite === null ? `${aceiteConfig.mensaje} (PRIMERA VEZ)` : aceiteConfig.mensaje,
        proximoEn: {
          km: Math.max(0, aceiteConfig.config.km - kmDesdeAceite),
          meses: Math.max(0, aceiteConfig.config.meses - mesesDesdeAceite)
        }
      });
    }
  }

  // Verificar mantenimiento preventivo
  if (vehiculo.ultimoMantenimientoPreventivo === null || vehiculo.ultimoMantenimientoPreventivo) {
    let mesesDesdeMantenimiento = 0;
    let kmDesdeMantenimiento = vehiculo.kilometraje || 0;

    if (vehiculo.ultimoMantenimientoPreventivo) {
      mesesDesdeMantenimiento = Math.floor((ahora - new Date(vehiculo.ultimoMantenimientoPreventivo)) / (1000 * 60 * 60 * 24 * 30));
      kmDesdeMantenimiento = (vehiculo.kilometraje || 0) - (vehiculo.ultimoKmMantenimientoPreventivo || 0);
    } else {
      // Primera vez
      kmDesdeMantenimiento = vehiculo.kilometraje || 0;
      mesesDesdeMantenimiento = 100;
    }

    // Si está vencido O es la primera vez (null)
    if (vehiculo.ultimoMantenimientoPreventivo === null || mesesDesdeMantenimiento >= config.mantenimientoPreventivo.meses || kmDesdeMantenimiento >= config.mantenimientoPreventivo.km) {
      recomendaciones.push({
        tipo: 'mantenimientoPreventivo',
        urgencia: vehiculo.ultimoMantenimientoPreventivo === null ? 'urgente' : 'importante',
        titulo: config.mantenimientoPreventivo.titulo,
        mensaje: vehiculo.ultimoMantenimientoPreventivo === null ? `${config.mantenimientoPreventivo.mensaje} (PRIMERA VEZ)` : config.mantenimientoPreventivo.mensaje,
        proximoEn: {
          km: Math.max(0, config.mantenimientoPreventivo.km - kmDesdeMantenimiento),
          meses: Math.max(0, config.mantenimientoPreventivo.meses - mesesDesdeMantenimiento)
        }
      });
    }
  }

  // Para vehículos de uso diario, verificar filtros, frenos y batería
  if (tipoUso === 'diario' && config.filtroAire) {
    // Filtro de aire
    if (vehiculo.ultimaRevisionFiltroAire === null || vehiculo.ultimaRevisionFiltroAire) {
      let mesesFiltroAire = 0;
      let kmFiltroAire = vehiculo.kilometraje || 0;

      if (vehiculo.ultimaRevisionFiltroAire) {
        mesesFiltroAire = Math.floor((ahora - new Date(vehiculo.ultimaRevisionFiltroAire)) / (1000 * 60 * 60 * 24 * 30));
        kmFiltroAire = (vehiculo.kilometraje || 0) - (vehiculo.ultimoKmFiltroAire || 0);
      } else {
        kmFiltroAire = vehiculo.kilometraje || 0;
        mesesFiltroAire = 100;
      }

      if (vehiculo.ultimaRevisionFiltroAire === null || mesesFiltroAire >= config.filtroAire.meses || kmFiltroAire >= config.filtroAire.km) {
        recomendaciones.push({
          tipo: 'filtroAire',
          urgencia: vehiculo.ultimaRevisionFiltroAire === null ? 'importante' : 'normal',
          titulo: config.filtroAire.titulo,
          mensaje: vehiculo.ultimaRevisionFiltroAire === null ? `${config.filtroAire.mensaje} (PRIMERA VEZ)` : config.filtroAire.mensaje,
          proximoEn: {
            km: Math.max(0, config.filtroAire.km - kmFiltroAire)
          }
        });
      }
    }

    // Frenos
    if (vehiculo.ultimaRevisionFrenos === null || vehiculo.ultimaRevisionFrenos) {
      let mesesFrenos = 0;
      let kmFrenos = vehiculo.kilometraje || 0;

      if (vehiculo.ultimaRevisionFrenos) {
        mesesFrenos = Math.floor((ahora - new Date(vehiculo.ultimaRevisionFrenos)) / (1000 * 60 * 60 * 24 * 30));
        kmFrenos = (vehiculo.kilometraje || 0) - (vehiculo.ultimoKmFrenos || 0);
      } else {
        kmFrenos = vehiculo.kilometraje || 0;
        mesesFrenos = 100;
      }

      if (vehiculo.ultimaRevisionFrenos === null || mesesFrenos >= config.revisionFrenos.meses || kmFrenos >= config.revisionFrenos.km) {
        recomendaciones.push({
          tipo: 'revisionFrenos',
          urgencia: vehiculo.ultimaRevisionFrenos === null ? 'urgente' : 'importante',
          titulo: config.revisionFrenos.titulo,
          mensaje: vehiculo.ultimaRevisionFrenos === null ? `${config.revisionFrenos.mensaje} (PRIMERA VEZ)` : config.revisionFrenos.mensaje,
          proximoEn: {
            km: Math.max(0, config.revisionFrenos.km - kmFrenos)
          }
        });
      }
    }

    // Líquido de freno
    if (vehiculo.ultimoCambioLiquidoFreno) {
      const mesesLiquidoFreno = Math.floor((ahora - new Date(vehiculo.ultimoCambioLiquidoFreno)) / (1000 * 60 * 60 * 24 * 30));

      if (mesesLiquidoFreno >= config.cambioLiquidoFreno.meses) {
        recomendaciones.push({
          tipo: 'cambioLiquidoFreno',
          urgencia: 'importante',
          titulo: config.cambioLiquidoFreno.titulo,
          mensaje: config.cambioLiquidoFreno.mensaje,
          proximoEn: {
            meses: Math.max(0, config.cambioLiquidoFreno.meses - mesesLiquidoFreno)
          }
        });
      }
    }

    // Batería
    if (vehiculo.ultimaRevisionBateria) {
      const mesesBateria = Math.floor((ahora - new Date(vehiculo.ultimaRevisionBateria)) / (1000 * 60 * 60 * 24 * 30));

      if (mesesBateria >= config.revisionBateria.meses) {
        recomendaciones.push({
          tipo: 'revisionBateria',
          urgencia: 'normal',
          titulo: config.revisionBateria.titulo,
          mensaje: config.revisionBateria.mensaje,
          proximoEn: {
            meses: Math.max(0, config.revisionBateria.meses - mesesBateria)
          }
        });
      }
    }
  }

  // Verificar revisión de llantas
  if (vehiculo.ultimaRevisionLlantas) {
    const diasDesdeRevision = Math.floor((ahora - new Date(vehiculo.ultimaRevisionLlantas)) / (1000 * 60 * 60 * 24));

    if (tipoUso === 'diario') {
      if (diasDesdeRevision >= 14) { // 2 semanas
        recomendaciones.push({
          tipo: 'revisionLlantas',
          urgencia: diasDesdeRevision > 30 ? 'importante' : 'normal',
          titulo: config.revisionLlantas.titulo,
          mensaje: config.revisionLlantas.mensaje,
          proximoEn: {
            dias: Math.max(0, 14 - (diasDesdeRevision % 14))
          }
        });
      }
    } else if (tipoUso === 'ocasional') {
      if (diasDesdeRevision >= 30) {
        recomendaciones.push({
          tipo: 'revisionLlantas',
          urgencia: 'normal',
          titulo: config.revisionLlantas.titulo,
          mensaje: config.revisionLlantas.mensaje,
          proximoEn: {
            dias: Math.max(0, 30 - (diasDesdeRevision % 30))
          }
        });
      }
    }
  }

  return recomendaciones;
};

/**
 * Crear notificación de mantenimiento
 */
const crearNotificacionMantenimiento = async (usuarioId, recomendacion, vehiculo) => {
  try {
    const Notificacion = require('../models/notificacion');
    
    // Verificar si ya existe notificación similar reciente
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    
    console.log(`📧 Buscando notificación existente para ${recomendacion.tipo} (usuario: ${usuarioId}, vehículo: ${vehiculo._id})`);
    
    const existe = await Notificacion.findOne({
      usuario_id: usuarioId,
      tipo: 'mantenimiento',
      referencia_id: vehiculo._id,
      titulo: { $regex: recomendacion.tipo, $options: 'i' },
      fecha_creacion: { $gte: hace7Dias }
    });

    if (!existe) {
      let mensaje = recomendacion.mensaje;
      
      if (recomendacion.proximoEn) {
        if (recomendacion.proximoEn.km && recomendacion.proximoEn.km > 0) {
          mensaje += ` (Aproximadamente en ${recomendacion.proximoEn.km} km)`;
        } else if (recomendacion.proximoEn.meses && recomendacion.proximoEn.meses > 0) {
          mensaje += ` (Aproximadamente en ${recomendacion.proximoEn.meses} meses)`;
        } else if (recomendacion.proximoEn.dias && recomendacion.proximoEn.dias > 0) {
          mensaje += ` (Próxima revisión en ${recomendacion.proximoEn.dias} días)`;
        }
      }

      const notifCreada = await Notificacion.crear(
        usuarioId,
        `${recomendacion.titulo} - ${vehiculo.placa}`,
        mensaje,
        'mantenimiento',
        vehiculo._id
      );
      
      console.log(`✅ Notificación creada exitosamente: ${notifCreada._id}`);
      return true;
    } else {
      console.log(`⏭️ Notificación ya existe (creada hace menos de 7 días)`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error creando notificación de mantenimiento:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
};

module.exports = {
  RECOMENDACIONES,
  obtenerRecomendacionesPendientes,
  crearNotificacionMantenimiento
};
