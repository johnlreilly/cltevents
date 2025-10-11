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
  const [showQuote, setShowQuote] = useState(false)
  const [currentQuote, setCurrentQuote] = useState(null)
  const [quotes, setQuotes] = useState([])
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

  // Detect scroll beyond top
  useEffect(() => {
    let lastScrollY = window.scrollY
    let pullStartY = 0
    let isPulling = false

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        pullStartY = e.touches[0].clientY
        isPulling = true
      }
    }

    const handleTouchMove = (e) => {
      if (isPulling && window.scrollY === 0) {
        const currentY = e.touches[0].clientY
        const pullDistance = currentY - pullStartY

        if (pullDistance > 100 && quotes.length > 0 && !showQuote) {
          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
          setCurrentQuote(randomQuote)
          setShowQuote(true)
          setTimeout(() => setShowQuote(false), 5000)
        }
      }
    }

    const handleTouchEnd = () => {
      isPulling = false
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Desktop: detect when trying to scroll up from top
      if (currentScrollY === 0 && lastScrollY === 0 && quotes.length > 0 && !showQuote) {
        // User is at top and trying to scroll up (wheel event will trigger this)
      }

      lastScrollY = currentScrollY
    }

    const handleWheel = (e) => {
      if (window.scrollY === 0 && e.deltaY < 0 && quotes.length > 0 && !showQuote) {
        // Scrolling up while at top
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
        setCurrentQuote(randomQuote)
        setShowQuote(true)
        setTimeout(() => setShowQuote(false), 5000)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('wheel', handleWheel)
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [quotes, showQuote])

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
              {showQuote && currentQuote ? (
                <div className="text-primary animate-fade-in">
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
