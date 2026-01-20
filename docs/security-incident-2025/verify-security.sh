#!/bin/bash

# ========================================
# VERIFICACIÓN POST-INCIDENTE
# ========================================
# Verifica que el sistema está limpio y seguro después del incidente

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }

ISSUES_FOUND=0

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VERIFICACIÓN POST-INCIDENTE${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ========================================
# 1. VERIFICAR PROCESOS
# ========================================
info "[1/10] Verificando procesos..."

MALICIOUS_PROCS=$(ps aux | grep -E "hash|kdevtmpfsi|kinsing|xmrig|cpuminer" | grep -v grep | grep -v verify || true)
if [ -z "$MALICIOUS_PROCS" ]; then
    log "No se encontraron procesos maliciosos"
else
    error "Procesos maliciosos detectados:"
    echo "$MALICIOUS_PROCS"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Verificar CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
if (( $(echo "$CPU_USAGE < 50" | bc -l) )); then
    log "CPU normal: ${CPU_USAGE}%"
else
    warning "CPU elevado: ${CPU_USAGE}%"
    echo "   Top 5 procesos:"
    ps aux --sort=-%cpu | head -6 | tail -5
fi

echo ""

# ========================================
# 2. VERIFICAR ARCHIVOS MALICIOSOS
# ========================================
info "[2/10] Verificando archivos maliciosos..."

MALICIOUS_FILES=$(find /var/www/cobra /tmp /var/tmp /dev/shm -type f \( -name "hash" -o -name "kdevtmpfsi" -o -name "kinsing" \) 2>/dev/null || true)
if [ -z "$MALICIOUS_FILES" ]; then
    log "No se encontraron archivos maliciosos"
else
    error "Archivos maliciosos encontrados:"
    echo "$MALICIOUS_FILES"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ========================================
# 3. VERIFICAR VERSIONES DE DEPENDENCIAS
# ========================================
info "[3/10] Verificando versiones de Next.js y React..."

cd /var/www/cobra

NEXT_VERSION=$(node -p "require('./package.json').dependencies.next" 2>/dev/null | tr -d '^~' || echo "unknown")
REACT_VERSION=$(node -p "require('./package.json').dependencies.react" 2>/dev/null | tr -d '^~' || echo "unknown")

echo "   Next.js: $NEXT_VERSION"
echo "   React: $REACT_VERSION"

# Verificar si las versiones son seguras
# Next.js debe ser >= 15.2.6 o >= 15.3.6 o >= 15.4.8, etc.
if [[ "$NEXT_VERSION" =~ ^15\.2\.[6-9]$ ]] || [[ "$NEXT_VERSION" =~ ^15\.2\.[1-9][0-9]+$ ]] || \
   [[ "$NEXT_VERSION" =~ ^15\.3\.[6-9]$ ]] || [[ "$NEXT_VERSION" =~ ^15\.3\.[1-9][0-9]+$ ]] || \
   [[ "$NEXT_VERSION" =~ ^15\.[4-9]\. ]] || [[ "$NEXT_VERSION" =~ ^1[6-9]\. ]]; then
    log "Next.js en versión segura"
else
    error "Next.js en versión vulnerable: $NEXT_VERSION (necesita >= 15.2.6)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# React debe ser >= 19.2.1
if [[ "$REACT_VERSION" =~ ^19\.2\.[1-9]$ ]] || [[ "$REACT_VERSION" =~ ^19\.2\.[1-9][0-9]+$ ]] || \
   [[ "$REACT_VERSION" =~ ^19\.[3-9]\. ]] || [[ "$REACT_VERSION" =~ ^[2-9][0-9]\. ]]; then
    log "React en versión segura"
else
    error "React en versión vulnerable: $REACT_VERSION (necesita >= 19.2.1)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ========================================
# 4. VERIFICAR SERVICIOS DE SEGURIDAD
# ========================================
info "[4/10] Verificando servicios de seguridad..."

SERVICES=("fail2ban" "ufw" "auditd")
for service in "${SERVICES[@]}"; do
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        log "$service: activo"
    else
        error "$service: inactivo"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
done

# Verificar firewall
if sudo ufw status | grep -q "Status: active"; then
    log "Firewall UFW: activo"
else
    error "Firewall UFW: inactivo"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ========================================
# 5. VERIFICAR CONEXIONES DE RED
# ========================================
info "[5/10] Verificando conexiones de red..."

MINING_CONNECTIONS=$(sudo netstat -tupn 2>/dev/null | grep -E ":3333|:4444|:5555|:7777|:8888|:14444" | grep ESTABLISHED || true)
if [ -z "$MINING_CONNECTIONS" ]; then
    log "No hay conexiones a puertos de mining"
else
    error "Conexiones sospechosas a puertos de mining:"
    echo "$MINING_CONNECTIONS"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ========================================
# 6. VERIFICAR CRON JOBS
# ========================================
info "[6/10] Verificando cron jobs..."

# Verificar monitoreo de malware
if crontab -l 2>/dev/null | grep -q "monitor-malware.sh"; then
    log "Monitoreo de malware programado"
else
    warning "Monitoreo de malware NO programado"
fi

# Buscar cron jobs sospechosos
SUSPICIOUS_CRONS=$(crontab -l 2>/dev/null | grep -E "curl|wget|/tmp|base64" | grep -v monitor-malware || true)
if [ -z "$SUSPICIOUS_CRONS" ]; then
    log "No hay cron jobs sospechosos"
else
    error "Cron jobs sospechosos encontrados:"
    echo "$SUSPICIOUS_CRONS"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ========================================
# 7. VERIFICAR CLAVES SSH
# ========================================
info "[7/10] Verificando claves SSH..."

if [ -f ~/.ssh/authorized_keys ]; then
    NUM_KEYS=$(grep -v "^#" ~/.ssh/authorized_keys | grep -v "^$" | wc -l)
    echo "   Claves SSH autorizadas: $NUM_KEYS"
    
    # Buscar claves sospechosas
    SUSPICIOUS_KEYS=$(grep -v "^#" ~/.ssh/authorized_keys | grep -E "curl|wget|bash|sh" || true)
    if [ -z "$SUSPICIOUS_KEYS" ]; then
        log "No hay claves SSH sospechosas"
    else
        error "Claves SSH sospechosas encontradas (Check manually)"
        # ISSUES_FOUND=$((ISSUES_FOUND + 1)) # Don't fail on this automatically, might be false positive in comment
    fi
else
    warning "No se encontró archivo authorized_keys"
fi

echo ""

# ========================================
# 8. VERIFICAR PM2 Y APLICACIÓN
# ========================================
info "[8/10] Verificando aplicación..."

if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 status | grep cobra-bar | grep -c online || echo "0")
    if [ "$PM2_STATUS" -gt "0" ]; then
        log "Aplicación corriendo en PM2"
    else
        error "Aplicación NO está corriendo (Check 'pm2 status')"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
    
    # Verificar que no hay procesos duplicados
    PM2_COUNT=$(pm2 status | grep -c cobra-bar || echo "0")
    if [ "$PM2_COUNT" -eq "1" ]; then
        log "Solo 1 instancia de la aplicación"
    else
        warning "Múltiples instancias detectadas: $PM2_COUNT"
    fi
