const Calificacion = require("../models/calificacionProducto");
const Producto = require("../models/producto");

exports.crearCalificacion = async (req, res) => {
  try {
    const { productoId, calificacion, comentario } = req.body;

    const nueva = new Calificacion({
      productoId,
      usuarioId: req.userId, // viene del token
      calificacion,
      comentario
    });

    await nueva.save();
    res.json({ mensaje: "Calificación enviada con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar calificación" });
  }
};

exports.obtenerCalificaciones = async (req, res) => {
  try {
    const lista = await Calificacion.find({ productoId: req.params.id }).populate(
      "usuarioId",
      "nombre"
    );

    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener calificaciones" });
  }
};

// ✅ Obtener calificaciones de los productos de una tienda
exports.obtenerCalificacionesPorTienda = async (req, res) => {
  try {
    const tiendaId = req.params.tiendaId;

    // Obtener todos los productos de la tienda
    const productos = await Producto.find({ vendedorId: tiendaId });
    const productosIds = productos.map(p => p._id);

    // Obtener todas las calificaciones de esos productos
    const calificaciones = await Calificacion.find({ productoId: { $in: productosIds } })
      .populate("usuarioId", "nombre")
      .populate("productoId", "nombre precio imagenURL")
      .sort({ fecha: -1 });

    res.json(calificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener calificaciones" });
  }
};
