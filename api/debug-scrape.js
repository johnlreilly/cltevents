// Debug function to analyze Smokey Joe's website structure
// Visit /api/debug-scrape to see the raw HTML and help build the scraper
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const response = await fetch('https://www.smokeyjoes.cafe/events');
    const html = await response.text();
    
    // Extract useful information about the page structure
    const analysis = {
      pageTitle: html.match(/<title>(.*?)<\/title>/)?.[1] || 'Not found',
      hasJsonLd: html.includes('application/ld+json'),
      headingCount: (html.match(/<h[1-6]/g) || []).length,
      linkCount: (html.match(/<a /g) || []).length,
      hasCalendar: html.toLowerCase().includes('calendar'),
      hasEventClass: html.includes('class="event') || html.includes('class=\'event'),
      
      // Sample of first 2000 characters (to see structure)
      htmlSample: html.substring(0, 2000),
      
      // Look for specific patterns
      potentialEventMarkers: [
        { pattern: 'data-event', found: html.includes('data-event') },
        { pattern: 'event-item', found: html.includes('event-item') },
        { pattern: 'calendar-event', found: html.includes('calendar-event') },
        { pattern: 'show-', found: html.includes('show-') },
      ],
      
      // Extract all class names to help identify event containers
      classNames: [...new Set(
        (html.match(/class=["']([^"']+)["']/g) || [])
          .map(m => m.match(/class=["']([^"']+)["']/)[1])
          .slice(0, 50) // First 50 unique classes
      )],
    };
    
    res.status(200).json(analysis);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}