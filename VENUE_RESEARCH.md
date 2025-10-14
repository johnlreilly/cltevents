# Charlotte Area Venue Research

Research conducted to identify potential data sources for Charlotte area music venues.

## Summary

**Total Venues Identified:** 15+
**Venues with Structured Data:** 5
**Potential API Sources:** 3
**Current Sources in App:** 3 (Ticketmaster, Smokey Joe's, CLTtoday)

---

## High Priority Venues (Structured Data Available)

### 1. The Fillmore Charlotte ⭐⭐⭐
- **Website:** https://www.fillmorenc.com/
- **Data Format:** JSON-LD structured data
- **Capacity:** ~2,000 (standing room)
- **Data Quality:** ✅ Excellent - includes name, image, date, ticket URL, venue details
- **Implementation Notes:**
  - Part of Live Nation network
  - JSON-LD at bottom of page with full event schema
  - Also operates The Underground (smaller venue)
- **Recommendation:** HIGH PRIORITY - Easy to scrape, high-quality structured data

### 2. Neighborhood Theatre ⭐⭐⭐
- **Website:** https://www.neighborhoodtheatre.com/
- **Calendar URL:** https://neighborhoodtheatre.com/calendar/
- **Data Format:** TribeEvents plugin (WordPress)
- **Capacity:** ~1,000
- **Data Quality:** ✅ Good - comprehensive event listings through Dec 2025
- **Implementation Notes:**
  - Uses "TribeEvents" plugin which may have REST API endpoints
  - Possible endpoint: `/wp-json/tribe/events/v1/events`
  - Rich visual listings with dates, artists, ticket links
- **Recommendation:** HIGH PRIORITY - Popular NoDa venue, potential API access

### 3. Middle C Jazz ⭐⭐⭐
- **Website:** https://middlecjazz.com/
- **Events URL:** https://middlecjazz.com/events/
- **Data Format:** JSON-LD structured data
- **Type:** Jazz club
- **Data Quality:** ✅ Excellent - full event schema
- **Implementation Notes:**
  - Robust event system with filtering
  - Month view available: `/events/?view=month`
  - Livestream options for some events
  - Mailing list subscription available
- **Recommendation:** HIGH PRIORITY - Excellent for jazz/intimate shows

### 4. The Evening Muse ⭐⭐
- **Website:** https://www.eveningmuse.com/
- **Data Format:** Eventbrite integration
- **Capacity:** ~200 (intimate venue)
- **Data Quality:** ✅ Good - powered by Eventbrite
- **Implementation Notes:**
  - All events managed through Eventbrite
  - Eventbrite API could be leveraged
  - Monthly calendar views available
- **Recommendation:** MEDIUM PRIORITY - Eventbrite API requires key, but provides consistent data

### 5. Snug Harbor ⭐⭐⭐ (Already Tracked!)
- **Website:** http://www.snugrock.com/
- **Status:** ✅ Already in app as preferred venue
- **Data Quality:** Currently being scraped
- **Implementation Notes:** Already integrated in `/api/scrape-smokeyjoes.js`
- **Recommendation:** Continue current implementation

---

## Medium Priority Venues (HTML Scraping Possible)

### 6. Visulite Theatre
- **Website:** http://www.visulite.com/
- **Data Format:** Traditional HTML listings
- **Capacity:** ~400
- **Data Quality:** ⚠️ Fair - HTML parsing required
- **Implementation Notes:**
  - Show detail pages: `/shows/details/showID/{id}`
  - Monthly event listings
  - No obvious structured data
- **Recommendation:** MEDIUM PRIORITY - Requires HTML parsing

### 7. Amos' Southend
- **Website:** https://amossouthend.com/
- **Tagline:** "Charlotte's #1 Affordable Live Music Venue"
- **Location:** South End neighborhood
- **Data Quality:** 🔍 Needs investigation
- **Recommendation:** MEDIUM PRIORITY - Popular affordable venue

### 8. Petra's
- **Website:** http://www.petrasbar.com/
- **Type:** Bar/live music
- **Data Quality:** 🔍 Needs investigation
- **Recommendation:** LOW-MEDIUM PRIORITY

### 9. Comet Grill
- **Website:** http://www.cometgrillcharlotte.com/
- **Type:** Restaurant/music venue
- **Data Quality:** 🔍 Needs investigation
- **Recommendation:** LOW-MEDIUM PRIORITY

---

## Large Venues (Likely Already in Ticketmaster)

### 10. Spectrum Center
- **Website:** http://www.spectrumcentercharlotte.com/
- **Capacity:** 20,000
- **Type:** Arena (Hornets home, major tours)
- **Status:** ✅ Likely covered by Ticketmaster API
- **Recommendation:** LOW PRIORITY - Already in Ticketmaster feed

### 11. PNC Music Pavilion
- **Website:** https://www.pncmusicpavilion.com/
- **Capacity:** ~19,000
- **Type:** Amphitheater (summer venue)
- **Status:** ✅ Likely covered by Ticketmaster/Live Nation
- **Recommendation:** LOW PRIORITY - Already in existing feeds

### 12. Ovens Auditorium
- **Website:** https://www.boplex.com/
- **Capacity:** 2,455
- **Type:** Performing arts
- **Status:** ⚠️ May not be in Ticketmaster
- **Recommendation:** MEDIUM PRIORITY - Check coverage

### 13. Bojangles Coliseum
- **Website:** https://www.boplex.com/
- **Capacity:** ~8,600
- **Type:** Multi-purpose arena
- **Status:** ✅ Likely in Ticketmaster
- **Recommendation:** LOW PRIORITY

### 14. Charlotte Metro Credit Union Amphitheatre
- **Capacity:** ~19,000
- **Type:** Outdoor amphitheater
- **Status:** ✅ Likely in Ticketmaster/Live Nation
- **Recommendation:** LOW PRIORITY

---

## Other Venues

### 15. Coyote Joe's
- **Website:** http://www.coyote-joes.com/
- **Type:** Country music venue
- **Data Quality:** 🔍 Needs investigation
- **Recommendation:** LOW-MEDIUM PRIORITY

### 16. The Underground
- **Part of:** The Fillmore Charlotte
- **Status:** ✅ Covered by Fillmore data source
- **Recommendation:** Include with Fillmore scraper

---

## Implementation Recommendations

### Immediate (Next Sprint)
1. **The Fillmore Charlotte** - Add JSON-LD scraper
   - Easy win with structured data
   - Covers both Fillmore and Underground
   - High event volume

2. **Neighborhood Theatre** - Investigate TribeEvents API
   - Popular NoDa venue
   - Potential REST API access
   - Good event diversity

3. **Middle C Jazz** - Add JSON-LD scraper
   - Jazz/intimate shows niche
   - Excellent structured data
   - Different audience from rock venues

### Short Term (1-2 months)
4. **The Evening Muse** - Eventbrite API integration
   - Requires Eventbrite API key
   - Could be reused for other Eventbrite venues
   - Good for discovering smaller acts

5. **Amos' Southend** - Investigate data sources
   - Popular affordable venue
   - Worth checking site structure

6. **Ovens Auditorium** - Verify Ticketmaster coverage
   - May need custom scraper if not in TM

### Research Needed
- Visulite Theatre HTML scraping feasibility
- Petra's/Comet Grill event listing methods
- Any other Eventbrite-powered venues

---

## Data Source Architecture

### Current Sources
```
Ticketmaster API → Large venues, national acts
Smokey Joe's Scraper → Snug Harbor
CLTtoday Scraper → General Charlotte events
```

### Proposed Additional Sources
```
Fillmore Scraper (JSON-LD) → Fillmore + Underground
Neighborhood Theatre API → NoDa indie/rock
Middle C Jazz Scraper (JSON-LD) → Jazz shows
Eventbrite API → Evening Muse + others
```

### Benefits
- **Coverage:** Shifts from ~60% to ~85%+ of Charlotte music events
- **Diversity:** Better coverage of jazz, indie, smaller acts
- **Redundancy:** Multiple sources reduce single point of failure
- **Quality:** Venues provide first-party data vs. aggregators

---

## Technical Implementation Notes

### JSON-LD Scraping Pattern
```javascript
// Generic JSON-LD event scraper
async function scrapeJSONLD(url) {
  const response = await fetch(url)
  const html = await response.text()

  // Extract JSON-LD script tags
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs)

  if (jsonLdMatch) {
    return jsonLdMatch.map(script => {
      const json = script.replace(/<\/?script[^>]*>/g, '')
      return JSON.parse(json)
    }).filter(data => data['@type'] === 'MusicEvent')
  }

  return []
}
```

### TribeEvents API Pattern
```javascript
// WordPress TribeEvents REST API
const endpoint = 'https://neighborhoodtheatre.com/wp-json/tribe/events/v1/events'
const params = new URLSearchParams({
  per_page: 50,
  start_date: new Date().toISOString(),
})

const events = await fetch(`${endpoint}?${params}`)
  .then(r => r.json())
```

### Eventbrite API Pattern
```javascript
// Requires Eventbrite OAuth token
const EVENTBRITE_TOKEN = process.env.EVENTBRITE_TOKEN

async function getEventbriteEvents(organizerId) {
  const url = `https://www.eventbriteapi.com/v3/organizations/${organizerId}/events/`
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${EVENTBRITE_TOKEN}`
    }
  })
  return response.json()
}
```

---

## Next Steps

1. ✅ Document findings (this file)
2. ⬜ Create Fillmore scraper (highest ROI)
3. ⬜ Test Neighborhood Theatre API endpoint
4. ⬜ Create Middle C Jazz scraper
5. ⬜ Research Eventbrite API requirements
6. ⬜ Add venue source toggles to FilterTray
7. ⬜ Update preferred venues list in app

---

**Last Updated:** 2025-10-09
**Status:** Research Phase Complete, Ready for Implementation
