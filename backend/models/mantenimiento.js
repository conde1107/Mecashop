// backend/models/mantenimiento.js
const mongoose = require("mongoose");

const mantenimientoSchema = new mongoose.Schema({
  vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: "Vehiculo", required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  descripcion: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  kilometraje: Number,
  costo_total: Number,
  repuestos: [{ nombre: String, cantidad: Number, precio: Number }],
  mano_obra: [{ tarea: String, precio: Number }],
  calificacion: { type: Number, min: 1, max: 5 },
  comentario: String,
});

module.exports = mongoose.model("Mantenimiento", mantenimientoSchema);
