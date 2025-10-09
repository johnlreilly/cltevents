# Migration Guide: Converting to Modern React Architecture

This guide documents the conversion of CLT.show from a single-file HTML application to a modern React project with proper testing and build tools.

## 🎯 Goals

1. **Enable Testing** - Write unit and integration tests
2. **Improve Maintainability** - Break monolithic code into reusable components
3. **Modern Development** - Use industry-standard tools and practices
4. **Learning Opportunity** - Demonstrate AI-assisted SDLC best practices

## 📊 Current Progress

### ✅ Phase 1: Foundation (COMPLETED)

**What We've Built:**

1. **Build System**
   - `package.json` - Dependencies for React, Vite, testing
   - `vite.config.js` - Dev server and build configuration
   - `postcss.config.js` + `tailwind.config.js` - Styling setup
   - `.eslintrc.cjs` + `.prettierrc` - Code quality tools

2. **Documentation**
   - `README.md` - Comprehensive project documentation
   - This migration guide

3. **Testing Infrastructure**
   - Vitest configured for unit testing
   - React Testing Library for component testing
   - `src/test/setup.js` - Test environment setup with localStorage mocking

4. **Utility Functions** (with JSDoc documentation)

   **`src/utils/dateUtils.js`** - 8 functions for date handling:
   ```javascript
   formatDate(dateStr)           // "2024-12-15" → "Fri, Dec 15"
   formatTime(timeStr)           // "19:00:00" → "7:00 PM"
   formatDateSeparator(date)     // Date → {monthDay: "December 15", dayOfWeek: "Friday"}
   getToday()                    // Returns today's date as "YYYY-MM-DD"
   parseDate(dateStr)            // String → Date object
   compareDates(dateA, dateB)    // Compare dates for sorting
   isDateInPast(dateStr)         // Check if date is past
   isToday(dateStr)              // Check if date is today
   ```

   **`src/utils/youtubeUtils.js`** - 5 functions for YouTube integration:
   ```javascript
   cleanYouTubeTitle(title)      // Remove "(Official Video)" etc
   extractVideoId(url)           // Extract ID from youtube.com or youtu.be URLs
   isValidVideoId(videoId)       // Validate video ID format
   createEmbedUrl(videoId, auto) // Create embed URL with optional autoplay
   fetchYouTubeVideos(artist)    // Fetch videos with caching
   ```

### 🚧 Phase 2: Event Processing & Hooks (IN PROGRESS)

**Next Steps:**

1. **Create `src/utils/eventUtils.js`**
   - Event sorting logic
   - Event filtering logic
   - Text search/matching
   - Genre extraction
   - Title case conversion

2. **Create `src/hooks/useLocalStorage.js`**
   - Custom hook for localStorage with React state
   - Automatic persistence
   - Type-safe reading/writing

3. **Create `src/hooks/useEvents.js`**
   - Fetch events from API
   - Combine data from multiple sources
   - Cache YouTube results
   - Handle loading states

4. **Create `src/hooks/useFilters.js`**
   - Manage filter state (categories, genres, sources)
   - Persist filters to localStorage
   - Computed sorted/filtered event list

### 📝 Phase 3: React Component Structure (UPCOMING)

**Entry Points:**

1. **`src/main.jsx`** - React app entry point
   ```javascript
   import React from 'react'
   import ReactDOM from 'react-dom/client'
   import App from './App.jsx'
   import './index.css'

   ReactDOM.createRoot(document.getElementById('root')).render(
     <React.StrictMode>
       <App />
     </React.StrictMode>,
   )
   ```

2. **`src/index.css`** - Global styles + Tailwind
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   /* Custom global styles */
   ```

3. **Update `index.html`** - Simple entry point
   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Charlotte Events Discovery</title>
     </head>
     <body>
       <div id="root"></div>
       <script type="module" src="/src/main.jsx"></script>
     </body>
   </html>
   ```

**Component Breakdown:**

```
src/components/
├── Header/
│   ├── Header.jsx          # Top app bar with logo and action buttons
│   ├── Header.test.jsx     # Tests for header
│   └── README.md           # Component documentation
├── FilterTray/
│   ├── FilterTray.jsx      # Filter and sort UI
│   ├── CategoryMenu.jsx    # Category dropdown
│   ├── GenreMenu.jsx       # Genre multi-select
│   ├── SourceMenu.jsx      # Source filter
│   ├── SortMenu.jsx        # Sort options
│   ├── FilterTray.test.jsx # Tests
│   └── README.md
├── EventList/
│   ├── EventList.jsx       # Grid of event cards
│   ├── EventCard.jsx       # Individual event card
│   ├── DateSeparator.jsx   # Sticky date headers
│   ├── NoEvents.jsx        # Empty state
│   └── EventList.test.jsx
├── YouTubePlayer/
│   ├── YouTubePlayer.jsx   # YouTube embed container
│   ├── VideoList.jsx       # List of videos
│   ├── VideoListItem.jsx   # Individual video item
│   └── YouTubePlayer.test.jsx
├── ScrollToTop/
│   ├── ScrollToTop.jsx     # Floating scroll button
│   └── ScrollToTop.test.jsx
└── App.jsx                  # Main app component
```

