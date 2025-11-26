# 🚀 Quick Start - Deploy COBRA en Hostinger

Esta es la guía rápida. Para la guía completa, ver [HOSTINGER_DEPLOY.md](HOSTINGER_DEPLOY.md)

## ⚡ Opción 1: VPS (Recomendado) - 15 minutos

### 1. Accede a tu VPS por SSH

```bash
ssh root@TU_IP_DEL_VPS
```

### 2. Ejecuta el script de configuración

```bash
# Descarga y ejecuta el script
curl -o setup.sh https://raw.githubusercontent.com/MateAKD/cobra/main/setup-vps.sh
chmod +x setup.sh
./setup.sh
```

### 3. Clona el repositorio

```bash
cd /var/www/cobra
git clone https://github.com/MateAKD/cobra.git .
```

### 4. Configura variables de entorno

```bash
nano .env.production
```

Pega y edita:
```env
ADMIN_PASSWORD=tu_contraseña_segura
RESEND_API_KEY=re_tu_api_key
RECIPIENT_EMAIL=tu-email@dominio.com
NODE_ENV=production
PORT=3000
```

### 5. Build e inicia

```bash
pnpm install
pnpm build
pm2 start pnpm --name cobra-app -- start
pm2 startup
pm2 save
```

### 6. Configura Nginx

```bash
nano /etc/nginx/sites-available/cobra
```

Pega (reemplaza `tudominio.com`):
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activa:
```bash
ln -s /etc/nginx/sites-available/cobra /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 7. Configura SSL

```bash
certbot --nginx -d tudominio.com -d www.tudominio.com
```

### ✅ ¡Listo! Tu sitio está en: https://tudominio.com

---

## 🔄 Para Actualizar

```bash
cd /var/www/cobra
./deploy.sh
```

O simplemente:
```bash
cd /var/www/cobra
git pull
pnpm install
pnpm build
pm2 restart cobra-app
```

---

## 📊 Ver Estado y Logs

```bash
# Estado
pm2 status

# Logs en tiempo real
pm2 logs cobra-app

# Monitoreo
pm2 monit
```

---

## 🔥 Comandos Útiles

```bash
# Reiniciar
pm2 restart cobra-app

# Detener
pm2 stop cobra-app

# Ver recursos
htop

# Ver disco
df -h

# Logs de Nginx
tail -f /var/log/nginx/error.log
```

---

## 🆘 ¿Problemas?

Ver [HOSTINGER_DEPLOY.md](HOSTINGER_DEPLOY.md) sección "Solución de Problemas"

O contacta a soporte de Hostinger: https://www.hostinger.com/contact

---

## 📞 Checklist Rápido

- [ ] VPS accesible por SSH
- [ ] Node.js instalado (`node --version`)
- [ ] Repositorio clonado
- [ ] `.env.production` configurado
- [ ] Build exitoso
- [ ] PM2 corriendo
- [ ] Nginx configurado
- [ ] SSL activo
- [ ] Dominio apuntando a VPS
- [ ] Sitio accesible en navegador

**¡Tu aplicación COBRA está en producción! 🐍**

