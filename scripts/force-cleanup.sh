#!/bin/bash

# ==========================================
# Script de Limpieza Profunda de Memoria
# ==========================================

echo "🧹 Iniciando limpieza de procesos huérfanos..."

# 1. Matar todos los procesos Node.js (incluyendo los que no son de PM2)
echo "🔪 Eliminando procesos Node.js..."
pkill -f node || echo "✅ No se encontraron procesos Node activos"
pkill -f "next-server" || echo "✅ No se encontraron procesos Next.js activos"

# 2. Limpiar cache de disco/memoria (requiere root)
if [ "$EUID" -eq 0 ]; then
    echo "🧹 Liberando pagecache, dentries y inodes..."
    sync; echo 3 > /proc/sys/vm/drop_caches
else
    echo "⚠️  Ejecuta con 'sudo' para liberar más memoria cache"
fi

# 3. Mostrar estado final
echo "📊 Estado de memoria actual:"
free -h

echo "✅ Limpieza completada. Ahora puedes intentar el deploy."
