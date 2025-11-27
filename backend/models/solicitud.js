const mongoose = require("mongoose");

// ✅ Subesquema para los servicios seleccionados
const ServicioItemSchema = new mongoose.Schema({
  nombreServicio: { type: String, required: true },
  precio: { type: Number, required: true, default: 0 },
});

const SolicitudSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  mecanicoId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  vehiculoId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehiculo", required: true },

  // ✅ Array de servicios seleccionados
  servicios: {
    type: [ServicioItemSchema],
    required: true,
  },

  precioTotal: { type: Number, default: 0 },
  descripcion: { type: String, default: "" },
  fecha: { type: String },
  hora: { type: String },

  estado: {
    type: String,
    enum: ["pendiente", "aceptada", "rechazada", "finalizado", "cancelada"],
    default: "pendiente",
  },

  fechaCreacion: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Solicitud || mongoose.model("Solicitud", SolicitudSchema);
