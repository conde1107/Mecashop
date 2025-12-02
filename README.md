# Sistema Integral de Gestión de Servicios Automotrices

## Descripción del Proyecto

Este sistema es una plataforma integral para la gestión de usuarios, vehículos, servicios mecánicos, tiendas de repuestos y compras en línea.
Permite la interacción entre clientes, mecánicos, administradores y tiendas, ofreciendo herramientas avanzadas como registro de vehículos, gestión de mantenimiento, citas, compra de repuestos, pagos en línea y notificaciones.

El objetivo del sistema es centralizar todos los servicios automotrices en una única solución moderna, segura y escalable.

## Tecnologías Utilizadas
- **Frontend:** React, CSS, Tailwind
- **Backend:** Node.js, Express
- **Base de datos:** MongoDB
- **Otros:** Cloudinary (almacenamiento de imágenes), Vite, JWT, PayPal API

## Instrucciones de Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/conde1107/Mecashop.git
   ```
2. Instala las dependencias del backend:
   ```bash
   cd backend
   npm install
   ```
3. Instala las dependencias del frontend:
   ```bash
   cd ../
   npm install
   ```
4. Configura las variables de entorno en `.env` y `backend/.env` según los ejemplos proporcionados.

# MongoDB

MONGODB_URI=mongodb+srv://condejuan2712:eoh4ydUYXtTejvG4@cluster0.mcg5xjg.mongodb.net/tienda?retryWrites=true&w=majority&appName=Cluster0


# JWT

JWT_SECRET=conde12




# Gmail - Recuperación de contraseña

EMAIL_USER=pinzonyeiner2005@gmail.com
EMAIL_PASS=zrtdtrymlkyuflet
FRONTEND_URL=http://192.168.80.66:5173


# Wompi - Pasarela de pagos

WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_WEBHOOK_SECRET=secret_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_REDIRECT_URL=http://localhost:5173/pago-exitoso
WOMPI_ENV=sandbox

# Twilio - WhatsApp (Deshabilitado)

# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=


# Cloudinary - Imágenes

CLOUDINARY_CLOUD_NAME=dmaql185u
CLOUDINARY_API_KEY=266551636532388
CLOUDINARY_API_SECRET=7RVTKaqUhseVEuD6fk_hcOc5Vrk

5. Inicia el backend:
   ```bash
   cd backend
   npm start
   backend en servidor:https://mecashop.onrender.com
   ```
6. Inicia el frontend:
   ```bash
   cd ../
   npm run dev //localmente

sevidor:mecashop-k4pc.vercel.app
   ```

## Versión del Proyecto
- **Versión:** 1.0.0

## Integrantes
- Yeiner Jesus Burgos
- Yorjan Smith Martinez
- Juan Esteban Conde