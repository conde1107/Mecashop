const mongoose = require("mongoose");

const ServicioSchema = new mongoose.Schema({
  solicitudId: { type: mongoose.Schema.Types.ObjectId, ref: "Solicitud", required: true },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  mecanicoId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  nombreServicio: { type: String, required: true },
  descripcion: { type: String },
  estado: { type: String, enum: ["pendiente", "completado", "cancelado"], default: "pendiente" },
  informe: { type: String, default: null },
  precio: { type: Number, default: 0 },
  fecha: { type: String },
  hora: { type: String },
  diagnosticos: [
    {
      descripcion: { type: String },
      imagenes: { type: [String], default: [] },
      fecha: { type: Date, default: Date.now },
      tecnicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
    }
  ],
  calificacion: { type: Number, min: 1, max: 5 },
  comentario: { type: String },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Servicio || mongoose.model("Servicio", ServicioSchema);
