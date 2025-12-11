#!/bin/bash

# ========================================
# HARDENING DE SEGURIDAD - VPS COBRA 2.0
# ========================================
# Protección contra CVE-2025-55182 y malware
# Uso: sudo bash harden-security.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo -e "${BLUE}🔒 ==========================================${NC}"
echo -e "${BLUE}🔒 HARDENING DE SEGURIDAD - COBRA 2.0${NC}"
echo -e "${BLUE}🔒 ==========================================${NC}"
echo ""

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
    error "Este script debe ejecutarse como root (sudo)"
    exit 1
fi

# ========================================
# 1. ACTUALIZAR SISTEMA
# ========================================
log "[1/12] Actualizando sistema..."
apt update && apt upgrade -y

# ========================================
# 2. INSTALAR HERRAMIENTAS DE SEGURIDAD
# ========================================
log "[2/12] Instalando herramientas de seguridad..."
apt install -y \
    fail2ban \
    ufw \
    unattended-upgrades \
    rkhunter \
    chkrootkit \
    aide \
    auditd \
    apparmor \
    apparmor-utils

# ========================================
# 3. CONFIGURAR FIREWALL (UFW)
# ========================================
log "[3/12] Configurando firewall..."

# Configuración básica
ufw default deny incoming
ufw default allow outgoing

# Permitir servicios esenciales
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# BLOQUEAR PUERTOS DE MINING POOLS
warning "   Bloqueando puertos de mining pools..."
MINING_PORTS=(3333 4444 5555 7777 8888 14444 45560)
for port in "${MINING_PORTS[@]}"; do
    ufw deny out "$port"/tcp comment "Block mining pool"
    ufw deny out "$port"/udp comment "Block mining pool"
done

# Limitar intentos de conexión SSH (anti-brute force)
ufw limit ssh/tcp

# Activar firewall
ufw --force enable

log "   ✅ Firewall configurado"

# ========================================
# 4. CONFIGURAR FAIL2BAN
# ========================================
log "[4/12] Configurando fail2ban..."

systemctl enable fail2ban
systemctl start fail2ban

# Configuración personalizada para SSH
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
EOF

systemctl restart fail2ban
log "   ✅ Fail2ban configurado"

# ========================================
# 5. HARDENING SSH
# ========================================
log "[5/12] Aplicando hardening a SSH..."

# Backup de configuración original
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Configuraciones de seguridad
cat >> /etc/ssh/sshd_config <<EOF

# === HARDENING COBRA 2.0 ===
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
MaxAuthTries 3
MaxSessions 2
ClientAliveInterval 300
ClientAliveCountMax 2
Protocol 2
EOF

log "   ✅ SSH configurado"

# ========================================
# 6. DESHABILITAR EJECUCIÓN EN /tmp
# ========================================
log "[6/12] Deshabilitando ejecución en directorios temporales..."

# Remontar /tmp con noexec
if ! grep -q "/tmp" /etc/fstab; then
    echo "tmpfs /tmp tmpfs defaults,noexec,nosuid,nodev 0 0" >> /etc/fstab
    mount -o remount /tmp 2>/dev/null || true
fi

# Lo mismo para /var/tmp
if ! grep -q "/var/tmp" /etc/fstab; then
    echo "tmpfs /var/tmp tmpfs defaults,noexec,nosuid,nodev 0 0" >> /etc/fstab
    mount -o remount /var/tmp 2>/dev/null || true
fi

log "   ✅ Ejecución deshabilitada en /tmp y /var/tmp"

# ========================================
# 7. CONFIGURAR LÍMITES DE RECURSOS
# ========================================
log "[7/12] Configurando límites de recursos..."

# Prevenir fork bombs y uso excesivo de CPU
cat >> /etc/security/limits.conf <<EOF

# === LÍMITES COBRA 2.0 ===
* soft nproc 1024
* hard nproc 2048
* soft nofile 4096
* hard nofile 8192
* soft cpu 60
* hard cpu 120
EOF

log "   ✅ Límites de recursos configurados"

# ========================================
# 8. CONFIGURAR AUDITD (MONITOREO)
# ========================================
log "[8/12] Configurando auditd..."

systemctl enable auditd
systemctl start auditd

# Reglas de auditoría
cat > /etc/audit/rules.d/cobra.rules <<EOF
# Monitorear cambios en archivos críticos
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/ssh/sshd_config -p wa -k sshd
-w /etc/crontab -p wa -k cron
-w /var/www/cobra -p wa -k webapp

