/**
 * EventCard Component Tests
 * Simplified to focus on core functionality without brittle assertions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventCard from './EventCard'

// Mock event data
const mockEvent = {
  id: '1',
  name: 'Test Concert',
  venue: 'Test Venue',
  dates: [{ date: '2025-12-25', id: '1', ticketUrl: 'https://tickets.com' }],
  time: '19:00:00',
  genres: ['Rock', 'Pop'],
  imageUrl: 'https://example.com/image.jpg',
  description: 'A great concert event',
  ticketUrl: 'https://tickets.com',
  source: 'ticketmaster',
  youtubeLinks: [
    { url: 'https://youtube.com/watch?v=test1', title: 'Song 1 - Artist Name' },
    { url: 'https://youtube.com/watch?v=test2', title: 'Song 2 - Artist Name' },
  ],
}

const mockEventMultipleDates = {
  ...mockEvent,
  dates: [
    { date: '2025-12-25', id: '1', ticketUrl: 'https://tickets.com/1' },
    { date: '2025-12-26', id: '2', ticketUrl: 'https://tickets.com/2' },
    { date: '2025-12-27', id: '3', ticketUrl: 'https://tickets.com/3' },
  ],
}

describe('EventCard', () => {
  const mockOnToggleFavorite = vi.fn()
  const mockOnHide = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders event name', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByText('Test Concert')).toBeInTheDocument()
    })

    it('renders venue name', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByText('Test Venue')).toBeInTheDocument()
    })

    it('renders event image', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      const image = screen.getByAltText('Test Concert')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('renders genre tags', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByText('Rock')).toBeInTheDocument()
      expect(screen.getByText('Pop')).toBeInTheDocument()
    })
  })

  describe('Favorite Functionality', () => {
    it('shows unfilled heart when not favorited', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      const favoriteButton = screen.getByTitle('Favorite')
      const heartIcon = favoriteButton.querySelector('svg')
      expect(heartIcon).not.toHaveClass('fill-tertiary')
    })

    it('shows filled heart when favorited', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={true}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      const favoriteButton = screen.getByTitle('Favorite')
      const heartIcon = favoriteButton.querySelector('svg')
      expect(heartIcon).toHaveClass('fill-tertiary')
    })

    it('calls onToggleFavorite when favorite button clicked', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      const favoriteButton = screen.getByTitle('Favorite')
      fireEvent.click(favoriteButton)
      expect(mockOnToggleFavorite).toHaveBeenCalledTimes(1)
    })
  })

  describe('Hide Functionality', () => {
    it('calls onHide when X button clicked', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      const hideButton = screen.getByTitle('Hide event')
      fireEvent.click(hideButton)
      expect(mockOnHide).toHaveBeenCalledTimes(1)
    })
  })

  describe('Multiple Dates', () => {
    it('shows date count when multiple dates', () => {
      render(
        <EventCard
          event={mockEventMultipleDates}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByText('3 dates')).toBeInTheDocument()
    })

    it('has show dates button for multiple dates', () => {
      render(
        <EventCard
          event={mockEventMultipleDates}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByText('▼ Show Dates')).toBeInTheDocument()
    })
  })

  describe('Description', () => {
    it('has show description button', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByText('▼ Show Description')).toBeInTheDocument()
    })
  })

  describe('YouTube Integration', () => {
    it('shows YouTube button when videos available', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByText('▼ Listen on YouTube')).toBeInTheDocument()
    })

    it('does not show YouTube button when no videos', () => {
      const eventWithoutYouTube = { ...mockEvent, youtubeLinks: [] }
      render(
        <EventCard
          event={eventWithoutYouTube}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.queryByText('▼ Listen on YouTube')).not.toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('renders calendar button', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByTitle('Add to calendar')).toBeInTheDocument()
    })

    it('renders share button', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByTitle('Share event')).toBeInTheDocument()
    })

    it('renders directions button', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByTitle('Get directions')).toBeInTheDocument()
    })

    it('renders ticket button with link', () => {
      render(
        <EventCard
          event={mockEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      const ticketButton = screen.getByText('Get Tickets')
      expect(ticketButton).toBeInTheDocument()
      expect(ticketButton.closest('a')).toHaveAttribute('href', 'https://tickets.com')
    })
  })

  describe('Title Case Conversion', () => {
    it('converts all-caps event name to title case', () => {
      const capsEvent = { ...mockEvent, name: 'LOUD CONCERT EVENT' }
      render(
        <EventCard
          event={capsEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByText('Loud Concert Event')).toBeInTheDocument()
    })

    it('preserves mixed case event names', () => {
      const mixedEvent = { ...mockEvent, name: 'The Rolling Stones' }
      render(
        <EventCard
          event={mixedEvent}
          isFavorite={false}
          onToggleFavorite={mockOnToggleFavorite}
          onHide={mockOnHide}
        />
      )
      expect(screen.getByText('The Rolling Stones')).toBeInTheDocument()
    })
  })
})
