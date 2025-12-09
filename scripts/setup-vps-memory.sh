#!/bin/bash

# ==========================================
# Script de Configuración de Memoria SWAP
# ==========================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔄 Iniciando configuración de memoria Swap...${NC}"

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Por favor ejecuta este script como root (usando sudo)${NC}"
  exit 1
fi

# Verificar si ya existe swap
if sudo swapon --show | grep -q "file"; then
    echo -e "${YELLOW}⚠️  Ya existe una memoria swap configurada.${NC}"
    free -h
    exit 0
fi

# Crear archivo swap de 2GB
echo -e "${YELLOW}📦 Creando archivo swap de 2GB...${NC}"
fallocate -l 2G /swapfile
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error fallocate. Intentando con dd...${NC}"
    dd if=/dev/zero of=/swapfile bs=1024 count=2097152
fi

# Permisos seguros
chmod 600 /swapfile

# Configurar como swap
mkswap /swapfile
swapon /swapfile

# Hacer permanente
if ! grep -q "/swapfile" /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    echo -e "${GREEN}✅ Swap agregado a /etc/fstab${NC}"
fi

# Ajustar swappiness (usar RAM preferentemente)
sysctl vm.swappiness=10
echo 'vm.swappiness=10' | tee -a /etc/sysctl.conf

echo -e "${GREEN}🎉 ¡Configuración completada exitosamente!${NC}"
echo -e "${YELLOW}📊 Memoria actual:${NC}"
free -h
