# Panel de Administración - COBRA

## Descripción

Este panel de administración te permite gestionar completamente el contenido del menú de tu restaurante COBRA sin modificar el frontend público. Es una interfaz separada y segura para administradores.

## Características

### 🔐 Gestión Completa del Menú
- **Tapas**: Agregar, editar y eliminar platos de tapeo
- **Entre Panes**: Gestionar hamburguesas y sándwiches
- **Postres**: Administrar la carta de postres
- **Vinos**: Categorías separadas (Tintos, Blancos, Naranjos, Rosados, Espumantes, Por Copa)
- **Tragos de Autor**: Cocktails especiales con detalles técnicos
- **Tragos Clásicos**: Bebidas tradicionales
- **Sin Alcohol**: Bebidas no alcohólicas

### ✏️ Funcionalidades de Edición
- **Formularios Inteligentes**: Se adaptan automáticamente según el tipo de elemento
- **Validación**: Campos requeridos y opcionales según la sección
- **Etiquetas**: Sistema de tags para vegano, sin TACC y picante
- **Campos Específicos**: Ingredientes, vaso, técnica y garnish para tragos

### 🎯 Interfaz Intuitiva
- **Navegación por Pestañas**: Acceso rápido a cada sección
- **Acciones Rápidas**: Botones de editar y eliminar en cada elemento
- **Formularios Modales**: No interrumpen el flujo de trabajo
- **Diseño Responsivo**: Funciona en desktop y móvil

## Cómo Acceder

### URL del Panel
```
http://localhost:3000/admin
```

### Navegación
- El panel es completamente independiente del menú público
- No afecta la visualización del frontend actual
- Ruta separada para mayor seguridad

## Uso del Panel

### 1. Agregar Nuevos Elementos
1. Navega a la sección deseada
2. Haz clic en el botón "Agregar [Tipo]"
3. Completa el formulario con la información requerida
4. Haz clic en "Agregar" para guardar

### 2. Editar Elementos Existentes
1. Encuentra el elemento que quieres editar
2. Haz clic en el botón de editar (ícono de lápiz)
3. Modifica los campos necesarios
4. Haz clic en "Guardar" para aplicar los cambios

### 3. Eliminar Elementos
1. Localiza el elemento a eliminar
2. Haz clic en el botón de eliminar (ícono de papelera)
3. Confirma la acción en el diálogo

## Estructura de Datos

### MenuItem (Tapas, Panes, Postres)
```typescript
{
  id: string
  name: string
  description: string
  price: string
  tags?: ("vegan" | "sin-tacc" | "picante")[]
}
```

### DrinkItem (Tragos de Autor)
```typescript
{
  id: string
  name: string
  description?: string
  price: string
  ingredients?: string
  glass?: string
  technique?: string
  garnish?: string
}
```

### WineItem (Vinos, Tragos Clásicos, Sin Alcohol)
```typescript
{
  id: string
  name: string
  price: string
}
```

## Seguridad y Consideraciones

### 🔒 Acceso Controlado
- El panel está en una ruta separada (`/admin`)
- Idealmente implementar autenticación de administradores
- Considerar middleware de protección

### 💾 Persistencia de Datos
- Actualmente los datos se mantienen en estado local
- Para producción, implementar base de datos
- Considerar sincronización con el menú público

### 🔄 Sincronización
- Los cambios en el panel no afectan inmediatamente el menú público
- Implementar sistema de sincronización según necesidades
- Considerar cache y revalidación

## Implementación Técnica

### Tecnologías Utilizadas
- **Next.js 15**: Framework de React
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos y diseño
- **Shadcn/ui**: Componentes de interfaz
- **Lucide React**: Iconografía

### Estructura de Archivos
```
app/admin/
├── page.tsx              # Página principal del panel
├── layout.tsx            # Layout específico del admin
├── components/
│   ├── EditForm.tsx      # Formulario de edición
│   └── AddForm.tsx       # Formulario de agregar
└── api/
    └── route.ts          # Endpoint de API básico
```

### Estado y Gestión
- **Estado Local**: React useState para cada sección
- **Formularios Controlados**: Inputs manejados por estado
- **Validación**: Campos requeridos y validación básica
- **Navegación**: Sistema de pestañas con estado

## Próximos Pasos

### 🚀 Mejoras Sugeridas
1. **Autenticación**: Sistema de login para administradores
2. **Base de Datos**: Persistencia de datos (PostgreSQL, MongoDB)
3. **Imágenes**: Subida y gestión de fotos de platos
4. **Historial**: Log de cambios y versiones
5. **Backup**: Sistema de respaldo automático
6. **Notificaciones**: Alertas de cambios exitosos/fallidos

### 🔧 Optimizaciones Técnicas
1. **API Routes**: Endpoints para CRUD completo
2. **Middleware**: Validación y autenticación
3. **Cache**: Optimización de rendimiento
4. **Testing**: Pruebas unitarias y de integración
5. **Deployment**: Configuración de producción

## Soporte

Para dudas o problemas con el panel de administración:
1. Revisa la consola del navegador para errores
2. Verifica que todos los componentes UI estén instalados
3. Confirma que las rutas estén correctamente configuradas

---

**Nota**: Este panel está diseñado para ser completamente independiente del frontend público. Los cambios realizados aquí no afectan la visualización del menú hasta que se implemente la sincronización con la base de datos.
