// Vercel Serverless Function to fetch YouTube videos
// Simple rate limiting: track requests per IP
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const MAX_REQUESTS_PER_HOUR = 50; // Max 50 requests per IP per hour

export default async function handler(req, res) {
  // Enable CORS but restrict to your domain
  const origin = req.headers.origin;
  const allowedOrigins = ['https://clt.show', 'http://localhost:3000'];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Rate limiting by IP
  const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || 'unknown';
  const now = Date.now();

  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, []);
  }

  const requests = requestCounts.get(clientIP);
  // Remove old requests outside the time window
  const recentRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  recentRequests.push(now);
  requestCounts.set(clientIP, recentRequests);

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  const { query } = req.query;

  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key not configured in environment variables');
    return res.status(500).json({ error: 'YouTube API key not configured' });
  }

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Clean up artist name for better search results
    const searchQuery = query
      .replace(/\s+(live|concert|tour|at|presents|featuring)\s+.*/i, '')
      .trim();

    const url = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `type=video&` +
      `videoCategoryId=10&` +
      `maxResults=3&` +
      `key=${YOUTUBE_API_KEY}`;

    console.log('YouTube API Request for query:', searchQuery);

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error Response:', JSON.stringify(errorData, null, 2));
      return res.status(response.status).json({
        error: errorData.error?.message || 'Failed to fetch YouTube videos',
        details: errorData
      });
    }

    const data = await response.json();
    
    const videos = data.items.map(item => ({
      title: item.snippet.title,
      url: `https://youtube.com/watch?v=${item.id.videoId}`
    }));

    res.status(200).json({ videos });
  } catch (error) {
    console.error('YouTube API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}