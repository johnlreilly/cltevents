/**
 * Custom React hook for fetching and managing event data from multiple sources
 * @module hooks/useEvents
 */

import { useState, useEffect, useRef } from 'react'
import { extractGenres, isPreferredVenue } from '../utils/eventUtils'
import { fetchYouTubeVideos } from '../utils/youtubeUtils'

// Genres to exclude from filter list
const EXCLUDE_GENRES = ['undefined', 'other', 'miscellaneous']

// Preferred venue keywords for match score boosting
const PREFERRED_VENUES = ['smokey', 'snug', 'neighborhood']

// Venues that should fetch YouTube videos
const YOUTUBE_VENUES = ['neighborhood theater', 'visulite', 'smokey joe', 'knight theater']

/**
 * Hook for fetching events from multiple sources (Ticketmaster, Smokey Joe's, CLTtoday)
 * Handles loading states, error handling, YouTube integration, and genre extraction
 *
 * @returns {Object} Events state and control functions
 * @returns {Array} returns.events - All fetched events
 * @returns {boolean} returns.loading - Loading state
 * @returns {boolean} returns.initialLoad - True on first load only
 * @returns {Array} returns.availableGenres - Unique genres from all events
 * @returns {Date} returns.lastSync - Last successful fetch time
 * @returns {Function} returns.refetch - Function to manually refetch events
 * @returns {Object} returns.youtubeCache - YouTube API cache
 *
 * @example
 * function App() {
 *   const { events, loading, refetch } = useEvents()
 *
 *   if (loading) return <div>Loading...</div>
 *   return <EventList events={events} onRefresh={refetch} />
 * }
 */
