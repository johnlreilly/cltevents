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

function App() {
  const [showFilterTray, setShowFilterTray] = useState(false)
  const [currentQuote, setCurrentQuote] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [quoteDisplayTime, setQuoteDisplayTime] = useState(null)
  const [hasScrolledPastTop, setHasScrolledPastTop] = useState(false)
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

  // Load quotes on mount
  useEffect(() => {
    fetch('/quotes/quotes-look-back.json')
      .then((res) => res.json())
      .then((data) => setQuotes(data))
      .catch((err) => console.error('Error loading quotes:', err))
  }, [])

  // Detect sticky header and manage quote display
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const headerHeight = 64 // Header height in pixels
      const firstDateSeparator = document.querySelector('[id^="date-"]')

      // Check if the first date separator is actually stuck (sticky)
      let isStickyHeaderActive = false
      if (firstDateSeparator) {
        const separatorTop = firstDateSeparator.getBoundingClientRect().top
        // Date separator is sticky when it's at position top-[48px] = 48px from top
        isStickyHeaderActive = separatorTop <= 48
      }

      // Trigger quote change when sticky header becomes active
      if (isStickyHeaderActive && !hasScrolledPastTop) {
        setHasScrolledPastTop(true)

        // Only prepare new quote if cooldown has passed AND we're not at the top (quote not visible)
        const now = Date.now()
        const thirtySeconds = 30000

        if (quotes.length > 0 && currentScrollY > 0 && (!quoteDisplayTime || now - quoteDisplayTime > thirtySeconds)) {
          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
          setCurrentQuote(randomQuote)
          setQuoteDisplayTime(now)
        }
      }

      // Reset when back at top
      if (currentScrollY === 0) {
        setHasScrolledPastTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [quotes, hasScrolledPastTop, quoteDisplayTime])

  const toggleFilterTray = () => {
    if (!showFilterTray) {
      // Opening filter tray - scroll to ensure sticky header is active
      const firstDateSeparator = document.querySelector('[id^="date-"]')
      if (firstDateSeparator) {
        // Scroll to make the first date separator sticky (just past the header)
        const headerHeight = 64
        const targetPosition = firstDateSeparator.offsetTop - headerHeight - 1
        window.scrollTo({ top: Math.max(0, targetPosition), behavior: 'smooth' })
      }
    }
    setShowFilterTray(!showFilterTray)
  }

  return (
    <div className="min-h-screen bg-black">
      <Header
        onRefresh={refetch}
        loading={loading}
        onToggleFilters={toggleFilterTray}
        showFilterTray={showFilterTray}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
        {initialLoad && loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="my-6 text-lg text-center">
              {currentQuote ? (
                <div className="text-primary">
                  <p className="italic">
                    "{currentQuote.quote.split('|').map((line, index, array) => (
                      <span key={index}>
                        {line}
                        {index < array.length - 1 && <br />}
                      </span>
                    ))}"
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
              showFilterTray={showFilterTray}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedGenres={selectedGenres}
              onGenreToggle={toggleGenre}
              availableGenres={availableGenres}
              selectedSources={selectedSources}
              onSourceToggle={toggleSource}
              sortBy={sortBy}
              onSortChange={setSortBy}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
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
