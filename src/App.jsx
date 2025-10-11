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
import FilterTray from './components/FilterTray/FilterTray'
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

  // Detect sticky header and scroll position
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const headerHeight = 64 // Header height in pixels

      // Check if scrolled past header (date card would be sticky)
      if (currentScrollY > headerHeight) {
        setHasScrolledPastTop(true)
      }

      // User returned to top
      if (currentScrollY === 0 && hasScrolledPastTop && quotes.length > 0) {
        // Check if we can show a new quote
        const now = Date.now()
        const oneMinute = 60000

        if (!quoteDisplayTime || now - quoteDisplayTime > oneMinute) {
          // Show new random quote
          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
          setCurrentQuote(randomQuote)
          setQuoteDisplayTime(now)
          setHasScrolledPastTop(false) // Reset so quote can change next time
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [quotes, hasScrolledPastTop, quoteDisplayTime])

  const toggleFilterTray = () => {
    setShowFilterTray(!showFilterTray)
    if (!showFilterTray) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
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
            <div className="mb-6 text-lg text-center transition-all duration-500">
              {currentQuote ? (
                <div className="text-primary">
                  <p className="italic">"{currentQuote.quote}"</p>
                  <p className="text-sm text-onsurfacevariant mt-2">— {currentQuote.author}</p>
                </div>
              ) : (
                <p className="text-gray-400">Charlotte shows... all in one place!</p>
              )}
            </div>

            {showFilterTray && (
              <FilterTray
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
            )}

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
