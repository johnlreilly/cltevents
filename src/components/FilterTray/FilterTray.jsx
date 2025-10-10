/**
 * FilterTray component
 * Provides filtering controls for events
 */

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
  const categories = ['all', 'favorites', 'preferred']
  const sources = ['ticketmaster', 'smokeyjoes', 'clttoday', 'fillmore']

  return (
    <div className="bg-surface border border-outlinevariant rounded-2xl p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-onsurface mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-outline rounded-lg text-onsurface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-onsurface mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-outline rounded-lg text-onsurface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="venue">Venue</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-tertiary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Genre Filters */}
      {availableGenres.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-onsurface mb-2">Genres</label>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => onGenreToggle(genre)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedGenres.includes(genre)
                    ? 'bg-primary text-white'
                    : 'bg-surfacevariant text-onsurfacevariant hover:bg-opacity-80'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Source Filters */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-onsurface mb-2">Sources</label>
        <div className="flex flex-wrap gap-2">
          {sources.map((source) => (
            <button
              key={source}
              onClick={() => onSourceToggle(source)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedSources.includes(source)
                  ? 'bg-primary text-white'
                  : 'bg-surfacevariant text-onsurfacevariant hover:bg-opacity-80'
              }`}
            >
              {source === 'smokeyjoes'
                ? "Smokey Joe's"
                : source === 'fillmore'
                ? 'The Fillmore'
                : source.charAt(0).toUpperCase() + source.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FilterTray
