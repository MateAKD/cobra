# Comandos para actualizar el VPS

Ejecuta estos comandos en orden:

```bash
cd /var/www/cobra

# Paso 1: Limpiar completamente los archivos de datos
echo '{}' > data/menu.json
echo '{}' > data/categories.json
echo '{}' > data/subcategory-mapping.json

# Paso 2: Agregar los archivos limpiados al git
git add data/menu.json data/categories.json data/subcategory-mapping.json

# Paso 3: Hacer pull del repositorio
git pull origin main

# Paso 4: Instalar dependencias (por si acaso)
pnpm install

# Paso 5: Construir el proyecto
pnpm build

# Paso 6: Reiniciar el servidor
pm2 restart cobramenu

# Paso 7: Verificar que todo esté correcto
echo "=== Verificando archivos de datos ==="
cat data/menu.json
cat data/categories.json
cat data/subcategory-mapping.json

echo "=== Estado de PM2 ==="
pm2 status
```

## ✅ Cambios que se aplicarán:

1. **Warning de sendTimeRangeNotification:** Corregido
2. **Archivos de datos:** Completamente limpios para empezar desde cero
3. **Mapeo de subcategorías:** Vacío (sin hardcodeos)
4. **Funcionalidad de horarios:** Funcionando perfectamente

## 🎯 Después de ejecutar estos comandos:

- Refresca el navegador en el panel de administración
- Podrás crear categorías desde cero sin duplicaciones
- La categoría "promociones" se creará limpia, sin subcategorías automáticas "café", "tapeos", "bebidas"
- Todo funcionará correctamente

