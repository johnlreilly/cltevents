# CLT Events Discovery - Recreation Prompts for Corporate Laptop

These prompts will recreate the entire project from scratch using Claude Code on your corporate laptop. Execute them **in order**.

---

## Prerequisites on Corporate Laptop

Before starting, ensure you have:
- [ ] VS Code installed
- [ ] Claude Code extension installed
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Docker or OrbStack installed (for containerization)
- [ ] AWS CLI installed (if deploying to AWS)
- [ ] OpenTofu or Terraform installed (if using infrastructure-as-code)

---

## Phase 1: Project Setup & Structure

### Prompt 1.1: Initialize React + Vite Project

```
Create a new React project called "cltevents" using Vite with the following requirements:
- Use Vite as the build tool
- TypeScript is optional (use JavaScript)
- Set up Tailwind CSS for styling with Material Design 3 color scheme
- Configure for single-page application (SPA)
- Set up the basic folder structure:
  - src/ (React components and utilities)
  - api/ (Vercel serverless functions)
  - public/ (static assets and data files)
  - public/data/ (JSON configuration files)
  - public/quotes/ (quotes data)

Add these npm scripts to package.json:
- dev: start dev server
- build: production build
- preview: preview production build
- lint: eslint checking

Create a comprehensive .gitignore file for Node.js, React, and Vercel projects.
```

---

## Phase 2: Core Data & Configuration Files

### Prompt 2.1: Create Configuration Files

```
Create these JSON configuration files in public/data/:

1. excludeKeywords.json - Keywords to filter out from events with source-specific filtering:
{
  "keywords": [
    "comedy",
    "standup",
    "improv",
    {"keyword": "parking", "source": "ticketmaster"},
    "parking pass",
    "tailgate"
  ],
  "genres": ["Comedy", "Stand-Up"]
}

2. preferredVenues.json - List of preferred venues:
{
  "venues": ["smokey joe", "snug harbor", "neighborhood theater", "visulite"]
}

3. preferredCaps.json - Words that should maintain specific capitalization:
{
  "caps": {
    "clt": "CLT",
    "dj": "DJ",
    "vip": "VIP"
  }
}

4. sportsTeams.json - Sports teams with custom image positioning:
{
  "teams": [
    {
      "name": "Charlotte Hornets",
      "position": "center center",
      "imageHeight": "h-[30vh]"
    },
    {
      "name": "Charlotte Checkers",
      "position": "center center",
      "imageHeight": "h-[30vh]"
    },
    {
      "name": "Charlotte FC",
      "position": "center center",
      "imageHeight": "h-[30vh]"
    },
    {
      "name": "Carolina Panthers",
      "position": "center center",
      "imageHeight": "h-[30vh]"
    }
  ]
}

5. specialDates.json - Special dates with custom styling:
{
  "dates": [
    {
      "date": "2025-10-31",
      "label": "Halloween",
      "bgColor": "bg-orange-900",
      "textColor": "text-orange-100",
      "icon": "🎃"
    },
    {
      "date": "2025-12-25",
      "label": "Christmas",
      "bgColor": "bg-red-900",
      "textColor": "text-red-100",
      "icon": "🎄"
    },
    {
      "date": "2025-12-31",
      "label": "New Year's Eve",
      "bgColor": "bg-purple-900",
      "textColor": "text-purple-100",
      "icon": "🎉"
    }
  ]
}

6. specialEventIcons.json - Icons for special event types:
{
  "icons": {
    "halloween": "🎃",
    "christmas": "🎄",
    "new year": "🎉",
    "valentine": "❤️",
    "st patrick": "☘️"
  }
}
```

### Prompt 2.2: Create Quotes Data

```
Create public/quotes/quotes-look-back.json with motivational quotes about not looking back:

{
  "quotes": [
    {
      "quote": "I never look back, darling.|It distracts from the now.",
      "author": "Edna Mode"
    },
    {
      "quote": "There are far, far better things ahead|than any we leave behind.",
      "author": "C.S. Lewis"
    },
    {
      "quote": "When a thing is done, it's done. Don't look back.|Look forward to your next objective.",
      "author": "George C. Marshall"
    },
    {
      "quote": "I tend not to look back.|It's confusing.",
      "author": "Walter Hill"
    }
  ]
}

Note: The pipe character | in quotes will be replaced with line breaks in the UI.
```

