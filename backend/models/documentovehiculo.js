// backend/models/documentoVehiculo.js
const mongoose = require('mongoose');

const documentoVehiculoSchema = new mongoose.Schema({
  vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo', required: true },
  tipo: { type: String, enum: ['SOAT','TECNOMECANICA','OTRO'], required: true },
  numero: { type: String, default: '' },
  fechaEmision: { type: Date },
  fechaVencimiento: { type: Date, required: true },
  archivoPath: { type: String }, // ruta en /uploads/...
  creadoEn: { type: Date, default: Date.now },
  notificadoExpiracion: { type: Boolean, default: false } // para no enviar múltiples mails
});

module.exports = mongoose.model('DocumentoVehiculo', documentoVehiculoSchema);
