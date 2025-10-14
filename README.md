# CLT.show - Charlotte Events Discovery

> All Charlotte shows in one place!

## 🎯 Project Overview

CLT.show is a React-based web application that aggregates events from multiple sources (Ticketmaster, Smokey Joe's, CLTtoday) and presents them in a unified, filterable interface with YouTube integration.

## 🏗️ Architecture

This project demonstrates modern React development best practices using AI-assisted development:

### Technology Stack
- **Frontend**: React 18 with Hooks
- **Build Tool**: Vite (fast, modern build tool)
- **Styling**: Tailwind CSS with Material Design 3 colors
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier
- **Deployment**: Vercel (main → production, dev → staging)

### Project Structure

```
cltevents/
├── api/                    # Vercel serverless functions
│   └── youtube.js         # YouTube API integration
├── src/
│   ├── components/        # React components
│   │   ├── EventCard/    # Event display component
│   │   ├── FilterTray/   # Filtering UI
│   │   ├── Header/       # Top navigation
│   │   └── YouTubePlayer/ # YouTube integration
│   ├── hooks/            # Custom React hooks
│   │   ├── useEvents.js  # Event data management
│   │   ├── useFilters.js # Filter state logic
│   │   └── useLocalStorage.js # localStorage wrapper
│   ├── utils/            # Utility functions
│   │   ├── dateUtils.js  # Date formatting
│   │   ├── eventUtils.js # Event processing
│   │   └── youtubeUtils.js # YouTube helpers
│   ├── test/             # Test setup and utilities
│   │   └── setup.js      # Vitest configuration
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles + Tailwind
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI for interactive testing
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🧪 Testing

This project uses **Vitest** (compatible with Jest) and **React Testing Library** for testing.

### Test Structure
- Unit tests for utilities (date formatting, URL parsing, etc.)
- Component tests for UI interactions
- Integration tests for complete user flows

### Running Tests

```bash
# Watch mode (recommended during development)
npm test

# Single run with coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

### Writing Tests

Example test structure:

```javascript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EventCard from './EventCard'

describe('EventCard', () => {
  it('renders event name', () => {
    const event = { name: 'Test Concert', venue: 'Test Venue' }
    render(<EventCard event={event} />)
    expect(screen.getByText('Test Concert')).toBeInTheDocument()
  })
})
```

## 📝 Code Quality

### ESLint
Enforces code style and catches common errors:
```bash
npm run lint
```

### Prettier
Automatically formats code:
```bash
npm run format
```

### Pre-commit Hooks (Coming Soon)
Automatically run lint and tests before commits using Husky

## 🎨 Design System

Using **Material Design 3** color palette with Tailwind CSS:

- Primary: `#6750A4` (purple)
- Surface: `#FEF7FF` (light purple)
- Tertiary: `#7D5260` (rose)

See `tailwind.config.js` for full color definitions.

## 🔧 Development Workflow

1. **Feature Development**
   - Create feature branch from `dev`
   - Write tests first (TDD recommended)
   - Implement feature
   - Run tests and linting
   - Push to `dev` branch

2. **Testing on Staging**
   - `dev` branch auto-deploys to dev.clt.show
   - Test thoroughly on staging

3. **Production Deployment**
   - Merge `dev` → `main`
   - `main` branch auto-deploys to clt.show

## 📚 Learning Resources

This project demonstrates:

- **Component Composition** - Breaking down a monolithic component
- **Custom Hooks** - Extracting stateful logic
- **Test-Driven Development** - Writing tests first
- **JSDoc Documentation** - Self-documenting code
- **Git Workflow** - Feature branches, dev/main strategy
- **CI/CD** - Automated testing and deployment

## 🤝 Contributing

1. Create a feature branch from `dev`
2. Write tests for your changes
3. Ensure all tests pass (`npm test`)
4. Ensure code is formatted (`npm run format`)
5. Push to `dev` and test on dev.clt.show
6. Create PR to merge into `main`

## 📄 License

MIT

## 🙏 Acknowledgments

Built with AI assistance to demonstrate modern SDLC best practices.
