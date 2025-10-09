// Vercel Serverless Function to fetch events from CLTtoday RSS feed
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
    console.log('Fetching CLTtoday RSS feed...');

    // Fetch the RSS feed
    const rssResponse = await fetch('https://clttoday.6amcity.com/events.rss');

    console.log('RSS response status:', rssResponse.status);

    if (!rssResponse.ok) {
      throw new Error(`RSS fetch failed: ${rssResponse.status}`);
    }

    const rssText = await rssResponse.text();
    console.log('RSS text length:', rssText.length);
    console.log('First 500 chars:', rssText.substring(0, 500));

    // Parse RSS XML manually (simple parsing)
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let itemCount = 0;

    while ((match = itemRegex.exec(rssText)) !== null) {
      itemCount++;
      const itemXml = match[1];
      console.log(`Parsing item ${itemCount}...`);

      // Extract fields
      const getField = (fieldName) => {
        const fieldRegex = new RegExp(`<${fieldName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${fieldName}>`, 'i');
        const cdataMatch = itemXml.match(fieldRegex);
        if (cdataMatch) return cdataMatch[1].trim();

        const simpleRegex = new RegExp(`<${fieldName}[^>]*>([\\s\\S]*?)<\\/${fieldName}>`, 'i');
        const simpleMatch = itemXml.match(simpleRegex);
        return simpleMatch ? simpleMatch[1].trim() : null;
      };

      const title = getField('title');
      const link = getField('link');
      const description = getField('description');
      const pubDate = getField('pubDate');
      const category = getField('category');
      const contentEncoded = getField('content:encoded');

      // Extract event links from content with dates
      const eventLinks = [];
      const eventLinkRegex = /clttoday\.6amcity\.com\/events#\/details\/[^\/]+\/\d+\/(\d{4}-\d{2}-\d{2})/g;
      let eventMatch;

      const contentToSearch = contentEncoded || description || '';
      while ((eventMatch = eventLinkRegex.exec(contentToSearch)) !== null) {
        eventLinks.push(eventMatch[1]); // The date portion
      }

      // Extract image from description if available
      let image = null;
      const imgMatch = description?.match(/<img[^>]+src="([^"]+)"/);
      if (imgMatch) {
        image = imgMatch[1];
      }

      // Clean description (remove HTML tags)
      const cleanDescription = description?.replace(/<[^>]+>/g, '').trim();

      if (title) {
        console.log(`Found event: ${title} with ${eventLinks.length} event dates`);
        items.push({
          name: title,
          url: link,
          description: cleanDescription?.substring(0, 300) || '',
          pubDate: pubDate,
          category: category,
          image: image,
          source: 'clttoday',
          eventDates: eventLinks // Array of dates found in the article
        });
      }
    }

    console.log(`Total items found: ${itemCount}`);
    console.log(`Total events parsed: ${items.length}`);

    res.status(200).json({
      success: true,
      events: items,
      count: items.length
    });

  } catch (error) {
    console.error('CLTtoday RSS fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events from RSS',
      details: error.message
    });
  }
}
