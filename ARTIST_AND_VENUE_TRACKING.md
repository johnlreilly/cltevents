# Artist & Venue Tracking Strategy

A focused approach to tracking specific artists and small venues that matter to you.

---

## Philosophy Shift

**From:** Broad coverage of all Charlotte events
**To:** Personalized tracking of favorite artists and intimate venues

### Benefits
- ✅ More relevant events (less noise)
- ✅ Earlier notification (artist calendars update before aggregators)
- ✅ Better small venue coverage (not in Ticketmaster)
- ✅ Touring artist tracking (national acts coming nearby)
- ✅ Support local music scene

---

## Data Source Categories

### 1. Artist Calendars (Follow the Artist)
Track specific artists' tour calendars to find them wherever they play

### 2. Small Venue Calendars (Follow the Venue)
Track small/intimate venues that host the type of shows you like

### 3. Large Venue/Aggregators (Existing)
Keep Ticketmaster, Fillmore, etc. for major shows

---

## Artist Tracking

### Priority Local Artists

#### Eternally Grateful
- **Genre:** Grateful Dead tribute/Americana
- **Website:** https://eternallygratefulmusic.com/live-shows
- **Platform:** Bandzoogle
- **Data Format:** HTML table with structured events
- **Update Frequency:** High (local band, frequent shows)
- **Venues:** Thomas Street Tavern, Comet Grill, Jack Beagles, Yonder Barn
- **Implementation:** Custom scraper for Bandzoogle calendar

**Sample Event Structure:**
```
Date: Wednesday, October 8 @ 8:00PM — 11:00PM
Event: The Grateful Allstars
Venue: Thomas Street Tavern, Charlotte
```

#### Josh Daniels
- **Genre:** [Research needed]
- **Potential Sources:** Facebook, Bandsintown, personal website
- **Status:** 🔍 Research needed

#### Long Strange Deal
- **Genre:** [Research needed - likely Grateful Dead related]
- **Potential Sources:** Facebook, Bandsintown, personal website
- **Status:** 🔍 Research needed

### Priority Touring Artists

#### Samantha Fish
- **Genre:** Blues/Rock
- **Website:** https://samanthafish.com/
- **Platform:** Bandsintown widget
- **Ticketmaster Coverage:** ✅ Yes
- **Implementation:** Already covered by Ticketmaster, monitor for Charlotte dates
- **Recent Charlotte Show:** Oct 4, 2025 @ The Amp Ballantyne

#### Dark Star Orchestra
- **Genre:** Grateful Dead covers
- **Ticketmaster Coverage:** ✅ Likely
- **Implementation:** Already covered, possibly add artist-specific alerts
- **Status:** Monitor existing sources

#### Tab Benoit
- **Genre:** Blues
- **Ticketmaster Coverage:** ✅ Likely
- **Implementation:** Already covered
- **Status:** Monitor existing sources

---

## Small Venue Tracking

### The Thirsty Beaver Saloon
- **Address:** 1225 Central Ave, Charlotte, NC
- **Type:** Dive bar / Honky-tonk
- **Capacity:** ~100-150 (small/intimate)
- **Website:** [Needs verification]
- **Facebook:** facebook.com/thethirstybeaversaloon
- **Bandsintown:** ✅ Listed (but 403 access)
- **Data Sources:**
  - Primary: Facebook Events
  - Secondary: Charlotte On The Cheap listings
  - Tertiary: Social media posts
- **Sample Artists:** The Filthy Heathens, Ramona and the Holy Smokes, Tony Logue, The Old Chevrolette Set
- **Priority:** ⭐⭐⭐ HIGH

### Thomas Street Tavern
- **Source:** Found via Eternally Grateful calendar
- **Type:** Music venue
- **Status:** 🔍 Research needed
- **Priority:** ⭐⭐⭐ HIGH (hosts Eternally Grateful)

### Comet Grill
- **Address:** [Previously mentioned in venue research]
- **Website:** http://www.cometgrillcharlotte.com/
- **Status:** In original research, needs event calendar check
- **Source:** Found via Eternally Grateful calendar
- **Priority:** ⭐⭐ MEDIUM

