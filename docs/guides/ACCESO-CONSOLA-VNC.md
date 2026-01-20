# 🆘 GUÍA: Acceder a Consola VNC cuando SSH está Bloqueado

## Tu Situación Actual

- ✅ VPS está vivo (responde a ping)
- ✅ Puertos 80 y 443 funcionan
- ❌ Puerto 22 (SSH) está BLOQUEADO por malware

## Solución: Consola Web VNC/KVM

La consola VNC es como tener un monitor y teclado conectados directamente al servidor.
**NO necesita SSH**, así que funciona incluso si SSH está bloqueado.

---

## 📍 PASO 1: Identificar tu Proveedor

¿Dónde contrataste el VPS? Los más comunes:

### A. HOSTINGER
**Panel:** https://hpanel.hostinger.com

**Pasos:**
1. Login con tu email/password
2. Ir a: **VPS** → **Manage**
3. En el menú lateral: **Browser Console** o **VNC Console**
4. Click en **Launch Console** o **Open Console**
5. Login en la consola: usuario `root` + contraseña del VPS

### B. VULTR
**Panel:** https://my.vultr.com

**Pasos:**
1. Login
2. **Products** → Selecciona tu servidor
3. En la parte superior: **View Console** (ícono de monitor)
4. Se abre ventana nueva con la consola
5. Click en la ventana y presiona Enter
6. Login: `root` + contraseña

### C. DIGITALOCEAN
**Panel:** https://cloud.digitalocean.com

**Pasos:**
1. Login
2. **Droplets** → Click en tu droplet
3. **Access** → **Launch Droplet Console**
4. O usa el botón **Console** en la parte superior derecha
5. Login: `root` + contraseña

### D. CONTABO
**Panel:** https://my.contabo.com

**Pasos:**
1. Login
2. **Your Services** → VPS
3. Click en **VNC Console** o **noVNC Console**
4. Login: `root` + contraseña

### E. LINODE (Akamai)
**Panel:** https://cloud.linode.com

**Pasos:**
1. Login
2. **Linodes** → Tu servidor
3. **Launch LISH Console** (arriba a la derecha)
4. Login: `root` + contraseña

### F. OVH
**Panel:** https://www.ovh.com/manager

**Pasos:**
1. Login
2. **Bare Metal Cloud** → VPS
3. Tu servidor → **KVM** o **Console**
4. Login: `root` + contraseña

---

## 📍 PASO 2: Una vez dentro de la Consola

La consola se ve como una terminal negra. Verás algo así:
```
Ubuntu 22.04 LTS servidor-nombre tty1

servidor-nombre login: _
```

**Ingresa:**
1. Usuario: `root`
2. Password: (tu contraseña de root)

> **Nota:** Al escribir la contraseña NO verás nada en pantalla (es normal)

---

## 📍 PASO 3: Ejecutar Comandos de Emergencia

Una vez logueado, ejecuta estos comandos **uno por uno**:

### A. Verificar estado actual
```bash
# Ver procesos con alto CPU
top
# Presiona 'q' para salir

# Ver si SSH está corriendo
systemctl status sshd
```

### B. Restaurar SSH
```bash
# Reiniciar SSH
systemctl restart sshd

# Verificar que esté corriendo
systemctl status sshd
```

### C. Limpiar firewall
```bash
# Limpiar iptables
iptables -F
iptables -X
iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT

# Permitir SSH
ufw allow 22/tcp
```

### D. Matar procesos maliciosos
```bash
# Matar malware conocido
pkill -9 xmrig
pkill -9 kinsing
pkill -9 hash
pkill -9 miner
```

### E. Usar script de emergencia completo

Si puedes copiar y pegar en la consola:

1. Crear el archivo:
```bash
cat > /root/emergency-ssh-restore.sh << 'EOF'
[copiar todo el contenido de emergency-ssh-restore.sh aquí]
EOF
```

2. Dar permisos:
```bash
chmod +x /root/emergency-ssh-restore.sh
```

3. Ejecutar:
```bash
/root/emergency-ssh-restore.sh
```

---

## 📍 PASO 4: Probar SSH desde Windows

Después de ejecutar los comandos en la consola VNC:

```powershell
# Intentar conectar nuevamente
ssh root@72.61.43.32
```

**Si funciona:**
✅ SSH restaurado! Procede con la limpieza normal:
```bash
# Subir scripts
scp diagnose-vps.sh root@72.61.43.32:~/
scp cleanup-malware-advanced.sh root@72.61.43.32:~/
scp secure-vps.sh root@72.61.43.32:~/

# Conectar y ejecutar
ssh root@72.61.43.32
chmod +x *.sh
./cleanup-malware-advanced.sh
./secure-vps.sh
reboot
```

---

## 🆘 Si NO encuentras la consola VNC

**Alternativas:**

### 1. Buscar en la documentación del proveedor
```
"[nombre proveedor] vnc console"
"[nombre proveedor] kvm access"
"[nombre proveedor] serial console"
```

### 2. Contactar soporte del proveedor
- Abre un ticket
- Di: "No puedo acceder por SSH, necesito acceso a la consola VNC/KVM"

### 3. Reinstalar el VPS (última opción)

**ANTES de reinstalar:**
Si tienes backups automáticos en el panel, úsalos.

**Si decides reinstalar:**
1. Panel → Reinstall OS → Ubuntu 22.04 LTS
2. INMEDIATAMENTE después: ejecutar `secure-vps.sh`
3. Restaurar tu aplicación desde código fuente

---

## ⚡ COMANDOS RÁPIDOS para Copiar/Pegar en VNC

```bash
# Todo en uno - Restaurar SSH
systemctl restart sshd && iptables -F && ufw allow 22/tcp && pkill -9 xmrig && pkill -9 kinsing && echo "SSH debería estar restaurado ahora"
```

---

## 📝 Checklist

- [ ] Accedí al panel de control del proveedor
- [ ] Encontré y abrí la consola VNC/KVM
- [ ] Login exitoso como root
- [ ] Ejecuté comandos para restaurar SSH
- [ ] SSH responde desde Windows
- [ ] Subí y ejecuté scripts de limpieza
- [ ] VPS fortificado con secure-vps.sh
- [ ] Website funcionando

---

**¿Cuál es tu proveedor?** Dime y te doy instrucciones más específicas.
