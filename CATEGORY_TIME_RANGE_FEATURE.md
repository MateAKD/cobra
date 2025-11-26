# ⏰ Funcionalidad de Rangos Horarios para Categorías - Panel Admin COBRA

## 🎯 Descripción

Esta funcionalidad permite a los administradores configurar rangos horarios para las categorías del menú. Las categorías configuradas solo se mostrarán en el menú público durante el horario especificado, y se ocultarán automáticamente fuera de ese rango.

## ✨ Características Principales

### 🕐 Configuración Flexible
- ✅ **Activar/Desactivar**: Switch para habilitar restricción horaria
- ✅ **Horario de inicio**: Hora a partir de la cual se muestra la categoría
- ✅ **Horario de fin**: Hora hasta la cual se muestra la categoría
- ✅ **Soporte para rangos que cruzan medianoche**: Por ejemplo, de 22:00 a 02:00

### 🎨 Indicadores Visuales
- **Badge con horario**: Las categorías con restricción horaria muestran un badge azul con el rango configurado
- **Botón de configuración**: Icono de reloj para acceder rápidamente a la configuración
- **Interfaz intuitiva**: Modal claro y fácil de usar

### 🔄 Filtrado Automático
- **Menú público**: Las categorías fuera de horario no aparecen automáticamente
- **Panel admin**: Siempre muestra todas las categorías para gestión
- **Actualización en tiempo real**: El filtrado se aplica cada vez que se carga el menú

## 🚀 Cómo Usar

### 1. Configurar Horario para una Categoría

1. Ve al **Panel de Administración** (`/admin`)
2. Selecciona la categoría que quieres configurar
3. Haz clic en el botón **"⏰ Horario"**
4. En el modal que aparece:
   - Activa el switch **"Restringir por horario"**
   - Selecciona la **Hora de inicio** (ej: 19:00)
   - Selecciona la **Hora de fin** (ej: 23:59)
5. Haz clic en **"Guardar"**

### 2. Desactivar Restricción Horaria

1. Abre el modal de configuración de horario
2. Desactiva el switch **"Restringir por horario"**
3. Haz clic en **"Guardar"**

### 3. Ver Categorías Configuradas

Las categorías con restricción horaria muestran un badge azul junto a su nombre con el formato:
```
🕐 19:00 - 23:59
```

## 📱 Interfaz de Usuario

### Modal de Configuración

El modal incluye:
- **Switch de activación**: Para habilitar/deshabilitar la restricción
- **Campo de hora de inicio**: Input tipo time (formato 24 horas)
- **Campo de hora de fin**: Input tipo time (formato 24 horas)
- **Vista previa**: Muestra el rango configurado
- **Validación**: Verifica que ambos campos estén completos

### Estados del Modal

- **Sin restricción**: Muestra mensaje informativo
- **Con restricción**: Muestra campos de configuración y vista previa
- **Error**: Muestra mensaje de error si la validación falla

## 🔧 Estructura Técnica

### Campos Agregados a `categories.json`

```json
{
  "parrilla": {
    "name": "PARRILLA",
    "description": "",
    "order": 3,
    "timeRestricted": true,
    "startTime": "19:00",
    "endTime": "23:59"
  }
}
```

### Campos de Categoría

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `timeRestricted` | `boolean` | Indica si la categoría tiene restricción horaria |
| `startTime` | `string` | Hora de inicio en formato HH:MM (24 horas) |
| `endTime` | `string` | Hora de fin en formato HH:MM (24 horas) |

### Archivos Creados/Modificados

#### Nuevos Archivos
- `app/admin/components/TimeRangeModal.tsx` - Modal de configuración de horarios

#### Archivos Modificados
- `app/admin/page.tsx` - Integración del modal y botón de configuración
- `hooks/use-categories.ts` - Soporte para campos de horario
- `hooks/use-menu-data.ts` - Filtrado de categorías por horario
- `lib/menuUtils.ts` - Funciones de utilidad para verificación de horarios
- `data/categories.json` - Agregado campo `timeRestricted` a categorías existentes

### Funciones Principales

#### `isTimeInRange(startTime: string, endTime: string): boolean`
Verifica si la hora actual está dentro de un rango horario.
- Soporta rangos que cruzan medianoche
- Usa formato 24 horas

