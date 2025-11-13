#!/bin/bash

# ===================================
# Script de Deploy para COBRA
# ===================================

echo "🐍 Iniciando deploy de COBRA..."

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

# Configurar Git para evitar error de permisos
log "Configurando Git..."
git config --global --add safe.directory /var/www/cobra || warn "No se pudo configurar safe.directory (puede que ya esté configurado)"

# 1. Pull últimos cambios
log "Descargando últimos cambios..."
git pull origin main || error "Error al hacer pull"

# 2. Instalar dependencias
log "Instalando dependencias..."
pnpm install || error "Error al instalar dependencias"

# 3. Build
log "Compilando aplicación..."
pnpm build || error "Error en el build"

# 4. Reiniciar PM2
log "Reiniciando aplicación..."
pm2 restart cobramenu || error "Error al reiniciar PM2"

# 5. Verificar estado
log "Verificando estado..."
pm2 status cobramenu

# 6. Mostrar logs
warn "Mostrando logs (CTRL+C para salir)..."
sleep 2
pm2 logs cobramenu --lines 20

log "🎉 Deploy completado exitosamente!"

