const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { checkCategory } = require('../services/categoryChecker');

/**
 * Builds and returns the API router.
 * Receives validated config at mount time — no globals.
 *
 * @param {object} urlsConfig  - Validated urls.json content
 * @param {object} envConfig   - Validated env config
 * @returns {Router}
 */
function buildRouter(urlsConfig, envConfig) {
  const router = Router();

  // ── Probe endpoints (no auth — required by K8s) ─────────────────

  router.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  router.get('/ready', (req, res) => {
    if (!urlsConfig || Object.keys(urlsConfig).length === 0) {
      return res.status(503).json({ status: 'not ready', reason: 'Config not loaded' });
    }
    res.json({ status: 'ready' });
  });

  // ── API v1 ──────────────────────────────────────────────────────

  router.get(
    '/api/v1/categories',
    asyncHandler(async (req, res) => {
      const categories = Object.entries(urlsConfig).reduce((acc, [name, config]) => {
        acc[name] = {
          urlCount: config.urls.length,
          hasLogin: !!config.login,
          enabled: config.enabled,
          timeout: config.timeout,
        };
        return acc;
      }, {});

      res.json({ categories });
    })
  );

  router.get(
    '/api/v1/check/:category',
    asyncHandler(async (req, res) => {
      const { category } = req.params;
      const categoryConfig = urlsConfig[category];

      if (!categoryConfig) {
        return res.status(404).json({ error: `Category "${category}" not found` });
      }

      if (!categoryConfig.enabled) {
        return res.status(200).json({ category, status: 'disabled' });
      }

      const result = await checkCategory(category, categoryConfig, envConfig);
      res.json(result);
    })
  );

  router.get(
    '/api/v1/check-all',
    asyncHandler(async (req, res) => {
      const start = Date.now();
      const enabled = Object.entries(urlsConfig).filter(([, cfg]) => cfg.enabled);

      // Run all categories concurrently up to the concurrency limit
      const concurrency = envConfig.checkConcurrency ?? 5;
      const results = [];

      for (let i = 0; i < enabled.length; i += concurrency) {
        const batch = enabled.slice(i, i + concurrency);
        const batchResults = await Promise.allSettled(
          batch.map(([name, cfg]) => checkCategory(name, cfg, envConfig))
        );
        batchResults.forEach((r) => {
          results.push(r.status === 'fulfilled' ? r.value : { error: r.reason?.message });
        });
      }

      const summary = results.reduce(
        (acc, r) => {
          if (r.status) acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        },
        { green: 0, orange: 0, red: 0 }
      );

      res.json({
        checkedAt: new Date().toISOString(),
        durationMs: Date.now() - start,
        summary,
        results,
      });
    })
  );

  return router;
}

module.exports = buildRouter;
