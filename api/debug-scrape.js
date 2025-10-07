// Debug function to find Smokey Joe's event data sources
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Try to find calendar feeds, APIs, or data sources
    const urlsToTry = [
      { url: 'https://smokeyjoes.cafe', type: 'homepage' },
      { url: 'https://smokeyjoes.cafe/feed/', type: 'rss' },
      { url: 'https://smokeyjoes.cafe/calendar/', type: 'calendar' },
      { url: 'https://smokeyjoes.cafe/events/', type: 'events' },
      { url: 'https://smokeyjoes.cafe/wp-json/wp/v2/events', type: 'wp-api-events' },
      { url: 'https://smokeyjoes.cafe/wp-json/tribe/events/v1/events', type: 'tribe-api' },
      { url: 'https://smokeyjoes.cafe/?feed=events-calendar', type: 'calendar-feed' },
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
          isJson: contentType.includes('json'),
          isXml: contentType.includes('xml'),
          size: text.length,
          
          // Look for event data
          hasEventData: text.toLowerCase().includes('event'),
          hasDateData: /\d{4}-\d{2}-\d{2}/.test(text) || /\d{1,2}\/\d{1,2}\/\d{4}/.test(text),
          
          // Check for calendar plugin data
          hasPiecal: text.includes('piecal'),
          hasEventJson: text.includes('"event'),
          
          // Sample
          sample: text.substring(0, 500),
        };
        
        // If this looks promising, grab more
        if (contentType.includes('json') || (results[type].hasEventData && results[type].hasDateData)) {
          results[type].fullContent = text.length < 50000 ? text : text.substring(0, 50000);
        }
        
      } catch (error) {
        results[type] = { url, error: error.message };
      }
    }
    
    // Also check the homepage for embedded calendar data
    try {
      const homepageResponse = await fetch('https://smokeyjoes.cafe');
      const html = await homepageResponse.text();
      
      // Look for calendar JavaScript data
      const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gs) || [];
      const calendarScripts = scriptMatches.filter(s => 
        s.includes('calendar') || s.includes('event') || s.includes('piecal')
      );
      
      results.homepage_scripts = {
        totalScripts: scriptMatches.length,
        calendarScriptsCount: calendarScripts.length,
        calendarScriptsSample: calendarScripts.slice(0, 2).map(s => s.substring(0, 500)),
      };
      
      // Look for JSON data embedded in the page
      const jsonMatches = html.match(/var\s+\w+\s*=\s*(\{.*?\});/gs) || [];
      results.embedded_json = {
        count: jsonMatches.length,
        samples: jsonMatches.slice(0, 3),
      };
      
    } catch (error) {
      results.homepage_analysis = { error: error.message };
    }
    
    res.status(200).json(results);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}