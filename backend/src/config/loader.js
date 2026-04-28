const fs = require('fs');
const path = require('path');
const { UrlsConfigSchema } = require('./schema');

/**
 * Loads and validates urls.json.
 * Throws a descriptive error on any validation failure.
 * Call once at startup — process should exit if this throws.
 *
 * @param {string} [filePath] - Absolute path to urls.json. Defaults to backend/urls.json.
 * @returns {Record<string, import('./schema').Category>} Validated config object.
 */
function loadUrlsConfig(filePath) {
  const resolvedPath = filePath || path.resolve(__dirname, '../../urls.json');

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`urls.json not found at: ${resolvedPath}`);
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  } catch (err) {
    throw new Error(`Failed to parse urls.json: ${err.message}`);
  }

  const result = UrlsConfigSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  [${i.path.join('.')}] ${i.message}`)
      .join('\n');
    throw new Error(`urls.json validation failed:\n${issues}`);
  }

  return result.data;
}

/**
 * Reads and validates environment variables.
 * Throws if any required variable is missing.
 *
 * @returns {object} Validated env config.
 */
function loadEnvConfig() {
  const required = [];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiKey: process.env.API_KEY || null,
    corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((s) => s.trim()),
    logFormat: process.env.LOG_FORMAT || 'dev',
    logLevel: process.env.LOG_LEVEL || 'info',
    checkTimeoutMs: parseInt(process.env.CHECK_TIMEOUT_MS || '5000', 10),
    checkConcurrency: parseInt(process.env.CHECK_CONCURRENCY || '5', 10),
  };
}

/**
 * Reads login credentials for a category from environment variables.
 * Returns null for either field if the env var is not set.
 *
 * @param {object} loginConfig - The login config object from urls.json.
 * @returns {{ username: string|null, password: string|null }}
 */
function getLoginCredentials(loginConfig) {
  return {
    username: process.env[loginConfig.env_username_key] || null,
    password: process.env[loginConfig.env_password_key] || null,
  };
}

module.exports = { loadUrlsConfig, loadEnvConfig, getLoginCredentials };