/**
 * EventCard component
 * Displays an individual event with name, venue, and date
 */

/**
 * EventCard Component
 * @param {Object} props - Component props
 * @param {Object} props.event - Event data object
 * @param {string} props.event.id - Unique event ID
 * @param {string} props.event.name - Event name
 * @param {string} props.event.venue - Venue name
 * @param {Array} props.event.dates - Array of date objects
 * @returns {JSX.Element} The event card component
 */
function EventCard({ event }) {
  return (
    <div className="bg-surface rounded-3xl border border-outlinevariant overflow-hidden hover:shadow-lg transition-all p-5">
      <h3 className="text-xl font-semibold text-onsurface mb-1">{event.name}</h3>
      <p className="text-sm text-onsurfacevariant">{event.venue}</p>
      {event.dates && event.dates.length > 0 && (
        <p className="text-sm text-onsurfacevariant mt-2">
          {new Date(event.dates[0].date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}
    </div>
  )
}

export default EventCard
