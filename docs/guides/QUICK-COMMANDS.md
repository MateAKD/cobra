# 🚀 COMANDOS RÁPIDOS - RESPUESTA A INCIDENTE

## 📦 TRANSFERIR SCRIPTS AL VPS

```bash
# Desde tu máquina local (Git Bash o WSL)
cd "C:\Users\Mateo\Desktop\AKDMIA\Cobra 2.0"
bash deploy-security-scripts.sh
```

---

## 🔌 CONECTARSE AL VPS

```bash
ssh user@72.61.43.32
cd /var/www/cobra
```

---

## 🧹 LIMPIEZA Y PARCHE (Ejecutar en orden)

```bash
# 1. Limpieza profunda
sudo bash deep-malware-cleanup.sh

# 2. Aplicar parche CVE-2025-55182
sudo bash security-patch-react2shell.sh

# 3. Hardening del sistema
sudo bash harden-security.sh

# 4. Verificar seguridad
bash verify-security.sh
```

---

## 🔍 EVALUACIÓN RÁPIDA

```bash
# Ver procesos con alto CPU
ps aux --sort=-%cpu | head -10

# Ver uso de recursos
htop

# Ver conexiones activas
netstat -tupn | grep ESTABLISHED

# Ver estado de PM2
pm2 status

# Ver logs de la aplicación
pm2 logs cobra-app --lines 50
```

---

## 🛑 DETENER PROCESOS MALICIOSOS

```bash
# Detener aplicación
pm2 stop all
pm2 kill

# Matar procesos maliciosos
sudo pkill -9 hash
sudo pkill -9 kdevtmpfsi
sudo pkill -9 kinsing
sudo pkill -9 xmrig
```

---

## 🔒 ROTAR CREDENCIALES

### Variables de Entorno
```bash
cd /var/www/cobra
nano .env.local
# Cambiar TODO: API keys, secrets, tokens, passwords
```

### Claves SSH (en tu máquina local)
```bash
# Generar nueva clave
ssh-keygen -t ed25519 -C "cobra-vps-$(date +%Y%m%d)"

# Copiar al VPS
ssh-copy-id -i ~/.ssh/nueva_clave.pub user@72.61.43.32
```

### Limpiar Claves Antiguas (en el VPS)
```bash
nano ~/.ssh/authorized_keys
# Eliminar claves antiguas, dejar solo la nueva
```

### Contraseñas del Sistema
```bash
# Cambiar tu contraseña
passwd

# Cambiar contraseña de root
sudo passwd root
```

---

## ✅ VERIFICACIÓN

```bash
# Verificar versiones
node -p "require('./package.json').dependencies.next"
node -p "require('./package.json').dependencies.react"

# Verificar servicios de seguridad
sudo systemctl status fail2ban
sudo systemctl status ufw
sudo systemctl status auditd

# Verificar firewall
sudo ufw status

# Ejecutar verificación completa
bash verify-security.sh
```

---

## 🔄 RECONSTRUIR Y REINICIAR

```bash
cd /var/www/cobra

# Limpiar cache
rm -rf .next
rm -rf node_modules/.cache

# Build limpio
pnpm build

# Reiniciar aplicación
pm2 restart ecosystem.config.js
pm2 save

# Verificar estado
pm2 status
pm2 monit
```

---

## 📊 MONITOREO CONTINUO

```bash
# Logs de malware
tail -f /var/log/malware-monitor.log

# Logs de PM2
pm2 logs cobra-app --lines 100

# Logs de autenticación
sudo tail -f /var/log/auth.log

# Logs de fail2ban
sudo tail -f /var/log/fail2ban.log

# Ver cron jobs
crontab -l

# Ver eventos de auditoría
sudo ausearch -k suspicious -ts today
sudo ausearch -k webapp -ts today
```

---

## 🔍 BUSCAR MALWARE

