# 👁️ Funcionalidad de Ocultar/Mostrar Productos - Panel Admin COBRA

## 🎯 Descripción

Esta nueva funcionalidad permite a los administradores ocultar temporalmente productos del menú público sin eliminarlos completamente del sistema. Cuando se oculta un producto, se requiere especificar obligatoriamente:

- **Motivo de la ocultación**: ¿Por qué se oculta el producto?
- **Quién lo ocultó**: Nombre del administrador responsable

## ✨ Características Principales

### 🔒 Campos Obligatorios
- ✅ **Motivo**: Explicación obligatoria del por qué se oculta/muestra
- ✅ **Responsable**: Nombre del administrador que realiza la acción
- ✅ **Timestamp**: Fecha y hora automática de la acción

### 📧 Notificaciones Automáticas
- **Email automático** cada vez que se oculta/muestra un producto
- **Información completa** incluyendo motivo y responsable
- **Plantilla personalizada** para acciones de visibilidad

### 🎨 Indicadores Visuales
- **Productos ocultos**: Aparecen con opacidad reducida y fondo gris
- **Badge "OCULTO"**: Etiqueta naranja que indica el estado
- **Botón de acción**: Cambia entre "Ocultar" (ojo tachado) y "Mostrar" (ojo)

## 🚀 Cómo Usar

### 1. Ocultar un Producto
1. Ve al **Panel de Administración** (`/admin`)
2. Navega a la sección del producto que quieres ocultar
3. Haz clic en el botón **👁️** (ojo tachado)
4. Completa el formulario:
   - **Motivo**: "Agotado", "Temporada", "Mantenimiento", etc.
   - **Responsable**: Tu nombre o identificador
5. Haz clic en **"Ocultar Producto"**

### 2. Mostrar un Producto Oculto
1. Encuentra el producto con el badge **"OCULTO"**
2. Haz clic en el botón **👁️** (ojo)
3. Completa el formulario:
   - **Motivo**: "Disponible nuevamente", "Stock repuesto", etc.
   - **Responsable**: Tu nombre o identificador
4. Haz clic en **"Mostrar Producto"**

## 📱 Interfaz de Usuario

### Botones de Acción
- **👁️ Ocultar**: Botón secundario para ocultar productos visibles
- **👁️ Mostrar**: Botón principal para mostrar productos ocultos
- **✏️ Editar**: Editar información del producto
- **🗑️ Eliminar**: Eliminar permanentemente el producto

### Estados Visuales
- **Producto Visible**: Apariencia normal
- **Producto Oculto**: 
  - Opacidad 60%
  - Fondo gris claro
  - Badge "OCULTO" naranja
  - Botón de acción cambia a "Mostrar"

## 📧 Notificaciones por Email

### Plantilla de Email
```
Asunto: 🔔 Cambio en el Menú COBRA - OCULTAR/MOSTRAR

🔸 Acción: OCULTAR/MOSTRAR
🔸 Producto: [Nombre del Producto]
🔸 Descripción: [Descripción]
🔸 Precio: $[Precio]
🔸 Sección: [Sección del Menú]
🔸 Motivo: [Motivo de la acción]
🔸 OCULTADO/MOSTRADO por: [Nombre del Responsable]
🔸 Fecha y Hora: [Timestamp]
```

### Configuración
- **Servicio**: EmailJS (ya configurado)
- **Destinatario**: `matepedace@gmail.com`
- **Trigger**: Automático en cada acción de visibilidad

## 🔧 Estructura Técnica

### Nuevos Campos en la Base de Datos
```json
{
  "id": "1",
  "name": "Ojo de bife",
  "description": "320 gr",
  "price": "19.200",
  "hidden": true,
  "hiddenReason": "Agotado temporalmente",
  "hiddenBy": "Juan Pérez",
  "hiddenAt": "2025-01-15T10:30:00.000Z"
}
```

### API Endpoint
```
PATCH /api/menu/[section]/[id]/visibility
```

**Body:**
```json
{
  "hidden": true,
  "reason": "Motivo de la ocultación",
  "hiddenBy": "Nombre del responsable",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Filtrado Automático
- **Frontend público**: Los productos ocultos se filtran automáticamente
- **Panel admin**: Se muestran todos los productos con indicadores de estado
- **Hook useMenuData**: Filtra productos ocultos antes de enviar al frontend

## 🎯 Casos de Uso Comunes

### 🚫 Ocultar Productos
- **Agotado**: Producto sin stock
- **Temporada**: Producto fuera de temporada
- **Mantenimiento**: Problemas de cocina
- **Promoción**: Reemplazado por versión promocional

### ✅ Mostrar Productos
- **Stock repuesto**: Producto disponible nuevamente
- **Nueva temporada**: Producto de temporada disponible
- **Problema resuelto**: Mantenimiento completado
- **Promoción finalizada**: Volver a versión normal

## 🔒 Seguridad y Auditoría

### Registro Completo
- **Quién**: Administrador responsable
- **Cuándo**: Timestamp exacto
- **Por qué**: Motivo documentado
- **Qué**: Producto afectado

### Trazabilidad
- **Historial**: Todas las acciones quedan registradas
- **Notificaciones**: Email automático para auditoría
- **Base de datos**: Campos persistentes para consultas

## 🚨 Solución de Problemas

### Producto no se oculta
1. ✅ Verifica que estés logueado como admin
2. ✅ Completa todos los campos obligatorios
3. ✅ Revisa la consola del navegador
4. ✅ Verifica la conexión a internet

### No recibo notificaciones
1. ✅ Revisa la configuración de EmailJS
2. ✅ Verifica el archivo `.env.local`
3. ✅ Revisa la carpeta de spam
4. ✅ Consulta el dashboard de EmailJS

### Error en la API
1. ✅ Verifica que el servidor esté corriendo
2. ✅ Revisa los logs del servidor
3. ✅ Verifica permisos de escritura en `data/menu.json`
4. ✅ Revisa la estructura del archivo JSON

## 📚 Archivos Modificados

### Nuevos Archivos
- `app/admin/components/HideItemModal.tsx` - Modal de ocultar/mostrar
- `app/api/menu/[section]/[id]/visibility/route.ts` - API endpoint

### Archivos Modificados
- `app/admin/page.tsx` - Panel admin con nueva funcionalidad
- `lib/emailService.ts` - Servicio de email actualizado
- `hooks/use-menu-data.ts` - Hook con filtrado de productos ocultos
- `EMAIL_SETUP.md` - Plantilla de email actualizada

## 🎉 ¡Listo!

La funcionalidad está completamente implementada y lista para usar. Los administradores pueden ahora:

1. **Ocultar productos** temporalmente con registro obligatorio
2. **Mostrar productos** ocultos cuando sea necesario
3. **Recibir notificaciones** automáticas por email
4. **Mantener trazabilidad** completa de todas las acciones

---

**Desarrollado por AKDMIA Studio** 
[https://akdmiastudio.io/](https://akdmiastudio.io/)
