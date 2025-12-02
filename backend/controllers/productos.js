// backend/controllers/producto.js
import mongoose from "mongoose";
import Producto from "../models/producto.js";
import cloudinary from "../config/Cloudinary.js"; 

// =====================
// Crear producto
// =====================
export const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion = '', precio, inventario } = req.body;

    if (!nombre || precio === undefined || inventario === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, precio, inventario)' });
    }

    const precioNum = parseFloat(precio);
    const inventarioNum = parseInt(inventario, 10);

    if (isNaN(precioNum) || isNaN(inventarioNum)) {
      return res.status(400).json({ error: 'Precio e inventario deben ser números válidos' });
    }

    let imagenURL = null;
    if (req.file) {
      // Subir imagen a Cloudinary en carpeta "productos"
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "productos" });
      imagenURL = result.secure_url;
    }

    const nuevoProducto = new Producto({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: precioNum,
      inventario: inventarioNum,
      imagenURL,
      vendedorId: req.userId
    });

    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);

  } catch (error) {
    console.error(' Error al guardar el producto:', error);
    res.status(500).json({ error: 'Error al guardar el producto' });
  }
};

// =====================
// Obtener todos los productos
// =====================
export const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find().sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    console.error(' Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// =====================
// Obtener producto por ID
// =====================
export const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const producto = await Producto.findById(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(producto);
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// =====================
// Actualizar producto
// =====================
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion = '', precio, inventario } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const producto = await Producto.findById(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    // Validar que el producto pertenece al usuario
    if (producto.vendedorId && producto.vendedorId.toString() !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para actualizar este producto' });
    }

    if (nombre && nombre.trim()) producto.nombre = nombre.trim();
    if (descripcion !== undefined) producto.descripcion = descripcion.trim();

    if (precio !== undefined && precio !== '') {
      const precioNum = parseFloat(precio);
      if (isNaN(precioNum) || precioNum <= 0) return res.status(400).json({ error: 'Precio debe ser un número positivo' });
      producto.precio = precioNum;
    }

    if (inventario !== undefined && inventario !== '') {
      const inventarioNum = parseInt(inventario, 10);
      if (isNaN(inventarioNum) || inventarioNum < 0) return res.status(400).json({ error: 'Inventario debe ser un número no negativo' });
      producto.inventario = inventarioNum;
    }

    // Subir nueva imagen a Cloudinary si hay archivo
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "productos" });
      producto.imagenURL = result.secure_url;
    }

    const productoActualizado = await producto.save();
    res.json(productoActualizado);

  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(500).json({ error: error.message || 'Error al actualizar el producto' });
  }
};

// =====================
// Eliminar producto
// =====================
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'ID inválido' });

    const productoEliminado = await Producto.findByIdAndDelete(id);
    if (!productoEliminado) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(' Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
