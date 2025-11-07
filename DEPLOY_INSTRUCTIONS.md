# 🚀 Instrucciones para Deploy en VPS

## Cambios realizados:
1. ✅ Fix del fondo móvil durante el scroll (iOS Safari)
2. ✅ Fix de la selección de categorías en la barra deslizable

## Pasos para aplicar en VPS:

### Opción 1: Si tienes Git configurado

1. **Hacer commit y push de los cambios:**
   ```bash
   git add .
   git commit -m "Fix: Fondo móvil durante scroll y selección de categorías mejorada"
   git push origin main
   # o git push origin master (depende de tu rama)
   ```

2. **Conectarse a la VPS:**
   ```bash
   ssh root@TU_IP_VPS
   # o
   ssh usuario@TU_IP_VPS
   ```

3. **Ir al directorio del proyecto:**
   ```bash
   cd /ruta/a/tu/proyecto
   ```

4. **Ejecutar el script de actualización:**
   ```bash
   bash force-update.sh
   ```

### Opción 2: Deploy manual (sin Git)

1. **Subir los archivos modificados a la VPS:**
   - `app/menu/page.tsx`
   - `app/globals.css`
   - `next.config.mjs`

2. **Conectarse a la VPS:**
   ```bash
   ssh root@TU_IP_VPS
   ```

3. **Ir al directorio del proyecto:**
   ```bash
   cd /ruta/a/tu/proyecto
   ```

4. **Ejecutar estos comandos:**
   ```bash
   # Limpiar caché
   rm -rf .next
   rm -rf node_modules/.cache
   
   # Rebuild
   npm run build
   # o
   pnpm build
   
   # Reiniciar PM2
   pm2 restart cobra-app
   # o
   pm2 restart all
   
   # Verificar estado
   pm2 status
   pm2 logs cobra-app --lines 20
   ```

### Opción 3: Usar el script deploy.sh existente

Si ya tienes el script `deploy.sh` configurado:

```bash
# En la VPS
cd /ruta/a/tu/proyecto
bash deploy.sh
```

## Verificación después del deploy:

1. **Verificar que la app está corriendo:**
   ```bash
   pm2 status
   ```

2. **Ver logs por si hay errores:**
   ```bash
   pm2 logs cobra-app --lines 50
   ```

3. **Probar en el navegador:**
   - Abrir la URL de tu sitio
   - Limpiar caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
   - Probar en iPhone:
     - El fondo debería verse correctamente durante el scroll
     - La categoría seleccionada debería mantenerse después de hacer clic

## Archivos modificados:

- `app/menu/page.tsx` - Lógica mejorada de selección de categorías
- `app/globals.css` - Fix del fondo móvil con elemento real
- `next.config.mjs` - Headers para evitar caché

## Notas importantes:

- ⚠️ **Limpia la caché del navegador** después del deploy
- ⚠️ En iOS Safari, puede ser necesario cerrar y reabrir el navegador
- ⚠️ Si hay errores en el build, revisa los logs de PM2

