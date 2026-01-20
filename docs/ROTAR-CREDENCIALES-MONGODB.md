# 🔐 Instrucciones para Rotar Credenciales de MongoDB

## ⚠️ CRÍTICO - Acción Manual Requerida

La contraseña de MongoDB (`DZockhrxdSA7m1BC`) está actualmente en `.env.local`. Si este archivo fue commiteado a Git en algún momento, las credenciales están expuestas públicamente.

---

## Paso 1: Verificar Exposición en Git

```powershell
cd "C:\Users\Mateo\Desktop\AKDMIA\Cobra 2.0"
git log --all --full-history -- .env.local
```

**Si aparece output:** El archivo fue commiteado → Credenciales EXPUESTAS  
**Si NO aparece output:** El archivo nunca fue commiteado → Solo rotar por precaución

---

## Paso 2: Rotar Credencial en MongoDB Atlas

1. **Ir a MongoDB Atlas:**
   - https://cloud.mongodb.com
   - Login con tu cuenta

2. **Acceder a Database Access:**
   - Menú lateral → "Database Access"
   - Buscar usuario: `Cobra_admin`

3. **Cambiar contraseña:**
   - Click en "Edit" junto a `Cobra_admin`
   - Click en "Edit Password"
   - Seleccionar "Autogenerate Secure Password" o ingresar una nueva
   - **IMPORTANTE:** Copiar la nueva contraseña

4. **Construir nuevo MONGODB_URI:**
```
mongodb+srv://Cobra_admin:<NUEVA_CONTRASEÑA>@cobra.3s87ikq.mongodb.net/cobra?retryWrites=true&w=majority
```

---

## Paso 3: Actualizar en Todos los Ambientes

### ✅ Local (Development)

Editar `.env.local`:
```bash
MONGODB_URI=mongodb+srv://Cobra_admin:<NUEVA_CONTRASEÑA>@cobra.3s87ikq.mongodb.net/cobra?retryWrites=true&w=majority
```

Verificar:
```powershell
npm run dev
# Abrir http://localhost:3000 y verificar que funciona
```

---

### ✅ Vercel (Production)

1. **Ir a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Seleccionar proyecto Cobra 2.0

2. **Actualizar variable:**
   - Settings → Environment Variables
   - Buscar `MONGODB_URI`
   - Click "Edit"
   - Pegar nuevo valor
   - Save

3. **Redeploy:**
   - Deployments → Latest deployment
   - Click "..." → "Redeploy"
   - O hacer push a main para trigger auto-deploy

---

### ✅ Hostinger VPS (si aplica)

```bash
# SSH al servidor
ssh usuario@tu-vps-hostinger.com

# Navegar al proyecto
cd ~/cobramenu  # O donde esté instalado

# Editar .env.local
nano .env.local
# Actualizar MONGODB_URI con nueva contraseña
# Ctrl+O para guardar, Ctrl+X para salir

# Reiniciar aplicación
pm2 restart cobra-app

# Verificar logs
pm2 logs cobra-app --lines 50
```

---

## Paso 4: Limpiar Historial de Git (Si fue commiteado)

⚠️ **SOLO si el Paso 1 mostró que .env.local está en Git**

### Opción A: BFG Repo-Cleaner (Recomendado)

```powershell
# 1. Descargar BFG
# https://rtyley.github.com/bfg-repo-cleaner/

# 2. Hacer backup
git clone --mirror https://github.com/tu-usuario/cobra-repo.git cobra-backup.git

# 3. Limpiar
java -jar bfg.jar --delete-files .env.local cobra-backup.git

# 4. Forzar limpieza
cd cobra-backup.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Push forzado (¡PELIGROSO! Solo si estás seguro)
git push --force
```

### Opción B: git-filter-repo (Alternativa)

```powershell
# Instalar
pip install git-filter-repo

# Ejecutar
git filter-repo --invert-paths --path .env.local

# Push forzado
git push origin --force --all
```

---

## Paso 5: Verificación Final

### ✅ Checklist

- [ ] Nueva contraseña generada en MongoDB Atlas
- [ ] `.env.local` local actualizado y funcionando
- [ ] Vercel environment variables actualizadas
- [ ] VPS `.env.local` actualizado (si aplica)
- [ ] Aplicaciones redes ployed y funcionando
- [ ] Historial de Git limpiado (si fue necesario)

### Probar Conexión

```powershell
# Local
npm run dev
# Abrir http://localhost:3000/admin
# Verificar que funciona

# Production
# Abrir https://tu-dominio.com/admin
# Verificar que funciona
```

---

## 🆘 Troubleshooting

**Error: "MongoServerError: bad auth"**
- La contraseña nueva no coincide
- Verificar que copiaste correctamente
- Verificar que no hay espacios extra

**Error: "MongooseError: connection timeout"**
- IP no está whitelisted en MongoDB Atlas
- Security → Network Access → Add IP Address → 0.0.0.0/0 (permitir todas)

**Sitio no funciona después de cambiar**
- Verificar logs: `pm2 logs` (VPS) o Vercel dashboard
- Rollback a contraseña anterior temporalmente
- Revisar que MONGODB_URI tiene formato correcto

---

## 📋 Notas Importantes

- **No commitear `.env.local`** nunca más (ya está en `.gitignore`)
- **Rotar contraseña cada 90 días** como buena práctica
- **Usar MongoDB Atlas IP Whitelist** en vez de 0.0.0.0/0 en producción
- **Habilitar 2FA** en cuenta de MongoDB Atlas

---

**Fecha de esta rotación:** _____________________  
**Próxima rotación recomendada:** _____________________ (90 días después)