---

## Phase 3: Tailwind CSS Configuration

### Prompt 3.1: Configure Tailwind with Material Design 3

```
Set up Tailwind CSS with Material Design 3 color scheme. Create tailwind.config.js with:

1. Content paths for src/ and index.html
2. Custom Material Design 3 colors:
   - primary, onprimary, primarycontainer, onprimarycontainer
   - secondary, onsecondary, secondarycontainer, onsecondarycontainer
   - tertiary, ontertiary, tertiarycontainer, ontertiarycontainer
   - error, onerror, errorcontainer, onerrorcontainer
   - background, onbackground
   - surface, onsurface, surfacevariant, onsurfacevariant
   - outline, outlinevariant
   - shadow, scrim

Use a warm, inviting color palette suitable for an events discovery app.

3. Add custom spacing for smooth scrolling
4. Add custom animation for smooth transitions

Also create postcss.config.js for Tailwind processing.
```

---

## Phase 4: Utility Functions

### Prompt 4.1: Date Utilities

```
Create src/utils/dateUtils.js with these functions:

1. formatDate(dateString) - Format date as "Mon, Jan 15"
2. formatTime(timeString) - Format time as "7:00 PM"
3. isDateInPast(dateString) - Check if date is in the past
4. groupEventsByDate(events) - Group events array by date
5. getRelativeDate(dateString) - Return "Today", "Tomorrow", or formatted date
6. sortEventsByDate(events) - Sort events by date ascending

Include comprehensive JSDoc comments and unit tests using Vitest.
```

### Prompt 4.2: Event Utilities

```
Create src/utils/eventUtils.js with these functions:

1. filterByCategory(events, category, favorites, hidden, preferredVenues)
   - Categories: 'all', 'favorites', 'divebars', 'preferred', 'hidden'
   - Filter events based on category selection

2. filterByGenre(events, selectedGenres)
   - If selectedGenres is empty, return all events
   - Otherwise, return events matching selected genres

3. filterBySource(events, selectedSources)
   - If selectedSources is empty, return all events
   - Otherwise, return events matching selected sources

4. extractGenres(events)
   - Extract unique genres from all events
   - Return sorted array

5. groupEventsByName(events)
   - Group events with same name but different dates
   - Return array with 'dates' property containing all occurrences

6. sortEvents(events, sortBy, preferredVenues)
   - sortBy can be 'date' or 'match'
   - Implement match score boosting for preferred venues

7. isPreferredVenue(venueName, preferredVenues)
   - Check if venue name contains any preferred venue keyword

8. createICSContent(event)
   - Generate ICS calendar file content for an event

Include comprehensive JSDoc comments and unit tests.
```

### Prompt 4.3: YouTube Utilities

```
Create src/utils/youtubeUtils.js with:

1. fetchYouTubeVideos(artistName, cache)
   - Search YouTube API for artist videos
   - Use cache to avoid redundant API calls
   - Return array of video objects with: {id, title, url, thumbnail}
   - Handle API quota exceeded gracefully
   - Include 1-second delay between requests

2. getYouTubeEmbedUrl(videoId)
   - Convert video ID to embed URL

Note: This requires YOUTUBE_API_KEY environment variable.
Include error handling and caching logic.
```

### Prompt 4.4: Image Detection Utilities

```
Create src/utils/imageDetection.js with:

1. detectPlaceholderImage(imageUrl)
   - Detect if image is a placeholder (gray, generic pattern)
   - Return boolean

2. getImageHeightClass(imageUrl)
   - Analyze image URL to determine appropriate Tailwind height class
   - Return 'h-48', 'h-64', or 'h-80' based on image type

Include logic to detect common placeholder patterns.
```

### Prompt 4.5: Image Utilities with SmartCrop

