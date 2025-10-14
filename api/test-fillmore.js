// Test script for Fillmore scraper
// Run with: node api/test-fillmore.js

import handler from './fillmore.js'

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
    console.log('\n=== FILLMORE SCRAPER RESPONSE ===')
    console.log(`Status: ${this.statusCode}`)
    console.log(`Events found: ${data.events?.length || 0}`)
    console.log(`Source: ${data.source}`)
    console.log(`Scraped at: ${data.scrapedAt}`)

    if (data.events && data.events.length > 0) {
      console.log('\n=== SAMPLE EVENTS ===')
      data.events.slice(0, 3).forEach((event, i) => {
        console.log(`\n${i + 1}. ${event.name}`)
        console.log(`   Venue: ${event.venue}`)
        console.log(`   Date: ${event.date}`)
        console.log(`   Ticket URL: ${event.ticketUrl}`)
        console.log(`   Image: ${event.imageUrl ? 'Yes' : 'No'}`)
      })

      console.log(`\n... and ${data.events.length - 3} more events`)
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
console.log('Testing Fillmore scraper...\n')
handler(mockReq, mockRes)
