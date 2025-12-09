#!/bin/bash

# Script para configurar Swap en VPS
# Uso: sudo ./setup-swap.sh

set -e

SWAP_SIZE="4G"
SWAP_FILE="/swapfile"

echo "🛠️  Configurando Swap de ${SWAP_SIZE}..."

# 1. Verificar si ya existe swap
if grep -q "${SWAP_FILE}" /proc/swaps; then
    echo "✅  Swap ya está activo."
    free -h
    exit 0
fi

# 2. Crear archivo swap
echo "📦 Creando archivo swap..."
fallocate -l ${SWAP_SIZE} ${SWAP_FILE}
chmod 600 ${SWAP_FILE}

# 3. Formatear como swap
echo "🔧 Formateando swap..."
mkswap ${SWAP_FILE}

# 4. Activar swap
echo "🚀 Activando swap..."
swapon ${SWAP_FILE}

# 5. Hacer persistente
if ! grep -q "${SWAP_FILE}" /etc/fstab; then
    echo "💾 Guardando configuración en /etc/fstab..."
    echo "${SWAP_FILE} none swap sw 0 0" | tee -a /etc/fstab
fi

# 6. Ajustar swappiness (opcional, bueno para servidores web)
sysctl vm.swappiness=10
echo "vm.swappiness=10" >> /etc/sysctl.conf

echo "✅  Setup de Swap completado!"
free -h
