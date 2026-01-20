# 🚨 CHECKLIST DE RESPUESTA A INCIDENTE - CVE-2025-55182

**Fecha del incidente:** 2025-12-10
**Vulnerabilidad:** CVE-2025-55182 (React2Shell)
**Severidad:** CRÍTICA (CVSS 10.0)
**Estado del VPS:** Detenido por detección de malware

---

## ✅ FASE 1: EVALUACIÓN INICIAL (ANTES DE INICIAR EL VPS)

- [ ] **Revisar notificación del proveedor**
  - Identificar qué malware fue detectado
  - Verificar IPs de origen de los ataques
  - Revisar timeline del ataque

- [ ] **Preparar entorno local**
  - Tener acceso SSH listo
  - Tener scripts de limpieza preparados
  - Backup de configuraciones críticas

---

## ✅ FASE 2: INICIAR VPS Y EVALUACIÓN INMEDIATA

### 2.1 Iniciar el VPS
- [ ] Iniciar VPS desde el panel de control del proveedor
- [ ] Conectarse vía SSH inmediatamente
- [ ] Verificar que el sistema responde

### 2.2 Evaluación Rápida del Sistema
```bash
# Verificar procesos en ejecución
ps aux --sort=-%cpu | head -20

# Verificar uso de CPU
top -bn1 | head -20

# Verificar conexiones de red activas
netstat -tupn | grep ESTABLISHED

# Verificar usuarios conectados
who
w
last -20
```

- [ ] **CPU al ____%** (registrar valor)
- [ ] **Procesos sospechosos detectados:** ☐ Sí ☐ No
  - Si sí, listar: _______________________
- [ ] **Conexiones sospechosas:** ☐ Sí ☐ No
  - Si sí, listar IPs: _______________________

---

## ✅ FASE 3: CONTENCIÓN INMEDIATA

### 3.1 Detener Aplicación
```bash
cd /var/www/cobra
pm2 stop all
pm2 kill
```
- [ ] Aplicación detenida
- [ ] PM2 detenido

### 3.2 Matar Procesos Maliciosos
```bash
# Ejecutar script de limpieza profunda
sudo bash deep-malware-cleanup.sh
```
- [ ] Script ejecutado
- [ ] Procesos maliciosos eliminados
- [ ] Log guardado en: _______________________

### 3.3 Bloquear Tráfico Sospechoso
```bash
# Verificar firewall
sudo ufw status

# Si no está activo, activar
sudo ufw enable
```
- [ ] Firewall verificado/activado

---

## ✅ FASE 4: LIMPIEZA PROFUNDA

### 4.1 Buscar y Eliminar Malware
- [ ] Ejecutar `deep-malware-cleanup.sh`
- [ ] Revisar archivos en cuarentena
- [ ] Verificar cron jobs
- [ ] Verificar servicios systemd
- [ ] Limpiar directorios temporales

### 4.2 Verificar Archivos del Proyecto
```bash
cd /var/www/cobra

# Verificar integridad de archivos
find . -type f -name "*.js" -mtime -7 -ls
find . -type f -name "*.ts" -mtime -7 -ls

# Buscar archivos sospechosos
find . -type f -executable
find . -type f -name "hash" -o -name "kdevtmpfsi" -o -name "kinsing"
```
- [ ] Archivos del proyecto verificados
- [ ] No se encontraron archivos sospechosos

### 4.3 Verificar Backdoors
```bash
# Verificar claves SSH
cat ~/.ssh/authorized_keys
sudo cat /root/.ssh/authorized_keys

# Verificar usuarios del sistema
cat /etc/passwd | grep -v "nologin"

# Verificar sudoers
sudo cat /etc/sudoers
```
- [ ] Claves SSH verificadas (solo claves conocidas)
- [ ] No hay usuarios sospechosos
- [ ] Sudoers sin modificaciones

---

## ✅ FASE 5: APLICAR PARCHES DE SEGURIDAD

