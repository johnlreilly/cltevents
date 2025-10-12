/**
 * Image detection utilities for identifying placeholder images
 * @module utils/imageDetection
 */

/**
 * Known placeholder image patterns from various sources
 */
const PLACEHOLDER_PATTERNS = [
  // Ticketmaster placeholders - they have consistent hash patterns
  /\/dam\/[a-z]\/[a-z0-9]{3}\/[a-f0-9-]{36}_\d+_/i,

  // Common Ticketmaster placeholder identifiers
  /a6653880-7899-4f67-8067-1f95f4d158cf/i, // The specific one from your example

  // Generic placeholder patterns
  /placeholder/i,
  /default[-_]image/i,
  /no[-_]image/i,
  /generic[-_]image/i,
]

/**
 * Checks if an image URL is a placeholder image
 * @param {string} imageUrl - The URL of the image to check
 * @returns {boolean} True if the image is likely a placeholder
 * @example
 * isPlaceholderImage('https://s1.ticketm.net/dam/c/8cf/a6653880-7899-4f67-8067-1f95f4d158cf_124761_TABLET_LANDSCAPE_LARGE_16_9.jpg')
 * // Returns true
 */
export const isPlaceholderImage = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false
  }

  // Check against known placeholder patterns
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(imageUrl))
}

/**
 * Analyzes an image to detect if it's a generic/placeholder image
 * Uses image content analysis (dominant color, variance)
 * @param {HTMLImageElement} img - The loaded image element
 * @returns {Object} Analysis result with isPlaceholder flag and confidence
 */
export const analyzeImageContent = (img) => {
  try {
    // Create a canvas to analyze the image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Use a small sample size for performance
    const sampleSize = 50
    canvas.width = sampleSize
    canvas.height = sampleSize

    // Draw scaled-down version
    ctx.drawImage(img, 0, 0, sampleSize, sampleSize)

    // Get image data
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize)
    const data = imageData.data

    // Calculate color variance and dominant colors
    let totalR = 0, totalG = 0, totalB = 0
    let variance = 0
    const pixelCount = data.length / 4

    // First pass: calculate averages
    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i]
      totalG += data[i + 1]
      totalB += data[i + 2]
    }

    const avgR = totalR / pixelCount
    const avgG = totalG / pixelCount
    const avgB = totalB / pixelCount

    // Second pass: calculate variance
    for (let i = 0; i < data.length; i += 4) {
      const diffR = data[i] - avgR
      const diffG = data[i + 1] - avgG
      const diffB = data[i + 2] - avgB
      variance += (diffR * diffR + diffG * diffG + diffB * diffB) / 3
    }

    variance = variance / pixelCount

    // Low variance suggests a placeholder (solid color or gradient)
    const isLowVariance = variance < 100

    // Very dark or very light images are often placeholders
    const brightness = (avgR + avgG + avgB) / 3
    const isTooUniform = brightness < 30 || brightness > 225

    const isPlaceholder = isLowVariance && isTooUniform

    return {
      isPlaceholder,
      variance,
      brightness,
      confidence: isPlaceholder ? 0.8 : 0.2
    }
  } catch (error) {
    console.warn('Error analyzing image content:', error)
    return {
      isPlaceholder: false,
      confidence: 0
    }
  }
}

/**
 * Gets the appropriate height class for an image
 * @param {string} imageUrl - The image URL
 * @param {boolean} contentAnalysisResult - Optional result from analyzeImageContent
 * @returns {string} Tailwind height class
 */
export const getImageHeightClass = (imageUrl, contentAnalysisResult = null) => {
  // Check URL patterns first (fast)
  const isUrlPlaceholder = isPlaceholderImage(imageUrl)

  // Check content analysis if available
  const isContentPlaceholder = contentAnalysisResult?.isPlaceholder || false

  // If either check indicates placeholder, use reduced height
  if (isUrlPlaceholder || isContentPlaceholder) {
    return 'h-[10vh]' // 50% of normal 20vh
  }

  return 'h-[20vh]' // Normal height
}
