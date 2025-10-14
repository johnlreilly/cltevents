/**
 * Unit tests for youtubeUtils
 * @module utils/youtubeUtils.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cleanYouTubeTitle,
  extractVideoId,
  isValidVideoId,
  createEmbedUrl,
  fetchYouTubeVideos,
} from './youtubeUtils'

describe('youtubeUtils', () => {
  describe('cleanYouTubeTitle', () => {
    it('removes (Official Video) from title', () => {
      const result = cleanYouTubeTitle('Band Name - Song (Official Video)')
      expect(result).toBe('Band Name - Song')
    })

    it('removes [Official Audio] from title', () => {
      const result = cleanYouTubeTitle('Artist - Track [Official Audio]')
      expect(result).toBe('Artist - Track')
    })

    it('removes - Official Video from end', () => {
      const result = cleanYouTubeTitle('Song Title - Official Video')
      expect(result).toBe('Song Title')
    })

    it('removes | Official Music Video from end', () => {
      const result = cleanYouTubeTitle('Artist Name | Official Music Video')
      expect(result).toBe('Artist Name')
    })

    it('removes LIVE AT venue text', () => {
      const result = cleanYouTubeTitle('Band - Song LIVE AT Red Rocks')
      expect(result).toBe('Band - Song')
    })

    it('removes venue names at end', () => {
      const result = cleanYouTubeTitle('Artist Performance at The Blue Note Jazz Club')
      expect(result).toBe('Artist Performance')
    })

    it('handles multiple noise patterns', () => {
      const result = cleanYouTubeTitle('Band - Song (Official Video) LIVE AT Venue')
      expect(result).toBe('Band - Song')
    })

    it('handles already clean titles', () => {
      const result = cleanYouTubeTitle('Simple Title')
      expect(result).toBe('Simple Title')
    })
  })

  describe('extractVideoId', () => {
    it('extracts video ID from youtube.com/watch?v= URL', () => {
      const result = extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      expect(result).toBe('dQw4w9WgXcQ')
    })

    it('extracts video ID from youtu.be/ URL', () => {
      const result = extractVideoId('https://youtu.be/dQw4w9WgXcQ')
      expect(result).toBe('dQw4w9WgXcQ')
    })

    it('handles URL with additional query parameters', () => {
      const result = extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')
      expect(result).toBe('dQw4w9WgXcQ')
    })

    it('handles youtu.be URL with query parameters', () => {
      const result = extractVideoId('https://youtu.be/dQw4w9WgXcQ?t=30')
      expect(result).toBe('dQw4w9WgXcQ')
    })

    it('returns null for invalid URLs', () => {
      expect(extractVideoId('https://example.com')).toBe(null)
      expect(extractVideoId('not a url')).toBe(null)
    })

    it('returns null for null or empty input', () => {
      expect(extractVideoId(null)).toBe(null)
      expect(extractVideoId('')).toBe(null)
    })

    it('returns null for video ID that is too short', () => {
      const result = extractVideoId('https://www.youtube.com/watch?v=abc')
      expect(result).toBe(null)
    })
  })

  describe('isValidVideoId', () => {
    it('returns true for valid video IDs', () => {
      expect(isValidVideoId('dQw4w9WgXcQ')).toBe(true)
      expect(isValidVideoId('12345')).toBe(true)
      expect(isValidVideoId('abcdefghijk')).toBe(true)
    })

    it('returns false for invalid video IDs', () => {
      expect(isValidVideoId('abc')).toBe(false)
      expect(isValidVideoId('1234')).toBe(false)
    })

    it('returns false for null, undefined, or non-string', () => {
      expect(isValidVideoId(null)).toBeFalsy()
      expect(isValidVideoId(undefined)).toBeFalsy()
      expect(isValidVideoId(123)).toBeFalsy()
      expect(isValidVideoId('')).toBeFalsy()
    })
  })

  describe('createEmbedUrl', () => {
    it('creates embed URL without autoplay', () => {
      const result = createEmbedUrl('dQw4w9WgXcQ')
      expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
    })

    it('creates embed URL with autoplay', () => {
      const result = createEmbedUrl('dQw4w9WgXcQ', true)
      expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1')
    })

    it('handles autoplay=false explicitly', () => {
      const result = createEmbedUrl('dQw4w9WgXcQ', false)
      expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
    })
  })

  describe('fetchYouTubeVideos', () => {
    let fetchMock

    beforeEach(() => {
      // Mock global fetch
      fetchMock = vi.fn()
      global.fetch = fetchMock
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('fetches and caches YouTube videos', async () => {
      const mockVideos = [
        { title: 'Video 1', url: 'https://youtube.com/watch?v=abc' },
        { title: 'Video 2', url: 'https://youtube.com/watch?v=def' },
      ]

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ videos: mockVideos }),
      })

      const cache = {}
      const result = await fetchYouTubeVideos('Test Artist', cache)

      expect(result).toEqual(mockVideos)
      expect(cache['test artist']).toEqual(mockVideos)
      expect(fetchMock).toHaveBeenCalledWith('/api/youtube?query=Test%20Artist')
    })

    it('returns cached results on second call', async () => {
      const mockVideos = [{ title: 'Video 1', url: 'https://youtube.com/watch?v=abc' }]
      const cache = { 'test artist': mockVideos }

      const result = await fetchYouTubeVideos('Test Artist', cache)

      expect(result).toEqual(mockVideos)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('handles API errors gracefully', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' }),
      })

      const cache = {}
      const result = await fetchYouTubeVideos('Test Artist', cache)

      expect(result).toEqual([])
      expect(cache['test artist']).toEqual([])
    })

    it('handles network errors gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const cache = {}
      const result = await fetchYouTubeVideos('Test Artist', cache)

      expect(result).toEqual([])
      expect(cache['test artist']).toEqual([])
    })

    it('caches empty results for failed requests', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const cache = {}
      await fetchYouTubeVideos('Test Artist', cache)

      // Second call should use cached empty array
      const result = await fetchYouTubeVideos('Test Artist', cache)

      expect(result).toEqual([])
      expect(fetchMock).toHaveBeenCalledTimes(1) // Only called once
    })

    it('normalizes cache keys (lowercase, trimmed)', async () => {
      const mockVideos = [{ title: 'Video 1', url: 'https://youtube.com/watch?v=abc' }]

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ videos: mockVideos }),
      })

      const cache = {}
      await fetchYouTubeVideos('  Test Artist  ', cache)

      expect(cache['test artist']).toEqual(mockVideos)
    })
  })
})
