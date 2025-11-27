# 🚀 Guía de Deployment: Frontend en Vercel + Backend en Render

## 💰 Costo Total: $0/mes (100% GRATIS)

---

## 📋 Prerequisitos
- Cuenta de GitHub (gratis)
- Cuenta de Vercel (gratis, sin tarjeta)
- Cuenta de Render (gratis, sin tarjeta)
- Cuenta de MongoDB Atlas (gratis, sin tarjeta)

---

## PARTE 1: 🗄️ CONFIGURAR MONGODB ATLAS (Base de Datos)

### PASO 1.1: Crear cuenta en MongoDB Atlas

1. Ve a https://www.mongodb.com/cloud/atlas/register
2. Regístrate con Google o email (NO necesita tarjeta)
3. Completa el cuestionario inicial (selecciona opciones gratuitas)

### PASO 1.2: Crear cluster gratuito

1. En el dashboard, haz clic en **"Build a Database"**
2. Selecciona **"M0 FREE"** (512MB gratis)
3. Configuración:
   - **Provider**: AWS
   - **Region**: Selecciona la más cercana (ej: Sao Paulo, Virginia)
   - **Cluster Name**: mecashop-db
4. Haz clic en **"Create"**

### PASO 1.3: Configurar acceso

1. **Security Quickstart**:
   - Username: `mecashop_admin`
   - Password: Genera uno seguro y **guárdalo**
   - Haz clic en **"Create User"**

2. **Network Access**:
   - Haz clic en **"Add IP Address"**
   - Selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Haz clic en **"Confirm"**

### PASO 1.4: Obtener Connection String

1. Ve a **"Database"** en el menú lateral
2. Haz clic en **"Connect"** en tu cluster
3. Selecciona **"Connect your application"**
4. Copia el **Connection String**:
   ```
   mongodb+srv://mecashop_admin:<password>@mecashop-db.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Reemplaza `<password>`** con tu password real
6. **Guárdalo** para después

---

## PARTE 2: 📤 SUBIR PROYECTO A GITHUB

### PASO 2.1: Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `mecashop`
3. Visibilidad: **Public** o **Private**
4. NO inicialices con README
5. Haz clic en **"Create repository"**

### PASO 2.2: Subir código desde tu PC

```powershell
# Navega a tu proyecto
cd "C:\Users\jesus\OneDrive\Documentos\mecashop (4)\mecashop"

# Inicializa Git (si no lo has hecho)
git init

# Crea .gitignore para no subir archivos innecesarios
$gitignoreContent = @"
node_modules/
.env
.DS_Store
*.log
dist/
build/
uploads/
"@
Set-Content -Path .gitignore -Value $gitignoreContent

# Agrega todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit - MecaShop project"

# Conecta con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/mecashop.git

# Sube el código
git branch -M main
git push -u origin main
```

---

## PARTE 3: 🖥️ BACKEND EN RENDER

### PASO 3.1: Crear cuenta en Render

1. Ve a https://render.com/
2. Haz clic en **"Get Started"**
3. Regístrate con **GitHub** (más fácil)
4. Autoriza Render a acceder a tus repositorios

### PASO 3.2: Crear Web Service para Backend

1. En Render Dashboard, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio **mecashop**
4. Configura:

   **Configuración Básica:**
   - **Name**: `mecashop-backend`
   - **Region**: Oregon (US West) o la más cercana
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

   **Plan:**
   - Selecciona **"Free"** (0 USD/mes)

5. Haz clic en **"Advanced"** y agrega **Environment Variables**:

   ```
   PORT=3000
   MONGODB_URI=mongodb+srv://mecashop_admin:TU_PASSWORD@mecashop-db.xxxxx.mongodb.net/mecashop?retryWrites=true&w=majority
   JWT_SECRET=cambiar_por_algo_super_seguro_y_aleatorio_12345
   NODE_ENV=production
   ```

6. Haz clic en **"Create Web Service"**
7. Espera 3-5 minutos mientras Render despliega tu backend
8. **Copia la URL** que te da (ej: `https://mecashop-backend.onrender.com`)

---

## PARTE 4: 🌐 FRONTEND EN VERCEL

### PASO 4.1: Crear cuenta en Vercel

1. Ve a https://vercel.com/signup
2. Regístrate con **GitHub** (más fácil)
3. Autoriza Vercel a acceder a tus repositorios

### PASO 4.2: Configurar variables de entorno en el código

Antes de desplegar, actualiza la URL del backend en tu código:

```powershell
# En tu proyecto local
cd "C:\Users\jesus\OneDrive\Documentos\mecashop (4)\mecashop"
```

Edita estos archivos para usar variable de entorno:

**Crea `src/config.js`:**
```javascript
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
```

**Actualiza todos los archivos que usan la API** (busca `http://localhost:3000`):
```javascript
// Reemplaza:
const API_BASE = "http://localhost:3000/api";

// Por:
import { API_BASE } from './config';
```

Guarda los cambios y súbelos a GitHub:
```powershell
git add .
git commit -m "Add environment variable support"
git push origin main
```

### PASO 4.3: Desplegar en Vercel

