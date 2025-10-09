/**
 * EventList component
 * Displays a list of events or a no events message
 */

import EventCard from '../EventCard/EventCard'

/**
 * EventList Component
 * @param {Object} props - Component props
 * @param {Array} props.events - Array of event objects
 * @returns {JSX.Element} The event list component
 */
function EventList({ events }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No events found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

export default EventList