```
Create src/utils/imageUtils.js with smartcrop.js integration:

1. analyzeImageWithSmartcrop(imageUrl)
   - Use smartcrop.js library to analyze image
   - Find best crop position (center of interest)
   - Return object with: {x, y, width, height, position}
   - Convert crop coordinates to CSS background-position

2. Add smartcrop as dependency to package.json

Include error handling for failed image loads.
```

### Prompt 4.6: Special Date Icons Component

```
Create src/utils/specialDateIcons.jsx with:

1. React component that returns appropriate icon/emoji for special dates
2. Load specialDates.json configuration
3. Match event date against special dates
4. Return JSX with icon and styling

Export as getSpecialDateIcon(dateString) function.
```

---

## Phase 5: Custom React Hooks

### Prompt 5.1: useLocalStorage Hook

```
Create src/hooks/useLocalStorage.js:

A custom React hook that syncs state with localStorage:

1. Accept key and initialValue parameters
2. Load value from localStorage on mount
3. Save to localStorage when value changes
4. Return [storedValue, setValue] tuple like useState
5. Handle JSON serialization/deserialization
6. Handle errors gracefully (storage full, etc.)

Include JSDoc comments and type definitions.
```

### Prompt 5.2: useEvents Hook

```
Create src/hooks/useEvents.js - the main data fetching hook:

This hook fetches events from multiple API sources and processes them:

1. Fetch from these endpoints in parallel:
   - /api/events (Ticketmaster)
   - /api/smokeyjoes (Smokey Joe's Cafe)
   - /api/clttoday (CLTtoday articles)
   - /api/fillmore (Fillmore Charlotte)
   - /api/eternally-grateful (Artist tracking)

2. Process each source with dedicated processor function:
   - processTicketmasterEvents(data) - Extract genres, prices, YouTube integration
   - processSmokeyjoesEvents(data) - Music events with high match scores
   - processCLTtodayEvents(data) - News articles about events
   - processFillmoreEvents(data) - Structured data events
   - processEternallyGratefulEvents(data) - Artist tracking events

3. Return object with:
   - events: Array of all fetched events
   - loading: Boolean loading state
   - initialLoad: Boolean for first load
   - availableGenres: Unique genres for filtering
   - lastSync: Date of last fetch
   - refetch: Function to manually refetch
   - youtubeCache: YouTube API cache

4. Features:
   - YouTube video fetching for specific venues
   - Genre extraction and filtering
   - Match score calculation (70-98 range)
   - Preferred venue boosting
   - Error handling for each API source (graceful degradation)
   - YouTube cache persisted to localStorage

5. Use API_BASE_URL from config for API calls

Include comprehensive error handling - if one API fails, others should still work.
```

### Prompt 5.3: useFilters Hook

```
Create src/hooks/useFilters.js:

A hook that manages all event filtering, sorting, and derived state:

1. Accept events array as parameter

2. Manage state with useLocalStorage:
   - selectedCategory (default: 'all')
   - selectedGenres (default: [])
   - selectedSources (default: [])
   - sortBy (default: 'date')
   - favorites (default: [])
   - hidden (default: [])

3. Load exclude keywords and genres from /data/excludeKeywords.json

4. Provide toggle functions:
   - toggleGenre(genre)
   - toggleSource(source)
   - toggleFavorite(eventId)
   - toggleHidden(event)

5. Compute filteredEvents with useMemo:
   - Remove past events
   - Filter out excluded keywords (with source-specific rules)
   - Filter out excluded genres
   - Filter by category
   - Filter by genre
   - Filter by source
   - Group by name (combine multi-date events)
   - Sort by date or match score

6. Return object with all state, functions, and filteredEvents

7. Include clearFilters() function

8. Compute hasActiveFilters boolean
```

---

## Phase 6: React Components

### Prompt 6.1: EventCard Component

