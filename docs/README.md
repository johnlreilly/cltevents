# Documentation

This directory contains all project documentation.

## 📚 Documentation Index

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

## 🗂️ Quick Links

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

## 📖 Documentation Standards

When adding new documentation:
- Use clear headings and structure
- Include code examples where relevant
- Add table of contents for long documents
- Keep this index updated
