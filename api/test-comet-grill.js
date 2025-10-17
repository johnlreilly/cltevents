// Test script for Comet Grill scraper
// Run with: node api/test-comet-grill.js

import handler from './comet-grill.js'

// Mock request and response objects
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
    console.log('\n=== RESPONSE ===')
    console.log(`Status: ${this.statusCode}`)
    console.log('\nHeaders:')
    console.log(this.headers)
    console.log('\nBody:')
    console.log(JSON.stringify(data, null, 2))

    if (data.events) {
      console.log(`\n=== SUMMARY ===`)
      console.log(`Total events: ${data.events.length}`)
      console.log('\nFirst 3 events:')
      data.events.slice(0, 3).forEach((event, i) => {
        console.log(`\n${i + 1}. ${event.name}`)
        console.log(`   Date: ${event.date}`)
        console.log(`   Time: ${event.startTime || 'N/A'}`)
        console.log(`   Venue: ${event.venue}`)
        console.log(`   ID: ${event.id}`)
      })
    }
  },

  end() {
    console.log('Response ended')
  },
}

// Run the handler
console.log('Testing Comet Grill scraper...\n')
handler(mockReq, mockRes).catch((error) => {
  console.error('Test failed:', error)
  process.exit(1)
})
