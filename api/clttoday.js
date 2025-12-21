// Vercel Serverless Function to fetch events from CLTtoday RSS feed and parse individual events
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

    if (!rssResponse.ok) {
      throw new Error(`RSS fetch failed: ${rssResponse.status}`);
    }

    const rssText = await rssResponse.text();
    console.log('RSS text length:', rssText.length);

    // Parse RSS XML manually (simple parsing)
    const allEvents = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let articleCount = 0;

    // Helper to extract fields from XML
    const getField = (itemXml, fieldName) => {
      const fieldRegex = new RegExp(`<${fieldName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${fieldName}>`, 'i');
      const cdataMatch = itemXml.match(fieldRegex);
      if (cdataMatch) return cdataMatch[1].trim();

      const simpleRegex = new RegExp(`<${fieldName}[^>]*>([\\s\\S]*?)<\\/${fieldName}>`, 'i');
      const simpleMatch = itemXml.match(simpleRegex);
      return simpleMatch ? simpleMatch[1].trim() : null;
    };

    // Helper to parse date from text like "Jan. 4", "Through Jan. 4", "Various days + times through Jan. 4"
    const parseDateText = (dateText) => {
      if (!dateText) return null;

      // Extract month and day patterns
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthPattern = monthNames.join('|');

      // Match patterns like "Jan. 4", "January 4", "Jan 4", etc.
      const dateMatch = dateText.match(new RegExp(`(${monthPattern})[a-z]*\\.?\\s+(\\d{1,2})`, 'i'));
      if (dateMatch) {
        const month = dateMatch[1].substring(0, 3);
        const day = parseInt(dateMatch[2]);
        const monthIndex = monthNames.findIndex(m => month.toLowerCase().startsWith(m.toLowerCase()));

        if (monthIndex !== -1) {
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();

          // If the event month is before current month, assume next year
          const year = monthIndex < currentMonth ? currentYear + 1 : currentYear;

          // Return in YYYY-MM-DD format (ISO 8601, expected by frontend)
          return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }

      return null;
    };

    // Helper to extract time from text like "7:00 PM", "7 PM", "7pm"
    const parseTimeText = (timeText) => {
      if (!timeText) return null;

      // Match patterns like "7:00 PM", "7 PM", "7pm", "7:00pm"
      const timeMatch = timeText.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|a\.m\.|p\.m\.)/i);
      if (timeMatch) {
        const hour = timeMatch[1];
        const minute = timeMatch[2] || '00';
        const period = timeMatch[3].replace(/\./g, '').toUpperCase();
        return `${hour}:${minute} ${period}`;
      }

      return null;
    };

    // Process each RSS item (article)
    while ((match = itemRegex.exec(rssText)) !== null) {
      articleCount++;
      const itemXml = match[1];

      const articleTitle = getField(itemXml, 'title');
      const articleLink = getField(itemXml, 'link');
      const contentEncoded = getField(itemXml, 'content:encoded');
      const description = getField(itemXml, 'description');

      console.log(`Processing article ${articleCount}: ${articleTitle}`);

      if (!articleLink) continue;

      // Try to fetch the full article to parse individual events
      try {
        console.log(`Fetching article: ${articleLink}`);
        const articleResponse = await fetch(articleLink, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CLTEvents/1.0)',
          },
        });

        if (!articleResponse.ok) {
          console.log(`Failed to fetch article: ${articleResponse.status}`);
          continue;
        }

        const articleHtml = await articleResponse.text();

        // Extract article body content (look for common article content selectors)
        // The content is in <p> tags within the article body
        const bodyMatch = articleHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/);
        const bodyContent = bodyMatch ? bodyMatch[1] : articleHtml;

        // Extract all paragraph text
        const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
        let pMatch;
        const paragraphs = [];

        while ((pMatch = paragraphRegex.exec(bodyContent)) !== null) {
          const pText = pMatch[1]
            .replace(/<a[^>]*>([\s\S]*?)<\/a>/g, '$1') // Keep link text but remove tags
            .replace(/<[^>]+>/g, '') // Remove other HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&#8217;/g, "'")
            .replace(/&#8220;/g, '"')
            .replace(/&#8221;/g, '"')
            .trim();

          if (pText) {
            paragraphs.push(pText);
          }
        }

        console.log(`\n📋 ALL PARAGRAPHS EXTRACTED (${paragraphs.length} total):`);
        paragraphs.forEach((p, i) => {
          console.log(`[${i}] ${p}`);
        });

        // Parse pipe-delimited events from paragraphs
        // Expected format: Event Name | Date | Time | Venue | Price | Description
        let eventsFound = 0;
        for (const paragraph of paragraphs) {
          // Skip intro/outro paragraphs (look for pipe delimiter)
          if (!paragraph.includes('|')) continue;

          const parts = paragraph.split('|').map(p => p.trim());

          console.log(`\n✂️ SPLITTING: "${paragraph}"`);
          console.log(`   → ${parts.length} parts: ${JSON.stringify(parts)}`);

          // Only process 6-part entries: Event Name | Date | Time | Venue | Price | Description
          if (parts.length !== 6) {
            console.log(`   ⏭️  SKIPPING: Not 6 parts`);
            continue;
          }

          const eventName = parts[0];
          const eventDate = parts[1];
          const eventTime = parts[2];
          const venue = parts[3];
          const price = parts[4];
          const eventDescription = parts[5];

          console.log(`   ✅ PARSED: name="${eventName}", venue="${venue}", date="${eventDate}", time="${eventTime}"`);

          // Skip if event name is too short or looks like a header
          if (eventName.length < 5 || eventName.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i)) {
            continue;
          }

          // Parse date and time
          const parsedDate = parseDateText(eventDate);
          const parsedTime = parseTimeText(eventTime);

          // Create event object
          const event = {
            name: eventName,
            venue: venue,
            date: parsedDate,
            time: parsedTime,
            description: eventDescription,
            url: articleLink,
            source: 'clttoday',
            category: 'Events',
          };

          console.log(`Found event: ${eventName} at ${venue} on ${eventDate}`);
          allEvents.push(event);
          eventsFound++;
        }

        console.log(`Extracted ${eventsFound} events from article`);

      } catch (articleError) {
        console.error(`Error fetching article ${articleLink}:`, articleError.message);
        // Continue to next article
        continue;
      }
    }

    console.log(`Total articles processed: ${articleCount}`);
    console.log(`Total events extracted: ${allEvents.length}`);

    res.status(200).json({
      success: true,
      events: allEvents,
      count: allEvents.length
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
