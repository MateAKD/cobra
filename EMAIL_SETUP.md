# 📧 Configuración de Notificaciones por Email - Resend

## 🚀 Setup Rápido (5 minutos)

Este proyecto utiliza **Resend** como servicio exclusivo de notificaciones por email. Es rápido, confiable y fácil de configurar.

### 1. Crear cuenta en Resend
1. Ve a [https://resend.com/](https://resend.com/)
2. Haz clic en **"Sign Up"**
3. Crea tu cuenta gratuita
4. Confirma tu email

### 2. Obtener API Key
1. En el dashboard de Resend, ve a **"API Keys"** en el menú lateral
2. Haz clic en **"Create API Key"**
3. Dale un nombre (ej: "COBRA Notifications")
4. Selecciona permisos: **"Sending access"**
5. **Copia la API Key** (empieza con `re_` y solo se muestra una vez)

⚠️ **IMPORTANTE**: Guarda la API Key inmediatamente, no se volverá a mostrar.

### 3. Configurar Variables de Entorno

El archivo `.env.local` ya existe en el proyecto. Ábrelo y asegúrate de que tenga:

```env
# Resend Configuration
# API Key de Resend (obtén una en https://resend.com/api-keys)
RESEND_API_KEY=re_tu_api_key_aqui

# Email donde quieres recibir las notificaciones
RECIPIENT_EMAIL=tu_email@gmail.com
```

**Ejemplo real:**
```env
RESEND_API_KEY=re_abc123xyz789def456
RECIPIENT_EMAIL=matepedace@gmail.com
```

### 4. Reiniciar el Servidor

**IMPORTANTE**: Después de modificar `.env.local`, DEBES reiniciar el servidor:

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
pnpm dev
```

## ✅ Verificar que Funciona

### Opción 1: Test endpoint
1. Inicia el servidor: `pnpm dev`
2. Abre en tu navegador: `http://localhost:3000/api/test`
3. Verifica que veas:
   - `hasApiKey: true`
   - `hasRecipientEmail: true`
   - `recipientEmail: tu-email@gmail.com`

### Opción 2: Test desde el admin
1. Ve al panel de admin: `http://localhost:3000/admin`
2. Haz cualquier cambio (agregar, editar o eliminar un producto)
3. Observa en la interfaz:
   - Mensaje: "Enviando notificación..."
   - Después: "✅ Notificación enviada"
4. Revisa tu email (puede tardar unos segundos)

### Opción 3: Verificar logs
Abre la consola del servidor y busca mensajes como:
```
📧 Iniciando envío de notificación por email...
📋 Variables de entorno disponibles: { hasApiKey: true, ... }
✅ Notificación enviada exitosamente
```

## 📧 ¿Qué notificaciones recibirás?

Una vez configurado, recibirás emails automáticamente cuando:

- ✅ **AGREGAR** - Agregas un nuevo producto al menú
- ✅ **EDITAR** - Editas un producto existente  
- ✅ **ELIMINAR** - Eliminas un producto
- ✅ **OCULTAR** - Ocultas un producto (lo haces invisible en el menú público)
- ✅ **MOSTRAR** - Muestras un producto (lo haces visible nuevamente)

Cada email incluye:
- 📋 Todos los detalles del producto
- 🕒 Fecha y hora exacta del cambio
- 💻 Información del sistema (IP, User Agent)
- 🎨 Diseño HTML profesional y responsive

## 🎯 Límites y Costos

### Plan Gratuito Resend:
- ✅ **3,000 emails/mes** - Más que suficiente
- ✅ **100 emails por día**
- ✅ **Sin tarjeta de crédito requerida**
- ✅ **Entrega rápida y confiable**

### Si necesitas más (poco probable):
- 💰 **$20/mes** = 50,000 emails/mes
- 💰 Planes personalizados para volumen mayor

## 🔧 Personalización

### Cambiar el email destinatario:
Edita `.env.local`:
```env
RECIPIENT_EMAIL=nuevo_email@ejemplo.com
```

### Agregar múltiples destinatarios:
Edita el archivo `app/api/send-notification/route.ts` en la línea 317:
```typescript
to: ['email1@ejemplo.com', 'email2@ejemplo.com', 'email3@ejemplo.com']
```

### Personalizar el remitente (requiere dominio verificado):
En el mismo archivo, cambia la línea 316:
```typescript
from: 'COBRA Restaurant <notifications@tu-dominio.com>'
```

⚠️ **Nota**: Para usar tu propio dominio, debes verificarlo en Resend. El email `onboarding@resend.dev` funciona sin verificación para pruebas.

### Personalizar el diseño del email:
Edita la función `generateEmailContent()` en `app/api/send-notification/route.ts` (líneas 23-240).

## ❗ Solución de Problemas

### ❌ No recibo emails:

1. **Verifica spam/promociones** - Los emails pueden llegar ahí inicialmente
2. **Revisa las variables de entorno** en `.env.local`:
   ```bash
   # En PowerShell:
   Get-Content .env.local
   ```
3. **Verifica que el servidor se haya reiniciado** después de cambiar `.env.local`
4. **Comprueba la consola del servidor** - busca mensajes de error
5. **Revisa el dashboard de Resend**:
   - Ve a [https://resend.com/emails](https://resend.com/emails)
   - Verifica el estado de los envíos
6. **Prueba el endpoint de test**: `http://localhost:3000/api/test`

### ❌ Error "Missing API key":

1. Verifica que la API Key esté en `.env.local`
2. Asegúrate de que empiece con `re_`
3. Verifica que no haya espacios extras
4. **Reinicia el servidor** después de cambiar `.env.local`

### ❌ Error "401 Unauthorized":

- Tu API Key es inválida o ha sido revocada
- Genera una nueva en el dashboard de Resend

### ❌ Error "403 Forbidden":

- Tu cuenta de Resend puede no tener permisos de envío
- Verifica que tu cuenta esté verificada

### ❌ Variables de entorno no se cargan:

1. Asegúrate de que el archivo se llame exactamente `.env.local`
2. El archivo debe estar en la raíz del proyecto
3. **Reinicia completamente el servidor** (no solo recarga):
   ```bash
   # Ctrl+C para detener
   pnpm dev  # para reiniciar
   ```

### ❌ Los logs no aparecen:

- Revisa la terminal donde ejecutas `pnpm dev` (no la consola del navegador)
- Los logs del servidor aparecen ahí

## 🔍 Debugging

Si los emails no llegan, sigue estos pasos en orden:

1. **Test básico de configuración**:
   ```bash
   # Abre: http://localhost:3000/api/test
   # Debe mostrar hasApiKey: true
   ```

2. **Verifica los logs del servidor** al hacer un cambio en el admin:
   ```
   📧 Iniciando envío de notificación por email...
   ✅ Notificación enviada exitosamente: { id: '...', ... }
   ```

3. **Revisa el dashboard de Resend**:
   - [https://resend.com/emails](https://resend.com/emails)
   - Verás todos los emails enviados y su estado

4. **Prueba con otro email** para descartar problemas con el destinatario

## 🚀 ¡Listo!

Una vez configurado correctamente:

- ✅ Cada cambio en el menú enviará automáticamente un email
- ✅ Los emails incluyen diseño profesional y toda la información
- ✅ Recibirás notificaciones en tiempo real
- ✅ Puedes revisar el historial en el dashboard de Resend

---

## 📚 Recursos Adicionales

- [Documentación de Resend](https://resend.com/docs)
- [Dashboard de Resend](https://resend.com/emails)
- [Verificar dominio personalizado](https://resend.com/docs/send-with-nextjs)

---

**Desarrollado por AKDMIA Studio y livv Studio** 
[https://akdmiastudio.io/](https://akdmiastudio.io/)
