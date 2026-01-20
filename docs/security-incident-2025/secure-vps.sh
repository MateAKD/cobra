#!/bin/bash

# Script de Hardening/Fortificación del VPS
# Uso: sudo ./secure-vps.sh
# Ejecutar DESPUÉS de limpiar el malware

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}🔐 FORTIFICANDO VPS CONTRA MALWARE${NC}"
echo "================================================"
echo ""

# Verificar que se está ejecutando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Por favor ejecuta este script como root (sudo)${NC}"
    exit 1
fi

# 1. INSTALAR FAIL2BAN
echo -e "${BLUE}[1/10] Instalando fail2ban...${NC}"
if ! command -v fail2ban-client &> /dev/null; then
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y fail2ban
    elif command -v yum &> /dev/null; then
        yum install -y epel-release
        yum install -y fail2ban
    fi
    echo -e "${GREEN}✓ Fail2ban instalado${NC}"
else
    echo -e "${GREEN}✓ Fail2ban ya está instalado${NC}"
fi

# Configurar fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
banaction = iptables-multiport

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl restart fail2ban
echo -e "${GREEN}✓ Fail2ban configurado${NC}"

# 2. CONFIGURAR FIREWALL
echo -e "${BLUE}[2/10] Configurando firewall (UFW)...${NC}"

if ! command -v ufw &> /dev/null; then
    if command -v apt-get &> /dev/null; then
        apt-get install -y ufw
    elif command -v yum &> /dev/null; then
        yum install -y ufw
    fi
fi

# Resetear UFW
ufw --force reset

# Políticas por defecto
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH (IMPORTANTE: cambiar puerto si usas uno personalizado)
ufw allow 22/tcp comment 'SSH'

# Permitir HTTP/HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Bloquear puertos de minería comunes
MINING_PORTS=(3333 4444 5555 7777 8888 14433 14444 45560)
for port in "${MINING_PORTS[@]}"; do
    ufw deny out "$port" comment "Block mining port $port"
done

# Activar UFW
echo "y" | ufw enable

echo -e "${GREEN}✓ Firewall configurado${NC}"

# 3. PROTEGER LD_PRELOAD
echo -e "${BLUE}[3/10] Protegiendo /etc/ld.so.preload...${NC}"

# Asegurarse de que está vacío
> /etc/ld.so.preload

# Hacer el archivo inmutable (no se puede modificar sin quitar el atributo)
chattr +i /etc/ld.so.preload 2>/dev/null || true
echo -e "${GREEN}✓ /etc/ld.so.preload protegido (inmutable)${NC}"

# 4. PROTEGER CRONTAB
echo -e "${BLUE}[4/10] Protegiendo crontabs...${NC}"

# Restringir permisos
chmod 600 /etc/crontab 2>/dev/null || true
chmod 700 /etc/cron.d/ 2>/dev/null || true
chmod 700 /etc/cron.daily/ 2>/dev/null || true
chmod 700 /etc/cron.hourly/ 2>/dev/null || true
chmod 700 /etc/cron.weekly/ 2>/dev/null || true

echo -e "${GREEN}✓ Permisos de crontab reforzados${NC}"

# 5. ASEGURAR SSH
echo -e "${BLUE}[5/10] Asegurando SSH...${NC}"

# Backup de la configuración original
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)

# Configuraciones de seguridad
sed -i 's/#PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config
sed -i 's/#ClientAliveInterval 0/ClientAliveInterval 300/' /etc/ssh/sshd_config
sed -i 's/#ClientAliveCountMax 3/ClientAliveCountMax 2/' /etc/ssh/sshd_config

# Reiniciar SSH
systemctl restart sshd

echo -e "${GREEN}✓ SSH asegurado${NC}"
echo -e "${YELLOW}  - Root login solo con SSH key${NC}"
echo -e "${YELLOW}  - Máximo 3 intentos de autenticación${NC}"

# 6. INSTALAR RKHUNTER
echo -e "${BLUE}[6/10] Instalando rkhunter...${NC}"

if ! command -v rkhunter &> /dev/null; then
    if command -v apt-get &> /dev/null; then
        apt-get install -y rkhunter
    elif command -v yum &> /dev/null; then
        yum install -y rkhunter
    fi
    
    # Actualizar base de datos
    rkhunter --update
    rkhunter --propupd
    
    echo -e "${GREEN}✓ rkhunter instalado${NC}"
else
    echo -e "${GREEN}✓ rkhunter ya está instalado${NC}"
fi

# 7. INSTALAR CHKROOTKIT
echo -e "${BLUE}[7/10] Instalando chkrootkit...${NC}"

if ! command -v chkrootkit &> /dev/null; then
    if command -v apt-get &> /dev/null; then
        apt-get install -y chkrootkit
    elif command -v yum &> /dev/null; then
        yum install -y chkrootkit
    fi
    echo -e "${GREEN}✓ chkrootkit instalado${NC}"
else
    echo -e "${GREEN}✓ chkrootkit ya está instalado${NC}"
fi

# 8. CONFIGURAR MONITOREO CON CRON
echo -e "${BLUE}[8/10] Configurando monitoreo automático...${NC}"

# Script de monitoreo
cat > /usr/local/bin/monitor-malware.sh << 'EOFMON'
#!/bin/bash
# Script de monitoreo automático

LOG_FILE="/var/log/malware-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Iniciando escaneo de monitoreo" >> "$LOG_FILE"

# Verificar LD_PRELOAD
if [ -s /etc/ld.so.preload ]; then
    echo "[$DATE] ⚠️ ALERTA: /etc/ld.so.preload no está vacío!" >> "$LOG_FILE"
    cat /etc/ld.so.preload >> "$LOG_FILE"
