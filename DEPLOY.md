# 🚀 Guía de Deploy - Cobra Bar Menu

## Pasos para hacer el Deploy en Vercel

### 1. Preparación del Repositorio

Asegúrate de que tu código esté en un repositorio de GitHub:

```bash
# Si aún no tienes un repositorio Git
git init
git add .
git commit -m "Initial commit - Cobra Bar Menu"
git branch -M main
git remote add origin https://github.com/tu-usuario/cobra-bar-menu.git
git push -u origin main
```

### 2. Deploy en Vercel

#### Opción A: Deploy desde GitHub (Recomendado)

1. **Ve a [vercel.com](https://vercel.com)**
2. **Inicia sesión** con tu cuenta de GitHub
3. **Haz clic en "New Project"**
4. **Importa tu repositorio** de GitHub
5. **Configura el proyecto**:
   - Framework Preset: `Next.js` (se detecta automáticamente)
   - Root Directory: `/` (por defecto)
   - Build Command: `npm run build` (por defecto)
   - Output Directory: `.next` (por defecto)
   - Install Command: `npm install` (por defecto)

6. **Haz clic en "Deploy"**

#### Opción B: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Deploy
vercel

# Para producción
vercel --prod
```

### 3. Configuración Post-Deploy

#### Variables de Entorno (Opcional)

Si necesitas configurar EmailJS o otras variables:

1. Ve al **Dashboard de Vercel**
2. Selecciona tu proyecto
3. Ve a **Settings > Environment Variables**
4. Agrega las variables necesarias:
   ```
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=tu_public_key
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=tu_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=tu_template_id
   ```

#### Dominio Personalizado (Opcional)

1. Ve a **Settings > Domains**
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

### 4. Verificación del Deploy

Una vez completado el deploy:

1. **Verifica el menú público**: `https://tu-dominio.vercel.app`
2. **Verifica el panel admin**: `https://tu-dominio.vercel.app/admin`
   - Contraseña: `cobra2025`

### 5. Deploys Automáticos

- **Cada push a `main`** activará un deploy automático
- **Pull requests** crearán deploys de preview
- **Rollbacks** están disponibles en el dashboard

### 6. Monitoreo

En el dashboard de Vercel puedes:
- Ver logs de build
- Monitorear performance
- Ver analytics de visitas
- Configurar alertas

## 🎯 URLs Importantes

- **Menú Público**: `https://tu-dominio.vercel.app`
- **Panel Admin**: `https://tu-dominio.vercel.app/admin`
- **Dashboard Vercel**: `https://vercel.com/dashboard`

## 🔧 Troubleshooting

### Error de Build
- Verifica que `npm run build` funcione localmente
- Revisa los logs de build en Vercel
- Asegúrate de que todas las dependencias estén en `package.json`

### Error de Runtime
- Revisa los logs de función en Vercel
- Verifica que las API routes funcionen correctamente
- Asegúrate de que los archivos JSON estén incluidos en el deploy

### Problemas de Performance
- Optimiza las imágenes
- Implementa lazy loading
- Considera usar CDN para assets estáticos

## 📞 Soporte

Si tienes problemas con el deploy:
1. Revisa la documentación de Vercel
2. Consulta los logs en el dashboard
3. Verifica que el proyecto funcione localmente

---

**¡Tu menú de Cobra Bar estará listo para usar! 🐍**
