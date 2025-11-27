const mongoose = require('mongoose');

const ServicioOfrecidoSchema = new mongoose.Schema({
  mecanicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  nombre: { type: String, required: true },
  descripcion: { type: String, default: '' },
  precioEstimado: { type: Number, default: 0 },
  negociable: { type: Boolean, default: false },
  activo: { type: Boolean, default: true },
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ServicioOfrecido || mongoose.model('ServicioOfrecido', ServicioOfrecidoSchema);
