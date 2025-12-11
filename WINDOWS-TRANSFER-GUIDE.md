# 🚀 TRANSFERIR SCRIPTS AL VPS - WINDOWS

## ❌ Problema: No tienes WSL instalado

No te preocupes, hay **3 soluciones** para transferir los archivos al VPS desde Windows:

---

## ✅ SOLUCIÓN 1: Usar PowerShell con SCP (MÁS RÁPIDO)

PowerShell moderno incluye `scp` nativo. Copia y pega estos comandos:

### Paso 1: Configurar Variables
```powershell
$VPS_IP = "72.61.43.32"
$VPS_USER = "root"  # Cambiar si usas otro usuario
$VPS_DIR = "/var/www/cobra"
```

### Paso 2: Transferir Archivos Uno por Uno
```powershell
# Transferir scripts
scp deep-malware-cleanup.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp security-patch-react2shell.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp harden-security.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp verify-security.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp monitor-malware.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/

# Transferir documentación
scp QUICK-RESPONSE-GUIDE.md ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp INCIDENT-RESPONSE-CHECKLIST.md ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp SECURITY-README.md ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
```

### Paso 3: Dar Permisos de Ejecución
```powershell
ssh ${VPS_USER}@${VPS_IP} "cd ${VPS_DIR} && chmod +x *.sh"
```

### Paso 4: Verificar
```powershell
ssh ${VPS_USER}@${VPS_IP} "cd ${VPS_DIR} && ls -lh *.sh *.md"
```

---

## ✅ SOLUCIÓN 2: Usar WinSCP (INTERFAZ GRÁFICA)

Si prefieres una interfaz gráfica:

### Paso 1: Descargar WinSCP
- Descarga: https://winscp.net/eng/download.php
- Instala WinSCP

### Paso 2: Conectarse al VPS
1. Abre WinSCP
2. Protocolo: **SCP**
3. Host: **72.61.43.32**
4. Usuario: **root** (o tu usuario)
5. Contraseña: (tu contraseña SSH)
6. Click en **Login**

### Paso 3: Transferir Archivos
1. En el panel izquierdo, navega a: `C:\Users\Mateo\Desktop\AKDMIA\Cobra 2.0`
2. En el panel derecho, navega a: `/var/www/cobra`
3. Selecciona estos archivos y arrástralos al panel derecho:
   - `deep-malware-cleanup.sh`
   - `security-patch-react2shell.sh`
   - `harden-security.sh`
   - `verify-security.sh`
   - `monitor-malware.sh`
   - `QUICK-RESPONSE-GUIDE.md`
   - `INCIDENT-RESPONSE-CHECKLIST.md`
   - `SECURITY-README.md`

### Paso 4: Dar Permisos
Desde PowerShell:
```powershell
ssh root@72.61.43.32 "cd /var/www/cobra && chmod +x *.sh"
```

---

## ✅ SOLUCIÓN 3: Copiar y Pegar Manualmente (ÚLTIMA OPCIÓN)

Si no puedes usar SCP ni WinSCP:

### Paso 1: Conectarse al VPS
```powershell
ssh root@72.61.43.32
cd /var/www/cobra
```

### Paso 2: Crear Cada Archivo Manualmente
Para cada script, ejecuta en el VPS:

```bash
# Ejemplo para deep-malware-cleanup.sh
nano deep-malware-cleanup.sh
# Pega el contenido del archivo
# Ctrl+O para guardar, Enter, Ctrl+X para salir

# Repetir para cada archivo:
# - security-patch-react2shell.sh
# - harden-security.sh
# - verify-security.sh
# - monitor-malware.sh
```

### Paso 3: Dar Permisos
```bash
chmod +x *.sh
```

---

## 🎯 RECOMENDACIÓN

**Usa la Solución 1** (PowerShell con SCP). Es la más rápida y no requiere instalar nada adicional.

---

## 📋 COMANDOS COMPLETOS PARA COPIAR Y PEGAR

### Opción A: Todo en un Bloque (PowerShell)

```powershell
# Configuración
$VPS_IP = "72.61.43.32"
$VPS_USER = "root"
$VPS_DIR = "/var/www/cobra"

# Transferir todos los archivos
Write-Host "Transfiriendo archivos..." -ForegroundColor Cyan
scp deep-malware-cleanup.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp security-patch-react2shell.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp harden-security.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp verify-security.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp monitor-malware.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp QUICK-RESPONSE-GUIDE.md ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp INCIDENT-RESPONSE-CHECKLIST.md ${VPS_USER}@${VPS_IP}:${VPS_DIR}/
scp SECURITY-README.md ${VPS_USER}@${VPS_IP}:${VPS_DIR}/

# Dar permisos
Write-Host "Configurando permisos..." -ForegroundColor Cyan
ssh ${VPS_USER}@${VPS_IP} "cd ${VPS_DIR} && chmod +x *.sh"

# Verificar
Write-Host "Verificando archivos..." -ForegroundColor Cyan
ssh ${VPS_USER}@${VPS_IP} "cd ${VPS_DIR} && ls -lh *.sh *.md"

Write-Host "✅ Transferencia completada!" -ForegroundColor Green
```

### Opción B: Comando por Comando

Si el bloque anterior falla, ejecuta uno por uno:

```powershell
# 1. Transferir scripts
scp deep-malware-cleanup.sh root@72.61.43.32:/var/www/cobra/
scp security-patch-react2shell.sh root@72.61.43.32:/var/www/cobra/
scp harden-security.sh root@72.61.43.32:/var/www/cobra/
scp verify-security.sh root@72.61.43.32:/var/www/cobra/
scp monitor-malware.sh root@72.61.43.32:/var/www/cobra/

# 2. Transferir documentación
scp QUICK-RESPONSE-GUIDE.md root@72.61.43.32:/var/www/cobra/
scp INCIDENT-RESPONSE-CHECKLIST.md root@72.61.43.32:/var/www/cobra/
scp SECURITY-README.md root@72.61.43.32:/var/www/cobra/

# 3. Dar permisos
ssh root@72.61.43.32 "cd /var/www/cobra && chmod +x *.sh"

# 4. Verificar
ssh root@72.61.43.32 "cd /var/www/cobra && ls -lh *.sh *.md"
```

---

## ⚠️ Si SSH No Funciona

Si `ssh` o `scp` no están disponibles en PowerShell:

1. **Actualiza Windows:**
   - Windows 10 (1809+) y Windows 11 incluyen SSH nativo
   - Ve a: Configuración → Aplicaciones → Características opcionales
   - Busca "Cliente OpenSSH" y actívalo

2. **O instala Git for Windows:**
   - Descarga: https://git-scm.com/download/win
   - Incluye Git Bash con SSH y SCP

3. **O usa WinSCP** (Solución 2)

---

## 🚀 Próximos Pasos Después de Transferir

Una vez transferidos los archivos:

```powershell
# Conectarse al VPS
ssh root@72.61.43.32

# En el VPS:
cd /var/www/cobra

# Ejecutar scripts en orden:
sudo bash deep-malware-cleanup.sh
sudo bash security-patch-react2shell.sh
sudo bash harden-security.sh
bash verify-security.sh
```

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas con alguna solución, avísame y te ayudo con alternativas.

---

**Última actualización:** 2025-12-10
