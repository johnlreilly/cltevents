// Debug function to find event data sources for any venue
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const venueUrl = req.query.url || 'https://snugrock.com';
  
  try {
    // Try multiple potential sources
    const sources = [
      { name: 'homepage', url: venueUrl },
      { name: 'rss', url: `${venueUrl}/?feed=rss2` },
      { name: 'wp-json-posts', url: `${venueUrl}/wp-json/wp/v2/posts` },
      { name: 'wp-json-pages', url: `${venueUrl}/wp-json/wp/v2/pages` },
    ];
    
    const results = {};
    
    for (const source of sources) {
      try {
        const response = await fetch(source.url);
        const text = await response.text();
        
        results[source.name] = {
          url: source.url,
          status: response.status,
          contentType: response.headers.get('content-type'),
          size: text.length,
          sample: text.substring(0, 2000)
        };
        
        // If it's JSON, parse it
        if (response.headers.get('content-type')?.includes('json')) {
          try {
            const json = JSON.parse(text);
            results[source.name].parsed = json;
          } catch (e) {
            // Not valid JSON
          }
        }
        
      } catch (error) {
        results[source.name] = { url: source.url, error: error.message };
      }
    }
    
    // Also check the homepage for iframes or embeds
    const homepageResponse = await fetch(venueUrl);
    const html = await homepageResponse.text();
    
    const iframes = html.match(/<iframe[^>]*>/gi) || [];
    const embeds = html.match(/embed[^"']*/gi) || [];
    const bandsInTown = html.includes('bandsintown') || html.includes('bit.ly');
    const songkick = html.includes('songkick');
    
    results.embedInfo = {
      iframes: iframes.slice(0, 3),
      hasEmbeds: embeds.length > 0,
      usesBandsInTown: bandsInTown,
      usesSongkick: songkick
    };
    
    res.status(200).json(results);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}