```
Create src/components/EventCard/EventCard.jsx:

A Material Design 3 styled card component for displaying event information:

Props:
- event: Event object
- isFavorite: Boolean
- isHidden: Boolean
- onToggleFavorite: Function
- onToggleHidden: Function

Features:
1. Display event image with smartcrop positioning
2. Check sports teams configuration for custom positioning
3. Handle placeholder images with different height
4. Show event name, date, time, venue
5. Display genres as chips
6. Show match score badge (if >= 85)
7. Favorite button (star icon)
8. Hide button (eye-slash icon)
9. Special date styling (Halloween, Christmas, etc.)
10. YouTube videos section (collapsible)
11. Add to calendar button (.ics file download)
12. Source badge (ticketmaster, smokeyjoes, etc.)

Styling:
- Material Design 3 elevation and surfaces
- Smooth transitions and hover effects
- Responsive design (mobile-first)
- Tailwind CSS classes

Load sportsTeams.json for custom image positioning.
```

### Prompt 6.2: EventList Component

```
Create src/components/EventList/EventList.jsx:

A component that renders grouped events with sticky date separators:

Props:
- events: Array of event objects
- favorites: Array of favorite event IDs
- hidden: Array of hidden event keys
- onToggleFavorite: Function
- onToggleHidden: Function

Features:
1. Group events by date using groupEventsByDate utility
2. Render sticky date separators with special date styling
3. Render EventCard for each event
4. Handle empty state (no events)
5. Smooth scroll behavior
6. Apply special date colors/icons to separators

Styling:
- Sticky date headers with Material Design 3 colors
- Gap between cards
- Responsive grid layout
```

### Prompt 6.3: FilterTray Component

```
Create src/components/FilterTray/FilterTray.jsx:

A Material Design 3 styled filter panel component:

Props:
- selectedCategory: Current category
- onCategoryChange: Function
- selectedGenres: Array of selected genres
- onGenreToggle: Function
- availableGenres: Array of all available genres
- selectedSources: Array of selected sources
- onSourceToggle: Function
- sortBy: Current sort method
- onSortChange: Function
- hasActiveFilters: Boolean
- onClearFilters: Function
- onClose: Function

Features:
1. Category dropdown (All Events, Favorites, Dive Bars, Preferred Venues, Hidden)
2. Genre multi-select with checkboxes
3. Source multi-select (ticketmaster, smokeyjoes, clttoday, fillmore, eternally-grateful)
4. Sort dropdown (by Date, by Match Score)
5. Clear All Filters button (if filters active)
6. Close button

Important: When "All Genres" or "All Sources" is shown (length === 0),
ALL checkboxes should be CHECKED (not unchecked). This indicates all are being shown.

Styling:
- Material Design 3 buttons and surfaces
- Dropdown menus with backdrop
- Smooth transitions
- Icons for each action
```

### Prompt 6.4: Header Component

```
Create src/components/Header/Header.jsx:

A fixed header component with Material Design 3 styling:

Props:
- eventCount: Number of visible events
- totalCount: Number of total events
- lastSync: Date of last data fetch
- onRefresh: Function to refetch data
- onOpenFilters: Function to open filter tray
- hasActiveFilters: Boolean
- selectedCategory: Current category name

Features:
1. App title "CLT.show" with icon
2. Event counter (e.g., "Showing 47 of 150 events")
3. Last sync time (e.g., "Updated 2 min ago")
4. Refresh button with loading state
5. Filter button with active indicator badge
6. Display current category if not "all"

Styling:
- Fixed position at top
- Material Design 3 colors
- Blur background effect
- Shadow/elevation
- Responsive layout
```

### Prompt 6.5: LoadingSpinner Component

```
Create src/components/LoadingSpinner/LoadingSpinner.jsx:

A simple centered loading spinner component:

Features:
1. Animated spinning icon
2. Optional loading message
3. Centered on screen
4. Material Design 3 colors

Props:
- message: Optional loading message (default: "Loading events...")
```

### Prompt 6.6: ScrollToTop Component

```
Create src/components/ScrollToTop/ScrollToTop.jsx:

A draggable, persistent, semi-transparent floating button:

Features:
1. Fixed position button (initially bottom-right)
2. Draggable to any position
3. Position persisted to localStorage
4. Semi-transparent when not hovered
5. Fully opaque on hover
6. Smooth scroll to top on click
7. Only show when scrolled down 300px
8. Fade in/out animation

Styling:
- Material Design 3 colors
- Circular button with up arrow icon
- Shadow/elevation
- Smooth animations
```

