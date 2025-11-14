# Solución al problema de duplicación de "Promociones"

## Problema
Cuando agregas la categoría "promociones", aparecen automáticamente subcategorías "CAFÉ", "TAPEOS" y "BEBIDAS" que no creaste.

## Causa
En el VPS, el archivo `data/menu.json` tiene datos viejos donde "promociones" está guardado como:
```json
{
  "promociones": {
    "cafe": [],
    "tapeos": [],
    "bebidas": []
  }
}
```

En lugar de:
```json
{
  "promociones": []
}
```

## Solución

### Paso 1: En el VPS, ejecuta estos comandos:

```bash
cd /var/www/cobra

# Ver qué hay en el archivo actual
cat data/menu.json

# Si tiene datos viejos, limpiarlo completamente
echo '{}' > data/menu.json
echo '{}' > data/categories.json
echo '{}' > data/subcategory-mapping.json

# Hacer pull del repositorio (sin conflictos)
git checkout --theirs data/menu.json data/categories.json data/subcategory-mapping.json
git pull origin main

# Construir y reiniciar
pnpm install
pnpm build
pm2 restart cobramenu
```

### Paso 2: Verifica que los archivos estén limpios

```bash
cat data/menu.json
cat data/categories.json
cat data/subcategory-mapping.json
```

Todos deberían mostrar solo: `{}`

### Paso 3: Refresca el navegador y empieza de cero

Ahora cuando agregues la categoría "promociones", se creará limpia sin subcategorías automáticas.

## Por qué funcionará
El código que crea nuevas categorías (línea 1305 en `page.tsx`) siempre las guarda como array `[]`:
```javascript
body: JSON.stringify([]),
```

Solo si hay datos previos guardados como objeto, el código los detecta y crea las subcategorías automáticamente.

