//backend/ models/producto.js 
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, required: false, default: '' }, // 👈 Cambiado: opcional con default ''
  precio: { type: Number, required: true, min: 0 },
  inventario: { type: Number, required: true, min: 0 },
  imagenURL: { type: String, default: null },
  vendedorId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: false } // ✅ Agregado
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema); // 👈 Modelo llamado 'Producto'