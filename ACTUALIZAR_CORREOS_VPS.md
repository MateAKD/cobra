# 📧 Guía: Actualizar Correos de Notificación en el VPS

## 📋 Resumen

Los correos de notificación se configuran mediante la variable de entorno `RECIPIENT_EMAIL` en el archivo `.env.production` del VPS. El sistema soporta **múltiples correos separados por comas**.

---

## 🚀 Método 1: Actualización Manual (Recomendado)

### Paso 1: Conectarse al VPS

```bash
ssh root@TU_IP_VPS
# o
ssh usuario@TU_IP_VPS
```

### Paso 2: Ir al directorio del proyecto

```bash
cd /var/www/cobra
```

### Paso 3: Editar el archivo .env.production

```bash
nano .env.production
# o si prefieres vim:
# vim .env.production
```

### Paso 4: Buscar y actualizar RECIPIENT_EMAIL

Busca la línea que dice:
```env
RECIPIENT_EMAIL=email1@gmail.com,email2@gmail.com
```

**Reemplázala con tus nuevos correos:**
```env
RECIPIENT_EMAIL=correo1@gmail.com,correo2@gmail.com,correo3@gmail.com
```

**Ejemplo real:**
```env
RECIPIENT_EMAIL=gabo.cortese@gmail.com,aagustinperezv@gmail.com,Mngomeze@gmail.com
```

### Paso 5: Guardar y salir

- **En nano:** Presiona `Ctrl + X`, luego `Y`, luego `Enter`
- **En vim:** Presiona `Esc`, luego escribe `:wq` y presiona `Enter`

### Paso 6: Reiniciar la aplicación

```bash
pm2 restart cobramenu
```

**Si el nombre de la app es diferente:**
```bash
pm2 restart cobra-app
# o
pm2 restart all
```

### Paso 7: Verificar que se aplicaron los cambios

```bash
# Ver la configuración actual
grep RECIPIENT_EMAIL .env.production

# Ver logs para confirmar que está usando los nuevos correos
pm2 logs cobramenu --lines 20
```

---

## 🔧 Método 2: Actualización con Comando Directo (Rápido)

Si prefieres hacerlo todo en un solo comando:

```bash
# Conectarse al VPS
ssh root@TU_IP_VPS

# Ir al proyecto
cd /var/www/cobra

# Actualizar RECIPIENT_EMAIL (reemplaza con tus correos)
sed -i 's|^RECIPIENT_EMAIL=.*|RECIPIENT_EMAIL=correo1@gmail.com,correo2@gmail.com,correo3@gmail.com|' .env.production

# Si no existe la línea, agregarla
if ! grep -q "RECIPIENT_EMAIL" .env.production; then
    echo "RECIPIENT_EMAIL=correo1@gmail.com,correo2@gmail.com,correo3@gmail.com" >> .env.production
fi

# Reiniciar la app
pm2 restart cobramenu

# Verificar
grep RECIPIENT_EMAIL .env.production
```

---

## 📝 Método 3: Crear/Verificar .env.production Completo

Si el archivo `.env.production` no existe o quieres asegurarte de que tenga toda la configuración:

```bash
cd /var/www/cobra

# Crear/actualizar .env.production
cat > .env.production << 'EOF'
# Panel de Admin
ADMIN_PASSWORD=tu_contraseña_aqui

# Resend (Servicio de Email)
RESEND_API_KEY=re_tu_api_key_aqui

# Email destinatario para notificaciones (múltiples separados por comas)
RECIPIENT_EMAIL=correo1@gmail.com,correo2@gmail.com,correo3@gmail.com

# Next.js
NODE_ENV=production
PORT=3000
EOF

# Reiniciar la app
pm2 restart cobramenu
```

**⚠️ IMPORTANTE:** Reemplaza:
- `tu_contraseña_aqui` con tu contraseña de admin
- `re_tu_api_key_aqui` con tu API key de Resend
- Los correos con los emails reales donde quieres recibir notificaciones

---

## ✅ Verificación

### 1. Verificar que el archivo tiene los correos correctos

```bash
cd /var/www/cobra
cat .env.production | grep RECIPIENT_EMAIL
```

**Debe mostrar:**
```
RECIPIENT_EMAIL=correo1@gmail.com,correo2@gmail.com,correo3@gmail.com
```

### 2. Verificar que PM2 está corriendo

```bash
pm2 status
```

**Debe mostrar la app como `online`**

### 3. Probar que los correos funcionan

