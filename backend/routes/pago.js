const express = require("express");
const router = express.Router();
const pagoController = require("../controllers/pagoController");
const verifyToken = require("../middleware/verifyToken");

// 📌 Validar stock (antes de crear pago)
router.post("/validar-stock", verifyToken, pagoController.validarStockEndpoint);

// 📌 Consultar stock de un producto
router.get("/stock/:productoId", pagoController.obtenerStock);

// 📌 Crear pago (antes de abrir Wompi Checkout)
router.post("/crear", verifyToken, pagoController.crearPago);

// 📌 Procesar pagos directos
router.post("/procesar-tarjeta", pagoController.procesarPagoTarjeta);
router.post("/procesar-nequi", pagoController.procesarPagoNequi);
router.post("/procesar-pse", pagoController.procesarPagoPSE);

// 📌 Webhook de Wompi (sin autenticación)
router.post("/webhook", pagoController.webhookWompi);

// 📌 Consultar estado de pago
router.get("/estado/:reference", pagoController.obtenerEstadoPago);

module.exports = router;
