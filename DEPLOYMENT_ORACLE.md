# 🚀 Guía de Deployment en Oracle Cloud (Always Free)

## 📋 Prerequisitos
- Cuenta de Oracle Cloud (gratis): https://www.oracle.com/cloud/free/
- Tu proyecto MecaShop
- Dominio (opcional, puedes usar el que ya compraste)

---

## 🎯 PASO 1: Crear cuenta en Oracle Cloud

1. Ve a https://www.oracle.com/cloud/free/
2. Haz clic en "Start for free"
3. Completa el registro (necesitas tarjeta, pero NO te cobrarán)
4. Verifica tu correo
5. Inicia sesión en Oracle Cloud Console

---

## 🖥️ PASO 2: Crear la VM (Máquina Virtual)

1. En Oracle Cloud Console, ve a **"Compute" > "Instances"**
2. Haz clic en **"Create Instance"**
3. Configura:
   - **Name**: mecashop-server
   - **Compartment**: (leave default)
   - **Availability Domain**: (leave default)
   - **Image**: **Ubuntu 22.04** (Canonical)
   - **Shape**: **VM.Standard.E2.1.Micro** (Always Free - 1GB RAM)
   - **Networking**: 
     - Create new virtual cloud network (VCN)
     - Assign public IPv4 address: ✅ YES
   - **SSH Keys**: 
     - Generate SSH key pair
     - **IMPORTANTE**: Descarga la llave privada (.key file)
     - Guárdala en un lugar seguro (la necesitarás para conectarte)

4. Haz clic en **"Create"**
5. Espera 1-2 minutos hasta que el estado sea **"Running"**
6. **Copia la IP pública** (la necesitarás)

---

## 🔓 PASO 3: Configurar Firewall (Abrir puertos)

### En Oracle Cloud Console:

1. Ve a **"Networking" > "Virtual Cloud Networks"**
2. Haz clic en tu VCN (vcn-...)
3. Haz clic en **"Security Lists"**
4. Haz clic en **"Default Security List"**
5. Haz clic en **"Add Ingress Rules"** y agrega:

**Regla 1 - HTTP:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `80`
- Description: `HTTP`

**Regla 2 - HTTPS:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `443`
- Description: `HTTPS`

**Regla 3 - Node.js Backend:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `3000`
- Description: `Node Backend`

**Regla 4 - React Frontend:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `5173`
- Description: `React Frontend`

---

## 🔌 PASO 4: Conectarse a la VM

### Opción A: Windows PowerShell (Recomendado)

```powershell
# Navega a donde guardaste la llave SSH
cd "C:\Users\tu_usuario\Downloads"

# Dale permisos (solo primera vez)
icacls .\ssh-key-*.key /inheritance:r
icacls .\ssh-key-*.key /grant:r "$($env:USERNAME):(R)"

# Conéctate (reemplaza X.X.X.X con tu IP pública)
ssh -i .\ssh-key-*.key ubuntu@X.X.X.X
```

### Opción B: PuTTY (Windows)

1. Descarga PuTTY: https://www.putty.org/
2. Descarga PuTTYgen para convertir la llave
3. Abre PuTTYgen, carga tu .key, guarda como .ppk
4. En PuTTY:
   - Host: tu_ip_publica
   - Port: 22
   - Connection > SSH > Auth: carga tu .ppk
   - Open

---

## ⚙️ PASO 5: Configurar el servidor (dentro de la VM)

Una vez conectado por SSH, ejecuta:

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v20.x
npm --version

# Instalar MongoDB
sudo apt install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar MongoDB
sudo systemctl status mongod

# Instalar Git
sudo apt install -y git

# Instalar PM2 (para mantener Node.js corriendo)
sudo npm install -g pm2

