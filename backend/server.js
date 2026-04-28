require('dotenv').config();

const { loadUrlsConfig, loadEnvConfig } = require('./src/config/loader');
const createApp = require('./src/app');

// ── Load and validate all config before starting ─────────────────
let urlsConfig;
let envConfig;

try {
  envConfig = loadEnvConfig();
  urlsConfig = loadUrlsConfig();
  console.log(`[startup] Config loaded — ${Object.keys(urlsConfig).length} categories`);
} catch (err) {
  console.error(`[startup] Fatal: ${err.message}`);
  process.exit(1);
}

// ── Create app and start listening ───────────────────────────────
const app = createApp(urlsConfig, envConfig);

const server = app.listen(envConfig.port, () => {
  console.log(`[startup] Server running on port ${envConfig.port} (${envConfig.nodeEnv})`);
});

// ── Graceful shutdown ─────────────────────────────────────────────
function shutdown(signal) {
  console.log(`[shutdown] Received ${signal} — closing server`);
  server.close(() => {
    console.log('[shutdown] Server closed');
    process.exit(0);
  });

  // Force exit if server hasn't closed within 10s
  setTimeout(() => {
    console.error('[shutdown] Forced exit after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
  if (envConfig.nodeEnv === 'production') process.exit(1);
});
