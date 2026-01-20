# 🛡️ GUÍA DE SEGURIDAD - COBRA 2.0

## 📋 Resumen del Incidente

**Vulnerabilidad:** CVE-2025-55182 (React2Shell)  
**Severidad:** CRÍTICA (CVSS 10.0)  
**Impacto:** Ejecución remota de código sin autenticación  
**Afecta a:** Next.js 15.x (con App Router) y React 19.x  

---

## 🚨 RESPUESTA INMEDIATA

### Orden de Ejecución de Scripts

Sigue este orden **EXACTAMENTE**:

```bash
# 1. LIMPIEZA (primero)
sudo bash deep-malware-cleanup.sh

# 2. PARCHE DE SEGURIDAD (segundo)
sudo bash security-patch-react2shell.sh

# 3. HARDENING (tercero)
sudo bash harden-security.sh

# 4. VERIFICACIÓN (cuarto)
bash verify-security.sh
```

---

## 📁 Scripts Disponibles

### 1️⃣ `deep-malware-cleanup.sh`
**Propósito:** Limpieza profunda de malware  
**Tiempo estimado:** 5-10 minutos  
**Requiere sudo:** ✅ Sí

**Qué hace:**
- ✅ Mata procesos maliciosos (hash, kdevtmpfsi, kinsing, xmrig, etc.)
- ✅ Busca y elimina archivos maliciosos en todo el sistema
- ✅ Verifica cron jobs sospechosos
- ✅ Revisa servicios systemd maliciosos
- ✅ Detecta conexiones a puertos de mining
- ✅ Limpia directorios temporales
- ✅ Verifica claves SSH
- ✅ Mueve archivos sospechosos a cuarentena

**Uso:**
```bash
sudo bash deep-malware-cleanup.sh
```

**Output:**
- Log: `/var/log/malware-cleanup-YYYYMMDD-HHMMSS.log`
- Cuarentena: `/var/quarantine/YYYYMMDD-HHMMSS/`

---

### 2️⃣ `security-patch-react2shell.sh`
**Propósito:** Parchear CVE-2025-55182  
**Tiempo estimado:** 10-20 minutos  
**Requiere sudo:** ✅ Sí

**Qué hace:**
- ✅ Detiene la aplicación PM2
- ✅ Crea backup de package.json
- ✅ Actualiza Next.js a versión segura (≥15.2.6)
- ✅ Actualiza React a versión segura (≥19.2.1)
- ✅ Limpia cache y reconstruye
- ✅ Reinicia la aplicación

**Uso:**
```bash
sudo bash security-patch-react2shell.sh
```

**Versiones objetivo:**
- Next.js: 15.2.6+ (o 15.3.6+, 15.4.8+, etc.)
- React: 19.2.1+

---

### 3️⃣ `harden-security.sh`
**Propósito:** Hardening completo del VPS  
**Tiempo estimado:** 20-30 minutos  
**Requiere sudo:** ✅ Sí

**Qué hace:**
- ✅ Actualiza el sistema
- ✅ Instala herramientas de seguridad (fail2ban, rkhunter, chkrootkit, auditd)
- ✅ Configura firewall UFW
- ✅ Bloquea puertos de mining (3333, 4444, 5555, 7777, 8888, 14444)
- ✅ Configura fail2ban para SSH
- ✅ Hardening SSH (deshabilita root, passwords)
- ✅ Deshabilita ejecución en /tmp y /var/tmp
- ✅ Configura límites de recursos
- ✅ Configura auditd para monitoreo
- ✅ Programa monitoreo automático de malware
- ✅ Configura rate limiting en nginx

**Uso:**
```bash
sudo bash harden-security.sh
```

**⚠️ IMPORTANTE:** Este script deshabilitará el login por contraseña SSH. Asegúrate de tener claves SSH configuradas antes de ejecutarlo.

---

### 4️⃣ `verify-security.sh`
**Propósito:** Verificar que el sistema está limpio  
**Tiempo estimado:** 2-3 minutos  
**Requiere sudo:** ❌ No (pero recomendado)

**Qué verifica:**
- ✅ Procesos maliciosos
- ✅ Uso de CPU
- ✅ Archivos maliciosos
- ✅ Versiones de Next.js y React
- ✅ Servicios de seguridad (fail2ban, ufw, auditd)
- ✅ Conexiones a puertos de mining
- ✅ Cron jobs sospechosos
- ✅ Claves SSH
- ✅ Estado de PM2
- ✅ Directorios temporales
- ✅ Logs de acceso SSH

**Uso:**
```bash
bash verify-security.sh
```

**Exit codes:**
- `0`: Todo OK
- `>0`: Número de problemas encontrados

---

### 5️⃣ `monitor-malware.sh`
**Propósito:** Monitoreo continuo de malware  
**Tiempo estimado:** <1 minuto (se ejecuta cada 5 minutos)  
**Requiere sudo:** ✅ Sí (para cron)

**Qué hace:**
- ✅ Verifica procesos maliciosos cada 5 minutos
- ✅ Mata procesos sospechosos automáticamente
- ✅ Detecta uso alto de CPU
- ✅ Verifica conexiones a puertos de mining
- ✅ Reinicia aplicación si está caída

**Uso manual:**
```bash
sudo bash monitor-malware.sh
```

**Configuración automática:**
El script `harden-security.sh` lo programa automáticamente en cron.

**Ver logs:**
```bash
tail -f /var/log/malware-monitor.log
```

---

## 📖 Documentos de Referencia

### `QUICK-RESPONSE-GUIDE.md`
Guía rápida de respuesta con comandos específicos y tiempos estimados.  
**Ideal para:** Respuesta rápida durante el incidente.

### `INCIDENT-RESPONSE-CHECKLIST.md`
Checklist completo paso a paso para responder al incidente.  
**Ideal para:** Seguimiento detallado de todas las acciones.

