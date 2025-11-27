const express = require('express');
const notificacionController = require('../controllers/notificacion');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Obtener todas las notificaciones de un usuario
router.get('/usuario/:usuarioId', verifyToken, notificacionController.obtenerNotificaciones);

// Obtener notificaciones no leídas
router.get('/no-leidas/:usuarioId', verifyToken, notificacionController.obtenerNoLeidas);

// Contar notificaciones no leídas
router.get('/contar/:usuarioId', verifyToken, notificacionController.contarNoLeidas);

// Marcar como leída
router.put('/leer/:notificacionId', verifyToken, notificacionController.marcarComoLeida);

// Marcar todas como leídas
router.put('/leer-todas/:usuarioId', verifyToken, notificacionController.marcarTodasComoLeidas);

// Eliminar notificación
router.delete('/:notificacionId', verifyToken, notificacionController.eliminar);

module.exports = router;
