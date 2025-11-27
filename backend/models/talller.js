import mongoose from "mongoose";

const tallerSchema = new mongoose.Schema(
  {
    propietario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    nombre: { type: String, required: true },
    direccion: String,
    servicios: [String],
    telefono: String,
    estado: { type: String, enum: ["ACTIVO", "INACTIVO"], default: "ACTIVO" },
  },
  { timestamps: true }
);

export default mongoose.model("Taller", tallerSchema);
