const axios = require("axios");
const Pago = require("../models/pago");
const Usuario = require("../models/usuario");
const Producto = require("../models/producto");

const WOMPI_API = "https://sandbox.wompi.co/v1";
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;

// 📌 Validar stock disponible
async function validarStock(items) {
  const erroresStock = [];

  for (const item of items) {
    try {
      const producto = await Producto.findById(item.productoId);

      if (!producto) {
        erroresStock.push({
          nombre: item.nombre,
          error: "Producto no encontrado"
        });
        continue;
      }

      if (producto.inventario < item.cantidad) {
        erroresStock.push({
          nombre: producto.nombre,
          stockDisponible: producto.inventario,
          cantidadSolicitada: item.cantidad,
          error: `Stock insuficiente. Disponible: ${producto.inventario}, Solicitado: ${item.cantidad}`
        });
      }
    } catch (error) {
      erroresStock.push({
        nombre: item.nombre,
        error: error.message
      });
    }
  }

  return erroresStock;
}

// 📌 Actualizar stock después de compra exitosa
async function actualizarStock(items) {
  try {
    for (const item of items) {
      await Producto.findByIdAndUpdate(
        item.productoId,
        { $inc: { inventario: -item.cantidad } },
        { new: true }
      );
    }
    return true;
  } catch (error) {
    console.error("❌ Error actualizando stock:", error);
    return false;
  }
}

// 📌 Validar stock (endpoint público)
exports.validarStockEndpoint = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ msg: "Items requeridos" });
    }

    const erroresStock = await validarStock(items);

    if (erroresStock.length > 0) {
      return res.status(400).json({
        msg: "Stock insuficiente para algunos productos",
        errores: erroresStock
      });
    }

    res.json({
      success: true,
      msg: "Stock validado correctamente"
    });
  } catch (error) {
    console.error("❌ Error en validarStockEndpoint:", error);
    res.status(500).json({ msg: "Error validando stock", error: error.message });
  }
};

// 📌 Crear transacción de pago (para Checkout)
exports.crearPago = async (req, res) => {
  try {
    const { amount, reference, description, tipoPago, items, metodoPago } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Token requerido" });
    }

    // Decodificar usuario del token
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // 🔍 VALIDAR STOCK
    if (items && items.length > 0) {
      const erroresStock = await validarStock(items);
      
      if (erroresStock.length > 0) {
        return res.status(400).json({
          msg: "Stock insuficiente para algunos productos",
          errores: erroresStock
        });
      }
    }

    // Crear registro de pago en BD
    const pago = new Pago({
      transactionId: `TXN_${Date.now()}`,
      reference: reference || `PAGO_${Date.now()}`,
      amountInCents: amount,
      usuarioId: usuario._id,
      correoUsuario: usuario.correo,
      tipoPago,
      metodoPago: metodoPago || "CARD",
      descripcion: description || "Compra en Mecashop",
      items: items || []
    });

    await pago.save();

    res.json({
      success: true,
      pago: {
        id: pago._id,
        reference: pago.reference,
        amountInCents: pago.amountInCents,
        publicKey: process.env.WOMPI_PUBLIC_KEY,
        redirectUrl: process.env.WOMPI_REDIRECT_URL
      }
    });
  } catch (error) {
    console.error("❌ Error en crearPago:", error);
    res.status(500).json({ msg: "Error creando pago", error: error.message });
  }
};

