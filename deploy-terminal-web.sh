#!/bin/bash

# ===================================
# Script de Deploy para Terminal Web de Hostinger
# ===================================
# 
# Copia y pega este script completo en el Terminal Web de Hostinger
# O ejecuta: bash deploy-terminal-web.sh

echo "🐍 Iniciando deploy de COBRA desde Terminal Web..."
echo ""

# Colores (si el terminal los soporta)
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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
    echo "Ejecuta primero: cd /var/www/cobra"
    exit 1
fi

log "Directorio actual: $(pwd)"
echo ""

# 1. Verificar estado de Git
log "Verificando estado de Git..."
git status --short
echo ""

# 2. Hacer pull de los últimos cambios
log "Descargando últimos cambios de GitHub..."
if git pull origin main; then
    log "Cambios descargados exitosamente"
else
    warn "Error al hacer pull. Continuando con los archivos actuales..."
fi
echo ""

# 3. Instalar dependencias
log "Instalando dependencias..."
if pnpm install; then
    log "Dependencias instaladas"
else
    error "Error al instalar dependencias"
fi
echo ""

# 4. Build
log "Compilando aplicación..."
if pnpm build; then
    log "Build completado exitosamente"
else
    error "Error en el build. Revisa los mensajes de error arriba."
fi
echo ""

# 5. Reiniciar PM2
log "Reiniciando aplicación con PM2..."
if pm2 restart cobramenu; then
    log "Aplicación reiniciada"
else
    warn "Error al reiniciar PM2. Intentando iniciar..."
    pm2 start ecosystem.config.js || pm2 start pnpm --name "cobramenu" -- start
fi
echo ""

# 6. Verificar estado
log "Verificando estado de la aplicación..."
pm2 status cobramenu
echo ""

# 7. Mostrar logs recientes
warn "Mostrando últimos 20 logs..."
pm2 logs cobramenu --lines 20 --nostream
echo ""

log "🎉 Deploy completado!"
echo ""
echo "Para ver logs en tiempo real, ejecuta:"
echo "  pm2 logs cobramenu"
echo ""
echo "Para ver el estado:"
echo "  pm2 status"

