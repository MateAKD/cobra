#!/bin/bash

# Script de Diagnóstico Completo para VPS
# Uso: sudo ./diagnose-vps.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${RED}🔍 DIAGNÓSTICO COMPLETO DE VPS${NC}"
echo "================================================"
date
echo ""

# 1. VERIFICAR CARGA DEL SISTEMA
echo -e "${BLUE}[1/12] CARGA DEL SISTEMA${NC}"
echo -e "${YELLOW}Uptime y Load Average:${NC}"
uptime
echo ""
free -h
echo ""

# 2. PROCESOS CON ALTO USO DE CPU
echo -e "${BLUE}[2/12] TOP 15 PROCESOS POR CPU${NC}"
ps aux --sort=-%cpu | head -16
echo ""

# 3. PROCESOS CON ALTO USO DE MEMORIA
echo -e "${BLUE}[3/12] TOP 15 PROCESOS POR MEMORIA${NC}"
ps aux --sort=-%mem | head -16
echo ""

# 4. VERIFICAR /etc/ld.so.preload
echo -e "${BLUE}[4/12] VERIFICANDO LD_PRELOAD${NC}"
if [ -f /etc/ld.so.preload ]; then
    echo -e "${RED}⚠️  /etc/ld.so.preload EXISTE:${NC}"
    cat /etc/ld.so.preload
    echo ""
    # Verificar si los archivos listados existen
    while read -r lib; do
        if [ -f "$lib" ]; then
            echo -e "${RED}⚠️  ARCHIVO MALICIOSO ENCONTRADO: $lib${NC}"
            ls -lah "$lib"
            md5sum "$lib" 2>/dev/null || true
        fi
    done < /etc/ld.so.preload
else
    echo -e "${GREEN}✓ /etc/ld.so.preload no existe (BIEN)${NC}"
fi
echo ""

# 5. BUSCAR PROCESOS OCULTOS/SOSPECHOSOS
echo -e "${BLUE}[5/12] BUSCANDO PROCESOS SOSPECHOSOS${NC}"
MALWARE_NAMES=("xmrig" "kdevtmpfsi" "kinsing" "kthrotlds" "bioset" "watchbog" "crypto" "minerd" "ccminer" "hash" "miner" "cryptonight")

for name in "${MALWARE_NAMES[@]}"; do
    if pgrep -i "$name" > /dev/null; then
        echo -e "${RED}⚠️  PROCESO MALICIOSO ACTIVO: $name${NC}"
        pgrep -i "$name" | xargs ps -fp
    fi
done

# Buscar procesos ejecutándose desde /tmp, /var/tmp, /dev/shm
echo -e "${YELLOW}Procesos ejecutándose desde ubicaciones temporales:${NC}"
ps aux | grep -E "(\/tmp\/|\/var\/tmp\/|\/dev\/shm\/)" | grep -v grep || echo "Ninguno encontrado"
echo ""

# 6. VERIFICAR CRON JOBS
echo -e "${BLUE}[6/12] CRON JOBS DEL SISTEMA${NC}"
echo -e "${YELLOW}/etc/crontab:${NC}"
cat /etc/crontab 2>/dev/null || echo "No existe"
echo ""

