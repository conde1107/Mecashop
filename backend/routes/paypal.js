const express = require('express');
const router = express.Router();
const fetch = require('node-fetch'); // npm i node-fetch@2

// Variables de entorno
const PAYPAL_API = process.env.PAYPAL_API;
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// 🔹 Obtener token de PayPal
const generateAccessToken = async () => {
  const auth = Buffer.from(PAYPAL_CLIENT + ":" + PAYPAL_SECRET).toString("base64");
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
};

// 🔹 Crear orden
router.post("/create-order", async (req, res) => {
  const { total } = req.body; // total del carrito
  const accessToken = await generateAccessToken();

  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: total.toFixed(2) } }],
    }),
  });

  const data = await response.json();
  res.json(data);
});

// 🔹 Capturar pago
router.post("/capture-order/:orderID", async (req, res) => {
  const { orderID } = req.params;
  const accessToken = await generateAccessToken();

  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  res.json(data);
});

module.exports = router;
