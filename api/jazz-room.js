/**
 * Decode HTML entities in text
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
function decodeHTMLEntities(text) {
  if (!text) return text;

  const entities = {
    '&#8211;': '–',  // en dash
    '&#8212;': '—',  // em dash
    '&#8217;': "'",  // right single quotation mark
    '&#8216;': "'",  // left single quotation mark
    '&#8220;': '"',  // left double quotation mark
    '&#8221;': '"',  // right double quotation mark
    '&#038;': '&',   // ampersand
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  return decoded;
}

// Vercel Serverless Function to fetch events from The Jazz Room
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

  try {
    // Fetch events from the WordPress Events Calendar JSON API
    // This includes both jazz-room and jazz-education-events categories
    const eventsResponse = await fetch('https://www.thejazzarts.org/wp-json/tribe/events/v1/events/?categories=jazz-room&per_page=50', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CLTEvents/1.2.1)',
      },
    });

    if (!eventsResponse.ok) {
      throw new Error(`Jazz Room events fetch failed: ${eventsResponse.status}`);
    }

    const eventsData = await eventsResponse.json();

    // Parse events from JSON API
    const allEvents = [];

    if (eventsData.events && Array.isArray(eventsData.events)) {
      for (const event of eventsData.events) {
        try {
          const eventName = decodeHTMLEntities(event.title);
          if (!eventName) continue;

          // Parse start date from API (format: "2026-01-16 18:00:00")
          const startDateStr = event.start_date;
          let eventDate = null;
          let eventTime = null;

          if (startDateStr) {
            // Parse date and time
            const dateObj = new Date(startDateStr);

            // Convert to YYYY-MM-DD format
            eventDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

            // Extract time in 12-hour format
            const hours = dateObj.getHours();
            const minutes = dateObj.getMinutes();
            const ampm = hours >= 12 ? 'pm' : 'am';
            const hour12 = hours % 12 || 12;
            eventTime = `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
          }

          // Skip events in the past
          if (eventDate) {
            const eventDateObj = new Date(eventDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (eventDateObj < today) {
              continue;
            }
          }

          // Create event object
          const eventObj = {
            name: eventName,
            venue: event.venue?.venue || 'The Jazz Room',
            date: eventDate,
            time: eventTime,
            description: event.excerpt ? decodeHTMLEntities(event.excerpt.replace(/<[^>]*>/g, '').trim()) : null,
            price: event.cost || null,
            url: event.url || 'https://www.thejazzarts.org/events/category/jazz-room/',
            source: 'jazz-room',
            category: 'Music',
          };

          allEvents.push(eventObj);
        } catch (parseError) {
          console.error('Error parsing individual event:', parseError);
          continue;
        }
      }
    }

    console.log(`\n✅ Total Jazz Room events extracted: ${allEvents.length}`);

    // Log all events
    if (allEvents.length > 0) {
      console.log(`\nJAZZ ROOM EVENTS (${allEvents.length}):`);
      allEvents.forEach((event, index) => {
        console.log(`\n\nEvent ${index + 1}:`);
        console.log(`  Name: ${event.name}`);
        console.log(`  Date: ${event.date}`);
        console.log(`  Time: ${event.time || 'N/A'}`);
        console.log(`  Venue: ${event.venue}`);
        console.log(`  Price: ${event.price || 'N/A'}`);
        console.log(`  URL: ${event.url}`);
      });
    }

    res.status(200).json({
      success: true,
      events: allEvents,
      count: allEvents.length
    });

  } catch (error) {
    console.error('Jazz Room events fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events from The Jazz Room',
      details: error.message
    });
  }
}
