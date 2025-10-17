/**
 * Event utility functions for processing, sorting, and filtering events
 * @module utils/eventUtils
 */

/**
 * Converts all-caps strings to title case
 * @param {string} str - String to convert
 * @returns {string} Title-cased string
 * @example
 * toTitleCase('HELLO WORLD') // Returns "Hello World"
 * toTitleCase('Hello World') // Returns "Hello World" (unchanged)
 */
export const toTitleCase = (str) => {
  // Check if string is all caps (more than 3 consecutive uppercase letters)
  if (/[A-Z]{4,}/.test(str)) {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
  }
  return str
}

/**
 * Groups events by name, combining multiple dates
 * Events with same name (ignoring parentheses and text after hyphen) are combined
 * @param {Array} events - Array of event objects
 * @returns {Array} Grouped events with dates array
 * @example
 * groupEventsByName([
 *   { name: 'Concert (Night 1)', date: '2024-12-15' },
 *   { name: 'Concert (Night 2)', date: '2024-12-16' },
 *   { name: 'Nourished by Time - The Passionate Ones Tour', date: '2024-12-20' },
 *   { name: 'Nourished by Time', date: '2024-12-20' }
 * ])
 * // Returns [{ name: 'Concert', dates: [...]}, { name: 'Nourished by Time', dates: [...]}]
 */
export const groupEventsByName = (events) => {
  const grouped = {}

  events.forEach((event) => {
    if (!event || !event.name || !event.date) return

    // Remove text in parentheses and normalize for grouping
    let baseName = event.name.replace(/\s*\([^)]*\)/g, '').trim()

    // Extract text before hyphen for duplicate detection
    // This treats "Artist - Tour Name" and "Artist" as the same event
    const hyphenIndex = baseName.indexOf(' - ')
    const keyName = hyphenIndex > 0 ? baseName.substring(0, hyphenIndex).trim() : baseName

    // Create grouping key with date to ensure same event on same date is deduplicated
    const key = `${keyName.toLowerCase()}|${event.date}`

    if (!grouped[key]) {
      grouped[key] = {
        ...event,
        name: keyName, // Use name before hyphen as the canonical name
        dates: [{ date: event.date, id: event.id, ticketUrl: event.ticketUrl }],
      }
    } else {
      // Event already exists for this date, skip adding duplicate date
      // But keep the first occurrence's data
    }
  })

  // Now group by name only (without date) to combine multiple dates
  const finalGrouped = {}
  Object.values(grouped).forEach((event) => {
    const nameKey = event.name.toLowerCase()

    if (!finalGrouped[nameKey]) {
      finalGrouped[nameKey] = event
    } else {
      // Merge dates from duplicate events
      finalGrouped[nameKey].dates.push(...event.dates)
    }
  })

  return Object.values(finalGrouped).map((event) => ({
    ...event,
    dates: event.dates.sort((a, b) => new Date(a.date) - new Date(b.date)),
  }))
}

/**
 * Sorts events by date or match score
 * @param {Array} events - Array of event objects
 * @param {string} sortBy - Sort method: 'date' or 'match'
 * @param {Array} preferredVenues - List of preferred venue names
 * @returns {Array} Sorted events
 * @example
 * sortEvents(events, 'date', ['The Fillmore'])
 */
export const sortEvents = (events, sortBy = 'date', preferredVenues = []) => {
  return [...events].sort((a, b) => {
    if (sortBy === 'date') {
      const dateCompare = new Date(a.dates[0].date) - new Date(b.dates[0].date)
      if (dateCompare !== 0) return dateCompare

      const aVenueBoost = preferredVenues.some((v) => a.venue.toLowerCase().includes(v)) ? 10 : 0
      const bVenueBoost = preferredVenues.some((v) => b.venue.toLowerCase().includes(v)) ? 10 : 0
      const aScore = (a.matchScore || 0) + aVenueBoost
      const bScore = (b.matchScore || 0) + bVenueBoost
      return bScore - aScore
    } else {
      const aVenueBoost = preferredVenues.some((v) => a.venue.toLowerCase().includes(v)) ? 10 : 0
      const bVenueBoost = preferredVenues.some((v) => b.venue.toLowerCase().includes(v)) ? 10 : 0
      const aScore = (a.matchScore || 0) + aVenueBoost
      const bScore = (b.matchScore || 0) + bVenueBoost
      return bScore - aScore
    }
  })
}

/**
 * Checks if event description is useful (not just venue or name repeat)
 * @param {Object} event - Event object
 * @returns {boolean} True if description adds value
 * @example
 * hasUsefulDescription({ name: 'Concert', description: 'Concert', venue: 'Venue' })
 * // Returns false (description just repeats name)
 */
export const hasUsefulDescription = (event) => {
  if (!event.description) return false
  const desc = event.description.trim().toLowerCase()
  // Normalize name by removing parentheses
  const name = event.name.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase()
  const venue = event.venue.trim().toLowerCase()

  // Hide if description is the same as the normalized event name
  if (desc === name) return false

  // Hide if description only contains venue information
  if (desc === venue || (desc.includes(venue) && desc.length < venue.length + 20)) return false

  return true
}

