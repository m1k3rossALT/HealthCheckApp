const { checkUrls } = require('./urlChecker');
const { checkLogin } = require('./loginChecker');
const { getLoginCredentials } = require('../config/loader');

/**
 * Derives the overall category status from URL and login results.
 *
 * green  → all URLs healthy AND login passed (or no login config)
 * red    → all URLs failed
 * orange → partial URL failures OR login failed
 *
 * @param {Array}  urlResults
 * @param {object|null} loginResult
 * @returns {'green'|'orange'|'red'}
 */
function deriveStatus(urlResults, loginResult) {
  const total = urlResults.length;
  const failedCount = urlResults.filter((r) => !r.healthy).length;

  if (failedCount === total) return 'red';
  if (failedCount > 0) return 'orange';
  if (loginResult && !loginResult.success) return 'orange';
  return 'green';
}

/**
 * Runs a full check (URL health + login) for a single category.
 *
 * @param {string} categoryName
 * @param {object} categoryConfig - Validated category config from urls.json
 * @param {object} [envConfig] - Optional env config override (e.g. for timeout)
 * @returns {Promise<{category, status, checkedAt, durationMs, urls, login}>}
 */
async function checkCategory(categoryName, categoryConfig, envConfig = {}) {
  const start = Date.now();
  const checkOptions = {
    timeout: categoryConfig.timeout ?? envConfig.checkTimeoutMs ?? 5000,
    sslVerify: categoryConfig.sslVerify !== false,
  };

  const urlResults = await checkUrls(categoryConfig.urls, checkOptions);

  let loginResult = null;
  if (categoryConfig.login) {
    const healthyUrls = urlResults.filter((r) => r.healthy);
    if (healthyUrls.length > 0) {
      const credentials = getLoginCredentials(categoryConfig.login);
      loginResult = await checkLogin(categoryConfig.login, credentials, checkOptions);
    } else {
      loginResult = { success: false, status: null, reason: 'All URLs are down — login check skipped' };
    }
  }

  return {
    category: categoryName,
    status: deriveStatus(urlResults, loginResult),
    checkedAt: new Date().toISOString(),
    durationMs: Date.now() - start,
    urls: urlResults,
    login: loginResult,
  };
}

module.exports = { checkCategory, deriveStatus };
