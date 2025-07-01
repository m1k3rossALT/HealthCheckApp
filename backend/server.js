const express = require('express');
const cors = require('cors');
const { checkUrls, checkLogin } = require('./checkUrls');
const urlsData = require('./urls.json');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔐 Optional API key middleware
app.use((req, res, next) => {
  const apiKey = process.env.API_KEY;
  const clientKey = req.headers['x-api-key'];

  if (apiKey && clientKey !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }

  next();
});

// 📥 Get all categories and their URLs
app.get('/urls', (req, res) => {
  res.json(urlsData);
});

// 🩺 Health check for a category
app.get('/check', async (req, res) => {
  const category = req.query.category;
  const categoryData = urlsData[category];

  if (!categoryData || !categoryData.urls) {
    return res.status(400).json({ error: 'Invalid category or missing URLs' });
  }

  try {
    const result = await checkUrls(categoryData.urls);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Health check failed', details: err.message });
  }
});

// 🔐 Login check for a category
app.get('/check-login', async (req, res) => {
  const category = req.query.category;
  const categoryData = urlsData[category];

  if (!categoryData || !categoryData.login) {
    return res.status(400).json({ error: 'Invalid category or no login config' });
  }

  try {
    const result = await checkLogin(categoryData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Login check failed', details: err.message });
  }
});

// 🧠 Unified full check: health + login (only on healthy URLs)
app.get('/check-full', (req, res) => {
  const category = req.query.category;
  const categoryData = urlsData[category];

  if (!categoryData || !categoryData.urls) {
    return res.status(400).json({ error: 'Invalid category or missing URLs' });
  }

  (async () => {
    try {
      const healthResult = await checkUrls(categoryData.urls);
      const healthyUrls = categoryData.urls.filter(
        (url) => !healthResult.failed.includes(url)
      );

      const loginResult =
        categoryData.login && healthyUrls.length > 0
          ? await checkLogin({
              ...categoryData,
              urls: healthyUrls,
              _originalUrls: categoryData.urls // For skipped login reporting
            })
          : {
              success: false,
              reason: 'No healthy URLs for login check.'
            };
            // Combine URL + login failures into category status
      let finalStatus = 'green';

      // If health is red (all URLs failed)
      if (healthResult.failed.length === categoryData.urls.length) {
        finalStatus = 'red';
      }

      // If any login failures OR partial URL failures → orange
      else if (
        healthResult.failed.length > 0 ||
        (loginResult.results || []).some(r => r.success === false)
      ) {
        finalStatus = 'orange';
      }

      res.json({
        status: finalStatus,
        failed: healthResult.failed,
        login: loginResult
      });

    } catch (err) {
      res.status(500).json({ error: 'Full check failed', details: err.message });
    }
  })();
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
