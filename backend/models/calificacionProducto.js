const mongoose = require("mongoose");

const calificacionProductoSchema = new mongoose.Schema({
  productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  calificacion: { type: Number, min: 1, max: 5, required: true },
  comentario: { type: String, default: "" },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CalificacionProducto", calificacionProductoSchema);
