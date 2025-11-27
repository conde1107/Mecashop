// backend/routes/pedido.js
const express = require("express");
const router = express.Router();

const { crearPedido } = require("../controllers/pedido");

router.post("/", crearPedido);

module.exports = router;
