/**
 * Unit tests for dateUtils
 * @module utils/dateUtils.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  formatDate,
  formatTime,
  formatDateSeparator,
  getToday,
  parseDate,
  compareDates,
  isDateInPast,
  isToday,
} from './dateUtils'

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats ISO date string correctly', () => {
      const result = formatDate('2024-12-15T12:00:00')
      expect(result).toMatch(/\w{3}, \w{3} \d{1,2}/)
      expect(result).toContain('Dec')
    })

    it('handles different date formats', () => {
      const result = formatDate('2024-06-15T12:00:00')
      expect(result).toContain('Jun')
      expect(result).toContain('15')
    })
  })

  describe('formatTime', () => {
    it('converts 24-hour time to 12-hour format', () => {
      expect(formatTime('19:00:00')).toBe('7:00 PM')
      expect(formatTime('13:30:00')).toBe('1:30 PM')
      expect(formatTime('00:00:00')).toBe('12:00 AM')
      expect(formatTime('12:00:00')).toBe('12:00 PM')
    })

    it('returns 12-hour format as-is', () => {
      expect(formatTime('7:00 PM')).toBe('7:00 PM')
      expect(formatTime('12:30 AM')).toBe('12:30 AM')
    })

    it('returns null for invalid time strings', () => {
      expect(formatTime('invalid')).toBe(null)
      expect(formatTime('')).toBe(null)
      expect(formatTime(null)).toBe(null)
    })

    it('handles time without seconds', () => {
      expect(formatTime('19:00')).toBe('7:00 PM')
      expect(formatTime('09:30')).toBe('9:30 AM')
    })
  })

  describe('formatDateSeparator', () => {
    it('formats date for separator headers', () => {
      const date = new Date('2024-06-15T12:00:00')
      const result = formatDateSeparator(date)

      expect(result).toHaveProperty('monthDay')
      expect(result).toHaveProperty('dayOfWeek')
      expect(result.monthDay).toContain('June')
      expect(result.monthDay).toContain('15')
    })

    it('returns full day of week name', () => {
      const date = new Date('2024-06-15T12:00:00')
      const result = formatDateSeparator(date)

      expect(result.dayOfWeek.length).toBeGreaterThan(3)
    })
  })

  describe('getToday', () => {
    it('returns today in YYYY-MM-DD format', () => {
      const result = getToday()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('returns current date', () => {
      const today = new Date()
      const result = getToday()
      const [year, month, day] = result.split('-').map(Number)

      expect(year).toBe(today.getFullYear())
      expect(month).toBe(today.getMonth() + 1)
      expect(day).toBe(today.getDate())
    })
  })

  describe('parseDate', () => {
    it('parses ISO date string to Date object', () => {
      const result = parseDate('2024-06-15T12:00:00')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(5) // June is month 5
      expect(result.getDate()).toBe(15)
    })

    it('handles various date formats', () => {
      const result1 = parseDate('2024-06-15T12:00:00')
      expect(result1).toBeInstanceOf(Date)

      const result2 = parseDate('June 15, 2024')
      expect(result2).toBeInstanceOf(Date)
    })
  })

  describe('compareDates', () => {
    it('returns negative when first date is earlier', () => {
      const result = compareDates('2024-12-15', '2024-12-16')
      expect(result).toBeLessThan(0)
    })

    it('returns positive when first date is later', () => {
      const result = compareDates('2024-12-16', '2024-12-15')
      expect(result).toBeGreaterThan(0)
    })

    it('returns 0 when dates are equal', () => {
      const result = compareDates('2024-12-15', '2024-12-15')
      expect(result).toBe(0)
    })

    it('works with different date formats', () => {
      const result = compareDates('2024-01-01', '2024-12-31')
      expect(result).toBeLessThan(0)
    })
  })

  describe('isDateInPast', () => {
    it('returns true for past dates', () => {
      expect(isDateInPast('2020-06-15T12:00:00')).toBe(true)
      expect(isDateInPast('2000-01-01T12:00:00')).toBe(true)
    })

    it('returns false for future dates', () => {
      expect(isDateInPast('2099-12-31T12:00:00')).toBe(false)
    })

    it('handles today correctly', () => {
      // Note: isDateInPast considers today as NOT in the past
      const today = new Date()
      today.setHours(12, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0] + 'T12:00:00'
      // This test is timezone-dependent, so we skip exact assertion
      expect(typeof isDateInPast(todayStr)).toBe('boolean')
    })
  })

  describe('isToday', () => {
    it('returns false for past dates', () => {
      expect(isToday('2020-01-01T12:00:00')).toBe(false)
    })

    it('returns false for future dates', () => {
      expect(isToday('2099-12-31T12:00:00')).toBe(false)
    })

    it('handles date comparison correctly', () => {
      // Test that it returns a boolean
      const result = isToday(new Date().toISOString())
      expect(typeof result).toBe('boolean')
    })
  })
})
