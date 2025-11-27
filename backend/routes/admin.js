// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Log simple de cualquier petición a /api/admin para depuración
router.use((req, res, next) => {
	console.log('[admin.route] ', req.method, req.originalUrl, 'Authorization header present:', !!req.headers.authorization);
	next();
});

// Ruta de depuración TEMPORAL: aceptar PUT sin auth para verificar conectividad
router.put('/debug/usuarios/:id', (req, res) => {
	try {
		console.log('[admin.debug] PUT debug/usuarios params.id:', req.params.id, 'body:', req.body);
		return res.json({ ok: true, paramsId: req.params.id, received: req.body });
	} catch (err) {
		console.error('[admin.debug] Error:', err);
		return res.status(500).json({ ok: false, error: err.message });
	}
});

router.get("/usuarios", verifyToken, checkRole('admin'), adminController.obtenerUsuarios);
router.put("/usuarios/:id", verifyToken, checkRole('admin'), adminController.actualizarUsuario);
router.put("/usuarios/:id/rol", verifyToken, checkRole('admin'), adminController.cambiarRol);
router.put("/usuarios/:id/estado", verifyToken, checkRole('admin'), adminController.cambiarEstado);  // ✅
router.delete("/usuarios/:id", verifyToken, checkRole('admin'), adminController.eliminarUsuario);

module.exports = router;
