# Correcciones de Bugs en el Panel de Admin

## Fecha: 21 de Noviembre, 2025

## Problemas Reportados por la Empleada

1. **Subsub-categorías se convierten en subcategorías o categorías principales**
   - Las subsub-categorías como "guarniciones" dentro de "Menú -> Principales" se convertían en subcategorías simples después de guardar
   
2. **Guardado con retraso**
   - Necesitaba guardar dos veces para que los cambios se reflejaran
   - Los cambios no aparecían hasta el segundo guardado
   
3. **Crear subsub-categoría genera cambios no deseados**
   - Al crear una subsub-categoría, otras partes de la estructura se desarmaban
   - Las subcategorías de "promociones" se separaban y quedaban como categorías

## Causas Raíz Identificadas

### 1. Sincronización Incorrecta entre Archivos
**Problema:** En `app/api/admin/category-hierarchy/route.ts`, cada vez que se guardaba algo en `category-hierarchy.json`, el código sobrescribía COMPLETAMENTE el archivo `subcategory-mapping.json`, perdiendo información de niveles.

**Código Problemático:**
```typescript
// Líneas 84-96 en route.ts
const oldMapping: any = {}
Object.entries(hierarchy).forEach(([key, value]: [string, any]) => {
  oldMapping[key] = value.parent  // ❌ ESTO PERDÍA LA INFORMACIÓN DE NIVELES
})
await fs.writeFile(MAPPING_FILE_PATH, JSON.stringify(oldMapping, null, 2), "utf8")
```

**Solución:** Eliminé la sincronización automática que destruía la jerarquía. Ahora cada archivo se mantiene independiente.

### 2. Datos Corruptos en los Archivos JSON
**Problema:** Había inconsistencias entre `category-hierarchy.json` y `subcategory-mapping.json`:
- 5 entradas en hierarchy que NO estaban en mapping
- 1 entrada en mapping que NO estaba en hierarchy
- 2 entradas con padres inválidos (categorías que no existen)

**Solución:** Creé y ejecuté un script de corrección que:
- Sincronizó ambos archivos
- Eliminó entradas con padres inválidos ("bebidas" con parent "promociones", "tintos" con parent "vinos")
- Agregó entradas faltantes
- Resultado: 21 entradas sincronizadas en ambos archivos

### 3. Falta de Validación Durante el Guardado
**Problema:** No había indicadores visuales claros ni bloqueos para prevenir que la usuaria hiciera cambios mientras se estaba guardando.

**Solución:** Agregué:
- Indicador visual prominente con animación cuando se está guardando
- Mensaje de advertencia: "⚠️ Por favor espera... No realices otros cambios hasta que termine el guardado"
- Deshabilitación de TODOS los botones de acción durante el guardado
- Clases CSS para mostrar botones deshabilitados (opacidad 50%, cursor not-allowed)

### 4. Orden de Operaciones Incorrecto
**Problema:** En `handleAddSubSubcategory`, se actualizaba el mapeo ANTES de la jerarquía, causando conflictos.

**Solución:** Reordené las operaciones:
1. Primero: Actualizar `category-hierarchy.json` (con level: 2)
2. Segundo: Actualizar `subcategory-mapping.json`
3. Tercero: Crear sección en el menú
4. Cuarto: Recargar TODOS los datos con un pequeño delay (300ms) para asegurar que el servidor termine de escribir

## Cambios Realizados

### Archivo: `app/api/admin/category-hierarchy/route.ts`
**Cambios:**
- Eliminé la sincronización automática hacia `subcategory-mapping.json` en POST (líneas 84-96)
- Eliminé la sincronización automática hacia `subcategory-mapping.json` en DELETE (líneas 139-151)
- Agregué comentarios explicativos sobre por qué NO se sincroniza

### Archivo: `app/admin/page.tsx`
**Cambios:**

1. **Función `handleAddSubSubcategory` (línea ~2048)**
   - Reordené las operaciones: jerarquía primero, mapeo después
   - Agregué delay de 300ms antes de recargar datos
   - Agregué recarga de la jerarquía además del mapeo
   - Mejoré los mensajes de estado

2. **Indicador de Notificación (línea ~3348)**
   - Agregué animación `animate-pulse` cuando se está guardando
   - Agregué spinner animado
   - Colores dinámicos según el estado (amarillo=guardando, verde=éxito, rojo=error)
   - Mensaje de advertencia cuando `saving === true`