/**
 * Checks if venue is in preferred list
 * @param {string} venue - Venue name
 * @param {Array} preferredVenues - List of preferred venue keywords
 * @returns {boolean} True if venue matches preferred list
 * @example
 * isPreferredVenue('The Fillmore Charlotte', ['fillmore'])
 * // Returns true
 */
export const isPreferredVenue = (venue, preferredVenues = []) => {
  return preferredVenues.some((v) => venue.toLowerCase().includes(v.toLowerCase()))
}

/**
 * Gets match score color classes based on score
 * @param {number} score - Match score (0-100)
 * @returns {string} Tailwind CSS classes for color
 * @example
 * getMatchColor(90) // Returns 'text-green-600 bg-green-50'
 */
export const getMatchColor = (score) => {
  if (score >= 85) return 'text-green-600 bg-green-50'
  if (score >= 70) return 'text-blue-600 bg-blue-50'
  return 'text-gray-600 bg-gray-50'
}

/**
 * Extracts unique genres from events
 * @param {Array} events - Array of event objects
 * @returns {Array} Sorted array of unique genres
 * @example
 * extractGenres([
 *   { genres: ['Rock', 'Pop'] },
 *   { genres: ['Rock', 'Jazz'] }
 * ])
 * // Returns ['Jazz', 'Pop', 'Rock']
 */
export const extractGenres = (events) => {
  const genreSet = new Set()
  events.forEach((event) => {
    if (event.genres && Array.isArray(event.genres)) {
      event.genres.forEach((genre) => genreSet.add(genre))
    }
  })
  return Array.from(genreSet).sort()
}

/**
 * Normalizes event name for consistent hiding/filtering
 * Uses the same logic as groupEventsByName to ensure consistency
 * @param {string} name - Event name to normalize
 * @returns {string} Normalized lowercase name
 */
const normalizeEventName = (name) => {
  // Remove text in parentheses
  let baseName = name.replace(/\s*\([^)]*\)/g, '').trim()
  // Remove text after hyphen (tour names, etc)
  const hyphenIndex = baseName.indexOf(' - ')
  const keyName = hyphenIndex > 0 ? baseName.substring(0, hyphenIndex).trim() : baseName
  return keyName.toLowerCase().trim()
}

/**
 * Filters events based on category
 * @param {Array} events - Array of event objects
 * @param {string} category - Category to filter by
 * @param {Array} favorites - List of favorite event IDs
 * @param {Array} hidden - List of hidden event names (normalized)
 * @param {Array} preferredVenues - Dive bar venue keywords
 * @returns {Array} Filtered events
 * @example
 * filterByCategory(events, 'favorites', [1, 2, 3], [], [])
 */
export const filterByCategory = (events, category, favorites = [], hidden = [], preferredVenues = []) => {
  switch (category) {
    case 'all':
      return events.filter((e) => !hidden.includes(normalizeEventName(e.name)))
    case 'favorites':
      return events.filter((e) => favorites.includes(e.id))
    case 'divebars':
      return events.filter((e) => isPreferredVenue(e.venue, preferredVenues))
    case 'music':
      return events.filter(
        (e) =>
          e.genres &&
          e.genres.length > 0 &&
          !hidden.includes(normalizeEventName(e.name))
      )
    case 'sports':
      return events.filter(
        (e) =>
          (!e.genres || e.genres.length === 0) &&
          !hidden.includes(normalizeEventName(e.name))
      )
    case 'food':
      return events.filter(
        (e) =>
          e.name.toLowerCase().includes('food') ||
          e.name.toLowerCase().includes('wine') ||
          e.name.toLowerCase().includes('beer')
      )
    case 'hidden':
      return events.filter((e) => hidden.includes(normalizeEventName(e.name)))
    default:
      return events
  }
}

/**
 * Filters events by genre
 * @param {Array} events - Array of event objects
 * @param {Array} selectedGenres - Selected genres to filter by
 * @returns {Array} Filtered events
 * @example
 * filterByGenre(events, ['Rock', 'Jazz'])
 */
export const filterByGenre = (events, selectedGenres = []) => {
  if (selectedGenres.length === 0) return events
  return events.filter((e) =>
    e.genres && e.genres.some((genre) => selectedGenres.includes(genre))
  )
}

/**
 * Filters events by source
 * @param {Array} events - Array of event objects
 * @param {Array} selectedSources - Selected sources to filter by
 * @returns {Array} Filtered events
 * @example
 * filterBySource(events, ['ticketmaster', 'smokeyjoes'])
 */
export const filterBySource = (events, selectedSources = []) => {
  if (selectedSources.length === 0) return events
  return events.filter((e) => selectedSources.includes(e.source))
}

/**
 * Creates an ICS calendar file content for an event
 * @param {Object} event - Event object
 * @returns {string} ICS file content
 * @example
 * const icsContent = createCalendarEvent(event)
 * // Download as .ics file
 */
export const createCalendarEvent = (event) => {
  const startDate = new Date(event.dates[0].date)
  const endDate = new Date(startDate)
  endDate.setHours(endDate.getHours() + 3) // Default 3-hour duration

  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${event.name}
LOCATION:${event.venue}
DESCRIPTION:${event.description || event.name}
URL:${event.ticketUrl || event.dates[0].ticketUrl || ''}
END:VEVENT
END:VCALENDAR`
}
