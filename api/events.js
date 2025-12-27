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
    // Ticketmaster venue IDs for preferred Charlotte venues
    // These ensure we get events from venues we care about, bypassing the 100-event API limit
    const priorityVenues = [
      'KovZpZAEdA7A',  // Neighborhood Theatre
      'KovZpZAEde6A',  // Visulite Theatre
      'KovZpZAEdFtA',  // The Fillmore Charlotte
      'KovZpZAEAeaA',  // PNC Music Pavilion
      'rZ7HnEZ1kddGd',  // Spectrum Center (large arena)
      'KovZpZAE6klA',  // Charlotte Metro Credit Union Amphitheatre
      'KovZ917AYaj',   // The Carolina
      'KovZ917AiEp',   // Headliners Uptown Charlotte
      'Z7r9jZa7qm',    // Blackbox Theater - Charlotte
      // Note: Smokey Joe's, Amos', Fillmore have dedicated scrapers
      // Note: Smaller venues may not be on Ticketmaster
    ];

    // Fetch general Charlotte area events (reduced size since we're querying specific venues)
    const charlotteParams = new URLSearchParams({
      apikey: TICKETMASTER_API_KEY,
      city: 'Charlotte',
      stateCode: 'NC',
      radius: '50',  // TEMPORARILY INCREASED TO TEST WIDER RADIUS
      unit: 'miles',
      size: '100',  // TEMPORARILY INCREASED TO SEE MORE VENUES
      sort: 'date,asc'
    });

    // Fetch events from priority venues
    const venuePromises = priorityVenues.map(venueId => {
      const venueParams = new URLSearchParams({
        apikey: TICKETMASTER_API_KEY,
        venueId: venueId,
        size: '50',
        sort: 'date,asc'
      });
      return fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${venueParams.toString()}`);
    });

    // Fetch all data in parallel
    const [charlotteResponse, ...venueResponses] = await Promise.all([
      fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${charlotteParams.toString()}`),
      ...venuePromises
    ]);

    // Check Charlotte response
    if (!charlotteResponse.ok) {
      const errorText = await charlotteResponse.text();
      console.error('Ticketmaster API Error:', charlotteResponse.status, errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      return res.status(charlotteResponse.status).json({
        error: errorData.fault?.faultstring || errorData.error || 'Failed to fetch events from Ticketmaster',
        details: errorText,
        status: charlotteResponse.status
      });
    }

    const charlotteData = await charlotteResponse.json();
    let allEvents = charlotteData._embedded?.events || [];

    // Add events from priority venues
    for (const venueResponse of venueResponses) {
      if (venueResponse.ok) {
        const venueData = await venueResponse.json();
        const venueEvents = venueData._embedded?.events || [];
        allEvents = [...allEvents, ...venueEvents];
      }
    }

    // Deduplicate events by ID
    const uniqueEvents = [];
    const seenIds = new Set();

    for (const event of allEvents) {
      if (!seenIds.has(event.id)) {
        seenIds.add(event.id);
        uniqueEvents.push(event);
      }
    }

    // Sort by date
    uniqueEvents.sort((a, b) => {
      const dateA = new Date(a.dates?.start?.localDate || a.dates?.start?.dateTime);
      const dateB = new Date(b.dates?.start?.localDate || b.dates?.start?.dateTime);
      return dateA - dateB;
    });

    // Transform to our expected format
    const transformedData = {
      events: uniqueEvents,
      pagination: {
        object_count: uniqueEvents.length,
        page_number: 0,
        page_size: uniqueEvents.length
      }
    };

    res.status(200).json(transformedData);

  } catch (error) {
    console.error('Ticketmaster API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
