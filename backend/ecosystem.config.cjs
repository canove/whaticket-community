/**
 * PM2 Ecosystem Configuration
 *
 * Usage:
 *   npm run build
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 logs
 *   pm2 monit
 *
 * Architecture note:
 *   WhatsApp sessions (Baileys) are held in memory per-process. Running more
 *   than one instance of the main server would split sessions across workers.
 *   The recommended topology is:
 *     - 1 "api" process  — handles HTTP + Socket.io (can be clustered safely
 *       once WhatsApp sessions are extracted to a dedicated service)
 *     - 1 "worker" process — runs BullMQ message worker (can also be scaled)
 *
 *   For now, run a single instance until WhatsApp sessions are decoupled.
 *   Socket.io uses the Redis adapter so it is already cluster-ready.
 */
module.exports = {
  apps: [
    {
      name: "whaticket-api",
      script: "dist/server.js",
      instances: 1, // increase to "max" once Baileys sessions are decoupled
      exec_mode: "fork", // switch to "cluster" together with instances > 1
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      exp_backoff_restart_delay: 100,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    }
  ]
};