// 📌 Procesar pago con token (para Tarjeta)
exports.procesarPagoTarjeta = async (req, res) => {
  try {
    const { token, email, amount, reference, description, tipoPago } = req.body;

    const response = await axios.post(
      `${WOMPI_API}/transactions`,
      {
        amount_in_cents: amount,
        currency: "COP",
        customer_email: email,
        reference,
        payment_method: {
          type: "CARD",
          token
        },
        description
      },
      {
        headers: {
          Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const transactionData = response.data.data;

    // Actualizar pago en BD
    await Pago.findOneAndUpdate(
      { reference },
      {
        transactionId: transactionData.id,
        estado: transactionData.status,
        responseWompi: transactionData,
        fechaPago: new Date()
      }
    );

    res.json({ success: true, transaction: transactionData });
  } catch (error) {
    console.error("❌ Error en procesarPagoTarjeta:", error.response?.data || error.message);
    res.status(500).json({ 
      msg: "Error procesando pago", 
      error: error.response?.data || error.message 
    });
  }
};

// 📌 Procesar pago Nequi
exports.procesarPagoNequi = async (req, res) => {
  try {
    const { phone, email, amount, reference, description } = req.body;

    const response = await axios.post(
      `${WOMPI_API}/transactions`,
      {
        amount_in_cents: amount,
        currency: "COP",
        customer_email: email,
        reference,
        payment_method: {
          type: "NEQUI",
          phone_number: phone,
          user_type: "PERSON"
        },
        description
      },
      {
        headers: {
          Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const transactionData = response.data.data;

    await Pago.findOneAndUpdate(
      { reference },
      {
        transactionId: transactionData.id,
        estado: transactionData.status,
        metodoPago: "NEQUI",
        responseWompi: transactionData,
        fechaPago: new Date()
      }
    );

    res.json({ success: true, transaction: transactionData });
  } catch (error) {
    console.error("❌ Error en procesarPagoNequi:", error.response?.data || error.message);
    res.status(500).json({ 
      msg: "Error procesando pago Nequi", 
      error: error.response?.data || error.message 
    });
  }
};

// 📌 Procesar pago PSE
exports.procesarPagoPSE = async (req, res) => {
  try {
    const { email, amount, reference, description, document, name } = req.body;

    const response = await axios.post(
      `${WOMPI_API}/transactions`,
      {
        amount_in_cents: amount,
        currency: "COP",
        customer_email: email,
        reference,
        payment_method: {
          type: "PSE",
          user_type: "PERSON",
          user_legal_id_type: "CC",
          user_legal_id: document,
          user_legal_name: name
        },
        description
      },
      {
        headers: {
          Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const transactionData = response.data.data;

    await Pago.findOneAndUpdate(
      { reference },
      {
        transactionId: transactionData.id,
        estado: transactionData.status,
        metodoPago: "PSE",
        responseWompi: transactionData,
        fechaPago: new Date()
      }
    );

    res.json({ success: true, transaction: transactionData });
  } catch (error) {
    console.error("❌ Error en procesarPagoPSE:", error.response?.data || error.message);
    res.status(500).json({ 
      msg: "Error procesando pago PSE", 
      error: error.response?.data || error.message 
    });
  }
};

// 📌 Webhook de Wompi
exports.webhookWompi = async (req, res) => {
  try {
    console.log("🔔 Webhook recibido de Wompi:", JSON.stringify(req.body, null, 2));

    const event = req.body;

    if (event.event !== "transaction.updated") {
      return res.sendStatus(200);
    }

    const transactionData = event.data.transaction;
    const reference = transactionData.reference;

    // Actualizar pago en BD
    const pago = await Pago.findOneAndUpdate(
      { reference },
      {
        transactionId: transactionData.id,
        estado: transactionData.status,
        responseWompi: transactionData,
        procesado: transactionData.status === "APPROVED",
        fechaPago: new Date()
      },
      { new: true }
    );

    if (!pago) {
      console.warn("⚠️ Pago no encontrado para reference:", reference);
      return res.sendStatus(200);
    }

    // 🎯 SI EL PAGO FUE APROBADO, ACTUALIZAR STOCK
    if (transactionData.status === "APPROVED" && pago.items.length > 0) {
      console.log("✅ Pago aprobado, actualizando stock...");
      
      const stockActualizado = await actualizarStock(pago.items);
      
      if (stockActualizado) {
        console.log(`✅ Stock actualizado para pedido ${reference}`);
      } else {
        console.warn(`⚠️ Error actualizando stock para pedido ${reference}`);
      }
    }

    console.log(`✅ Pago ${reference} actualizado a estado: ${transactionData.status}`);

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    res.sendStatus(200); // Wompi espera 200 de todas formas
  }
};

// 📌 Obtener stock de un producto
exports.obtenerStock = async (req, res) => {
  try {
    const { productoId } = req.params;

    const producto = await Producto.findById(productoId);

    if (!producto) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res.json({
      productoId: producto._id,
      nombre: producto.nombre,
      stock: producto.inventario,
      disponible: producto.inventario > 0
    });
  } catch (error) {
    console.error("❌ Error en obtenerStock:", error);
    res.status(500).json({ msg: "Error obteniendo stock", error: error.message });
  }
};

// 📌 Obtener estado de pago
exports.obtenerEstadoPago = async (req, res) => {
  try {
    const { reference } = req.params;

    const pago = await Pago.findOne({ reference });

    if (!pago) {
      return res.status(404).json({ msg: "Pago no encontrado" });
    }

    res.json({
      reference: pago.reference,
      estado: pago.estado,
      amountInCents: pago.amountInCents,
      metodoPago: pago.metodoPago,
      procesado: pago.procesado,
      fechaPago: pago.fechaPago
    });
  } catch (error) {
    console.error("❌ Error en obtenerEstadoPago:", error);
    res.status(500).json({ msg: "Error obteniendo estado", error: error.message });
  }
};
