/**
 * E2E Tests for Homepage
 * Tests core homepage functionality and initial load
 */

import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Check that the app title is visible
    await expect(page.locator('h1')).toHaveText('CLT.show')

    // Check that loading completes
    await expect(page.locator('text=Charlotte shows... all in one place!')).toBeVisible({ timeout: 10000 })
  })

  test('should display events after loading', async ({ page }) => {
    await page.goto('/')

    // Wait for events to load (look for event cards)
    await expect(page.locator('.bg-surface.rounded-3xl').first()).toBeVisible({ timeout: 15000 })

    // Check that at least one event card is displayed
    const eventCards = page.locator('.bg-surface.rounded-3xl')
    await expect(eventCards).toHaveCountGreaterThan(0)
  })

  test('should display date separators', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load
    await page.waitForSelector('.bg-surface.rounded-3xl', { timeout: 15000 })

    // Date separators should be visible
    const dateSeparators = page.locator('[id^="date-"]')
    await expect(dateSeparators.first()).toBeVisible()
  })

  test('should show header with filter and refresh buttons', async ({ page }) => {
    await page.goto('/')

    // Check header elements
    await expect(page.getByTitle('Toggle filters')).toBeVisible()
    await expect(page.getByTitle('Refresh events')).toBeVisible()
  })
})
