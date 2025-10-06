// Vercel Serverless Function to fetch Eventbrite events
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const EVENTBRITE_TOKEN = process.env.EVENTBRITE_TOKEN;

  if (!EVENTBRITE_TOKEN) {
    return res.status(500).json({ error: 'Eventbrite token not configured' });
  }

  try {
    // First, let's test if the token works at all by getting user info
    const testResponse = await fetch(
      'https://www.eventbriteapi.com/v3/users/me/',
      {
        headers: {
          'Authorization': `Bearer ${EVENTBRITE_TOKEN}`
        }
      }
    );

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      return res.status(500).json({ 
        error: 'Eventbrite token is invalid or expired',
        details: errorText,
        status: testResponse.status,
        suggestion: 'Please generate a new Private Token from your Eventbrite account'
      });
    }

    // Now try to fetch events - using organization events instead of search
    const userInfo = await testResponse.json();
    
    // Try the events search endpoint
    const searchResponse = await fetch(
      'https://www.eventbriteapi.com/v3/events/search/?location.address=charlotte&location.within=25mi&expand=venue,ticket_availability',
      {
        headers: {
          'Authorization': `Bearer ${EVENTBRITE_TOKEN}`
        }
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Search API Error:', searchResponse.status, errorText);
      
      // If search doesn't work, return a helpful error
      return res.status(200).json({ 
        events: [],
        pagination: { object_count: 0 },
        warning: 'Event search endpoint not available with this token type. You may need OAuth access.',
        tokenInfo: {
          valid: true,
          user: userInfo.name || userInfo.email
        }
      });
    }

    const data = await searchResponse.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Eventbrite API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}