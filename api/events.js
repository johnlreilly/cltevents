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
    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?` +
      `location.latitude=35.2271&location.longitude=-80.8431&` +
      `location.within=25mi&` +
      `expand=venue,ticket_availability&` +
      `sort_by=date`,
      {
        headers: {
          'Authorization': `Bearer ${EVENTBRITE_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ 
        error: errorData.error_description || 'Failed to fetch events from Eventbrite' 
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Eventbrite API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}