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

# ⭐ Asegurar que el directorio data existe
mkdir -p data

# ⭐ Hacer backup de los datos ANTES del pull (solo si existen)
log "Haciendo backup de datos de producción..."
mkdir -p backups
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)

# Crear archivos vacíos si no existen (para evitar errores)
[ ! -f data/menu.json ] && echo '{}' > data/menu.json
[ ! -f data/categories.json ] && echo '{}' > data/categories.json
[ ! -f data/subcategory-mapping.json ] && echo '{}' > data/subcategory-mapping.json
[ ! -f data/subcategory-order.json ] && echo '{}' > data/subcategory-order.json
[ ! -f data/category-hierarchy.json ] && echo '{}' > data/category-hierarchy.json

# Hacer backup de los archivos
cp data/menu.json backups/menu.backup.${BACKUP_DATE}.json 2>/dev/null && log "Backup de menu.json creado" || warn "No se pudo hacer backup de menu.json"
cp data/categories.json backups/categories.backup.${BACKUP_DATE}.json 2>/dev/null && log "Backup de categories.json creado" || warn "No se pudo hacer backup de categories.json"
cp data/subcategory-mapping.json backups/subcategory-mapping.backup.${BACKUP_DATE}.json 2>/dev/null && log "Backup de subcategory-mapping.json creado" || warn "No se pudo hacer backup de subcategory-mapping.json"
cp data/subcategory-order.json backups/subcategory-order.backup.${BACKUP_DATE}.json 2>/dev/null && log "Backup de subcategory-order.json creado" || warn "No se pudo hacer backup de subcategory-order.json"
cp data/category-hierarchy.json backups/category-hierarchy.backup.${BACKUP_DATE}.json 2>/dev/null && log "Backup de category-hierarchy.json creado" || warn "No se pudo hacer backup de category-hierarchy.json"

# ⭐ Guardar cambios locales de archivos de datos (si existen)
log "Guardando cambios locales de archivos de datos..."
git stash push -m "Backup datos antes de deploy ${BACKUP_DATE}" data/menu.json data/categories.json data/subcategory-mapping.json data/subcategory-order.json data/category-hierarchy.json 2>/dev/null || warn "No hay cambios locales en archivos de datos o ya están guardados"

# 1. Pull últimos cambios
log "Descargando últimos cambios..."
# Intentar pull normal primero
if ! git pull origin main 2>/dev/null; then
    # Si falla por historiales no relacionados, hacer reset hard al remoto
    if git pull origin main --allow-unrelated-histories 2>/dev/null; then
        log "Historiales fusionados exitosamente"
    else
        warn "Historiales no relacionados detectados, sincronizando con remoto..."
        git fetch origin main
        git reset --hard origin/main
        log "Repositorio sincronizado con remoto"
    fi
fi

# ⭐ Restaurar datos después del pull (si existen backups)
log "Restaurando datos de producción..."
[ -f backups/menu.backup.${BACKUP_DATE}.json ] && cp backups/menu.backup.${BACKUP_DATE}.json data/menu.json && log "menu.json restaurado" || (echo '{}' > data/menu.json && log "menu.json inicializado vacío")
[ -f backups/categories.backup.${BACKUP_DATE}.json ] && cp backups/categories.backup.${BACKUP_DATE}.json data/categories.json && log "categories.json restaurado" || (echo '{}' > data/categories.json && log "categories.json inicializado vacío")
[ -f backups/subcategory-mapping.backup.${BACKUP_DATE}.json ] && cp backups/subcategory-mapping.backup.${BACKUP_DATE}.json data/subcategory-mapping.json && log "subcategory-mapping.json restaurado" || (echo '{}' > data/subcategory-mapping.json && log "subcategory-mapping.json inicializado vacío")
[ -f backups/subcategory-order.backup.${BACKUP_DATE}.json ] && cp backups/subcategory-order.backup.${BACKUP_DATE}.json data/subcategory-order.json && log "subcategory-order.json restaurado" || (echo '{}' > data/subcategory-order.json && log "subcategory-order.json inicializado vacío")
[ -f backups/category-hierarchy.backup.${BACKUP_DATE}.json ] && cp backups/category-hierarchy.backup.${BACKUP_DATE}.json data/category-hierarchy.json && log "category-hierarchy.json restaurado" || (echo '{}' > data/category-hierarchy.json && log "category-hierarchy.json inicializado vacío")

# 2. Instalar dependencias
log "Instalando dependencias..."
pnpm install || error "Error al instalar dependencias"

# 3. Build
log "Compilando aplicación..."

# Optimización de memoria para el build
export NODE_OPTIONS="--max-old-space-size=1536"
warn "Límite de memoria Node ajustado a 1.5GB"

# Recordatorio de swap
if [ ! -f "/swapfile" ] && [ ! -f "/swap/file" ]; then
    warn "⚠️  No se detectó archivo swap. Si el build falla, ejecuta: sudo bash scripts/setup-vps-memory.sh"
fi

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

