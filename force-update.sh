#!/bin/bash

# ===================================
# Script para Forzar Actualización en VPS
# ===================================

echo "🐍 Forzando actualización de cambios en VPS..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encuentra package.json. ¿Estás en el directorio correcto?"
fi

# 1. Limpiar caché de Next.js
log "Limpiando caché de Next.js..."
rm -rf .next
rm -rf node_modules/.cache
log "Caché limpiada"

# 2. Pull últimos cambios
log "Descargando últimos cambios de Git..."
git pull origin main || git pull origin master || warn "No se pudo hacer pull (puede que ya estés actualizado)"

# 3. Instalar dependencias (por si hay cambios)
log "Verificando dependencias..."
npm install --legacy-peer-deps || pnpm install || yarn install || warn "Error al instalar dependencias"

# 4. Build limpio
log "Compilando aplicación (build limpio)..."
npm run build || pnpm build || yarn build || error "Error en el build"

# 5. Limpiar caché del navegador (headers)
log "Configurando headers para evitar caché..."

# 6. Reiniciar PM2
log "Reiniciando aplicación..."
pm2 restart cobra-app || pm2 restart all || warn "PM2 no está corriendo o la app tiene otro nombre"

# 7. Verificar estado
log "Verificando estado de la aplicación..."
pm2 status

# 8. Mostrar logs
warn "Mostrando logs recientes..."
sleep 2
pm2 logs cobra-app --lines 30 --nostream || pm2 logs --lines 30 --nostream

log "🎉 Actualización forzada completada!"
warn "IMPORTANTE: Limpia la caché de tu navegador (Ctrl+Shift+R o Cmd+Shift+R)"

