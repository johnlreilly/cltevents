/**
 * EventCard component
 * Displays an individual event with full feature set
 */

import { useState, useEffect } from 'react'
import { formatDate, formatTime } from '../../utils/dateUtils'
import { toTitleCase, createCalendarEvent, hasUsefulDescription } from '../../utils/eventUtils'
import { cleanYouTubeTitle } from '../../utils/youtubeUtils'
import { getCachedSmartCrop, getObjectPosition } from '../../utils/imageUtils'
import { getImageHeightClass } from '../../utils/imageDetection'

// Global state for current playing video across all event cards
let globalCurrentVideo = null
let globalVideoChangeCallbacks = []

const registerVideoChangeCallback = (callback) => {
  globalVideoChangeCallbacks.push(callback)
  return () => {
    globalVideoChangeCallbacks = globalVideoChangeCallbacks.filter((cb) => cb !== callback)
  }
}

const setGlobalCurrentVideo = (eventId, videoIndex) => {
  globalCurrentVideo = { eventId, videoIndex }
  globalVideoChangeCallbacks.forEach((cb) => cb(eventId, videoIndex))
}

/**
 * EventCard Component
 * @param {Object} props - Component props
 * @param {Object} props.event - Event data object
 * @param {boolean} props.isFavorite - Whether event is favorited
 * @param {Function} props.onToggleFavorite - Toggle favorite callback
 * @param {Function} props.onHide - Hide event callback
 * @param {Array} props.sportsTeams - Array of sports teams for positioning override
 * @returns {JSX.Element} The event card component
 */
