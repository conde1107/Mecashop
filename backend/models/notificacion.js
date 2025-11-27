const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['solicitud', 'cita', 'documento', 'mantenimiento', 'pedido', 'sistema'],
    default: 'sistema'
  },
  referencia_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  leida: {
    type: Boolean,
    default: false
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
});

// Métodos estáticos ANTES de crear el modelo
notificacionSchema.statics.crear = async function(usuarioId, titulo, mensaje, tipo, referenciaBD = null) {
  const notif = new this({
    usuario_id: usuarioId,
    titulo,
    mensaje,
    tipo,
    referencia_id: referenciaBD
  });
  return await notif.save();
};

notificacionSchema.statics.obtenerPorUsuario = async function(usuarioId) {
  return await this.find({ usuario_id: usuarioId }).sort({ fecha_creacion: -1 });
};

notificacionSchema.statics.obtenerNoLeidas = async function(usuarioId) {
  return await this.find({ usuario_id: usuarioId, leida: false }).sort({ fecha_creacion: -1 });
};

notificacionSchema.statics.marcarComoLeida = async function(notificacionId) {
  await this.findByIdAndUpdate(notificacionId, { leida: true });
  return true;
};

notificacionSchema.statics.marcarTodasComoLeidas = async function(usuarioId) {
  await this.updateMany({ usuario_id: usuarioId }, { leida: true });
  return true;
};

notificacionSchema.statics.eliminar = async function(notificacionId) {
  await this.findByIdAndDelete(notificacionId);
  return true;
};

notificacionSchema.statics.contarNoLeidas = async function(usuarioId) {
  const count = await this.countDocuments({ usuario_id: usuarioId, leida: false });
  return count;
};

notificacionSchema.statics.eliminarAntiguasAutomatic = async function() {
  const haceXDias = new Date();
  haceXDias.setDate(haceXDias.getDate() - 10);
  
  const resultado = await this.deleteMany({
    fecha_creacion: { $lt: haceXDias }
  });
  
  return resultado;
};

const Notificacion = mongoose.model('Notificacion', notificacionSchema);

module.exports = Notificacion;