# CI/CD with GitHub Actions and Dagger

This document explains how our CI/CD pipeline works using GitHub Actions (orchestrator) and Dagger (portable build pipeline).

## Overview

**GitHub Actions** = The **orchestrator** (when/where to run)
**Dagger** = The **pipeline** (what to run)

Think of it this way:
- **GitHub Actions**: "When code is pushed to main, start a job on an Ubuntu runner"
- **Dagger**: "Here's exactly how to build and deploy, in a reproducible containerized way"

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│         GitHub Actions (Orchestrator - Host VM)            │
│  • When: Push to main                                      │
│  • Where: GitHub's Ubuntu VM (hosts Docker)                │
│  • What: Runs `dagger` CLI command                         │
│  • Secrets: AWS credentials from GitHub                    │
│                                                             │
│  This VM is just the host - it runs the Dagger CLI,        │
│  which spawns containers. The actual build/deploy          │
│  happens INSIDE containers, not on this VM.                │
│                                                             │
│           ↓ Dagger CLI spawns containers                   │
└────────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────────┐
│      Dagger Engine (Spawns Isolated Containers)           │
├────────────────────────────────────────────────────────────┤
│  Container 1: node:20-alpine                               │
│    • Completely isolated container                         │
│    • npm install                                           │
│    • npm run build                                         │
│    • Output: /app/dist                                     │
│                                                             │
│  Container 2: amazon/aws-cli                               │
│    • Different isolated container                          │
│    • aws s3 sync dist/ s3://bucket/                        │
│    • aws cloudfront create-invalidation                    │
│    • Output: Deployment success                            │
│                                                             │
│  All build/deploy logic runs in these containers,          │
│  NOT on the GitHub Actions VM!                             │
└────────────────────────────────────────────────────────────┘
```

### Key Distinction

**GitHub Actions VM (Host):**
- Provided by GitHub
- Runs Ubuntu Linux
- Has Docker installed
- Only purpose: Run the `dagger` CLI command
- Does NOT run your build or deploy commands directly

**Dagger Containers (Workhorses):**
- Spawned by Dagger Engine
- Isolated, reproducible environments
- `node:20-alpine` for building
- `amazon/aws-cli` for deploying
- ALL build/deploy logic happens here
- These are the same containers whether you run locally or on CI

### Why Do We Need the Host VM?

The GitHub Actions VM is just the **host machine** that:
1. Checks out your code from GitHub
2. Installs the Dagger CLI
3. Runs `dagger call deploy`
4. Dagger then spawns containers to do the actual work

Think of it like this:
- **Host VM** = The computer running Docker
- **Dagger Containers** = The isolated environments doing the work

You could replace the GitHub Actions VM with:
- Your laptop (running Docker)
- A GitLab CI runner (running Docker)
- A Jenkins server (running Docker)
- Any machine with Docker

The containers Dagger spawns would be identical in all cases!

## Why Use Both?

### GitHub Actions Alone (Traditional Approach)

```yaml
# Platform-specific - only works on GitHub Actions
- name: Install Node
  uses: actions/setup-node@v3
- name: Install dependencies
  run: npm install
- name: Build
  run: npm run build
- name: Deploy to AWS
  run: aws s3 sync dist/ s3://bucket/
```

**Drawbacks:**
- ❌ Only works on GitHub Actions
- ❌ Can't test locally
- ❌ Different from local dev environment
- ❌ Hard to debug issues
- ❌ Vendor lock-in

### Dagger with GitHub Actions (Modern Approach)

```yaml
# Portable - works everywhere
- name: Run Dagger pipeline
  run: dagger call deploy --source=.
