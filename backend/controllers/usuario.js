// controllers/usuario.js
const Usuario = require("../models/usuario");
const cloudinary = require("./config/cloudinary"); // tu configuración de Cloudinary
const fs = require("fs");

// =====================
// Obtener perfil
// =====================
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.userId).select(
      "nombre correo rol imagen descripcion telefono zona especialidad disponible activo direccion ubicacion horario"
    );

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(usuario);
  } catch (error) {
    console.error("[usuario.obtenerPerfil] Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// =====================
// Actualizar perfil
// =====================
const actualizarPerfil = async (req, res) => {
  try {
    console.log('[usuario.actualizarPerfil] req.body:', req.body);
    if (req.file) console.log('[usuario.actualizarPerfil] req.file:', { originalname: req.file.originalname, filename: req.file.filename });

    const { nombre, correo, password, descripcion, telefono, zona, ubicacion, horario } = req.body;

    const actualizaciones = {};
    if (nombre !== undefined) actualizaciones.nombre = nombre;
    if (correo !== undefined) actualizaciones.correo = correo;
    if (descripcion !== undefined) actualizaciones.descripcion = descripcion;
    if (telefono !== undefined) actualizaciones.telefono = telefono;
    if (zona !== undefined) actualizaciones.zona = zona;
    if (horario !== undefined) actualizaciones.horario = horario;

    // Ubicación
    if (ubicacion && typeof ubicacion === 'object') {
      const lat = parseFloat(ubicacion.lat);
      const lng = parseFloat(ubicacion.lng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        actualizaciones.ubicacion = { lat, lng };
      }
    }

    if (password) actualizaciones.password = password;

    // Subir imagen a Cloudinary si se envía
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "perfil_clientes",           // carpeta en Cloudinary
        public_id: `${req.userId}_perfil`,   // nombre único
        overwrite: true,
      });
      actualizaciones.imagen = result.secure_url;

      // Opcional: eliminar archivo local temporal
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error eliminando archivo temporal:", err);
      });
    }

    console.log('[usuario.actualizarPerfil] actualizaciones a aplicar:', actualizaciones);

    const usuarioDoc = await Usuario.findById(req.userId);
    if (!usuarioDoc) return res.status(404).json({ error: 'Usuario no encontrado' });

    Object.keys(actualizaciones).forEach((key) => {
      if (key === 'telefono') {
        usuarioDoc.telefono = actualizaciones.telefono !== undefined && actualizaciones.telefono !== null
          ? String(actualizaciones.telefono).trim()
          : '';
      } else {
        usuarioDoc[key] = actualizaciones[key];
      }
    });

    await usuarioDoc.save();

    const usuario = await Usuario.findById(req.userId).select(
      "nombre correo rol imagen descripcion telefono zona especialidad disponible activo direccion ubicacion horario"
    );

    res.json({ ok: true, usuario, recibido: req.body, actualizaciones });
  } catch (error) {
    console.error("[usuario.actualizarPerfil] Error:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// =====================
// Obtener todos los usuarios
// =====================
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select(
      "nombre correo rol imagen descripcion telefono zona especialidad disponible activo direccion ubicacion horario"
    );

    res.json(usuarios);
  } catch (error) {
    console.error("Error en obtenerUsuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  obtenerUsuarios
};
