# Testing Setup

This document describes the comprehensive testing setup for CLT Events Discovery, including unit tests, component tests, and E2E tests.

## Overview

The project has three layers of testing:

1. **Unit Tests** - Utility functions (dateUtils, eventUtils, youtubeUtils)
2. **Component Tests** - React components (EventCard, Header, FilterTray)
3. **E2E Tests** - Full user flows with Playwright

**Total Test Coverage**: 123+ tests across all layers

## Test Stack

- **Vitest** - Fast unit and component test runner
- **React Testing Library** - Component testing utilities
- **Playwright** - E2E browser automation
- **jsdom** - DOM environment for component tests

## Running Tests

### Unit & Component Tests (Vitest)

```bash
# Run all unit/component tests
npm test

# Run tests once (CI mode)
npm run test:unit

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch mode (default)
npm test
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run with headed browsers (see the browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/homepage.spec.js

# Run specific browser
npx playwright test --project=chromium
```

### Run All Tests

```bash
# Run unit tests then E2E tests
npm run test:all
```

## Test Structure

### Unit Tests (81 tests)

Located in `src/utils/*.test.js`

**dateUtils.test.js** (22 tests)
- Date formatting
- Date parsing
- Date manipulation
- Relative date calculations

**youtubeUtils.test.js** (27 tests)
- YouTube title cleaning
- Video ID extraction
- Embed URL creation
- API caching

**eventUtils.test.js** (32 tests)
- Event grouping
- Event sorting
- Event filtering
- Genre extraction
- Title case conversion

### Component Tests (42 tests)

Located in `src/components/*/*.test.jsx`

**EventCard.test.jsx** (18 tests)
- Basic rendering (name, venue, image, genres)
- Favorite functionality (toggle, persistence)
- Hide functionality
- Multiple dates handling
- Description expansion
- YouTube integration
- Action buttons (calendar, share, directions, tickets)
- Title case conversion

**Header.test.jsx** (12 tests)
- Basic rendering (title, buttons)
- Filter toggle functionality
- Active filter indicator
- Refresh button (enabled/disabled states)
- Filter tray display
- Sticky positioning

**FilterTray.test.jsx** (5 tests)
- Component rendering
- Close button
- Clear filters functionality
- Filter state management

**ScrollToTop.test.jsx** (5 tests)
- Button visibility on scroll
- Smooth scroll to top
- Button positioning

**LoadingSpinner.test.jsx** (2 tests)
- Spinner renders
- Animation classes

### E2E Tests (Playwright)

Located in `e2e/*.spec.js`

**homepage.spec.js**
- Homepage loads successfully
- Events display after loading
- Date separators render
- Header elements visible

**filters.spec.js**
- Open/close filter tray
- Filter by genre
- Filter indicator displays
- Clear all filters

**event-interactions.spec.js**
- Favorite an event
- Hide an event
- Expand event description
- Expand multiple dates
- Open YouTube player
- Ticket button functionality

## Test Configuration

### Vitest Configuration

Located in `vite.config.js`:

```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.js',
  css: true,
}
```

**Setup File** (`src/test/setup.js`):
- Imports `@testing-library/jest-dom` matchers
- Cleans up after each test
- Mocks localStorage

### Playwright Configuration

Located in `playwright.config.js`:

**Features**:
- Tests 5 browsers (Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari)
- Runs dev server automatically
- Captures screenshots on failure
- Traces on retry
- Parallel execution

**Configuration**:
- Base URL: `http://localhost:3000`
- Test directory: `./e2e`
- Reporter: HTML
- Retries: 2 on CI, 0 locally

## Writing Tests

### Unit Test Example

```javascript
import { describe, it, expect } from 'vitest'
import { formatDate } from './dateUtils'

describe('formatDate', () => {
  it('formats date correctly', () => {
    const result = formatDate('2024-12-25')
    expect(result).toBe('Dec 25, 2024')
  })
})
```

### Component Test Example

```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventCard from './EventCard'

describe('EventCard', () => {
  it('calls onToggleFavorite when clicked', () => {
    const mockToggle = vi.fn()
    render(<EventCard event={mockEvent} onToggleFavorite={mockToggle} />)

    fireEvent.click(screen.getByTitle('Favorite'))
    expect(mockToggle).toHaveBeenCalled()
  })
})
```

### E2E Test Example

```javascript
import { test, expect } from '@playwright/test'

test('should load homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('CLT.show')
})
```

## CI/CD Integration

### Dagger Pipeline

The Dagger pipeline includes a test function:

```typescript
@func()
async test(source: Directory): Promise<string> {
  return await dag
    .container()
    .from("node:20-alpine")
    .withDirectory("/app", source)
    .withWorkdir("/app")
    .withExec(["npm", "install"])
    .withExec(["npm", "run", "test:unit"])
    .stdout()
}
```

### GitHub Actions

The workflow runs tests before deployment:

```yaml
- name: Run tests
  run: npm run test:unit

- name: Run build
  run: npm run build
```

## Test Best Practices

### Unit Tests
- Test pure functions with various inputs
- Test edge cases and error handling
- Mock external dependencies
- Keep tests fast and isolated

### Component Tests
- Test user interactions, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility
- Avoid testing styles directly
- Mock complex child components

### E2E Tests
- Test critical user journeys
- Use realistic data and scenarios
- Keep tests independent
- Use page object pattern for complex flows
- Handle loading states with proper waits

## Common Testing Patterns

### Mocking Functions

```javascript
import { vi } from 'vitest'

const mockFn = vi.fn()
mockFn.mockReturnValue('result')
expect(mockFn).toHaveBeenCalledWith('arg')
```

### Async Testing

```javascript
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### Testing localStorage

```javascript
// Mock is set up in src/test/setup.js
localStorage.setItem('key', 'value')
expect(localStorage.getItem('key')).toBe('value')
```

### Playwright Assertions

```javascript
// Wait for element
await expect(page.locator('h1')).toBeVisible()

// Check text
await expect(page.locator('h1')).toHaveText('CLT.show')

// Check count
await expect(page.locator('.event-card')).toHaveCount(10)
```

## Debugging Tests

### Vitest

```bash
# Run tests in watch mode
npm test

# Run specific test file
npm test src/utils/dateUtils.test.js

# Run tests matching pattern
npm test -- --grep "formatDate"

# Show test coverage
npm run test:coverage
```

### Playwright

```bash
# Debug mode (opens inspector)
npx playwright test --debug

# UI mode (interactive)
npm run test:e2e:ui

# Show trace
npx playwright show-trace trace.zip

# Generate test
npx playwright codegen http://localhost:3000
```

## Test Coverage Goals

| Category | Current | Goal |
|----------|---------|------|
| Unit Tests | 100% | 100% |
| Component Tests | ~70% | 85% |
| E2E Tests | Critical flows | All major flows |

## Continuous Improvement

### Next Steps

1. **Increase component test coverage**
   - EventList component tests
   - Hook tests (useEvents, useFilters, useLocalStorage)

2. **Add more E2E scenarios**
   - Scroll to top button
   - Calendar export
   - Share functionality
   - Multi-date ticket links

3. **Performance testing**
   - Lighthouse CI integration
   - Load time assertions
   - Bundle size tracking

4. **Visual regression testing**
   - Percy or Chromatic integration
   - Screenshot comparison
   - Component library

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: October 2025
**Test Count**: 123 tests (81 unit + 42 component + E2E)
**Status**: ✅ All tests passing
