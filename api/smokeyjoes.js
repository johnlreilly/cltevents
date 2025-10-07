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
    // Fetch the Smokey Joe's events page
    const response = await fetch('https://www.smokeyjoes.cafe/events');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Smokey Joe's website: ${response.status}`);
    }

    const html = await response.text();
    
    // Parse the HTML to extract events
    // This is a simplified example - we'll need to adjust based on their actual HTML structure
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
    // Look for common patterns in event listings
    // This is a basic regex approach - we'll refine based on actual HTML structure
    
    // Try to find event sections (adjust patterns based on actual HTML)
    const eventPatterns = [
      // Pattern 1: Look for date/time patterns
      /(\w+day,?\s+\w+\s+\d{1,2}(?:st|nd|rd|th)?)/gi,
      // Pattern 2: Look for artist/band names in headers
      /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi,
    ];

    // This is a placeholder - actual implementation depends on website structure
    // For now, return a sample structure showing what we're aiming for
    
    // Check if we can find any date-like strings
    const dateMatches = html.match(/\d{1,2}\/\d{1,2}\/\d{4}/g);
    
    if (dateMatches && dateMatches.length > 0) {
      console.log('Found potential dates:', dateMatches.slice(0, 5));
    }

    // Return empty array for now - we'll populate this after analyzing the actual HTML
    return events;

  } catch (error) {
    console.error('Parsing error:', error);
    return events;
  }
}

// Alternative: More robust parsing with cheerio-like approach
// We can enhance this if the basic approach doesn't work
function extractEventData(html) {
  // Try to find structured data (JSON-LD, microdata, etc.)
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  
  if (jsonLdMatch) {
    try {
      const structuredData = JSON.parse(jsonLdMatch[1]);
      if (structuredData['@type'] === 'Event' || structuredData['@type'] === 'EventSeries') {
        return structuredData;
      }
    } catch (e) {
      console.log('No valid JSON-LD found');
    }
  }
  
  return null;
}