### 5.1 Actualizar Next.js y React
```bash
cd /var/www/cobra
sudo bash security-patch-react2shell.sh
```
- [ ] Script de parche ejecutado
- [ ] Next.js actualizado a versión: _______
- [ ] React actualizado a versión: _______
- [ ] Build exitoso

**Versiones requeridas:**
- Next.js: ≥ 15.2.6 (si usas 15.x)
- React: ≥ 19.2.1

### 5.2 Verificar Versiones
```bash
node -p "require('./package.json').dependencies.next"
node -p "require('./package.json').dependencies.react"
```
- [ ] Versiones verificadas y seguras

---

## ✅ FASE 6: HARDENING DEL SISTEMA

### 6.1 Ejecutar Script de Hardening
```bash
sudo bash harden-security.sh
```
- [ ] Hardening ejecutado
- [ ] Firewall configurado
- [ ] Fail2ban activo
- [ ] SSH hardening aplicado
- [ ] Ejecución en /tmp deshabilitada
- [ ] Auditd configurado
- [ ] Monitoreo de malware programado

### 6.2 Verificar Servicios de Seguridad
```bash
sudo systemctl status fail2ban
sudo systemctl status ufw
sudo systemctl status auditd
```
- [ ] Todos los servicios activos

---

## ✅ FASE 7: ROTAR CREDENCIALES

### 7.1 Variables de Entorno
```bash
cd /var/www/cobra
nano .env.local
```
- [ ] Regenerar todas las API keys
- [ ] Cambiar secrets de sesión
- [ ] Actualizar tokens de autenticación
- [ ] Cambiar contraseñas de base de datos (si aplica)

### 7.2 Claves SSH
```bash
# Generar nuevas claves SSH (en tu máquina local)
ssh-keygen -t ed25519 -C "cobra-vps-new"

# Agregar nueva clave al VPS
ssh-copy-id -i ~/.ssh/nueva_clave.pub user@72.61.43.32

# Eliminar claves antiguas del VPS
nano ~/.ssh/authorized_keys
```
- [ ] Nuevas claves SSH generadas
- [ ] Claves antiguas eliminadas
- [ ] Acceso SSH verificado con nuevas claves

### 7.3 Contraseñas del Sistema
```bash
# Cambiar contraseña del usuario
passwd

# Cambiar contraseña de root (si aplica)
sudo passwd root
```
- [ ] Contraseñas del sistema actualizadas

---

## ✅ FASE 8: RECONSTRUIR Y DESPLEGAR

### 8.1 Limpiar y Reconstruir
```bash
cd /var/www/cobra

# Limpiar completamente
rm -rf .next
rm -rf node_modules/.cache

# Reinstalar dependencias (opcional, solo si hay dudas)
# rm -rf node_modules
# pnpm install

# Build limpio
pnpm build
```
- [ ] Cache limpiado
- [ ] Build exitoso
- [ ] No hay errores

### 8.2 Reiniciar Aplicación
```bash
pm2 restart ecosystem.config.js
pm2 save
```
- [ ] Aplicación reiniciada
- [ ] PM2 guardado

### 8.3 Verificar Funcionamiento
```bash
# Verificar estado
pm2 status
pm2 monit

# Verificar logs
pm2 logs cobra-app --lines 50

# Verificar en navegador
curl -I http://72.61.43.32
```
- [ ] Aplicación corriendo
- [ ] No hay errores en logs
- [ ] Sitio web accesible

---

## ✅ FASE 9: MONITOREO POST-INCIDENTE

### 9.1 Configurar Monitoreo Continuo
```bash
# Verificar cron de monitoreo
crontab -l | grep monitor-malware

# Ver logs en tiempo real
tail -f /var/log/malware-monitor.log
```
- [ ] Monitoreo automático activo

### 9.2 Verificar Métricas
```bash
# CPU y memoria
htop

# PM2 monitoring
pm2 monit

# Conexiones de red
watch -n 5 'netstat -tupn | grep ESTABLISHED'
```
- [ ] CPU normal (< 30%)
- [ ] Memoria normal
- [ ] No hay conexiones sospechosas

