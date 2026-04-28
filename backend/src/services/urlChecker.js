const axios = require('axios');
const https = require('https');

/**
 * Checks the health of a single URL.
 * Never throws — errors are captured in the result object.
 *
 * @param {string} url
 * @param {object} options
 * @param {number} options.timeout - Request timeout in ms
 * @param {boolean} options.sslVerify - Whether to verify SSL certificates
 * @returns {Promise<{url, healthy, status, latencyMs, error}>}
 */
async function checkUrl(url, { timeout = 5000, sslVerify = true } = {}) {
  const agent = new https.Agent({ rejectUnauthorized: sslVerify });
  const start = Date.now();

  try {
    const response = await axios.get(url, {
      httpsAgent: agent,
      timeout,
      validateStatus: () => true, // Don't throw on 4xx/5xx — record the status
    });

    return {
      url,
      healthy: response.status >= 200 && response.status < 400,
      status: response.status,
      latencyMs: Date.now() - start,
      error: null,
    };
  } catch (err) {
    return {
      url,
      healthy: false,
      status: null,
      latencyMs: Date.now() - start,
      error: err.code === 'ECONNABORTED' ? 'timeout' : err.message,
    };
  }
}

/**
 * Checks all URLs in a category concurrently.
 *
 * @param {string[]} urls
 * @param {object} options - Passed through to checkUrl
 * @returns {Promise<Array<{url, healthy, status, latencyMs, error}>>}
 */
async function checkUrls(urls, options = {}) {
  return Promise.all(urls.map((url) => checkUrl(url, options)));
}

module.exports = { checkUrl, checkUrls };