```

**Benefits:**
- ✅ Works on GitHub Actions, GitLab CI, local machine, anywhere
- ✅ Can test the exact same pipeline locally
- ✅ Same containers everywhere (reproducible builds)
- ✅ Easy to debug locally
- ✅ No vendor lock-in

## Current Setup

### GitHub Actions Workflow

**File:** `.github/workflows/deploy-aws.yml`

**Triggers:**
- **Automatic:** Push to `main` branch
- **Manual:** `workflow_dispatch` (can trigger from GitHub UI)

**Infrastructure:**
- Runs on: `ubuntu-latest` (GitHub-provided VM)
- Node version: 20

**Workflow Steps:**

1. **Checkout code** - Get the repo from GitHub
2. **Set up Node.js** - Install Node.js 20
3. **Install Dagger CLI** - Download and install Dagger
4. **Install Dagger dependencies** - npm install in dagger/ folder
5. **Run Dagger deployment pipeline** - Execute the build and deploy
6. **Deployment summary** - Display success message

**Environment Variables (from GitHub Secrets):**
- `AWS_ACCESS_KEY_ID` - IAM user access key
- `AWS_SECRET_ACCESS_KEY` - IAM user secret key
- `AWS_REGION` - AWS region (us-east-1)
- `AWS_S3_BUCKET` - S3 bucket name (cltevents-production)
- `AWS_CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID

### Dagger Pipeline

**File:** `dagger/src/src/index.ts`

**Main Functions:**

#### 1. `build(source: Directory)`
- Uses `node:20-alpine` container
- Copies source code (excluding node_modules, dist, .git, etc.)
- Runs `npm install`
- Runs `npm run build`
- Returns the `/app/dist` directory

#### 2. `deploy(source, awsAccessKeyId, awsSecretAccessKey, s3Bucket, cloudfrontDistId, awsRegion)`
- Calls `build()` to get the dist folder
- Uses `amazon/aws-cli` container
- Syncs files to S3:
  - All files: 1-year cache (`max-age=31536000`)
  - index.html: 5-minute cache (`max-age=300`)
- Creates CloudFront invalidation to clear CDN cache
- Returns success message

#### 3. `test(source: Directory)`
- Uses `node:20-alpine` container
- Runs `npm install`
- Runs `npm test`
- Returns test results

#### 4. `pipeline(source: Directory, awsAccessKeyId, awsSecretAccessKey, s3Bucket, cloudfrontDistId, awsRegion)`
- Runs tests first
- If tests pass, runs deployment
- Returns deployment status

## Running Locally

### Prerequisites

1. Install Dagger CLI:
   ```bash
   curl -L https://dl.dagger.io/dagger/install.sh | sh
   ```

2. Have AWS credentials configured

### Local Deployment

```bash
cd dagger

# Full deployment (same as GitHub Actions)
dagger call deploy \
  --source=.. \
  --aws-access-key-id=$AWS_ACCESS_KEY_ID \
  --aws-secret-access-key=$AWS_SECRET_ACCESS_KEY \
  --s3-bucket=cltevents-production \
  --cloudfront-dist-id=E20LWZLV7TRPSE \
  --aws-region=us-east-1
```

### Local Build Only

```bash
cd dagger

# Build and export to local directory
dagger call build --source=.. export --path=../dist-local
```

### Local Tests

```bash
cd dagger

# Run tests in container
dagger call test --source=..
```

### Full Pipeline with Tests

```bash
cd dagger

# Run tests then deploy
dagger call pipeline \
  --source=.. \
  --aws-access-key-id=$AWS_ACCESS_KEY_ID \
  --aws-secret-access-key=$AWS_SECRET_ACCESS_KEY \
  --s3-bucket=cltevents-production \
  --cloudfront-dist-id=E20LWZLV7TRPSE \
  --aws-region=us-east-1
```

## Key Benefits

### 1. Reproducibility
- Same containers run locally, on CI, and anywhere else
- No "works on my machine" problems
- Guaranteed consistent builds

### 2. Portability
- Switch CI providers without changing build logic
- Works on GitHub Actions, GitLab CI, CircleCI, Jenkins, etc.
- Just change the orchestrator, keep the same Dagger pipeline

### 3. Local Testing
- Test the exact production pipeline on your laptop
- Debug issues before pushing to CI
- Faster feedback loop

### 4. Containerized
- No dependency conflicts
- Clean environment every time
- Easy to update Node/AWS CLI versions (just change container image)

### 5. Visual Feedback
- Dagger provides a TUI (Terminal UI) showing real-time progress
- See each container step as it runs
- Better debugging experience

## Deployment Flow

### From Local Machine