### 9.3 Revisar Logs de Seguridad
```bash
# Logs de autenticación
sudo tail -f /var/log/auth.log

# Logs de fail2ban
sudo tail -f /var/log/fail2ban.log

# Logs de auditoría
sudo ausearch -k suspicious -ts recent
sudo ausearch -k webapp -ts recent
```
- [ ] No hay intentos de acceso sospechosos
- [ ] No hay actividad maliciosa

---

## ✅ FASE 10: ESCANEO DE SEGURIDAD

### 10.1 Escaneo de Rootkits
```bash
# Actualizar base de datos
sudo rkhunter --update

# Ejecutar escaneo
sudo rkhunter --check --skip-keypress

# Verificar resultados
sudo cat /var/log/rkhunter.log
```
- [ ] Escaneo ejecutado
- [ ] No se encontraron rootkits

### 10.2 Chkrootkit
```bash
sudo chkrootkit
```
- [ ] Escaneo ejecutado
- [ ] No se encontraron amenazas

### 10.3 Verificar Integridad de Archivos (AIDE)
```bash
# Inicializar base de datos (primera vez)
sudo aideinit

# Verificar integridad
sudo aide --check
```
- [ ] Base de datos de integridad creada
- [ ] Verificación programada

---

## ✅ FASE 11: DOCUMENTACIÓN

### 11.1 Registrar Incidente
- [ ] **Fecha y hora del incidente:** _______________________
- [ ] **Malware detectado:** _______________________
- [ ] **Vectores de ataque identificados:** _______________________
- [ ] **Archivos comprometidos:** _______________________
- [ ] **Acciones tomadas:** _______________________
- [ ] **Tiempo total de resolución:** _______________________

### 11.2 Lecciones Aprendidas
- [ ] ¿Qué falló? _______________________
- [ ] ¿Cómo se pudo prevenir? _______________________
- [ ] ¿Qué mejoras implementar? _______________________

---

## ✅ FASE 12: PREVENCIÓN FUTURA

### 12.1 Configurar Alertas
- [ ] Configurar alertas de CPU alto
- [ ] Configurar alertas de conexiones sospechosas
- [ ] Configurar alertas de cambios en archivos críticos

### 12.2 Plan de Respuesta
- [ ] Documentar procedimiento de respuesta
- [ ] Crear backups automáticos
- [ ] Configurar snapshots del VPS

### 12.3 Actualizaciones Automáticas
- [ ] Verificar que unattended-upgrades está activo
- [ ] Configurar notificaciones de actualizaciones

---

## 📋 RESUMEN EJECUTIVO

### Estado Actual
- **VPS:** ☐ Operativo ☐ En mantenimiento ☐ Comprometido
- **Aplicación:** ☐ Funcionando ☐ Detenida ☐ En recuperación
- **Seguridad:** ☐ Parcheada ☐ Vulnerable ☐ En proceso

### Próximos Pasos Críticos
1. ⚠️ **URGENTE:** Aplicar parches de seguridad
2. ⚠️ **URGENTE:** Rotar todas las credenciales
3. ⚠️ **IMPORTANTE:** Monitorear sistema 24-48 horas
4. ⚠️ **IMPORTANTE:** Revisar logs de acceso históricos
5. ⚠️ **RECOMENDADO:** Considerar migración a nuevo VPS limpio

### Contactos de Emergencia
- **Proveedor VPS:** _______________________
- **Soporte técnico:** _______________________
- **Equipo de seguridad:** _______________________

---

## 🔗 RECURSOS ADICIONALES

- [CVE-2025-55182 Advisory](https://react.dev/blog/2025/12/04/react-19-security-update)
- [Next.js Security Update](https://nextjs.org/blog/security-update-react2shell)
- [Vercel Fix Script](https://vercel.com/blog/security-update-react2shell)

---

**Última actualización:** 2025-12-10
**Responsable:** Mateo
**Estado:** ☐ En progreso ☐ Completado ☐ Requiere revisión
