/**
 * E2E Tests for Event Card Interactions
 * Tests event card functionality like favoriting, hiding, expanding details
 */

import { test, expect } from '@playwright/test'

test.describe('Event Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for events to load
    await page.waitForSelector('.bg-surface.rounded-3xl', { timeout: 15000 })
  })

  test('should favorite an event', async ({ page }) => {
    // Find the first event card's favorite button
    const firstEvent = page.locator('.bg-surface.rounded-3xl').first()
    const favoriteButton = firstEvent.getByTitle('Favorite')

    // Click to favorite
    await favoriteButton.click()

    // Heart icon should be filled (has fill-tertiary class)
    const heartIcon = favoriteButton.locator('svg')
    await expect(heartIcon).toHaveClass(/fill-tertiary/)
  })

  test('should hide an event', async ({ page }) => {
    // Get initial event count
    const initialCount = await page.locator('.bg-surface.rounded-3xl').count()

    // Find the first event card
    const firstEvent = page.locator('.bg-surface.rounded-3xl').first()

    // Get the event name for verification
    const eventName = await firstEvent.locator('h3').textContent()

    // Click hide button
    await firstEvent.getByTitle('Hide event').click()

    // Wait a moment
    await page.waitForTimeout(500)

    // Event should be hidden (count decreased)
    const newCount = await page.locator('.bg-surface.rounded-3xl').count()
    expect(newCount).toBeLessThan(initialCount)

    // Event name should not be visible anymore
    await expect(page.locator(`text="${eventName}"`)).not.toBeVisible()
  })

  test('should expand event description', async ({ page }) => {
    // Find first event card
    const firstEvent = page.locator('.bg-surface.rounded-3xl').first()

    // Look for "Show Description" button
    const showDescButton = firstEvent.getByText('▼ Show Description')

    if (await showDescButton.isVisible()) {
      // Click to expand
      await showDescButton.click()

      // "Hide Description" button should appear
      await expect(firstEvent.getByText('▲ Hide Description')).toBeVisible()
    }
  })

  test('should expand multiple dates', async ({ page }) => {
    // Find an event with multiple dates
    const multiDateEvent = page.locator('text=/\\d+ dates/').first()

    if (await multiDateEvent.isVisible()) {
      const eventCard = multiDateEvent.locator('..').locator('..')

      // Click "Show Dates"
      await eventCard.getByText('▼ Show Dates').click()

      // "Available Dates:" heading should appear
      await expect(eventCard.getByText('Available Dates:')).toBeVisible()

      // "Hide Dates" button should appear
      await expect(eventCard.getByText('▲ Hide Dates')).toBeVisible()
    }
  })

  test('should open YouTube player', async ({ page }) => {
    // Find event with YouTube button
    const youtubeButton = page.getByText('▼ Listen on YouTube').first()

    if (await youtubeButton.isVisible()) {
      const eventCard = youtubeButton.locator('..').locator('..')

      // Click to open
      await youtubeButton.click()

      // YouTube player panel should appear
      await expect(eventCard.getByText('Listen on YouTube')).toBeVisible()
      await expect(eventCard.getByText('Close YouTube')).toBeVisible()
    }
  })

  test('should have working ticket button', async ({ page }) => {
    // Find first "Get Tickets" button
    const ticketButton = page.getByText('Get Tickets').first()

    // Should be visible and have href
    await expect(ticketButton).toBeVisible()

    const href = await ticketButton.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href?.startsWith('http')).toBeTruthy()
  })
})
