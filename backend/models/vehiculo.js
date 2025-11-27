const mongoose = require("mongoose");

const vehiculoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  año: { type: Number },
  kilometraje: { type: Number },
  placa: { type: String, required: true, unique: true },
  tipo: { type: String, enum: ["Carro", "Moto", "Camioneta", "Otro"], default: "Carro" },
  color: { type: String, default: "" },
  combustible: { type: String, enum: ["Gasolina", "Diesel", "Gas", "Híbrido", "Eléctrico"], default: "Gasolina" },
  tipoUso: { type: String, enum: ["diario", "ocasional"], default: "diario" },
  tipoAceite: { type: String, enum: ["mineral", "semisintético", "sintético"], default: "sintético" },
  usoEspecial: { type: String, enum: ["normal", "ciudad_trancones", "carretera"], default: "normal" },
  imagen: { type: String },
  createdAt: { type: Date, default: Date.now },
  // 📄 Campos añadidos para documentos
  soat: { type: String, default: "" },
  tecnomecanica: { type: String, default: "" },
  // 📅 Fechas de compra/pago
  fechaCompraSoat: { type: Date, default: null },
  fechaCompraTeconomecanica: { type: Date, default: null },
  // 🔧 Último mantenimiento
  ultimoCambioAceite: { type: Date, default: null },
  ultimoKmCambioAceite: { type: Number, default: 0 },
  ultimoMantenimientoPreventivo: { type: Date, default: null },
  ultimoKmMantenimientoPreventivo: { type: Number, default: 0 },
  ultimaRevisionLlantas: { type: Date, default: null },
  ultimoKmRevisionLlantas: { type: Number, default: 0 },
  ultimaRevisionFiltroAire: { type: Date, default: null },
  ultimoKmFiltroAire: { type: Number, default: 0 },
  ultimaRevisionFrenos: { type: Date, default: null },
  ultimoKmFrenos: { type: Number, default: 0 },
  ultimoCambioLiquidoFreno: { type: Date, default: null },
  ultimaRevisionBateria: { type: Date, default: null }
});

module.exports = mongoose.model("Vehiculo", vehiculoSchema);
