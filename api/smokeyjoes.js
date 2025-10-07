// Vercel Serverless Function to scrape Smokey Joe's Cafe events
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch('https://smokeyjoes.cafe');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract events from the simcal calendar HTML
    const events = parseSmokeyJoesEvents(html);
    
    res.status(200).json({
      events: events,
      source: 'Smokey Joe\'s Cafe',
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Smokey Joe\'s scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape Smokey Joe\'s events',
      details: error.message 
    });
  }
}

function parseSmokeyJoesEvents(html) {
  const events = [];
  
  try {
    // Look for event blocks in the simcal calendar
    const eventRegex = /<li class="simcal-event[^"]*"[^>]*>[\s\S]*?<\/li>/g;
    const eventMatches = html.match(eventRegex) || [];
    
    eventMatches.forEach(eventHtml => {
      try {
        // Extract event title
        const titleMatch = eventHtml.match(/<span class="simcal-event-title"[^>]*>([^<]+)<\/span>/);
        const title = titleMatch ? titleMatch[1].replace(/&#039;/g, "'").replace(/&amp;/g, "&") : null;
        
        if (!title) return;
        
        // Extract start date/time
        const startDateMatch = eventHtml.match(/data-event-start="(\d+)"/);
        const startTimestamp = startDateMatch ? parseInt(startDateMatch[1]) * 1000 : null;
        
        // Extract end date/time
        const endDateMatch = eventHtml.match(/data-event-end="(\d+)"/);
        const endTimestamp = endDateMatch ? parseInt(endDateMatch[1]) * 1000 : null;
        
        // Extract description if available
        const descMatch = eventHtml.match(/<div class="simcal-event-description"[^>]*>([\s\S]*?)<\/div>/);
        let description = '';
        if (descMatch) {
          description = descMatch[1]
            .replace(/<[^>]+>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, "&")
            .trim();
        }
        
        if (title && startTimestamp) {
          events.push({
            name: title,
            date: new Date(startTimestamp).toISOString().split('T')[0],
            startTime: new Date(startTimestamp),
            endTime: endTimestamp ? new Date(endTimestamp) : null,
            description: description || title,
            venue: 'Smokey Joe\'s Cafe',
            source: 'smokeyjoes'
          });
        }
      } catch (error) {
        console.error('Error parsing individual event:', error);
      }
    });
    
  } catch (error) {
    console.error('Parsing error:', error);
  }
  
  return events;
}