### Jack Beagles
- **Source:** Found via Eternally Grateful calendar
- **Type:** Music venue
- **Status:** 🔍 Research needed
- **Priority:** ⭐⭐ MEDIUM

### Yonder Barn
- **Website:** https://yonderbarnc.com/
- **Source:** Found via Eternally Grateful calendar
- **Type:** Barn venue / Event space
- **Status:** 🔍 Research needed
- **Priority:** ⭐⭐ MEDIUM

---

## Data Source Analysis

### Artist Calendar Platforms

#### 1. Bandsintown
- **Used By:** Samantha Fish, many touring artists
- **Pros:**
  - ✅ Standardized format
  - ✅ API available (requires key)
  - ✅ Widget embeds on artist sites
- **Cons:**
  - ⚠️ API rate limits
  - ⚠️ May block scraping (403 errors)
- **Implementation:** Use official Bandsintown API

#### 2. Bandzoogle
- **Used By:** Eternally Grateful
- **Pros:**
  - ✅ Common platform for independent artists
  - ✅ HTML table format (scrapable)
  - ✅ Structured event data
- **Cons:**
  - ⚠️ Varies by artist setup
  - ⚠️ Pagination needed for full calendar
- **Implementation:** Custom HTML scraper

#### 3. Facebook Events
- **Used By:** Most small venues and artists
- **Pros:**
  - ✅ Most comprehensive for small venues
  - ✅ Frequently updated
- **Cons:**
  - ❌ Difficult to scrape (login required)
  - ❌ No public API for pages
  - ❌ Rate limiting
- **Implementation:** Consider Facebook Graph API (limited) or manual curation

#### 4. Direct Website Calendars
- **Pros:**
  - ✅ First-party data
  - ✅ Usually accurate
- **Cons:**
  - ⚠️ Inconsistent formats
  - ⚠️ May lack structure
- **Implementation:** Case-by-case scrapers

---

## Proposed Architecture

### New Data Source Types

```javascript
// Current sources
sources: {
  venues: ['ticketmaster', 'smokeyjoes', 'clttoday', 'fillmore'],
  // ... existing implementation
}

// Proposed addition
sources: {
  venues: [...], // existing
  artists: ['eternally-grateful', 'josh-daniels', 'long-strange-deal'],
  smallVenues: ['thirsty-beaver', 'thomas-street-tavern', 'comet-grill']
}
```

### Configuration Pattern

```javascript
// Artist configuration
const TRACKED_ARTISTS = [
  {
    id: 'eternally-grateful',
    name: 'Eternally Grateful',
    scraper: 'bandzoogle',
    url: 'https://eternallygratefulmusic.com/live-shows',
    genres: ['Grateful Dead', 'Americana', 'Jam Band'],
    matchScore: 95, // High priority
    radiusFilter: 100, // miles from Charlotte
  },
  {
    id: 'samantha-fish',
    name: 'Samantha Fish',
    scraper: 'bandsintown',
    bandsintownId: '956767',
    genres: ['Blues', 'Rock'],
    matchScore: 90,
    radiusFilter: 150,
  }
]

// Small venue configuration
const TRACKED_SMALL_VENUES = [
  {
    id: 'thirsty-beaver',
    name: 'The Thirsty Beaver Saloon',
    scraper: 'facebook-events', // or custom
    facebookUrl: 'facebook.com/thethirstybeaversaloon',
    genres: ['Country', 'Americana', 'Rock'],
    matchScore: 85,
    address: '1225 Central Ave, Charlotte, NC',
  }
]
```

### Event Filtering Logic

```javascript
// Enhanced filtering to show WHY an event matched
event = {
  ...standardFields,
  matchReasons: [
    'Tracked Artist: Eternally Grateful',
    'Preferred Small Venue: Thirsty Beaver',
    'Genre Match: Americana'
  ],
  matchScore: 95,
  sourceType: 'artist' // or 'venue' or 'aggregator'
}
```

---

## Implementation Plan

### Phase 1: Artist Tracking (Highest Value)

#### 1.1 Eternally Grateful Scraper ⭐⭐⭐
**Effort:** Low (simple HTML scraping)
**Value:** High (local favorite, frequent shows)

