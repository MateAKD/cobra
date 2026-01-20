# 🚨 GUÍA DE RESPUESTA RÁPIDA - MALWARE VPS

## ⚡ ACCIONES INMEDIATAS (Primeros 5 minutos)

### 1. Iniciar VPS y Conectarse
```bash
# Desde tu panel de Hostinger/proveedor:
# - Iniciar VPS
# - Conectarse vía SSH inmediatamente

ssh user@72.61.43.32
```

### 2. Evaluación Rápida
```bash
# Ver procesos con alto CPU
ps aux --sort=-%cpu | head -10

# Ver conexiones activas
netstat -tupn | grep ESTABLISHED

# Ver uso de recursos
htop
```

### 3. Detener Aplicación y Procesos Sospechosos
```bash
cd /var/www/cobra

# Detener PM2
pm2 stop all
pm2 kill

# Matar procesos maliciosos conocidos
sudo pkill -9 hash
sudo pkill -9 kdevtmpfsi
sudo pkill -9 kinsing
sudo pkill -9 xmrig
```

---

## 🧹 LIMPIEZA (Siguientes 15 minutos)

### 4. Ejecutar Limpieza Profunda
```bash
cd /var/www/cobra
sudo bash deep-malware-cleanup.sh
```

**Este script:**
- ✅ Mata procesos maliciosos
- ✅ Busca y elimina archivos maliciosos
- ✅ Verifica cron jobs sospechosos
- ✅ Revisa conexiones de red
- ✅ Limpia directorios temporales

### 5. Revisar Log de Limpieza
```bash
# El script generará un log, revisarlo:
cat /var/log/malware-cleanup-*.log
```

---

## 🔒 PARCHAR VULNERABILIDAD (Siguientes 20 minutos)

### 6. Aplicar Parche CVE-2025-55182
```bash
cd /var/www/cobra
sudo bash security-patch-react2shell.sh
```

**Este script:**
- ✅ Actualiza Next.js a 15.2.6+
- ✅ Actualiza React a 19.2.1+
- ✅ Reconstruye la aplicación
- ✅ Reinicia PM2

### 7. Verificar Versiones
```bash
# Verificar que las versiones son seguras
node -p "require('./package.json').dependencies.next"
# Debe ser >= 15.2.6

node -p "require('./package.json').dependencies.react"
# Debe ser >= 19.2.1
```

---

## 🛡️ HARDENING (Siguientes 30 minutos)

### 8. Ejecutar Hardening Completo
```bash
sudo bash harden-security.sh
```

**Este script:**
- ✅ Configura firewall (UFW)
- ✅ Bloquea puertos de mining
- ✅ Configura fail2ban
- ✅ Hardening SSH
- ✅ Deshabilita ejecución en /tmp
- ✅ Configura auditd
- ✅ Programa monitoreo automático

### 9. Verificar Servicios de Seguridad
```bash
# Verificar que todo está activo
sudo systemctl status fail2ban
sudo systemctl status ufw
sudo systemctl status auditd

# Verificar firewall
sudo ufw status
```

---

## 🔑 ROTAR CREDENCIALES (Siguientes 15 minutos)

### 10. Cambiar Variables de Entorno
```bash
cd /var/www/cobra
nano .env.local
```

**Cambiar TODO:**
- API keys
- Secrets de sesión
- Tokens
- Contraseñas de DB

### 11. Generar Nuevas Claves SSH (en tu máquina local)
```bash
# En tu computadora local:
ssh-keygen -t ed25519 -C "cobra-vps-$(date +%Y%m%d)"

# Copiar al VPS
ssh-copy-id -i ~/.ssh/nueva_clave.pub user@72.61.43.32
```

### 12. Limpiar Claves SSH Antiguas (en el VPS)
```bash
# En el VPS:
nano ~/.ssh/authorized_keys
# Eliminar claves antiguas, dejar solo la nueva
```

### 13. Cambiar Contraseñas del Sistema
```bash
# Cambiar tu contraseña
passwd

# Cambiar contraseña de root (si aplica)
sudo passwd root
```

