# 🔧 Solución de Problemas: Subir Cambios al VPS

## ✅ Verificación Local (Completada)

- ✅ Repositorio local sincronizado con GitHub
- ✅ Push a GitHub funciona correctamente
- ✅ No hay cambios pendientes localmente

## 🔍 Diagnóstico del Problema en el VPS

### Paso 1: Conectarse al VPS

```bash
ssh root@TU_IP_VPS
# o
ssh usuario@TU_IP_VPS
```

### Paso 2: Verificar el Estado del Repositorio en el VPS

```bash
cd /var/www/cobra
git status
```

**Posibles problemas y soluciones:**

#### Problema A: El VPS no puede hacer pull de GitHub

**Síntomas:**
- Error: "Permission denied (publickey)"
- Error: "Could not read from remote repository"

**Solución:**
```bash
# Verificar que el repositorio remoto está configurado
git remote -v

# Si necesitas autenticación, usar HTTPS con token o configurar SSH
# Opción 1: Usar token de GitHub
git remote set-url origin https://TU_TOKEN@github.com/MateAKD/cobra.git

# Opción 2: Configurar SSH key
ssh-keygen -t ed25519 -C "vps@cobra"
# Luego agregar la clave pública a GitHub
cat ~/.ssh/id_ed25519.pub
```

#### Problema B: Conflictos de merge en el VPS

**Síntomas:**
- Error: "Your local changes to the following files would be overwritten by merge"

**Solución:**
```bash
# Hacer backup de los datos primero
mkdir -p backups
cp data/*.json backups/ 2>/dev/null

# Hacer stash de cambios locales
git stash

# Hacer pull
git pull origin main

# Restaurar datos si es necesario
cp backups/*.json data/ 2>/dev/null
```

#### Problema C: El directorio no es un repositorio Git

**Síntomas:**
- Error: "not a git repository"

**Solución:**
```bash
cd /var/www/cobra
git init
git remote add origin https://github.com/MateAKD/cobra.git
git fetch origin
git checkout -b main origin/main
```

### Paso 3: Usar el Script de Deploy

Una vez que el repositorio esté correcto, ejecuta el script de deploy:

```bash
cd /var/www/cobra
bash deploy.sh
```

**Si el script falla, ejecuta los pasos manualmente:**

```bash
# 1. Hacer pull
git pull origin main

# 2. Instalar dependencias
pnpm install

# 3. Build
pnpm build

# 4. Reiniciar PM2
pm2 restart cobramenu

# 5. Verificar estado
pm2 status
pm2 logs cobramenu --lines 20
```

### Paso 4: Verificar Permisos

Si hay errores de permisos:

```bash
# Verificar permisos del directorio
ls -la /var/www/cobra

# Corregir permisos si es necesario
chown -R www-data:www-data /var/www/cobra
chmod -R 755 /var/www/cobra
```

### Paso 5: Verificar que PM2 está Corriendo

```bash
# Ver estado
pm2 status

# Si la app no está corriendo, iniciarla
pm2 start ecosystem.config.js
# o
pm2 start npm --name "cobramenu" -- start

# Guardar configuración
pm2 save
pm2 startup
```

## 🚀 Método Alternativo: Deploy Manual

Si el script de deploy no funciona, puedes hacerlo manualmente:

```bash
cd /var/www/cobra

# 1. Hacer pull
git fetch origin
git reset --hard origin/main

# 2. Limpiar y reinstalar
rm -rf node_modules
rm -rf .next
pnpm install

# 3. Build
pnpm build

# 4. Reiniciar
pm2 restart cobramenu

# 5. Ver logs
pm2 logs cobramenu
```

## 📋 Checklist de Verificación

- [ ] Puedo conectarme al VPS via SSH
- [ ] El directorio `/var/www/cobra` existe
- [ ] Es un repositorio Git válido
- [ ] Puedo hacer `git pull origin main` sin errores
- [ ] `pnpm` está instalado
- [ ] `pm2` está instalado y la app está corriendo
- [ ] Los permisos del directorio son correctos
- [ ] El archivo `.env.production` existe y está configurado

## 🆘 Si Nada Funciona

1. **Verifica los logs de PM2:**
   ```bash
   pm2 logs cobramenu --lines 100
   ```

2. **Verifica los logs del sistema:**
   ```bash
   journalctl -u cobramenu -n 50
   # o
   tail -f /var/log/nginx/error.log
   ```

3. **Verifica la conexión a internet del VPS:**
   ```bash
   ping github.com
   curl https://github.com
   ```

4. **Verifica el espacio en disco:**
   ```bash
   df -h
   ```

## 📞 Información Útil

- **Repositorio:** https://github.com/MateAKD/cobra.git
- **Rama:** main
- **Directorio en VPS:** /var/www/cobra
- **Nombre de la app en PM2:** cobramenu



