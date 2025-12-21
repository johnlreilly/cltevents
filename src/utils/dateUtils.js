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
  // Parse date in local timezone to avoid timezone offset issues
  // "2024-12-15" should be Dec 15 regardless of timezone
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
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
 * Parses a date string and returns a Date object in local timezone
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} Date object
 * @example
 * parseDate('2024-12-15') // Returns Date object for Dec 15, 2024 in local timezone
 */
export const parseDate = (dateStr) => {
  // Parse date in local timezone to avoid UTC conversion issues
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
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
  return parseDate(dateA) - parseDate(dateB)
}

/**
 * Checks if a date is in the past
 * @param {string} dateStr - Date string to check
 * @returns {boolean} True if date is in the past
 * @example
 * isDateInPast('2020-01-01') // Returns true
 */
export const isDateInPast = (dateStr) => {
  const date = parseDate(dateStr)
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
  const date = parseDate(dateStr)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Categorizes an event time as 'day' or 'night'
 * Day: 6 AM - 6 PM (06:00 - 18:00)
 * Night: 6 PM - 2 AM (18:00 - 02:00 next day)
 * @param {string} timeStr - Time string (e.g., "7:00 PM" or "19:00")
 * @returns {string|null} 'day', 'night', or null if no time
 * @example
 * categorizeEventTime('7:00 PM') // Returns 'night'
 * categorizeEventTime('2:00 PM') // Returns 'day'
 * categorizeEventTime(null) // Returns null
 */
export const categorizeEventTime = (timeStr) => {
  if (!timeStr) return null

  // Parse time to 24-hour format
  let hours
  if (timeStr.match(/\d{1,2}:\d{2}\s?[AP]M/i)) {
    // 12-hour format
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s?([AP]M)/i)
    if (!match) return null
    hours = parseInt(match[1])
    const period = match[3].toUpperCase()
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
  } else {
    // 24-hour format
    const match = timeStr.match(/(\d{1,2}):(\d{2})/)
    if (!match) return null
    hours = parseInt(match[1])
  }

  // Day: 6 AM to 6 PM (6-17)
  // Night: 6 PM to 2 AM (18-23, 0-1)
  if (hours >= 6 && hours < 18) return 'day'
  if (hours >= 18 || hours < 2) return 'night'

  // 2 AM - 6 AM: unclear, return null (show in both)
  return null
}

/**
 * Determines current mode based on device time
 * @returns {string} 'day' or 'night'
 * @example
 * getCurrentMode() // Returns 'day' if current time is 10 AM, 'night' if 9 PM
 */
export const getCurrentMode = () => {
  const now = new Date()
  const hours = now.getHours()

  // Day mode: 6 AM - 6 PM (6-17)
  // Night mode: 6 PM - 6 AM (18-23, 0-5)
  return (hours >= 6 && hours < 18) ? 'day' : 'night'
}
