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
    // Fetch the events page
    const eventsResponse = await fetch('https://www.thejazzarts.org/events/category/jazz-room/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CLTEvents/1.2.1)',
      },
    });

    if (!eventsResponse.ok) {
      throw new Error(`Jazz Room events fetch failed: ${eventsResponse.status}`);
    }

    const eventsHtml = await eventsResponse.text();

    // Parse events from HTML
    const allEvents = [];

    // Extract event blocks - look for type-tribe_events divs with jazz-room category
    const eventRegex = /<div\s+class="type-tribe_events[^"]*tribe-events-category-jazz-room[^"]*"[^>]*>([\s\S]*?)(?=<div\s+class="type-tribe_events|<!-- Event  -->|$)/g;
    let match;

    while ((match = eventRegex.exec(eventsHtml)) !== null) {
      const eventHtml = match[0];

      try {
        // Extract event name from h2 with class tribe-events-title
        const nameMatch = eventHtml.match(/<h2[^>]*class="tribe-events-title"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
        const eventName = nameMatch ? nameMatch[1].trim() : null;

        if (!eventName) continue;

        // Extract date and time from tribe-events-duration
        const durationMatch = eventHtml.match(/<div[^>]*class="tribe-events-duration"[^>]*>([\s\S]*?)<\/div>/i);
        let eventDate = null;
        let eventTime = null;

        if (durationMatch) {
          const durationText = durationMatch[1];

          // Extract start date/time: "January 16, 2026 @ 6:00 pm"
          const startMatch = durationText.match(/<span[^>]*class="tribe-event-date-start"[^>]*>([^<]+)<\/span>/i);
          if (startMatch) {
            const startText = startMatch[1].trim(); // "January 16, 2026 @ 6:00 pm"
            const dateTimeMatch = startText.match(/([A-Za-z]+\s+\d{1,2},\s+\d{4})\s*@\s*(\d{1,2}:\d{2}\s*(?:am|pm))/i);

            if (dateTimeMatch) {
              eventDate = dateTimeMatch[1]; // "January 16, 2026"
              eventTime = dateTimeMatch[2]; // "6:00 pm"
            }
          }
        }

        // Extract event URL
        const urlMatch = eventHtml.match(/<a[^>]*href="([^"]+)"[^>]*rel="bookmark"/i);
        const eventUrl = urlMatch ? urlMatch[1] : 'https://www.thejazzarts.org/events/category/jazz-room/';

        // Parse date to ISO format
        const parsedDate = parseJazzRoomDate(eventDate);

        // Skip events in the past
        if (parsedDate) {
          const eventDateObj = new Date(parsedDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (eventDateObj < today) {
            continue;
          }
        }

        // Create event object
        const event = {
          name: eventName,
          venue: 'The Jazz Room',
          date: parsedDate,
          time: eventTime,
          description: null,
          price: null,
          url: eventUrl.startsWith('http') ? eventUrl : `https://www.thejazzarts.org${eventUrl}`,
          source: 'jazz-room',
          category: 'Music',
        };

        allEvents.push(event);
      } catch (parseError) {
        console.error('Error parsing individual event:', parseError);
        continue;
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

/**
 * Parse Jazz Room date format to ISO 8601
 * Examples: "January 16, 2026", "December 27, 2025"
 * @param {string} dateText - Date string from Jazz Room website
 * @returns {string|null} ISO 8601 date (YYYY-MM-DD) or null
 */
function parseJazzRoomDate(dateText) {
  if (!dateText) return null;

  // Match patterns like "January 16, 2026" or "Dec 27, 2025"
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthPattern = monthNames.join('|');

  const dateMatch = dateText.match(new RegExp(`(${monthPattern})\\s+(\\d{1,2}),\\s+(\\d{4})`, 'i'));
  if (dateMatch) {
    const month = dateMatch[1];
    const day = parseInt(dateMatch[2]);
    const year = parseInt(dateMatch[3]);
    const monthIndex = monthNames.findIndex(m => month.toLowerCase() === m.toLowerCase());

    if (monthIndex !== -1) {
      // Return in YYYY-MM-DD format
      return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
}