### 🧪 Phase 4: Testing (UPCOMING)

**Test Coverage Plan:**

1. **Unit Tests** for utilities:
   ```javascript
   // src/utils/dateUtils.test.js
   describe('formatDate', () => {
     it('formats ISO date correctly', () => {
       expect(formatDate('2024-12-15')).toBe('Fri, Dec 15')
     })
   })
   ```

2. **Component Tests**:
   ```javascript
   // src/components/EventCard/EventCard.test.jsx
   describe('EventCard', () => {
     it('renders event name and venue', () => {
       render(<EventCard event={mockEvent} />)
       expect(screen.getByText('Concert Name')).toBeInTheDocument()
     })
   })
   ```

3. **Integration Tests** for complete flows:
   - Loading events
   - Filtering by category
   - Playing YouTube videos
   - Favoriting events

## 🔄 Migration Process

### How We're Extracting Code

The current `index.html` has all React code inline (~1700 lines). We're extracting it following this pattern:

1. **Identify self-contained logic** (date formatting, YouTube parsing)
2. **Extract to utility functions** with JSDoc documentation
3. **Write tests** for utilities
4. **Create custom hooks** for stateful logic
5. **Break down UI** into components
6. **Test components** individually
7. **Verify everything works** together

### Why This Approach?

**Benefits:**
- Each piece is **tested in isolation**
- Functions are **reusable** across components
- Code is **self-documenting** (JSDoc)
- **Easier to maintain** - find bugs faster
- **Professional structure** - industry best practices

**Trade-offs:**
- More files to manage
- Initial time investment
- Learning curve for React patterns

## 📚 Key Concepts Being Demonstrated

### 1. JSDoc Documentation

Every function has comprehensive documentation:

```javascript
/**
 * Formats a date string for display
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {string} Formatted date (e.g., "Fri, Dec 15")
 * @example
 * formatDate('2024-12-15') // Returns "Fri, Dec 15"
 */
export const formatDate = (dateStr) => {
  // Implementation
}
```

**Benefits:**
- IDE autocomplete
- Type hints
- Usage examples
- Self-documenting code

### 2. Custom Hooks Pattern

Extracting stateful logic into reusable hooks:

```javascript
// Instead of useState in component
function App() {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })

  // Becomes
  const [favorites, setFavorites] = useLocalStorage('favorites', [])
}
```

### 3. Component Composition

Breaking down monolithic component:

```javascript
// Before: One 1700-line component

// After: Composed smaller components
function App() {
  return (
    <div>
      <Header />
      <FilterTray />
      <EventList />
      <ScrollToTop />
    </div>
  )
}
```

### 4. Test-Driven Development

Writing tests alongside (or before) code:

```javascript
// 1. Write test
it('formats date correctly', () => {
  expect(formatDate('2024-12-15')).toBe('Fri, Dec 15')
})

// 2. Implement function
export const formatDate = (dateStr) => {
  // Implementation to pass test
}

// 3. Refactor with confidence (tests catch regressions)
```

## 🎓 Learning Outcomes

By the end of this migration, you'll understand:

1. **Modern React Architecture**
   - Component composition
   - Custom hooks
   - State management patterns

2. **Testing Strategy**
   - Unit tests vs component tests vs integration tests
   - Test-driven development
   - Mocking (localStorage, API calls)

3. **Code Quality**
   - JSDoc documentation
   - ESLint/Prettier automation
   - Code organization

4. **Build Tools**
   - Vite for development
   - Tailwind CSS
   - Module bundling

5. **AI-Assisted Development**
   - Using AI for refactoring
   - Generating documentation
   - Creating tests
   - Best practices

## 📖 Next Steps

### To Continue Migration:

1. **Run current setup** to verify build works:
   ```bash
   npm run dev
   ```
   (Won't work yet - we haven't created src/main.jsx)

2. **Continue systematic extraction:**
   - Event utilities
   - Custom hooks
   - Component structure
   - Tests

3. **Verify at each step:**
   ```bash
   npm test              # Run tests
   npm run lint          # Check code quality
   npm run build         # Verify builds
   ```

### To Learn More:

- **Vitest docs**: https://vitest.dev
- **React Testing Library**: https://testing-library.com/react
- **JSDoc**: https://jsdoc.app
- **React Hooks**: https://react.dev/reference/react

## 🤝 Contributing to Migration

When adding new code:

1. **Add JSDoc comments** with examples
2. **Write tests first** (TDD)
3. **Run `npm run format`** before committing
4. **Ensure `npm test` passes**
5. **Update this guide** if needed

## 📝 Notes

- Original `index.html` is preserved during migration
- Old code can be deleted once new version is verified
- All features must work identically in new structure
- No functionality should be lost in migration

---

**Last Updated**: Current session
**Status**: Phase 1 Complete, Phase 2 In Progress
**Completion**: ~25% complete
