const express = require("express");
const router = express.Router();
const mecanico = require("../controllers/mecanico");
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const upload = require("../middleware/upload");

// Obtener todos los mecánicos
router.get("/", mecanico.obtenerMecanicos);

// Eliminar mecánico — tienda o admin
router.delete("/:id", verifyToken, mecanico.eliminarMecanico);

// Actualizar foto de perfil de mecánico
router.put("/:id/foto", upload.single("foto"), verifyToken, checkRole('mecanico'), mecanico.actualizarFotoPerfil);

// Toggle disponibilidad — mecánico o tienda pueden cambiar disponibilidad
router.put("/:id/disponible", verifyToken, mecanico.actualizarDisponibilidad);

// Datos bancarios
router.get('/:id/banco', verifyToken, mecanico.obtenerBanco);
router.put('/:id/banco', verifyToken, mecanico.actualizarBanco);

// Ofertas de servicios (CRUD) — sólo el propio mecánico puede crear/editar
router.post('/:id/ofertas', verifyToken, checkRole('mecanico'), mecanico.crearOferta);
router.get('/:id/ofertas', mecanico.obtenerOfertas);
router.put('/:id/ofertas/:ofertaId', verifyToken, checkRole('mecanico'), mecanico.actualizarOferta);
router.delete('/:id/ofertas/:ofertaId', verifyToken, checkRole('mecanico'), mecanico.eliminarOferta);

// Citas y historial
router.get('/:id/citas', verifyToken, mecanico.obtenerCitas);
router.get('/:id/historial', verifyToken, mecanico.obtenerHistorial);

module.exports = router;
