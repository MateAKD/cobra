# 🚨 ACCIÓN INMEDIATA - VPS CAÍDO POR MALWARE

## ⚡ PASOS RÁPIDOS (5 minutos)

### 1️⃣ Subir los scripts al VPS

**Desde tu PowerShell en Windows:**

```powershell
cd "C:\Users\Mateo\Desktop\AKDMIA\Cobra 2.0"

# Opción A: Usar el script batch (doble clic)
.\upload-scripts.bat

# Opción B: Manual
scp diagnose-vps.sh root@72.61.43.32:~/
scp cleanup-malware-advanced.sh root@72.61.43.32:~/
scp secure-vps.sh root@72.61.43.32:~/
```

### 2️⃣ Conectarse al VPS

```powershell
ssh root@72.61.43.32
```

### 3️⃣ Ejecutar diagnóstico (2 min)

```bash
cd ~
chmod +x *.sh
./diagnose-vps.sh
```

**Buscar en los resultados:**
- ❌ `/etc/ld.so.preload` con contenido = MALWARE ACTIVO
- ❌ Procesos: xmrig, kinsing, hash, miner
- ❌ CPU >80%
- ❌ Procesos desde /tmp

### 4️⃣ Limpieza AGRESIVA (3 min)

```bash
sudo ./cleanup-malware-advanced.sh
```

**Esperar 5 segundos cuando pida confirmación, luego dejará ejecutar**

### 5️⃣ Verificar limpieza (1 min)

```bash
# Verificar CPU
top
# Presionar 'q' para salir

# Verificar LD_PRELOAD
cat /etc/ld.so.preload
# Debe estar VACÍO

# Verificar procesos
ps aux | grep -iE "xmrig|kinsing|hash|miner"
# No debe mostrar nada
```

### 6️⃣ Fortificar (5 min)

```bash
sudo ./secure-vps.sh
```

Este script instalará:
- fail2ban (bloquea atacantes)
- firewall UFW
- Protección de archivos críticos
- Monitoreo automático

### 7️⃣ Reiniciar el VPS

```bash
sudo reboot
```

**Esperar 2-3 minutos...**

### 8️⃣ Verificar que todo funcione

```bash
# Reconectar
ssh root@72.61.43.32

# Ver CPU (debe estar <20%)
top

# Ver la aplicación
pm2 list
pm2 logs

# Si la app no está corriendo
cd ~/Cobra\ 2.0  # o donde esté tu app
pm2 start ecosystem.config.js
pm2 save
```

### 9️⃣ Probar el website

Abrir en navegador: https://cobramenu.com

---

## 🔴 SI EL MALWARE VUELVE DESPUÉS DE 1 HORA

El malware tiene persistencia profunda. Opciones:

### Opción A: REINSTALAR VPS (RECOMENDADO)

```bash
# 1. Backup de la aplicación
cd ~/Cobra\ 2.0
tar -czf ~/cobra-backup.tar.gz .

# 2. Descargar a tu PC
# Desde Windows PowerShell:
scp root@72.61.43.32:~/cobra-backup.tar.gz ./

# 3. Pedir reinstalación a tu proveedor de VPS
# 4. Restaurar backup en VPS limpio
# 5. Ejecutar secure-vps.sh INMEDIATAMENTE
```

### Opción B: Investigar más profundo

```bash
# Buscar el origen de la infección
sudo ./diagnose-vps.sh > informe-completo.log

# Buscar archivos modificados recientemente
find / -type f -mtime -1 2>/dev/null | grep -v "/proc\|/sys"

# Ver TODOS los cron jobs
for user in $(cut -f1 -d: /etc/passwd); do 
    echo "=== $user ==="; 
    crontab -u $user -l 2>/dev/null; 
done

# Verificar servicios sospechosos
systemctl list-unit-files --state=enabled | grep -v "@"
```

---

## 📊 SEÑALES DE QUE ESTÁ LIMPIO

✅ CPU <20% de manera consistente  
✅ `cat /etc/ld.so.preload` está VACÍO  
✅ No hay procesos sospechosos  
✅ Solo conexiones legítimas (MongoDB, SSH)  
✅ cobramenu.com funciona correctamente  
✅ PM2 muestra app corriendo estable  

---

## 🆘 PROBLEMAS COMUNES

### "Permission denied" al ejecutar scripts

```bash
chmod +x *.sh
```

### "scp: command not found" en Windows

Instalar OpenSSH:
1. Settings → Apps → Optional Features
2. Add a feature → OpenSSH Client
3. Install

O usar WinSCP (GUI): https://winscp.net/

### No puedo conectarme por SSH

El VPS puede estar completamente caído. Opciones:
1. Reiniciar desde el panel de control de tu proveedor
2. Usar consola VNC/KVM del proveedor
3. Contactar soporte del proveedor

### La app Next.js no inicia después de limpiar

```bash
cd ~/Cobra\ 2.0

# Reinstalar dependencias
rm -rf node_modules
npm install

# Rebuild
npm run build

# Reiniciar con PM2
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

---

## 🎯 RESULTADO ESPERADO

Después de completar todos los pasos:

- ✅ VPS estable con CPU <20%
- ✅ Malware eliminado
- ✅ Seguridad reforzada
- ✅ Monitoreo automático activo
- ✅ cobramenu.com funcionando
- ✅ MongoDB conectado
- ✅ Sin reinfecciones

---

**Tiempo total estimado:** 20-30 minutos  
**Dificultad:** Media  
**Riesgo:** Bajo (todos los scripts hacen backups)

**¿Dudas? Consulta:** `MALWARE-CLEANUP-GUIDE.md` para detalles completos
