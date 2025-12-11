module.exports = {
  apps: [{
    name: 'cobra-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/cobra',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',  // Aumentado a 1GB para evitar reinicios
    max_restarts: 10,  // Máximo 10 reinicios en 1 minuto
    min_uptime: '10s',  // Debe estar arriba al menos 10 segundos
    restart_delay: 4000,  // Esperar 4 segundos entre reinicios
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NODE_OPTIONS: '--max-old-space-size=768'  // Aumentado a 768MB
    },
    error_file: '/home/deploy/.pm2/logs/cobra-app-error.log',
    out_file: '/home/deploy/.pm2/logs/cobra-app-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
