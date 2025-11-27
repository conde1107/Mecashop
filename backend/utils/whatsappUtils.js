// 📱 Integración con WhatsApp (Twilio)
// Asegúrate de tener variables de entorno configuradas:
// TWILIO_ACCOUNT_SID
// TWILIO_AUTH_TOKEN
// TWILIO_PHONE_NUMBER (tu número de WhatsApp de Twilio)

const enviarNotificacionWhatsApp = async (numeroTelefono, mensaje) => {
  try {
    // Si no tienes Twilio configurado, retorna un log
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.log(`📱 [WhatsApp Simulado] Enviando a ${numeroTelefono}: ${mensaje}`);
      return { success: true, simulado: true, message: "Mensaje enviado (simulado)" };
    }

    const twilio = require("twilio");
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Normalizar número de teléfono
    let numeroFormato = numeroTelefono;
    if (!numeroFormato.startsWith("+")) {
      numeroFormato = "+57" + numeroFormato.replace(/^0+/, ""); // Colombia por defecto
    }

    const resultado = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${numeroFormato}`,
      body: mensaje,
    });

    console.log(`✅ Mensaje WhatsApp enviado: ${resultado.sid}`);
    return { success: true, messageSid: resultado.sid };
  } catch (error) {
    console.error("❌ Error al enviar WhatsApp:", error.message);
    return { success: false, error: error.message };
  }
};

// Enviar notificación de vencimiento
const enviarAlertaVencimiento = async (usuario, tipoDocumento, vehiculo, diasRestantes) => {
  try {
    if (!usuario.telefono) {
      console.warn(`⚠️ Usuario ${usuario.nombre} no tiene teléfono registrado`);
      return;
    }

    // Normalizar número de teléfono (si es necesario)
    let numeroFormato = usuario.telefono;
    if (!numeroFormato.startsWith("+")) {
      numeroFormato = "+57" + numeroFormato.replace(/^0+/, ""); // Colombia
    }

    const documento = tipoDocumento === "soat" ? "SOAT" : "Técnico-Mecánica";
    const fechaFormato = new Date(vehiculo.fechaCompraSoat || vehiculo.fechaCompraTeconomecanica).toLocaleDateString('es-CO');
    const mensaje = `Hola ${usuario.nombre.split(" ")[0]}, el ${documento} del vehículo ${vehiculo.placa} vence el ${fechaFormato}. Te recomendamos renovarlo a tiempo.`;

    return await enviarNotificacionWhatsApp(numeroFormato, mensaje);
  } catch (error) {
    console.error("Error al enviar alerta de vencimiento:", error);
    return { success: false, error: error.message };
  }
};

// Enviar mensaje personalizado
const enviarMensajeWhatsApp = async (numeroTelefono, nombre, tipoDocumento, placa, fechaVencimiento) => {
  const fecha = new Date(fechaVencimiento).toLocaleDateString('es-CO');
  const documento = tipoDocumento === "soat" ? "SOAT" : "Técnico-Mecánica";
  
  const mensaje = `Hola ${nombre}, el ${documento} del vehículo ${placa} vence el ${fecha}. Te recomendamos renovarlo a tiempo.`;
  
  return await enviarNotificacionWhatsApp(numeroTelefono, mensaje);
};

module.exports = {
  enviarNotificacionWhatsApp,
  enviarAlertaVencimiento,
  enviarMensajeWhatsApp
};
