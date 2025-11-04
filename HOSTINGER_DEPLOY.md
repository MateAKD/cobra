# 🚀 Guía Completa de Deploy en Hostinger - COBRA

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Preparación del Proyecto](#preparación-del-proyecto)
3. [Configuración en Hostinger](#configuración-en-hostinger)
4. [Deploy Manual](#deploy-manual)
5. [Deploy con GitHub](#deploy-con-github)
6. [Configuración de Dominio](#configuración-de-dominio)
7. [Solución de Problemas](#solución-de-problemas)

---

## 📦 Requisitos Previos

### En Tu Computadora
- ✅ Node.js 18+ instalado
- ✅ Git instalado
- ✅ Repositorio en GitHub (ya lo tienes)
- ✅ Credenciales de Hostinger

### Plan de Hostinger Recomendado
Para Next.js, necesitas uno de estos planes:

**Opción 1: VPS Hosting** (Recomendado para Next.js)
- KVM 1: $4.99/mes - 1 vCPU, 4GB RAM
- KVM 2: $8.99/mes - 2 vCPU, 8GB RAM

**Opción 2: Cloud Hosting**
- Startup: $9.99/mes
- Professional: $14.99/mes

**Opción 3: Business Hosting con Node.js**
- Business: $3.99/mes (con soporte Node.js limitado)

---

## 🔧 Preparación del Proyecto

### 1. Crear Archivo de Configuración para Producción

Ya tienes el proyecto configurado, pero vamos a asegurar que todo esté listo.

### 2. Crear Script de Build

El proyecto ya tiene los scripts necesarios en `package.json`:
```json
"scripts": {
  "build": "next build",
  "start": "next start",
  "dev": "next dev"
}
```

### 3. Variables de Entorno

Crea un archivo `.env.production` (NO lo subas a Git):

```env
# Panel de Admin
ADMIN_PASSWORD=TU_CONTRASEÑA_SEGURA

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RECIPIENT_EMAIL=tu-email@dominio.com

# Next.js
NODE_ENV=production
PORT=3000
```

---

## 🌐 Configuración en Hostinger

### Opción A: Deploy con VPS (Recomendado)

#### Paso 1: Acceder al VPS

1. **Iniciar sesión en Hostinger**
   - Ve a https://hpanel.hostinger.com
   - Selecciona tu VPS

2. **Conectar por SSH**
   ```bash
   ssh root@TU_IP_DEL_VPS
   # Ingresa tu contraseña
   ```

#### Paso 2: Instalar Node.js en el VPS

```bash
# Actualizar el sistema
apt update && apt upgrade -y

# Instalar Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar instalación
node --version
npm --version

# Instalar PM2 (para mantener la app corriendo)
npm install -g pm2

# Instalar pnpm (tu gestor de paquetes)
npm install -g pnpm
```

#### Paso 3: Instalar Git

```bash
apt install -y git
```

#### Paso 4: Configurar Firewall

```bash
# Permitir tráfico HTTP y HTTPS
ufw allow 80
ufw allow 443
ufw allow 3000
ufw enable
```

#### Paso 5: Clonar el Proyecto

```bash
# Ir al directorio web
cd /var/www

# Clonar tu repositorio
git clone https://github.com/MateAKD/cobra.git
cd cobra

# Instalar dependencias
pnpm install
```

#### Paso 6: Configurar Variables de Entorno

```bash
# Crear archivo .env.production
nano .env.production
```

Pega esto y edita con tus valores:
```env
ADMIN_PASSWORD=tu_contraseña_super_segura_aqui
RESEND_API_KEY=re_tu_api_key_de_resend
RECIPIENT_EMAIL=tu-email@dominio.com
NODE_ENV=production
PORT=3000
```

Guarda con `CTRL+X`, luego `Y`, luego `ENTER`

#### Paso 7: Build del Proyecto

```bash
# Hacer build de producción
pnpm build
```

#### Paso 8: Iniciar con PM2

```bash
# Iniciar la aplicación con PM2
pm2 start pnpm --name "cobra-app" -- start

# Configurar PM2 para iniciar al reiniciar el servidor
pm2 startup
pm2 save

# Ver logs
pm2 logs cobra-app

# Ver estado
pm2 status
```

#### Paso 9: Configurar Nginx como Proxy Reverso

```bash
# Instalar Nginx
apt install -y nginx

# Crear configuración
nano /etc/nginx/sites-available/cobra
```

Pega esto (reemplaza `tu-dominio.com`):
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activar el sitio
ln -s /etc/nginx/sites-available/cobra /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx
```

#### Paso 10: Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL (reemplaza tu-dominio.com)
certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Seguir las instrucciones en pantalla
# Elige opción 2 para redirigir HTTP a HTTPS
```

---

### Opción B: Deploy con Cloud Hosting

#### Paso 1: Acceder al Panel

1. Ve a hPanel de Hostinger
2. Selecciona tu plan de Cloud Hosting
3. Ve a "Git Deployment" o "SSH Access"

#### Paso 2: Configurar Git Deployment

```bash
# Conectar por SSH
ssh u123456789@tu-servidor.hostinger.com

# Navegar al directorio público
cd public_html

# Clonar repositorio
git clone https://github.com/MateAKD/cobra.git .

# Instalar Node.js (si no está instalado)
# Contacta soporte de Hostinger para activar Node.js

# Instalar dependencias
npm install

# Build
npm run build

# Iniciar
npm start
```

---

## 🔄 Deploy con GitHub Actions (Automatizado)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to VPS
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /var/www/cobra
          git pull origin main
          pnpm install
          pnpm build
          pm2 restart cobra-app
```

**Configurar Secrets en GitHub:**
1. Ve a tu repositorio → Settings → Secrets and variables → Actions
2. Agrega:
   - `VPS_HOST`: IP de tu VPS
   - `VPS_USERNAME`: usuario (root)
   - `VPS_SSH_KEY`: tu clave SSH privada

---

## 🌍 Configuración de Dominio

### Conectar Dominio a Hostinger

#### Si compraste el dominio en Hostinger:
1. Ve a hPanel → Dominios
2. Selecciona tu dominio
3. Ve a "DNS/Nameservers"
4. Ya debería estar configurado automáticamente

#### Si tu dominio está en otro registrador:

Configura estos registros DNS:

**Tipo A:**
```
@ → IP_DE_TU_VPS
www → IP_DE_TU_VPS
```

**Nameservers (opcional):**
```
ns1.dns-parking.com
ns2.dns-parking.com
```

### Verificar DNS

```bash
# En tu computadora
nslookup tu-dominio.com
ping tu-dominio.com
```

---

## 🔧 Comandos Útiles

### Gestión con PM2

```bash
# Ver apps corriendo
pm2 list

# Ver logs en tiempo real
pm2 logs cobra-app

# Reiniciar app
pm2 restart cobra-app

# Detener app
pm2 stop cobra-app

# Eliminar app
pm2 delete cobra-app

# Ver uso de recursos
pm2 monit
```

### Actualizar la Aplicación

```bash
cd /var/www/cobra
git pull origin main
pnpm install
pnpm build
pm2 restart cobra-app
```

### Ver Logs de Nginx

```bash
# Logs de acceso
tail -f /var/log/nginx/access.log

# Logs de errores
tail -f /var/log/nginx/error.log
```

---

## 🚨 Solución de Problemas

### La aplicación no inicia

```bash
# Ver logs de PM2
pm2 logs cobra-app

# Verificar puerto 3000
netstat -tulpn | grep 3000

# Verificar que Node.js esté instalado
node --version

# Intentar iniciar manualmente
cd /var/www/cobra
pnpm start
```

### Error 502 Bad Gateway

```bash
# Verificar que la app esté corriendo
pm2 status

# Verificar configuración de Nginx
nginx -t

# Reiniciar Nginx
systemctl restart nginx

# Ver logs
pm2 logs cobra-app
tail -f /var/log/nginx/error.log
```

### Cambios no se reflejan

```bash
# Limpiar cache de Next.js
rm -rf .next

# Rebuild
pnpm build

# Reiniciar
pm2 restart cobra-app
```

### SSL no funciona

```bash
# Renovar certificado
certbot renew

# Verificar configuración
certbot certificates

# Forzar renovación
certbot renew --force-renewal
```

### Puerto ya en uso

```bash
# Ver qué está usando el puerto 3000
lsof -i :3000

# Matar el proceso (reemplaza PID)
kill -9 PID

# Reiniciar PM2
pm2 restart cobra-app
```

---

## 📊 Monitoreo

### Configurar Uptime Monitoring

1. Ve a hPanel → VPS → Monitoring
2. Activa "Website Monitoring"
3. Añade tu dominio

### Ver Uso de Recursos

```bash
# CPU y RAM
htop

# Espacio en disco
df -h

# Uso de memoria
free -h

# Procesos de Node
ps aux | grep node
```

---

## 🔒 Seguridad

### Configurar Firewall Básico

```bash
# Instalar UFW si no está
apt install -y ufw

# Configurar reglas
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

### Actualizar Sistema Regularmente

```bash
# Actualizar paquetes
apt update && apt upgrade -y

# Actualizar PM2
npm update -g pm2
```

### Backup Regular

```bash
# Crear script de backup
nano /root/backup-cobra.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de archivos
tar -czf $BACKUP_DIR/cobra_$DATE.tar.gz /var/www/cobra

# Mantener solo últimos 7 backups
ls -t $BACKUP_DIR/cobra_*.tar.gz | tail -n +8 | xargs rm -f

echo "Backup completado: $DATE"
```

```bash
# Hacer ejecutable
chmod +x /root/backup-cobra.sh

# Configurar cron para backup diario
crontab -e
# Agregar: 0 2 * * * /root/backup-cobra.sh
```

---

## 📞 Soporte

### Contacto Hostinger
- **Chat en vivo:** https://www.hostinger.com/contact
- **Email:** support@hostinger.com
- **Centro de ayuda:** https://support.hostinger.com

### Documentación Útil
- [Hostinger VPS Tutorial](https://support.hostinger.com/en/collections/1747834-vps)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

## ✅ Checklist Final

Antes de poner en producción:

- [ ] Variables de entorno configuradas
- [ ] Build exitoso sin errores
- [ ] SSL/HTTPS configurado
- [ ] Dominio apuntando correctamente
- [ ] PM2 configurado para auto-restart
- [ ] Nginx configurado como proxy
- [ ] Firewall configurado
- [ ] Backup configurado
- [ ] Monitoreo activado
- [ ] Probar admin panel
- [ ] Probar menú público
- [ ] Probar emails (si aplica)
- [ ] Verificar en diferentes dispositivos

---

**¡Tu aplicación COBRA está lista para producción! 🐍**

Desarrollado por AKDMIA Studio  
[https://akdmiastudio.io/](https://akdmiastudio.io/)

