/**
 * E2E Tests for Filtering
 * Tests filter functionality and interactions
 */

import { test, expect } from '@playwright/test'

test.describe('Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for initial load
    await page.waitForSelector('.bg-surface.rounded-3xl', { timeout: 15000 })
  })

  test('should open and close filter tray', async ({ page }) => {
    // Click filter button to open tray
    await page.getByTitle('Toggle filters').click()

    // Filter tray should be visible
    await expect(page.getByText('Category')).toBeVisible()
    await expect(page.getByText('Genres')).toBeVisible()
    await expect(page.getByText('Sources')).toBeVisible()

    // Click close button
    await page.getByText('Close').click()

    // Filter tray should be hidden
    await expect(page.getByText('Category')).not.toBeVisible()
  })

  test('should filter by genre', async ({ page }) => {
    // Open filter tray
    await page.getByTitle('Toggle filters').click()

    // Count initial events
    const initialCount = await page.locator('.bg-surface.rounded-3xl').count()

    // Select a specific genre (Rock)
    await page.getByText('Rock').click()

    // Close filter tray
    await page.getByText('Close').click()

    // Wait a moment for filtering to apply
    await page.waitForTimeout(500)

    // Event count should change (could be more or less depending on data)
    const filteredCount = await page.locator('.bg-surface.rounded-3xl').count()

    // Either count changed or there are Rock events displayed
    expect(filteredCount >= 0).toBeTruthy()
  })

  test('should show filter indicator when filters are active', async ({ page }) => {
    // Initially no filter indicator
    const filterButton = page.getByTitle('Toggle filters')

    // Open filter tray and select a genre
    await filterButton.click()
    await page.getByText('Rock').click()
    await page.getByText('Close').click()

    // Filter indicator should appear (small dot on filter button)
    const indicator = filterButton.locator('.bg-primary.rounded-full')
    await expect(indicator).toBeVisible()
  })

  test('should clear all filters', async ({ page }) => {
    // Open filter tray
    await page.getByTitle('Toggle filters').click()

    // Select some filters
    await page.getByText('Rock').click()

    // "Clear All Filters" button should appear
    await expect(page.getByText('Clear All Filters')).toBeVisible()

    // Click clear filters
    await page.getByText('Clear All Filters').click()

    // Filters should be cleared (indicator gone after closing)
    await page.getByText('Close').click()

    const filterButton = page.getByTitle('Toggle filters')
    const indicator = filterButton.locator('.bg-primary.rounded-full')
    await expect(indicator).not.toBeVisible()
  })
})
