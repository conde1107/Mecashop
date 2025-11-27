const Notificacion = require('../models/notificacion');

// Obtener todas las notificaciones de un usuario
exports.obtenerNotificaciones = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const notificaciones = await Notificacion.obtenerPorUsuario(usuarioId);
    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

// Obtener notificaciones no leídas
exports.obtenerNoLeidas = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const notificaciones = await Notificacion.obtenerNoLeidas(usuarioId);
    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones no leídas' });
  }
};

// Contar notificaciones no leídas
exports.contarNoLeidas = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const count = await Notificacion.contarNoLeidas(usuarioId);
    res.json({ count });
  } catch (error) {
    console.error('Error al contar notificaciones no leídas:', error);
    res.status(500).json({ error: 'Error al contar notificaciones no leídas' });
  }
};

// Marcar como leída
exports.marcarComoLeida = async (req, res) => {
  try {
    const notificacionId = req.params.notificacionId;
    await Notificacion.marcarComoLeida(notificacionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar como leída:', error);
    res.status(500).json({ error: 'Error al marcar como leída' });
  }
};

// Marcar todas como leídas
exports.marcarTodasComoLeidas = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    await Notificacion.marcarTodasComoLeidas(usuarioId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    res.status(500).json({ error: 'Error al marcar todas como leídas' });
  }
};

// Eliminar notificación
exports.eliminar = async (req, res) => {
  try {
    const notificacionId = req.params.notificacionId;
    await Notificacion.eliminar(notificacionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
};