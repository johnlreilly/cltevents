/**
 * FilterTray component
 * Provides filtering controls for events with Material Design 3 styling
 */

import { useState } from 'react'

/**
 * FilterTray Component
 * @param {Object} props - Component props
 * @param {string} props.selectedCategory - Currently selected category
 * @param {Function} props.onCategoryChange - Category change handler
 * @param {Array} props.selectedGenres - Array of selected genre strings
 * @param {Function} props.onGenreToggle - Genre toggle handler
 * @param {Array} props.availableGenres - Array of available genres
 * @param {Array} props.selectedSources - Array of selected source strings
 * @param {Function} props.onSourceToggle - Source toggle handler
 * @param {string} props.sortBy - Current sort method
 * @param {Function} props.onSortChange - Sort change handler
 * @param {boolean} props.hasActiveFilters - Whether any filters are active
 * @param {Function} props.onClearFilters - Clear all filters handler
 * @returns {JSX.Element} The filter tray component
 */
function FilterTray({
  selectedCategory,
  onCategoryChange,
  selectedGenres,
  onGenreToggle,
  availableGenres,
  selectedSources,
  onSourceToggle,
  sortBy,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
}) {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [showGenreMenu, setShowGenreMenu] = useState(false)
  const [showSourceMenu, setShowSourceMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'favorites', name: 'Favorites' },
    { id: 'divebars', name: 'Dive Bars' },
    { id: 'preferred', name: 'Preferred Venues' },
    { id: 'hidden', name: 'Hidden' },
  ]

  const sortOptions = [
    { id: 'date', name: 'Sort by Date' },
    { id: 'match', name: 'Sort by Match' },
  ]

  const sources = ['ticketmaster', 'smokeyjoes', 'clttoday', 'fillmore', 'eternally-grateful']

  const getSourceDisplayName = (source) => {
    const names = {
      smokeyjoes: "Smokey Joe's",
      fillmore: 'The Fillmore',
      'eternally-grateful': 'Eternally Grateful',
      clttoday: 'CLTtoday',
      ticketmaster: 'Ticketmaster',
    }
    return names[source] || source.charAt(0).toUpperCase() + source.slice(1)
  }

  const clearGenres = () => {
    selectedGenres.forEach((genre) => onGenreToggle(genre))
  }

  const clearSources = () => {
    selectedSources.forEach((source) => onSourceToggle(source))
  }

  return (
    <div className="pt-4">
      {/* Filter and Sort Controls */}
      <div className="space-y-3">
        {/* Category Menu */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="flex items-center gap-2 px-6 py-3 bg-primarycontainer text-onprimarycontainer rounded-full hover:shadow-md transition-all w-full font-medium"
          >
            <span>{categories.find((cat) => cat.id === selectedCategory)?.name || 'All Events'}</span>
            <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCategoryMenu && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setShowCategoryMenu(false)} />
              <div className="absolute top-full left-0 mt-2 w-full bg-surface rounded-2xl shadow-2xl z-50 overflow-hidden border border-outlinevariant">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onCategoryChange(cat.id)
                      setShowCategoryMenu(false)
                    }}
                    className={`flex items-center gap-3 px-6 py-4 w-full text-left transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-primarycontainer text-onprimarycontainer'
                        : cat.id === 'hidden'
                        ? 'text-onsurfacevariant hover:bg-surfacevariant'
                        : 'text-onsurface hover:bg-surfacevariant'
                    }`}
                  >
                    <span className="font-medium">{cat.name}</span>
                    {selectedCategory === cat.id && (
                      <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Genre Menu */}
        <div className="relative">
          <button
            onClick={() => setShowGenreMenu(!showGenreMenu)}
            className="flex items-center gap-2 px-6 py-3 bg-primarycontainer text-onprimarycontainer rounded-full hover:shadow-md transition-all w-full font-medium"
          >
            <span>
              {selectedGenres.length === 0
                ? 'All Genres'
                : `${selectedGenres.length} Genre${selectedGenres.length > 1 ? 's' : ''}`}
            </span>
            <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showGenreMenu && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setShowGenreMenu(false)} />
              <div className="absolute top-full left-0 mt-2 w-full bg-surface rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto border border-outlinevariant">
                {selectedGenres.length > 0 && (
                  <button
                    onClick={clearGenres}
                    className="flex items-center gap-3 px-6 py-3 w-full text-left border-b border-outlinevariant text-primary hover:bg-primarycontainer font-medium"
                  >
                    Clear All
                  </button>
                )}
                {availableGenres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => onGenreToggle(genre)}
                    className="flex items-center gap-3 px-6 py-3 w-full text-left transition-all text-onsurface hover:bg-surfacevariant"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedGenres.includes(genre) ? 'bg-primary border-primary' : 'border-outline'
                      }`}
                    >
                      {selectedGenres.includes(genre) && (
                        <svg className="w-3 h-3 text-onprimary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{genre}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Source Menu */}
        <div className="relative">
          <button
            onClick={() => setShowSourceMenu(!showSourceMenu)}
            className="flex items-center gap-2 px-6 py-3 bg-primarycontainer text-onprimarycontainer rounded-full hover:shadow-md transition-all w-full font-medium"
          >
            <span>
              {selectedSources.length === 0
                ? 'All Sources'
                : `${selectedSources.length} Source${selectedSources.length > 1 ? 's' : ''}`}
            </span>
            <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSourceMenu && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setShowSourceMenu(false)} />
              <div className="absolute top-full left-0 mt-2 w-full bg-surface rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto border border-outlinevariant">
                {selectedSources.length > 0 && (
                  <button
                    onClick={clearSources}
                    className="flex items-center gap-3 px-6 py-3 w-full text-left border-b border-outlinevariant text-primary hover:bg-primarycontainer font-medium"
                  >
                    Clear All
                  </button>
                )}
                {sources.map((source) => (
                  <button
                    key={source}
                    onClick={() => onSourceToggle(source)}
                    className="flex items-center gap-3 px-6 py-3 w-full text-left transition-all text-onsurface hover:bg-surfacevariant"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedSources.includes(source) ? 'bg-primary border-primary' : 'border-outline'
                      }`}
                    >
                      {selectedSources.includes(source) && (
                        <svg className="w-3 h-3 text-onprimary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{getSourceDisplayName(source)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sort Menu */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-6 py-3 bg-primarycontainer text-onprimarycontainer rounded-full hover:shadow-md transition-all w-full font-medium"
          >
            <span>{sortOptions.find((opt) => opt.id === sortBy)?.name || 'Sort by Date'}</span>
            <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showSortMenu && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setShowSortMenu(false)} />
              <div className="absolute top-full left-0 mt-2 w-full bg-surface rounded-2xl shadow-2xl z-50 overflow-hidden border border-outlinevariant">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSortChange(opt.id)
                      setShowSortMenu(false)
                    }}
                    className={`flex items-center gap-3 px-6 py-4 w-full text-left transition-all ${
                      sortBy === opt.id
                        ? 'bg-primarycontainer text-onprimarycontainer'
                        : 'text-onsurface hover:bg-surfacevariant'
                    }`}
                  >
                    <span className="font-medium">{opt.name}</span>
                    {sortBy === opt.id && (
                      <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-6 py-3 text-primary hover:text-onprimarycontainer hover:bg-primarycontainer rounded-full transition-all w-full font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Clear All Filters</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterTray
