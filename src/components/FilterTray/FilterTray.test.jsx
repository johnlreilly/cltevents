/**
 * FilterTray Component Tests
 * Minimal tests focusing on core functionality
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterTray from './FilterTray'

describe('FilterTray', () => {
  const mockProps = {
    selectedCategory: 'all',
    onCategoryChange: vi.fn(),
    selectedGenres: [],
    onGenreToggle: vi.fn(),
    availableGenres: ['Rock', 'Pop', 'Jazz', 'Classical'],
    selectedSources: [],
    onSourceToggle: vi.fn(),
    sortBy: 'date',
    onSortChange: vi.fn(),
    hasActiveFilters: false,
    onClearFilters: vi.fn(),
    onClose: vi.fn(),
  }

  describe('Basic Rendering', () => {
    it('renders the component', () => {
      const { container } = render(<FilterTray {...mockProps} />)
      // Just check that the component renders without crashing
      expect(container).toBeInTheDocument()
    })

    it('renders close button', () => {
      render(<FilterTray {...mockProps} />)
      expect(screen.getByText('Close')).toBeInTheDocument()
    })
  })

  describe('Clear Filters', () => {
    it('shows clear filters button when filters are active', () => {
      render(<FilterTray {...mockProps} hasActiveFilters={true} />)
      expect(screen.getByText('Clear All Filters')).toBeInTheDocument()
    })

    it('hides clear filters button when no filters are active', () => {
      render(<FilterTray {...mockProps} hasActiveFilters={false} />)
      expect(screen.queryByText('Clear All Filters')).not.toBeInTheDocument()
    })

    it('calls onClearFilters when clear button clicked', () => {
      render(<FilterTray {...mockProps} hasActiveFilters={true} />)

      const clearButton = screen.getByText('Clear All Filters')
      fireEvent.click(clearButton)

      expect(mockProps.onClearFilters).toHaveBeenCalledTimes(1)
    })
  })

  describe('Close Button', () => {
    it('calls onClose when close button clicked', () => {
      render(<FilterTray {...mockProps} />)

      const closeButton = screen.getByText('Close')
      fireEvent.click(closeButton)

      expect(mockProps.onClose).toHaveBeenCalledTimes(1)
    })
  })
})
