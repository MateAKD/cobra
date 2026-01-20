# 🛡️ GUÍA: PROTEGER TU VPS CON CLOUDFLARE

## ⚠️ POR QUÉ NECESITAS CLOUDFLARE

**Problema actual:**
- Tu servidor está **expuesto directamente a internet**
- Bots automatizados escanean 24/7 buscando vulnerabilidades
- CVE-2025-55182 permite ataques sin credenciales
- **Cualquier atacante puede llegar a tu servidor**

**Solución con Cloudflare:**
```
ANTES:
Internet → Tu VPS (vulnerable)

DESPUÉS:
Internet → Cloudflare (filtra ataques) → Tu VPS (protegido)
```

---

## ✅ BENEFICIOS DE CLOUDFLARE (GRATIS)

1. **🛡️ Protección contra ataques:**
   - Bloquea bots maliciosos automáticamente
   - Protección DDoS
   - WAF (Web Application Firewall)
   - Rate limiting

2. **🚀 Rendimiento:**
   - CDN global (tu sitio más rápido)
   - Cache automático
   - Compresión de archivos

3. **🔒 Seguridad:**
   - SSL/HTTPS gratis
   - Oculta la IP real de tu servidor
   - Protección contra scraping

4. **📊 Monitoreo:**
   - Analytics de tráfico
   - Alertas de ataques
   - Logs de seguridad

---

## 🚀 CONFIGURACIÓN PASO A PASO (30 minutos)

### PASO 1: Crear Cuenta en Cloudflare

1. Ve a: https://dash.cloudflare.com/sign-up
2. Registrarte con tu email
3. Verifica tu email

---

### PASO 2: Agregar tu Sitio

1. En el dashboard, haz clic en **"Add a Site"**
2. Ingresa tu dominio (ejemplo: `tudominio.com`)
3. Selecciona el plan **FREE** (gratis)
4. Haz clic en **"Continue"**

---

### PASO 3: Cloudflare Escaneará tus DNS

Cloudflare detectará automáticamente tus registros DNS actuales:

```
Ejemplo de registros que verás:
A     @              72.61.43.32
A     www            72.61.43.32
CNAME mail           mail.tudominio.com
```

**Importante:**
- ✅ Verifica que el registro `A` apunte a `72.61.43.32`
- ✅ Activa el **proxy** (nube naranja 🟠) en los registros web
- ❌ NO actives proxy en registros de email (MX, mail)

---

### PASO 4: Cambiar Nameservers

Cloudflare te dará 2 nameservers:

```
Ejemplo:
ns1.cloudflare.com
ns2.cloudflare.com
```

**Dónde cambiarlos:**
1. Ve al panel de tu **registrador de dominio** (donde compraste el dominio)
   - GoDaddy, Namecheap, Hostinger, etc.
2. Busca **"DNS Settings"** o **"Nameservers"**
3. Cambia de los nameservers actuales a los de Cloudflare
4. Guarda los cambios

**Tiempo de propagación:** 5 minutos a 24 horas (usualmente 1-2 horas)

---

### PASO 5: Configurar Seguridad en Cloudflare

Una vez que los nameservers estén activos:

#### 5.1 SSL/TLS
```
Dashboard → SSL/TLS → Overview
Modo: "Full (strict)"
```

#### 5.2 Firewall Rules
```
Dashboard → Security → WAF
Activar: "OWASP Core Ruleset"
Activar: "Cloudflare Managed Ruleset"
```

#### 5.3 Rate Limiting (Protección contra ataques)
```
Dashboard → Security → WAF → Rate limiting rules
Crear regla:
- Nombre: "Protección API"
- If incoming requests match:
  - URI Path contains "/api"
- Then:
  - Block
  - When rate exceeds: 100 requests per 1 minute
```

#### 5.4 Bot Fight Mode
```
Dashboard → Security → Bots
Activar: "Bot Fight Mode" (FREE)
```

#### 5.5 Under Attack Mode (Si estás siendo atacado)
```
Dashboard → Overview
Activar: "Under Attack Mode"
(Muestra un challenge de 5 segundos a todos los visitantes)
```

---

### PASO 6: Configurar Cache

```
Dashboard → Caching → Configuration

Cache Level: Standard
Browser Cache TTL: 4 hours
```

**Crear regla de cache para assets:**
```
Dashboard → Rules → Page Rules
Crear regla:
- URL: *tudominio.com/*.jpg
- Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

Repetir para: *.png, *.css, *.js, *.woff, *.woff2
```

---

### PASO 7: Configurar Seguridad Adicional

#### Bloquear países sospechosos (Opcional)
```
Dashboard → Security → WAF → Tools
IP Access Rules:
- Bloquear países con alto tráfico de bots
- Ejemplo: Bloquear China, Rusia (si no tienes usuarios ahí)
```

