/**
 * Image utility functions for smart cropping
 * Uses smartcrop.js to find optimal crop positions focusing on faces
 * @module utils/imageUtils
 */

import smartcrop from 'smartcrop'

/**
 * Analyzes an image and determines the best crop position
 * Prioritizes faces and important features
 * @param {string} imageUrl - URL of the image to analyze
 * @param {number} width - Desired crop width
 * @param {number} height - Desired crop height
 * @returns {Promise<Object>} Crop data with topCrop containing {x, y, width, height}
 * @example
 * const crop = await getSmartCrop(imageUrl, 800, 400)
 * console.log(crop.topCrop) // {x: 100, y: 50, width: 800, height: 400}
 */
export const getSmartCrop = async (imageUrl, width, height) => {
  try {
    // Create an image element
    const img = new Image()
    img.crossOrigin = 'anonymous'

    // Load the image
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })

    // Analyze the image with smartcrop
    const result = await smartcrop.crop(img, { width, height })
    return result
  } catch (error) {
    console.error('Error in smart crop:', error)
    // Return a centered crop as fallback
    return {
      topCrop: {
        x: 0,
        y: 0,
        width: width,
        height: height
      }
    }
  }
}

/**
 * Calculates CSS object-position based on smart crop result
 * @param {Object} cropData - Result from getSmartCrop
 * @param {number} imageWidth - Original image width
 * @param {number} imageHeight - Original image height
 * @returns {string} CSS object-position value (e.g., "25% 50%")
 * @example
 * const position = getObjectPosition(cropData, 1200, 800)
 * // Returns something like "30% 40%"
 */
export const getObjectPosition = (cropData, imageWidth, imageHeight) => {
  if (!cropData || !cropData.topCrop) {
    return 'center center'
  }

  const crop = cropData.topCrop

  // Calculate the center of the crop area
  const centerX = crop.x + (crop.width / 2)
  const centerY = crop.y + (crop.height / 2)

  // Convert to percentages
  const xPercent = (centerX / imageWidth) * 100
  const yPercent = (centerY / imageHeight) * 100

  return `${xPercent.toFixed(1)}% ${yPercent.toFixed(1)}%`
}

/**
 * Cache for smart crop results to avoid re-analyzing the same images
 */
const cropCache = new Map()

/**
 * Gets smart crop with caching
 * @param {string} imageUrl - URL of the image
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @returns {Promise<Object>} Cached or fresh crop data
 */
export const getCachedSmartCrop = async (imageUrl, width, height) => {
  const cacheKey = `${imageUrl}-${width}-${height}`

  if (cropCache.has(cacheKey)) {
    return cropCache.get(cacheKey)
  }

  const cropData = await getSmartCrop(imageUrl, width, height)
  cropCache.set(cacheKey, cropData)

  return cropData
}

/**
 * Clears the crop cache
 * Useful for memory management if the cache gets too large
 */
export const clearCropCache = () => {
  cropCache.clear()
}
