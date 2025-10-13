import { useState, useEffect } from 'react'
import { getCachedSmartCrop, getObjectPosition, clearCropCache } from '../../utils/imageUtils'

const testImages = [
  '/test-images/test-image-01.png',
  '/test-images/test-image-02.jpeg',
  '/test-images/test-image-03.png',
  '/test-images/test-image-04.png',
  '/test-images/test-image-05.png',
]

function ImageCropTest() {
  const [results, setResults] = useState([])

  useEffect(() => {
    const analyzeImages = async () => {
      // Clear cache to ensure fresh analysis
      clearCropCache()
      const analyzed = []

      for (const imageUrl of testImages) {
        try {
          console.log('Analyzing:', imageUrl)
          const containerWidth = 800
          const containerHeight = window.innerHeight * 0.2

          const cropData = await getCachedSmartCrop(imageUrl, containerWidth, containerHeight)
          console.log('Crop data received:', cropData)

          const img = new Image()

          await new Promise((resolve, reject) => {
            img.onload = () => {
              console.log('Image loaded:', imageUrl, 'Size:', img.width, 'x', img.height)
              const position = getObjectPosition(cropData, img.width, img.height)
              const centerY = cropData.topCrop.y + (cropData.topCrop.height / 2)
              const imageCenterY = img.height / 2

              // Calculate smartcrop's recommended position
              const cropCenterX = cropData.topCrop.x + (cropData.topCrop.width / 2)
              const cropCenterY = cropData.topCrop.y + (cropData.topCrop.height / 2)
              const xPercent = (cropCenterX / img.width) * 100
              const yPercent = (cropCenterY / img.height) * 100
              const smartcropPosition = `${xPercent.toFixed(1)}% ${yPercent.toFixed(1)}%`

              analyzed.push({
                url: imageUrl,
                position,
                smartcropPosition,
                cropData: cropData.topCrop,
                imageWidth: img.width,
                imageHeight: img.height,
                focusY: centerY,
                imageCenterY,
                isAboveCenter: centerY < imageCenterY,
              })
              console.log('Analysis complete for:', imageUrl, 'Position:', position)
              resolve()
            }
            img.onerror = (err) => {
              console.error('Image load error:', imageUrl, err)
              resolve() // Don't reject, just skip this image
            }
            img.src = imageUrl
          })
        } catch (error) {
          console.error('Error analyzing image:', imageUrl, error)
        }
      }

      console.log('All images analyzed:', analyzed.length)
      setResults(analyzed)
    }

    analyzeImages()
  }, [])

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-black">Smart Crop Test <span className="text-sm text-gray-500">(v5.0 - Smartcrop Positioning)</span></h1>

      {results.length === 0 && (
        <div className="text-black text-xl">Loading images... ({testImages.length} images)</div>
      )}

      {results.length > 0 && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded">
          <p className="text-black font-semibold">Using Smartcrop's Recommendation:</p>
          <p className="text-sm text-gray-700">Images are positioned based on smartcrop's analysis of faces, edges, and saturation.</p>
          <p className="text-sm text-gray-700 mt-2">Analyzed {results.length} images</p>
        </div>
      )}

      <div className="space-y-8">
        {results.map((result, idx) => (
          <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h2 className="text-xl font-semibold mb-2 text-black">
              Image {idx + 1}
            </h2>

            <div className="space-y-4 mb-4">
              {/* Original Image */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-black">Original</h3>
                <img
                  src={result.url}
                  alt={`Original ${idx + 1}`}
                  className="w-full border border-gray-300"
                />
              </div>

              {/* Binary Decision Preview */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-black">Binary: {result.position}</h3>
                <div className="bg-black h-[20vh] border border-gray-300">
                  <img
                    src={result.url}
                    alt={`Binary ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: result.position,
                      display: 'block',
                    }}
                  />
                </div>
              </div>

              {/* Smartcrop Recommended Preview */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-black">Smartcrop: {result.smartcropPosition}</h3>
                <div className="bg-black h-[20vh] border border-gray-300">
                  <img
                    src={result.url}
                    alt={`Smartcrop ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: result.smartcropPosition,
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="bg-gray-200 p-3 rounded text-sm font-mono text-black">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Position:</strong> {result.position}</div>
                <div><strong>Image Size:</strong> {result.imageWidth}x{result.imageHeight}</div>
                <div><strong>Focus Y:</strong> {result.focusY.toFixed(1)}</div>
                <div><strong>Image Center Y:</strong> {result.imageCenterY.toFixed(1)}</div>
                <div><strong>Is Above Center:</strong> {result.isAboveCenter ? 'Yes' : 'No'}</div>
                <div><strong>Crop Score:</strong> {typeof result.cropData.score === 'number' ? result.cropData.score.toFixed(2) : 'N/A'}</div>
                <div className="col-span-2">
                  <strong>Crop Area:</strong> x={result.cropData.x}, y={result.cropData.y},
                  w={result.cropData.width}, h={result.cropData.height}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageCropTest
