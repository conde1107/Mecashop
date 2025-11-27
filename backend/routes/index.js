// backend/routes/index.js
const express = require('express');
const router = express.Router();

// ------------------- IMPORTACIÓN DE RUTAS -------------------
const authRoutes = require('./auth');
const ordenesRoutes = require('./ordenes');
const servicioRoutes = require('./servicio'); // ✅ Aquí conectaremos el CRUD real
const shopRoutes = require('./shop');
const vehiculoRoutes = require('./vehiculo');
const productosRoutes = require('./productos');
const passwordRoutes = require('./password');
const profileRoutes = require('./profile');
const documentoRoutes = require('./documentovehiculo'); // ✅ Documentos
const solicitudRoutes = require('./solicitud');
const mecanicoRoutes = require('./mecanico');
const tiendaRoutes = require('./tienda');
const adminRoutes = require("./admin");
const calificacionProductoRoutes = require("./calificacionProducto");
const notificacionRoutes = require('./notificacion');
const solicitudAccesoRoutes = require('./solicitudAcceso');



 
// ------------------- ASIGNACIÓN DE RUTAS -------------------
router.use('/auth', authRoutes);
router.use('/ordenes', ordenesRoutes);
router.use('/servicios', servicioRoutes); // ⚙️ cambiado a plural y conectado correctamente
router.use('/shop', shopRoutes);
router.use('/vehiculos', vehiculoRoutes); // ✅ en plural
router.use('/productos', productosRoutes);
router.use('/password', passwordRoutes);
router.use('/profile', profileRoutes);
router.use('/documentos', documentoRoutes); // ✅ Nueva ruta agregada
router.use('/solicitudes', solicitudRoutes);
router.use('/mecanicos', mecanicoRoutes);
router.use('/tienda', tiendaRoutes);
router.use("/admin", adminRoutes);
router.use("/calificacion-producto", calificacionProductoRoutes);
router.use('/notificaciones', notificacionRoutes);
router.use('/solicitud-acceso', solicitudAccesoRoutes);
// ------------------- RUTA BASE -------------------
router.get('/', (req, res) => {
  res.json({ message: '🚀 API funcionando correctamente' });
});

module.exports = router;
