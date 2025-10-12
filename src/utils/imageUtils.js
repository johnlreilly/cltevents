/**
 * Image utility functions for smart cropping
 * Uses opencv.js for face detection combined with smartcrop.js
 * @module utils/imageUtils
 */

import smartcrop from 'smartcrop'

// OpenCV.js will be loaded dynamically
let cv = null
let cvReady = false

/**
 * Loads OpenCV.js dynamically
 * @returns {Promise} Resolves when OpenCV is ready
 */
const loadOpenCV = () => {
  return new Promise((resolve, reject) => {
    if (cvReady && cv) {
      resolve(cv)
      return
    }

    // Check if already loaded globally
    if (window.cv && window.cv.Mat) {
      cv = window.cv
      cvReady = true
      resolve(cv)
      return
    }

    // Load OpenCV.js script
    const script = document.createElement('script')
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js'
    script.async = true

    script.onload = () => {
      // Wait for OpenCV to be ready
      const checkCV = setInterval(() => {
        if (window.cv && window.cv.Mat) {
          clearInterval(checkCV)
          cv = window.cv
          cvReady = true
          console.log('OpenCV.js loaded successfully')
          resolve(cv)
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkCV)
        if (!cvReady) {
          reject(new Error('OpenCV.js loading timeout'))
        }
      }, 10000)
    }

    script.onerror = () => {
      reject(new Error('Failed to load OpenCV.js'))
    }

    document.head.appendChild(script)
  })
}

/**
 * Detects faces in an image using OpenCV.js
 * @param {HTMLImageElement} img - Image element to analyze
 * @returns {Promise<Array>} Array of face rectangles {x, y, width, height}
 */
const detectFaces = async (img) => {
  try {
    const cvLib = await loadOpenCV()

    // Create canvas and draw image
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    // Convert to OpenCV Mat
    const src = cvLib.imread(canvas)
    const gray = new cvLib.Mat()
    cvLib.cvtColor(src, gray, cvLib.COLOR_RGBA2GRAY, 0)

    // Load face cascade classifier
    const faceCascade = new cvLib.CascadeClassifier()

    // Try to load the classifier - using Haar Cascade
    // Note: This may not work in all browsers due to CORS
    // We'll handle the fallback gracefully
    const faces = new cvLib.RectVector()

    try {
      faceCascade.load('haarcascade_frontalface_default.xml')
      faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0)
    } catch (e) {
      console.warn('OpenCV face detection not available, will use smartcrop only:', e)
    }

    // Convert to array of rectangles
    const faceArray = []
    for (let i = 0; i < faces.size(); i++) {
      const face = faces.get(i)
      faceArray.push({
        x: face.x,
        y: face.y,
        width: face.width,
        height: face.height
      })
    }

    // Clean up
    src.delete()
    gray.delete()
    faces.delete()
    faceCascade.delete()

    return faceArray
  } catch (error) {
    console.warn('Face detection error, falling back to smartcrop:', error)
    return []
  }
}

/**
 * Analyzes an image and determines the best crop position
 * Uses OpenCV for face detection, then applies smartcrop with face boost
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

    // Try to detect faces with OpenCV
    const faces = await detectFaces(img)

    // Configure smartcrop options
    const options = {
      width,
      height,
      // Boost importance of detected faces
      boost: faces.length > 0 ? faces.map(face => ({
        x: face.x,
        y: face.y,
        width: face.width,
        height: face.height,
        weight: 1.5 // Higher weight for faces
      })) : undefined
    }

    // Analyze the image with smartcrop
    const result = await smartcrop.crop(img, options)

    // Add face detection info to result
    result.facesDetected = faces.length

    if (faces.length > 0) {
      console.log(`Detected ${faces.length} face(s) in image, using face-aware crop`)
    }

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
      },
      facesDetected: 0
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
