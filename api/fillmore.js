// Vercel Serverless Function to scrape The Fillmore Charlotte events
// Extracts JSON-LD structured data from their website

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const response = await fetch('https://www.fillmorenc.com/')

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()

    // Extract JSON-LD events from the page
    const events = parseFillmoreEvents(html)

    res.status(200).json({
      events: events,
      source: 'The Fillmore Charlotte',
      scrapedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Fillmore scraping error:', error)
    res.status(500).json({
      error: 'Failed to scrape Fillmore events',
      details: error.message,
    })
  }
}

/**
 * Parses Fillmore events from JSON-LD structured data
 * @param {string} html - Raw HTML from fillmorenc.com
 * @returns {Array} Array of event objects
 */
function parseFillmoreEvents(html) {
  const events = []

  try {
    // Extract all JSON-LD script tags
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi
    let match

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(match[1])

        // Check if this is a MusicEvent
        if (jsonData['@type'] === 'MusicEvent') {
          const event = parseEventFromJsonLd(jsonData)
          if (event) {
            events.push(event)
          }
        }
      } catch (parseError) {
        console.error('Error parsing JSON-LD block:', parseError)
        // Continue to next JSON-LD block
      }
    }

    console.log(`Fillmore: Found ${events.length} events`)
  } catch (error) {
    console.error('Fillmore parsing error:', error)
  }

  return events
}

/**
 * Converts JSON-LD MusicEvent to our event format
 * @param {Object} jsonLd - JSON-LD event object
 * @returns {Object|null} Formatted event object
 */
function parseEventFromJsonLd(jsonLd) {
  try {
    // Extract date from ISO string
    const startDate = new Date(jsonLd.startDate)
    const dateStr = startDate.toISOString().split('T')[0]

    // Extract venue name (could be "The Fillmore Charlotte" or "The Underground")
    const venueName = jsonLd.location?.name || 'The Fillmore Charlotte'

    // Determine if this is The Underground (smaller venue in same complex)
    const isUnderground = venueName.toLowerCase().includes('underground')
    const venue = isUnderground ? 'The Underground' : 'The Fillmore Charlotte'

    // Extract ticket URL
    const ticketUrl = jsonLd.url || null

    // Extract image
    const imageUrl = jsonLd.image || null

    return {
      id: `fillmore-${jsonLd.name}-${dateStr}`.toLowerCase().replace(/\s+/g, '-'),
      name: jsonLd.name,
      date: dateStr,
      startTime: jsonLd.startDate,
      endTime: null,
      description: jsonLd.name,
      venue: venue,
      location: {
        name: venueName,
        address: jsonLd.location?.address?.streetAddress,
        city: jsonLd.location?.address?.addressLocality,
        state: jsonLd.location?.address?.addressRegion,
        zip: jsonLd.location?.address?.postalCode,
      },
      ticketUrl: ticketUrl,
      imageUrl: imageUrl,
      source: 'fillmore',
      genres: [], // Fillmore doesn't provide genre in JSON-LD, will be extracted from name
    }
  } catch (error) {
    console.error('Error converting JSON-LD event:', error)
    return null
  }
}