```bash
# Make changes
vim src/App.jsx

# Test locally
npm run dev

# Build with Dagger locally (optional)
cd dagger && dagger call build --source=.. export --path=../dist-local

# Commit and push
git add .
git commit -m "Update App.jsx"
git push origin main
```

### Automatic CI/CD

```
1. Push to main branch
   ↓
2. GitHub Actions detects push
   ↓
3. Spins up Ubuntu VM
   ↓
4. Installs Dagger CLI
   ↓
5. Dagger runs build in node:20-alpine container
   ↓
6. Dagger deploys to S3 using aws-cli container
   ↓
7. CloudFront cache invalidated
   ↓
8. Deployment complete
   ↓
9. GitHub shows success ✅
```

## Current Infrastructure

### AWS Resources (Created by OpenTofu)

- **S3 Bucket:** cltevents-production
- **CloudFront Distribution:** E20LWZLV7TRPSE
  - Domain: https://d3fszverpacjdj.cloudfront.net
- **IAM User:** cltevents-deployer
  - Permissions: S3 read/write, CloudFront invalidation

### Vercel (API Layer)

- **Domain:** https://clt.show
- **Purpose:** Serverless API endpoints (/api/*)
- **APIs:**
  - /api/events (Ticketmaster)
  - /api/smokeyjoes (Smokey Joe's Café)
  - /api/clttoday (CLT Today)
  - /api/fillmore (The Fillmore)
  - /api/eternally-grateful (Artist tracking)

### Hybrid Architecture

```
┌─────────────────────────────────────────────────┐
│                    User                         │
└────────────────┬────────────────────────────────┘
                 │
       ┌─────────┴─────────┐
       │                   │
       ▼                   ▼
┌─────────────┐    ┌──────────────┐
│  CloudFront │    │   Vercel     │
│  (Frontend) │    │   (APIs)     │
│             │    │              │
│  Static     │    │  Serverless  │
│  Files      │    │  Functions   │
└──────┬──────┘    └──────────────┘
       │
       ▼
┌─────────────┐
│     S3      │
│  (Storage)  │
└─────────────┘
```

## Future Enhancements

### Testing in CI
Add test step before deployment:

```yaml
- name: Run tests
  working-directory: ./dagger
  run: dagger call test --source=..
```

### Linting in CI
Add lint checks:

```yaml
- name: Run linting
  run: npm run lint
```

### Branch Protection
- Require CI to pass before merging PRs
- Prevent direct pushes to main
- Require code reviews

### PR Preview Deployments
- Deploy each PR to a staging environment
- Unique URL per PR (e.g., pr-123.clt.show)
- Auto-cleanup when PR is closed

### Notifications
- Slack/Discord alerts on deploy success/failure
- Email notifications for failed deployments
- Status badges in README

### Multi-Environment
- Development environment (dev branch → dev.clt.show)
- Staging environment (staging branch → staging.clt.show)
- Production environment (main branch → clt.show)

### Performance Monitoring
- Lighthouse CI scores
- Bundle size tracking
- Performance budgets

## Troubleshooting

### Deployment Fails on GitHub Actions

1. Check GitHub Actions logs
2. Look for Dagger container output
3. Verify GitHub Secrets are set correctly
4. Test the same Dagger command locally

### CloudFront Not Updating

- CloudFront cache takes 5-10 minutes to invalidate
- Check invalidation status in AWS Console
- Hard refresh browser (Cmd+Shift+R)

### Build Succeeds Locally but Fails on CI

- Check Node version matches (20)
- Verify all dependencies are in package.json (not installed globally)
- Check for environment-specific code

### Dagger CLI Not Found

```bash
# Install Dagger CLI
curl -L https://dl.dagger.io/dagger/install.sh | sh

# Verify installation
dagger version
```

## Resources

- [Dagger Documentation](https://docs.dagger.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [OpenTofu Documentation](https://opentofu.org/docs/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

## Related Documentation

- [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md) - AWS infrastructure setup
- [QUICK-START-AWS.md](./QUICK-START-AWS.md) - Quick start guide
- [../terraform/README.md](../terraform/README.md) - OpenTofu configuration

---

**Last Updated:** October 2025
**Status:** ✅ Active and Working
**Branch:** infra/aws-terraform-dagger
