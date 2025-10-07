// Debug function to find event data sources for any venue
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Get venue URL from query parameter, default to Snug Harbor
  const venueUrl = req.query.url || 'https://snugrock.com';
  
  try {
    const response = await fetch(venueUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    
    // Return first 20000 characters to inspect
    res.status(200).json({
      url: venueUrl,
      status: response.status,
      size: html.length,
      htmlSample: html.substring(0, 20000),
      
      // Look for common patterns
      hasEventClass: html.includes('class="event') || html.includes("class='event"),
      hasShowClass: html.includes('class="show') || html.includes("class='show"),
      hasDateClass: html.includes('class="date') || html.includes("class='date"),
      
      // Count certain elements
      h2Count: (html.match(/<h2/gi) || []).length,
      h3Count: (html.match(/<h3/gi) || []).length,
      articleCount: (html.match(/<article/gi) || []).length,
      
      // Look for specific text patterns
      monthNames: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
        .filter(month => html.toLowerCase().includes(month))
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}