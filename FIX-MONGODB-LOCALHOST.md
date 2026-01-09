# Cómo Arreglar el Error de MongoDB en Localhost

## El Problema
El error "Error al cargar los datos del menú" ocurre porque tu archivo `.env.local` tiene credenciales incorrectas para MongoDB Atlas.

## Solución

### 1. Verifica tus Credenciales en MongoDB Atlas
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Inicia sesión con tu cuenta
3. Ve a **Database Access** (en el menú lateral)
4. Verifica que el usuario existe y **anota el nombre de usuario**
5. Si necesitas resetear la contraseña:
   - Haz clic en **Edit** junto al usuario
   - Haz clic en **Edit Password**
   - Genera una nueva contraseña SEGURA y **guárdala**

### 2. Actualiza el Archivo `.env.local`
Abre el archivo `c:\Users\Mateo\Desktop\AKDMIA\Cobra 2.0\.env.local` y busca la línea que dice:

```
MONGODB_URI=mongodb+srv://...
```

Debe tener este formato:
```
MONGODB_URI=mongodb+srv://USUARIO:CONTRASEÑA@cluster.mongodb.net/NombreDB?retryWrites=true&w=majority
```

**Reemplaza:**
- `USUARIO` con tu nombre de usuario de MongoDB
- `CONTRASEÑA` con la contraseña correcta (la que acabas de anotar/crear)
- `cluster.mongodb.net` con tu cluster real
- `NombreDB` con el nombre de tu base de datos (probablemente `Cobrab` o similar)

### 3. Guarda y Reinicia
1. Guarda el archivo `.env.local`
2. En la terminal donde está corriendo `npm run dev`, presiona `Ctrl+C` para detenerlo
3. Vuelve a ejecutar: `npm run dev`
4. Recarga [http://localhost:3000](http://localhost:3000) en tu navegador

## Verificación
Si todo está bien, verás el menú cargando correctamente sin errores en la consola.

## Notas Importantes
- **NUNCA** compartas tu archivo `.env.local` públicamente
- La contraseña NO debe contener caracteres especiales como `@`, `#`, `%` sin codificar
- Si la contraseña tiene caracteres especiales, debes codificarlos en formato URL (por ejemplo, `@` → `%40`)
