const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const apiKeyAuth = require('./middleware/apiKeyAuth');
const errorHandler = require('./middleware/errorHandler');
const buildRouter = require('./routes/healthcheck');

/**
 * Creates and configures the Express app.
 * Receives validated config — no calls to process.env inside here.
 *
 * @param {object} urlsConfig - Validated urls.json content
 * @param {object} envConfig  - Validated env config
 * @returns {express.Application}
 */
function createApp(urlsConfig, envConfig) {
  const app = express();

  // ── Security headers ─────────────────────────────────────────────
  app.use(helmet());

  // ── CORS — locked to configured origins ─────────────────────────
  app.use(
    cors({
      origin: envConfig.corsOrigin,
      methods: ['GET'],
      allowedHeaders: ['Content-Type', 'x-api-key'],
    })
  );

  // ── Request logging ──────────────────────────────────────────────
  app.use(morgan(envConfig.logFormat));

  // ── Body parsing ─────────────────────────────────────────────────
  app.use(express.json());

  // ── Rate limiting ────────────────────────────────────────────────
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 60,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests — please try again in a minute' },
    })
  );

  // ── API key auth (applied after rate limit, before routes) ───────
  app.use(apiKeyAuth);

  // ── Routes ───────────────────────────────────────────────────────
  app.use('/', buildRouter(urlsConfig, envConfig));

  // ── 404 handler ──────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
  });

  // ── Centralised error handler (must be last) ─────────────────────
  app.use(errorHandler);

  return app;
}

module.exports = createApp;