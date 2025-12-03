# 🚀 Guía Paso a Paso: Subir Cambios al VPS

## 📋 Resumen de Cambios Pendientes

Tienes los siguientes archivos modificados que necesitan subirse:
- `app/carta/page.tsx` y `app/carta/print-styles.css` (últimos cambios)
- Varios archivos de API y hooks
- `next.config.mjs`
- Archivos nuevos: `lib/cache.ts`, scripts de deploy, documentación

---

## 🔄 PASO 1: Preparar y Subir Cambios a Git (Desde tu PC)

### 1.1. Verificar el estado actual
```bash
git status
```

### 1.2. Agregar todos los cambios
```bash
git add .
```

### 1.3. Hacer commit de los cambios
```bash
git commit -m "feat: Actualizar carta con estilos de impresión y optimizaciones"
```

### 1.4. Subir cambios al repositorio remoto
```bash
git push origin main
```

**✅ Si todo sale bien, verás un mensaje confirmando que los cambios se subieron.**

---

## 🔌 PASO 2: Conectarse al VPS

### 2.1. Abrir terminal y conectarse
```bash
ssh root@TU_IP_VPS
# o si usas otro usuario:
ssh usuario@TU_IP_VPS
```

**Nota:** Reemplaza `TU_IP_VPS` con la IP real de tu VPS.

---

## 📂 PASO 3: Navegar al Directorio del Proyecto

```bash
cd /var/www/cobra
```

**Verificar que estás en el lugar correcto:**
```bash
pwd
# Debe mostrar: /var/www/cobra
ls -la
# Debe mostrar package.json, app/, etc.
```

---

## 🔄 PASO 4: Actualizar el Código desde Git

### Opción A: Usar el Script de Deploy (Recomendado)

```bash
bash deploy.sh
```

Este script automáticamente:
- ✅ Hace backup de los datos
- ✅ Descarga los últimos cambios de Git
- ✅ Restaura los datos de producción
- ✅ Instala dependencias
- ✅ Compila el proyecto
- ✅ Reinicia PM2

### Opción B: Deploy Manual (Si el script falla)

```bash
# 1. Hacer backup de datos (IMPORTANTE)
mkdir -p backups
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
cp data/menu.json backups/menu.backup.${BACKUP_DATE}.json 2>/dev/null || echo '{}' > data/menu.json
cp data/categories.json backups/categories.backup.${BACKUP_DATE}.json 2>/dev/null || echo '{}' > data/categories.json
cp data/subcategory-mapping.json backups/subcategory-mapping.backup.${BACKUP_DATE}.json 2>/dev/null || echo '{}' > data/subcategory-mapping.json
cp data/subcategory-order.json backups/subcategory-order.backup.${BACKUP_DATE}.json 2>/dev/null || echo '{}' > data/subcategory-order.json
cp data/category-hierarchy.json backups/category-hierarchy.backup.${BACKUP_DATE}.json 2>/dev/null || echo '{}' > data/category-hierarchy.json

# 2. Guardar cambios locales de datos (si los hay)
git stash push -m "Backup datos antes de deploy ${BACKUP_DATE}" data/*.json 2>/dev/null || true

# 3. Descargar últimos cambios
git pull origin main

# 4. Restaurar datos de producción
[ -f backups/menu.backup.${BACKUP_DATE}.json ] && cp backups/menu.backup.${BACKUP_DATE}.json data/menu.json || echo '{}' > data/menu.json
[ -f backups/categories.backup.${BACKUP_DATE}.json ] && cp backups/categories.backup.${BACKUP_DATE}.json data/categories.json || echo '{}' > data/categories.json
[ -f backups/subcategory-mapping.backup.${BACKUP_DATE}.json ] && cp backups/subcategory-mapping.backup.${BACKUP_DATE}.json data/subcategory-mapping.json || echo '{}' > data/subcategory-mapping.json
[ -f backups/subcategory-order.backup.${BACKUP_DATE}.json ] && cp backups/subcategory-order.backup.${BACKUP_DATE}.json data/subcategory-order.json || echo '{}' > data/subcategory-order.json
[ -f backups/category-hierarchy.backup.${BACKUP_DATE}.json ] && cp backups/category-hierarchy.backup.${BACKUP_DATE}.json data/category-hierarchy.json || echo '{}' > data/category-hierarchy.json

# 5. Instalar dependencias
pnpm install

# 6. Compilar el proyecto
pnpm build

# 7. Reiniciar la aplicación
pm2 restart cobramenu
# Si el nombre es diferente, prueba:
# pm2 restart cobra-app
# o
# pm2 restart all
```

