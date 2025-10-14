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
  const [sportsTeams, setSportsTeams] = useState([])

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

  // Load sports teams configuration
  useEffect(() => {
    fetch('/data/sportsTeams.json')
      .then((res) => res.json())
      .then((data) => {
        setSportsTeams(data.teams || [])
      })
      .catch((err) => console.error('Error loading sports teams:', err))
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

  // Get all dates that have events
  const eventDates = new Set(events.map(event => event.dates[0]?.date).filter(Boolean))

  // Get today's date at midnight for comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  // Find special dates that don't have events, are within 30 days, and should be shown
  const specialDatesWithoutEvents = Object.keys(specialDates).filter(date => {
    if (eventDates.has(date)) return false

    const specialDate = new Date(date)
    specialDate.setHours(0, 0, 0, 0)

    // Only show special dates within 30 days from today
    return specialDate >= today && specialDate <= thirtyDaysFromNow
  })

  // Create an array of items to render (events + special dates without events)
  const renderItems = []
  let previousDate = null

  events.forEach((event, index) => {
    const currentDate = event.dates[0]?.date

    // Check if we need to insert any special dates before this event
    if (currentDate) {
      specialDatesWithoutEvents.forEach(specialDateStr => {
        // Only add if it's between previousDate and currentDate
        if ((!previousDate || specialDateStr > previousDate) && specialDateStr < currentDate) {
          renderItems.push({
            type: 'special-date-only',
            date: specialDateStr,
            specialDate: specialDates[specialDateStr]
          })
        }
      })
    }

    // Add the event with its date separator
    const showDateSeparator = currentDate !== previousDate
    renderItems.push({
      type: 'event',
      event,
      date: currentDate,
      showDateSeparator,
      specialDate: currentDate ? specialDates[currentDate] : null
    })

    previousDate = currentDate
  })

  // Add any special dates after the last event
  specialDatesWithoutEvents.forEach(specialDateStr => {
    if (!previousDate || specialDateStr > previousDate) {
      renderItems.push({
        type: 'special-date-only',
        date: specialDateStr,
        specialDate: specialDates[specialDateStr]
      })
    }
  })

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {renderItems.map((item, index) => {
        if (item.type === 'special-date-only') {
          // Render just the special date card
          const dateId = `date-${item.date}`
          const backgroundColor = item.specialDate?.backgroundColor || '#1E3A5F'
          const textColor = item.specialDate?.textColor || '#FFFFFF'
          const icon = item.specialDate?.icon ? getIcon(item.specialDate.icon) : getIcon('crown')

          return (
            <div
              key={dateId}
              id={dateId}
              className="md:col-span-2 rounded-3xl flex flex-col items-start sticky top-[48px] z-20 overflow-hidden relative h-20"
              style={{ backgroundColor, color: textColor }}
            >
              <div className="w-full h-full flex flex-col justify-end items-start px-4 pb-3 relative">
                <div className="absolute right-4 bottom-3 opacity-20">
                  {icon}
                </div>
                <div className="text-xl font-semibold">
                  {formatDateSeparator(item.date).monthDay}, {formatDateSeparator(item.date).dayOfWeek}
                  {item.specialDate && (
                    <span className="ml-2 text-sm opacity-80">• {item.specialDate.name}</span>
                  )}
                </div>
              </div>
            </div>
          )
        } else {
          // Render event with its date separator
          const event = item.event
          const currentDate = item.date
          const dateId = `date-${currentDate}`
          const backgroundColor = item.specialDate?.backgroundColor || '#1E3A5F'
          const textColor = item.specialDate?.textColor || '#FFFFFF'
          const icon = item.specialDate?.icon ? getIcon(item.specialDate.icon) : getIcon('crown')

          return (
            <Fragment key={event.id}>
              {item.showDateSeparator && currentDate && (
                <div
                  id={dateId}
                  className="md:col-span-2 rounded-3xl flex flex-col items-start sticky top-[48px] z-20 overflow-hidden relative h-20"
                  style={{ backgroundColor, color: textColor }}
                >
                  <div className="w-full h-full flex flex-col justify-end items-start px-4 pb-3 relative">
                    <div className="absolute right-4 bottom-3 opacity-20">
                      {icon}
                    </div>
                    <div className="text-xl font-semibold">
                      {formatDateSeparator(currentDate).monthDay}, {formatDateSeparator(currentDate).dayOfWeek}
                      {item.specialDate && (
                        <span className="ml-2 text-sm opacity-80">• {item.specialDate.name}</span>
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
                sportsTeams={sportsTeams}
              />
            </Fragment>
          )
        }
      })}
    </div>
  )
}

export default EventList
