const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  rol: {
    type: String,
    enum: ["cliente", "admin", "mecanico", "tienda"],
    required: true
  },

  descripcion: { type: String, default: "" },
  imagen: { type: String, default: "" },
  especialidad: { type: String, default: "" },
  zona: { type: String, default: "" },
  disponible: { type: Boolean, default: true },
  direccion: { type: String, default: "" },
  telefono: { type: String, default: "" },

  ubicacion: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },

  banco: {
    nombreBanco: { type: String, default: "" },
    tipoCuenta: { type: String, default: "" },
    numeroCuenta: { type: String, default: "" }
  },

  // 🔹 NUEVO: horario editable como string, ejemplo: "9:00 - 22:00"
  horario: { type: String, default: "" },

  // Horarios detallados opcionales (si quieres mantenerlos)
  horariosDisponibilidad: [{ dia: String, inicio: String, fin: String }],

  zonasCobertura: { type: [String], default: [] },
  emergenciaContacto: { type: String, default: "" },
  preciosNegociables: { type: Boolean, default: false },
  serviciosPausados: { type: [mongoose.Schema.Types.ObjectId], default: [] },

  activo: { type: Boolean, default: true },

  // 🔐 Recuperación de contraseña
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null }
});

module.exports = mongoose.model("Usuario", usuarioSchema);