---

## Phase 7: Main App Component

### Prompt 7.1: Create App.jsx

```
Create src/App.jsx - the main application component:

Features:
1. Use useEvents hook to fetch event data
2. Use useFilters hook to manage filtering
3. Display random quote from quotes-look-back.json at top (with pipe | converted to line breaks)
4. Render Header component
5. Render FilterTray component (slide-in panel)
6. Render EventList component
7. Render LoadingSpinner during initial load
8. Render ScrollToTop component

State management:
- showFilterTray: Boolean for filter panel visibility
- Load quotes from /quotes/quotes-look-back.json
- Select random quote on mount

Layout:
- Full-height viewport
- Fixed header
- Scrollable content area
- Filter tray overlays content (slide from left)

Styling:
- Material Design 3 background colors
- Smooth transitions
- Responsive padding
```

### Prompt 7.2: Create Main Entry Point

```
Create src/main.jsx:

1. Import React and ReactDOM
2. Import App component
3. Import './index.css'
4. Render App component to #root element
5. Use React StrictMode for development

Also create src/index.css with:
- Tailwind directives (@tailwind base/components/utilities)
- Custom scrollbar styling
- Smooth scroll behavior
- Material Design 3 base styles
```

### Prompt 7.3: Create Config File

```
Create src/config.js:

Export API_BASE_URL constant:
- Use import.meta.env.VITE_API_BASE_URL
- Default to empty string (for relative URLs)
- If empty, API calls will be relative (e.g., /api/events)
- If set, API calls will be absolute (e.g., https://clt.show/api/events)

Add helpful comments explaining the configuration.
```

---

## Phase 8: Vercel Serverless Functions (API)

### Prompt 8.1: Ticketmaster API Function

```
Create api/events.js - Vercel serverless function for Ticketmaster:

Features:
1. Fetch events from Ticketmaster Discovery API
2. Filter for Charlotte, NC area (radius 25 miles from coordinates)
3. Filter for upcoming events (startDateTime >= today)
4. Sort by date ascending
5. Handle pagination (fetch multiple pages if needed)
6. Include CORS headers
7. Cache results (5 minutes recommended)
8. Handle API errors gracefully

Environment variables needed:
- TICKETMASTER_API_KEY

Return JSON format:
{
  "events": [...],
  "source": "Ticketmaster",
  "scrapedAt": "ISO date string"
}
```

### Prompt 8.2: Smokey Joe's API Function

```
Create api/smokeyjoes.js - Web scraper for Smokey Joe's Cafe:

Features:
1. Scrape events from smokeyjoes.cafe calendar page
2. Parse HTML to extract:
   - Event name
   - Date
   - Time
   - Description
3. Handle "No events" case
4. Include CORS headers
5. Cache results (30 minutes recommended)

Use cheerio or similar library for HTML parsing.

Return JSON format:
{
  "events": [...],
  "source": "Smokey Joe's Cafe",
  "scrapedAt": "ISO date string"
}
```

### Prompt 8.3: CLTtoday API Function

```
Create api/clttoday.js - Scraper for CLTtoday articles:

Features:
1. Scrape event articles from clttoday.com
2. Extract:
   - Article title
   - Publication date
   - Event dates (from article content)
   - Featured image
   - Article URL
   - Category/tags
3. Parse article content for event dates
4. Include CORS headers
5. Cache results (1 hour recommended)

Return JSON format:
{
  "events": [...],
  "source": "CLTtoday",
  "scrapedAt": "ISO date string"
}
```

### Prompt 8.4: Fillmore API Function

