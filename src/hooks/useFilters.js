/**
 * Custom React hook for managing event filters and sorting
 * @module hooks/useFilters
 */

import { useMemo, useState, useEffect } from 'react'
import useLocalStorage from './useLocalStorage'
import {
  filterByCategory,
  filterByGenre,
  filterBySource,
  groupEventsByName,
  sortEvents,
} from '../utils/eventUtils'
import { isDateInPast } from '../utils/dateUtils'

// Preferred venue keywords for boosting
const PREFERRED_VENUES = ['smokey', 'snug', 'neighborhood']

/**
 * Hook for managing all event filters, sorting, and derived state
 * Persists all filter settings to localStorage
 *
 * @param {Array} events - All events from API
 * @returns {Object} Filter state and control functions
 *
 * @example
 * function App() {
 *   const { events } = useEvents()
 *   const {
 *     filteredEvents,
 *     selectedCategory,
 *     setSelectedCategory,
 *     selectedGenres,
 *     toggleGenre,
 *     clearFilters,
 *     hasActiveFilters
 *   } = useFilters(events)
 *
 *   return <EventList events={filteredEvents} />
 * }
 */
export function useFilters(events) {
  // Persisted state
  const [selectedCategory, setSelectedCategory] = useLocalStorage('cltevents-category', 'all')
  const [selectedGenres, setSelectedGenres] = useLocalStorage('cltevents-selectedGenres', [])
  const [selectedSources, setSelectedSources] = useLocalStorage('cltevents-selectedSources', [])
  const [sortBy, setSortBy] = useLocalStorage('cltevents-sortBy', 'date')
  const [favorites, setFavorites] = useLocalStorage('cltevents-favorites', [])
  const [hidden, setHidden] = useLocalStorage('cltevents-hidden', [])

  // Exclude keywords and genres (loaded from JSON)
  const [excludeKeywords, setExcludeKeywords] = useState([])
  const [excludeGenres, setExcludeGenres] = useState([])

  // Load exclude keywords and genres from JSON file
  useEffect(() => {
    fetch('/data/excludeKeywords.json')
      .then((res) => res.json())
      .then((data) => {
        setExcludeKeywords(data.keywords || [])
        setExcludeGenres(data.genres || [])
      })
      .catch((err) => console.error('Error loading exclude keywords:', err))
  }, [])

  /**
   * Toggle functions for filters
   */
  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const toggleSource = (source) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    )
  }

  const toggleFavorite = (eventId) => {
    setFavorites((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    )
  }

  const toggleHidden = (event) => {
    const eventKey = event.name.toLowerCase().trim()
    setHidden((prev) =>
      prev.includes(eventKey) ? prev.filter((key) => key !== eventKey) : [...prev, eventKey]
    )
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSelectedCategory('all')
    setSelectedGenres([])
    setSelectedSources([])
  }

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return selectedGenres.length > 0 || selectedSources.length > 0
  }, [selectedGenres, selectedSources])

  /**
   * Compute filtered and sorted events
   * Memoized for performance - only recalculates when dependencies change
   */
  const filteredEvents = useMemo(() => {
    // Step 1: Remove past events (before filtering by category)
    let filtered = events.filter((event) => {
      // For events with multiple dates, keep if ANY date is not in past
      return event.dates && event.dates.some((dateInfo) => !isDateInPast(dateInfo.date))
    })

    // Step 2: Filter out excluded keywords
    filtered = filtered.filter((event) => {
      const searchText = `${event.name} ${event.description || ''}`.toLowerCase()
      return !excludeKeywords.some((keyword) => searchText.includes(keyword.toLowerCase()))
    })

    // Step 3: Filter out excluded genres
    filtered = filtered.filter((event) => {
      if (!event.genres || event.genres.length === 0) return true
      return !event.genres.some((genre) => excludeGenres.some((eg) => genre.toLowerCase() === eg.toLowerCase()))
    })

    // Step 4: Filter by category
    filtered = filterByCategory(filtered, selectedCategory, favorites, hidden, PREFERRED_VENUES)

    // Step 5: Filter by genre
    filtered = filterByGenre(filtered, selectedGenres)

    // Step 6: Filter by source
    filtered = filterBySource(filtered, selectedSources)

    // Step 7: Group by name (combine multi-date events)
    const grouped = groupEventsByName(filtered)

    // Step 8: Sort
    const sorted = sortEvents(grouped, sortBy, PREFERRED_VENUES)

    return sorted
  }, [
    events,
    selectedCategory,
    favorites,
    hidden,
    selectedGenres,
    selectedSources,
    sortBy,
    excludeKeywords,
    excludeGenres,
  ])

  return {
    // Filter state
    selectedCategory,
    setSelectedCategory,
    selectedGenres,
    setSelectedGenres,
    toggleGenre,
    selectedSources,
    setSelectedSources,
    toggleSource,
    sortBy,
    setSortBy,

    // Favorites and hidden
    favorites,
    setFavorites,
    toggleFavorite,
    hidden,
    setHidden,
    toggleHidden,

    // Computed values
    filteredEvents,
    hasActiveFilters,
    clearFilters,
  }
}

export default useFilters
