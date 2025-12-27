import { getCached, setCache } from './_cache.js';

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

  // Check cache first
  const cacheKey = 'ticketmaster-events';
  const cached = getCached(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
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
      'Za5ju3rKuqZDdeGJU4AJgAGtnknkBhMcgs',  // Skyla Credit Union Amp
      'KovZ917AYaj',   // The Carolina
      'KovZ917AiEp',   // Headliners Uptown Charlotte
      'Z7r9jZa7qm',    // Blackbox Theater - Charlotte
      // Note: Smokey Joe's, Amos', Fillmore have dedicated scrapers
      // Note: Smaller venues may not be on Ticketmaster
    ];

    // Ticketmaster artist IDs for bands worth traveling to see
    // These ensure we catch touring artists even if they're not in Charlotte
    const priorityArtists = [
      'K8vZ9171C57',  // Dark Star Orchestra
    ];

    // Define cities to fetch events from
    const cities = [
      { name: 'Charlotte', stateCode: 'NC', radius: '25' },
      { name: 'Asheville', stateCode: 'NC', radius: '25' },
      { name: 'Raleigh', stateCode: 'NC', radius: '25' },
    ];

    // Create city queries
    const cityPromises = cities.map(city => {
      const params = new URLSearchParams({
        apikey: TICKETMASTER_API_KEY,
        city: city.name,
        stateCode: city.stateCode,
        radius: city.radius,
        unit: 'miles',
        size: '50',
        sort: 'date,asc'
      });
      return fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`);
    });

    // Fetch events from priority Charlotte venues
    const venuePromises = priorityVenues.map(venueId => {
      const venueParams = new URLSearchParams({
        apikey: TICKETMASTER_API_KEY,
        venueId: venueId,
        size: '50',
        sort: 'date,asc'
      });
      return fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${venueParams.toString()}`);
    });

    // Fetch events from priority artists (touring bands worth traveling for)
    const artistPromises = priorityArtists.map(artistId => {
      const artistParams = new URLSearchParams({
        apikey: TICKETMASTER_API_KEY,
        attractionId: artistId,
        stateCode: 'NC,SC,VA,TN,GA',  // Southeast region
        size: '50',
        sort: 'date,asc'
      });
      return fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${artistParams.toString()}`);
    });

    // Fetch all data in parallel
    const responses = await Promise.all([
      ...cityPromises,
      ...venuePromises,
      ...artistPromises
    ]);

    const [charlotteResponse, ashevilleResponse, raleighResponse, ...otherResponses] = responses;
    const venueResponses = otherResponses.slice(0, priorityVenues.length);
    const artistResponses = otherResponses.slice(priorityVenues.length);

    // Process all city responses
    let allEvents = [];
    const cityResponses = [charlotteResponse, ashevilleResponse, raleighResponse];

    for (let i = 0; i < cityResponses.length; i++) {
      const response = cityResponses[i];
      if (response.ok) {
        const data = await response.json();
        const events = data._embedded?.events || [];
        allEvents = [...allEvents, ...events];
      } else {
        console.error(`Ticketmaster API Error for ${cities[i].name}:`, response.status);
      }
    }

    // Add events from priority Charlotte venues
    for (const venueResponse of venueResponses) {
      if (venueResponse.ok) {
        const venueData = await venueResponse.json();
        const venueEvents = venueData._embedded?.events || [];
        allEvents = [...allEvents, ...venueEvents];
      }
    }

    // Add events from priority artists (touring bands)
    for (const artistResponse of artistResponses) {
      if (artistResponse.ok) {
        const artistData = await artistResponse.json();
        const artistEvents = artistData._embedded?.events || [];
        allEvents = [...allEvents, ...artistEvents];
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

    // Cache the result
    setCache(cacheKey, transformedData);

    res.status(200).json(transformedData);

  } catch (error) {
    console.error('Ticketmaster API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
