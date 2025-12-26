// Vercel Serverless Function to fetch events from Amos' Southend
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
    const eventsResponse = await fetch('https://amossouthend.com/events/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CLTEvents/1.2.1)',
      },
    });

    if (!eventsResponse.ok) {
      throw new Error(`Amos events fetch failed: ${eventsResponse.status}`);
    }

    const eventsHtml = await eventsResponse.text();

    // Parse events from HTML
    const allEvents = [];

    // Extract event blocks - look for event wrapper divs
    const eventRegex = /<article[^>]*class="[^"]*eventWrapper[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
    let match;

    while ((match = eventRegex.exec(eventsHtml)) !== null) {
      const eventHtml = match[1];

      try {
        // Extract event name from h2 or title link
        const nameMatch = eventHtml.match(/<h2[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>[\s\S]*?<\/h2>/i) ||
                         eventHtml.match(/<a[^>]*class="[^"]*eventTitle[^"]*"[^>]*>([^<]+)<\/a>/i);
        const eventName = nameMatch ? nameMatch[1].trim() : null;

        if (!eventName) continue;

        // Extract date - look for eventMonth span or date info
        const dateMatch = eventHtml.match(/<span[^>]*class="[^"]*eventMonth[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                         eventHtml.match(/<time[^>]*>([^<]+)<\/time>/i);
        let eventDate = dateMatch ? dateMatch[1].trim() : null;

        // Extract time - look for "Doors:" or "Show:" patterns
        const timeMatch = eventHtml.match(/(?:Doors:|Show:)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
        const eventTime = timeMatch ? timeMatch[1].trim() : null;

        // Extract venue - default to "Amos' Southend"
        const venue = "Amos' Southend";

        // Extract price - look for ADV or DOS pricing
        const priceMatch = eventHtml.match(/\$(\d+(?:\.\d{2})?)\s*(?:ADV|DOS)/i);
        const price = priceMatch ? `$${priceMatch[1]}` : null;

        // Extract description - look for paragraph text
        const descMatch = eventHtml.match(/<p[^>]*>([^<]+)<\/p>/i);
        const description = descMatch ? descMatch[1].trim() : null;

        // Extract event URL - look for "More Info" or ticket links
        const urlMatch = eventHtml.match(/<a[^>]*href="([^"]+)"[^>]*>(?:More Info|Buy Tickets)/i);
        const eventUrl = urlMatch ? urlMatch[1] : 'https://amossouthend.com/events/';

        // Parse date to ISO format
        const parsedDate = parseAmosDate(eventDate);

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
          venue: venue,
          date: parsedDate,
          time: eventTime,
          description: description,
          price: price,
          url: eventUrl.startsWith('http') ? eventUrl : `https://amossouthend.com${eventUrl}`,
          source: 'amos',
          category: 'Music',
        };

        allEvents.push(event);
      } catch (parseError) {
        console.error('Error parsing individual event:', parseError);
        continue;
      }
    }

    console.log(`\n✅ Total Amos' Southend events extracted: ${allEvents.length}`);

    // Log all events
    if (allEvents.length > 0) {
      console.log(`\nAMOS' SOUTHEND EVENTS (${allEvents.length}):`);
      allEvents.forEach((event, index) => {
        console.log(`\nEvent ${index + 1}:`);
        console.log(`  Name: ${event.name}`);
        console.log(`  Date: ${event.date}`);
        console.log(`  Time: ${event.time || 'N/A'}`);
        console.log(`  Venue: ${event.venue}`);
        console.log(`  Price: ${event.price || 'N/A'}`);
        console.log(`  Description: ${event.description || 'N/A'}`);
        console.log(`  URL: ${event.url}`);
      });
    }

    res.status(200).json({
      success: true,
      events: allEvents,
      count: allEvents.length
    });

  } catch (error) {
    console.error("Amos' Southend events fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch events from Amos' Southend",
      details: error.message
    });
  }
}

/**
 * Parse Amos' Southend date format to ISO 8601
 * Examples: "Sat, Dec 27", "Mon, Jan 6"
 * @param {string} dateText - Date string from Amos website
 * @returns {string|null} ISO 8601 date (YYYY-MM-DD) or null
 */
function parseAmosDate(dateText) {
  if (!dateText) return null;

  // Match patterns like "Sat, Dec 27" or "December 27"
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthPattern = monthNames.join('|');

  const dateMatch = dateText.match(new RegExp(`(${monthPattern})[a-z]*\\s+(\\d{1,2})`, 'i'));
  if (dateMatch) {
    const month = dateMatch[1].substring(0, 3);
    const day = parseInt(dateMatch[2]);
    const monthIndex = monthNames.findIndex(m => month.toLowerCase().startsWith(m.toLowerCase()));

    if (monthIndex !== -1) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      // If the event month is before current month, assume next year
      const year = monthIndex < currentMonth ? currentYear + 1 : currentYear;

      // Return in YYYY-MM-DD format
      return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
}
