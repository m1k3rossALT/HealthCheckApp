const axios = require('axios');
const https = require('https');

/**
 * Performs a login check against the configured auth endpoint.
 * Never throws — errors are captured in the result object.
 *
 * @param {object} loginConfig - The login block from urls.json (already validated)
 * @param {object} credentials - { username, password }
 * @param {object} options
 * @param {number} options.timeout - Request timeout in ms
 * @param {boolean} options.sslVerify - Whether to verify SSL certificates
 * @returns {Promise<{success, status, reason}>}
 */
async function checkLogin(loginConfig, credentials, { timeout = 5000, sslVerify = true } = {}) {
  const { url, method, successCriteria } = loginConfig;
  const { username, password } = credentials;
  const agent = new https.Agent({ rejectUnauthorized: sslVerify });

  if (!username || !password) {
    return {
      success: false,
      status: null,
      reason: 'Login credentials not set in environment variables',
    };
  }

  try {
    const response = await axios({
      method,
      url,
      data: { username, password },
      httpsAgent: agent,
      timeout,
      validateStatus: () => true,
    });

    const statusOk = successCriteria.statuses.includes(response.status);

    const bodyOk = successCriteria.responseIncludes
      ? String(response.data ?? '')
          .toLowerCase()
          .includes(successCriteria.responseIncludes.toLowerCase())
      : true;

    const success = statusOk && bodyOk;

    return {
      success,
      status: response.status,
      reason: success
        ? null
        : !statusOk
          ? `Unexpected status ${response.status} (expected: ${successCriteria.statuses.join(', ')})`
          : `Response did not include expected text: "${successCriteria.responseIncludes}"`,
    };
  } catch (err) {
    return {
      success: false,
      status: null,
      reason: err.code === 'ECONNABORTED' ? 'timeout' : err.message,
    };
  }
}

module.exports = { checkLogin };
