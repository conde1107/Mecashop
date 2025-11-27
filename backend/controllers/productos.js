const mongoose = require('mongoose');
const Producto = require('../models/producto');

// ✅ Crear producto
exports.crearProducto = async (req, res) => {
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

    const imagenURL = req.file ? `/uploads/productos/${req.file.filename}` : null;

    const nuevoProducto = new Producto({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: precioNum,
      inventario: inventarioNum,
      imagenURL,
      vendedorId: req.userId // ✅ Agregar ID del vendedor
    });

    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);

  } catch (error) {
    console.error('❌ Error al guardar el producto:', error);
    res.status(500).json({ error: 'Error al guardar el producto' });
  }
};

// ✅ Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find().sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ✅ Obtener un solo producto por ID (FALTABA)
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(producto);

  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// ✅ Actualizar producto
exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion = '', precio, inventario } = req.body;

    console.log('🔵 Actualizando producto:', { id, nombre, precio, inventario });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Validar que el producto pertenece al usuario (opcional pero recomendado)
    if (producto.vendedorId && producto.vendedorId.toString() !== req.userId) {
      console.log('⚠️ Usuario no autorizado. VendedorId:', producto.vendedorId, 'UserId:', req.userId);
      return res.status(403).json({ error: 'No tienes permiso para actualizar este producto' });
    }

    if (nombre && nombre.trim()) producto.nombre = nombre.trim();
    if (descripcion !== undefined) producto.descripcion = descripcion.trim();
    
    if (precio !== undefined && precio !== '') {
      const precioNum = parseFloat(precio);
      if (isNaN(precioNum) || precioNum <= 0) {
        return res.status(400).json({ error: 'Precio debe ser un número positivo' });
      }
      producto.precio = precioNum;
    }
    
    if (inventario !== undefined && inventario !== '') {
      const inventarioNum = parseInt(inventario, 10);
      if (isNaN(inventarioNum) || inventarioNum < 0) {
        return res.status(400).json({ error: 'Inventario debe ser un número no negativo' });
      }
      producto.inventario = inventarioNum;
    }

    // Si hay nueva imagen, actualizar
    if (req.file) {
      console.log('📸 Nueva imagen:', req.file.filename);
      producto.imagenURL = `/uploads/productos/${req.file.filename}`;
    }

    const productoActualizado = await producto.save();
    console.log('✅ Producto actualizado correctamente');
    res.json(productoActualizado);

  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(500).json({ error: error.message || 'Error al actualizar el producto' });
  }
};

// ✅ Eliminar producto
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const productoEliminado = await Producto.findByIdAndDelete(id);

    if (!productoEliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente' });

  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};