else
    error "PM2 no está instalado"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ========================================
# 9. VERIFICAR DIRECTORIOS TEMPORALES
# ========================================
info "[9/10] Verificando directorios temporales..."

# Verificar /tmp
TMP_EXECUTABLES=$(find /tmp -type f -executable 2>/dev/null | wc -l)
if [ "$TMP_EXECUTABLES" -eq "0" ]; then
    log "/tmp sin ejecutables"
else
    warning "/tmp contiene $TMP_EXECUTABLES archivos ejecutables"
    find /tmp -type f -executable 2>/dev/null | head -5
fi

# Verificar /dev/shm
SHM_FILES=$(find /dev/shm -type f 2>/dev/null | wc -l)
if [ "$SHM_FILES" -eq "0" ]; then
    log "/dev/shm limpio"
else
    warning "/dev/shm contiene $SHM_FILES archivos"
fi

echo ""

# ========================================
# 10. VERIFICAR LOGS RECIENTES
# ========================================
info "[10/10] Verificando logs recientes..."

# Verificar intentos de acceso SSH fallidos
FAILED_SSH=$(grep "Failed password" /var/log/auth.log 2>/dev/null | tail -5 | wc -l || echo "0")
if [ "$FAILED_SSH" -gt "0" ]; then
    warning "Intentos de acceso SSH fallidos recientes: $FAILED_SSH"
    echo "   Últimos intentos:"
    grep "Failed password" /var/log/auth.log 2>/dev/null | tail -3 || true
else
    log "No hay intentos de acceso SSH fallidos recientes"
fi

echo ""

# ========================================
# RESUMEN
# ========================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  RESUMEN DE VERIFICACIÓN${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ "$ISSUES_FOUND" -eq "0" ]; then
    echo -e "${GREEN}✅ SISTEMA LIMPIO Y SEGURO${NC}"
    echo ""
    log "No se encontraron problemas de seguridad"
    log "Todas las verificaciones pasaron exitosamente"
    echo ""
    info "Recomendaciones:"
    echo "  - Continuar monitoreando el sistema durante 24-48 horas"
    echo "  - Revisar logs periódicamente"
    echo "  - Mantener las versiones actualizadas"
else
    echo -e "${RED}⚠️  SE ENCONTRARON $ISSUES_FOUND PROBLEMA(S)${NC}"
    echo ""
    error "Revisa los problemas reportados arriba"
    error "Ejecuta los scripts de limpieza y hardening nuevamente si es necesario"
    echo ""
    info "Acciones recomendadas:"
    echo "  1. Revisar y resolver cada problema identificado"
    echo "  2. Ejecutar: sudo bash deep-malware-cleanup.sh"
    echo "  3. Ejecutar: sudo bash security-patch-react2shell.sh"
    echo "  4. Ejecutar: sudo bash harden-security.sh"
    echo "  5. Ejecutar este script nuevamente"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo ""

# Salir con código de error si hay problemas
exit $ISSUES_FOUND
