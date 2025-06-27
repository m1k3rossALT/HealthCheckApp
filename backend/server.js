const express = require('express');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const https = require('https');

const app = express();
const PORT = 3000;

app.use(cors());

// Serve urls.json
app.get('/urls', (req, res) => {
  fs.readFile('./urls.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read URLs' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// Health check logic
app.get('/check', async (req, res) => {
  const category = req.query.category;

  fs.readFile('./urls.json', 'utf8', async (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read URLs' });
    }

    const urls = JSON.parse(data)[category];
    if (!urls || urls.length === 0) {
      return res.json({ status: 'green', failed: [] });
    }

    const failed = [];
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    await Promise.all(urls.map(async (url) => {
      try {
        await axios.get(url, { httpsAgent, timeout: 5000 });
      } catch (e) {
        failed.push(url);
      }
    }));

    let status = 'green';
    if (failed.length === urls.length) status = 'red';
    else if (failed.length > 0) status = 'orange';

    res.json({ status, failed });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