echo -e "${YELLOW}/etc/cron.d/:${NC}"
ls -la /etc/cron.d/ 2>/dev/null || echo "No existe"
if [ -d /etc/cron.d/ ]; then
    for file in /etc/cron.d/*; do
        if [ -f "$file" ]; then
            echo "--- $file ---"
            cat "$file"
            echo ""
        fi
    done
fi

echo -e "${YELLOW}Crontabs de usuarios:${NC}"
for user in $(cut -f1 -d: /etc/passwd); do
    CRONTAB=$(crontab -u "$user" -l 2>/dev/null)
    if [ ! -z "$CRONTAB" ]; then
        echo -e "${YELLOW}Usuario: $user${NC}"
        echo "$CRONTAB"
        echo ""
    fi
done
echo ""

# 7. CONEXIONES DE RED SOSPECHOSAS
echo -e "${BLUE}[7/12] CONEXIONES DE RED ESTABLECIDAS${NC}"
echo -e "${YELLOW}Conexiones activas (excluyendo localhost y puertos conocidos):${NC}"
netstat -tunap 2>/dev/null | grep ESTABLISHED | grep -v "127.0.0.1" || ss -tunap | grep ESTAB | grep -v "127.0.0.1"
echo ""

# 8. PUERTOS EN ESCUCHA
echo -e "${BLUE}[8/12] PUERTOS EN ESCUCHA${NC}"
netstat -tulnp 2>/dev/null || ss -tulnp
echo ""

# 9. BUSCAR ARCHIVOS SOSPECHOSOS
echo -e "${BLUE}[9/12] ARCHIVOS SOSPECHOSOS EN UBICACIONES COMUNES${NC}"

# Buscar en /tmp
echo -e "${YELLOW}Archivos en /tmp (últimas 24 horas):${NC}"
find /tmp -type f -mtime -1 -ls 2>/dev/null | head -20 || echo "Error al acceder"
echo ""

# Buscar en /var/tmp
echo -e "${YELLOW}Archivos en /var/tmp (últimas 24 horas):${NC}"
find /var/tmp -type f -mtime -1 -ls 2>/dev/null | head -20 || echo "Error al acceder"
echo ""

# Buscar en /dev/shm
echo -e "${YELLOW}Archivos en /dev/shm:${NC}"
ls -lah /dev/shm/ 2>/dev/null || echo "Error al acceder"
echo ""

# Buscar binarios sospechosos
echo -e "${YELLOW}Buscando binarios sospechosos:${NC}"
find /tmp /var/tmp /dev/shm /usr/local/lib -type f \( -executable -o -name "*.so" \) 2>/dev/null | head -20 || true
echo ""

# 10. VERIFICAR SYSTEMD SERVICES SOSPECHOSOS
echo -e "${BLUE}[10/12] SERVICIOS SYSTEMD ACTIVOS${NC}"
echo -e "${YELLOW}Servicios habilitados no estándar:${NC}"
systemctl list-unit-files --state=enabled | grep -v "@" | tail -n +2 | head -20
echo ""

echo -e "${YELLOW}Servicios en ejecución (filtrados):${NC}"
systemctl list-units --type=service --state=running | grep -v "systemd" | tail -n +2 | head -20
echo ""

# 11. VERIFICAR MODIFICACIONES RECIENTES EN /etc
echo -e "${BLUE}[11/12] ARCHIVOS MODIFICADOS RECIENTEMENTE EN /etc${NC}"
find /etc -type f -mtime -7 -ls 2>/dev/null | head -20
echo ""

# 12. VERIFICAR SCRIPTS DE INICIO
echo -e "${BLUE}[12/12] SCRIPTS DE INICIO SOSPECHOSOS${NC}"
echo -e "${YELLOW}/etc/rc.local:${NC}"
if [ -f /etc/rc.local ]; then
    cat /etc/rc.local
else
    echo "No existe"
fi
echo ""

echo -e "${YELLOW}Scripts en /etc/init.d/:${NC}"
ls -la /etc/init.d/ 2>/dev/null | tail -20
echo ""

# RESUMEN
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ DIAGNÓSTICO COMPLETADO${NC}"
echo ""
echo -e "${MAGENTA}SEÑALES DE ALERTA CRÍTICAS:${NC}"
echo "1. ⚠️  Si /etc/ld.so.preload existe = MALWARE ACTIVO"
echo "2. ⚠️  Procesos con nombres sospechosos (xmrig, kinsing, etc.)"
echo "3. ⚠️  Procesos ejecutándose desde /tmp, /var/tmp, /dev/shm"
echo "4. ⚠️  Cron jobs no autorizados"
echo "5. ⚠️  Conexiones de red a IPs desconocidas en puertos extraños"
echo "6. ⚠️  Alto uso de CPU sin razón aparente"
echo ""
echo -e "${YELLOW}Si encuentras señales de alerta, ejecuta: sudo ./cleanup-malware.sh${NC}"
echo ""
