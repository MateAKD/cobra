#!/bin/bash

# Script de Hardening de Seguridad para VPS
# Uso: sudo ./harden-security.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔒 INICIANDO HARDENING DE SEGURIDAD${NC}"
echo "================================================"

# 1. Actualizar sistema
echo -e "${BLUE}[1/7] Actualizando sistema...${NC}"
apt update && apt upgrade -y

# 2. Instalar fail2ban
echo -e "${BLUE}[2/7] Instalando fail2ban...${NC}"
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# 3. Configurar firewall (UFW)
echo -e "${BLUE}[3/7] Configurando firewall...${NC}"
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 4. Deshabilitar login root por SSH
echo -e "${BLUE}[4/7] Deshabilitando login root por SSH...${NC}"
sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# 5. Deshabilitar autenticación por contraseña (solo SSH keys)
echo -e "${YELLOW}[5/7] ⚠️  ADVERTENCIA: Esto deshabilitará login por contraseña${NC}"
echo -e "${YELLOW}Asegúrate de tener SSH keys configuradas antes de continuar${NC}"
read -p "¿Continuar? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
    echo -e "${GREEN}✓ Autenticación por contraseña deshabilitada${NC}"
else
    echo -e "${YELLOW}⊘ Saltando este paso${NC}"
fi

# 6. Configurar actualizaciones automáticas de seguridad
echo -e "${BLUE}[6/7] Configurando actualizaciones automáticas...${NC}"
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# 7. Reiniciar SSH
echo -e "${BLUE}[7/7] Reiniciando SSH...${NC}"
systemctl restart sshd

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ HARDENING COMPLETADO${NC}"
echo ""
echo -e "${YELLOW}RECORDATORIOS IMPORTANTES:${NC}"
echo "1. Cambia TODAS las contraseñas (SSH, sudo, DB)"
echo "2. Revisa ~/.ssh/authorized_keys para claves sospechosas"
echo "3. Monitorea logs: tail -f /var/log/auth.log"
echo "4. Considera usar 2FA para SSH"
