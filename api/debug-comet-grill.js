// Debug script to examine Comet Grill HTML structure

async function debugCometGrill() {
  console.log('Fetching Comet Grill page...\n')

  const response = await fetch('https://www.cometgrillcharlotte.com/music')
  const html = await response.text()

  console.log(`HTML length: ${html.length} characters\n`)

  // Look for any class containing "event"
  const eventClassMatches = html.match(/class="[^"]*event[^"]*"/gi)
  console.log('Classes containing "event":')
  if (eventClassMatches) {
    const uniqueClasses = [...new Set(eventClassMatches)]
    uniqueClasses.forEach((cls) => console.log(`  ${cls}`))
  } else {
    console.log('  None found')
  }

  console.log('\n---\n')

  // Look for h3 tags
  const h3Matches = html.match(/<h3[^>]*>.*?<\/h3>/gi)
  console.log(`Found ${h3Matches ? h3Matches.length : 0} h3 tags`)
  if (h3Matches && h3Matches.length > 0) {
    console.log('First 3 h3 tags:')
    h3Matches.slice(0, 3).forEach((h3, i) => {
      console.log(`  ${i + 1}. ${h3}`)
    })
  }

  console.log('\n---\n')

  // Search for "upcoming" or "event"
  const upcomingMatch = html.match(/(?:class|id)="[^"]*upcoming[^"]*"/i)
  console.log('Upcoming class/id:', upcomingMatch ? upcomingMatch[0] : 'Not found')

  console.log('\n---\n')

  // Look for date patterns
  const datePattern = /(?:October|November|December)\s+\d+,\s+\d{4}/gi
  const dateMatches = html.match(datePattern)
  console.log(`Found ${dateMatches ? dateMatches.length : 0} dates`)
  if (dateMatches && dateMatches.length > 0) {
    console.log('First 5 dates:')
    dateMatches.slice(0, 5).forEach((date, i) => {
      console.log(`  ${i + 1}. ${date}`)
    })
  }

  console.log('\n---\n')

  // Extract a larger sample around "Halloween" or "Desert Tacos"
  const sampleMatch = html.match(/([\s\S]{200})(?:Halloween|Desert Tacos)([\s\S]{400})/i)
  if (sampleMatch) {
    console.log('Sample HTML around event:')
    console.log(sampleMatch[0].substring(0, 600))
  }
}

debugCometGrill().catch(console.error)
