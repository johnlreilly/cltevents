// Test script for Eternally Grateful scraper
// Run with: node api/test-eternally-grateful.js

import handler from './eternally-grateful.js'

// Mock request/response objects
const mockReq = {
  method: 'GET',
}

const mockRes = {
  headers: {},
  statusCode: 200,
  body: null,

  setHeader(key, value) {
    this.headers[key] = value
  },

  status(code) {
    this.statusCode = code
    return this
  },

  json(data) {
    this.body = data
    console.log('\n=== ETERNALLY GRATEFUL SCRAPER RESPONSE ===')
    console.log(`Status: ${this.statusCode}`)
    console.log(`Events found: ${data.events?.length || 0}`)
    console.log(`Source: ${data.source}`)
    console.log(`Source Type: ${data.sourceType}`)
    console.log(`Scraped at: ${data.scrapedAt}`)

    if (data.events && data.events.length > 0) {
      console.log('\n=== ALL EVENTS ===')
      data.events.forEach((event, i) => {
        console.log(`\n${i + 1}. ${event.name}`)
        console.log(`   Venue: ${event.venue}, ${event.city}`)
        console.log(`   Date: ${event.date}`)
        console.log(`   Time: ${event.startTime || 'N/A'} — ${event.endTime || 'N/A'}`)
        console.log(`   Genres: ${event.genres.join(', ')}`)
        console.log(`   Artist: ${event.artistName}`)
      })
    }

    if (data.error) {
      console.error('\n=== ERROR ===')
      console.error(data.error)
      console.error(data.details)
    }

    console.log('\n=== END ===\n')
  },

  end() {
    console.log('Response ended')
  },
}

// Run the handler
console.log('Testing Eternally Grateful scraper...\n')
handler(mockReq, mockRes)
