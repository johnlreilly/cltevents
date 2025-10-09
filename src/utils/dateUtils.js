/**
 * Date utility functions for formatting and manipulating event dates
 * @module utils/dateUtils
 */

/**
 * Formats a date string for display
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {string} Formatted date (e.g., "Fri, Dec 15")
 * @example
 * formatDate('2024-12-15') // Returns "Fri, Dec 15"
 */
export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/**
 * Formats a time string for display
 * @param {string} timeStr - Time string (e.g., "19:00:00" or "7:00 PM")
 * @returns {string|null} Formatted time (e.g., "7:00 PM") or null if invalid
 * @example
 * formatTime('19:00:00') // Returns "7:00 PM"
 * formatTime('Invalid') // Returns null
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return null

  // If already in 12-hour format, return as-is
  if (timeStr.match(/\d{1,2}:\d{2}\s?[AP]M/i)) {
    return timeStr
  }

  // Try to parse 24-hour format
  const match = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (!match) return null

  let hours = parseInt(match[1])
  const minutes = match[2]
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12

  return `${hours}:${minutes} ${ampm}`
}

/**
 * Formats date for separator headers
 * @param {Date} date - Date object
 * @returns {{monthDay: string, dayOfWeek: string}} Formatted date parts
 * @example
 * formatDateSeparator(new Date('2024-12-15'))
 * // Returns { monthDay: 'December 15', dayOfWeek: 'Friday' }
 */
export const formatDateSeparator = (date) => {
  return {
    monthDay: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
    dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
  }
}

/**
 * Gets today's date as YYYY-MM-DD string
 * @returns {string} Today's date in ISO format
 * @example
 * getToday() // Returns "2024-12-15"
 */
export const getToday = () => {
  return new Date().toISOString().split('T')[0]
}

/**
 * Parses a date string and returns a Date object
 * @param {string} dateStr - Date string in various formats
 * @returns {Date} Date object
 * @example
 * parseDate('2024-12-15') // Returns Date object for Dec 15, 2024
 */
export const parseDate = (dateStr) => {
  return new Date(dateStr)
}

/**
 * Compares two dates for sorting
 * @param {string} dateA - First date string
 * @param {string} dateB - Second date string
 * @returns {number} Negative if dateA < dateB, positive if dateA > dateB, 0 if equal
 * @example
 * compareDates('2024-12-15', '2024-12-16') // Returns negative number
 */
export const compareDates = (dateA, dateB) => {
  return new Date(dateA) - new Date(dateB)
}

/**
 * Checks if a date is in the past
 * @param {string} dateStr - Date string to check
 * @returns {boolean} True if date is in the past
 * @example
 * isDateInPast('2020-01-01') // Returns true
 */
export const isDateInPast = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Checks if a date is today
 * @param {string} dateStr - Date string to check
 * @returns {boolean} True if date is today
 * @example
 * isToday('2024-12-15') // Returns true if today is Dec 15, 2024
 */
export const isToday = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}
