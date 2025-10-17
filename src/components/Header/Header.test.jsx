/**
 * Header Component Tests
 * Simplified to test Header functionality without deep FilterTray integration
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'

// Mock FilterTray to avoid complex dropdown testing
vi.mock('../FilterTray/FilterTray', () => ({
  default: ({ onClose }) => <div data-testid="filter-tray"><button onClick={onClose}>Close</button></div>
}))

describe('Header', () => {
  const mockProps = {
    onRefresh: vi.fn(),
    loading: false,
    onToggleFilters: vi.fn(),
    showFilterTray: false,
    hasActiveFilters: false,
    selectedCategory: 'all',
    onCategoryChange: vi.fn(),
    selectedGenres: [],
    onGenreToggle: vi.fn(),
    availableGenres: ['Rock', 'Pop', 'Jazz'],
    selectedSources: [],
    onSourceToggle: vi.fn(),
    sortBy: 'date',
    onSortChange: vi.fn(),
    onClearFilters: vi.fn(),
  }

  describe('Basic Rendering', () => {
    it('renders the app title', () => {
      render(<Header {...mockProps} />)
      expect(screen.getByText('CLT.show')).toBeInTheDocument()
    })

    it('renders filter button', () => {
      render(<Header {...mockProps} />)
      expect(screen.getByTitle('Toggle filters')).toBeInTheDocument()
    })

    it('renders refresh button', () => {
      render(<Header {...mockProps} />)
      expect(screen.getByTitle('Refresh events')).toBeInTheDocument()
    })
  })

  describe('Filter Toggle', () => {
    it('calls onToggleFilters when filter button clicked', () => {
      render(<Header {...mockProps} />)
      const filterButton = screen.getByTitle('Toggle filters')
      fireEvent.click(filterButton)
      expect(mockProps.onToggleFilters).toHaveBeenCalledTimes(1)
    })

    it('shows active filter indicator when filters are active and tray is closed', () => {
      render(<Header {...mockProps} hasActiveFilters={true} showFilterTray={false} />)
      const filterButton = screen.getByTitle('Toggle filters')
      const indicator = filterButton.querySelector('.bg-primary')
      expect(indicator).toBeInTheDocument()
    })

    it('hides active filter indicator when filter tray is open', () => {
      render(<Header {...mockProps} hasActiveFilters={true} showFilterTray={true} />)
      const filterButton = screen.getByTitle('Toggle filters')
      const indicator = filterButton.querySelector('.bg-primary')
      expect(indicator).not.toBeInTheDocument()
    })

    it('applies active styling when filter tray is open', () => {
      render(<Header {...mockProps} showFilterTray={true} />)
      const filterButton = screen.getByTitle('Toggle filters')
      expect(filterButton).toHaveClass('bg-primarycontainer')
    })
  })

  describe('Refresh Button', () => {
    it('calls onRefresh when refresh button clicked', () => {
      render(<Header {...mockProps} />)
      const refreshButton = screen.getByTitle('Refresh events')
      fireEvent.click(refreshButton)
      expect(mockProps.onRefresh).toHaveBeenCalledTimes(1)
    })

    it('disables refresh button when loading', () => {
      render(<Header {...mockProps} loading={true} />)
      const refreshButton = screen.getByTitle('Refresh events')
      expect(refreshButton).toBeDisabled()
    })

    it('enables refresh button when not loading', () => {
      render(<Header {...mockProps} loading={false} />)
      const refreshButton = screen.getByTitle('Refresh events')
      expect(refreshButton).not.toBeDisabled()
    })

    it('applies disabled styling when loading', () => {
      render(<Header {...mockProps} loading={true} />)
      const refreshButton = screen.getByTitle('Refresh events')
      expect(refreshButton).toHaveClass('disabled:opacity-50')
    })
  })

  describe('Filter Tray Display', () => {
    it('hides filter tray by default', () => {
      render(<Header {...mockProps} showFilterTray={false} />)
      expect(screen.queryByTestId('filter-tray')).not.toBeInTheDocument()
    })

    it('shows filter tray when showFilterTray is true', () => {
      render(<Header {...mockProps} showFilterTray={true} />)
      expect(screen.getByTestId('filter-tray')).toBeInTheDocument()
    })

    it('applies rounded corners when filter tray is open', () => {
      const { container } = render(<Header {...mockProps} showFilterTray={true} />)
      const headerDiv = container.querySelector('.rounded-b-3xl')
      expect(headerDiv).toBeInTheDocument()
    })
  })

  describe('Sticky Header', () => {
    it('applies sticky positioning', () => {
      const { container } = render(<Header {...mockProps} />)
      const headerDiv = container.querySelector('.sticky')
      expect(headerDiv).toBeInTheDocument()
    })

    it('applies high z-index for stacking', () => {
      const { container } = render(<Header {...mockProps} />)
      const headerDiv = container.querySelector('.z-30')
      expect(headerDiv).toBeInTheDocument()
    })
  })

  describe('FilterTray Integration', () => {
    it('passes onClose callback to FilterTray', () => {
      render(<Header {...mockProps} showFilterTray={true} />)

      // FilterTray (mocked) should have a close button
      const closeButton = screen.getByText('Close')
      expect(closeButton).toBeInTheDocument()

      // Clicking close should call onToggleFilters
      fireEvent.click(closeButton)
      expect(mockProps.onToggleFilters).toHaveBeenCalled()
    })
  })
})
