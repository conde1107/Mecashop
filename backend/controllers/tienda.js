// backend/controller/tienda.js
import Tienda from "../models/tienda.js";
import Usuario from "../models/usuario.js";
import cloudinary from '../config/Cloudinary.js';


// RF-004: Registro de tienda y documentos legales
export const registrarTienda = async (req, res) => {
  try {
    const propietario = req.userId;
    const { nombre, direccion, telefono } = req.body;
    const documentos = req.files?.map((f) => f.filename) || [];

    const nuevaTienda = new Tienda({
      propietario,
      nombre,
      direccion,
      telefono,
      documentosLegales: documentos,
    });

    await nuevaTienda.save();
    res.status(201).json({
      message: "Tienda registrada exitosamente",
      tienda: nuevaTienda,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar la tienda" });
  }
};

// Obtener tienda por ID
export const obtenerTienda = async (req, res) => {
  try {
    const { tiendaId } = req.params;
    const usuario = await Usuario.findById(tiendaId).select('nombre descripcion telefono correo imagen zona');
    if (!usuario) return res.status(404).json({ error: "Tienda no encontrada" });
    res.json({ usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tienda" });
  }
};

// Actualizar tienda
export const actualizarTienda = async (req, res) => {
  try {
    const { tiendaId } = req.params;
    const { nombre, descripcion, telefono, email, ubicacion, direccion } = req.body;

    const zonaFinal = direccion || ubicacion || '';

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      tiendaId,
      { 
        nombre: nombre || undefined, 
        descripcion: descripcion || undefined, 
        telefono: telefono || undefined, 
        correo: email || undefined,
        zona: zonaFinal
      },
      { new: true }
    ).select('nombre descripcion telefono correo imagen zona');

    if (!usuarioActualizado) return res.status(404).json({ error: "Tienda no encontrada" });

    res.json({ usuario: usuarioActualizado });
  } catch (error) {
    console.error('Error al actualizar tienda:', error);
    res.status(500).json({ error: "Error al actualizar tienda", detalle: error.message });
  }
};

// Actualizar foto de tienda en Cloudinary
export const actualizarFotoTienda = async (req, res) => {
  try {
    const { tiendaId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No se subió ninguna foto" });
    }

    // Subir imagen a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "tiendas",
      use_filename: true,
      unique_filename: false,
    });

    // Guardar URL de Cloudinary en la BD
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      tiendaId,
      { imagen: result.secure_url },
      { new: true }
    );

    if (!usuarioActualizado) return res.status(404).json({ error: "Tienda no encontrada" });

    res.json({ 
      mensaje: "Foto actualizada", 
      imagen: usuarioActualizado.imagen 
    });
  } catch (error) {
    console.error("Error al actualizar foto:", error);
    res.status(500).json({ error: "Error al actualizar la foto" });
  }
};
