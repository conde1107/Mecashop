// backend/routes/password.js
const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword, verifyToken } = require('../controllers/passwordController');

// Enviar correo con enlace para recuperación
router.post('/forgot-password', forgotPassword);

// Verificar si el token es válido
router.get('/verify-token/:token', verifyToken);

// Restablecer contraseña con token
router.post('/reset-password/:token', resetPassword);

module.exports = router;
