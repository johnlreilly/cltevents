// Debug function to find event data sources for any venue
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const venueUrl = req.query.url || 'https://snugrock.com';
  
  try {
    const response = await fetch(venueUrl);
    const html = await response.text();
    
    // Look for the main content area (skip header/footer)
    const mainMatch = html.match(/<main[^>]*>([\s\S]*)<\/main>/i) ||
                      html.match(/<div[^>]*id="content"[^>]*>([\s\S]*)<\/div>/i) ||
                      html.match(/<article[^>]*>([\s\S]*)<\/article>/i);
    
    const mainContent = mainMatch ? mainMatch[1] : html;
    
    // Look for sections that might contain events
    const h1Headers = mainContent.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h2Headers = mainContent.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
    const h3Headers = mainContent.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || [];
    
    // Look for anything that looks like an event listing
    const eventSections = mainContent.match(/<section[^>]*class="[^"]*event[^"]*"[^>]*>[\s\S]{0,500}/gi) ||
                         mainContent.match(/<div[^>]*class="[^"]*show[^"]*"[^>]*>[\s\S]{0,500}/gi) ||
                         [];
    
    // Look for date strings
    const dateStrings = mainContent.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}(st|nd|rd|th)?\b/gi) || [];
    
    res.status(200).json({
      url: venueUrl,
      status: response.status,
      h1Headers: h1Headers.map(h => h.replace(/<[^>]+>/g, '').trim()).slice(0, 10),
      h2Headers: h2Headers.map(h => h.replace(/<[^>]+>/g, '').trim()).slice(0, 10),
      h3Headers: h3Headers.map(h => h.replace(/<[^>]+>/g, '').trim()).slice(0, 10),
      eventSections: eventSections.slice(0, 3),
      dateStrings: dateStrings.slice(0, 10),
      
      // Return a larger sample focusing on middle of page where events likely are
      middleContent: html.substring(30000, 50000)
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}