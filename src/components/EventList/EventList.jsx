/**
 * EventList component
 * Displays a list of events with date separators
 */

import { Fragment, useState, useEffect } from 'react'
import EventCard from '../EventCard/EventCard'
import { getIcon } from '../../utils/specialDateIcons'

/**
 * EventList Component
 * @param {Object} props - Component props
 * @param {Array} props.events - Array of event objects
 * @param {Array} props.favorites - Array of favorite event IDs
 * @param {Function} props.toggleFavorite - Function to toggle favorite status
 * @param {Array} props.hidden - Array of hidden event IDs
 * @param {Function} props.toggleHidden - Function to toggle hidden status
 * @returns {JSX.Element} The event list component
 */
function EventList({
  events,
  favorites,
  toggleFavorite,
  hidden,
  toggleHidden,
}) {
  const [specialDates, setSpecialDates] = useState({})

  // Load special dates configuration
  useEffect(() => {
    fetch('/data/specialDates.json')
      .then((res) => res.json())
      .then((data) => {
        // Convert array to map for quick lookup
        const datesMap = {}
        data.dates.forEach((specialDate) => {
          datesMap[specialDate.date] = specialDate
        })
        setSpecialDates(datesMap)
      })
      .catch((err) => console.error('Error loading special dates:', err))
  }, [])

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
        const specialDate = specialDates[currentDate]

        // Use special date styling or default styling
        const backgroundColor = specialDate?.backgroundColor || '#1E3A5F'
        const textColor = specialDate?.textColor || '#FFFFFF'
        const icon = specialDate?.icon ? getIcon(specialDate.icon) : getIcon('crown')

        return (
          <Fragment key={event.id}>
            {showDateSeparator && currentDate && (
              <div
                id={dateId}
                className="md:col-span-2 rounded-3xl flex flex-col items-start sticky top-[48px] z-20 overflow-hidden relative h-20"
                style={{ backgroundColor, color: textColor }}
              >
                {/* Date separator content */}
                <div className="w-full h-full flex flex-col justify-end items-start px-4 pb-3 relative">
                  {/* Icon watermark */}
                  <div className="absolute right-4 bottom-3 opacity-20">
                    {icon}
                  </div>
                  <div className="text-xl font-semibold">
                    {formatDateSeparator(currentDate).monthDay}, {formatDateSeparator(currentDate).dayOfWeek}
                    {specialDate && (
                      <span className="ml-2 text-sm opacity-80">• {specialDate.name}</span>
                    )}
                  </div>
                </div>
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
