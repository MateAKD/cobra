#!/bin/bash

# ===================================
# Script para Restaurar Backups de COBRA
# ===================================

echo "🔧 Restaurando backups de COBRA..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Verificar que existe el directorio de backups
if [ ! -d "backups" ]; then
    error "No se encuentra el directorio de backups. ¿Has ejecutado deploy.sh antes?"
fi

# Listar backups disponibles
echo ""
echo "📦 Backups disponibles:"
echo "========================"
ls -lht backups/ | head -20
echo ""

# Buscar el backup más reciente de cada archivo
log "Buscando backups más recientes..."

# Función para encontrar el backup más reciente de un archivo
find_latest_backup() {
    local file_prefix=$1
    ls -t backups/${file_prefix}.backup.*.json 2>/dev/null | head -1
}

# Encontrar backups más recientes
MENU_BACKUP=$(find_latest_backup "menu")
CATEGORIES_BACKUP=$(find_latest_backup "categories")
MAPPING_BACKUP=$(find_latest_backup "subcategory-mapping")
ORDER_BACKUP=$(find_latest_backup "subcategory-order")
HIERARCHY_BACKUP=$(find_latest_backup "category-hierarchy")

# Mostrar backups encontrados
echo ""
echo "📋 Backups encontrados:"
[ -n "$MENU_BACKUP" ] && log "menu.json: $(basename $MENU_BACKUP)" || warn "No se encontró backup de menu.json"
[ -n "$CATEGORIES_BACKUP" ] && log "categories.json: $(basename $CATEGORIES_BACKUP)" || warn "No se encontró backup de categories.json"
[ -n "$MAPPING_BACKUP" ] && log "subcategory-mapping.json: $(basename $MAPPING_BACKUP)" || warn "No se encontró backup de subcategory-mapping.json"
[ -n "$ORDER_BACKUP" ] && log "subcategory-order.json: $(basename $ORDER_BACKUP)" || warn "No se encontró backup de subcategory-order.json"
[ -n "$HIERARCHY_BACKUP" ] && log "category-hierarchy.json: $(basename $HIERARCHY_BACKUP)" || warn "No se encontró backup de category-hierarchy.json"

echo ""
read -p "¿Deseas restaurar estos backups? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    warn "Restauración cancelada."
    exit 0
fi

# Asegurar que el directorio data existe
mkdir -p data

# Restaurar backups
log "Restaurando archivos..."

[ -n "$MENU_BACKUP" ] && cp "$MENU_BACKUP" data/menu.json && log "✓ menu.json restaurado" || warn "✗ No se pudo restaurar menu.json"
[ -n "$CATEGORIES_BACKUP" ] && cp "$CATEGORIES_BACKUP" data/categories.json && log "✓ categories.json restaurado" || warn "✗ No se pudo restaurar categories.json"
[ -n "$MAPPING_BACKUP" ] && cp "$MAPPING_BACKUP" data/subcategory-mapping.json && log "✓ subcategory-mapping.json restaurado" || warn "✗ No se pudo restaurar subcategory-mapping.json"
[ -n "$ORDER_BACKUP" ] && cp "$ORDER_BACKUP" data/subcategory-order.json && log "✓ subcategory-order.json restaurado" || warn "✗ No se pudo restaurar subcategory-order.json"
[ -n "$HIERARCHY_BACKUP" ] && cp "$HIERARCHY_BACKUP" data/category-hierarchy.json && log "✓ category-hierarchy.json restaurado" || warn "✗ No se pudo restaurar category-hierarchy.json"

# Verificar que los archivos se restauraron
echo ""
log "Verificando archivos restaurados..."
[ -f data/menu.json ] && log "✓ data/menu.json existe" || warn "✗ data/menu.json no existe"
[ -f data/categories.json ] && log "✓ data/categories.json existe" || warn "✗ data/categories.json no existe"
[ -f data/subcategory-mapping.json ] && log "✓ data/subcategory-mapping.json existe" || warn "✗ data/subcategory-mapping.json no existe"
[ -f data/subcategory-order.json ] && log "✓ data/subcategory-order.json existe" || warn "✗ data/subcategory-order.json no existe"
[ -f data/category-hierarchy.json ] && log "✓ data/category-hierarchy.json existe" || warn "✗ data/category-hierarchy.json no existe"

# Preguntar si reiniciar PM2
echo ""
read -p "¿Deseas reiniciar la aplicación PM2? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[SsYy]$ ]]; then
    log "Reiniciando aplicación..."
    pm2 restart cobramenu && log "✓ Aplicación reiniciada" || warn "✗ Error al reiniciar aplicación"
    pm2 status cobramenu
fi

echo ""
log "🎉 Restauración completada!"
echo ""
warn "NOTA: Los archivos de datos están en .gitignore y NO se subirán a Git automáticamente."
warn "Si deseas guardarlos en Git, deberás hacerlo manualmente (no recomendado para producción)."

