/**
 * Custom React hook for fetching and managing event data from multiple sources
 * @module hooks/useEvents
 */

import { useState, useEffect, useRef } from 'react'
import { extractGenres, isPreferredVenue } from '../utils/eventUtils'
import { fetchYouTubeVideos } from '../utils/youtubeUtils'
import { applyEventSubstitutions } from '../utils/textSubstitutions'
import { API_BASE_URL } from '../config'

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
        } else {
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
          youtubeLinks = await fetchYouTubeVideos(tmEvent.name, youtubeCache.current, API_BASE_URL)
        }

        // Extract highest resolution image
        let imageUrl = null
        if (tmEvent.images && tmEvent.images.length > 0) {
          const sortedImages = [...tmEvent.images].sort((a, b) => (b.width || 0) - (a.width || 0))
          imageUrl = sortedImages[0]?.url
        }

        const event = {
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

        // Debug logging for YouTube links
        if (youtubeLinks.length > 0) {
        }

        // Apply text substitutions
        const finalEvent = applyEventSubstitutions(event)

        // Verify YouTube links weren't removed by substitutions
        if (youtubeLinks.length > 0 && !finalEvent.youtubeLinks) {
          console.error(`❌ WARNING: YouTube links were removed for "${tmEvent.name}" after text substitutions!`)
        }

        return finalEvent
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
        const youtubeLinks = await fetchYouTubeVideos(sjEvent.name, youtubeCache.current, API_BASE_URL)

        const event = {
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

        // Apply text substitutions
        return applyEventSubstitutions(event)
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

        // Fetch YouTube videos for Fillmore events (artist names)
        const youtubeLinks = await fetchYouTubeVideos(fillmoreEvent.name, youtubeCache.current, API_BASE_URL)

        const event = {
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

        // Apply text substitutions
        return applyEventSubstitutions(event)
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

        const event = {
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

        // Apply text substitutions
        return applyEventSubstitutions(event)
      })
    )
  }

  /**
   * Processes Comet Grill events (free live music venue)
   * Currently disabled - site appears stale
   */
  // eslint-disable-next-line no-unused-vars
  const processCometGrillEvents = async (cometData) => {
    return await Promise.all(
      cometData.events.map(async (cometEvent) => {
        // Comet Grill is a free live music venue
        const matchScore = 85 // High priority for free live music

        // Don't fetch YouTube videos upfront - fetch on-demand to save API quota
        const youtubeLinks = []

        const event = {
          id: cometEvent.id,
          name: cometEvent.name,
          type: 'music',
          date: cometEvent.date,
          time: cometEvent.startTime || null,
          venue: cometEvent.venue,
          venueAddress: cometEvent.location?.address || '2224 Park Road, Charlotte, NC 28203',
          distance: 'N/A',
          description: cometEvent.description,
          price: 0,
          youtubeLinks: youtubeLinks.length > 0 ? youtubeLinks : undefined,
          matchScore: matchScore,
          ticketUrl: null, // Free shows, no tickets
          genres: cometEvent.genres || ['Live Music'],
          imageUrl: cometEvent.imageUrl,
          source: cometEvent.source,
          sourceType: cometEvent.sourceType, // 'venue'
        }

        // Apply text substitutions
        return applyEventSubstitutions(event)
      })
    )
  }

  /**
   * Processes CLTtoday events
   * Now handles individual events with date, time, and venue
   */
  const processCLTtodayEvents = (cltData) => {
    return cltData.events.map((cltEvent) => {
      let matchScore = 65 // Base score for CLTtoday events

      // Boost if it's in the Events category
      if (cltEvent.category?.toLowerCase().includes('event')) {
        matchScore += 10
      }

      // Boost if event has a specific time (more detailed events)
      if (cltEvent.time) {
        matchScore += 5
      }

      const genres = cltEvent.category ? [cltEvent.category] : ['Events']

      const event = {
        id: `clt-${cltEvent.url}-${cltEvent.name}`,
        name: cltEvent.name,
        type: 'events',
        date: cltEvent.date,
        time: cltEvent.time || null,
        venue: cltEvent.venue || 'Charlotte',
        venueAddress: '',
        distance: 'N/A',
        description: cltEvent.description || '',
        price: 0,
        matchScore: matchScore,
        ticketUrl: cltEvent.url,
        genres: genres,
        imageUrl: cltEvent.image || null,
        source: 'clttoday',
      }

      // Apply text substitutions
      return applyEventSubstitutions(event)
    })
  }

  /**
   * Processes Amos' Southend events
   * Live music venue in South End Charlotte
   */
  const processAmosEvents = async (amosData) => {
    return await Promise.all(
      amosData.events.map(async (amosEvent) => {
        // Amos' Southend is a quality music venue
        const matchScore = 85 // High priority for local music venue

        // Fetch YouTube videos for Amos events
        const youtubeLinks = await fetchYouTubeVideos(amosEvent.name, youtubeCache.current, API_BASE_URL)

        const event = {
          id: `amos-${amosEvent.name}-${amosEvent.date}`,
          name: amosEvent.name,
          type: 'music',
          date: amosEvent.date,
          time: amosEvent.time || null,
          venue: amosEvent.venue,
          venueAddress: '1423 S Tryon St, Charlotte, NC 28203',
          distance: 'N/A',
          description: amosEvent.description || amosEvent.name,
          price: amosEvent.price || 0,
          youtubeLinks: youtubeLinks.length > 0 ? youtubeLinks : undefined,
          matchScore: matchScore,
          ticketUrl: amosEvent.url,
          genres: ['Music', 'Live'],
          source: 'amos',
        }

        // Apply text substitutions
        return applyEventSubstitutions(event)
      })
    )
  }

  /**
   * Processes Jazz Room events
   * Jazz venue in Charlotte
   */
  const processJazzRoomEvents = async (jazzRoomData) => {
    return await Promise.all(
      jazzRoomData.events.map(async (jazzEvent) => {
        // Jazz Room is a quality jazz venue
        const matchScore = 85 // High priority for local jazz venue

        // Fetch YouTube videos for Jazz Room events
        const youtubeLinks = await fetchYouTubeVideos(jazzEvent.name, youtubeCache.current, API_BASE_URL)

        const event = {
          id: `jazz-room-${jazzEvent.name}-${jazzEvent.date}`,
          name: jazzEvent.name,
          type: 'music',
          date: jazzEvent.date,
          time: jazzEvent.time || null,
          venue: jazzEvent.venue,
          venueAddress: '110 E 7th St, Charlotte, NC 28202',
          distance: 'N/A',
          description: jazzEvent.description || jazzEvent.name,
          price: jazzEvent.price || 0,
          youtubeLinks: youtubeLinks.length > 0 ? youtubeLinks : undefined,
          matchScore: matchScore,
          ticketUrl: jazzEvent.url,
          genres: ['Jazz', 'Live'],
          source: 'jazz-room',
        }

        // Apply text substitutions
        return applyEventSubstitutions(event)
      })
    )
  }

  /**
   * Fetches events from all sources in parallel
   */
  const fetchEvents = async () => {
    setLoading(true)
    try {
      // Fetch from all sources in parallel
      const [ticketmasterResponse, smokeyJoesResponse, cltTodayResponse, fillmoreResponse, eternallyGratefulResponse, amosResponse, jazzRoomResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/events`),
          fetch(`${API_BASE_URL}/api/smokeyjoes`),
          fetch(`${API_BASE_URL}/api/clttoday`),
          fetch(`${API_BASE_URL}/api/fillmore`),
          fetch(`${API_BASE_URL}/api/eternally-grateful`),
          fetch(`${API_BASE_URL}/api/amos`),
          fetch(`${API_BASE_URL}/api/jazz-room`),
          // fetch(`${API_BASE_URL}/api/comet-grill`), // Disabled - site appears stale
        ])

      let allEvents = []

      // Process Ticketmaster events
      if (ticketmasterResponse.ok) {
        try {
          const tmData = await ticketmasterResponse.json()
          const tmEvents = await processTicketmasterEvents(tmData)
          allEvents = [...allEvents, ...tmEvents]
        } catch (error) {
          console.error('Error processing Ticketmaster events:', error)
        }
      } else {
        console.warn('Ticketmaster API returned status:', ticketmasterResponse.status)
      }

      // Process Smokey Joe's events
      if (smokeyJoesResponse.ok) {
        try {
          const sjData = await smokeyJoesResponse.json()
          const sjEvents = await processSmokeyjoesEvents(sjData)
          allEvents = [...allEvents, ...sjEvents]
        } catch (error) {
          console.error('Error processing Smokey Joes events:', error)
        }
      }

      // Process CLTtoday events
      if (cltTodayResponse.ok) {
        try {
          const cltData = await cltTodayResponse.json()
          const cltEvents = processCLTtodayEvents(cltData)
          allEvents = [...allEvents, ...cltEvents]
        } catch (error) {
          console.error('Error processing CLTtoday events:', error)
        }
      }

      // Process Fillmore events
      if (fillmoreResponse.ok) {
        try {
          const fillmoreData = await fillmoreResponse.json()
          const fillmoreEvents = await processFillmoreEvents(fillmoreData)
          allEvents = [...allEvents, ...fillmoreEvents]
        } catch (error) {
          console.error('Error processing Fillmore events:', error)
        }
      }

      // Process Eternally Grateful events
      if (eternallyGratefulResponse.ok) {
        try {
          const egData = await eternallyGratefulResponse.json()
          const egEvents = await processEternallyGratefulEvents(egData)
          allEvents = [...allEvents, ...egEvents]
        } catch (error) {
          console.error('Error processing Eternally Grateful events:', error)
        }
      }

      // Process Amos' Southend events
      if (amosResponse.ok) {
        try {
          const amosData = await amosResponse.json()
          const amosEvents = await processAmosEvents(amosData)
          allEvents = [...allEvents, ...amosEvents]
        } catch (error) {
          console.error("Error processing Amos' Southend events:", error)
        }
      }

      // Process Jazz Room events
      if (jazzRoomResponse.ok) {
        try {
          const jazzRoomData = await jazzRoomResponse.json()
          const jazzRoomEvents = await processJazzRoomEvents(jazzRoomData)
          allEvents = [...allEvents, ...jazzRoomEvents]
        } catch (error) {
          console.error('Error processing Jazz Room events:', error)
        }
      }

      // Process Comet Grill events - DISABLED (site appears stale)
      // if (cometGrillResponse.ok) {
      //   try {
      //     const cometData = await cometGrillResponse.json()
      //     const cometEvents = await processCometGrillEvents(cometData)
      //     allEvents = [...allEvents, ...cometEvents]
      //   } catch (error) {
      //     console.error('Error processing Comet Grill events:', error)
      //   }
      // }

      setEvents(allEvents)

      // Log event counts by source
      const eventCountsBySource = {}
      allEvents.forEach((event) => {
        const source = event.source || 'unknown'
        eventCountsBySource[source] = (eventCountsBySource[source] || 0) + 1
      })
      console.log('📊 Events by source:', eventCountsBySource)
      console.log(`📊 Total events: ${allEvents.length}`)

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