```
Create api/fillmore.js - JSON-LD scraper for The Fillmore Charlotte:

Features:
1. Scrape fillmorecharlotte.com events page
2. Extract JSON-LD structured data from <script type="application/ld+json">
3. Parse Event schema objects
4. Extract:
   - Name
   - Start date/time
   - Location
   - Description
   - Image
   - Ticket URL
5. Include CORS headers
6. Cache results (1 hour recommended)

Return JSON format:
{
  "events": [...],
  "source": "fillmore",
  "scrapedAt": "ISO date string"
}
```

### Prompt 8.5: Eternally Grateful API Function

```
Create api/eternally-grateful.js - Artist tracking API:

Features:
1. Track specific artist events (e.g., "Eternally Grateful" band)
2. Scrape artist's website or social media for tour dates
3. Alternative: Use Bandsintown API or similar
4. Extract:
   - Event name
   - Date
   - Venue
   - City
   - Ticket URL
5. Include CORS headers
6. Cache results (6 hours recommended)

Return JSON format:
{
  "events": [...],
  "source": "eternally-grateful",
  "sourceType": "artist",
  "artistName": "Eternally Grateful",
  "scrapedAt": "ISO date string"
}
```

### Prompt 8.6: YouTube API Function (Optional)

```
Create api/youtube.js - YouTube video search (optional):

Features:
1. Search YouTube for artist videos
2. Return top 3-5 results
3. Include video ID, title, thumbnail
4. Handle API quota limits
5. Include CORS headers

This can be called from the frontend instead if preferred.

Environment variables needed:
- YOUTUBE_API_KEY
```

---

## Phase 9: Environment Configuration

### Prompt 9.1: Create Environment Files

```
Create these environment configuration files:

1. .env.example (template):
   VITE_API_BASE_URL=https://your-project.vercel.app
   TICKETMASTER_API_KEY=your_key_here
   YOUTUBE_API_KEY=your_key_here

2. .env.local (for local development):
   VITE_API_BASE_URL=https://clt.show

3. .env.production (for AWS CloudFront deployment):
   VITE_API_BASE_URL=https://clt.show

4. .env.development (for local dev with Vercel):
   # Empty - use relative URLs when running `vercel dev`

Update .gitignore to:
- Ignore .env and .env.local
- Keep .env.example, .env.production, .env.development
```

---

## Phase 10: Vercel Configuration

### Prompt 10.1: Create vercel.json

```
Create vercel.json for Vercel deployment:

{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

This ensures SPA routing works correctly on Vercel.
```

---

## Phase 11: AWS Infrastructure (Optional)

### Prompt 11.1: Create Terraform Configuration

```
Create terraform/ directory with infrastructure-as-code for AWS deployment:

1. main.tf - Provider configuration for AWS (us-east-1)
2. variables.tf - Input variables (region, bucket name, domain, etc.)
3. s3.tf - S3 bucket for static hosting with security settings
4. cloudfront.tf - CloudFront distribution with:
   - Origin Access Control (OAC)
   - Custom cache behaviors (long cache for /assets/*, short for index.html)
   - Custom error responses for SPA routing (404 → index.html with 200 status)
   - SSL/TLS configuration
5. iam.tf - IAM user for CI/CD deployments with minimal permissions
6. outputs.tf - Output values (CloudFront URL, distribution ID, etc.)
7. .gitignore - Ignore .terraform/, *.tfstate, *.tfvars

Include helpful comments and use OpenTofu-compatible syntax.
```

### Prompt 11.2: Create Dagger Pipeline

```
Create dagger/ directory with CI/CD pipeline:

1. dagger.json - Dagger module configuration
2. package.json - Dagger dependencies
3. tsconfig.json - TypeScript configuration
4. src/index.ts - Main Dagger module with functions:
   - build(source): Build Vite app in container
   - deploy(source, awsAccessKeyId, awsSecretAccessKey, s3Bucket, cloudfrontDistId, awsRegion?): Deploy to S3 and invalidate CloudFront
   - test(source): Run linting (optional)
   - pipeline(source, ...): Full CI/CD pipeline

Features:
- Use node:20-alpine for building
- Use amazon/aws-cli for deploying
- Handle secrets properly
- Set cache headers (1 year for assets, 5 min for index.html)
- Create CloudFront invalidation after upload

This allows running deployments locally: `dagger call deploy --source=.`
```