---

## 🔄 Flujo de Trabajo Completo

```
┌─────────────────────────────────────────────┐
│  1. INICIAR VPS Y CONECTARSE VÍA SSH       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. EVALUACIÓN RÁPIDA                       │
│     - ps aux                                │
│     - top                                   │
│     - netstat                               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. LIMPIEZA PROFUNDA                       │
│     sudo bash deep-malware-cleanup.sh       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. APLICAR PARCHE CVE-2025-55182           │
│     sudo bash security-patch-react2shell.sh │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  5. HARDENING DEL SISTEMA                   │
│     sudo bash harden-security.sh            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  6. ROTAR CREDENCIALES                      │
│     - .env.local                            │
│     - Claves SSH                            │
│     - Contraseñas del sistema               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  7. VERIFICACIÓN                            │
│     bash verify-security.sh                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  8. MONITOREO CONTINUO (24-48 horas)        │
│     - tail -f /var/log/malware-monitor.log  │
│     - pm2 monit                             │
│     - htop                                  │
└─────────────────────────────────────────────┘
```

---

## ⚠️ ACCIONES CRÍTICAS POST-INCIDENTE

### 1. Rotar TODAS las Credenciales

#### Variables de Entorno (.env.local)
```bash
cd /var/www/cobra
nano .env.local
```
Cambiar:
- API keys
- Secrets de sesión
- Tokens de autenticación
- Contraseñas de base de datos

#### Claves SSH
```bash
# En tu máquina local:
ssh-keygen -t ed25519 -C "cobra-vps-$(date +%Y%m%d)"

# Copiar al VPS:
ssh-copy-id -i ~/.ssh/nueva_clave.pub user@72.61.43.32

# En el VPS, eliminar claves antiguas:
nano ~/.ssh/authorized_keys
```

#### Contraseñas del Sistema
```bash
# Cambiar tu contraseña
passwd

# Cambiar contraseña de root
sudo passwd root
```

### 2. Revisar Logs Históricos

```bash
# Logs de acceso nginx (buscar patrones de ataque)
sudo grep "POST" /var/log/nginx/access.log | grep -E "/_next|/api"

# Logs de autenticación
sudo grep "Accepted\|Failed" /var/log/auth.log | tail -50

# Logs de auditoría
sudo ausearch -k suspicious -ts recent
sudo ausearch -k webapp -ts recent
```

### 3. Verificar Integridad de Archivos del Proyecto

```bash
cd /var/www/cobra

# Archivos modificados recientemente
find . -type f -name "*.js" -o -name "*.ts" -mtime -7 -ls

# Archivos ejecutables (no debería haber ninguno)
find . -type f -executable

# Comparar con repositorio Git
git status
git diff
```

---

## 📊 Monitoreo Continuo

### Comandos Útiles

```bash
# Ver estado de PM2
pm2 status
pm2 monit

# Ver logs de la aplicación
pm2 logs cobra-app --lines 100

# Ver uso de recursos
htop

# Ver conexiones de red
netstat -tupn | grep ESTABLISHED

# Ver logs de malware
tail -f /var/log/malware-monitor.log

# Ver logs de fail2ban
sudo tail -f /var/log/fail2ban.log

# Ver logs de autenticación
sudo tail -f /var/log/auth.log

# Ver eventos de auditoría
sudo ausearch -k suspicious -ts today
sudo ausearch -k webapp -ts today
```

### Métricas Normales

- **CPU:** < 30% en reposo
- **Memoria:** < 70% de uso
- **Procesos PM2:** 1 instancia de cobra-app en estado "online"
- **Conexiones:** Solo a puertos 80, 443, y SSH

---

## 🔍 Señales de Reinfección

⚠️ **Ejecutar limpieza nuevamente si ves:**

1. **CPU > 80%** sostenido
2. **Procesos con nombres sospechosos:** hash, kdevtmpfsi, kinsing, xmrig
3. **Conexiones a puertos de mining:** 3333, 4444, 5555, 7777, 8888
4. **Archivos nuevos en /tmp o /var/tmp**
5. **Cron jobs no autorizados**
6. **Múltiples instancias de PM2**

---

## 📞 Recursos y Contactos

### Documentación Oficial
- [CVE-2025-55182 Advisory](https://react.dev/blog/2025/12/04/react-19-security-update)
- [Next.js Security Update](https://nextjs.org/blog/security-update-react2shell)
- [Vercel Fix Script](https://vercel.com/blog/security-update-react2shell)

### Herramientas de Seguridad
- [rkhunter](http://rkhunter.sourceforge.net/)
- [chkrootkit](http://www.chkrootkit.org/)
- [fail2ban](https://www.fail2ban.org/)
- [AIDE](https://aide.github.io/)

---

## 🎯 Checklist Final

- [ ] VPS iniciado y accesible
- [ ] Limpieza profunda ejecutada
- [ ] Parche CVE-2025-55182 aplicado
- [ ] Next.js ≥ 15.2.6
- [ ] React ≥ 19.2.1
- [ ] Hardening ejecutado
- [ ] Firewall activo
- [ ] Fail2ban activo
- [ ] Monitoreo automático programado
- [ ] Variables de entorno rotadas
- [ ] Claves SSH rotadas
- [ ] Contraseñas del sistema cambiadas
- [ ] Aplicación funcionando correctamente
- [ ] CPU normal (< 30%)
- [ ] No hay conexiones sospechosas
- [ ] Verificación de seguridad pasada
- [ ] Escaneo de rootkits ejecutado
- [ ] Logs revisados
- [ ] Monitoreo continuo activo

---

**Última actualización:** 2025-12-10  
**Versión:** 1.0  
**Mantenedor:** Mateo