---

## ✅ PASO 5: Verificar que Todo Funciona

### 5.1. Verificar estado de PM2
```bash
pm2 status
```

**Debe mostrar:**
- ✅ `cobramenu` o `cobra-app` en estado `online`
- ✅ Uptime mostrando que está corriendo
- ✅ CPU y memoria en uso normal

### 5.2. Ver logs recientes
```bash
pm2 logs cobramenu --lines 30
```

**Buscar:**
- ✅ No debe haber errores críticos
- ✅ Debe mostrar "Ready" o mensaje de inicio exitoso
- ⚠️ Si hay errores, anótalos para revisar

### 5.3. Verificar que el build fue exitoso
```bash
ls -la .next
```

**Debe existir el directorio `.next` con archivos compilados.**

---

## 🌐 PASO 6: Probar en el Navegador

1. **Abrir tu sitio web** en el navegador
2. **Limpiar caché del navegador:**
   - Chrome/Edge: `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
   - Firefox: `Ctrl + F5` (Windows) o `Cmd + Shift + R` (Mac)
3. **Verificar la página de carta:**
   - Ir a `/carta`
   - Verificar que los estilos se ven correctamente
   - Probar la funcionalidad de impresión/descarga PDF

---

## 🆘 Solución de Problemas

### ❌ Error: "git pull" falla

**Solución:**
```bash
# Forzar sincronización con el remoto
git fetch origin main
git reset --hard origin/main
```

### ❌ Error: "pnpm: command not found"

**Solución:**
```bash
# Instalar pnpm si no está instalado
npm install -g pnpm
```

### ❌ Error: Build falla

**Solución:**
```bash
# Limpiar caché y rebuild
rm -rf .next
rm -rf node_modules/.cache
pnpm install
pnpm build
```

### ❌ Error: PM2 no encuentra la app

**Solución:**
```bash
# Ver todas las apps de PM2
pm2 list

# Si no existe, iniciar la app
cd /var/www/cobra
pm2 start ecosystem.config.js
# o
pm2 start npm --name "cobramenu" -- start
```

### ❌ La app no responde después del deploy

**Solución:**
```bash
# Ver logs detallados
pm2 logs cobramenu --lines 100

# Reiniciar completamente
pm2 stop cobramenu
pm2 delete cobramenu
pm2 start ecosystem.config.js
```

---

## 📝 Checklist Final

Antes de cerrar la sesión SSH, verifica:

- [ ] `git pull` se ejecutó sin errores
- [ ] `pnpm build` completó exitosamente
- [ ] `pm2 status` muestra la app como `online`
- [ ] Los logs no muestran errores críticos
- [ ] El sitio web carga correctamente en el navegador
- [ ] Los cambios nuevos se ven reflejados (página de carta)

---

## 🎯 Comandos Rápidos de Referencia

```bash
# Conectarse al VPS
ssh root@TU_IP_VPS

# Ir al proyecto
cd /var/www/cobra

# Deploy rápido (si el script funciona)
bash deploy.sh

# Deploy manual rápido
git pull origin main && pnpm install && pnpm build && pm2 restart cobramenu

# Ver estado
pm2 status
pm2 logs cobramenu --lines 20
```

---

## 📌 Notas Importantes

1. **⚠️ Siempre haz backup de los datos** antes de hacer pull
2. **⚠️ No elimines los archivos en `data/`** - contienen la información del menú
3. **⚠️ Si algo falla**, los backups están en `backups/` con fecha
4. **✅ El script `deploy.sh`** maneja automáticamente los backups
5. **✅ Usa `pm2 logs`** para diagnosticar problemas

---

¡Listo! Con estos pasos deberías poder subir todos tus cambios al VPS sin problemas. 🚀

