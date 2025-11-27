/**
 * Utilidad para crear notificaciones en el sistema
 * Se puede usar desde cualquier controlador o ruta del backend
 */

const Notificacion = require('../models/notificacion');

/**
 * Crea una notificación para un usuario específico
 * @param {number} usuarioId - ID del usuario que recibe la notificación
 * @param {string} titulo - Título de la notificación
 * @param {string} mensaje - Mensaje detallado
 * @param {string} tipo - Tipo de notificación (ej: 'cita', 'pedido', 'producto', etc)
 * @param {number} referenciaBD - ID de la entidad relacionada (opcional)
 */
async function crearNotificacion(usuarioId, titulo, mensaje, tipo, referenciaBD = null) {
  try {
    const resultado = await Notificacion.crear(usuarioId, titulo, mensaje, tipo, referenciaBD);
    console.log(`✅ Notificación creada para usuario ${usuarioId}`);
    return resultado;
  } catch (error) {
    console.error('❌ Error al crear notificación:', error);
    throw error;
  }
}

/**
 * Crea notificaciones para múltiples usuarios
 * @param {array} usuarioIds - Array de IDs de usuarios
 * @param {string} titulo - Título de la notificación
 * @param {string} mensaje - Mensaje detallado
 * @param {string} tipo - Tipo de notificación
 * @param {number} referenciaBD - ID de la entidad relacionada (opcional)
 */
async function crearNotificacionesMultiples(usuarioIds, titulo, mensaje, tipo, referenciaBD = null) {
  try {
    const promesas = usuarioIds.map(userId =>
      Notificacion.crear(userId, titulo, mensaje, tipo, referenciaBD)
    );
    await Promise.all(promesas);
    console.log(`✅ Notificaciones creadas para ${usuarioIds.length} usuarios`);
  } catch (error) {
    console.error('❌ Error al crear notificaciones múltiples:', error);
    throw error;
  }
}

module.exports = {
  crearNotificacion,
  crearNotificacionesMultiples
};