---

## ✅ VERIFICACIÓN (Siguientes 10 minutos)

### 14. Reconstruir y Reiniciar Aplicación
```bash
cd /var/www/cobra

# Limpiar cache
rm -rf .next
rm -rf node_modules/.cache

# Build limpio
pnpm build

# Reiniciar
pm2 restart ecosystem.config.js
pm2 save
```

### 15. Verificar que Todo Funciona
```bash
# Ver estado de PM2
pm2 status

# Ver logs
pm2 logs cobra-app --lines 50

# Verificar CPU
htop

# Probar el sitio
curl -I http://72.61.43.32
```

**Verificar:**
- ✅ CPU < 30%
- ✅ Aplicación "online" en PM2
- ✅ No hay errores en logs
- ✅ Sitio web accesible

---

## 📊 MONITOREO (Continuo)

### 16. Configurar Monitoreo en Tiempo Real
```bash
# Terminal 1: Logs de malware
tail -f /var/log/malware-monitor.log

# Terminal 2: PM2 monitoring
pm2 monit

# Terminal 3: Logs de autenticación
sudo tail -f /var/log/auth.log
```

### 17. Verificar Cron de Monitoreo
```bash
# Verificar que el monitoreo automático está activo
crontab -l | grep monitor-malware
# Debe mostrar: */5 * * * * /var/www/cobra/monitor-malware.sh
```

---

## 🔍 ESCANEO DE SEGURIDAD (Opcional pero recomendado)

### 18. Escanear Rootkits
```bash
# Actualizar y escanear con rkhunter
sudo rkhunter --update
sudo rkhunter --check --skip-keypress

# Escanear con chkrootkit
sudo chkrootkit
```

---

## ⚠️ SEÑALES DE ALERTA

### 🚨 Reiniciar proceso si ves:

1. **CPU > 80%** después de 10 minutos
   ```bash
   ps aux --sort=-%cpu | head -10
   # Identificar y matar proceso sospechoso
   ```

2. **Conexiones a puertos de mining** (3333, 4444, 5555, 7777, 8888)
   ```bash
   netstat -tupn | grep -E "3333|4444|5555|7777|8888"
   ```

3. **Procesos con nombres sospechosos**
   ```bash
   ps aux | grep -E "hash|kdevtmpfsi|kinsing|xmrig"
   ```

4. **Archivos nuevos en /tmp o /var/tmp**
   ```bash
   find /tmp /var/tmp -type f -mmin -60
   ```

---

## 📞 CONTACTOS DE EMERGENCIA

- **Proveedor VPS:** [Panel de control Hostinger]
- **Soporte:** [Email/Chat del proveedor]
- **Documentación CVE:** https://react.dev/blog/2025/12/04/react-19-security-update

---

## 📋 CHECKLIST RÁPIDO

- [ ] VPS iniciado y accesible
- [ ] Aplicación detenida
- [ ] Procesos maliciosos eliminados
- [ ] Limpieza profunda ejecutada
- [ ] Parche CVE-2025-55182 aplicado
- [ ] Versiones verificadas (Next.js ≥15.2.6, React ≥19.2.1)
- [ ] Hardening ejecutado
- [ ] Firewall activo
- [ ] Fail2ban activo
- [ ] Variables de entorno rotadas
- [ ] Claves SSH rotadas
- [ ] Contraseñas del sistema cambiadas
- [ ] Aplicación reconstruida
- [ ] Aplicación funcionando
- [ ] CPU normal (< 30%)
- [ ] No hay conexiones sospechosas
- [ ] Monitoreo automático activo
- [ ] Escaneo de seguridad ejecutado

---

## ⏱️ TIEMPO ESTIMADO TOTAL: 90-120 minutos

**Prioridad absoluta:**
1. Limpieza (primeros 20 min)
2. Parche (siguientes 20 min)
3. Hardening (siguientes 30 min)
4. Rotar credenciales (siguientes 15 min)

---

**Última actualización:** 2025-12-10