fi

# Verificar procesos con alto CPU
HIGH_CPU=$(ps aux --sort=-%cpu | head -5 | awk '{if(NR>1 && $3>50) print $0}')
if [ ! -z "$HIGH_CPU" ]; then
    echo "[$DATE] ⚠️ Procesos con alto CPU detectados:" >> "$LOG_FILE"
    echo "$HIGH_CPU" >> "$LOG_FILE"
fi

# Verificar archivos en /tmp
TMP_FILES=$(find /tmp -type f -mmin -10 2>/dev/null | wc -l)
if [ "$TMP_FILES" -gt 10 ]; then
    echo "[$DATE] ⚠️ Actividad inusual en /tmp: $TMP_FILES archivos nuevos" >> "$LOG_FILE"
fi

echo "[$DATE] Escaneo completado" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
EOFMON

chmod +x /usr/local/bin/monitor-malware.sh

# Agregar al cron (cada 30 minutos)
CRON_JOB="*/30 * * * * /usr/local/bin/monitor-malware.sh"
(crontab -l 2>/dev/null | grep -v monitor-malware.sh; echo "$CRON_JOB") | crontab -

echo -e "${GREEN}✓ Monitoreo automático configurado${NC}"
echo -e "${YELLOW}  - Se ejecutará cada 30 minutos${NC}"
echo -e "${YELLOW}  - Log: /var/log/malware-monitor.log${NC}"

# 9. PROTEGER DIRECTORIOS TEMPORALES
echo -e "${BLUE}[9/10] Protegiendo directorios temporales...${NC}"

# Montar /tmp con opciones de seguridad si no está así
# (Requiere reinicio para aplicar completamente)
if ! grep -q "noexec" /etc/fstab | grep "/tmp"; then
    echo "tmpfs /tmp tmpfs defaults,noexec,nosuid,nodev 0 0" >> /etc/fstab
    echo -e "${YELLOW}⚠️  /tmp será montado con noexec después del próximo reinicio${NC}"
fi

# 10. CREAR SCRIPT DE VERIFICACIÓN DIARIA
echo -e "${BLUE}[10/10] Creando verificación diaria...${NC}"

cat > /usr/local/bin/daily-security-check.sh << 'EOFDAILY'
#!/bin/bash
# Verificación diaria de seguridad

REPORT_FILE="/var/log/daily-security-$(date +%Y%m%d).log"

{
    echo "================================"
    echo "Reporte de Seguridad - $(date)"
    echo "================================"
    echo ""
    
    echo "=== PROCESOS CON ALTO CPU ==="
    ps aux --sort=-%cpu | head -10
    echo ""
    
    echo "=== CONEXIONES DE RED ==="
    netstat -tunap 2>/dev/null | grep ESTABLISHED || ss -tunap | grep ESTAB
    echo ""
    
    echo "=== VERIFICACIÓN LD_PRELOAD ==="
    if [ -s /etc/ld.so.preload ]; then
        echo "⚠️ ALERTA: /etc/ld.so.preload NO ESTÁ VACÍO"
        cat /etc/ld.so.preload
    else
        echo "✓ OK"
    fi
    echo ""
    
    echo "=== USUARIOS LOGUEADOS ==="
    who
    echo ""
    
    echo "=== INTENTOS FALLIDOS DE LOGIN ==="
    grep "Failed password" /var/log/auth.log 2>/dev/null | tail -10 || echo "No hay intentos recientes"
    echo ""
    
} > "$REPORT_FILE"

echo "Reporte guardado en: $REPORT_FILE"
EOFDAILY

chmod +x /usr/local/bin/daily-security-check.sh

# Agregar al cron (diario a las 6 AM)
DAILY_CRON_JOB="0 6 * * * /usr/local/bin/daily-security-check.sh"
(crontab -l 2>/dev/null | grep -v daily-security-check.sh; echo "$DAILY_CRON_JOB") | crontab -

echo -e "${GREEN}✓ Verificación diaria configurada${NC}"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ VPS FORTIFICADO${NC}"
echo ""
echo -e "${MAGENTA}RESUMEN DE MEDIDAS IMPLEMENTADAS:${NC}"
echo "✓ Fail2ban instalado y configurado"
echo "✓ Firewall (UFW) activado"
echo "✓ Puertos de minería bloqueados"
echo "✓ /etc/ld.so.preload protegido (inmutable)"
echo "✓ SSH reforzado"
echo "✓ rkhunter y chkrootkit instalados"
echo "✓ Monitoreo automático cada 30 min"
echo "✓ Verificación diaria de seguridad"
echo ""
echo -e "${YELLOW}PRÓXIMOS PASOS RECOMENDADOS:${NC}"
echo "1. Cambiar contraseñas: passwd"
echo "2. Configurar autenticación SSH por clave"
echo "3. Ejecutar escaneo manual: sudo rkhunter --check"
echo "4. Revisar logs diariamente: tail -f /var/log/malware-monitor.log"
echo "5. Reiniciar el sistema: sudo reboot"
echo ""
echo -e "${MAGENTA}COMANDOS ÚTILES:${NC}"
echo "- Ver status de fail2ban: sudo fail2ban-client status sshd"
echo "- Ver status de firewall: sudo ufw status verbose"
echo "- Ver log de monitoreo: sudo tail -f /var/log/malware-monitor.log"
echo "- Escanear con rkhunter: sudo rkhunter --check"
echo "- Escanear con chkrootkit: sudo chkrootkit"
echo ""
