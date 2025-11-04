#!/bin/bash

# ===================================
# Script de Configuración Inicial VPS
# Para COBRA en Hostinger
# ===================================

echo "🚀 Configurando VPS para COBRA..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Verificar que somos root
if [ "$EUID" -ne 0 ]; then 
    error "Por favor ejecuta como root (sudo su)"
fi

# 1. Actualizar sistema
log "Actualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar Node.js 20
log "Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Instalar pnpm
log "Instalando pnpm..."
npm install -g pnpm

# 4. Instalar PM2
log "Instalando PM2..."
npm install -g pm2

# 5. Instalar Git
log "Instalando Git..."
apt install -y git

# 6. Instalar Nginx
log "Instalando Nginx..."
apt install -y nginx

# 7. Instalar Certbot para SSL
log "Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

# 8. Configurar Firewall
log "Configurando Firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw --force enable

# 9. Crear directorio para la aplicación
log "Creando directorio para la aplicación..."
mkdir -p /var/www/cobra
cd /var/www/cobra

# 10. Verificar instalaciones
log "Verificando instalaciones..."
echo ""
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"
echo "pnpm: $(pnpm --version)"
echo "PM2: $(pm2 --version)"
echo "Git: $(git --version)"
echo "Nginx: $(nginx -v)"
echo ""

log "✅ VPS configurado correctamente!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 PRÓXIMOS PASOS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Clona el repositorio:"
echo "   cd /var/www/cobra"
echo "   git clone https://github.com/MateAKD/cobra.git ."
echo ""
echo "2. Crea el archivo .env.production"
echo ""
echo "3. Instala dependencias y haz build:"
echo "   pnpm install"
echo "   pnpm build"
echo ""
echo "4. Inicia con PM2:"
echo "   pm2 start pnpm --name cobra-app -- start"
echo "   pm2 startup"
echo "   pm2 save"
echo ""
echo "5. Configura Nginx (ver HOSTINGER_DEPLOY.md)"
echo ""
echo "6. Configura SSL:"
echo "   certbot --nginx -d tudominio.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

