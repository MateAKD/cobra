@echo off
REM Script para subir todos los scripts de limpieza al VPS
echo.
echo ================================
echo   Subiendo scripts al VPS
echo ================================
echo.

set VPS_IP=72.61.43.32
set VPS_USER=root

echo Conectando a %VPS_USER%@%VPS_IP%...
echo.

echo Subiendo diagnose-vps.sh...
scp diagnose-vps.sh %VPS_USER%@%VPS_IP%:~/

echo Subiendo cleanup-malware.sh...
scp cleanup-malware.sh %VPS_USER%@%VPS_IP%:~/

echo Subiendo cleanup-malware-advanced.sh...
scp cleanup-malware-advanced.sh %VPS_USER%@%VPS_IP%:~/

echo Subiendo secure-vps.sh...
scp secure-vps.sh %VPS_USER%@%VPS_IP%:~/

echo.
echo ================================
echo   COMPLETADO
echo ================================
echo.
echo PROXIMOS PASOS:
echo.
echo 1. Conectarse al VPS:
echo    ssh root@%VPS_IP%
echo.
echo 2. Dar permisos:
echo    chmod +x *.sh
echo.
echo 3. Ejecutar diagnostico:
echo    sudo ./diagnose-vps.sh
echo.
echo 4. Si hay malware, limpiar:
echo    sudo ./cleanup-malware-advanced.sh
echo.
echo 5. Fortificar:
echo    sudo ./secure-vps.sh
echo.
echo 6. Reiniciar:
echo    sudo reboot
echo.
pause
