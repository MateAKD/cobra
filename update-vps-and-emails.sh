#!/bin/bash

# ===================================
# Script para actualizar VPS y verificar emails
# ===================================

echo "🐍 Actualizando COBRA en el VPS..."

# Ir al directorio del proyecto
cd /var/www/cobra || exit 1

# 1. Hacer pull de los últimos cambios
echo "📥 Descargando últimos cambios de GitHub..."
git pull origin main || {
    echo "❌ Error al hacer pull. Verifica la conexión a internet y los permisos de Git."
    exit 1
}

# 2. Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install || {
    echo "❌ Error al instalar dependencias."
    exit 1
}

# 3. Build
echo "🔨 Compilando aplicación..."
pnpm build || {
    echo "❌ Error en el build."
    exit 1
}

# 4. Verificar/Actualizar .env.production
echo ""
echo "📧 Verificando configuración de emails..."
ENV_FILE="/var/www/cobra/.env.production"

if [ -f "$ENV_FILE" ]; then
    echo "✅ Archivo .env.production encontrado"
    echo ""
    echo "📋 Emails actuales configurados:"
    grep "RECIPIENT_EMAIL" "$ENV_FILE" || echo "⚠️  RECIPIENT_EMAIL no encontrado en .env.production"
    echo ""
    echo "¿Deseas actualizar los emails? Los nuevos emails son:"
    echo "gabo.cortese@gmail.com,aagustinperezv@gmail.com,Mngomeze@gmail.com"
    echo ""
    read -p "¿Actualizar RECIPIENT_EMAIL? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        # Actualizar RECIPIENT_EMAIL
        if grep -q "RECIPIENT_EMAIL" "$ENV_FILE"; then
            # Reemplazar la línea existente
            sed -i 's|^RECIPIENT_EMAIL=.*|RECIPIENT_EMAIL=gabo.cortese@gmail.com,aagustinperezv@gmail.com,Mngomeze@gmail.com|' "$ENV_FILE"
        else
            # Agregar nueva línea
            echo "RECIPIENT_EMAIL=gabo.cortese@gmail.com,aagustinperezv@gmail.com,Mngomeze@gmail.com" >> "$ENV_FILE"
        fi
        echo "✅ RECIPIENT_EMAIL actualizado"
    fi
else
    echo "⚠️  Archivo .env.production no encontrado"
    echo "📝 Creando archivo .env.production..."
    cat > "$ENV_FILE" << EOF
# Panel de Admin
ADMIN_PASSWORD=cobra2025

# Resend (Servicio de Email)
RESEND_API_KEY=re_AmDvZQtu_8qGJ2g3Ua2K4Dapwxb4VC5Fd

# Email destinatario para notificaciones
RECIPIENT_EMAIL=gabo.cortese@gmail.com,aagustinperezv@gmail.com,Mngomeze@gmail.com

# Next.js
NODE_ENV=production
PORT=3000
EOF
    echo "✅ Archivo .env.production creado con los nuevos emails"
fi

# 5. Mostrar configuración final
echo ""
echo "📋 Configuración final de emails:"
grep "RECIPIENT_EMAIL" "$ENV_FILE" || echo "⚠️  RECIPIENT_EMAIL no encontrado"
echo ""

# 6. Reiniciar PM2
echo "🔄 Reiniciando aplicación..."
pm2 restart cobramenu || {
    echo "❌ Error al reiniciar PM2. Verifica que PM2 esté instalado y la app esté corriendo."
    exit 1
}

# 7. Verificar estado
echo ""
echo "✅ Verificando estado de la aplicación..."
pm2 status cobramenu

echo ""
echo "🎉 Actualización completada!"
echo ""
echo "📧 Emails configurados para notificaciones:"
grep "RECIPIENT_EMAIL" "$ENV_FILE" | cut -d '=' -f2
echo ""

