module.exports = {
  apps: [{
    name: 'cobra-app',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000 -H 0.0.0.0',
    cwd: '/var/www/cobra',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0',
      NODE_OPTIONS: '--max-old-space-size=768'
    },
    error_file: '/home/deploy/.pm2/logs/cobra-app-error.log',
    out_file: '/home/deploy/.pm2/logs/cobra-app-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
