/**
 * Main App component for CLT Events Discovery
 * MVP version - to be refactored into smaller components
 */

import { useState, useEffect } from 'react'
import useEvents from './hooks/useEvents'
import useFilters from './hooks/useFilters'
import Header from './components/Header/Header'
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner'
import EventList from './components/EventList/EventList'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import ImageCropTest from './components/ImageCropTest/ImageCropTest'

// Version tracking
const APP_VERSION = '1.1.0'
const BUILD_DATE = new Date().toISOString()

function App() {
  // Check if we're in test mode (must be before any hooks)
  const urlParams = new URLSearchParams(window.location.search)
  const isTestMode = urlParams.get('test') === 'crop'

  if (isTestMode) {
    return <ImageCropTest />
  }

  // Log version on mount
  useEffect(() => {
    console.log(`%c🎉 CLT Events Discovery v${APP_VERSION}`, 'color: #6366f1; font-weight: bold; font-size: 14px;')
    console.log(`%cBuild: ${BUILD_DATE}`, 'color: #94a3b8; font-size: 12px;')
    console.log(`%cEnvironment: ${import.meta.env.MODE}`, 'color: #94a3b8; font-size: 12px;')
  }, [])

  const [showFilterTray, setShowFilterTray] = useState(false)
  const [currentQuote, setCurrentQuote] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [quoteDisplayTime, setQuoteDisplayTime] = useState(null)
  const [hasScrolledPastTop, setHasScrolledPastTop] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true) // Track if user is at the very top of the page
  const { events, loading, initialLoad, availableGenres, refetch } = useEvents()
  const {
    filteredEvents,
    selectedCategory,
    setSelectedCategory,
    selectedGenres,
    toggleGenre,
    selectedSources,
    toggleSource,
    sortBy,
    setSortBy,
    hasActiveFilters,
    clearFilters,
    favorites,
    toggleFavorite,
    hidden,
    toggleHidden,
  } = useFilters(events)

  // Debug: Log events with YouTube links
  useEffect(() => {
    if (events.length > 0) {
      const eventsWithYouTube = events.filter(e => e.youtubeLinks && e.youtubeLinks.length > 0)
      console.log(`📊 Total events: ${events.length}, Events with YouTube: ${eventsWithYouTube.length}`)
      if (eventsWithYouTube.length > 0) {
        console.log('Events with YouTube links:', eventsWithYouTube.map(e => ({
          name: e.name,
          venue: e.venue,
          youtubeCount: e.youtubeLinks.length
        })))
      }
    }
  }, [events])

  // Load quotes on mount
  useEffect(() => {
    fetch('/quotes/quotes-look-back.json')
      .then((res) => res.json())
      .then((data) => setQuotes(data))
      .catch((err) => console.error('Error loading quotes:', err))
  }, [])

  // Detect scroll position and manage quote display
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const firstDateSeparator = document.querySelector('[id^="date-"]')

      // Check if user is at the very top of the page
      setIsAtTop(currentScrollY === 0)

      // Check if the first date separator is actually stuck (sticky)
      let isStickyHeaderActive = false
      if (firstDateSeparator) {
        const separatorTop = firstDateSeparator.getBoundingClientRect().top
        // Date separator is sticky when it's at position top-[48px] = 48px from top
        isStickyHeaderActive = separatorTop <= 48
      }

      // Track if user has scrolled past the top
      if (isStickyHeaderActive && !hasScrolledPastTop) {
        setHasScrolledPastTop(true)
      }

      // Reset when back at top
      if (currentScrollY === 0) {
        setHasScrolledPastTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasScrolledPastTop])

  // Prepare new quote every 30 seconds when user has scrolled past top
  useEffect(() => {
    if (!hasScrolledPastTop || quotes.length === 0) {
      return
    }

    // Immediately prepare a new quote when user first scrolls past top
    const now = Date.now()
    const thirtySeconds = 30000

    if (!quoteDisplayTime || now - quoteDisplayTime > thirtySeconds) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setCurrentQuote(randomQuote)
      setQuoteDisplayTime(now)
    }

    // Set up interval to prepare new quotes every 30 seconds
    const interval = setInterval(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setCurrentQuote(randomQuote)
      setQuoteDisplayTime(Date.now())
    }, thirtySeconds)

    return () => clearInterval(interval)
  }, [hasScrolledPastTop, quotes, quoteDisplayTime])

  const toggleFilterTray = () => {
    setShowFilterTray(!showFilterTray)
  }

  const handleRefresh = () => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Reset quote state so it looks like a fresh page load
    setCurrentQuote(null)
    setHasScrolledPastTop(false)

    // Call the actual refetch function
    refetch()
  }

  return (
    <div className="min-h-screen bg-black">
      <Header
        onRefresh={handleRefresh}
        loading={loading}
        onToggleFilters={toggleFilterTray}
        showFilterTray={showFilterTray}
        hasActiveFilters={hasActiveFilters}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedGenres={selectedGenres}
        onGenreToggle={toggleGenre}
        availableGenres={availableGenres}
        selectedSources={selectedSources}
        onSourceToggle={toggleSource}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={clearFilters}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
        {initialLoad && loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="my-6 text-lg text-center min-h-[4.5rem] flex items-center justify-center">
              {currentQuote && isAtTop ? (
                <div className="text-primary">
                  <p className="italic">
                    &ldquo;{currentQuote.quote.split('|').map((line, index, array) => (
                      <span key={index}>
                        {line}
                        {index < array.length - 1 && <br />}
                      </span>
                    ))}&rdquo;
                  </p>
                  <p className="text-sm text-onsurfacevariant mt-2">— {currentQuote.author}</p>
                </div>
              ) : (
                <p className={`text-gray-400 transition-opacity duration-300 ${hasScrolledPastTop ? 'opacity-0' : 'opacity-100'}`}>
                  Charlotte shows... all in one place!
                </p>
              )}
            </div>

            <EventList
              events={filteredEvents}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              hidden={hidden}
              toggleHidden={toggleHidden}
            />
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}

export default App
