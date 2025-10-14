/**
 * Unit tests for eventUtils
 * @module utils/eventUtils.test
 */

import { describe, it, expect } from 'vitest'
import {
  toTitleCase,
  groupEventsByName,
  sortEvents,
  hasUsefulDescription,
  filterByCategory,
  filterByGenre,
  filterBySource,
  extractGenres,
  isPreferredVenue,
  getMatchColor,
} from './eventUtils'

describe('eventUtils', () => {
  describe('toTitleCase', () => {
    it('converts all-caps strings to title case', () => {
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World')
      expect(toTitleCase('THE BEATLES')).toBe('The Beatles')
    })

    it('leaves mixed-case strings unchanged', () => {
      expect(toTitleCase('Hello World')).toBe('Hello World')
      expect(toTitleCase('The Beatles')).toBe('The Beatles')
    })

    it('requires 4+ consecutive uppercase to trigger conversion', () => {
      expect(toTitleCase('ABC')).toBe('ABC')
      expect(toTitleCase('ABCD')).toBe('Abcd')
    })
  })

  describe('groupEventsByName', () => {
    it('groups events with same base name', () => {
      const events = [
        { id: 1, name: 'Concert (Night 1)', date: '2024-12-15', ticketUrl: 'url1' },
        { id: 2, name: 'Concert (Night 2)', date: '2024-12-16', ticketUrl: 'url2' },
      ]

      const result = groupEventsByName(events)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Concert')
      expect(result[0].dates).toHaveLength(2)
      expect(result[0].dates[0].date).toBe('2024-12-15')
      expect(result[0].dates[1].date).toBe('2024-12-16')
    })

    it('sorts dates within each group', () => {
      const events = [
        { id: 1, name: 'Show', date: '2024-12-20', ticketUrl: 'url1' },
        { id: 2, name: 'Show', date: '2024-12-15', ticketUrl: 'url2' },
      ]

      const result = groupEventsByName(events)

      expect(result[0].dates[0].date).toBe('2024-12-15')
      expect(result[0].dates[1].date).toBe('2024-12-20')
    })

    it('keeps separate events with different names', () => {
      const events = [
        { id: 1, name: 'Concert A', date: '2024-12-15', ticketUrl: 'url1' },
        { id: 2, name: 'Concert B', date: '2024-12-16', ticketUrl: 'url2' },
      ]

      const result = groupEventsByName(events)

      expect(result).toHaveLength(2)
    })

    it('skips events without required fields', () => {
      const events = [
        { id: 1, name: 'Concert', date: '2024-12-15', ticketUrl: 'url1' },
        { id: 2, name: null, date: '2024-12-16', ticketUrl: 'url2' },
        { id: 3, name: 'Show', date: null, ticketUrl: 'url3' },
      ]

      const result = groupEventsByName(events)

      // Only event with both name and date is included
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Concert')
    })
  })

  describe('sortEvents', () => {
    const events = [
      {
        id: 1,
        name: 'Event A',
        dates: [{ date: '2024-12-20' }],
        venue: 'Regular Venue',
        matchScore: 5,
      },
      {
        id: 2,
        name: 'Event B',
        dates: [{ date: '2024-12-15' }],
        venue: "Smokey Joe's",
        matchScore: 3,
      },
      {
        id: 3,
        name: 'Event C',
        dates: [{ date: '2024-12-15' }],
        venue: 'Regular Venue',
        matchScore: 8,
      },
    ]

    it('sorts by date ascending', () => {
      const result = sortEvents(events, 'date')

      // Dec 15 events come first, then Dec 20
      // Among same dates, higher matchScore wins (event 3 has 8, event 2 has 3)
      expect(result[0].id).toBe(3) // Dec 15 with matchScore 8
      expect(result[1].id).toBe(2) // Dec 15 with matchScore 3
      expect(result[2].id).toBe(1) // Dec 20
    })

    it('boosts preferred venues in date sort', () => {
      const result = sortEvents(events, 'date', ['smokey'])

      // Same date (Dec 15): Smokey venue gets boost over higher matchScore
      expect(result[0].dates[0].date).toBe('2024-12-15')
      expect(result[0].venue).toContain('Smokey')
    })

    it('sorts by match score when not sorting by date', () => {
      const result = sortEvents(events, 'match', ['smokey'])

      // Event B has lower matchScore (3) but gets +10 boost for Smokey venue = 13
      // Event C has matchScore 8, no boost = 8
      // Event A has matchScore 5, no boost = 5
      expect(result[0].id).toBe(2) // Smokey venue with boost
      expect(result[1].id).toBe(3) // Higher matchScore
      expect(result[2].id).toBe(1) // Lower matchScore
    })
  })

  describe('hasUsefulDescription', () => {
    it('returns false if no description', () => {
      expect(hasUsefulDescription({ name: 'Event', venue: 'Venue' })).toBe(false)
    })

    it('returns false if description is just name', () => {
      const event = { name: 'Concert', description: 'Concert', venue: 'Venue' }
      expect(hasUsefulDescription(event)).toBe(false)
    })

    it('returns false if description is just venue', () => {
      const event = { name: 'Show', description: 'The Blue Note', venue: 'The Blue Note' }
      expect(hasUsefulDescription(event)).toBe(false)
    })

    it('returns true for unique descriptions', () => {
      const event = {
        name: 'Concert',
        description: 'An amazing night of music',
        venue: 'The Fillmore',
      }
      expect(hasUsefulDescription(event)).toBe(true)
    })
  })

  describe('filterByCategory', () => {
    const events = [
      { id: 1, name: 'Event 1', matchScore: 5 },
      { id: 2, name: 'Event 2', matchScore: 3 },
      { id: 3, name: 'Event 3', matchScore: 8 },
    ]
    const favorites = [1, 3]
    const hidden = ['event 2']

    it('returns all events for "all" category', () => {
      const result = filterByCategory(events, 'all', favorites, hidden)
      expect(result).toHaveLength(2) // Hidden event is filtered out
      expect(result.map((e) => e.id)).toEqual([1, 3])
    })

    it('returns only favorites for "favorites" category', () => {
      const result = filterByCategory(events, 'favorites', favorites, hidden)
      expect(result).toHaveLength(2)
      expect(result.every((e) => favorites.includes(e.id))).toBe(true)
    })

    it('filters out hidden events', () => {
      const result = filterByCategory(events, 'all', favorites, hidden)
      expect(result.find((e) => e.name.toLowerCase() === 'event 2')).toBeUndefined()
    })
  })

  describe('filterByGenre', () => {
    const events = [
      { id: 1, genres: ['Rock', 'Alternative'] },
      { id: 2, genres: ['Jazz', 'Blues'] },
      { id: 3, genres: ['Rock'] },
    ]

    it('returns all events if no genres selected', () => {
      const result = filterByGenre(events, [])
      expect(result).toHaveLength(3)
    })

    it('filters events by selected genres', () => {
      const result = filterByGenre(events, ['Rock'])
      expect(result).toHaveLength(2)
      expect(result.every((e) => e.genres.includes('Rock'))).toBe(true)
    })

    it('includes events matching any selected genre', () => {
      const result = filterByGenre(events, ['Jazz', 'Alternative'])
      expect(result).toHaveLength(2)
      expect(result.map((e) => e.id).sort()).toEqual([1, 2])
    })
  })

  describe('filterBySource', () => {
    const events = [
      { id: 1, source: 'ticketmaster' },
      { id: 2, source: 'smokeyjoes' },
      { id: 3, source: 'clttoday' },
    ]

    it('returns all events if no sources selected', () => {
      const result = filterBySource(events, [])
      expect(result).toHaveLength(3)
    })

    it('filters events by selected sources', () => {
      const result = filterBySource(events, ['ticketmaster'])
      expect(result).toHaveLength(1)
      expect(result[0].source).toBe('ticketmaster')
    })

    it('includes events from multiple selected sources', () => {
      const result = filterBySource(events, ['ticketmaster', 'smokeyjoes'])
      expect(result).toHaveLength(2)
      expect(result.map((e) => e.id).sort()).toEqual([1, 2])
    })
  })

  describe('extractGenres', () => {
    it('extracts unique genres from events', () => {
      const events = [
        { genres: ['Rock', 'Alternative'] },
        { genres: ['Rock', 'Jazz'] },
        { genres: ['Blues'] },
      ]

      const result = extractGenres(events)
      expect(result).toHaveLength(4)
      expect(result).toContain('Rock')
      expect(result).toContain('Alternative')
      expect(result).toContain('Jazz')
      expect(result).toContain('Blues')
    })

    it('returns sorted genres', () => {
      const events = [{ genres: ['Zebra', 'Apple', 'Banana'] }]

      const result = extractGenres(events)
      expect(result).toEqual(['Apple', 'Banana', 'Zebra'])
    })

    it('handles events without genres', () => {
      const events = [{ name: 'Event 1' }, { genres: ['Rock'] }]

      const result = extractGenres(events)
      expect(result).toEqual(['Rock'])
    })
  })

  describe('isPreferredVenue', () => {
    it('returns true for preferred venues', () => {
      const preferredVenues = ['smokey', 'fillmore']
      expect(isPreferredVenue("Smokey Joe's Cafe", preferredVenues)).toBe(true)
      expect(isPreferredVenue('The Fillmore', preferredVenues)).toBe(true)
    })

    it('is case-insensitive', () => {
      const preferredVenues = ['smokey']
      expect(isPreferredVenue("SMOKEY JOE'S", preferredVenues)).toBe(true)
    })

    it('returns false for non-preferred venues', () => {
      const preferredVenues = ['smokey']
      expect(isPreferredVenue('The Blue Note', preferredVenues)).toBe(false)
    })
  })

  describe('getMatchColor', () => {
    it('returns correct color for high match scores (85+)', () => {
      expect(getMatchColor(85)).toBe('text-green-600 bg-green-50')
      expect(getMatchColor(90)).toBe('text-green-600 bg-green-50')
      expect(getMatchColor(100)).toBe('text-green-600 bg-green-50')
    })

    it('returns correct color for medium match scores (70-84)', () => {
      expect(getMatchColor(70)).toBe('text-blue-600 bg-blue-50')
      expect(getMatchColor(75)).toBe('text-blue-600 bg-blue-50')
      expect(getMatchColor(84)).toBe('text-blue-600 bg-blue-50')
    })

    it('returns correct color for low match scores (<70)', () => {
      expect(getMatchColor(0)).toBe('text-gray-600 bg-gray-50')
      expect(getMatchColor(50)).toBe('text-gray-600 bg-gray-50')
      expect(getMatchColor(69)).toBe('text-gray-600 bg-gray-50')
    })
  })
})
