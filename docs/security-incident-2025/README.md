# Incidente de Seguridad - Diciembre 20 25 / Enero 2026

## 📋 Resumen

Este directorio contiene scripts y documentación relacionados con un incidente de seguridad (malware en VPS Hostinger) ocurrido en diciembre 2025.

## ⚠️ Archivos Históricos - Solo Referencia

Los scripts en este directorio fueron utilizados para:
- ✅ Limpiar malware del VPS
- ✅ Aplicar hardening de seguridad post-incidente  
- ✅ Monitoreo y prevención de reinfecciones
- ✅ Respuesta de emergencia

## 🚫 No Usar en Producción Actual

**El sistema ya está limpio y securizado.**

Estos archivos se mantienen únicamente como:
- Documentación histórica
- Referencia para futuros incidentes
- Evidencia del proceso de respuesta

## 📁 Contenido

### Scripts de Limpieza
- `cleanup-malware*.sh` - Scripts de limpieza de diferentes niveles
- `nuke-malware.sh` - Limpieza agresiva de emergencia
- `deep-malware-cleanup.sh` - Análisis profundo

### Scripts de Seguridad
- `harden-security.sh` - Configuración de seguridad
- `security-audit.sh` - Auditoría de seguridad
- `monitor-malware.sh` - Monitoreo continuo

### Scripts de Deployment
- `deploy-security-scripts.sh` - Deploy de configuraciones
- `deploy-vps.sh` - Deploy general de VPS

### Documentación
- `SECURITY-README.md` - Guía de seguridad
- `MALWARE-CLEANUP-GUIDE.md` - Guía de limpieza paso a paso
- `SECURITY-INCIDENT-REPORT.md` - Reporte detallado del incidente
- `ACCION-INMEDIATA.md` - Checklist de acciones inmediatas

## 🛡️ Medidas Implementadas (Permanentes)

Las siguientes medidas quedaron implementadas en el sistema:

1. ✅ **Firewall (UFW)** configurado
2. ✅ **Fail2Ban** activo
3. ✅ **SSH key-based auth** (password disabled)
4. ✅ **Credenciales rotadas** (MongoDB, API keys)
5. ✅ **PM2 con memory limits**
6. ✅ **Next.js y React actualizados** (CVE-2025-55182 parcheado)
7. ✅ **Auditoría de código** completada

## 📞 Contacto

Si encuentras evidencia de reinfección o problemas de seguridad similares:
1. Consultar este directorio para scripts de diagnóstico
2. Ejecutar `diagnose-vps.sh` para análisis inicial
3. Contactar al equipo de seguridad

---

**Última actualización:** 20 de enero de 2026  
**Estado del sistema:** ✅ Limpio y Securizado