# Configurar firewall del servidor
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Backend
sudo ufw allow 5173/tcp  # Frontend
sudo ufw enable
```

---

## 📦 PASO 6: Subir tu proyecto

### Opción A: Git (Recomendado)

```bash
# En tu computadora local, sube tu proyecto a GitHub
cd "C:\Users\jesus\OneDrive\Documentos\mecashop (4)\mecashop"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu_usuario/mecashop.git
git push -u origin main

# En el servidor Oracle
cd ~
git clone https://github.com/tu_usuario/mecashop.git
cd mecashop
```

### Opción B: SCP (Subir archivos directamente)

```powershell
# En tu computadora local
cd "C:\Users\jesus\OneDrive\Documentos\mecashop (4)"
scp -i .\ssh-key-*.key -r .\mecashop ubuntu@X.X.X.X:~/
```

---

## 🚀 PASO 7: Configurar variables de entorno

```bash
# En el servidor, dentro de ~/mecashop/backend
cd ~/mecashop/backend
nano .env
```

Pega este contenido (ajusta los valores):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mecashop
JWT_SECRET=tu_jwt_secret_super_seguro_cambiar_esto
FRONTEND_URL=http://TU_IP_PUBLICA:5173
```

Guarda con `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🔧 PASO 8: Instalar dependencias y construir

```bash
# Backend
cd ~/mecashop/backend
npm install

# Frontend
cd ~/mecashop
npm install
```

---

## ▶️ PASO 9: Iniciar la aplicación con PM2

```bash
# Iniciar Backend
cd ~/mecashop/backend
pm2 start server.js --name mecashop-backend

# Iniciar Frontend (en modo dev para pruebas)
cd ~/mecashop
pm2 start npm --name mecashop-frontend -- run dev

# Ver status
pm2 status

# Ver logs en tiempo real
pm2 logs

# Guardar configuración PM2 (para que se inicie automáticamente)
pm2 save
pm2 startup
# Copia y ejecuta el comando que te muestra
```

---

## 🌐 PASO 10: Acceder a tu aplicación

- **Frontend**: http://TU_IP_PUBLICA:5173
- **Backend API**: http://TU_IP_PUBLICA:3000/api

---

## 🔒 PASO 11: Configurar dominio (Opcional)

Si quieres usar tu dominio del hosting PHP:

1. Ve al panel de tu hosting PHP
2. Busca "DNS Management" o "Gestión de DNS"
3. Agrega un registro tipo A:
   - Name: `@` (o `mecashop` para subdominio)
   - Type: `A`
   - Value: `TU_IP_PUBLICA_ORACLE`
   - TTL: 3600

4. Espera 1-24 horas para propagación DNS

---

## 📊 Comandos útiles PM2

```bash
# Ver estado de todas las apps
pm2 status

# Ver logs
pm2 logs mecashop-backend
pm2 logs mecashop-frontend

# Reiniciar
pm2 restart mecashop-backend
pm2 restart mecashop-frontend

# Detener
pm2 stop mecashop-backend
pm2 stop mecashop-frontend

# Eliminar
pm2 delete mecashop-backend
pm2 delete mecashop-frontend

# Monitor en tiempo real
pm2 monit
```

---

## 🐛 Troubleshooting

### MongoDB no inicia
```bash
sudo systemctl status mongod
sudo journalctl -u mongod --no-pager
```

### No puedo conectarme por SSH
- Verifica que descargaste la llave correcta
- Verifica que la IP pública es correcta
- Verifica el firewall de Oracle Cloud (Ingress Rules)

### No puedo acceder al puerto 3000/5173
- Verifica Security List en Oracle Cloud Console
- Verifica UFW: `sudo ufw status`
- Verifica que PM2 esté corriendo: `pm2 status`

### La app no se inicia
```bash
pm2 logs mecashop-backend --lines 50
pm2 logs mecashop-frontend --lines 50
```

---

## 🎉 ¡Listo!

Tu aplicación MecaShop está corriendo en Oracle Cloud GRATIS para siempre.

**Costo mensual: $0.00** 🎊
