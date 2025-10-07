// Debug function to find event data sources for any venue
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Get venue URL from query parameter, default to Snug Harbor
  const venueUrl = req.query.url || 'https://snugrock.com';
  
  try {
    const urlsToTry = [
      { url: venueUrl, type: 'homepage' },
      { url: `${venueUrl}/events`, type: 'events-page' },
      { url: `${venueUrl}/calendar`, type: 'calendar-page' },
      { url: `${venueUrl}/shows`, type: 'shows-page' },
    ];
    
    const results = {};
    
    for (const { url, type } of urlsToTry) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        
        results[type] = {
          url,
          status: response.status,
          contentType,
          size: text.length,
          
          // Look for event-related content
          hasEventData: text.toLowerCase().includes('event'),
          hasCalendar: text.toLowerCase().includes('calendar'),
          hasShow: text.toLowerCase().includes('show'),
          
          // Look for common calendar plugins
          hasFullCalendar: text.includes('fullcalendar') || text.includes('FullCalendar'),
          hasSimpleCalendar: text.includes('simcal') || text.includes('google-calendar-events'),
          hasEventCalendar: text.includes('tribe-events') || text.includes('event-calendar'),
          
          // Sample of content
          sample: text.substring(0, 1000),
          
          // Look for structured data
          hasJsonLd: text.includes('application/ld+json'),
          hasSchema: text.includes('schema.org'),
        };
        
        // If this looks like it has event data, grab more
        if (response.status === 200 && (results[type].hasEventData || results[type].hasCalendar)) {
          // Look for event containers
          const eventDivs = (text.match(/<div[^>]*class="[^"]*event[^"]*"/gi) || []).length;
          const eventArticles = (text.match(/<article[^>]*class="[^"]*event[^"]*"/gi) || []).length;
          const eventLists = (text.match(/<li[^>]*class="[^"]*event[^"]*"/gi) || []).length;
          
          results[type].eventContainers = {
            divs: eventDivs,
            articles: eventArticles,
            lists: eventLists
          };
          
          // Look for date patterns
          const dates = text.match(/\d{4}-\d{2}-\d{2}/g) || [];
          results[type].datePatterns = {
            iso: dates.slice(0, 5),
            count: dates.length
          };
        }
        
      } catch (error) {
        results[type] = { url, error: error.message };
      }
    }
    
    res.status(200).json(results);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}