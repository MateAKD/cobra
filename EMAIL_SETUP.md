# 📧 Configuración de Notificaciones por Email - EmailJS

## 🚀 Setup Rápido (5 minutos)

### 1. Crear cuenta en EmailJS
1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita
3. Confirma tu email

### 2. Configurar Servicio de Email
1. En el dashboard, ve a **"Email Services"**
2. Haz clic en **"Add New Service"**
3. Selecciona **"Gmail"** (recomendado)
4. Conecta tu cuenta de Gmail
5. **Copia el Service ID** (ej: `service_abc123`)

### 3. Crear Plantilla de Email
1. Ve a **"Email Templates"**
2. Haz clic en **"Create New Template"**
3. Usa esta plantilla:

```html
Asunto: 🔔 Cambio en el Menú COBRA - {{action}}

Hola,

Se ha realizado un cambio en el menú del restaurante COBRA:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETALLES DEL CAMBIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔸 Acción: {{action}}
🔸 Producto: {{product_name}}
🔸 Descripción: {{product_description}}
🔸 Precio: ${{product_price}}
🔸 Sección: {{product_section}}
🔸 Etiquetas: {{product_tags}}

{{#reason}}
🔸 Motivo: {{reason}}
{{/reason}}

{{#hidden_by}}
🔸 {{#action}}OCULTADO{{/action}}{{^action}}MOSTRADO{{/action}} por: {{hidden_by}}
{{/hidden_by}}

{{#ingredients}}
🔸 Ingredientes: {{ingredients}}
{{/ingredients}}

{{#glass}}
🔸 Vaso: {{glass}}
{{/glass}}

{{#technique}}
🔸 Técnica: {{technique}}
{{/technique}}

{{#garnish}}
🔸 Garnish: {{garnish}}
{{/garnish}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 INFORMACIÓN DEL SISTEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕒 Fecha y Hora: {{timestamp}}
🌐 User Agent: {{user_agent}}
💻 IP: {{user_ip}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este email fue generado automáticamente por el Panel de Administración de COBRA.

Saludos,
Sistema de Notificaciones COBRA
```

4. **Copia el Template ID** (ej: `template_abc123`)

### 4. Obtener Public Key
1. Ve a **"Account"** en el menú
2. En **"General"**, encuentra tu **Public Key**
3. **Copia el Public Key** (ej: `abc123xyz`)

### 5. Configurar Variables de Entorno
1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega estas líneas (reemplaza con tus valores reales):

```env
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_abc123
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=abc123xyz
NEXT_PUBLIC_RECIPIENT_EMAIL=matepedace@gmail.com
```

### 6. Reiniciar el Servidor
```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar:
pnpm dev
```

## ✅ Verificar que Funciona

1. Ve al panel de admin: `http://localhost:3000/admin`
2. Agrega, edita o elimina un producto
3. Deberías ver:
   - Indicador de estado: "Enviando notificación..."
   - Después: "✅ Notificación enviada"
   - Email en tu bandeja de entrada

## 🎯 Límites y Costos

### Plan Gratuito EmailJS:
- ✅ **200 emails/mes** - Suficiente para un restaurante
- ✅ **Plantillas ilimitadas**
- ✅ **Sin costo** por setup

### Si necesitas más:
- 💰 **$15/mes** = 1,000 emails/mes
- 💰 **$25/mes** = 2,500 emails/mes

## 🔧 Personalización

### Cambiar el email destinatario:
Modifica `NEXT_PUBLIC_RECIPIENT_EMAIL` en `.env.local`

### Agregar múltiples destinatarios:
En la plantilla de EmailJS, cambia el campo "To" a:
```
matepedace@gmail.com,otro@email.com,tercero@email.com
```

### Personalizar la plantilla:
1. Ve a EmailJS → Templates
2. Edita la plantilla existente
3. Guarda los cambios

## ❗ Solución de Problemas

### No recibo emails:
1. ✅ Revisa spam/promociones
2. ✅ Verifica las variables de entorno
3. ✅ Comprueba la consola del navegador

### Error de configuración:
1. ✅ Asegúrate de que las variables empiecen con `NEXT_PUBLIC_`
2. ✅ Reinicia el servidor después de cambiar `.env.local`
3. ✅ Verifica que los IDs no tengan espacios extra

### Límite excedido:
1. ✅ Revisa tu dashboard de EmailJS
2. ✅ Considera upgradeear el plan si es necesario

## 🚀 ¡Listo!

Una vez configurado, cada cambio en el menú enviará automáticamente una notificación por email con todos los detalles del cambio realizado.

---

**Desarrollado por AKDMIA Studio y livv Studio** 
[https://akdmiastudio.io/](https://akdmiastudio.io/)
