const mongoose = require("mongoose");

const pagoSchema = new mongoose.Schema({
  // Información de la transacción
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  reference: {
    type: String,
    required: true
  },
  
  // Monto
  amountInCents: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "COP"
  },

  // Usuario
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  correoUsuario: String,

  // Tipo de pago
  tipoPago: {
    type: String,
    enum: ["carrito", "servicio", "cita", "otro"],
    required: true
  },

  // Método de pago
  metodoPago: {
    type: String,
    enum: ["NEQUI", "PSE", "CARD", "DAVIPLATA", "BANCOLOMBIA_PAY"],
    required: true
  },

  // Estado de la transacción
  estado: {
    type: String,
    enum: ["APPROVED", "DECLINED", "PENDING", "VOIDED"],
    default: "PENDING"
  },

  // Detalles de la transacción
  descripcion: String,
  
  // Ítems comprados
  items: [
    {
      productoId: mongoose.Schema.Types.ObjectId,
      nombre: String,
      cantidad: Number,
      precio: Number
    }
  ],

  // Información de respuesta de Wompi
  responseWompi: {
    type: Object,
    default: null
  },

  // Fecha
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaPago: Date,

  // Control
  procesado: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Pago", pagoSchema);
