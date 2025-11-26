# 🐍 Cobra Bar - Menú Digital

Un menú digital moderno y elegante para el restaurante Cobra Bar, construido con Next.js y Tailwind CSS.

## 🚀 Características

- **Diseño Responsivo**: Se adapta perfectamente a cualquier dispositivo
- **Interfaz Moderna**: Diseño elegante con animaciones suaves
- **Panel de Administración**: Gestión completa del menú desde el panel admin
- **Subcategorías Dinámicas**: Sistema flexible de categorías y subcategorías
- **Carga Rápida**: Optimizado para una experiencia de usuario fluida

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **UI Components**: Radix UI, Lucide React
- **Deployment**: Vercel

## 📁 Estructura del Proyecto

```
├── app/
│   ├── page.tsx              # Menú público principal
│   ├── admin/page.tsx         # Panel de administración
│   ├── api/                  # API routes
│   └── globals.css           # Estilos globales
├── components/               # Componentes reutilizables
├── hooks/                   # Custom hooks
├── data/                    # Archivos JSON de datos
└── public/                  # Assets estáticos
```

## 🚀 Deploy en Vercel

Este proyecto está configurado para deploy automático en Vercel.

### Pasos para el Deploy:

1. **Conectar con GitHub**:
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa este repositorio

2. **Configuración Automática**:
   - Vercel detectará automáticamente que es un proyecto Next.js
   - Usará las configuraciones del archivo `vercel.json`

3. **Variables de Entorno** (si las necesitas):
   - En el dashboard de Vercel, ve a Settings > Environment Variables
   - Agrega cualquier variable de entorno necesaria

4. **Deploy**:
   - Cada push a la rama `main` activará un deploy automático
   - Los deploys de preview se crean para cada pull request

## 🔧 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en modo producción
npm start
```

## 📱 Acceso

- **Menú Público**: `https://tu-dominio.vercel.app`
- **Panel Admin**: `https://tu-dominio.vercel.app/admin`
  - Contraseña: `cobra2025`

## 🎨 Personalización

El menú se puede personalizar completamente desde el panel de administración:

- Agregar/editar categorías
- Crear subcategorías
- Gestionar productos
- Modificar precios
- Configurar descripciones

## 📄 Licencia

Este proyecto es privado y está diseñado específicamente para Cobra Bar.

---

**Desarrollado con ❤️ para Cobra Bar**