### Prompt 11.3: Create GitHub Actions Workflow

```
Create .github/workflows/deploy-aws.yml:

A workflow that:
1. Triggers on push to main branch or manual dispatch
2. Checks out code
3. Installs Node.js and Dagger CLI
4. Runs Dagger deployment pipeline
5. Uses GitHub Secrets for AWS credentials

Required secrets:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- AWS_S3_BUCKET
- AWS_CLOUDFRONT_DISTRIBUTION_ID
```

---

## Phase 12: Docker Configuration (Optional)

### Prompt 12.1: Create Dockerfile for Local Testing

```
Create Dockerfile.local for testing production build locally:

Features:
- Base on nginx:alpine
- Copy built dist/ files to /usr/share/nginx/html
- Configure nginx for SPA routing (try_files fallback to index.html)
- Set cache headers (match CloudFront configuration)
- Expose port 80

This allows testing with: `docker build -f Dockerfile.local -t cltevents-local .`
Then: `docker run -p 8080:80 cltevents-local`
```

---

## Phase 13: Documentation

### Prompt 13.1: Create README.md

```
Create a comprehensive README.md with:

1. Project overview and description
2. Features list
3. Tech stack
4. Architecture diagram (text-based)
5. Prerequisites
6. Local development setup:
   - Clone repository
   - Install dependencies
   - Configure environment variables
   - Run development server
   - Run with Vercel dev (for API functions)
7. Deployment instructions:
   - Vercel deployment
   - AWS deployment with Terraform and Dagger
8. Project structure explanation
9. API endpoints documentation
10. Configuration files explanation
11. Contributing guidelines
12. License

Make it detailed and beginner-friendly.
```

### Prompt 13.2: Create Deployment Documentation

```
Create AWS-DEPLOYMENT.md with detailed AWS deployment instructions:

1. Prerequisites (AWS account, CLI, Terraform)
2. Step-by-step infrastructure setup
3. Terraform commands with explanations
4. Dagger pipeline usage
5. GitHub Actions configuration
6. Custom domain setup with ACM certificates
7. Cost estimates
8. Troubleshooting guide
9. Rollback procedures

Create QUICK-START-AWS.md with simplified instructions for quick deployment.
```

---

## Phase 14: Testing Setup

### Prompt 14.1: Configure Testing

```
Set up testing with Vitest:

1. Add vitest to package.json devDependencies
2. Create vite.config.js with test configuration
3. Create src/test/setup.js for test utilities
4. Add test script to package.json: "test": "vitest"

Then create unit tests for:
- src/utils/dateUtils.test.js
- src/utils/eventUtils.test.js
- src/utils/youtubeUtils.test.js

Include comprehensive test cases with good coverage.
```

---

## Phase 15: ESLint & Prettier

### Prompt 15.1: Configure Code Quality Tools

```
Set up ESLint and Prettier:

1. Create .eslintrc.cjs with React and Vite rules
2. Create .prettierrc with consistent formatting rules
3. Add scripts to package.json:
   - "lint": "eslint src --ext js,jsx"
   - "lint:fix": "eslint src --ext js,jsx --fix"
   - "format": "prettier --write src/**/*.{js,jsx,css}"

4. Create .eslintignore and .prettierignore

Configure for React best practices and consistent code style.
```

---

## Phase 16: Optional Enhancements

### Prompt 16.1: Add Analytics (Optional)

```
Integrate analytics (e.g., Plausible, Google Analytics, or Vercel Analytics):

1. Add script tag to index.html or use React component
2. Track page views
3. Track custom events (filter usage, favorites, etc.)
4. Respect user privacy (GDPR-compliant)
```

### Prompt 16.2: Add Error Boundary (Optional)

```
Create src/components/ErrorBoundary/ErrorBoundary.jsx:

A React error boundary component that:
1. Catches JavaScript errors in child components
2. Displays fallback UI with error message
3. Logs errors to console
4. Provides "Reload" button
5. Prevents entire app from crashing

Wrap App component with ErrorBoundary in main.jsx.
```