1. Ve al panel de admin: `https://tu-dominio.com/admin`
2. Haz un cambio (agregar, editar o eliminar un producto)
3. Revisa los correos configurados - deberían recibir la notificación

### 4. Ver logs para confirmar

```bash
pm2 logs cobramenu --lines 30
```

**Busca líneas como:**
```
📧 Destinatarios a enviar: [ 'correo1@gmail.com', 'correo2@gmail.com', 'correo3@gmail.com' ]
📊 Total de destinatarios: 3
✅ Email enviado a correo1@gmail.com: ...
```

---

## 📌 Formato de Correos

### ✅ Formato Correcto

```env
# Un solo correo
RECIPIENT_EMAIL=correo@gmail.com

# Múltiples correos (separados por comas, sin espacios)
RECIPIENT_EMAIL=correo1@gmail.com,correo2@gmail.com,correo3@gmail.com

# Múltiples correos (con espacios después de comas - también funciona)
RECIPIENT_EMAIL=correo1@gmail.com, correo2@gmail.com, correo3@gmail.com
```

### ❌ Formatos Incorrectos

```env
# NO uses punto y coma
RECIPIENT_EMAIL=correo1@gmail.com;correo2@gmail.com

# NO uses espacios antes de las comas
RECIPIENT_EMAIL=correo1@gmail.com , correo2@gmail.com

# NO uses comillas
RECIPIENT_EMAIL="correo1@gmail.com,correo2@gmail.com"
```

---

## 🆘 Solución de Problemas

### ❌ No recibo correos después de actualizar

**Solución:**
1. Verifica que reiniciaste PM2:
   ```bash
   pm2 restart cobramenu
   ```

2. Verifica que el archivo tiene el formato correcto:
   ```bash
   cat .env.production | grep RECIPIENT_EMAIL
   ```

3. Verifica los logs para ver errores:
   ```bash
   pm2 logs cobramenu --lines 50
   ```

4. Verifica que la API key de Resend es válida:
   ```bash
   grep RESEND_API_KEY .env.production
   ```

### ❌ El archivo .env.production no existe

**Solución:**
```bash
cd /var/www/cobra
cp env.production.template .env.production
nano .env.production
# Edita los valores y guarda
pm2 restart cobramenu
```

### ❌ Error: "Permission denied" al editar

**Solución:**
```bash
# Si eres root, no debería haber problema
# Si usas otro usuario, puede necesitar permisos:
sudo nano .env.production
# o
sudo chown usuario:usuario .env.production
```

### ❌ Los cambios no se aplican

**Solución:**
1. Asegúrate de reiniciar PM2 después de cambiar `.env.production`
2. Verifica que no hay errores de sintaxis en el archivo
3. Verifica que no hay espacios extra o caracteres raros
4. Revisa los logs de PM2 para ver si hay errores al iniciar

---

## 📋 Checklist Rápido

- [ ] Conectado al VPS via SSH
- [ ] Navegado a `/var/www/cobra`
- [ ] Editado `.env.production` con los nuevos correos
- [ ] Guardado el archivo correctamente
- [ ] Reiniciado PM2 con `pm2 restart cobramenu`
- [ ] Verificado que PM2 está `online`
- [ ] Verificado los correos con `grep RECIPIENT_EMAIL .env.production`
- [ ] Probado haciendo un cambio en el admin
- [ ] Verificado que los correos llegaron

---

## 🎯 Comandos Rápidos de Referencia

```bash
# Ver correos actuales
cd /var/www/cobra && grep RECIPIENT_EMAIL .env.production

# Actualizar correos (reemplaza con tus correos)
cd /var/www/cobra && sed -i 's|^RECIPIENT_EMAIL=.*|RECIPIENT_EMAIL=correo1@gmail.com,correo2@gmail.com|' .env.production && pm2 restart cobramenu

# Ver logs de notificaciones
pm2 logs cobramenu --lines 30 | grep -i email

# Verificar estado
pm2 status
```

---

## 💡 Tips

1. **Múltiples correos:** Puedes agregar tantos correos como quieras, separados por comas
2. **Sin espacios:** Aunque el código acepta espacios, es mejor no usarlos para evitar problemas
3. **Reiniciar siempre:** Después de cambiar `.env.production`, SIEMPRE reinicia PM2
4. **Backup:** Antes de cambiar, puedes hacer backup:
   ```bash
   cp .env.production .env.production.backup
   ```
5. **Verificar antes de salir:** Siempre verifica que los cambios se aplicaron antes de cerrar la sesión SSH

---

¡Listo! Con estos pasos podrás actualizar los correos de notificación en el VPS fácilmente. 🚀



