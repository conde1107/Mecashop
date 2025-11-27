require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

let iniciarCronjobs = () => {}; // Default empty function
try {
  iniciarCronjobs = require('./utils/cronJobs').iniciarCronjobs;
} catch (err) {
  console.error("⚠️ Error cargando cronJobs:", err.message);
}

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// ------------------- IMPORTAR RUTAS -------------------
const authRoutes = require('./routes/auth');
const routes = require('./routes');
const passwordRoutes = require('./routes/password');
const vehiculoRoutes = require('./routes/vehiculo');
const usuarioRoutes = require('./routes/usuario');
const adminRoutes = require('./routes/admin');
const directorioRoutes = require("./routes/directorio");
const debugRoutes = require('./routes/debug');
const pagoRoutes = require('./routes/pago');


// ------------------- CORS (ANTES DE TODO) -------------------
// CORS configurable: permite localhost y el FRONTEND_URL definido en entorno
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL || 'https://mecashop-k4pc.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones desde herramientas (curl, Postman) sin origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // Rechazar otros orígenes
    return callback(new Error('CORS policy: origin not allowed'), false);
  },
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
}));

// Manejar preflight requests explícitamente
app.options('*', cors());


// ------------------- BODY PARSERS -------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ------------------- HELMET (CONFIGURADO CORRECTO) -------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, 
    crossOriginEmbedderPolicy: false
  })
);


// ------------------- RATE LIMIT -------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 5000,
  max: 5000
});
app.use(limiter);


// ------------------- SERVIR IMÁGENES -------------------
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
    }
  })
);


// ------------------- LOG DE REQUEST -------------------
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


// ------------------- RUTA PRINCIPAL -------------------
app.get('/', (req, res) => {
  res.send('✅ Backend activo y funcionando correctamente');
});


// ------------------- RUTAS DE API -------------------
app.use('/api/auth', authRoutes);
app.use('/api', routes);
app.use('/api/password', passwordRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/vehiculo', vehiculoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/directorio', directorioRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/pagos', pagoRoutes);


// ------------------- MANEJO DE TOKENS -------------------
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ mensaje: "Token inválido" });
  }
  
  // Errores de multer
  if (err.name === 'MulterError') {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ error: 'Archivo muy grande (máximo 5MB)' });
    }
    return res.status(400).json({ error: err.message || 'Error al procesar la imagen' });
  }
  
  if (err.message && err.message.includes('Solo se permiten')) {
    return res.status(400).json({ error: err.message });
  }
  
  console.error('❌ Error no manejado:', err);
  next(err);
});


// ------------------- CONEXIÓN A MONGO -------------------
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    
    // Iniciar servicios programados (cron jobs)
    iniciarCronjobs();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error.message);
  });
