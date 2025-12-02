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
  console.error(" Error cargando cronJobs:", err.message);
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

// --- DEBUG TEMPORAL: inspeccionar imports de rutas antes de montarlas ---
try {
  const routeInspect = { authRoutes, routes, passwordRoutes, vehiculoRoutes, usuarioRoutes, adminRoutes, directorioRoutes, debugRoutes, pagoRoutes };
  Object.entries(routeInspect).forEach(([name, val]) => {
    try {
      const info = { type: typeof val };
      if (typeof val === 'string') {
        info.sample = val.length > 120 ? val.slice(0, 120) + '...' : val;
      } else if (val && typeof val === 'object') {
        // list up to 5 keys to avoid huge logs
        info.keys = Object.keys(val).slice(0, 5);
      } else if (typeof val === 'function') {
        info.fnName = val.name || null;
      }
      console.log('DEBUG_ROUTE:', name, JSON.stringify(info));
    } catch (inner) {
      console.log('DEBUG_ROUTE_ERROR inspecting', name, inner && inner.message);
    }
  });
} catch (err) {
  console.error('DEBUG_ROUTE_ERROR:', err && err.message);
}


// ------------------- CORS (ANTES DE TODO) -------------------
app.use(cors({
  origin: ["http://localhost:5173", "https://mecashop-k4pc.vercel.app"],
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true
}));


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
  res.send(' Backend activo y funcionando correctamente');
});


// ------------------- RUTAS DE API -------------------
// Safe mounting helper to surface which mount throws path parsing errors
const safeMount = (mountPath, routerObj, name) => {
  try {
    app.use(mountPath, routerObj);
  } catch (err) {
    console.error(`❌ Error montando ruta ${name || mountPath}:`, err && err.message ? err.message : err);
    // print a helpful hint if the error originates from path-to-regexp
    if (err && err.message && err.message.includes('Missing parameter name')) {
      console.error('🔍 Posible ruta malformada dentro del router o un string accidental como ruta.');
    }
  }
};

safeMount('/api/auth', authRoutes, 'authRoutes');
safeMount('/api', routes, 'routes (index)');
safeMount('/api/password', passwordRoutes, 'passwordRoutes');
safeMount('/api/usuario', usuarioRoutes, 'usuarioRoutes');
safeMount('/api/vehiculo', vehiculoRoutes, 'vehiculoRoutes');
safeMount('/api/admin', adminRoutes, 'adminRoutes');
safeMount('/api/directorio', directorioRoutes, 'directorioRoutes');
safeMount('/api/debug', debugRoutes, 'debugRoutes');
safeMount('/api/pagos', pagoRoutes, 'pagoRoutes');


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
    console.log(' Conectado a MongoDB');
    
    // Iniciar servicios programados (cron jobs)
    iniciarCronjobs();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(' Error conectando a MongoDB:', error.message);
    console.log(' Iniciando servidor sin conexión a MongoDB (modo degradado).');
    // In degraded mode we still start the server so PaaS (Render) sees a running process.
    app.listen(PORT, '0.0.0.0', () => {
      console.log(` Servidor corriendo en modo degradado en http://localhost:${PORT}`);
    });
  });
