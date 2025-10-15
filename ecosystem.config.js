/**
 * @file ecosystem.config.js
 * @description PM2 ecosystem configuration for production deployment
 * @version 1.0.0
 */

module.exports = {
  apps: [
    {
      name: 'estack-brand-builder',
      script: 'src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        DEBUG: 'true'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      cron_restart: '0 3 * * *', // Restart daily at 3 AM
      kill_timeout: 5000
    },
    {
      name: 'estack-agent-worker',
      script: 'src/workers/agent-worker.js',
      instances: 4,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'agent'
      }
    },
    {
      name: 'estack-quality-monitor',
      script: 'src/monitors/quality-monitor.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      cron_restart: '*/30 * * * *', // Restart every 30 minutes
      env: {
        NODE_ENV: 'production',
        MONITOR_TYPE: 'quality'
      }
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['production-server.example.com'],
      ref: 'origin/main',
      repo: 'https://github.com/hiromima/EStack-Brand-Builder.git',
      path: '/var/www/estack-brand-builder',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    },
    staging: {
      user: 'deploy',
      host: ['staging-server.example.com'],
      ref: 'origin/develop',
      repo: 'https://github.com/hiromima/EStack-Brand-Builder.git',
      path: '/var/www/estack-brand-builder-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};
