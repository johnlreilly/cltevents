// Debug script to examine event list structure

async function debugStructure() {
  console.log('Fetching Comet Grill page...\n')

  const response = await fetch('https://www.cometgrillcharlotte.com/music')
  const html = await response.text()

  // Find all <li class="eventlist-event"> in the entire HTML
  const allEventItems = html.match(/<li[^>]*class="[^"]*eventlist-event[^"]*"[^>]*>/gi)
  console.log(`Total eventlist-event items in HTML: ${allEventItems ? allEventItems.length : 0}\n`)

  if (allEventItems && allEventItems.length > 0) {
    console.log('First 3 event item opening tags:')
    allEventItems.slice(0, 3).forEach((tag, i) => {
      console.log(`${i + 1}. ${tag}`)
    })
  }

  console.log('\n---\n')

  // Look for the structure around events-list
  const eventsListContext = html.match(/([\s\S]{200})<(?:ul|div)[^>]*class="[^"]*events-list[^"]*"[^>]*>([\s\S]{500})/i)
  if (eventsListContext) {
    console.log('Context around events-list opening:')
    console.log(eventsListContext[0])
  }

  console.log('\n---\n')

  // Try to find the parent container of event items
  const parentMatch = html.match(/<ul[^>]*class="[^"]*eventlist[^"]*"[^>]*>([\s\S]*?)<li[^>]*class="[^"]*eventlist-event[^"]*"/i)
  if (parentMatch) {
    console.log('Found parent container classes:')
    const classMatch = parentMatch[0].match(/class="([^"]*)"/)
    console.log(classMatch ? classMatch[1] : 'Not found')
  }
}

debugStructure().catch(console.error)