1. En Vercel Dashboard, haz clic en **"Add New..."**
2. Selecciona **"Project"**
3. Importa tu repositorio **mecashop**
4. Configura:

   **Framework Preset**: Vite
   **Root Directory**: `./` (raíz del proyecto)
   **Build Command**: `npm run build`
   **Output Directory**: `dist`

5. Haz clic en **"Environment Variables"** y agrega:

   ```
   VITE_API_BASE=https://mecashop-backend.onrender.com/api
   ```

   (Usa la URL que copiaste de Render)

6. Haz clic en **"Deploy"**
7. Espera 2-3 minutos
8. **Copia la URL** de tu frontend (ej: `https://mecashop-xxxx.vercel.app`)

---

## PARTE 5: 🔗 CONFIGURAR CORS EN EL BACKEND

Necesitas permitir que tu frontend en Vercel acceda al backend en Render.

### PASO 5.1: Actualizar CORS en el backend

En tu proyecto local, edita `backend/server.js`:

```javascript
// Encuentra esta línea:
app.use(cors({
  origin: "*",
  // ...
}));

// Cámbiala por:
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));
```

### PASO 5.2: Agregar variable FRONTEND_URL en Render

1. Ve a tu servicio backend en Render
2. Ve a **"Environment"** en el menú lateral
3. Agrega una nueva variable:
   ```
   FRONTEND_URL=https://mecashop-xxxx.vercel.app
   ```
   (Usa la URL de tu frontend en Vercel)
4. Haz clic en **"Save Changes"**
5. El servicio se reiniciará automáticamente

### PASO 5.3: Subir cambios a GitHub

```powershell
git add .
git commit -m "Update CORS configuration for production"
git push origin main
```

Render detectará los cambios y redesplegará automáticamente.

---

## ✅ VERIFICACIÓN

### Probar el Backend:
Visita: `https://mecashop-backend.onrender.com/api`
Deberías ver algo como `{"message": "API running"}`

### Probar el Frontend:
Visita: `https://mecashop-xxxx.vercel.app`
Deberías ver tu aplicación funcionando.

---

## 🔄 DESPLIEGUE AUTOMÁTICO

Ahora cada vez que hagas push a GitHub:
- ✅ Vercel redesplegará el frontend automáticamente
- ✅ Render redesplegará el backend automáticamente

```powershell
# Hacer cambios en el código
git add .
git commit -m "Mi cambio"
git push origin main

# ¡Desplegado automáticamente en 2-3 minutos!
```

---

## 🌐 CONFIGURAR TU DOMINIO (Opcional)

### En Vercel (Frontend):

1. Ve a tu proyecto en Vercel
2. Haz clic en **"Settings"** > **"Domains"**
3. Agrega tu dominio (ej: `mecashop.com`)
4. Vercel te dará instrucciones para configurar DNS
5. En tu hosting PHP, agrega un registro CNAME:
   ```
   Type: CNAME
   Name: www (o @)
   Value: cname.vercel-dns.com
   ```

### En Render (Backend):

1. Ve a tu servicio backend en Render
2. Haz clic en **"Settings"** > **"Custom Domain"**
3. Agrega un subdominio (ej: `api.mecashop.com`)
4. En tu hosting PHP, agrega un registro CNAME:
   ```
   Type: CNAME
   Name: api
   Value: mecashop-backend.onrender.com
   ```

---

## ⚠️ LIMITACIONES DEL PLAN GRATUITO

### Render Free Tier:
- ✅ 750 horas/mes (suficiente para 1 servicio 24/7)
- ⚠️ El servidor se "duerme" después de 15 minutos de inactividad
- ⚠️ Primera petición después de dormir tarda ~30 segundos
- ✅ Se despierta automáticamente con cada petición

### MongoDB Atlas Free:
- ✅ 512MB de almacenamiento
- ✅ Compartido (suficiente para proyectos pequeños)

### Vercel Free:
- ✅ Despliegues ilimitados
- ✅ Ancho de banda generoso
- ✅ SSL automático

---

## 🐛 TROUBLESHOOTING

### Backend no responde (Error 503)
- Render está "despertando" el servidor, espera 30 segundos

### Error de CORS en el frontend
- Verifica que `FRONTEND_URL` en Render tenga la URL correcta de Vercel
- Verifica que `VITE_API_BASE` en Vercel tenga la URL correcta de Render

### MongoDB connection timeout
- Verifica que el connection string en Render tenga el password correcto
- Verifica que MongoDB Atlas permita acceso desde cualquier IP (0.0.0.0/0)

### Ver logs del backend
1. Ve a tu servicio en Render
2. Haz clic en **"Logs"** en el menú lateral
3. Busca errores en tiempo real

---

## 🎉 ¡LISTO!

Tu aplicación MecaShop está corriendo en:
- **Frontend**: Vercel (GRATIS ✅)
- **Backend**: Render (GRATIS ✅)
- **Database**: MongoDB Atlas (GRATIS ✅)

**Costo mensual total: $0.00** 🎊

### URLs de ejemplo:
- Frontend: `https://mecashop-xxxx.vercel.app`
- Backend: `https://mecashop-backend.onrender.com`
