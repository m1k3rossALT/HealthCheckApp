const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const agent = new https.Agent({ rejectUnauthorized: false });

const urlsFilePath = path.join(__dirname, 'urls.json');
const urlsData = JSON.parse(fs.readFileSync(urlsFilePath));

async function checkUrls(categoryUrls) {
  const results = await Promise.all(
    categoryUrls.map(async (url) => {
      try {
        const response = await axios.get(url, { httpsAgent: agent, timeout: 5000 });
        return { url, status: response.status, isHealthy: true };
      } catch (error) {
        return {
          url,
          status: error.response?.status || null,
          isHealthy: false,
          error: error.message
        };
      }
    })
  );

  const failed = results.filter(r => !r.isHealthy).map(r => r.url);
  return { results, failed };
}

async function checkLogin(categoryData) {
  if (!categoryData.login || !Array.isArray(categoryData.urls)) {
    return { results: [], failed: [] };
  }

  const {
    login: {
      url: loginUrl,
      method = 'POST',
      env_username_key,
      env_password_key,
      successCriteria = {}
    }
  } = categoryData;

  const username = process.env[env_username_key];
  const password = process.env[env_password_key];

  const targets = categoryData.urls;

  const results = [];

  for (const target of targets) {
    try {
      const response = await axios({
        method,
        url: loginUrl,
        data: { username, password },
        httpsAgent: agent,
        timeout: 5000
      });

      const validStatuses = successCriteria.statuses || [successCriteria.status];
      const statusMatch = validStatuses.includes(response.status);

      const bodyMatch =
        response.status === 204
          ? true
          : successCriteria.responseIncludes
            ? response.data &&
              response.data.toString().toLowerCase().includes(successCriteria.responseIncludes.toLowerCase())
            : true;

      const isSuccess = statusMatch && bodyMatch;

      // Debug log
      console.log(`[LOGIN DEBUG]`, {
        url: target,
        loginUrl,
        status: response.status,
        expectedStatuses: validStatuses,
        expectedText: successCriteria.responseIncludes,
        statusMatch,
        bodyMatch,
        isSuccess
      });

      results.push({
        url: target,
        success: isSuccess,
        reason: isSuccess ? null : 'Login failed'
      });
    } catch (error) {
      console.warn(`[LOGIN ERROR] ${target} →`, error.message);
      results.push({
        url: target,
        success: false,
        reason: error.message
      });
    }
  }

  const failed = results.filter(r => !r.success).map(r => r.url);
  return { results, failed };
}

module.exports = { checkUrls, checkLogin };
