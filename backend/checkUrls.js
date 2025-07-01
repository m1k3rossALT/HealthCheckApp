const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

/**
 * Performs a health check for a list of URLs.
 */
async function checkUrls(urls) {
  const results = [];

  for (const url of urls) {
    try {
      const start = Date.now();

      const response = await axios.get(url, {
        timeout: 8000,
        httpsAgent: agent,
        validateStatus: () => true
      });

      results.push({
        url,
        status: response.status,
        isHealthy: response.status >= 200 && response.status < 300,
        responseTimeMs: Date.now() - start
      });

    } catch (error) {
      results.push({
        url,
        status: null,
        isHealthy: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Performs a login check using credentials stored in environment variables.
 */
async function checkLogin(categoryData) {
  const loginConfig = categoryData.login;

  if (!loginConfig) {
    return { success: false, reason: 'No login config provided.' };
  }

  const {
    url,
    method = 'POST',
    env_username_key,
    env_password_key,
    successCriteria
  } = loginConfig;

  const username = process.env[env_username_key];
  const password = process.env[env_password_key];

  if (!username || !password) {
    return {
      success: false,
      reason: `Missing environment credentials for keys: ${env_username_key}, ${env_password_key}`
    };
  }

  try {
    const response = await axios({
      method,
      url,
      data: { username, password },
      httpsAgent: agent,
      timeout: 8000,
      validateStatus: () => true
    });

    const statusMatch = response.status === successCriteria.status;
    const bodyMatch =
      typeof response.data === 'string' &&
      response.data.includes(successCriteria.responseIncludes);

    return {
      success: statusMatch && bodyMatch,
      status: response.status,
      responseIncludesMatch: bodyMatch,
      reason: statusMatch && bodyMatch
        ? 'Login success'
        : `Login failed: statusMatch=${statusMatch}, bodyMatch=${bodyMatch}`
    };

  } catch (error) {
    return {
      success: false,
      reason: `Login request error: ${error.message}`
    };
  }
}

module.exports = {
  checkUrls,
  checkLogin
};
