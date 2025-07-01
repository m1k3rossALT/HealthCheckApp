const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

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
        isHealthy: response.status >= 200 && response.status < 400,
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

  const failed = results.filter(r => !r.isHealthy).map(r => r.url);

  let status = 'green';
  if (failed.length > 0 && failed.length < urls.length) status = 'orange';
  if (failed.length === urls.length) status = 'red';

  return { status, failed };
}

async function checkLogin(categoryData) {
  const loginConfig = categoryData.login;

  if (!loginConfig || !categoryData.urls) {
    return { success: false, reason: 'No login config or urls[] found.' };
  }

  const {
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
      reason: `Missing env keys: ${env_username_key}, ${env_password_key}`
    };
  }

  const results = [];

  const healthyUrls = categoryData.urls;

  for (const baseUrl of healthyUrls) {
    const loginUrl = `${baseUrl}/login`;
  // After the for-loop that logs results for healthy URLs
  const originalUrls = categoryData._originalUrls || categoryData.urls;
  const skippedUrls = originalUrls.filter(url => !categoryData.urls.includes(url));

  for (const skipped of skippedUrls) {
    results.push({
      url: `${skipped}/login`,
      success: null,
      reason: 'Skipped due to failed health check'
    });
  }

    try {
      const response = await axios({
        method,
        url: loginUrl,
        data: { username, password },
        httpsAgent: agent,
        timeout: 8000,
        validateStatus: () => true
      });

      const statusMatch = response.status === successCriteria.status;
      const bodyMatch = typeof response.data === 'string' &&
        response.data.includes(successCriteria.responseIncludes);

      results.push({
        url: loginUrl,
        status: response.status,
        success: statusMatch && bodyMatch,
        reason: statusMatch && bodyMatch
          ? 'Login success'
          : `Login failed: statusMatch=${statusMatch}, bodyMatch=${bodyMatch}`
      });

    } catch (err) {
      results.push({
        url: loginUrl,
        success: false,
        reason: `Login error: ${err.message}`
      });
    }
  }

  const overallSuccess = results.every(r => r.success);
  return { success: overallSuccess, results };
}

module.exports = {
  checkUrls,
  checkLogin
};
