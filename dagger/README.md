# CLT Events - Dagger CI/CD Pipeline

This directory contains the Dagger pipeline for building and deploying CLT Events Discovery.

## What is Dagger?

Dagger is a programmable CI/CD engine that runs pipelines in containers. Benefits:
- **Run anywhere**: Local, GitHub Actions, AWS, Google Cloud
- **Fast**: Cached builds, parallel execution
- **Testable**: Run pipelines locally before pushing
- **Portable**: Not locked into any CI platform

## Pipeline Functions

### `build`
Builds the Vite application and outputs static files.

```bash
# Build locally and export to dist-dagger/
dagger call build --source=.. export --path=../dist-dagger
```

### `test`
Runs linting and tests (optional, for future use).

```bash
# Run tests
dagger call test --source=..
```

### `deploy`
Builds the app and deploys to AWS S3 + CloudFront.

**Required environment variables:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`

```bash
# Deploy to AWS
export AWS_ACCESS_KEY_ID="your-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
export AWS_S3_BUCKET="cltevents-production"
export AWS_CLOUDFRONT_DISTRIBUTION_ID="E1234567890"

dagger call deploy --source=..
```

### `pipeline`
Full CI/CD: test → build → deploy.

```bash
dagger call pipeline --source=..
```

## Local Development

### Prerequisites

1. **Install Dagger CLI**:
```bash
curl -L https://dl.dagger.io/dagger/install.sh | sh
```

2. **Install Node.js dependencies**:
```bash
cd dagger
npm install
```

### Run Locally

```bash
# Build only (no deployment)
dagger call build --source=.. export --path=../dist-dagger

# Test the build
dagger call test --source=..

# Full deployment (requires AWS credentials)
dagger call deploy --source=..
```

## How It Works

### Build Process

1. Starts with `node:20-alpine` container
2. Copies source code (excludes node_modules, dist, etc.)
3. Runs `npm install`
4. Runs `npm run build`
5. Outputs `dist/` directory

### Deploy Process

1. Runs build process
2. Starts `amazon/aws-cli` container
3. Syncs files to S3:
   - Static assets: Long cache (1 year)
   - index.html: Short cache (5 minutes)
4. Creates CloudFront invalidation for updated files

## GitHub Actions Integration

The pipeline runs automatically on pushes to `main` branch.

See `.github/workflows/deploy-aws.yml` for the workflow.

### Manual Trigger

You can manually trigger deployment from GitHub:
1. Go to Actions tab
2. Select "Deploy to AWS" workflow
3. Click "Run workflow"

## Caching

Dagger automatically caches:
- NPM dependencies
- Build outputs
- Docker layers

This makes subsequent builds much faster (30s vs 3min).

## Environment Variables

### Local Development

Create `.env` file (gitignored):
```bash
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=cltevents-production
AWS_CLOUDFRONT_DISTRIBUTION_ID=E1234567890
```

Load and run:
```bash
set -a; source .env; set +a
dagger call deploy --source=..
```

### GitHub Actions

Set these secrets in GitHub:
- Repository → Settings → Secrets and variables → Actions

## Debugging

### View detailed logs

```bash
# Enable verbose logging
dagger call -v deploy --source=..
```

### Interactive debugging

```bash
# Get a shell in the build container
dagger call build --source=.. terminal
```

### Check what files are being deployed

```bash
# Export build to local directory
dagger call build --source=.. export --path=./build-output
ls -la build-output/
```

## Customization

### Add environment variables to build

Edit `dagger/src/index.ts`:

```typescript
@func()
async build(source: Directory): Promise<Directory> {
  return await dag
    .container()
    .from("node:20-alpine")
    .withDirectory("/app", source)
    .withWorkdir("/app")
    .withEnvVariable("VITE_API_URL", "https://api.example.com") // Add this
    .withExec(["npm", "install"])
    .withExec(["npm", "run", "build"])
    .directory("/app/dist")
}
```

### Add more pipeline steps

```typescript
@func()
async validate(source: Directory): Promise<string> {
  const output = await dag
    .container()
    .from("node:20-alpine")
    .withDirectory("/app", source)
    .withWorkdir("/app")
    .withExec(["npm", "install"])
    .withExec(["npm", "run", "validate"])
    .stdout()

  return output
}
```

## Comparison with Vercel

| Feature | Vercel | Dagger + AWS |
|---------|--------|--------------|
| **Cost** | $20/month | ~$2-5/month |
| **Vendor Lock-in** | High | Low |
| **Customization** | Limited | Full control |
| **Run Locally** | No | Yes |
| **Build Time** | Fast | Fast (cached) |
| **Deploy Time** | Instant | ~1-2 min |
| **Edge Network** | Yes | Yes (CloudFront) |

## Troubleshooting

### "AWS credentials not found"
- Ensure environment variables are set
- Check GitHub secrets are configured

### "S3 bucket does not exist"
- Run Terraform first: `cd terraform && terraform apply`

### "Access Denied" on S3
- Check IAM user has correct permissions
- Verify bucket policy in Terraform

### Build fails
- Run locally: `dagger call build --source=.. export --path=./test`
- Check Node.js version (should be 20+)

### Deployment succeeds but site not updated
- CloudFront caching: Wait 5-10 minutes
- Check invalidation was created
- Force refresh browser (Cmd+Shift+R)

## Resources

- [Dagger Documentation](https://docs.dagger.io)
- [Dagger TypeScript SDK](https://docs.dagger.io/sdk/typescript)
- [AWS CLI S3 sync](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html)
- [CloudFront Invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)
