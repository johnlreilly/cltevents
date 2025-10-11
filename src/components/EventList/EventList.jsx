/**
 * EventList component
 * Displays a list of events with date separators
 */

import { Fragment } from 'react'
import EventCard from '../EventCard/EventCard'
import FilterTray from '../FilterTray/FilterTray'

/**
 * EventList Component
 * @param {Object} props - Component props
 * @param {Array} props.events - Array of event objects
 * @param {Array} props.favorites - Array of favorite event IDs
 * @param {Function} props.toggleFavorite - Function to toggle favorite status
 * @param {Array} props.hidden - Array of hidden event IDs
 * @param {Function} props.toggleHidden - Function to toggle hidden status
 * @param {boolean} props.showFilterTray - Whether filter tray is visible
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
 * @returns {JSX.Element} The event list component
 */
function EventList({
  events,
  favorites,
  toggleFavorite,
  hidden,
  toggleHidden,
  showFilterTray,
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
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No events found.</p>
      </div>
    )
  }

  const formatDateSeparator = (dateStr) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
    return { year, monthDay, dayOfWeek }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {events.map((event, index) => {
        // Check if date changed from previous event
        const currentDate = event.dates[0]?.date
        const previousDate = index > 0 ? events[index - 1].dates[0]?.date : null
        const showDateSeparator = currentDate !== previousDate

        const dateId = `date-${currentDate}`

        return (
          <Fragment key={event.id}>
            {showDateSeparator && currentDate && (
              <div
                id={dateId}
                className="md:col-span-2 bg-[#1E3A5F] rounded-3xl flex flex-col items-start text-white sticky top-[48px] z-20 overflow-hidden relative"
                style={{ minHeight: showFilterTray && index === 0 ? 'auto' : '5rem' }}
              >
                {/* Date separator content */}
                <div className="w-full h-20 flex flex-col justify-end items-start px-4 pb-3 relative">
                  {/* Crown icon watermark */}
                  <svg
                    className="absolute right-4 bottom-3 w-9 h-9 opacity-20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                  </svg>
                  <div className="text-xl font-semibold">
                    {formatDateSeparator(currentDate).monthDay}, {formatDateSeparator(currentDate).dayOfWeek}
                  </div>
                </div>

                {/* Filter tray in first sticky header only */}
                {showFilterTray && index === 0 && (
                  <div className="w-full px-4 pb-4">
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
                    />
                  </div>
                )}
              </div>
            )}
            <EventCard
              event={event}
              isFavorite={favorites.includes(event.id)}
              onToggleFavorite={() => toggleFavorite(event.id)}
              onHide={() => toggleHidden(event)}
            />
          </Fragment>
        )
      })}
    </div>
  )
}

export default EventList
