/**
 * Text substitution utilities for normalizing event and venue names
 * @module utils/textSubstitutions
 */

import substitutionConfig from '../data/substitutionText.json'

/**
 * Applies configured text substitutions to a given string
 * Performs case-insensitive replacement while preserving the replacement's casing
 *
 * @param {string} text - The text to apply substitutions to
 * @returns {string} Text with substitutions applied
 *
 * @example
 * applyTextSubstitutions('Come see Cltfc play!')
 * // Returns: 'Come see Charlotte FC play!'
 *
 * applyTextSubstitutions('CLTFC vs Atlanta')
 * // Returns: 'Charlotte FC vs Atlanta'
 */
export function applyTextSubstitutions(text) {
  if (!text || typeof text !== 'string') {
    return text
  }

  let result = text

  // Apply each substitution from config
  substitutionConfig.substitutions.forEach(({ pattern, replacement }) => {
    // Create case-insensitive regex that matches whole words or parts of words
    // Use word boundary when pattern is a complete word, otherwise match anywhere
    const hasWordBoundary = /^[a-zA-Z]/.test(pattern) && /[a-zA-Z]$/.test(pattern)
    const regexPattern = hasWordBoundary
      ? `\\b${escapeRegex(pattern)}\\b`
      : escapeRegex(pattern)

    const regex = new RegExp(regexPattern, 'gi')
    result = result.replace(regex, replacement)
  })

  return result
}

/**
 * Escapes special regex characters in a string
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for use in RegExp
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Applies substitutions to event object fields
 * @param {Object} event - Event object
 * @returns {Object} Event object with substitutions applied to name, venue, and description
 */
export function applyEventSubstitutions(event) {
  if (!event) return event

  return {
    ...event,
    name: applyTextSubstitutions(event.name),
    venue: event.venue ? applyTextSubstitutions(event.venue) : event.venue,
    description: event.description ? applyTextSubstitutions(event.description) : event.description,
    // Also apply to location object if present
    location: event.location ? {
      ...event.location,
      name: event.location.name ? applyTextSubstitutions(event.location.name) : event.location.name,
    } : event.location,
  }
}

/**
 * Gets all configured substitutions
 * @returns {Array} Array of substitution objects
 */
export function getSubstitutions() {
  return substitutionConfig.substitutions
}
