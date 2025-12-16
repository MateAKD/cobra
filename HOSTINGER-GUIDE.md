# Guía de Despliegue en Hostinger (Plan Web)

Esta guía te permite subir tu aplicación Next.js a un plan de Hosting Compartido/Cloud de Hostinger de forma segura y optimizada, evitando los errores comunes de "node_modules" y tiempos de carga.

## 1. Preparar los Archivos

1.  En tu computadora, haz doble click en el archivo `HOSTINGER-DEPLOY.bat` que acabamos de crear.
    *   Esto ejecutará el `build` y copiará los archivos necesarios a una carpeta especial limpia.
2.  Cuando termine, ve a la carpeta `.next\standalone`.
3.  **IMPORTANTE**: Selecciona **TODO** el contenido dentro de esa carpeta (`.next`, `public`, `server.js`, `package.json`, etc.).
4.  Haz click derecho -> Enviar a -> Carpeta comprimida (ZIP).
5.  Nómbralo `deploy.zip`.

## 2. Subir a Hostinger

1.  Entra a tu **hPanel** de Hostinger.
2.  Ve a **Administrador de Archivos** (File Manager).
3.  Entra a la carpeta `domains` -> `tudominio.com` -> `public_html`.
4.  **Borra todo** lo que haya ahí (asegúrate de hacer backup si tenías algo importante antes).
5.  Sube tu archivo `deploy.zip`.
6.  Haz click derecho en `deploy.zip` y selecciona **Extract** (Extraer).
    *   Asegúrate de extraerlo directamente en `public_html` (o `.` si te pide ruta).
7.  Ahora deberías ver `server.js`, `package.json` y las carpetas `.next` y `public` directamente en `public_html`.

## 3. Configurar Node.js en Hostinger

1.  En el **hPanel**, busca la sección **Avanzado** y haz click en **Node.js**.
2.  Si no tienes una aplicación creada, crea una nueva:
    *   **Versión de Node.js**: Elije la recomendada (18 o 20, preferiblemente **20**).
    *   **Modo de aplicación**: **Production**.
    *   **Raíz de la aplicación (Application Root)**: `public_html` (o la ruta donde subiste los archivos).
    *   **Archivo de inicio de aplicación (Application Startup File)**: `server.js` (Esto es muy importante).
3.  Haz click en **Crear**.

## 4. Configurar Variables de Entorno

1.  En la misma pantalla de Node.js en Hostinger, verás un botón **Variables de Entorno** (o Environment Variables).
2.  Agrega tu conexión a la base de datos:
    *   **Clave (Key)**: `MONGODB_URI`
    *   **Valor (Value)**: `(Pega aquí tu conexión de MongoDB Atlas)`
3.  Agrega cualquier otra variable que tengas en tu `.env.local` (como `NEXTAUTH_SECRET`, etc.).

## 5. Iniciar la App

1.  Una vez creada la app y puestas las variables, haz click en **Instalar Dependencias** (NPM Install).
    *   *Nota: Al usar el método Standalone, esto debería ser muy rápido o incluso innecesario, pero hazlo por seguridad inicial.*
2.  Finalmente, haz click en **Reiniciar** o **Start**.

¡Listo! Tu web debería estar funcionando en tu dominio sin necesidad de VPS complejo.
