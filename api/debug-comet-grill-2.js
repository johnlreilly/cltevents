// Debug script to test event parsing logic

async function debugParsing() {
  console.log('Fetching Comet Grill page...\n')

  const response = await fetch('https://www.cometgrillcharlotte.com/music')
  const html = await response.text()

  // Find the divider
  const dividerMatch = html.match(/class="[^"]*eventlist-past-upcoming-divider[^"]*"/)
  const dividerIndex = dividerMatch ? html.indexOf(dividerMatch[0]) : -1
  console.log('Divider found:', dividerIndex !== -1 ? `Yes (at index ${dividerIndex})` : 'No')

  // Extract the events list container
  const eventsListMatch = html.match(/<(?:ul|div)[^>]*class="[^"]*events-list[^"]*"[^>]*>([\s\S]*?)<\/(?:ul|div)>/i)
  console.log('Events list found:', eventsListMatch ? 'Yes' : 'No')

  if (!eventsListMatch) return

  const eventsListHtml = eventsListMatch[1]
  console.log(`Events list HTML length: ${eventsListHtml.length}\n`)

  // Match individual event items
  const eventItemRegex = /<li[^>]*class="[^"]*eventlist-event[^"]*"[^>]*>([\s\S]*?)<\/li>/gi
  const eventMatches = eventsListHtml.match(eventItemRegex)
  console.log(`Found ${eventMatches ? eventMatches.length : 0} event items\n`)

  if (eventMatches && eventMatches.length > 0) {
    // Debug first event
    console.log('=== FIRST EVENT ===')
    const firstEvent = eventMatches[0]
    console.log(`Event HTML length: ${firstEvent.length}`)

    // Extract title
    const titleMatch = firstEvent.match(/<a[^>]*class="[^"]*eventlist-title-link[^"]*"[^>]*>(.*?)<\/a>/i)
    console.log('Title match:', titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'NOT FOUND')

    // Extract date
    const dateMatch = firstEvent.match(/<time[^>]*class="[^"]*event-date[^"]*"[^>]*>(.*?)<\/time>/i)
    console.log('Date match:', dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : 'NOT FOUND')

    // Extract start time
    const startTimeMatch = firstEvent.match(/<span[^>]*class="[^"]*event-time-localized-start[^"]*"[^>]*>(.*?)<\/span>/i)
    console.log('Start time match:', startTimeMatch ? startTimeMatch[1].replace(/<[^>]+>/g, '').trim() : 'NOT FOUND')

    // Extract venue
    const venueMatch = firstEvent.match(/<span[^>]*class="[^"]*eventlist-meta-address-maplink[^"]*"[^>]*>(.*?)<\/span>/i)
    console.log('Venue match:', venueMatch ? venueMatch[1].replace(/<[^>]+>/g, '').trim() : 'NOT FOUND')

    console.log('\n=== SAMPLE HTML ===')
    console.log(firstEvent.substring(0, 800))
  }
}

debugParsing().catch(console.error)