```bash
# Buscar procesos maliciosos
ps aux | grep -E "hash|kdevtmpfsi|kinsing|xmrig"

# Buscar archivos maliciosos
find /var/www/cobra /tmp /var/tmp -type f \( -name "hash" -o -name "kdevtmpfsi" -o -name "kinsing" \)

# Buscar ejecutables en /tmp
find /tmp /var/tmp /dev/shm -type f -executable

# Buscar conexiones a puertos de mining
netstat -tupn | grep -E "3333|4444|5555|7777|8888|14444"

# Buscar cron jobs sospechosos
crontab -l | grep -E "curl|wget|/tmp|base64"
```

---

## 🛡️ ESCANEO DE SEGURIDAD

```bash
# Actualizar y escanear con rkhunter
sudo rkhunter --update
sudo rkhunter --check --skip-keypress

# Escanear con chkrootkit
sudo chkrootkit

# Ver log de rkhunter
sudo cat /var/log/rkhunter.log
```

---

## 🔥 LIMPIEZA MANUAL (Si los scripts fallan)

```bash
# Matar todos los procesos sospechosos
sudo pkill -9 hash
sudo pkill -9 kdevtmpfsi
sudo pkill -9 kinsing
sudo pkill -9 xmrig
sudo pkill -9 cpuminer
sudo pkill -9 minerd

# Eliminar archivos maliciosos
sudo rm -f /var/www/cobra/hash
sudo rm -f /var/www/cobra/kdevtmpfsi
sudo rm -f /var/www/cobra/kinsing
sudo find /tmp -type f -executable -delete
sudo find /var/tmp -type f -executable -delete
sudo rm -rf /dev/shm/*

# Limpiar cron jobs sospechosos
crontab -e
# Eliminar líneas sospechosas
```

---

## 🚨 EMERGENCIA - DETENER TODO

```bash
# Detener aplicación
pm2 stop all
pm2 kill

# Detener nginx (si está instalado)
sudo systemctl stop nginx

# Activar firewall y bloquear todo
sudo ufw enable
sudo ufw default deny incoming
sudo ufw allow ssh
```

---

## 📋 VERIFICAR ESTADO DEL SISTEMA

```bash
# CPU y memoria
htop

# Espacio en disco
df -h

# Procesos activos
ps aux | wc -l

# Conexiones de red
netstat -tupn | grep ESTABLISHED | wc -l

# Usuarios conectados
who
w

# Últimos logins
last -20

# Intentos de login fallidos
sudo grep "Failed password" /var/log/auth.log | tail -20
```

---

## 🔧 CONFIGURACIÓN DE FIREWALL

```bash
# Ver estado
sudo ufw status verbose

# Permitir servicios
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Bloquear puertos de mining
sudo ufw deny out 3333/tcp
sudo ufw deny out 4444/tcp
sudo ufw deny out 5555/tcp
sudo ufw deny out 7777/tcp
sudo ufw deny out 8888/tcp
sudo ufw deny out 14444/tcp

# Activar
sudo ufw enable
```

---

## 📖 LEER DOCUMENTACIÓN

```bash
# Guía rápida
cat QUICK-RESPONSE-GUIDE.md

# Checklist completo
cat INCIDENT-RESPONSE-CHECKLIST.md

# README de seguridad
cat SECURITY-README.md

# Resumen ejecutivo
cat EXECUTIVE-SUMMARY.md
```

---

## 🎯 CHECKLIST ULTRA-RÁPIDO

```bash
# 1. Limpieza
sudo bash deep-malware-cleanup.sh

# 2. Parche
sudo bash security-patch-react2shell.sh

# 3. Hardening
sudo bash harden-security.sh

# 4. Rotar credenciales
nano .env.local  # Cambiar TODO

# 5. Verificar
bash verify-security.sh

# 6. Monitorear
tail -f /var/log/malware-monitor.log
```

---

## 🆘 CONTACTOS DE EMERGENCIA

- **Proveedor VPS:** [Panel de control]
- **Soporte:** [Email/Chat del proveedor]
- **Documentación CVE:** https://react.dev/blog/2025/12/04/react-19-security-update

---

**Última actualización:** 2025-12-10