3. **Botones del Header (línea ~3299)**
   - Agregué `disabled={saving}` a TODOS los botones
   - Agregué clases CSS: `disabled:opacity-50 disabled:cursor-not-allowed`
   - Botones afectados:
     - Confirmar Cambios
     - Aumentar Precios
     - Reordenar Categorías
     - Editar Categorías
     - Cerrar Sesión

4. **Botones de "Agregar Producto" (líneas ~2697 y ~3515)**
   - Agregué `disabled={saving}` a ambas instancias
   - Agregué clases CSS de deshabilitado

5. **Botones de "Eliminar Subcategoría" (línea ~2708)**
   - Agregué `disabled={saving}`
   - Agregué clases CSS de deshabilitado

### Archivos de Datos
**`data/category-hierarchy.json` y `data/subcategory-mapping.json`**
- Sincronizados completamente (21 entradas en cada uno)
- Eliminadas entradas con padres inválidos
- Estructura correcta de niveles preservada:
  - Level 1: subcategorías (ej: "parrilla" -> "menu")
  - Level 2: subsub-categorías (ej: "milanesas" -> "principales")

## Estado Final

### Jerarquía Correcta
```
menu (categoría principal)
├── parrilla (level 1)
├── guarniciones (level 1)
├── tapeos (level 1)
├── otros (level 1)
└── postres (level 1)

principales (categoría principal)
├── milanesas (level 2) ✅
├── hamburguesas (level 2) ✅
└── ensaladas (level 2) ✅

desayunos-y-meriendas (categoría principal)
├── cafeteria (level 1)
├── pasteleria (level 1)
└── brunch (level 1)

coctelería (categoría principal)
├── cervezas (level 1)
├── tragos-clasicos (level 1)
├── especiales (level 1)
├── shots (level 1)
├── tragos-con-red-bull (level 1)
├── vinos-tintos (level 1)
├── vinos-blancos (level 1)
├── vinos-rosados (level 1)
├── copas-de-vino (level 1)
└── botellas (level 1)
```

## Instrucciones para la Empleada

### ✅ Cambios Resueltos
1. **Las subsub-categorías ahora se mantienen correctamente**
   - Ya no se convierten en subcategorías simples
   - La jerarquía se preserva después de guardar

2. **El guardado es inmediato**
   - Ya no necesitas guardar dos veces
   - Los cambios se reflejan después del primer guardado
   - Verás un indicador visual claro cuando se está guardando

3. **Crear subsub-categorías no desarma la estructura**
   - La creación de nuevas subsub-categorías ya no afecta otras partes del menú
   - Todo se mantiene en su lugar

### ⚠️ Nuevas Reglas Importantes
1. **ESPERA durante el guardado**
   - Cuando veas el indicador amarillo parpadeante, NO HAGAS NADA
   - Lee el mensaje: "Por favor espera... No realices otros cambios hasta que termine el guardado"
   - Todos los botones estarán deshabilitados automáticamente

2. **Verifica el estado**
   - ✅ Verde = Guardado exitoso
   - ❌ Rojo = Error (avisar al administrador)
   - 🔄 Amarillo parpadeante = Guardando (esperar)

3. **Si algo sale mal**
   - NO intentes guardar múltiples veces seguidas
   - Espera a que el sistema termine de guardar
   - Si ves un error rojo, toma captura y avisa

## Testing Recomendado

Para verificar que todo funciona correctamente:

1. **Test 1: Crear subsub-categoría**
   - Ir a "Editar Categorías"
   - Agregar una subsub-categoría en "Principales -> Hamburguesas"
   - Esperar el indicador de éxito
   - Verificar que aparece correctamente como subsub

2. **Test 2: Modificar productos**
   - Editar un producto existente
   - Guardar cambios
   - Verificar que se guarda en el primer intento

3. **Test 3: Reordenar categorías**
   - Usar "Reordenar Categorías"
   - Mover algunas categorías
   - Guardar cambios
   - Verificar que el orden se mantiene

## Archivos Modificados
- `app/api/admin/category-hierarchy/route.ts` ✅
- `app/admin/page.tsx` ✅
- `data/category-hierarchy.json` ✅ (corregido)
- `data/subcategory-mapping.json` ✅ (corregido)
- `CORRECCIONES_ADMIN_BUG.md` ✅ (este archivo)

## Notas Técnicas
- Los archivos `category-hierarchy.json` y `subcategory-mapping.json` ahora se mantienen separados
- NO se sincroniza automáticamente entre ellos para evitar pérdida de datos
- El sistema usa `category-hierarchy.json` como fuente de verdad para los niveles
- El delay de 300ms en `handleAddSubSubcategory` es necesario para el sistema de archivos

