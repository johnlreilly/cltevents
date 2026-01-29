# CLT Events - Architecture Overview

## Frontend

- **React 18** - UI component framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework with Material Design 3 theming (dark/light mode)
- **PostCSS / Autoprefixer** - CSS processing

## Backend

- **Vercel Serverless Functions** - Node.js API endpoints for event aggregation, scraping, and video search
- **Custom In-Memory Caching** - Server-side cache with TTL support
- **IP-Based Rate Limiting** - Protects external API calls (e.g., YouTube)

## APIs & Data Sources

- **Ticketmaster Discovery API** - Music, sports, and entertainment events across Charlotte, Asheville, and Raleigh
- **YouTube Data API v3** - Artist/band video search with 7-day cache
- **CLTtoday RSS Feed** - General Charlotte events via RSS/XML parsing
- **Venue Web Scrapers** - Custom scrapers for local venues:
  - Smokey Joe's Cafe
  - The Fillmore Charlotte (JSON-LD structured data)
  - Amos' Southend
  - Jazz Room
  - Snug Harbor
  - Comet Grill

## Testing

- **Vitest** - Unit and component testing (Jest-compatible)
- **React Testing Library** - Component rendering and interaction tests
- **Playwright** - End-to-end testing across Chromium, Firefox, WebKit, and mobile (Pixel 5, iPhone 12)

## Infrastructure & Deployment

- **Vercel** - Frontend hosting and serverless function deployment
- **AWS CloudFront + S3** - CDN and static asset distribution
- **Terraform (OpenTofu)** - Infrastructure as code for AWS provisioning
- **Dagger** - Container-based CI/CD pipelines (lint, test, build, deploy)
- **GitHub Actions** - Deployment automation triggered on main branch pushes

## Code Quality

- **ESLint** - Linting with React and Hooks plugins
- **Prettier** - Code formatting

## Other Libraries

- **smartcrop** - Intelligent image cropping for event cards

## Key Architectural Patterns

- **Multi-source event aggregation** from 7+ venues and Ticketmaster
- **Priority artist tracking** across the Southeast region via Ticketmaster artist IDs
- **Custom hooks** for events, filters, localStorage, and theming
- **Multi-layer caching** on both client and server
- **Responsive design** supporting desktop and mobile devices

---

# Documentation

This directory contains all project documentation.

## Documentation Index

### Getting Started
- **[Main README](../README.md)** - Project overview and quick start
- **[Quick Start AWS](QUICK-START-AWS.md)** - 30-minute AWS deployment guide

### Deployment Guides
- **[AWS Deployment](AWS-DEPLOYMENT.md)** - Complete AWS deployment with Terraform & Dagger
- **[Migration Plan](MIGRATION-PLAN.md)** - Detailed plan for migrating from Vercel to AWS

### Recreation Guide
- **[Recreation Prompts](RECREATION-PROMPTS.md)** - Recreate the entire project with Claude Code prompts
- **[Recreation Prompts (TXT)](RECREATION-PROMPTS.txt)** - Plain text version for easy transfer

### Development History
- **[Migration Guide](MIGRATION_GUIDE.md)** - React refactoring migration guide
- **[Refactoring Complete](REFACTORING_COMPLETE.md)** - React refactoring summary
- **[Progress Summary](PROGRESS_SUMMARY.md)** - Development progress tracking

### Research & Planning
- **[Artist and Venue Tracking](ARTIST_AND_VENUE_TRACKING.md)** - Artist tracking implementation
- **[Venue Research](VENUE_RESEARCH.md)** - Venue data source research

## Quick Links

**For New Developers:**
1. Read [Main README](../README.md)
2. Follow [Recreation Prompts](RECREATION-PROMPTS.md) to set up from scratch

**For Deployment:**
1. Local: Run `npm run dev` (see main README)
2. Vercel: Push to git (automatic)
3. AWS: Follow [Quick Start AWS](QUICK-START-AWS.md)

**For Infrastructure:**
- Terraform configs: `../terraform/`
- Dagger pipeline: `../dagger/`
- GitHub Actions: `../.github/workflows/`

## Documentation Standards

When adding new documentation:
- Use clear headings and structure
- Include code examples where relevant
- Add table of contents for long documents
- Keep this index updated
