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
    // Fetch the RSS feed
    const rssResponse = await fetch('https://clttoday.6amcity.com/events.rss');

    if (!rssResponse.ok) {
      throw new Error(`RSS fetch failed: ${rssResponse.status}`);
    }

    const rssText = await rssResponse.text();

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

      if (!articleLink) continue;

      // Try to fetch the full article to parse individual events
      try {
        const articleResponse = await fetch(articleLink, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CLTEvents/1.0)',
          },
        });

        if (!articleResponse.ok) {
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

        // Helper to clean event text for logging
        const cleanEventText = (text) => {
          return text
            .replace(/[\r\n\t]+/g, ' ')  // Replace all line breaks and tabs with single space
            .replace(/\s{2,}/g, ' ')      // Replace multiple spaces with single space
            .trim();
        };

        // Helper to filter out non-event content
        const isLikelyEvent = (text) => {
          // Must have pipe character
          if (!text.includes('|')) return false;

          // Filter out JavaScript, CSS, and other code
          if (text.includes('function') || text.includes('var ') || text.includes('const ') ||
              text.includes('let ') || text.includes('{') || text.includes('}') ||
              text.includes('document.') || text.includes('window.') || text.includes('return ')) {
            return false;
          }

          // Filter out HTML-looking content
          if (text.includes('</') || text.includes('/>') || text.includes('<!')) {
            return false;
          }

          // Filter out very short entries (likely not events)
          if (text.length < 20) return false;

          return true;
        };

        // Categorize paragraphs with pipes by part count
        const pipeParagraphs = paragraphs.filter(p => isLikelyEvent(p));
        const categorized = {
          three: [],
          four: [],
          five: [],
          six: [],
          other: []
        };

        pipeParagraphs.forEach(p => {
          const cleaned = cleanEventText(p);
          const parts = cleaned.split('|').map(part => part.trim());
          const partCount = parts.length;

          if (partCount === 3) categorized.three.push(cleaned);
          else if (partCount === 4) categorized.four.push(cleaned);
          else if (partCount === 5) categorized.five.push(cleaned);
          else if (partCount === 6) categorized.six.push(cleaned);
          else categorized.other.push(cleaned);
        });

        // Log only 5-part and 6-part events (the ones we're parsing)
        if (categorized.five.length > 0) {
          console.log(`\n5-PART EVENTS (${categorized.five.length}):`);
          categorized.five.forEach(e => {
            const parts = e.split('|').map(p => p.trim());
            console.log(`\nEvent:`);
            console.log(`  [0] Part 1: ${parts[0]}`);
            console.log(`  [1] Part 2: ${parts[1]}`);
            console.log(`  [2] Part 3: ${parts[2]}`);
            console.log(`  [3] Part 4: ${parts[3]}`);
            console.log(`  [4] Part 5: ${parts[4]}`);
          });
        }

        if (categorized.six.length > 0) {
          console.log(`\n6-PART EVENTS (${categorized.six.length}):`);
          categorized.six.forEach(e => {
            const parts = e.split('|').map(p => p.trim());
            console.log(`\nEvent:`);
            console.log(`  [0] Name: ${parts[0]}`);
            console.log(`  [1] Date: ${parts[1]}`);
            console.log(`  [2] Time: ${parts[2]}`);
            console.log(`  [3] Venue: ${parts[3]}`);
            console.log(`  [4] Price: ${parts[4]}`);
            console.log(`  [5] Description: ${parts[5]}`);
          });
        }

        // Parse pipe-delimited events from paragraphs
        // Expected format: Event Name | Date | Time | Venue | Price | Description
        let eventsFound = 0;
        let lastValidDate = null; // Track most recent valid date for events missing dates

        for (const paragraph of paragraphs) {
          // Skip intro/outro paragraphs (look for pipe delimiter)
          if (!paragraph.includes('|')) continue;

          const parts = paragraph.split('|').map(p => p.trim());

          // Only process 5-part and 6-part entries
          if (parts.length < 5 || parts.length > 6) {
            continue;
          }

          let eventName, eventDate, eventTime, venue, price, eventDescription;

          if (parts.length === 6) {
            // 6-part: Event Name | Date | Time | Venue | Price | Description
            eventName = parts[0];
            eventDate = parts[1];
            eventTime = parts[2];
            venue = parts[3];
            price = parts[4];
            eventDescription = parts[5];
          } else {
            // 5-part: determine what's missing
            eventName = parts[0];

            // Check if part 2 (index 1) starts with a day of the week
            const startsWithDay = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i.test(parts[1]);

            if (!startsWithDay) {
              // Date is missing, use last valid date
              eventDate = lastValidDate;
              eventTime = parts[1];
              venue = parts[2];
              price = parts[3];
              eventDescription = parts[4];
            } else {
              // Date is present, check if time or price is missing
              eventDate = parts[1];

              // Check if part 3 (index 2) looks like a time
              const looksLikeTime = /^(\d{1,2}|Times vary)/i.test(parts[2]);

              if (looksLikeTime) {
                // Time is present, check if price is missing
                eventTime = parts[2];
                venue = parts[3];

                // Check if part 4 (index 3) looks like a price
                const looksLikePrice = /^(Free|\$)/i.test(parts[3]);

                if (looksLikePrice) {
                  price = parts[3];
                  eventDescription = parts[4];
                } else {
                  // Part 4 is the description, price is missing
                  price = 'N/A';
                  eventDescription = parts[3] + ' | ' + parts[4];
                }
              } else {
                // Time is missing
                eventTime = null;
                venue = parts[2];

                // Check if part 4 (index 3) looks like a price
                const looksLikePrice = /^(Free|\$)/i.test(parts[3]);

                if (looksLikePrice) {
                  price = parts[3];
                  eventDescription = parts[4];
                } else {
                  // Part 4 is the description, price is missing
                  price = 'N/A';
                  eventDescription = parts[3] + ' | ' + parts[4];
                }
              }
            }
          }

          // Skip if event name is too short or looks like a header
          if (eventName.length < 5 || eventName.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i)) {
            continue;
          }

          // Parse date and time
          const parsedDate = parseDateText(eventDate);
          const parsedTime = parseTimeText(eventTime);

          // Update last valid date if we have one
          if (parsedDate) {
            lastValidDate = eventDate;
          }

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

          allEvents.push(event);
          eventsFound++;
        }

        if (eventsFound > 0) {
          console.log(`✅ Extracted ${eventsFound} events from article`);
        }

      } catch (articleError) {
        // Continue to next article
        continue;
      }
    }

    console.log(`\n✅ Total events extracted: ${allEvents.length}`);

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
