#!/bin/bash

# Script de Limpieza de Emergencia - Cobra 2.0
# Elimina malware y restaura el servidor

set -e

echo "🚨 INICIANDO LIMPIEZA DE EMERGENCIA..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. DETENER TODOS LOS PROCESOS MALICIOSOS
echo -e "${RED}🔪 Matando procesos maliciosos...${NC}"
sudo pkill -9 hash 2>/dev/null || true
sudo pkill -9 kdevtmpfsi 2>/dev/null || true
sudo pkill -9 kinsing 2>/dev/null || true
sudo pkill -9 xmrig 2>/dev/null || true

# 2. ELIMINAR ARCHIVOS MALICIOSOS DEL PROYECTO
echo -e "${RED}🗑️  Eliminando archivos maliciosos del proyecto...${NC}"
cd /var/www/cobra
sudo rm -f hash kdevtmpfsi kinsing xmrig 2>/dev/null || true
sudo find . -name ".*hash*" -type f -delete 2>/dev/null || true
sudo find . -name "*miner*" -type f -delete 2>/dev/null || true

# 3. BUSCAR Y ELIMINAR MALWARE EN TODO EL SISTEMA
echo -e "${RED}🔍 Buscando malware en el sistema...${NC}"
sudo find /tmp -name "hash" -o -name "kdevtmpfsi" -o -name "kinsing" 2>/dev/null | xargs sudo rm -f 2>/dev/null || true
sudo find /var/tmp -name "hash" -o -name "kdevtmpfsi" -o -name "kinsing" 2>/dev/null | xargs sudo rm -f 2>/dev/null || true
sudo find /dev/shm -name "hash" -o -name "kdevtmpfsi" -o -name "kinsing" 2>/dev/null | xargs sudo rm -f 2>/dev/null || true

# 4. LIMPIAR CRONTABS MALICIOSOS
echo -e "${YELLOW}🕐 Limpiando crontabs...${NC}"
crontab -r 2>/dev/null || true
sudo crontab -r 2>/dev/null || true

# 5. VERIFICAR Y LIMPIAR SYSTEMD TIMERS MALICIOSOS
echo -e "${YELLOW}⏰ Verificando systemd timers...${NC}"
sudo systemctl list-timers --all | grep -E "hash|kdevtmpfsi|kinsing" | awk '{print $NF}' | xargs -r sudo systemctl disable 2>/dev/null || true

# 6. CONFIGURAR SWAP (CRÍTICO)
echo -e "${GREEN}💾 Configurando SWAP...${NC}"
if ! grep -q "/swapfile" /proc/swaps; then
    cd /var/www/cobra
    sudo chmod +x setup-swap.sh
    sudo ./setup-swap.sh
else
    echo "✅ SWAP ya está configurado"
fi

# 7. VERIFICAR SWAP
echo -e "${GREEN}📊 Estado de memoria:${NC}"
free -h

# 8. ENDURECER SEGURIDAD
echo -e "${GREEN}🔒 Aplicando medidas de seguridad...${NC}"
cd /var/www/cobra
sudo chmod +x harden-security.sh
sudo ./harden-security.sh

# 9. LIMPIAR PM2
echo -e "${YELLOW}🔄 Limpiando PM2...${NC}"
pm2 delete all 2>/dev/null || true
pm2 flush
pm2 kill

# 10. VERIFICAR QUE NO HAY PROCESOS EN PUERTO 3000
echo -e "${YELLOW}🔍 Verificando puerto 3000...${NC}"
sudo lsof -ti:3000 | xargs -r sudo kill -9 2>/dev/null || true

# 11. RECONSTRUIR LA APLICACIÓN
echo -e "${GREEN}🔨 Reconstruyendo aplicación...${NC}"
cd /var/www/cobra
npm run build

# 12. INICIAR LA APLICACIÓN CON PM2
echo -e "${GREEN}🚀 Iniciando aplicación...${NC}"
pm2 start ecosystem.config.js
pm2 save

# 13. CONFIGURAR MONITOREO
echo -e "${GREEN}📊 Configurando monitoreo automático...${NC}"
(crontab -l 2>/dev/null | grep -v monitor-cpu.sh; echo "*/5 * * * * /home/deploy/monitor-cpu.sh") | crontab -

# 14. VERIFICAR ESTADO FINAL
echo ""
echo -e "${GREEN}✅ LIMPIEZA COMPLETADA${NC}"
echo ""
echo "📊 Estado de PM2:"
pm2 status
echo ""
echo "💾 Estado de memoria:"
free -h
echo ""
echo "🔍 Procesos sospechosos:"
ps aux | grep -E "hash|kdevtmpfsi|kinsing|xmrig" | grep -v grep || echo "✅ No se encontraron procesos maliciosos"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Monitorea el servidor en las próximas horas${NC}"
echo -e "${YELLOW}⚠️  Si el CPU vuelve a subir, ejecuta: ps aux --sort=-%cpu | head -20${NC}"