# Monitorear ejecución de comandos sospechosos
-a always,exit -F arch=b64 -S execve -F path=/usr/bin/wget -k suspicious
-a always,exit -F arch=b64 -S execve -F path=/usr/bin/curl -k suspicious
-a always,exit -F arch=b64 -S execve -F path=/bin/nc -k suspicious
EOF

service auditd restart
log "   ✅ Auditd configurado"

# ========================================
# 9. CONFIGURAR ACTUALIZACIONES AUTOMÁTICAS
# ========================================
log "[9/12] Configurando actualizaciones automáticas..."

cat > /etc/apt/apt.conf.d/50unattended-upgrades <<EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

systemctl enable unattended-upgrades
systemctl start unattended-upgrades

log "   ✅ Actualizaciones automáticas configuradas"

# ========================================
# 10. CONFIGURAR MONITOREO DE MALWARE
# ========================================
log "[10/12] Configurando monitoreo de malware..."

# Instalar cron job para monitor-malware.sh
CRON_JOB="*/5 * * * * /var/www/cobra/monitor-malware.sh >> /var/log/malware-monitor.log 2>&1"

# Verificar si ya existe
if ! crontab -l 2>/dev/null | grep -q "monitor-malware.sh"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    log "   ✅ Monitoreo de malware programado (cada 5 minutos)"
else
    log "   ℹ️  Monitoreo de malware ya configurado"
fi

# Hacer ejecutable el script
chmod +x /var/www/cobra/monitor-malware.sh

# ========================================
# 11. PROTECCIÓN ESPECÍFICA REACT2SHELL
# ========================================
log "[11/12] Aplicando protecciones contra React2Shell..."

# Crear regla de firewall para bloquear patrones de ataque
# (esto es una capa adicional, el parche es lo más importante)

# Configurar rate limiting en nginx (si existe)
if [ -f /etc/nginx/nginx.conf ]; then
    warning "   Configurando rate limiting en nginx..."
    
    # Verificar si ya existe la configuración
    if ! grep -q "limit_req_zone" /etc/nginx/nginx.conf; then
        # Agregar rate limiting al bloque http
        sed -i '/http {/a \    # Rate limiting para protección React2Shell\n    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;\n    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;' /etc/nginx/nginx.conf
        
        systemctl reload nginx
        log "   ✅ Rate limiting configurado en nginx"
    fi
fi

# ========================================
# 12. VERIFICACIÓN FINAL
# ========================================
log "[12/12] Verificando configuración..."

# Verificar servicios
SERVICES=("fail2ban" "ufw" "auditd" "unattended-upgrades")
for service in "${SERVICES[@]}"; do
    if systemctl is-active --quiet "$service"; then
        log "   ✅ $service: activo"
    else
        warning "   ⚠️  $service: inactivo"
    fi
done

# Reiniciar SSH
log "Reiniciando SSH..."
systemctl restart sshd

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ HARDENING COMPLETADO EXITOSAMENTE${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  ACCIONES CRÍTICAS PENDIENTES:${NC}"
echo ""
echo "1. 🔑 ROTAR TODAS LAS CREDENCIALES:"
echo "   - Contraseñas de usuarios"
echo "   - Claves SSH"
echo "   - Variables de entorno (.env.local)"
echo "   - Tokens de API"
echo "   - Contraseñas de base de datos"
echo ""
echo "2. 🔍 VERIFICAR CLAVES SSH:"
echo "   - cat ~/.ssh/authorized_keys"
echo "   - Eliminar claves desconocidas"
echo ""
echo "3. 📊 MONITOREAR SISTEMA:"
echo "   - tail -f /var/log/malware-monitor.log"
echo "   - tail -f /var/log/auth.log"
echo "   - pm2 monit"
echo ""
echo "4. 🛡️  EJECUTAR ESCANEO:"
echo "   - sudo rkhunter --check"
echo "   - sudo chkrootkit"
echo ""
echo "5. 📋 REVISAR LOGS DE AUDITORÍA:"
echo "   - ausearch -k suspicious"
echo "   - ausearch -k webapp"
echo ""
warning "⚠️  IMPORTANTE: Mantén esta sesión SSH abierta y prueba"
warning "   la conexión SSH en otra terminal antes de cerrar."
echo ""