function EventCard({ event, isFavorite, onToggleFavorite, onHide, sportsTeams = [] }) {
  const [expandedDescription, setExpandedDescription] = useState(false)
  const [expandedDates, setExpandedDates] = useState(false)
  const [expandedYouTube, setExpandedYouTube] = useState(null) // null or video index
  const [pausedYouTube, setPausedYouTube] = useState(false)
  const [showYouTubePanel, setShowYouTubePanel] = useState(false)
  const [imagePosition, setImagePosition] = useState('center center')
  const [imageHeightClass, setImageHeightClass] = useState('h-[20vh]')

  const eventSlug = event.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Listen for global video changes
  useEffect(() => {
    const unregister = registerVideoChangeCallback((eventId, videoIndex) => {
      if (eventId !== event.id) {
        // Another event started playing - close this panel
        setShowYouTubePanel(false)
        setExpandedYouTube(null)
        setPausedYouTube(false)
      }
    })
    return unregister
  }, [event.id])

  // Analyze image with smartcrop when component mounts
  useEffect(() => {
    if (event.imageUrl) {
      // Check if it's a placeholder image (fast URL check)
      const heightClass = getImageHeightClass(event.imageUrl)
      setImageHeightClass(heightClass)

      // Check if this event is a sports team with custom positioning
      const matchingSportsTeam = sportsTeams.find((team) =>
        event.name.toLowerCase().includes(team.name.toLowerCase())
      )

      if (matchingSportsTeam) {
        // Use the configured position for sports teams
        setImagePosition(matchingSportsTeam.position)
      } else {
        // Use smartcrop for non-sports events
        const analyzeImage = async () => {
          try {
            // Get the container dimensions (approximate)
            const containerWidth = 800 // typical card width
            const containerHeight = window.innerHeight * 0.2 // 20vh

            const cropData = await getCachedSmartCrop(event.imageUrl, containerWidth, containerHeight)

            // We'll use a temporary image to get actual dimensions
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              const position = getObjectPosition(cropData, img.width, img.height)
              setImagePosition(position)
            }
            img.onerror = () => {
              // If image fails to load, keep default center-center
              console.log('Image load failed, using center-center:', event.imageUrl)
            }
            img.src = event.imageUrl
          } catch (error) {
            // If smartcrop fails (e.g., CORS), silently fall back to center-center
            // No console error needed as this is expected for some images
          }
        }

        analyzeImage()
      }
    }
  }, [event.imageUrl, sportsTeams])

  const handleAddToCalendar = () => {
    const icsContent = createCalendarEvent(event)
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${eventSlug}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}#event-${eventSlug}`
    const shareText = `Check out ${event.name} at ${event.venue} on ${formatDate(event.dates[0].date)}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Error copying to clipboard:', err)
      }
    }
  }

  const handleVideoClick = (idx) => {
    const isCurrentVideo = expandedYouTube === idx
    if (isCurrentVideo) {
      // Toggle pause for current video
      setPausedYouTube(!pausedYouTube)
    } else {
      // Play new video
      setExpandedYouTube(idx)
      setPausedYouTube(false)
      setGlobalCurrentVideo(event.id, idx)
    }
  }

  return (
    <div
      id={`event-${eventSlug}`}
      className="bg-surface rounded-3xl border border-outlinevariant overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Event Image */}
      {event.imageUrl && (
        <div className={`bg-black ${imageHeightClass}`} style={{ width: '100%', minWidth: '100%', maxWidth: '100%' }}>
          <img
            src={event.imageUrl}
            alt={event.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: imagePosition,
              display: 'block',
              minWidth: '100%',
              maxWidth: '100%',
            }}
            onLoad={(e) => {
              e.target.style.width = '100%'
              e.target.style.minWidth = '100%'
              e.target.style.maxWidth = '100%'
            }}
          />
        </div>
      )}

      <div className="px-5 pt-5 pb-2">
        {/* Event Title & Venue */}
        <div className="mt-1 mb-1">
          <h3 className="text-xl font-semibold text-onsurface mb-1">{toTitleCase(event.name)}</h3>
          <p className="text-sm text-onsurfacevariant">{event.venue}</p>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-4 mb-3 text-sm text-onsurfacevariant">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {event.dates.length > 1 ? `${event.dates.length} dates` : formatDate(event.dates[0].date)}
          </span>
          {event.time && formatTime(event.time) && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatTime(event.time)}
            </span>
          )}
        </div>

        {/* Genres */}
        {event.genres && event.genres.length > 0 && (
          <div className="mt-3 mb-3 flex flex-wrap gap-2 items-center">
            {[...new Set(event.genres)].map((genre, idx) => (
              <span
                key={idx}
                className="text-xs bg-primarycontainer text-onprimarycontainer px-3 py-1 rounded-full font-medium"
              >
                {genre}
              </span>
            ))}
            {event.source === 'clttoday' && (
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
            )}
          </div>
        )}

        {/* Multiple Dates - Collapsed by default */}
        {event.dates.length > 1 && (
          <>
            <button
              onClick={() => setExpandedDates(!expandedDates)}
              className="text-sm text-primary hover:text-onprimarycontainer font-medium mb-3 block"
            >
              {expandedDates ? '▲ Hide Dates' : '▼ Show Dates'}
            </button>

            {expandedDates && (
              <div className="mb-3 p-3 bg-primarycontainer rounded-lg">
                <div className="text-sm font-semibold text-onprimarycontainer mb-2">Available Dates:</div>
                <div className="space-y-1">
                  {event.dates.slice(0, 7).map((dateInfo, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-onprimarycontainer">{formatDate(dateInfo.date)}</span>
                      {dateInfo.ticketUrl && (
                        <a
                          href={dateInfo.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-onprimarycontainer text-xs underline"
                        >
                          Tickets
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Description - Only show if useful, hidden by default */}
        {hasUsefulDescription(event) && (
          <button
            onClick={() => setExpandedDescription(!expandedDescription)}
            className="text-sm text-primary hover:text-onprimarycontainer font-medium mb-3 block"
          >
            {expandedDescription ? '▲ Hide Description' : '▼ Show Description'}
          </button>
        )}

        {hasUsefulDescription(event) && expandedDescription && (
          <p className="text-onsurface mb-3">{event.description}</p>
        )}

        {/* YouTube Player */}
        {event.youtubeLinks && event.youtubeLinks.length > 0 && (
          <>
            {!showYouTubePanel && (
              <button
                onClick={() => {
                  setShowYouTubePanel(true)
                  setExpandedYouTube(0)
                  setGlobalCurrentVideo(event.id, 0)
                }}
                className="text-sm text-primary hover:text-onprimarycontainer font-medium mb-3 block"
              >
                ▼ Listen on YouTube
              </button>
            )}

            {showYouTubePanel && (
              <div className="mb-3 p-3 bg-primarycontainer rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-onprimarycontainer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  Listen on YouTube
                </div>

                {/* Video Player or Paused Placeholder */}
                {expandedYouTube !== null && (() => {
                  const currentVideo = event.youtubeLinks[expandedYouTube]
                  if (!currentVideo) return null
                  const videoId = currentVideo.url.split('v=')[1] || currentVideo.url.split('/').pop()
                  const cleanedTitle = cleanYouTubeTitle(currentVideo.title)

                  if (pausedYouTube) {
                    // Show paused placeholder
                    return (
                      <div className="mb-3">
                        <div
                          className="rounded-lg overflow-hidden bg-black flex items-center justify-center"
                          style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <svg className="w-16 h-16 text-white mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              <p className="text-white text-sm opacity-75">Video paused</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div className="mb-3">
                      <div
                        className="rounded-lg overflow-hidden"
                        style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}
                      >
                        <iframe
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                          title={cleanedTitle}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )
                })()}

                {/* Video List */}
                <div className="space-y-1 mb-3">
                  {event.youtubeLinks.slice(0, 5).map((link, idx) => {
                    const cleanedTitle = cleanYouTubeTitle(link.title)
                    const isCurrentVideo = expandedYouTube === idx

                    return (
                      <button
                        key={idx}
                        onClick={() => handleVideoClick(idx)}
                        className={`flex items-start gap-2 text-sm w-full text-left px-2 py-1 rounded transition-colors ${
                          isCurrentVideo
                            ? 'bg-primary text-onprimary font-semibold'
                            : 'text-onprimarycontainer hover:bg-surfacevariant'
                        }`}
                      >
                        <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d={isCurrentVideo && !pausedYouTube ? 'M6 4h4v16H6V4zm8 0h4v16h-4V4z' : 'M8 5v14l11-7z'} />
                        </svg>
                        {cleanedTitle}
                      </button>
                    )
                  })}
                </div>

                {/* Close YouTube Button */}
                <button
                  onClick={() => {
                    setShowYouTubePanel(false)
                    setExpandedYouTube(null)
                    setPausedYouTube(false)
                  }}
                  className="w-full px-4 py-2 bg-surfacevariant text-onsurface rounded-lg hover:shadow-md transition-all text-sm font-medium"
                >
                  Close YouTube
                </button>
              </div>
            )}
          </>
        )}

        {/* Divider */}
        <div className="mt-4 mb-3 border-t border-outlinevariant"></div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-0">
          <div className="flex items-center gap-0 -ml-2.5">
            {/* Favorite Button */}
            <button
              onClick={onToggleFavorite}
              title="Favorite"
              className="p-2.5 rounded-full hover:bg-surfacevariant transition-colors"
            >
              <svg
                className={`w-6 h-6 ${isFavorite ? 'fill-tertiary text-tertiary' : 'text-onsurfacevariant'}`}
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            {/* Calendar Button */}
            <button
              onClick={handleAddToCalendar}
              title="Add to calendar"
              className="p-2.5 rounded-full hover:bg-surfacevariant transition-colors"
            >
              <svg className="w-6 h-6 text-onsurfacevariant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>

            {/* Hide Button */}
            <button
              onClick={onHide}
              title="Hide event"
              className="p-2.5 rounded-full hover:bg-surfacevariant transition-colors"
            >
              <svg className="w-6 h-6 text-onsurfacevariant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full hover:bg-surfacevariant transition-colors"
              title="Share event"
            >
              <svg className="w-6 h-6 text-onsurfacevariant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>

            {/* Get Directions Button */}
            <button
              onClick={() => {
                const query = encodeURIComponent(`${event.name} ${event.venue}`)
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
              }}
              className="p-2.5 rounded-full hover:bg-surfacevariant transition-colors"
              title="Get directions"
            >
              <svg className="w-6 h-6 text-onsurfacevariant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </button>
          </div>

          {/* Ticket Button */}
          {event.ticketUrl ? (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-1 bg-primary text-onprimary rounded-full hover:shadow-md transition-all flex items-center justify-center font-medium text-xs"
            >
              Get Tickets
            </a>
          ) : event.dates.length === 1 && event.dates[0].ticketUrl ? (
            <a
              href={event.dates[0].ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-1 bg-primary text-onprimary rounded-full hover:shadow-md transition-all flex items-center justify-center font-medium text-xs"
            >
              Get Tickets
            </a>
          ) : (
            <button className="px-6 py-1.5 bg-primary text-onprimary rounded-full hover:shadow-md transition-all flex items-center justify-center font-medium text-xs">
              Get Tickets
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventCard
