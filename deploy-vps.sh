#!/bin/bash

# Script de Deploy para VPS - Cobra 2.0
# Uso: ./deploy-vps.sh

set -e  # Detener si hay errores

echo "🚀 Iniciando deploy en VPS..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Pull de cambios desde git
echo -e "${BLUE}📥 Descargando cambios desde git...${NC}"
git pull origin main

# 2. Instalar dependencias (solo si package.json cambió)
if git diff HEAD@{1} HEAD --name-only | grep -q "package.json\|pnpm-lock.yaml"; then
    echo -e "${BLUE}📦 Instalando dependencias...${NC}"
    npm install
fi

# 3. Build del proyecto
echo -e "${BLUE}🔨 Construyendo proyecto...${NC}"
npm run build

# 4. Reiniciar aplicación
echo -e "${BLUE}🔄 Reiniciando aplicación...${NC}"

# Detectar si usa PM2 o systemd
if command -v pm2 &> /dev/null; then
    echo "Usando PM2..."
    pm2 restart cobra-bar || pm2 start npm --name "cobra-bar" -- start
    pm2 save
elif systemctl is-active --quiet cobra-bar; then
    echo "Usando systemd..."
    sudo systemctl restart cobra-bar
else
    echo "⚠️  No se detectó PM2 ni systemd. Reinicia manualmente con: npm start"
fi

echo -e "${GREEN}✅ Deploy completado exitosamente!${NC}"
echo ""
echo "📊 Estado de la aplicación:"
if command -v pm2 &> /dev/null; then
    pm2 status
fi
