# Migration Plan: Vercel to AWS with Dagger

## Overview
Migrate CLT Events Discovery from Vercel to AWS infrastructure with Dagger for CI/CD, reducing costs and dependency on a single platform provider.

---

## Phase 1: AWS Infrastructure Setup

### 1.1 Create AWS Resources

**S3 Bucket for Static Hosting**
- Create bucket: `clt-events-production` (or your preferred name)
- Enable static website hosting
- Configure bucket policy for public read access
- Enable versioning (optional, for rollback capability)

**CloudFront Distribution**
- Origin: S3 bucket
- Enable compression
- Default root object: `index.html`
- Error pages: Configure SPA routing (redirect 404 → /index.html with 200 status)
- SSL/TLS certificate (use AWS Certificate Manager for free cert)
- Custom domain: clt.show (or your domain)

**IAM User for Deployments**
- Create deployment user: `cltevents-deployer`
- Permissions needed:
  - `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on production bucket
  - `cloudfront:CreateInvalidation` on distribution
- Generate access key/secret for CI/CD

**Route53 (if using AWS DNS)**
- Create hosted zone for your domain
- Add A/AAAA records pointing to CloudFront distribution
- Update nameservers at your registrar

### 1.2 Infrastructure as Code (Optional but Recommended)

Choose one approach:
- **Terraform** - More portable, larger community
- **AWS CDK** - Better TypeScript integration, AWS-native
- **Manual** - Faster to start, harder to reproduce

Recommendation: Start manual, document everything, migrate to Terraform later.

---

## Phase 2: Dagger Pipeline Development

### 2.1 Create New Branch
```bash
git checkout -b infra/dagger-pipeline
```

### 2.2 Install Dagger

**Local Development**
```bash
# Install Dagger CLI
curl -L https://dl.dagger.io/dagger/install.sh | sh

# Initialize Dagger in project
dagger init --sdk=nodejs
```

### 2.3 Create Dagger Pipeline

Create `dagger/index.js` (or TypeScript) with functions:

**Build Function**
- Install Node.js dependencies
- Run `npm run build`
- Output: `dist/` directory with built static files

**Test Function (Optional)**
- Run linting: `npm run lint`
- Run unit tests: `npm test`
- Run build to verify no errors

**Deploy Function**
- Take build artifacts from Build function
- Sync files to S3 bucket
- Set correct content-types (text/html, application/javascript, etc.)
- Set cache headers (long cache for versioned assets, short for index.html)
- Create CloudFront invalidation for changed files

**Preview Function (Optional)**
- Deploy to separate S3 bucket per PR/branch
- Useful for testing before production

### 2.4 Environment Variables / Secrets

Store in GitHub Secrets (or your CI platform):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g., us-east-1)
- `AWS_S3_BUCKET` (e.g., clt-events-production)
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`

---

## Phase 3: CI/CD Integration

### 3.1 GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Dagger CLI
        run: curl -L https://dl.dagger.io/dagger/install.sh | sh

      - name: Run Dagger Pipeline
        run: dagger call deploy --source=.
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-1
          AWS_S3_BUCKET: clt-events-production
          AWS_CLOUDFRONT_DISTRIBUTION_ID: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
