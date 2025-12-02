// backend/routes/solicitudAcceso.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const Notificacion = require('../models/notificacion');

// POST: Enviar solicitud de acceso
router.post('/', async (req, res) => {
  try {
    console.log(' Solicitud de acceso recibida:', req.body);
    console.log(' Password recibido:', req.body.password);
    const { nombre, correo, telefono, password, tipoUsuario, mensaje } = req.body;

    // Validar datos
    if (!nombre || !correo || !telefono || !password || !tipoUsuario) {
      console.log('❌ Validación fallida: campos incompletos');
      console.log('Datos recibidos:', { nombre, correo, telefono, password, tipoUsuario });
      return res.status(400).json({ msg: 'Todos los campos obligatorios deben ser completados' });
    }

    // Buscar todos los usuarios con rol admin
    const admins = await Usuario.find({ rol: 'admin' });
    
    if (admins.length === 0) {
      console.log(' No se encontraron administradores en el sistema');
      return res.status(500).json({ msg: 'No hay administradores disponibles' });
    }

    // Preparar el mensaje de la notificación
    const tituloNotificacion = `Nueva Solicitud de Acceso - ${tipoUsuario.toUpperCase()}`;
    
    // Construir el mensaje línea por línea
    let mensajeNotificacion = `Nombre: ${nombre}\n`;
    mensajeNotificacion += `Correo: ${correo}\n`;
    mensajeNotificacion += `Teléfono: ${telefono}\n`;
    mensajeNotificacion += `Password: ${password}\n`;
    mensajeNotificacion += `Tipo: ${tipoUsuario}`;
    if (mensaje) {
      mensajeNotificacion += `\nMensaje: ${mensaje}`;
    }

    console.log(' Mensaje de notificación creado:');
    console.log(mensajeNotificacion);
    console.log(' Longitud del mensaje:', mensajeNotificacion.length);
    console.log(' Password en el mensaje:', mensajeNotificacion.includes(password) ? 'SÍ' : 'NO');

    // Crear notificación para cada admin
    console.log(` Creando notificaciones para ${admins.length} administrador(es)...`);
    
    for (const admin of admins) {
      const notifCreada = await Notificacion.crear(
        admin._id,
        tituloNotificacion,
        mensajeNotificacion,
        'solicitud',
        null
      );
      console.log(' Notificación guardada en DB:', notifCreada);
    }

    console.log(' Notificaciones creadas exitosamente');

    res.status(200).json({ 
      msg: 'Solicitud enviada correctamente. El administrador se pondrá en contacto contigo pronto.' 
    });

  } catch (error) {
    console.error('❌ Error al enviar solicitud:', error);
    console.error('❌ Detalles del error:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ 
      msg: 'Error al enviar la solicitud. Intenta nuevamente.',
      error: error.message 
    });
  }
});

module.exports = router;
