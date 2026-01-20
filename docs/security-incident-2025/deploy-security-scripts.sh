#!/bin/bash

# ========================================
# DESPLEGAR SCRIPTS DE SEGURIDAD AL VPS
# ========================================
# Transfiere todos los scripts de seguridad al VPS

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Configuración
VPS_IP="72.61.43.32"
VPS_USER="root"  # Cambiar si usas otro usuario
VPS_DIR="/var/www/cobra"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  DESPLEGAR SCRIPTS DE SEGURIDAD${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No estás en el directorio del proyecto Cobra 2.0"
    exit 1
fi

# Lista de archivos a transferir
FILES=(
    "deep-malware-cleanup.sh"
    "security-patch-react2shell.sh"
    "harden-security.sh"
    "verify-security.sh"
    "monitor-malware.sh"
    "QUICK-RESPONSE-GUIDE.md"
    "INCIDENT-RESPONSE-CHECKLIST.md"
    "SECURITY-README.md"
)

# Verificar que todos los archivos existen
info "Verificando archivos..."
MISSING_FILES=0
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        error "Archivo no encontrado: $file"
        MISSING_FILES=$((MISSING_FILES + 1))
    else
        log "$file"
    fi
done

if [ "$MISSING_FILES" -gt 0 ]; then
    error "Faltan $MISSING_FILES archivos. Abortando."
    exit 1
fi

echo ""
info "Conectando al VPS: $VPS_USER@$VPS_IP"
echo ""

# Verificar conexión SSH
if ! ssh -o ConnectTimeout=5 "$VPS_USER@$VPS_IP" "echo 'Conexión exitosa'" 2>/dev/null; then
    error "No se pudo conectar al VPS"
    error "Verifica:"
    echo "  1. La IP es correcta: $VPS_IP"
    echo "  2. El usuario es correcto: $VPS_USER"
    echo "  3. Tienes acceso SSH configurado"
    echo "  4. El VPS está iniciado"
    exit 1
fi

log "Conexión SSH exitosa"
echo ""

# Transferir archivos
info "Transfiriendo archivos al VPS..."
echo ""

for file in "${FILES[@]}"; do
    info "Transfiriendo $file..."
    
    if scp "$file" "$VPS_USER@$VPS_IP:$VPS_DIR/" 2>/dev/null; then
        log "$file transferido"
    else
        error "Error al transferir $file"
        exit 1
    fi
done

echo ""
info "Configurando permisos de ejecución..."

# Hacer ejecutables los scripts .sh
ssh "$VPS_USER@$VPS_IP" << 'EOF'
cd /var/www/cobra
chmod +x deep-malware-cleanup.sh
chmod +x security-patch-react2shell.sh
chmod +x harden-security.sh
chmod +x verify-security.sh
chmod +x monitor-malware.sh
echo "Permisos configurados"
EOF

log "Permisos configurados"
echo ""

# Verificar que los archivos están en el VPS
info "Verificando archivos en el VPS..."
ssh "$VPS_USER@$VPS_IP" << 'EOF'
cd /var/www/cobra
echo ""
echo "Archivos en el VPS:"
ls -lh deep-malware-cleanup.sh security-patch-react2shell.sh harden-security.sh verify-security.sh monitor-malware.sh *.md 2>/dev/null | grep -E "\.sh|\.md"
echo ""
EOF

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ DESPLIEGUE COMPLETADO${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

info "Próximos pasos:"
echo ""
echo "1. Conectarse al VPS:"
echo "   ${BLUE}ssh $VPS_USER@$VPS_IP${NC}"
echo ""
echo "2. Ir al directorio del proyecto:"
echo "   ${BLUE}cd $VPS_DIR${NC}"
echo ""
echo "3. Ejecutar los scripts en orden:"
echo "   ${BLUE}sudo bash deep-malware-cleanup.sh${NC}"
echo "   ${BLUE}sudo bash security-patch-react2shell.sh${NC}"
echo "   ${BLUE}sudo bash harden-security.sh${NC}"
echo "   ${BLUE}bash verify-security.sh${NC}"
echo ""
echo "4. O seguir la guía rápida:"
echo "   ${BLUE}cat QUICK-RESPONSE-GUIDE.md${NC}"
echo ""

warning "⚠️  IMPORTANTE:"
echo "  - Ejecuta los scripts en el orden indicado"
echo "  - Lee SECURITY-README.md para más detalles"
echo "  - Mantén una sesión SSH abierta durante todo el proceso"
echo ""
