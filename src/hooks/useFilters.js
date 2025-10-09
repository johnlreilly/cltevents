/**
 * Custom React hook for managing event filters and sorting
 * @module hooks/useFilters
 */

import { useMemo } from 'react'
import useLocalStorage from './useLocalStorage'
import {
  filterByCategory,
  filterByGenre,
  filterBySource,
  groupEventsByName,
  sortEvents,
} from '../utils/eventUtils'

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
    // Step 1: Filter by category
    let filtered = filterByCategory(events, selectedCategory, favorites, hidden, PREFERRED_VENUES)

    // Step 2: Filter by genre
    filtered = filterByGenre(filtered, selectedGenres)

    // Step 3: Filter by source
    filtered = filterBySource(filtered, selectedSources)

    // Step 4: Group by name (combine multi-date events)
    const grouped = groupEventsByName(filtered)

    // Step 5: Sort
    const sorted = sortEvents(grouped, sortBy, PREFERRED_VENUES)

    return sorted
  }, [events, selectedCategory, favorites, hidden, selectedGenres, selectedSources, sortBy])

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
