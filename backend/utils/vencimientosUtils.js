// ⚠️ Utilidades para verificar vencimiento de documentos

// Calcular fecha de vencimiento (1 año después de la compra)
const calcularFechaVencimiento = (fechaCompra) => {
  if (!fechaCompra) return null;
  
  const fecha = new Date(fechaCompra);
  fecha.setFullYear(fecha.getFullYear() + 1); // Suma 1 año
  return fecha;
};

// Calcular días restantes hasta vencimiento
const calcularDiasRestantes = (fechaCompra) => {
  if (!fechaCompra) return null;
  
  const fechaVencimiento = calcularFechaVencimiento(fechaCompra);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);
  
  const diferencia = vencimiento - hoy;
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  
  return dias;
};

// Verificar si un documento está por vencer (3 días antes)
const estaProximoVencer = (fechaCompra, diasAviso = 3) => {
  const diasRestantes = calcularDiasRestantes(fechaCompra);
  if (diasRestantes === null) return false;
  return diasRestantes <= diasAviso && diasRestantes > 0;
};

// Verificar si un documento ya venció
const yaVencio = (fechaCompra) => {
  const diasRestantes = calcularDiasRestantes(fechaCompra);
  if (diasRestantes === null) return false;
  return diasRestantes <= 0;
};

// Obtener estado del documento
const obtenerEstadoDocumento = (fechaCompra, nombre = "Documento") => {
  const diasRestantes = calcularDiasRestantes(fechaCompra);
  
  if (diasRestantes === null) {
    return { estado: "sin-fecha", mensaje: `${nombre}: Sin fecha de compra`, alerta: false };
  }
  
  if (diasRestantes <= 0) {
    return { estado: "vencido", mensaje: `⛔ ${nombre} VENCIDO`, alerta: true };
  }
  
  if (diasRestantes <= 3) {
    return { estado: "critico", mensaje: `🚨 ${nombre} vence en ${diasRestantes} ${diasRestantes === 1 ? "día" : "días"}`, alerta: true };
  }
  
  if (diasRestantes <= 7) {
    return { estado: "proximo", mensaje: `⚠️ ${nombre} vence en ${diasRestantes} días`, alerta: true };
  }
  
  return { estado: "ok", mensaje: `✅ ${nombre} vence en ${diasRestantes} días`, alerta: false };
};

// Obtener estado de vencimientos de todos los vehículos del usuario
const verificarVencimientosUsuario = (vehiculos) => {
  const alertas = [];
  
  vehiculos.forEach((v) => {
    if (v.fechaCompraSoat) {
      const estado = obtenerEstadoDocumento(v.fechaCompraSoat, `SOAT ${v.placa}`);
      if (estado.alerta) {
        const fechaVencimiento = calcularFechaVencimiento(v.fechaCompraSoat);
        alertas.push({
          tipo: "soat",
          vehiculo: v.placa,
          vehiculoId: v._id,
          estado: estado.estado,
          mensaje: estado.mensaje,
          diasRestantes: calcularDiasRestantes(v.fechaCompraSoat),
          fecha: fechaVencimiento
        });
      }
    }
    
    if (v.fechaCompraTeconomecanica) {
      const estado = obtenerEstadoDocumento(v.fechaCompraTeconomecanica, `Técnico-Mecánica ${v.placa}`);
      if (estado.alerta) {
        const fechaVencimiento = calcularFechaVencimiento(v.fechaCompraTeconomecanica);
        alertas.push({
          tipo: "tecnomecanica",
          vehiculo: v.placa,
          vehiculoId: v._id,
          estado: estado.estado,
          mensaje: estado.mensaje,
          diasRestantes: calcularDiasRestantes(v.fechaCompraTeconomecanica),
          fecha: fechaVencimiento
        });
      }
    }
  });
  
  return alertas;
};

module.exports = {
  calcularDiasRestantes,
  calcularFechaVencimiento,
  estaProximoVencer,
  yaVencio,
  obtenerEstadoDocumento,
  verificarVencimientosUsuario
};
