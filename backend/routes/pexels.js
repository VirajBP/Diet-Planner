const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

router.get('/videos', async (req, res) => {
  const { query = 'exercise', per_page = 10 } = req.query;
  console.log('[Pexels Proxy] Request:', req.method, req.originalUrl, '| Query:', query, '| Per page:', per_page);

  if (!PEXELS_API_KEY) {
    console.error('[Pexels Proxy] Missing PEXELS_API_KEY in .env');
    return res.status(500).json({ error: 'PEXELS_API_KEY not set in backend .env' });
  }

  try {
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${per_page}`;
    console.log('[Pexels Proxy] Fetching:', url);
    const response = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY },
    });
    console.log('[Pexels Proxy] Pexels response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Pexels Proxy] Pexels API error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    console.log('[Pexels Proxy] Data received:', Array.isArray(data.videos) ? `Videos: ${data.videos.length}` : data);
    res.json(data);
  } catch (error) {
    console.error('[Pexels Proxy] Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch videos from Pexels' });
  }
});

module.exports = router; 