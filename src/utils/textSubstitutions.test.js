/**
 * Tests for text substitution utilities
 */

import { describe, it, expect } from 'vitest'
import { applyTextSubstitutions, applyEventSubstitutions } from './textSubstitutions'

describe('applyTextSubstitutions', () => {
  it('replaces "cltfc" with "Charlotte FC" (case insensitive)', () => {
    expect(applyTextSubstitutions('Come see Cltfc play tonight!')).toBe('Come see Charlotte FC play tonight!')
  })

  it('replaces "CLTFC" with "Charlotte FC"', () => {
    expect(applyTextSubstitutions('CLTFC vs Atlanta United')).toBe('Charlotte FC vs Atlanta United')
  })

  it('replaces "cltfc" (lowercase) with "Charlotte FC"', () => {
    expect(applyTextSubstitutions('cltfc game tonight')).toBe('Charlotte FC game tonight')
  })

  it('replaces "CLT FC" with "Charlotte FC"', () => {
    expect(applyTextSubstitutions('CLT FC is playing')).toBe('Charlotte FC is playing')
  })

  it('handles multiple occurrences', () => {
    expect(applyTextSubstitutions('Cltfc and CLTFC are the same team')).toBe(
      'Charlotte FC and Charlotte FC are the same team'
    )
  })

  it('returns unchanged text when no substitutions match', () => {
    expect(applyTextSubstitutions('Charlotte Hornets game')).toBe('Charlotte Hornets game')
  })

  it('handles null and undefined', () => {
    expect(applyTextSubstitutions(null)).toBe(null)
    expect(applyTextSubstitutions(undefined)).toBe(undefined)
  })

  it('handles empty string', () => {
    expect(applyTextSubstitutions('')).toBe('')
  })
})

describe('applyEventSubstitutions', () => {
  it('applies substitutions to event name', () => {
    const event = {
      name: 'Cltfc vs Atlanta',
      venue: 'Bank of America Stadium',
      description: 'Come watch CLTFC play!',
    }

    const result = applyEventSubstitutions(event)

    expect(result.name).toBe('Charlotte FC vs Atlanta')
    expect(result.venue).toBe('Bank of America Stadium')
    expect(result.description).toBe('Come watch Charlotte FC play!')
  })

  it('applies substitutions to venue name', () => {
    const event = {
      name: 'Soccer Game',
      venue: 'Cltfc Stadium',
    }

    const result = applyEventSubstitutions(event)

    expect(result.venue).toBe('Charlotte FC Stadium')
  })

  it('applies substitutions to location object', () => {
    const event = {
      name: 'Game Night',
      location: {
        name: 'CLTFC Training Facility',
        city: 'Charlotte',
      },
    }

    const result = applyEventSubstitutions(event)

    expect(result.location.name).toBe('Charlotte FC Training Facility')
    expect(result.location.city).toBe('Charlotte')
  })

  it('preserves other event properties', () => {
    const event = {
      id: 'event-123',
      name: 'Cltfc Match',
      date: '2025-10-17',
      price: 50,
      genres: ['Sports'],
    }

    const result = applyEventSubstitutions(event)

    expect(result.id).toBe('event-123')
    expect(result.date).toBe('2025-10-17')
    expect(result.price).toBe(50)
    expect(result.genres).toEqual(['Sports'])
  })

  it('handles null event', () => {
    expect(applyEventSubstitutions(null)).toBe(null)
  })
})
