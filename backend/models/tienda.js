import mongoose from "mongoose";

const tiendaSchema = new mongoose.Schema(
  {
    propietario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    nombre: { type: String, required: true },
    direccion: String,
    telefono: String,
    imagen: String,
    documentosLegales: [String],
    estado: {
      type: String,
      enum: ["VERIFICANDO", "APROBADA", "RECHAZADA"],
      default: "VERIFICANDO",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tienda", tiendaSchema);