#### Challenge para bots
```
Dashboard → Security → Settings
Security Level: Medium (o High si hay muchos ataques)
```

---

## 🎯 CONFIGURACIÓN RECOMENDADA PARA TU CASO

### Configuración Mínima (DEBE HACER):
- ✅ SSL/TLS: Full (strict)
- ✅ Bot Fight Mode: ON
- ✅ OWASP Core Ruleset: ON
- ✅ Proxy activado (nube naranja) en registros A

### Configuración Recomendada:
- ✅ Rate limiting en /api (100 req/min)
- ✅ Security Level: Medium
- ✅ Cache para assets estáticos

### Si Estás Bajo Ataque:
- ✅ Under Attack Mode: ON
- ✅ Security Level: High
- ✅ Bloquear países sospechosos

---

## 📊 VERIFICAR QUE FUNCIONA

### 1. Verificar DNS
```bash
# Desde tu terminal local (PowerShell)
nslookup tudominio.com

# Deberías ver IPs de Cloudflare, NO 72.61.43.32
```

### 2. Verificar SSL
```
https://tudominio.com
# Debería mostrar candado verde
```

### 3. Verificar Headers
```bash
curl -I https://tudominio.com

# Deberías ver:
# server: cloudflare
# cf-ray: ...
```

---

## ⚠️ IMPORTANTE: Actualizar Configuración del Servidor

Una vez que Cloudflare esté activo, **DEBES** configurar tu servidor para:

### 1. Confiar solo en IPs de Cloudflare

Editar nginx:
```bash
sudo nano /etc/nginx/sites-available/default
```

Agregar:
```nginx
# Obtener IP real del visitante desde Cloudflare
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
real_ip_header CF-Connecting-IP;
```

Reiniciar nginx:
```bash
sudo systemctl restart nginx
```

### 2. Bloquear acceso directo por IP

En firewall:
```bash
# Solo permitir tráfico desde Cloudflare
sudo ufw allow from 173.245.48.0/20 to any port 80
sudo ufw allow from 173.245.48.0/20 to any port 443
# ... (agregar todos los rangos de Cloudflare)
```

---

## 🔍 MONITOREO Y ALERTAS

### Ver ataques bloqueados:
```
Dashboard → Security → Events
```

### Configurar alertas por email:
```
Dashboard → Notifications
Activar:
- "DDoS Attack Alerting"
- "WAF Weekly Summary"
- "Security Events"
```

---

## 💰 COSTO

**Plan FREE (Gratis):**
- ✅ Protección DDoS ilimitada
- ✅ SSL gratis
- ✅ CDN global
- ✅ Firewall básico
- ✅ Bot protection
- ✅ Analytics básico

**Suficiente para el 99% de los casos**

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema: "Too many redirects"
**Solución:**
```
Dashboard → SSL/TLS → Overview
Cambiar a: "Flexible" (temporalmente)
Luego volver a "Full (strict)"
```

### Problema: "Sitio no carga"
**Verificar:**
1. DNS propagado: `nslookup tudominio.com`
2. Proxy activado (nube naranja)
3. SSL configurado correctamente

### Problema: "Emails no llegan"
**Solución:**
- Desactivar proxy (nube gris) en registros MX y mail

---

## ✅ CHECKLIST DE CONFIGURACIÓN

- [ ] Cuenta de Cloudflare creada
- [ ] Sitio agregado
- [ ] Nameservers cambiados en registrador
- [ ] DNS propagado (verificar con nslookup)
- [ ] Proxy activado en registros A (nube naranja)
- [ ] SSL/TLS: Full (strict)
- [ ] Bot Fight Mode: ON
- [ ] OWASP Ruleset: ON
- [ ] Rate limiting configurado
- [ ] Nginx configurado para IPs de Cloudflare
- [ ] Verificado que funciona (https://tudominio.com)

---

## 🎯 RESULTADO ESPERADO

**Antes de Cloudflare:**
- ⚠️ Ataques directos al servidor
- ⚠️ IP del servidor expuesta
- ⚠️ Sin protección contra bots
- ⚠️ Vulnerable a DDoS

**Después de Cloudflare:**
- ✅ 99% de ataques bloqueados automáticamente
- ✅ IP del servidor oculta
- ✅ Bots maliciosos bloqueados
- ✅ Protección DDoS
- ✅ Sitio más rápido (CDN)
- ✅ SSL gratis

---

## 📞 SOPORTE

- Documentación: https://developers.cloudflare.com/
- Community: https://community.cloudflare.com/
- Status: https://www.cloudflarestatus.com/

---

**Tiempo total de configuración:** 30-60 minutos  
**Costo:** $0 (plan FREE)  
**Efectividad:** 🟢🟢🟢🟢🟢 (Muy Alta)

---

**Última actualización:** 2025-12-10
