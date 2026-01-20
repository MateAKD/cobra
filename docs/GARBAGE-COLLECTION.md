# Garbage Collection - Productos Eliminados

## 🎯 Propósito

Este sistema limpia automáticamente productos que fueron eliminados (soft delete) hace más de 90 días, previniendo el crecimiento infinito de la base de datos.

---

## 📁 Componentes

### 1. Script Standalone
**Ubicación:** `scripts/cleanup-deleted-products.ts`

Script de línea de comandos para ejecutar limpieza manual o vía cron job.

### 2. API Endpoint (Opcional)
**Ubicación:** `app/api/admin/cleanup-deleted/route.ts`

Endpoint REST para ejecutar limpieza desde el admin panel o via API calls.

---

## 🚀 Uso

### Método 1: NPM Scripts (Recomendado)

```bash
# Ver qué se eliminaría (simulación)
npm run cleanup:products:dry

# Ejecutar limpieza real
npm run cleanup:products
```

### Método 2: Script Directo

```bash
# Dry run (simulación - no elimina nada)
npx tsx scripts/cleanup-deleted-products.ts --dry-run

# Eliminar productos >90 días
npx tsx scripts/cleanup-deleted-products.ts

# Eliminar productos >60 días
npx tsx scripts/cleanup-deleted-products.ts --days=60

# Simulación con retención personalizada
npx tsx scripts/cleanup-deleted-products.ts --days=30 --dry-run
```

### Método 3: API Endpoint

```bash
# Ver estadísticas (GET)
curl http://localhost:3000/api/admin/cleanup-deleted

# Dry run (POST)
curl -X POST http://localhost:3000/api/admin/cleanup-deleted \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true}'

# Ejecutar limpieza real (POST)
curl -X POST http://localhost:3000/api/admin/cleanup-deleted \
  -H "Content-Type: application/json" \
  -d '{"retentionDays": 90, "dryRun": false}'
```

---

## ⏰ Automatización (Cron Job)

### En VPS (Linux)

```bash
# Editar crontab
crontab -e

# Agregar (ejecutar cada domingo a las 3am)
0 3 * * 0 cd /var/www/cobra && /usr/bin/npx tsx scripts/cleanup-deleted-products.ts >> /var/log/cleanup-products.log 2>&1
```

### En Windows (Task Scheduler)

1. Abrir Task Scheduler
2. Crear tarea básica
3. Trigger: Semanal, domingos 3:00am
4. Action: Start a program
   - Program: `npx`
   - Arguments: `tsx scripts/cleanup-deleted-products.ts`
   - Start in: `C:\Users\Mateo\Desktop\AKDMIA\Cobra 2.0`

---

## 🔧 Configuración

### Retención por Defecto
```typescript
const DEFAULT_RETENTION_DAYS = 90
```

Productos soft-deleted se eliminan permanentemente después de 90 días.

### Variables de Entorno
```bash
MONGODB_URI=mongodb+srv://...
```

El script usa la misma conexión que la aplicación.

---

## 📊 Ejemplo de Salida

### Dry Run (Simulación)
```
🗑️  Garbage Collection - Productos Eliminados
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Retención: 90 días
🔍 Modo: DRY RUN (simulación)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Conectado a MongoDB

📅 Fecha límite: 2025-10-22T20:00:00.000Z
🗑️  Buscando productos eliminados hace más de 90 días...

🔍 Encontrados 3 productos:

  - Pizza Vieja (ID: pizza-old-123)
    Eliminado: 2025-08-15T14:30:00.000Z
    Días desde eliminación: 98

  - Hamburguesa Test (ID: burger-test)
    Eliminado: 2025-09-01T10:00:00.000Z
    Días desde eliminación: 81

🔍 DRY RUN - No se eliminó nada
   Ejecuta sin --dry-run para eliminar permanentemente

📊 Resumen:
   Encontrados: 3
   Eliminados: 0

👋 Desconectado de MongoDB
```

### Ejecución Real
```
🗑️  Garbage Collection - Productos Eliminados
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Retención: 90 días
🔍 Modo: PRODUCCIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Conectado a MongoDB

[... listado de productos ...]

✅ Eliminados permanentemente: 3 productos
💾 Espacio liberado en base de datos

📊 Resumen:
   Encontrados: 3
   Eliminados: 3

👋 Desconectado de MongoDB
```

---

## ⚠️ Consideraciones

### Seguridad
- ✅ Solo elimina productos con `deletedAt` no nulo
- ✅ Respeta período de retención (90 días por defecto)
- ✅ Dry run para verificar antes de eliminar
- ✅ No afecta productos activos

### Performance
- Usa índice `{ deletedAt: 1, order: 1 }` para queries eficientes
- Elimina en batch (deleteMany)
- Desconecta de MongoDB al terminar

### Recuperación
- Productos eliminados son **permanentemente borrados**
- No se pueden recuperar después de ejecutar
- Siempre ejecuta dry run primero

---

## 🧪 Testing

```bash
# 1. Crear producto de prueba
# (vía admin panel o API)

# 2. Soft delete el producto
# (vía admin panel - botón eliminar)

# 3. Modificar deletedAt manualmente (para testing)
# En MongoDB Compass o mongosh:
db.products.updateOne(
  { id: "test-product-123" },
  { $set: { deletedAt: new Date("2024-10-01") } }
)

# 4. Ejecutar dry run
npm run cleanup:products:dry
# Debería mostrar el producto

# 5. Ejecutar limpieza
npm run cleanup:products
# Debería eliminar el producto

# 6. Verificar que se eliminó
# En MongoDB: db.products.findOne({ id: "test-product-123" })
# Debería retornar null
```

---

## 📈 Estadísticas

### Via API
```bash
curl http://localhost:3000/api/admin/cleanup-deleted
```

**Respuesta:**
```json
{
  "stats": {
    "totalSoftDeleted": 5,
    "readyForCleanup": 2,
    "retentionDays": 90,
    "cutoffDate": "2025-10-22T20:00:00.000Z"
  },
  "oldestProducts": [
    {
      "id": "old-product-1",
      "name": "Pizza Antigua",
      "deletedAt": "2025-08-01T10:00:00.000Z",
      "daysSinceDeletion": 112
    }
  ]
}
```

---

## 🔄 Frecuencia Recomendada

| Escenario | Frecuencia |
|-----------|------------|
| **Producción (VPS)** | Semanal (domingos 3am) |
| **Desarrollo** | Manual cuando sea necesario |
| **Testing** | Después de cada test de soft delete |

---

## 📝 Logs

### Ubicación (VPS con cron)
```bash
/var/log/cleanup-products.log
```

### Ver logs
```bash
tail -f /var/log/cleanup-products.log
```

---

## 🆘 Troubleshooting

### Error: Cannot connect to MongoDB
```bash
# Verificar MONGODB_URI
echo $MONGODB_URI

# Verificar .env.local existe
ls -la .env.local
```

### Error: MODULE_NOT_FOUND
```bash
# Instalar dependencias
npm install
```

### No encuentra productos para eliminar
- ✅ Normal si no hay productos >90 días eliminados
- Verifica con dry run: `npm run cleanup:products:dry`
- Verifica stats: `curl http://localhost:3000/api/admin/cleanup-deleted`

---

## 🔗 Referencias

- [Modelo Product](../models/Product.ts)
- [DELETE endpoint](../app/api/menu/[section]/[id]/route.ts) - Soft delete implementation
- [Auditoría Técnica](../.gemini/antigravity/brain/*/auditoria_tecnica.md)
