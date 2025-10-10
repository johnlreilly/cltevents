/**
 * Main App component for CLT Events Discovery
 * MVP version - to be refactored into smaller components
 */

import useEvents from './hooks/useEvents'
import useFilters from './hooks/useFilters'
import Header from './components/Header/Header'
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner'
import EventList from './components/EventList/EventList'
import FilterTray from './components/FilterTray/FilterTray'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'

function App() {
  const { events, loading, initialLoad, availableGenres } = useEvents()
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

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
        {initialLoad && loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="mb-6 text-lg text-gray-400 text-center">
              Charlotte shows... all in one place!
            </div>

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
