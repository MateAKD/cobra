# Comandos para Arreglar Permisos y Completar Deploy

Ejecuta estos comandos **en el VPS** uno por uno:

## 1. Arreglar permisos del directorio .next
```bash
sudo chown -R deploy:deploy /var/www/cobra/.next
sudo chmod -R 755 /var/www/cobra/.next
```

## 2. Limpiar cache anterior y reconstruir
```bash
cd /var/www/cobra
rm -rf .next
npm run build
```

## 3. Reiniciar la aplicación con PM2
```bash
pm2 restart cobra-bar
pm2 save
```

## 4. Verificar que está corriendo
```bash
pm2 status
pm2 logs cobra-bar --lines 20
```

## Alternativa: Si los permisos siguen dando problema
Si después de ejecutar los comandos anteriores sigue fallando, ejecuta esto:

```bash
# Dar permisos completos al usuario deploy sobre todo el directorio
sudo chown -R deploy:deploy /var/www/cobra
sudo chmod -R 755 /var/www/cobra

# Volver a intentar el deploy
./deploy-vps.sh
```
