// backend/controllers/documentoVehiculo.js
const DocumentoVehiculo = require('../models/documentovehiculo');
const Vehiculo = require('../models/vehiculo');
const { crearNotificacion } = require('../utils/notificacionUtils');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// Crear / subir documento para un vehículo
exports.subirDocumento = async (req, res) => {
  try {
    const { vehiculoId, tipo, numero, fechaEmision, fechaVencimiento } = req.body;

    if (!vehiculoId || !tipo || !fechaVencimiento) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validar que el vehículo pertenezca al usuario autenticado
    const vehiculo = await Vehiculo.findById(vehiculoId);
    if (!vehiculo) return res.status(404).json({ error: 'Vehículo no encontrado' });
    if (vehiculo.usuario.toString() !== req.userId) {
      return res.status(403).json({ error: 'No autorizado sobre este vehículo' });
    }

    const archivoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const doc = new DocumentoVehiculo({
      vehiculo: vehiculoId,
      tipo,
      numero: numero || '',
      fechaEmision: fechaEmision ? new Date(fechaEmision) : undefined,
      fechaVencimiento: new Date(fechaVencimiento),
      archivoPath
    });

    await doc.save();
    res.json({ message: 'Documento registrado', documento: doc });
  } catch (error) {
    console.error('Error subirDocumento:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Listar documentos de un vehículo (propio)
exports.listarDocumentosPorVehiculo = async (req, res) => {
  try {
    const { vehiculoId } = req.params;
    if (!vehiculoId) return res.status(400).json({ error: 'vehiculoId requerido' });

    const docs = await DocumentoVehiculo.find({ vehiculo: vehiculoId }).sort({ fechaVencimiento: 1 });
    res.json(docs);
  } catch (error) {
    console.error('Error listarDocumentosPorVehiculo:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Borrar documento
exports.eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DocumentoVehiculo.findById(id).populate('vehiculo');
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    if (doc.vehiculo.usuario.toString() !== req.userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await doc.deleteOne();
    res.json({ message: 'Documento eliminado' });
  } catch (error) {
    console.error('Error eliminarDocumento:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// FUNCION que revisa vencimientos y envía correos (la llamaremos desde un cron)
exports.revisarVencimientosYNotificar = async () => {
  try {
    const hoy = new Date();
    const tresDias = new Date();
    tresDias.setDate(hoy.getDate() + 3);

    // 1) Documentos que venzan en 3 días (>= hoy && <= tresDias) y no notificados
    const proximos = await DocumentoVehiculo.find({
      fechaVencimiento: { $gte: hoy, $lte: tresDias },
      notificadoExpiracion: false
    }).populate({ path: 'vehiculo', populate: { path: 'usuario', model: 'Usuario' } });

    for (const doc of proximos) {
      // Obtener usuario
      const Usuario = require('../models/usuario');
      const usuario = await Usuario.findById(doc.vehiculo.usuario);
      
      if (usuario) {
        // 📬 Crear notificación en el sistema
        try {
          const diasRestantes = Math.ceil((doc.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
          await crearNotificacion(
            usuario._id,
            `⚠️ ${doc.tipo} por vencer`,
            `El ${doc.tipo} de tu vehículo ${doc.vehiculo.placa} vence en ${diasRestantes} día(s). Actualiza tu documentación.`,
            'documento',
            doc._id
          );
        } catch (err) {
          console.error('Error al crear notificación de vencimiento:', err);
        }

        // 📧 También enviar correo si tiene
        if (usuario.correo) {
          const mailOptions = {
            from: `"Mecashop" <${process.env.EMAIL_USER}>`,
            to: usuario.correo,
            subject: `⚠️ Documento ${doc.tipo} por vencer en 3 días`,
            html: `<p>Hola ${usuario.nombre || ''},</p>
                   <p>El documento <b>${doc.tipo}</b> del vehículo (placa: ${doc.vehiculo.placa || 'N/A'}) vence el <b>${doc.fechaVencimiento.toLocaleDateString()}</b>.</p>
                   <p>Por favor actualiza tu documentación para evitar problemas.</p>
                   <p>-- Mecashop</p>`
          };
          try {
            await transporter.sendMail(mailOptions);
          } catch (err) {
            console.error('Error enviando correo de vencimiento:', err);
          }
        }
      }
      
      // Marcar como notificado para no repetir
      doc.notificadoExpiracion = true;
      await doc.save();
    }

    console.log(`[cron] revisados ${proximos.length} documentos proximos a vencer`);
  } catch (error) {
    console.error('Error en revisarVencimientosYNotificar:', error);
  }
};
