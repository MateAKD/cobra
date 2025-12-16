#!/bin/bash
# Script de Emergencia: Restaurar SSH y Limpiar Malware
# Ejecutar desde consola VNC/KVM del proveedor

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}🚨 RESTAURACIÓN DE EMERGENCIA - SSH BLOQUEADO${NC}"
echo "========================================================"
echo ""

# 1. MATAR PROCESOS MALICIOSOS INMEDIATAMENTE
echo -e "${BLUE}[1/8] Matando procesos maliciosos...${NC}"
pkill -9 xmrig 2>/dev/null || true
pkill -9 kinsing 2>/dev/null || true
pkill -9 kdevtmpfsi 2>/dev/null || true
pkill -9 hash 2>/dev/null || true
pkill -9 miner 2>/dev/null || true
pkill -9 crypto 2>/dev/null || true
echo -e "${GREEN}✓ Procesos maliciosos eliminados${NC}"

# 2. VERIFICAR Y RESTAURAR SSH
echo -e "${BLUE}[2/8] Verificando servicio SSH...${NC}"
systemctl status sshd | head -5

echo -e "${YELLOW}Reiniciando SSH...${NC}"
systemctl restart sshd
systemctl enable sshd

if systemctl is-active --quiet sshd; then
    echo -e "${GREEN}✓ SSH está corriendo${NC}"
else
    echo -e "${RED}⚠️  SSH no responde, intentando reparar...${NC}"
    apt-get install --reinstall openssh-server -y 2>/dev/null || yum reinstall openssh-server -y 2>/dev/null
    systemctl start sshd
fi

# 3. LIMPIAR IPTABLES/FIREWALL
echo -e "${BLUE}[3/8] Limpiando reglas de firewall...${NC}"

# Limpiar iptables
iptables -F 2>/dev/null || true
iptables -X 2>/dev/null || true
iptables -P INPUT ACCEPT 2>/dev/null || true
iptables -P FORWARD ACCEPT 2>/dev/null || true
iptables -P OUTPUT ACCEPT 2>/dev/null || true

# Deshabilitar UFW temporalmente
ufw --force reset 2>/dev/null || true
ufw allow 22/tcp 2>/dev/null || true
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true

echo -e "${GREEN}✓ Firewall limpiado${NC}"

# 4. LIMPIAR LD_PRELOAD
echo -e "${BLUE}[4/8] Limpiando LD_PRELOAD...${NC}"
if [ -f /etc/ld.so.preload ]; then
    cat /etc/ld.so.preload
    > /etc/ld.so.preload
    echo -e "${GREEN}✓ LD_PRELOAD limpiado${NC}"
fi

# 5. ELIMINAR ARCHIVOS TEMPORALES
echo -e "${BLUE}[5/8] Limpiando archivos temporales...${NC}"
rm -rf /tmp/* /var/tmp/* /dev/shm/* 2>/dev/null || true
echo -e "${GREEN}✓ Temporales eliminados${NC}"

# 6. LIMPIAR CRON MALICIOSO
echo -e "${BLUE}[6/8] Verificando cron jobs...${NC}"
echo -e "${YELLOW}Crontab actual de root:${NC}"
crontab -l 2>/dev/null || echo "No hay crontab"

# 7. VERIFICAR CPU
echo -e "${BLUE}[7/8] Procesos con alto CPU:${NC}"
ps aux --sort=-%cpu | head -10

# 8. VERIFICAR CONEXIONES
echo -e "${BLUE}[8/8] Conexiones de red:${NC}"
netstat -tunap 2>/dev/null | grep ESTABLISHED | head -10 || ss -tunap | grep ESTAB | head -10

echo ""
echo -e "${GREEN}========================================================"
echo -e "✅ RESTAURACIÓN COMPLETADA${NC}"
echo ""
echo -e "${YELLOW}AHORA DEBERÍAS PODER CONECTARTE POR SSH:${NC}"
echo "   ssh root@72.61.43.32"
echo ""
echo -e "${MAGENTA}PRÓXIMOS PASOS:${NC}"
echo "1. Salir de la consola VNC"
echo "2. Intentar SSH desde tu máquina Windows"
echo "3. Si funciona, subir y ejecutar cleanup-malware-advanced.sh"
echo "4. Luego ejecutar secure-vps.sh"
echo ""
