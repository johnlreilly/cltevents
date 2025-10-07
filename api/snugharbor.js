// Vercel Serverless Function to scrape Snug Harbor events
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch('https://snugrock.com');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract events from Snug Harbor's website
    const events = parseSnugHarborEvents(html);
    
    res.status(200).json({
      events: events,
      source: 'Snug Harbor',
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Snug Harbor scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape Snug Harbor events',
      details: error.message 
    });
  }
}

function parseSnugHarborEvents(html) {
  const events = [];
  
  try {
    // Look for event data in the HTML
    // This is a starting point - we'll need to adjust based on their actual structure
    
    // Check for common calendar/event patterns
    // Many WordPress sites use similar patterns to Smokey Joe's
    const eventRegex = /<article[^>]*class="[^"]*event[^"]*"[^>]*>[\s\S]*?<\/article>/gi;
    let eventMatches = html.match(eventRegex);
    
    if (!eventMatches) {
      // Try alternative patterns
      eventRegex = /<div[^>]*class="[^"]*event[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
      eventMatches = html.match(eventRegex);
    }
    
    if (eventMatches) {
      eventMatches.forEach(eventHtml => {
        try {
          // Extract title
          const titleMatch = eventHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) ||
                           eventHtml.match(/class="[^"]*title[^"]*"[^>]*>([^<]+)</i);
          const title = titleMatch ? titleMatch[1].trim() : null;
          
          // Extract date - look for various date formats
          const dateMatch = eventHtml.match(/(\d{4}-\d{2}-\d{2})/) ||
                          eventHtml.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
          
          let eventDate = null;
          if (dateMatch) {
            eventDate = new Date(dateMatch[1]);
          }
          
          if (title && eventDate && !isNaN(eventDate.getTime())) {
            events.push({
              name: title,
              date: eventDate.toISOString().split('T')[0],
              startTime: eventDate,
              endTime: null,
              description: title,
              venue: 'Snug Harbor',
              source: 'snugharbor'
            });
          }
        } catch (error) {
          console.error('Error parsing individual event:', error);
        }
      });
    }
    
    // If no events found with standard patterns, log for debugging
    if (events.length === 0) {
      console.log('No events found with standard patterns. May need manual inspection.');
    }
    
  } catch (error) {
    console.error('Parsing error:', error);
  }
  
  return events;
}