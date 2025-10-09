# CLT.show

**The place to find Charlotte shows... all in one place.**

A Material Design 3 web application for discovering events in Charlotte, NC. Aggregates events from multiple sources and provides advanced filtering, sorting, and sharing capabilities.

## Features

### Event Sources
- **Ticketmaster** - Major concerts and events
- **Smokey Joe's Cafe** - Local music venue
- **CLTtoday** - Community events via RSS feed

### Event Display
- **Material Design 3** - Dark theme with blue accent colors
- **Event Cards** - Show event name, date, time, venue, genre tags, and images
- **Image Display** - Preserves aspect ratio with black letterboxing
- **Title Formatting** - Automatically converts all-caps titles to title case
- **Sticky Date Headers** - Show current date as you scroll, with special icons for team events
- **Special Event Icons** - Custom logos for Charlotte FC (soccer ball) and Carolina Panthers (paw print)

### Filtering & Sorting
- **Genre Filter** - Multi-select dropdown for event genres
- **Source Filter** - Filter by event source (Ticketmaster, Smokey Joe's, CLTtoday)
- **Keyword Exclusions** - Configurable list of keywords to exclude (bingo, trivia, drag, etc.)
- **Genre Exclusions** - Configurable list of genres to exclude (hip-hop, rap, metal, country, etc.)
- **Sorting** - Sort by date, preferred venues, or dive bars

### Event Actions
- **Save to Calendar** - Download .ics file with venue address
- **Get Directions** - Open venue location in Google Maps
- **Share Event** - Native share functionality
- **Like/Dislike** - Mark events with heart or X

### User Experience
- **Draggable Scroll Button** - Left-side scroll-to-top button with persistent position (left-handed friendly)
- **Responsive Design** - Mobile-first approach
- **Crown Watermark** - Subtle branding on date headers

## Configuration Files

All configuration is stored in JSON files for easy editing:

### `/data/excludeKeywords.json`
```json
{
  "keywords": ["bingo", "trivia", "drag", "kids", ...],
  "genres": ["hip-hop", "rap", "metal", "country", ...]
}
```

### `/data/preferredVenues.json`
```json
{
  "preferredVenues": ["neighborhood theater", "the fillmore", ...],
  "diveBarVenues": ["thirsty beaver", "snug harbor", ...]
}
```

### `/data/specialEventIcons.json`
```json
{
  "events": [
    {
      "name": "Charlotte FC",
      "matchKeywords": ["charlotte fc"],
      "iconType": "charlottefc"
    },
    {
      "name": "Carolina Panthers",
      "matchKeywords": ["carolina panthers", "panthers"],
      "iconType": "panthers"
    }
  ]
}
```

## Technical Stack

- **Frontend**: React (via CDN), Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **APIs**:
  - Ticketmaster Discovery API
  - Custom RSS parsers for CLTtoday
  - Venue-specific scrapers (Smokey Joe's)

## Key Features Implementation

### CLTtoday Integration
- Parses RSS feed and extracts event dates from embedded calendar URLs
- Extracts section headers (Sports, Concerts, Theater) as genre categories
- Filters out location headers to keep only event type categories

### Calendar Export
- Generates ICS files with event details
- Includes venue name and full address in location field
- Compatible with all major calendar applications

### Special Event Icons
- Dynamically detects team events by matching keywords in event names
- Shows custom SVG logos on sticky date headers
- Easily extensible by adding entries to `specialEventIcons.json`

### Sticky Date Headers
- Constant height (h-16) to prevent layout shift
- Removes top border radius when stuck to header
- Shows date in format "MMM D, Day of week"
- Includes special team logos or crown watermark

## Development

The application is structured as a single-page app with:
- `/index.html` - Main application code
- `/api/clttoday.js` - CLTtoday RSS feed scraper
- `/data/*.json` - Configuration files

## Future Enhancements

The special event icons system can be extended to support:
- Charlotte Knights (baseball)
- Charlotte Hornets (basketball)
- Other recurring special events
- Festival-specific icons

Simply add entries to `specialEventIcons.json` and corresponding SVG icons in the date header rendering logic.