```javascript
// api/eternally-grateful.js
// Scrape Bandzoogle calendar
// Parse HTML table → extract events
```

**Implementation Steps:**
1. Create `/api/eternally-grateful.js` scraper
2. Parse Bandzoogle HTML table format
3. Handle pagination (if needed)
4. Add to `useEvents` hook
5. Tag with `sourceType: 'artist'`

#### 1.2 Bandsintown API Integration ⭐⭐
**Effort:** Medium (API key + integration)
**Value:** High (enables multiple touring artists)

**Artists Covered:**
- Samantha Fish
- Dark Star Orchestra
- Tab Benoit
- Any other Bandsintown artists

**Implementation Steps:**
1. Sign up for Bandsintown API key
2. Create `/api/bandsintown.js` endpoint
3. Accept artist ID or name as parameter
4. Filter to Charlotte area (radius: 150mi)
5. Add configuration for tracked artists

### Phase 2: Small Venue Tracking

#### 2.1 Thirsty Beaver (Facebook Events) ⭐⭐⭐
**Effort:** High (Facebook scraping challenges)
**Value:** High (unique small venue content)

**Options:**
- **A) Facebook Graph API** (limited, requires app approval)
- **B) Manual curation** (weekly check + add events)
- **C) Third-party aggregator** (if available)

**Recommendation:** Start with manual curation, revisit automation later

#### 2.2 Thomas Street Tavern Research ⭐⭐
**Effort:** TBD (research needed)
**Value:** Medium-High (hosts Eternally Grateful)

#### 2.3 Other Small Venues ⭐
**Effort:** TBD per venue
**Value:** Medium

### Phase 3: Enhanced UI

#### 3.1 Source Type Badges
Show if event came from artist tracking, venue, or aggregator

```jsx
<EventCard>
  {event.sourceType === 'artist' && (
    <Badge>Following: {event.artistName}</Badge>
  )}
</EventCard>
```

#### 3.2 Artist Following UI
Add ability to add/remove tracked artists in settings

#### 3.3 Match Reason Display
Show WHY an event appeared (matched artist, venue, genre)

---

## Recommended Priority Order

### Immediate (Next Session)
1. ✅ **Eternally Grateful scraper** - Easy win, high value
   - Low effort, direct impact
   - Tests the artist-tracking pattern

2. ✅ **Bandsintown API setup** - Unlocks multiple artists
   - One integration = many artists
   - Covers Samantha Fish, DSO, Tab Benoit

### Short Term (1-2 weeks)
3. ⚠️ **Thirsty Beaver** - Manual curation first
   - Add events manually while researching automation
   - High value but challenging to automate

4. 🔍 **Research other local artists**
   - Josh Daniels website/calendar
   - Long Strange Deal website/calendar

### Medium Term
5. 🎨 **UI enhancements** for artist/venue tracking
   - Source type badges
   - Match reasons
   - Artist following settings

---

## Technical Patterns

### Generic Artist Scraper Interface

```javascript
// Base artist scraper class
class ArtistScraper {
  async fetchEvents(config) {
    // Returns standardized events
  }
}

// Implementations
class BandzoogleScraper extends ArtistScraper { }
class BandsintownScraper extends ArtistScraper { }
class FacebookEventsScraper extends ArtistScraper { }
```

### Event Source Attribution

```javascript
// Every event includes rich source metadata
{
  source: 'eternally-grateful',
  sourceType: 'artist',
  sourceName: 'Eternally Grateful',
  matchReasons: ['Tracked Artist'],
  matchScore: 95
}
```

---

## Next Steps

1. ✅ Create this documentation
2. ⬜ Implement Eternally Grateful scraper (Bandzoogle)
3. ⬜ Set up Bandsintown API integration
4. ⬜ Research Josh Daniels & Long Strange Deal sources
5. ⬜ Research Thomas Street Tavern calendar
6. ⬜ Design artist/venue configuration UI

---

**Last Updated:** 2025-10-10
**Status:** Architecture Designed, Ready for Implementation
**Priority:** Start with Eternally Grateful (highest value/effort ratio)