#### `isCategoryVisible(categoryId: string, categories: Record<string, Category>): boolean`
Determina si una categoría debe mostrarse según su configuración horaria.
- Retorna `true` si no tiene restricción horaria
- Retorna `false` si está fuera del rango configurado

#### `filterCategoriesByTime(menuData: any, categories: Record<string, Category>): any`
Filtra el objeto de menú completo para incluir solo categorías visibles según horario.

## 🎯 Casos de Uso Comunes

### 🍽️ Menú de Cena
Configurar categorías especiales de cena que solo aparecen por la noche:
- **Horario**: 19:00 - 23:59
- **Categorías**: Parrilla, Platos Principales

### ☕ Menú de Desayuno
Mostrar categorías de desayuno solo por la mañana:
- **Horario**: 07:00 - 11:30
- **Categorías**: Cafetería, Pastelería

### 🍹 Happy Hour
Categorías de promociones especiales en horario específico:
- **Horario**: 18:00 - 20:00
- **Categorías**: Promociones, Tragos Especiales

### 🌙 Menú Nocturno
Opciones que cruzan medianoche:
- **Horario**: 22:00 - 02:00
- **Categorías**: Bar, Tragos

## ⚙️ Comportamiento del Sistema

### En el Menú Público (`/menu`)
1. Al cargar el menú, se obtienen las categorías
2. Se verifica la hora actual del sistema
3. Se filtran automáticamente las categorías según sus rangos horarios
4. Solo se muestran las categorías que están dentro de su rango configurado

### En el Panel Admin (`/admin`)
1. **Siempre se muestran todas las categorías** (sin filtrado)
2. Las categorías con restricción horaria muestran un badge con el horario
3. El botón "Horario" permite configurar o editar la restricción

## 🔒 Consideraciones de Seguridad

- **Validación de formato**: Se verifica que los horarios estén en formato HH:MM válido
- **Campos obligatorios**: Si se activa la restricción, ambos horarios son obligatorios
- **Fallback seguro**: Si hay error en la configuración, la categoría se oculta por defecto

## 📊 Impacto en el Rendimiento

- **Carga adicional mínima**: Solo se realiza una verificación de hora al cargar el menú
- **Sin llamadas adicionales al servidor**: El filtrado se hace en el cliente
- **Cache respetado**: Las categorías se cachean normalmente

## 🚨 Solución de Problemas

### La categoría no se oculta/muestra correctamente

1. ✅ Verifica que los horarios estén en formato 24 horas
2. ✅ Confirma que el switch "Restringir por horario" esté activado
3. ✅ Revisa la hora del sistema del servidor/cliente
4. ✅ Refresca el navegador para recargar el menú

### No aparece el badge de horario

1. ✅ Verifica que `timeRestricted` esté en `true` en `categories.json`
2. ✅ Confirma que `startTime` y `endTime` tengan valores
3. ✅ Recarga el panel de admin

### El modal no guarda los cambios

1. ✅ Verifica que ambos campos de hora estén completos
2. ✅ Revisa la consola del navegador en busca de errores
3. ✅ Verifica permisos de escritura en `data/categories.json`

## 🎉 Ventajas de esta Funcionalidad

1. **Automatización**: No necesitas cambiar el menú manualmente según el horario
2. **Flexibilidad**: Configura diferentes horarios para cada categoría
3. **Experiencia de usuario**: Los clientes ven solo opciones disponibles en el momento
4. **Gestión simplificada**: Configura una vez y olvídate
5. **Sin intervención**: El sistema se encarga de mostrar/ocultar automáticamente

## 📝 Notas Importantes

- ⚠️ La verificación de horario usa la hora del sistema donde corre el cliente (navegador)
- ⚠️ Para producción, considera implementar verificación de zona horaria si tienes clientes en diferentes zonas
- ⚠️ Los rangos horarios son diarios, no soportan días específicos de la semana
- ⚠️ El panel de admin siempre muestra todas las categorías independientemente del horario

---

**Desarrollado por AKDMIA Studio**  
[https://akdmiastudio.io/](https://akdmiastudio.io/)

