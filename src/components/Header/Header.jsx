/**
 * Header component for CLT Events Discovery
 * Sticky header with app title and filter tray
 */

import FilterTray from '../FilterTray/FilterTray'

/**
 * Header Component
 * @param {Object} props - Component props
 * @param {Function} props.onRefresh - Callback for refresh button
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onToggleFilters - Callback for filter toggle button
 * @param {boolean} props.showFilterTray - Whether filter tray is visible
 * @param {boolean} props.hasActiveFilters - Whether any filters are active
 * @param {string} props.selectedCategory - Currently selected category
 * @param {Function} props.onCategoryChange - Category change handler
 * @param {Array} props.selectedGenres - Array of selected genre strings
 * @param {Function} props.onGenreToggle - Genre toggle handler
 * @param {Array} props.availableGenres - Array of available genres
 * @param {Array} props.selectedSources - Array of selected source strings
 * @param {Function} props.onSourceToggle - Source toggle handler
 * @param {string} props.sortBy - Current sort method
 * @param {Function} props.onSortChange - Sort change handler
 * @param {Function} props.onClearFilters - Clear all filters handler
 * @returns {JSX.Element} The header component
 */
function Header({
  onRefresh,
  loading,
  onToggleFilters,
  showFilterTray,
  hasActiveFilters,
  selectedCategory,
  onCategoryChange,
  selectedGenres,
  onGenreToggle,
  availableGenres,
  selectedSources,
  onSourceToggle,
  sortBy,
  onSortChange,
  onClearFilters
}) {
  return (
    <div className="bg-surface shadow-sm sticky top-0 z-30 border-b border-outlinevariant">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-onsurface">CLT.show</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFilters}
            className={`p-2 rounded-full transition-colors relative ${showFilterTray ? 'bg-primarycontainer' : 'hover:bg-primarycontainer'}`}
            title="Toggle filters"
          >
            <svg className="w-6 h-6 text-onsurfacevariant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {hasActiveFilters && !showFilterTray && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            )}
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-full hover:bg-primarycontainer transition-colors disabled:opacity-50"
            title="Refresh events"
          >
            <svg className="w-6 h-6 text-onsurfacevariant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter tray */}
      {showFilterTray && (
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <FilterTray
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            selectedGenres={selectedGenres}
            onGenreToggle={onGenreToggle}
            availableGenres={availableGenres}
            selectedSources={selectedSources}
            onSourceToggle={onSourceToggle}
            sortBy={sortBy}
            onSortChange={onSortChange}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onClose={onToggleFilters}
          />
        </div>
      )}
    </div>
  )
}

export default Header