export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [availableGenres, setAvailableGenres] = useState([])
  const [lastSync, setLastSync] = useState(null)

  // YouTube cache persisted to localStorage
  const youtubeCache = useRef({})

  // Load YouTube cache from localStorage on mount
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem('cltevents-youtube-cache')
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        // Only use cache if it's less than 7 days old
        const cacheAge = Date.now() - (parsed.timestamp || 0)
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        if (cacheAge < sevenDays) {
          youtubeCache.current = parsed.data || {}
          console.log(`Loaded YouTube cache from localStorage: ${Object.keys(youtubeCache.current).length} entries`)
        } else {
          console.log('YouTube cache expired, starting fresh')
          localStorage.removeItem('cltevents-youtube-cache')
        }
      }
    } catch (error) {
      console.error('Error loading YouTube cache:', error)
    }
  }, [])

  /**
   * Processes Ticketmaster events with genre extraction and YouTube integration
   */
  const processTicketmasterEvents = async (tmData) => {
    return await Promise.all(
      tmData.events.map(async (tmEvent) => {
        const classification = tmEvent.classifications?.[0]
        const segment = classification?.segment?.name?.toLowerCase() || ''
        const genreName = classification?.genre?.name?.toLowerCase() || ''

        // Extract all genres
        const genres = []
        if (classification?.segment?.name && classification.segment.name !== 'Undefined') {
          genres.push(classification.segment.name)
        }
        if (classification?.genre?.name && classification.genre.name !== 'Undefined') {
          genres.push(classification.genre.name)
        }
        if (classification?.subGenre?.name && classification.subGenre.name !== 'Undefined') {
          genres.push(classification.subGenre.name)
        }

        // Determine event type
        let eventType = 'other'
        if (segment.includes('music') || genreName.includes('music')) {
          eventType = 'music'
        } else if (segment.includes('sports')) {
          eventType = 'sports'
        } else if (segment.includes('arts') || segment.includes('theatre')) {
          eventType = 'other'
        }

        // Extract price
        let price = 0
        if (tmEvent.priceRanges && tmEvent.priceRanges.length > 0) {
          price = tmEvent.priceRanges[0].min || 0
        }

        // Extract venue information
        const venueData = tmEvent._embedded?.venues?.[0]
        const venue = venueData?.name || 'Venue TBA'
        const venueAddress = venueData?.address?.line1
          ? `${venueData.address.line1}, ${venueData.city?.name || ''}, ${venueData.state?.stateCode || ''} ${venueData.postalCode || ''}`.trim()
          : ''

        // Calculate match score
        let matchScore = 70
        if (PREFERRED_VENUES.some((v) => venue.toLowerCase().includes(v))) {
          matchScore += 15
        }
        if (eventType === 'music') {
          matchScore += 10
        }

        // Fetch YouTube videos for specific preferred venues only
        let youtubeLinks = []
        const shouldFetchYouTube = eventType === 'music' &&
          YOUTUBE_VENUES.some((v) => venue.toLowerCase().includes(v))

        if (shouldFetchYouTube) {
          console.log(`Fetching YouTube for ${tmEvent.name} at ${venue}`)
          youtubeLinks = await fetchYouTubeVideos(tmEvent.name, youtubeCache.current)
          console.log(`Got ${youtubeLinks.length} YouTube videos for ${tmEvent.name}`)
        }

        // Extract highest resolution image
        let imageUrl = null
        if (tmEvent.images && tmEvent.images.length > 0) {
          const sortedImages = [...tmEvent.images].sort((a, b) => (b.width || 0) - (a.width || 0))
          imageUrl = sortedImages[0]?.url
        }

        return {
          id: `tm-${tmEvent.id}`,
          name: tmEvent.name,
          type: eventType,
          date: tmEvent.dates?.start?.localDate || '',
          time: tmEvent.dates?.start?.localTime || null,
          venue: venue,
          venueAddress: venueAddress,
          distance: 'N/A',
          description: tmEvent.info || tmEvent.pleaseNote || tmEvent.name,
          price: price,
          youtubeLinks: youtubeLinks.length > 0 ? youtubeLinks : undefined,
          matchScore: Math.min(matchScore, 98),
          ticketUrl: tmEvent.url,
          genres: genres,
          imageUrl: imageUrl,
          source: 'ticketmaster',
        }
      })
    )
  }

  /**
   * Processes Smokey Joe's events (all music with YouTube integration)
   */
  const processSmokeyjoesEvents = async (sjData) => {
    return await Promise.all(
      sjData.events.map(async (sjEvent) => {
        // All Smokey Joe's events are music at a preferred venue
        const matchScore = 70 + 15 + 10 // base + venue boost + music boost = 95

        // Fetch YouTube videos for Smokey Joe's events
        console.log(`Fetching YouTube for Smokey Joe's event: ${sjEvent.name}`)
        const youtubeLinks = await fetchYouTubeVideos(sjEvent.name, youtubeCache.current)
        console.log(`Got ${youtubeLinks.length} YouTube videos for ${sjEvent.name}`)

        return {
          id: `sj-${sjEvent.name}-${sjEvent.date}`,
          name: sjEvent.name,
          type: 'music',
          date: sjEvent.date,
          time: sjEvent.time || null,
          venue: sjEvent.venue,
          distance: 'N/A',
          description: sjEvent.description,
          price: 0,
          youtubeLinks: youtubeLinks.length > 0 ? youtubeLinks : undefined,
          matchScore: matchScore,
          ticketUrl: 'https://smokeyjoes.cafe',
          genres: ['Music', 'Live'],
          source: 'smokeyjoes',
        }
      })
    )
  }

  /**
   * Processes Fillmore Charlotte events (JSON-LD structured data)
   */
  const processFillmoreEvents = async (fillmoreData) => {
    return await Promise.all(
      fillmoreData.events.map(async (fillmoreEvent) => {
        // Fillmore is a preferred venue with quality music events
        const isPreferred = isPreferredVenue(fillmoreEvent.venue, PREFERRED_VENUES)
        const matchScore = 70 + (isPreferred ? 15 : 0) + 10 // base + venue boost + music boost

        // Don't fetch YouTube videos upfront - fetch on-demand to save API quota
        const youtubeLinks = []

        return {
          id: fillmoreEvent.id,
          name: fillmoreEvent.name,
          type: 'music',
          date: fillmoreEvent.date,
          time: fillmoreEvent.startTime ? new Date(fillmoreEvent.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
          venue: fillmoreEvent.venue,
          venueAddress: fillmoreEvent.location?.address || '',
          distance: 'N/A',
          description: fillmoreEvent.description,
          price: 0,
          youtubeLinks: youtubeLinks.length > 0 ? youtubeLinks : undefined,
          matchScore: matchScore,
          ticketUrl: fillmoreEvent.ticketUrl,
          genres: fillmoreEvent.genres.length > 0 ? fillmoreEvent.genres : extractGenres([{ name: fillmoreEvent.name }]).slice(0, 3),
          imageUrl: fillmoreEvent.imageUrl,
          source: 'fillmore',
        }
      })
    )
  }

  /**
   * Processes Eternally Grateful events (artist tracking)
   */
  const processEternallyGratefulEvents = async (egData) => {
    return await Promise.all(
      egData.events.map(async (egEvent) => {
        // Artist tracking events get high priority match score
        const matchScore = 95 // High priority for tracked artists

        // Don't fetch YouTube videos upfront - fetch on-demand to save API quota
        const youtubeLinks = []

        return {
          id: egEvent.id,
          name: egEvent.name,
          type: 'music',
          date: egEvent.date,
          time: egEvent.startTime || null,
          venue: egEvent.venue,
          venueAddress: egEvent.city || '',
          distance: 'N/A',
          description: egEvent.description,
          price: 0,
          youtubeLinks: youtubeLinks.length > 0 ? youtubeLinks : undefined,
          matchScore: matchScore,
          ticketUrl: egEvent.ticketUrl,
          genres: egEvent.genres || [],
          imageUrl: egEvent.imageUrl,
          source: egEvent.source,
          sourceType: egEvent.sourceType, // 'artist'
          artistName: egEvent.artistName, // 'Eternally Grateful'
        }
      })
    )
  }

  /**
   * Processes CLTtoday article events
   */
  const processCLTtodayEvents = (cltData) => {
    const cltEvents = []

    cltData.events.forEach((cltEvent) => {
      let matchScore = 60

      // Boost if it's in the Events category
      if (cltEvent.category?.toLowerCase().includes('event')) {
        matchScore += 10
      }

      // Create event for earliest upcoming date
      if (cltEvent.eventDates && cltEvent.eventDates.length > 0) {
        const sortedDates = cltEvent.eventDates.sort()
        const today = new Date().toISOString().split('T')[0]
        const upcomingDate = sortedDates.find((date) => date >= today) || sortedDates[0]

        const genres =
          cltEvent.sectionHeaders && cltEvent.sectionHeaders.length > 0
            ? cltEvent.sectionHeaders
            : cltEvent.category
            ? [cltEvent.category]
            : ['News']

        cltEvents.push({
          id: `clt-${cltEvent.url}`,
          name: cltEvent.name,
          type: 'article',
          date: upcomingDate,
          time: null,
          venue: 'CLTtoday Article',
          venueAddress: '',
          distance: 'N/A',
          description: cltEvent.description || cltEvent.name,
          price: 0,
          matchScore: matchScore,
          ticketUrl: cltEvent.url,
          genres: genres,
          imageUrl: cltEvent.image,
          source: 'clttoday',
          dates: [{ date: upcomingDate, id: `clt-${cltEvent.url}`, ticketUrl: cltEvent.url }],
        })
      }
    })

    return cltEvents
  }

  /**
   * Fetches events from all sources in parallel
   */
  const fetchEvents = async () => {
    setLoading(true)
    try {
      // Fetch from all sources in parallel
      const [ticketmasterResponse, smokeyJoesResponse, cltTodayResponse, fillmoreResponse, eternallyGratefulResponse] =
        await Promise.all([
          fetch('/api/events'),
          fetch('/api/smokeyjoes'),
          fetch('/api/clttoday'),
          fetch('/api/fillmore'),
          fetch('/api/eternally-grateful'),
        ])

      let allEvents = []

      // Process Ticketmaster events
      if (ticketmasterResponse.ok) {
        const tmData = await ticketmasterResponse.json()
        const tmEvents = await processTicketmasterEvents(tmData)
        allEvents = [...allEvents, ...tmEvents]
      }

      // Process Smokey Joe's events
      if (smokeyJoesResponse.ok) {
        const sjData = await smokeyJoesResponse.json()
        const sjEvents = await processSmokeyjoesEvents(sjData)
        allEvents = [...allEvents, ...sjEvents]
      }

      // Process CLTtoday events
      if (cltTodayResponse.ok) {
        const cltData = await cltTodayResponse.json()
        const cltEvents = processCLTtodayEvents(cltData)
        allEvents = [...allEvents, ...cltEvents]
      }

      // Process Fillmore events
      if (fillmoreResponse.ok) {
        const fillmoreData = await fillmoreResponse.json()
        const fillmoreEvents = await processFillmoreEvents(fillmoreData)
        allEvents = [...allEvents, ...fillmoreEvents]
      }

      // Process Eternally Grateful events
      if (eternallyGratefulResponse.ok) {
        const egData = await eternallyGratefulResponse.json()
        const egEvents = await processEternallyGratefulEvents(egData)
        allEvents = [...allEvents, ...egEvents]
      }

      setEvents(allEvents)

      // Extract unique genres for filtering (excluding certain genres)
      const genres = extractGenres(allEvents).filter(
        (genre) => !EXCLUDE_GENRES.some((excluded) => genre.toLowerCase().includes(excluded.toLowerCase()))
      )
      setAvailableGenres(genres)

      // Save YouTube cache to localStorage
      try {
        const cacheData = {
          timestamp: Date.now(),
          data: youtubeCache.current,
        }
        localStorage.setItem('cltevents-youtube-cache', JSON.stringify(cacheData))
        console.log(`Saved YouTube cache to localStorage: ${Object.keys(youtubeCache.current).length} entries`)
      } catch (error) {
        console.error('Error saving YouTube cache:', error)
      }

      setLastSync(new Date())
      setInitialLoad(false)

      // Scroll to top on subsequent fetches
      if (!initialLoad) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch events on mount
  useEffect(() => {
    fetchEvents()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    events,
    loading,
    initialLoad,
    availableGenres,
    lastSync,
    refetch: fetchEvents,
    youtubeCache: youtubeCache.current,
  }
}

export default useEvents
