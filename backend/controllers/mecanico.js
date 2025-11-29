const Usuario = require('../models/usuario');
const ServicioOfrecido = require('../models/servicioOfrecido');
const Solicitud = require('../models/solicitud');
const Servicio = require('../models/servicio');
const cloudinary = require('../config/Cloudinary'); // asegúrate que la ruta esté correcta

// ==========================
// OBTENER MECÁNICOS  
// ==========================
exports.obtenerMecanicos = async (req, res) => {
  try {
    const mecanicos = await Usuario.find({ rol: 'mecanico' })
      .select('nombre correo especialidad imagen disponible telefono horario descripcion');
    if (!mecanicos.length) return res.status(200).json({ mensaje: "📭 No hay mecánicos registrados aún" });
    res.status(200).json(mecanicos);
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al obtener mecánicos', error: error.message });
  }
};

// ==========================
// ELIMINAR MECÁNICO
// ==========================
exports.eliminarMecanico = async (req, res) => {
  try {
    const mecanicoId = req.params.id;
    const mecanico = await Usuario.findById(mecanicoId);
    if (!mecanico) return res.status(404).json({ mensaje: 'Mecánico no encontrado' });

    await Usuario.findByIdAndDelete(mecanicoId);
    res.status(200).json({ mensaje: 'Mecánico eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al eliminar mecánico', error: error.message });
  }
};

// ==========================
// ACTUALIZAR FOTO DE PERFIL
// ==========================
exports.actualizarFotoPerfil = async (req, res) => {
  try {
    const mecanicoId = req.params.id;

    if (!req.file) return res.status(400).json({ mensaje: "No se subió ninguna foto" });

    // Subir a Cloudinary usando buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "mecanicos" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const mecanico = await Usuario.findByIdAndUpdate(
      mecanicoId,
      { imagen: uploadResult.secure_url },
      { new: true }
    );

    if (!mecanico) return res.status(404).json({ mensaje: "Mecánico no encontrado" });

    res.status(200).json({ mensaje: "Foto actualizada", imagen: mecanico.imagen });
  } catch (error) {
    console.error("Error en actualizarFotoPerfil:", error);
    res.status(500).json({ mensaje: "Error al actualizar la foto", error: error.message });
  }
};

// ==========================
// ACTUALIZAR DISPONIBILIDAD
// ==========================
exports.actualizarDisponibilidad = async (req, res) => {
  try {
    const mecanicoId = req.params.id;
    const userId = req.userId;
    const userRole = req.userRole;

    let { disponible } = req.body;

    if (typeof disponible !== 'boolean') {
      if (typeof disponible === 'string') disponible = disponible.toLowerCase() === 'true';
      else if (typeof disponible === 'number') disponible = disponible === 1;
    }

    if (typeof disponible !== 'boolean') return res.status(400).json({ mensaje: 'El campo "disponible" debe ser booleano.' });

    if (userRole === 'mecanico' && userId.toString() !== mecanicoId.toString()) {
      return res.status(403).json({ mensaje: 'No tienes permiso para cambiar esta disponibilidad.' });
    }

    const mecanico = await Usuario.findByIdAndUpdate(mecanicoId, { disponible }, { new: true });
    if (!mecanico) return res.status(404).json({ mensaje: 'Mecánico no encontrado' });

    res.json({ mensaje: 'Disponibilidad actualizada', disponible: mecanico.disponible });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar disponibilidad', error: error.message });
  }
};

// ==========================
// OFERTAS CRUD
// ==========================
exports.crearOferta = async (req, res) => {
  try {
    const mecanicoId = req.params.id;
    const { nombre, descripcion, precioEstimado, negociable } = req.body;

    if (req.userId.toString() !== mecanicoId.toString()) {
      return res.status(403).json({ mensaje: 'No autorizado para crear oferta para este mecánico' });
    }

    if (!nombre?.trim()) return res.status(400).json({ mensaje: 'Nombre del servicio obligatorio' });

    const oferta = new ServicioOfrecido({
      mecanicoId,
      nombre: nombre.trim(),
      descripcion: descripcion || '',
      precioEstimado: precioEstimado || 0,
      negociable: !!negociable,
    });

    await oferta.save();
    res.status(201).json({ mensaje: 'Oferta creada', oferta });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear oferta', error: error.message });
  }
};

exports.obtenerOfertas = async (req, res) => {
  try {
    const mecanicoId = req.params.id;
    const ofertas = await ServicioOfrecido.find({ mecanicoId, activo: true }).sort({ creadoEn: -1 });
    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ofertas', error: error.message });
  }
};

exports.actualizarOferta = async (req, res) => {
  try {
    const { id: mecanicoId, ofertaId } = req.params;
    if (req.userId.toString() !== mecanicoId.toString()) return res.status(403).json({ mensaje: 'No autorizado' });

    const update = req.body;
    const oferta = await ServicioOfrecido.findOneAndUpdate({ _id: ofertaId, mecanicoId }, update, { new: true });
    if (!oferta) return res.status(404).json({ mensaje: 'Oferta no encontrada' });
    res.json({ mensaje: 'Oferta actualizada', oferta });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar oferta', error: error.message });
  }
};

exports.eliminarOferta = async (req, res) => {
  try {
    const { id: mecanicoId, ofertaId } = req.params;
    if (req.userId.toString() !== mecanicoId.toString()) return res.status(403).json({ mensaje: 'No autorizado' });

    const oferta = await ServicioOfrecido.findOneAndDelete({ _id: ofertaId, mecanicoId });
    if (!oferta) return res.status(404).json({ mensaje: 'Oferta no encontrada' });
    res.json({ mensaje: 'Oferta eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar oferta', error: error.message });
  }
};

// ==========================
// CITAS E HISTORIAL
// ==========================
exports.obtenerCitas = async (req, res) => {
  try {
    const mecanicoId = req.params.id;
    const citas = await Solicitud.find({ mecanicoId })
      .populate('clienteId', 'nombre correo')
      .sort({ fechaCreacion: -1 });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener citas', error: error.message });
  }
};

exports.obtenerHistorial = async (req, res) => {
  try {
    const mecanicoId = req.params.id;
    const servicios = await Servicio.find({ mecanicoId, estado: 'completado' })
      .populate('clienteId', 'nombre correo')
      .sort({ fechaCreacion: -1 });
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener historial', error: error.message });
  }
};

// ==========================
// DATOS BANCARIOS
// ==========================
exports.obtenerBanco = async (req, res) => {
  try {
    const mecanicoId = req.params.id;
    const mecanico = await Usuario.findById(mecanicoId).select('banco');
    if (!mecanico) return res.status(404).json({ mensaje: 'Mecánico no encontrado' });
    res.json(mecanico.banco || { nombreBanco: '', tipoCuenta: '', numeroCuenta: '' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener datos bancarios', error: error.message });
  }
};

exports.actualizarBanco = async (req, res) => {
  try {
    const { id: mecanicoId } = req.params;
    if (req.userId.toString() !== mecanicoId.toString()) return res.status(403).json({ mensaje: 'No tienes permiso para actualizar estos datos bancarios.' });

    const { nombreBanco, tipoCuenta, numeroCuenta } = req.body;
    const mecanico = await Usuario.findById(mecanicoId);
    if (!mecanico) return res.status(404).json({ mensaje: 'Mecánico no encontrado' });

    mecanico.banco = { nombreBanco: nombreBanco || '', tipoCuenta: tipoCuenta || '', numeroCuenta: numeroCuenta || '' };
    await mecanico.save();

    res.json(mecanico.banco);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar datos bancarios', error: error.message });
  }
};
