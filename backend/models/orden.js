//backend/models/orden.js
import mongoose from "mongoose";

const ordenSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  productos: [
    {
      producto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
      cantidad: { type: Number, required: true, min: 1 },
      precio: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  estado: { type: String, default: "pendiente" },
  fecha: { type: Date, default: Date.now },
});

export default mongoose.model("Orden", ordenSchema);
 