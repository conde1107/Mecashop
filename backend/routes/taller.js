// backend/routes/taller.js
const express = require("express");
const router = express.Router();

const tallerController = require("../controllers/taller");
const verifyToken = require("../middleware/auth");

router.get("/", verifyToken, tallerController.obtenerTalleres);
router.post("/", verifyToken, tallerController.crearTaller);
router.get("/:id", verifyToken, tallerController.obtenerTaller);
router.put("/:id", verifyToken, tallerController.actualizarTaller);
router.delete("/:id", verifyToken, tallerController.eliminarTaller);

module.exports = router;
