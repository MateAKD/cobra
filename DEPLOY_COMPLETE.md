# 🚀 Guía Completa de Deploy - COBRA 2.0

## 📋 Cambios Implementados

1. ✅ Sistema de reordenamiento de subcategorías
2. ✅ Sistema de sub-subcategorías (3 niveles de jerarquía)
3. ✅ Estética mejorada con líneas rústicas
4. ✅ Protección de datos en producción

---

## 🔵 DEPLOY EN VERCEL

### Paso 1: Preparar el Repositorio

```bash
# Asegúrate de estar en la rama main
git checkout main

# Verificar que los archivos de datos NO están en el commit
git status
# No deberías ver: data/menu.json, data/categories.json, etc.

# Si aparecen, removerlos del staging (pero NO borrarlos localmente)
git reset HEAD data/menu.json data/categories.json data/subcategory-mapping.json data/subcategory-order.json data/category-hierarchy.json
```

### Paso 2: Commit y Push

```bash
# Agregar todos los cambios de código
git add .

# Commit con mensaje descriptivo
git commit -m "feat: Sistema de sub-subcategorías y reordenamiento completo

- Implementado sistema de 3 niveles de jerarquía (categoría → subcategoría → sub-subcategoría)
- Agregado reordenamiento de subcategorías con drag & drop
- Mejorada estética con líneas rústicas consistentes
- Protección de archivos de datos en producción
- API mejorada con merge en lugar de sobrescritura"

# Push a GitHub
git push origin main
```

### Paso 3: Deploy Automático en Vercel

Vercel detectará automáticamente el push y hará el deploy. Si no está configurado:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Git**
4. Asegúrate de que está conectado a tu repositorio
5. El deploy se iniciará automáticamente

### Paso 4: Configurar Variables de Entorno (si es necesario)

En Vercel Dashboard → Settings → Environment Variables, asegúrate de tener:
- Variables necesarias para producción (si las hay)

### Paso 5: Verificar Deploy

1. Espera a que el deploy termine (verás "Ready" en el dashboard)
2. Visita tu URL de Vercel
3. Verifica que el menú carga correctamente

**⚠️ IMPORTANTE:** Los archivos de datos (`menu.json`, etc.) NO estarán en Vercel porque están en `.gitignore`. Si Vercel necesita datos iniciales, deberás:
- Subirlos manualmente a Vercel Storage, o
- Usar una base de datos externa, o
- Configurar un sistema de sincronización

---

## 🖥️ DEPLOY EN VPS

### Paso 1: Conectarse a la VPS

```bash
ssh deploy@72.61.43.32
# O si usas otro usuario:
# ssh usuario@72.61.43.32
```

### Paso 2: Ir al Directorio del Proyecto

```bash
cd /var/www/cobra
```

### Paso 3: Ejecutar el Script de Deploy

```bash
bash deploy.sh
```

El script automáticamente:
1. ✅ Hace backup de todos los archivos de datos
2. ✅ Descarga los últimos cambios de Git
3. ✅ Restaura los datos de producción (para no perder productos)
4. ✅ Instala dependencias
5. ✅ Compila la aplicación
6. ✅ Reinicia PM2

### Paso 4: Verificar el Deploy

```bash
# Ver estado de PM2
pm2 status

# Ver logs recientes
pm2 logs cobramenu --lines 50

# Si hay errores, revisar:
pm2 logs cobramenu --err --lines 100
```

### Paso 5: Probar en el Navegador

1. Visita `menucobra.com` (o tu dominio)
2. Limpia la caché del navegador (Ctrl+Shift+R)
3. Verifica que:
   - El menú carga correctamente
   - Las subcategorías se muestran
   - Las sub-subcategorías aparecen con la línea rústica naranja
   - El admin funciona correctamente

---

## 🔒 PROTECCIÓN DE DATOS

### Archivos Protegidos (NO se sobrescriben en deploy)

Los siguientes archivos están en `.gitignore` y se protegen automáticamente:

- `data/menu.json` - Todos los productos
- `data/categories.json` - Configuración de categorías
- `data/subcategory-mapping.json` - Mapeo de subcategorías
- `data/subcategory-order.json` - Orden de subcategorías
- `data/category-hierarchy.json` - Jerarquía completa

### Backups Automáticos

El script `deploy.sh` crea backups automáticos en:
```
/var/www/cobra/backups/
```

Formato: `archivo.backup.YYYYMMDD_HHMMSS.json`

### Restaurar un Backup (si es necesario)

```bash
# Ver backups disponibles
ls -la backups/

# Restaurar un backup específico
cp backups/menu.backup.20241119_120000.json data/menu.json
cp backups/categories.backup.20241119_120000.json data/categories.json
# etc...

# Reiniciar PM2
pm2 restart cobramenu
```

---

## 🐛 Solución de Problemas

### Error: "No se encuentra package.json"
- Verifica que estás en el directorio correcto: `/var/www/cobra`

### Error: "Error al hacer pull"
- Verifica conexión a internet
- Verifica permisos de Git: `git config --global --add safe.directory /var/www/cobra`

### Error: "Error al instalar dependencias"
- Verifica que pnpm está instalado: `which pnpm`
- Si no está: `npm install -g pnpm`

### Error: "Error en el build"
- Revisa los logs: `pm2 logs cobramenu --err`
- Verifica que todas las dependencias están instaladas
- Intenta limpiar y rebuild: `rm -rf .next && pnpm build`

### Los productos desaparecen después del deploy
- Verifica que los backups se crearon: `ls -la backups/`
- Restaura manualmente desde el backup más reciente
- Verifica que el script restauró los datos: `cat data/menu.json | head -20`

### El menú no carga en producción
- Verifica que PM2 está corriendo: `pm2 status`
- Revisa logs: `pm2 logs cobramenu --lines 100`
- Verifica que el puerto está correcto en la configuración de PM2
- Verifica que nginx está configurado correctamente

---

## 📝 Checklist Pre-Deploy

Antes de hacer deploy, verifica:

- [ ] Todos los cambios están commiteados
- [ ] Los archivos de datos están en `.gitignore`
- [ ] No hay errores de linting: `npm run lint` (si está configurado)
- [ ] El build local funciona: `pnpm build`
- [ ] El servidor local funciona: `pnpm dev`
- [ ] Has probado todas las funcionalidades nuevas localmente

---

## 📞 Soporte

Si encuentras problemas durante el deploy:

1. Revisa los logs de PM2
2. Revisa los backups creados
3. Verifica que los archivos de datos existen en el servidor
4. Compara con la versión local que funciona

---

## 🎉 ¡Deploy Completado!

Una vez que el deploy esté completo, deberías poder:

- ✅ Ver el menú con todas las categorías
- ✅ Ver subcategorías con sus productos
- ✅ Ver sub-subcategorías con la línea rústica naranja
- ✅ Reordenar subcategorías desde el admin
- ✅ Agregar sub-subcategorías desde el admin
- ✅ Todos los productos se mantienen guardados

¡Feliz deploy! 🐍

