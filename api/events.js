// Vercel Serverless Function to fetch Ticketmaster events
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

  const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

  if (!TICKETMASTER_API_KEY) {
    return res.status(500).json({ error: 'Ticketmaster API key not configured' });
  }

  try {
    // Search for events in Charlotte, NC area
    const params = new URLSearchParams({
      apikey: TICKETMASTER_API_KEY,
      city: 'Charlotte',
      stateCode: 'NC',
      radius: '25',
      unit: 'miles',
      size: '100', // Get up to 100 events
      sort: 'date,asc'
    });

    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ticketmaster API Error:', response.status, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      return res.status(response.status).json({ 
        error: errorData.fault?.faultstring || errorData.error || 'Failed to fetch events from Ticketmaster',
        details: errorText,
        status: response.status
      });
    }

    const data = await response.json();
    
    // Transform Ticketmaster format to our expected format
    const transformedData = {
      events: data._embedded?.events || [],
      pagination: {
        object_count: data.page?.totalElements || 0,
        page_number: data.page?.number || 0,
        page_size: data.page?.size || 0
      }
    };

    res.status(200).json(transformedData);
    
  } catch (error) {
    console.error('Ticketmaster API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}