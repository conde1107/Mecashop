const Usuario = require("../models/usuario");

//  Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

//  Cambiar rol de un usuario
exports.cambiarRol = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { rol: req.body.rol },
      { new: true }
    );

    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ mensaje: "Rol actualizado", usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar rol" });
  }
};

//  Desactivar usuario (versión antigua, ya no la usas)
exports.desactivarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ mensaje: "Usuario desactivado", usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar usuario" });
  }
};

//  Activar / Desactivar usuario (esta es la correcta)
exports.cambiarEstado = async (req, res) => {
  try {
    const { activo } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { activo },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      mensaje: activo ? "Usuario activado" : "Usuario desactivado",
      usuario
    });

  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({ error: "Error al cambiar estado" });
  }
};

// Eliminar usuario (FALTABA — CAUSABA EL ERROR)
exports.eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

// Actualizar información de un usuario (solo admin)
exports.actualizarUsuario = async (req, res) => {
  try {
    const userId = req.params.id;

    console.log('[admin.actualizarUsuario] params.id:', userId, 'req.body:', req.body);

    // Campos permitidos a actualizar por admin
    const allowed = [
      'nombre',
      'correo',
      'telefono',
      'direccion',
      'rol',
      'especialidad',
      'activo'
    ];

    const updates = {};
    Object.keys(req.body || {}).forEach((key) => {
      if (allowed.includes(key)) updates[key] = req.body[key];
    });

    // Normalizaciones básicas
    if (updates.correo && typeof updates.correo === 'string') updates.correo = updates.correo.toLowerCase().trim();
    if (updates.nombre && typeof updates.nombre === 'string') updates.nombre = updates.nombre.trim();
    if (updates.telefono !== undefined && updates.telefono !== null) updates.telefono = String(updates.telefono).trim();
    if (updates.especialidad && typeof updates.especialidad === 'string') updates.especialidad = updates.especialidad.trim().toLowerCase();

    // Si correo cambia, verificar unicidad
    if (updates.correo) {
      const existente = await Usuario.findOne({ correo: updates.correo, _id: { $ne: userId } });
      if (existente) return res.status(400).json({ error: 'El correo ya está en uso por otro usuario' });
    }

    // Usar findById y save para respetar hooks y retornos
    const usuario = await Usuario.findById(userId);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    Object.keys(updates).forEach((k) => {
      usuario[k] = updates[k];
    });

    await usuario.save();

    res.json({ mensaje: 'Usuario actualizado', usuario });
  } catch (error) {
    console.error('[admin.actualizarUsuario] Error:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};
