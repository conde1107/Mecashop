//backend/controller/pedido.js 

import Orden from "../models/orden.js";
import Producto from "../models/producto.js";

export const crearPedido = async (req, res) => {
  try {
    const { usuario, productos } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: "No hay productos en el pedido." });
    }

    // Calcular total
    let total = 0;
    for (const item of productos) {
      const producto = await Producto.findById(item.id);
      if (!producto) continue;
      total += producto.precio * item.cantidad;
    }

    const nuevaOrden = new Orden({
      usuario,
      productos: productos.map((item) => ({
        producto: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
      total,
    });

    await nuevaOrden.save();

    res.json({ mensaje: "Pedido creado exitosamente", orden: nuevaOrden });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ error: "Error interno al crear el pedido" });
  }
};
