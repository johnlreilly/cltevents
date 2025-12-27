// Vercel Serverless Function to scrape Comet Grill events
// Scrapes events from cometgrillcharlotte.com/music
//
// STATUS: DISABLED - Site appears stale (October 2024)
// The site is returning HTML errors instead of valid event data.
// Uncomment the fetch in src/hooks/useEvents.js when site is updated.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const response = await fetch('https://www.cometgrillcharlotte.com/music')

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()

    // Extract events from Squarespace event list
    const events = parseCometGrillEvents(html)

    res.status(200).json({
      events: events,
      source: 'Comet Grill',
      sourceType: 'venue',
      scrapedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Comet Grill scraping error:', error)
    res.status(500).json({
      error: 'Failed to scrape Comet Grill events',
      details: error.message,
    })
  }
}

/**
 * Parses Comet Grill events from Squarespace event list HTML
 * @param {string} html - Raw HTML from cometgrillcharlotte.com/music
 * @returns {Array} Array of event objects
 */
function parseCometGrillEvents(html) {
  const events = []

  try {
    // Find the divider between past and upcoming events
    const dividerMatch = html.match(/class="[^"]*eventlist-past-upcoming-divider[^"]*"/)
    const dividerIndex = dividerMatch ? html.indexOf(dividerMatch[0]) : -1

    // If no divider, assume all events are past (no upcoming events)
    if (dividerIndex === -1) {
      console.log('No upcoming events divider found - all events may be past')
      // Still try to parse, but we'll filter by date
    }

    // Extract the events list container
    const eventsListMatch = html.match(/<(?:ul|div)[^>]*class="[^"]*events-list[^"]*"[^>]*>([\s\S]*?)<\/(?:ul|div)>/i)
    if (!eventsListMatch) {
      console.log('No events list found')
      return events
    }

    const eventsListHtml = eventsListMatch[1]

    // Match individual event items - they use <article> tags, not <li>
    const eventItemRegex = /<article[^>]*class="[^"]*eventlist-event[^"]*"[^>]*>([\s\S]*?)<\/article>/gi
    let eventMatch

    while ((eventMatch = eventItemRegex.exec(eventsListHtml)) !== null) {
      try {
        const eventHtml = eventMatch[1]

        // Check if this event is before the divider (upcoming) or after (past)
        // If there's a divider, only process events before it
        if (dividerIndex !== -1) {
          const eventIndex = html.indexOf(eventMatch[0])
          if (eventIndex > dividerIndex) {
            // This event is past the divider, so it's a past event
            continue
          }
        }

        // Extract event title
        const titleMatch = eventHtml.match(/<a[^>]*class="[^"]*eventlist-title-link[^"]*"[^>]*>(.*?)<\/a>/i)
        if (!titleMatch) continue

        const rawTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim()

        // Extract date from event-date class
        const dateMatch = eventHtml.match(/<time[^>]*class="[^"]*event-date[^"]*"[^>]*>(.*?)<\/time>/i)
        if (!dateMatch) continue

        const dateText = dateMatch[1].replace(/<[^>]+>/g, '').trim()
        const parsedDate = parseCometGrillDate(dateText)
        if (!parsedDate) {
          console.log(`Could not parse date: ${dateText}`)
          continue
        }

        // Extract start time
        const startTimeMatch = eventHtml.match(/<span[^>]*class="[^"]*event-time-localized-start[^"]*"[^>]*>(.*?)<\/span>/i)
        const startTime = startTimeMatch ? startTimeMatch[1].replace(/<[^>]+>/g, '').trim() : null

        // Extract venue/location
        const venueMatch = eventHtml.match(/<span[^>]*class="[^"]*eventlist-meta-address-maplink[^"]*"[^>]*>(.*?)<\/span>/i)
        const venue = venueMatch ? venueMatch[1].replace(/<[^>]+>/g, '').trim() : 'Comet Grill'

        const name = decodeHtmlEntities(rawTitle)

        // Only add future events
        const today = new Date().toISOString().split('T')[0]
        if (parsedDate.dateStr >= today) {
          events.push({
            id: `comet-grill-${name}-${parsedDate.dateStr}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            name: name,
            date: parsedDate.dateStr,
            startTime: startTime,
            endTime: null,
            description: `${name} at Comet Grill`,
            venue: venue,
            city: 'Charlotte',
            location: {
              name: venue,
              city: 'Charlotte',
              address: '2224 Park Road, Charlotte, NC 28203',
            },
            ticketUrl: null, // Free shows - no tickets
            imageUrl: null,
            source: 'comet-grill',
            sourceType: 'venue',
            genres: ['Live Music'],
            price: 'Free',
          })
        }
      } catch (parseError) {
        console.error('Error parsing individual event:', parseError)
      }
    }

    console.log(`Extracted ${events.length} events from Comet Grill`)
  } catch (error) {
    console.error('Comet Grill parsing error:', error)
  }

  return events
}

/**
 * Parses various date formats from Comet Grill
 * @param {string} dateText - Raw date text (could be ISO or display format)
 * @returns {Object|null} Parsed date object with dateStr
 */
function parseCometGrillDate(dateText) {
  try {
    // Try parsing ISO format first (e.g., "2024-10-31")
    if (/^\d{4}-\d{2}-\d{2}/.test(dateText)) {
      return {
        dateStr: dateText.substring(0, 10),
      }
    }

    // Try parsing display format: "October 31, 2024" or "Oct 31, 2024"
    const displayMatch = dateText.match(/([A-Za-z]+)\s+(\d+),?\s+(\d{4})/)
    if (displayMatch) {
      const monthName = displayMatch[1]
      const day = parseInt(displayMatch[2])
      const year = parseInt(displayMatch[3])

      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ]
      const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      let monthIndex = monthNames.findIndex((m) => m.toLowerCase() === monthName.toLowerCase())
      if (monthIndex === -1) {
        monthIndex = shortMonthNames.findIndex((m) => m.toLowerCase() === monthName.toLowerCase())
      }

      if (monthIndex !== -1) {
        const month = String(monthIndex + 1).padStart(2, '0')
        const dayStr = String(day).padStart(2, '0')
        return {
          dateStr: `${year}-${month}-${dayStr}`,
        }
      }
    }

    // Try parsing JavaScript Date
    const dateObj = new Date(dateText)
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      return {
        dateStr: `${year}-${month}-${day}`,
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing Comet Grill date:', error)
    return null
  }
}

/**
 * Decodes HTML entities in text
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
function decodeHtmlEntities(text) {
  if (!text) return text

  const entities = {
    '&#39;': "'",
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#x27;': "'",
    '&#x2F;': '/',
  }

  return text.replace(/&#?\w+;/g, (match) => entities[match] || match)
}