```

### 3.2 Preview Deployments (Optional)

Create `.github/workflows/preview.yml` for PR previews:
- Deploy to `clt-events-preview-pr-{number}`
- Comment on PR with preview URL
- Auto-cleanup when PR is closed

---

## Phase 4: DNS and Domain Migration

### 4.1 Test Before Switching

1. Get CloudFront URL (e.g., `d1234abcd.cloudfront.net`)
2. Test thoroughly at that URL
3. Check all routes work (SPA routing)
4. Verify images, data files load correctly

### 4.2 DNS Cutover

**Low-Risk Approach:**
1. Lower TTL on current DNS records (24 hours before)
2. Update DNS to point to CloudFront distribution
3. Monitor for 24-48 hours
4. Keep Vercel deployment active as backup

**Rollback Plan:**
- If issues arise, switch DNS back to Vercel
- Fix issues in AWS
- Retry cutover

---

## Phase 5: Cleanup and Optimization

### 5.1 Vercel Cleanup
- Keep Vercel project for 30 days as backup
- After stable, downgrade to free tier or delete project

### 5.2 AWS Optimizations
- Enable CloudFront caching policies
- Add CloudWatch alarms for errors
- Set up cost alerts
- Review S3 lifecycle policies

### 5.3 Documentation
- Document deployment process
- Update README with new deployment info
- Create runbook for common issues

---

## Cost Comparison

### Current (Vercel)
- Hobby: $0/month (with limitations)
- Pro: $20/month (if needed)

### Proposed (AWS)
**Estimated Monthly Costs:**
- S3 storage: ~$0.50 (20GB)
- S3 requests: ~$0.10
- CloudFront: ~$1-3 (first 1TB free tier first 12 months)
- Route53: $0.50/hosted zone
- **Total: ~$2-5/month** (after free tier: ~$5-10/month)

**Break-even:** Saves $15-18/month vs Vercel Pro

---

## Timeline Estimate

| Phase | Time Estimate | Can Run in Parallel |
|-------|---------------|---------------------|
| Phase 1: AWS Setup | 2-3 hours | No |
| Phase 2: Dagger Pipeline | 3-5 hours | After Phase 1 |
| Phase 3: CI/CD Integration | 1-2 hours | After Phase 2 |
| Phase 4: DNS Migration | 1 hour + monitoring | After Phase 3 |
| Phase 5: Cleanup | 1 hour | After Phase 4 |

**Total: 8-12 hours of work**

Spread over 1-2 weeks for monitoring and validation.

---

## Risks and Mitigations

### Risk: Downtime during DNS cutover
**Mitigation:** Use low TTL, keep Vercel active, test thoroughly first

### Risk: CloudFront caching issues
**Mitigation:** Configure cache headers correctly, test cache invalidation

### Risk: Increased AWS costs
**Mitigation:** Set up billing alarms, monitor usage weekly

### Risk: Lost Vercel features (analytics, logs)
**Mitigation:** Add CloudWatch logging, consider analytics tool (Plausible, etc.)

### Risk: SPA routing breaks (404s on refresh)
**Mitigation:** Configure CloudFront error pages correctly

---

## Success Criteria

- [ ] Site loads correctly on CloudFront URL
- [ ] All routes work (including direct navigation and refresh)
- [ ] Images and data files load correctly
- [ ] DNS resolves to new infrastructure
- [ ] No 404 errors on valid routes
- [ ] Page load time < 2 seconds
- [ ] Deployment pipeline runs successfully
- [ ] Can rollback if needed
- [ ] Cost < $10/month

---

## Next Steps

1. **Review this plan** - Make any adjustments based on your preferences
2. **Create AWS account** (if not already have one)
3. **Set up AWS resources** (Phase 1)
4. **Create branch and Dagger pipeline** (Phase 2)
5. **Test locally** before pushing to CI/CD
6. **Gradual rollout** - Test → Preview → Production

---

## Questions to Consider

1. **Do you already have an AWS account?**
2. **What's your domain/DNS setup?** (Route53, Cloudflare, other?)
3. **Do you need preview deployments for PRs?**
4. **Infrastructure as code preference?** (Terraform, CDK, or manual?)
5. **Any specific compliance/security requirements?**
6. **Want to keep Vercel as staging environment?**

---

## Additional Considerations

### Alternative: Cloudflare Pages
If you want simpler than AWS:
- Free tier is generous
- Built-in CDN
- Easy GitHub integration
- Less control than AWS but simpler

### Alternative: Netlify
Similar to Vercel, but different pricing:
- Free tier available
- Good CI/CD integration
- Might not solve "dependency" issue

### Stick with current approach (Dagger + AWS)
- Most control
- Best pricing
- Learn valuable cloud skills
- Portable to other clouds (GCP, Azure)
