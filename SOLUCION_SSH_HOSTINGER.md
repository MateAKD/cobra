# 🔧 Solución: No Puedo Conectarme al VPS por SSH (Hostinger)

## 🚨 Problema Actual

- ❌ `ssh deploy@72.61.43.32` → Connection timed out
- ❌ Ping no responde
- ❌ El servidor parece estar inaccesible

## ✅ Soluciones (En Orden de Prioridad)

### Solución 1: Habilitar SSH desde el Panel de Hostinger (MÁS PROBABLE)

Hostinger requiere habilitar SSH manualmente desde el panel de control:

#### Paso 1: Acceder al hPanel
1. Ve a **https://hpanel.hostinger.com**
2. Inicia sesión con tus credenciales
3. Selecciona tu **VPS** o **Cloud Hosting**

#### Paso 2: Habilitar SSH
1. En el panel, busca la sección **"SSH Access"** o **"Acceso SSH"**
2. Si no la ves, busca en:
   - **"Advanced"** → **"SSH Access"**
   - **"Security"** → **"SSH Access"**
   - **"Server Management"** → **"SSH Access"**

3. **Habilita SSH** (puede haber un toggle o botón)
4. **Anota la información de conexión** que te muestre:
   - Usuario (puede ser diferente a "deploy")
   - Puerto SSH (puede no ser 22)
   - IP del servidor

#### Paso 3: Verificar Firewall
En el mismo panel, verifica:
- **Firewall** → Asegúrate que el puerto 22 (o el puerto SSH que te dieron) esté abierto
- **Security** → Verifica que no haya restricciones de IP

#### Paso 4: Intentar Conectarse Nuevamente
```bash
# Si te dieron un puerto diferente
ssh -p PUERTO usuario@72.61.43.32

# Ejemplo si el puerto es 2222
ssh -p 2222 deploy@72.61.43.32
```

---

### Solución 2: Usar el Terminal Web de Hostinger

Si SSH sigue sin funcionar, Hostinger ofrece un terminal web:

1. En **hPanel**, busca **"Terminal"** o **"Web Terminal"**
2. Accede al terminal desde el navegador
3. Ejecuta los comandos directamente desde ahí

**Ventaja:** No necesitas SSH configurado
**Desventaja:** Menos cómodo que SSH local

---

### Solución 3: Verificar que el VPS Esté Activo

#### Desde hPanel:
1. Ve a **"VPS Management"** o **"Servers"**
2. Verifica el **estado del servidor**:
   - ✅ Debe estar **"Running"** o **"Activo"**
   - ❌ Si está **"Stopped"** o **"Paused"**, inícialo

3. Si está detenido, haz clic en **"Start"** o **"Iniciar"**

#### Verificar IP:
- La IP puede haber cambiado
- Verifica la IP actual en el panel
- Puede ser diferente a `72.61.43.32`

---

### Solución 4: Contactar Soporte de Hostinger

Si nada funciona:

1. **Chat en vivo:** https://www.hostinger.com/contact
2. **Email:** support@hostinger.com
3. **Mensaje sugerido:**
   ```
   Hola, no puedo conectarme a mi VPS por SSH.
   IP: 72.61.43.32
   Usuario: deploy
   Error: Connection timed out en puerto 22
   
   ¿Pueden verificar:
   1. Si SSH está habilitado en mi cuenta?
   2. Si el puerto 22 está abierto?
   3. Si hay alguna restricción de firewall?
   
   Gracias.
   ```

---

### Solución 5: Alternativa - Usar File Manager + Deploy Manual

Si SSH no está disponible, puedes subir cambios manualmente:

#### Opción A: File Manager de Hostinger
1. En **hPanel**, busca **"File Manager"**
2. Navega a `/var/www/cobra` (o donde esté tu proyecto)
3. Sube los archivos modificados manualmente
4. Usa el **Terminal Web** para ejecutar:
   ```bash
   cd /var/www/cobra
   pnpm install
   pnpm build
   pm2 restart cobramenu
   ```

#### Opción B: Usar GitHub + Pull desde Terminal Web
1. Asegúrate de que tus cambios estén en GitHub (✅ ya lo hicimos)
2. Accede al **Terminal Web** de Hostinger
3. Ejecuta:
   ```bash
   cd /var/www/cobra
   git pull origin main
   pnpm install
   pnpm build
   pm2 restart cobramenu
   ```

---

## 🔍 Diagnóstico Adicional

### Verificar si el Servidor Web Está Activo

Abre en tu navegador:
- `http://72.61.43.32`
- O tu dominio si está configurado

**Si el sitio web funciona:**
- ✅ El servidor está activo
- ✅ El problema es solo con SSH
- ✅ Usa el Terminal Web o File Manager

**Si el sitio web NO funciona:**
- ❌ El servidor puede estar caído
- ❌ Contacta soporte de Hostinger urgentemente

---

## 📋 Checklist de Verificación

Antes de contactar soporte, verifica:

- [ ] ¿Puedes acceder a hPanel de Hostinger?
- [ ] ¿El VPS aparece como "Running" en el panel?
- [ ] ¿Has habilitado SSH desde el panel?
- [ ] ¿Has verificado la IP actual del VPS?
- [ ] ¿El sitio web funciona (http://72.61.43.32)?
- [ ] ¿Has probado el Terminal Web de Hostinger?

---

## 🚀 Solución Temporal: Deploy sin SSH

Mientras resuelves el problema de SSH, puedes actualizar el VPS así:

### Método 1: Terminal Web de Hostinger
1. Accede a hPanel
2. Abre el Terminal Web
3. Ejecuta estos comandos:

```bash
cd /var/www/cobra

# Hacer pull de los últimos cambios
git pull origin main

# Instalar dependencias si hay cambios
pnpm install

# Rebuild
pnpm build

# Reiniciar la aplicación
pm2 restart cobramenu

# Verificar que todo esté bien
pm2 status
pm2 logs cobramenu --lines 20
```

### Método 2: File Manager + Terminal Web
1. Usa File Manager para verificar que los archivos estén actualizados
2. Usa Terminal Web para ejecutar los comandos de build y restart

---

## 💡 Prevención Futura

Una vez que SSH funcione:

1. **Configura SSH Keys** (más seguro que contraseña):
   ```bash
   # En tu computadora
   ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
   
   # Copiar la clave pública
   cat ~/.ssh/id_ed25519.pub
   
   # En el VPS, agregar a authorized_keys
   # (desde Terminal Web o cuando SSH funcione)
   ```

2. **Configura un alias** para conectarte más fácil:
   ```bash
   # En Windows PowerShell, edita tu perfil
   notepad $PROFILE
   
   # Agrega:
   function ssh-cobra {
       ssh -p PUERTO deploy@72.61.43.32
   }
   ```

3. **Documenta la información de conexión:**
   - IP del VPS
   - Usuario SSH
   - Puerto SSH
   - Ubicación del proyecto en el VPS

---

## 📞 Información de Contacto Hostinger

- **Chat en vivo:** https://www.hostinger.com/contact
- **Email:** support@hostinger.com
- **Centro de ayuda:** https://support.hostinger.com
- **Horario:** 24/7

---

## ✅ Próximos Pasos Recomendados

1. **AHORA:** Accede a hPanel y verifica/habilita SSH
2. **SI SSH funciona:** Usa el script `deploy.sh` desde tu computadora
3. **SI SSH NO funciona:** Usa Terminal Web de Hostinger para hacer pull y deploy
4. **LARGO PLAZO:** Configura SSH keys y automatiza el deploy

---

**¿Necesitas ayuda con algún paso específico?** Avísame y te guío paso a paso.



