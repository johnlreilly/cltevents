/**
 * YouTube utility functions for parsing URLs and cleaning titles
 * @module utils/youtubeUtils
 */

/**
 * Cleans YouTube video title by removing common noise
 * @param {string} title - Raw YouTube video title
 * @returns {string} Cleaned title
 * @example
 * cleanYouTubeTitle('Band Name - Song (Official Video)')
 * // Returns "Band Name - Song"
 */
export const cleanYouTubeTitle = (title) => {
  // Create a temporary element to decode HTML entities
  const textarea = document.createElement('textarea')
  textarea.innerHTML = title
  let cleaned = textarea.value

  // Remove common YouTube noise
  cleaned = cleaned
    .replace(/\s*\(Official.*?\)/gi, '') // Remove (Official Video), (Official Audio), etc.
    .replace(/\s*\[Official.*?\]/gi, '') // Remove [Official Video], etc.
    .replace(/\s*-\s*Official.*$/gi, '') // Remove - Official Video at end
    .replace(/\s*\|\s*Official.*$/gi, '') // Remove | Official Video at end
    .replace(/\s+LIVE\s+AT\s+.*$/gi, '') // Remove LIVE AT VENUE
    .replace(/\s+at\s+.*(tavern|bar|venue|club|theater|hall).*$/gi, '') // Clean venue names at end
    .trim()

  return cleaned
}

/**
 * Extracts video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if invalid
 * @example
 * extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
 * // Returns "dQw4w9WgXcQ"
 *
 * extractVideoId('https://youtu.be/dQw4w9WgXcQ')
 * // Returns "dQw4w9WgXcQ"
 */
export const extractVideoId = (url) => {
  if (!url) return null

  // Handle youtube.com/watch?v= format
  if (url.includes('v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0]
    return videoId && videoId.length >= 5 ? videoId : null
  }

  // Handle youtu.be/ format
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    return videoId && videoId.length >= 5 ? videoId : null
  }

  return null
}

/**
 * Validates if a YouTube video ID is properly formatted
 * @param {string} videoId - YouTube video ID to validate
 * @returns {boolean} True if valid
 * @example
 * isValidVideoId('dQw4w9WgXcQ') // Returns true
 * isValidVideoId('abc') // Returns false (too short)
 */
export const isValidVideoId = (videoId) => {
  return videoId && typeof videoId === 'string' && videoId.length >= 5
}

/**
 * Creates YouTube embed URL from video ID
 * @param {string} videoId - YouTube video ID
 * @param {boolean} autoplay - Whether to autoplay video
 * @returns {string} YouTube embed URL
 * @example
 * createEmbedUrl('dQw4w9WgXcQ', true)
 * // Returns "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
 */
export const createEmbedUrl = (videoId, autoplay = false) => {
  const autoplayParam = autoplay ? '?autoplay=1' : ''
  return `https://www.youtube.com/embed/${videoId}${autoplayParam}`
}

/**
 * Fetches YouTube videos for an artist name
 * Uses caching to prevent redundant API calls
 * @param {string} artistName - Name of artist to search for
 * @param {Object} cache - Cache object to store results
 * @param {string} apiBaseUrl - Base URL for API calls (optional, defaults to empty string for relative URLs)
 * @returns {Promise<Array>} Array of video objects
 * @example
 * const cache = {}
 * const videos = await fetchYouTubeVideos('The Beatles', cache, 'https://clt.show')
 */
export const fetchYouTubeVideos = async (artistName, cache = {}, apiBaseUrl = '') => {
  const cacheKey = artistName.toLowerCase().trim()

  // Return cached results if available
  if (cache[cacheKey]) {
    console.log('Using cached YouTube results for', artistName)
    return cache[cacheKey]
  }

  try {
    const url = `${apiBaseUrl}/api/youtube?query=${encodeURIComponent(artistName)}`
    console.log(`Fetching YouTube videos from: ${url}`)

    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('YouTube API error:', response.status, errorData)
      cache[cacheKey] = []
      return []
    }

    const data = await response.json()
    console.log('YouTube API call for', artistName, ':', data.videos?.length || 0, 'videos')

    const videos = data.videos || []
    cache[cacheKey] = videos

    return videos
  } catch (error) {
    console.error('Error fetching YouTube videos for', artistName, ':', error)
    cache[cacheKey] = []
    return []
  }
}
