#!/bin/bash

# Script de instalación automática para Oracle Cloud
# Ejecutar con: bash setup-oracle.sh

echo "🚀 Iniciando configuración de MecaShop en Oracle Cloud..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 1. Actualizar sistema
print_status "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y
print_success "Sistema actualizado"

# 2. Instalar Node.js 20
print_status "Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
print_success "Node.js instalado: $(node --version)"

# 3. Instalar MongoDB
print_status "Instalando MongoDB..."
sudo apt install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
print_success "MongoDB instalado e iniciado"

# 4. Instalar Git
print_status "Instalando Git..."
sudo apt install -y git
print_success "Git instalado: $(git --version)"

# 5. Instalar PM2
print_status "Instalando PM2..."
sudo npm install -g pm2
print_success "PM2 instalado: $(pm2 --version)"

# 6. Configurar firewall
print_status "Configurando firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Backend
sudo ufw allow 5173/tcp  # Frontend
sudo ufw --force enable
print_success "Firewall configurado"

# 7. Crear directorio de logs
print_status "Creando directorio de logs..."
mkdir -p ~/mecashop/logs
print_success "Directorio de logs creado"

# 8. Verificar instalaciones
print_status "Verificando instalaciones..."
echo ""
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "MongoDB: $(mongod --version | head -n 1)"
echo "Git: $(git --version)"
echo "PM2: $(pm2 --version)"
echo ""

print_success "✅ Configuración base completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Sube tu proyecto: git clone https://github.com/tu_usuario/mecashop.git"
echo "2. Configura el .env en backend/"
echo "3. Instala dependencias: npm install (en backend y frontend)"
echo "4. Inicia con PM2: pm2 start ecosystem.config.json"
echo ""
