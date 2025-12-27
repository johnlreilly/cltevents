// Vercel Serverless Function to scrape Eternally Grateful events
// Scrapes Bandzoogle calendar from eternallygratefulmusic.com

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const response = await fetch('https://eternallygratefulmusic.com/live-shows')

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()

    // Extract events from Bandzoogle calendar
    const events = parseEternallyGratefulEvents(html)

    res.status(200).json({
      events: events,
      source: 'Eternally Grateful',
      sourceType: 'artist',
      scrapedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Eternally Grateful scraping error:', error)
    res.status(500).json({
      error: 'Failed to scrape Eternally Grateful events',
      details: error.message,
    })
  }
}

/**
 * Parses Eternally Grateful events from Bandzoogle calendar HTML
 * @param {string} html - Raw HTML from eternallygratefulmusic.com/live-shows
 * @returns {Array} Array of event objects
 */
function parseEternallyGratefulEvents(html) {
  const events = []

  try {
    // Match table rows containing events
    const rowRegex = /<tr class="border-accent">([\s\S]*?)<\/tr>/gi
    let rowMatch
    let rowCount = 0

    while ((rowMatch = rowRegex.exec(html)) !== null) {
      rowCount++
      try {
        const rowHtml = rowMatch[1]

        // Extract date from <span class="date"> within <td class="event-date">
        const dateMatch = rowHtml.match(/<td class="event-date">[\s\S]*?<span class="date">([^<]+)<\/span>/)
        const dateText = dateMatch ? dateMatch[1].trim() : null

        // Extract start time
        const startTimeMatch = rowHtml.match(/<time class="from">[\s\S]*?<span class="time">([^<]+)<\/span>/)
        const startTime = startTimeMatch ? startTimeMatch[1].trim() : null

        // Extract end time (if present)
        const endTimeMatch = rowHtml.match(/<time class="to">[\s\S]*?<span class="time">([^<]+)<\/span>/)
        const endTime = endTimeMatch ? endTimeMatch[1].trim() : null

        // Extract event name from <span class="text">
        const nameMatch = rowHtml.match(/<td class="event-name">[\s\S]*?<span class="text">([^<]+)<\/span>/)
        const name = nameMatch ? nameMatch[1].trim() : null

        // Extract location from <td class="event-location">
        const locationMatch = rowHtml.match(/<td class="event-location">[\s\S]*?<span class="text[^"]*">([^<]+)<\/span>/)
        const locationText = locationMatch ? locationMatch[1].trim() : null

        if (dateText && name && locationText) {
          const parsedDate = parseBandzoogleDate(dateText)
          const { venue, city } = parseLocation(locationText)
          const decodedName = decodeHtmlEntities(name)

          if (parsedDate) {
            events.push({
              id: `eg-${decodedName}-${parsedDate.dateStr}`.toLowerCase().replace(/\s+/g, '-'),
              name: decodedName,
              date: parsedDate.dateStr,
              startTime: startTime,
              endTime: endTime,
              description: `${decodedName} at ${venue}`,
              venue: venue,
              city: city,
              location: {
                name: venue,
                city: city,
              },
              ticketUrl: null, // Bandzoogle doesn't provide direct ticket links in calendar
              imageUrl: null,
              source: 'eternally-grateful',
              sourceType: 'artist',
              artistName: 'Eternally Grateful',
              genres: ['Grateful Dead', 'Americana', 'Jam Band'],
            })
          }
        }
      } catch (parseError) {
        console.error('Error parsing individual event:', parseError)
      }
    }

    console.log(`Matched ${rowCount} table rows, extracted ${events.length} events`)
  } catch (error) {
    console.error('Eternally Grateful parsing error:', error)
  }

  return events
}

/**
 * Parses Bandzoogle date format: "Wednesday, October 8" or "Wed, Oct 8"
 * @param {string} dateText - Raw date text from Bandzoogle
 * @returns {Object|null} Parsed date object with dateStr
 */
function parseBandzoogleDate(dateText) {
  try {
    // Extract: "Wednesday, October 8" or "Wed, Oct 8"
    // Pattern: DayOfWeek, Month Day

    // Extract day of week, month, and day
    const datePartMatch = dateText.match(/([A-Za-z]+),\s+([A-Za-z]+)\s+(\d+)/)
    if (!datePartMatch) return null

    const month = datePartMatch[2]
    const day = parseInt(datePartMatch[3])

    // Determine year (assume current or next year)
    const now = new Date()
    const currentYear = now.getFullYear()
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
    const monthIndex = monthNames.indexOf(month)

    if (monthIndex === -1) return null

    // Create date for this year
    let eventDate = new Date(currentYear, monthIndex, day)

    // If date is in the past, try next year
    if (eventDate < now) {
      eventDate = new Date(currentYear + 1, monthIndex, day)
    }

    // Format date as YYYY-MM-DD without timezone conversion
    // This ensures the date stays consistent regardless of timezone
    const year = eventDate.getFullYear()
    const monthNum = String(eventDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(eventDate.getDate()).padStart(2, '0')

    return {
      dateStr: `${year}-${monthNum}-${dayStr}`,
    }
  } catch (error) {
    console.error('Error parsing Bandzoogle date:', error)
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

/**
 * Parses location text: "Thomas Street Tavern, Charlotte"
 * @param {string} locationText - Raw location text
 * @returns {Object} Object with venue and city
 */
function parseLocation(locationText) {
  const parts = locationText.split(',').map((p) => p.trim())

  return {
    venue: decodeHtmlEntities(parts[0] || locationText),
    city: parts[1] || 'Charlotte',
  }
}
