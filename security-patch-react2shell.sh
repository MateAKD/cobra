#!/bin/bash

# ========================================
# PARCHE DE SEGURIDAD - CVE-2025-55182 (React2Shell)
# ========================================
# Este script actualiza Next.js y React a versiones parcheadas
# para proteger contra la vulnerabilidad crítica React2Shell

set -e  # Salir si hay error

echo "🔒 =========================================="
echo "🔒 PARCHE CVE-2025-55182 (React2Shell)"
echo "🔒 =========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="/var/www/cobra"
BACKUP_DIR="/var/backups/cobra-$(date +%Y%m%d-%H%M%S)"

# Función para logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 1. Verificar que estamos en el directorio correcto
log "📁 Verificando directorio del proyecto..."
if [ ! -d "$PROJECT_DIR" ]; then
    error "Directorio $PROJECT_DIR no existe"
    exit 1
fi

cd "$PROJECT_DIR"

# 2. Crear backup antes de actualizar
log "💾 Creando backup en $BACKUP_DIR..."
sudo mkdir -p "$BACKUP_DIR"
sudo cp package.json "$BACKUP_DIR/"
sudo cp pnpm-lock.yaml "$BACKUP_DIR/" 2>/dev/null || sudo cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || true

# 3. Verificar versiones actuales
log "🔍 Verificando versiones actuales..."
CURRENT_NEXT=$(node -p "require('./package.json').dependencies.next" 2>/dev/null || echo "unknown")
CURRENT_REACT=$(node -p "require('./package.json').dependencies.react" 2>/dev/null || echo "unknown")

echo "   Next.js actual: $CURRENT_NEXT"
echo "   React actual: $CURRENT_REACT"
echo ""

# 4. Verificar si es vulnerable
warning "⚠️  VERSIONES VULNERABLES:"
warning "   - Next.js 15.0.0 - 15.2.5"
warning "   - Next.js 15.3.0 - 15.3.5"
warning "   - Next.js 15.4.0 - 15.4.7"
warning "   - Next.js 15.5.0 - 15.5.6"
warning "   - Next.js 16.0.0 - 16.0.6"
warning "   - React 19.0.0, 19.1.0, 19.1.1, 19.2.0"
echo ""

# 5. Detener la aplicación
log "🛑 Deteniendo aplicación..."
pm2 stop cobra-app 2>/dev/null || true

# 6. Actualizar dependencias a versiones parcheadas
log "📦 Actualizando a versiones parcheadas..."

# Opción 1: Usar el script oficial de Vercel (recomendado)
if command -v npx &> /dev/null; then
    log "   Usando script oficial de Vercel..."
    npx fix-react2shell-next || {
        warning "   Script de Vercel falló, actualizando manualmente..."
        
        # Opción 2: Actualización manual
        log "   Actualizando Next.js a 15.2.6..."
        pnpm add next@15.2.6 || npm install next@15.2.6
        
        log "   Actualizando React a 19.2.1..."
        pnpm add react@19.2.1 react-dom@19.2.1 || npm install react@19.2.1 react-dom@19.2.1
    }
else
    # Actualización manual si npx no está disponible
    log "   Actualizando manualmente..."
    pnpm add next@15.2.6 react@19.2.1 react-dom@19.2.1 || npm install next@15.2.6 react@19.2.1 react-dom@19.2.1
fi

# 7. Verificar versiones actualizadas
log "✅ Verificando versiones actualizadas..."
NEW_NEXT=$(node -p "require('./package.json').dependencies.next")
NEW_REACT=$(node -p "require('./package.json').dependencies.react")

echo "   Next.js nuevo: $NEW_NEXT"
echo "   React nuevo: $NEW_REACT"
echo ""

# 8. Limpiar cache y rebuild
log "🧹 Limpiando cache..."
rm -rf .next
rm -rf node_modules/.cache

log "🔨 Reconstruyendo aplicación..."
pnpm build || npm run build

# 9. Reiniciar aplicación
log "🚀 Reiniciando aplicación..."
pm2 restart cobra-app || pm2 start ecosystem.config.js

# 10. Verificar que la app está corriendo
sleep 5
if pm2 status | grep -q "online"; then
    log "✅ Aplicación reiniciada correctamente"
else
    error "❌ La aplicación no se inició correctamente"
    error "   Revisa los logs con: pm2 logs cobra-app"
    exit 1
fi

# 11. Recomendaciones finales
echo ""
log "🔒 =========================================="
log "🔒 PARCHE APLICADO EXITOSAMENTE"
log "🔒 =========================================="
echo ""
warning "⚠️  ACCIONES ADICIONALES REQUERIDAS:"
echo ""
echo "1. 🔑 ROTAR SECRETOS INMEDIATAMENTE:"
echo "   - Variables de entorno (.env.local)"
echo "   - API keys"
echo "   - Tokens de autenticación"
echo "   - Contraseñas de base de datos"
echo ""
echo "2. 🔍 VERIFICAR LOGS DE ACCESO:"
echo "   - Revisar /var/log/nginx/access.log"
echo "   - Buscar solicitudes POST sospechosas"
echo "   - Verificar IPs desconocidas"
echo ""
echo "3. 🛡️  EJECUTAR HARDENING:"
echo "   - bash harden-security.sh"
echo ""
echo "4. 📊 MONITOREAR SISTEMA:"
echo "   - pm2 monit"
echo "   - htop"
echo "   - tail -f /var/log/malware-monitor.log"
echo ""
log "Backup guardado en: $BACKUP_DIR"
echo ""