### Prompt 16.3: Add Service Worker (Optional)

```
Add PWA capabilities with Vite PWA plugin:

1. Install vite-plugin-pwa
2. Configure in vite.config.js
3. Add manifest.json with app metadata
4. Enable offline functionality
5. Add install prompt
6. Cache static assets

This makes the app installable and work offline.
```

---

## Execution Order Summary

Execute prompts in this order for best results:

1. ✅ Phase 1: Project Setup (1.1)
2. ✅ Phase 2: Configuration Files (2.1, 2.2)
3. ✅ Phase 3: Tailwind (3.1)
4. ✅ Phase 4: Utilities (4.1 → 4.6)
5. ✅ Phase 5: Hooks (5.1 → 5.3)
6. ✅ Phase 6: Components (6.1 → 6.6)
7. ✅ Phase 7: App Component (7.1 → 7.3)
8. ✅ Phase 8: API Functions (8.1 → 8.6)
9. ✅ Phase 9: Environment Config (9.1)
10. ✅ Phase 10: Vercel Config (10.1)
11. ⚠️ Phase 11: AWS Infrastructure (11.1 → 11.3) - Optional if deploying to AWS
12. ⚠️ Phase 12: Docker (12.1) - Optional for local testing
13. ✅ Phase 13: Documentation (13.1, 13.2)
14. ✅ Phase 14: Testing (14.1)
15. ✅ Phase 15: Code Quality (15.1)
16. ⚠️ Phase 16: Enhancements (16.1 → 16.3) - Optional

---

## Important Notes

1. **API Keys**: You'll need to obtain:
   - Ticketmaster API key (free developer account)
   - YouTube API key (Google Cloud Console)
   - Store in environment variables

2. **Vercel Deployment**:
   - Connect GitHub repo to Vercel
   - Set environment variables in Vercel dashboard
   - Automatic deployments on git push

3. **AWS Deployment**:
   - Run `terraform apply` to create infrastructure
   - Add GitHub Secrets for AWS credentials
   - Push to trigger GitHub Actions deployment

4. **Testing Locally**:
   - Use `vercel dev` to run API functions locally
   - Or use `npm run dev` with `.env.local` pointing to production APIs
   - Or build Docker container for production testing

5. **Corporate Laptop Considerations**:
   - You may need to use corporate proxy settings
   - Some dependencies might need approval
   - AWS/Vercel access might need IT approval
   - Consider using mock data if APIs are blocked

6. **Cost Estimates**:
   - Vercel: Free tier (hobby) or $20/month (pro)
   - AWS: ~$2-5/month (S3 + CloudFront)
   - Ticketmaster API: Free tier available
   - YouTube API: Free tier (10,000 requests/day)

---

## Verification Checklist

After completing all prompts, verify:

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts development server
- [ ] `npm run build` creates production build
- [ ] `npm run lint` passes without errors
- [ ] `npm test` runs test suites
- [ ] API functions work locally with `vercel dev`
- [ ] Environment variables are configured
- [ ] All configuration files are in place
- [ ] Documentation is complete

---

## Troubleshooting Tips

**If Claude Code makes mistakes:**
- Reference specific files: "Fix the error in src/hooks/useEvents.js on line 45"
- Ask for corrections: "The filterByGenre function isn't working correctly, please fix it"
- Request reviews: "Review the EventCard component and fix any issues"

**If dependencies fail:**
- "Update package.json to use compatible versions of all dependencies"
- "Fix the dependency conflicts in package.json"

**If build fails:**
- "Debug the Vite build errors and fix them"
- "The Tailwind classes aren't working, fix the configuration"

**If APIs don't work:**
- "The Ticketmaster API is returning errors, add better error handling"
- "Test the API functions and fix any issues"

---

## End Notes

This prompt sequence will recreate the entire CLT Events Discovery application from scratch. Each prompt is detailed enough for Claude Code to generate the code without seeing the original files.

The key is to execute them **in order** and verify each phase works before moving to the next.

Good luck setting up on your corporate laptop! 🚀
