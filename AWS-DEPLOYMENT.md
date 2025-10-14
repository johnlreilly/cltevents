# AWS Deployment Guide for CLT Events Discovery

Complete guide for deploying to AWS with Terraform and Dagger.

## Quick Start

```bash
# 1. Set up AWS infrastructure
cd terraform
terraform init
terraform apply

# 2. Get deployment credentials
terraform output -raw deployer_access_key_id
terraform output -raw deployer_secret_access_key

# 3. Add to GitHub Secrets (see below)

# 4. Push to main branch → Auto-deploys
git push origin main
```

## Detailed Setup Guide

### Phase 1: AWS Infrastructure (One-time setup)

#### Prerequisites
- AWS account
- Terraform installed: `brew install terraform`
- AWS CLI installed: `brew install awscli`

#### 1.1 Configure AWS CLI

```bash
aws configure
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region: us-east-1
# Default output format: json
```

#### 1.2 Create Infrastructure

```bash
cd terraform
terraform init
terraform plan  # Review what will be created
terraform apply # Type 'yes' to create
```

**What gets created:**
- S3 bucket: `cltevents-production`
- CloudFront distribution (takes 10-15 minutes)
- IAM user: `cltevents-deployer`
- Secrets Manager secret with credentials

**Expected output:**
```
Apply complete! Resources: 8 added, 0 changed, 0 destroyed.

Outputs:
cloudfront_url = "https://d1234abcd.cloudfront.net"
deployer_access_key_id = <sensitive>
...
```

#### 1.3 Get Deployment Credentials

```bash
# Get CloudFront distribution ID
terraform output cloudfront_distribution_id

# Get AWS access key (for GitHub)
terraform output -raw deployer_access_key_id

# Get AWS secret key (for GitHub)
terraform output -raw deployer_secret_access_key
```

**Save these values** - you'll need them for GitHub Secrets.

---

### Phase 2: GitHub Secrets Setup

#### 2.1 Add Secrets to GitHub

Go to: **Your Repository → Settings → Secrets and variables → Actions**

Click **"New repository secret"** and add each:

| Secret Name | Value | Where to get it |
|-------------|-------|-----------------|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | `terraform output -raw deployer_access_key_id` |
| `AWS_SECRET_ACCESS_KEY` | `abc123...` | `terraform output -raw deployer_secret_access_key` |
| `AWS_REGION` | `us-east-1` | Your chosen region |
| `AWS_S3_BUCKET` | `cltevents-production` | Your bucket name |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | `E1234567890` | `terraform output cloudfront_distribution_id` |

#### 2.2 Verify Secrets

After adding, you should see 5 secrets listed (values are hidden).

---

### Phase 3: Deploy Application

#### 3.1 Test Locally (Optional)

```bash
# Install Dagger CLI
curl -L https://dl.dagger.io/dagger/install.sh | sh

# Install Dagger dependencies
cd dagger
npm install

# Set environment variables
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
export AWS_S3_BUCKET="cltevents-production"
export AWS_CLOUDFRONT_DISTRIBUTION_ID="E1234567890"

# Run deployment locally
dagger call deploy --source=..
```

#### 3.2 Deploy via GitHub Actions

```bash
# Push to main branch to trigger deployment
git push origin main
```

**Or manually trigger:**
1. Go to GitHub → Actions tab
2. Click "Deploy to AWS" workflow
3. Click "Run workflow" → "Run workflow"

#### 3.3 Monitor Deployment

1. Watch GitHub Actions progress (2-3 minutes)
2. Check CloudFront URL after completion:
   ```bash
   terraform output cloudfront_url
   ```
3. Visit URL in browser

**Note:** First deployment may take 15-20 minutes for CloudFront to propagate globally.

---

### Phase 4: Custom Domain Setup (Optional)

#### 4.1 Request SSL Certificate

```bash
# Must use us-east-1 for CloudFront
aws acm request-certificate \
  --domain-name clt.show \
  --validation-method DNS \
  --region us-east-1
```

#### 4.2 Validate Certificate

1. Go to AWS Console → Certificate Manager (us-east-1)
2. Click on certificate
3. Copy CNAME record name and value
4. Add to your DNS provider (Vercel, Cloudflare, etc.)
5. Wait for validation (5-30 minutes)

#### 4.3 Update Terraform for Custom Domain

Edit `terraform/cloudfront.tf`:

**Uncomment these lines:**
```hcl
# Line ~18: Add domain aliases
aliases = [var.domain_name]

# Lines ~70-73: Enable SSL certificate
viewer_certificate {
  acm_certificate_arn      = aws_acm_certificate.website.arn
  ssl_support_method       = "sni-only"
  minimum_protocol_version = "TLSv1.2_2021"
}
```

**Comment out:**
```hcl
# Line ~69: Remove default certificate
# cloudfront_default_certificate = true
```

#### 4.4 Apply Changes

```bash
cd terraform
terraform apply
```

#### 4.5 Update DNS

Get CloudFront domain:
```bash
terraform output cloudfront_domain_name
# Output: d1234abcd.cloudfront.net
```

**In your DNS provider (Vercel, Cloudflare, etc.):**
- Type: `CNAME`
- Name: `@` (or `clt.show`)
- Value: `d1234abcd.cloudfront.net` (from terraform output)
- TTL: 300 (5 minutes)

**Or use A record with alias (Route53 only):**
- Type: `A` (Alias)
- Name: `clt.show`
- Target: CloudFront distribution

#### 4.6 Test Custom Domain

```bash
# Wait 5-10 minutes for DNS propagation
dig clt.show

# Visit in browser
open https://clt.show
```

---

### Phase 5: Vercel as Staging

Keep Vercel for staging/preview environment:

**Option A: Keep dev branch on Vercel**
- Vercel deploys from `dev` branch
- AWS deploys from `main` branch
- Test on Vercel before merging to main

**Option B: Subdomain on Vercel**
- Point `staging.clt.show` → Vercel
- Point `clt.show` → AWS CloudFront
- Deploy dev builds to Vercel

**Vercel settings:**
- Dashboard → Project Settings → Git
- Set Production Branch to `dev`
- Disable auto-deploy on `main`

---

## Cost Breakdown

### Monthly Costs (Low Traffic: ~10k visitors)

| Service | Cost |
|---------|------|
| S3 Storage (20GB) | $0.50 |
| S3 GET requests (100k) | $0.04 |
| S3 PUT requests (1k) | $0.005 |
| CloudFront (10GB transfer) | $0.85 |
| CloudFront requests (100k) | $0.10 |
| Route53 (hosted zone) | $0.50 |
| **Total** | **~$2.00/month** |

### Monthly Costs (Medium Traffic: ~100k visitors)

| Service | Cost |
|---------|------|
| S3 Storage (20GB) | $0.50 |
| S3 GET requests (1M) | $0.40 |
| CloudFront (100GB transfer) | $8.50 |
| CloudFront requests (1M) | $1.00 |
| Route53 (hosted zone) | $0.50 |
| **Total** | **~$11/month** |

**Savings vs Vercel Pro:** $9-18/month

### Free Tier (First 12 Months)
- S3: 5GB storage, 20k GET, 2k PUT
- CloudFront: 1TB transfer, 10M requests
- Route53: Hosted zone (always paid)

**First year total: ~$0.50-1.00/month**

---

## Deployment Workflow

```
┌──────────────┐
│ Push to main │
└──────┬───────┘
       │
       ▼
┌─────────────────┐
│ GitHub Actions  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Dagger Pipeline │
│  1. Build Vite  │
│  2. Sync to S3  │
│  3. Invalidate  │
│     CloudFront  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   CloudFront    │
│      CDN        │
└──────┬──────────┘
       │
       ▼
   [clt.show]
```

**Deployment time:** 2-3 minutes
**Cache invalidation:** 5-10 minutes
**Global propagation:** 15-30 minutes

---

## Troubleshooting

### Infrastructure Issues

**"S3 bucket name already exists"**
- S3 bucket names are globally unique
- Change `s3_bucket_name` in `terraform/variables.tf`
- Run `terraform apply` again

**CloudFront shows "Access Denied"**
- Wait 10-15 minutes for distribution to deploy
- Check S3 bucket policy allows CloudFront OAC
- Run: `aws cloudfront get-distribution --id E123456`

**Terraform state locked**
- Another terraform process is running
- Wait or force unlock: `terraform force-unlock [ID]`

### Deployment Issues

**GitHub Actions fails: "AWS credentials not found"**
- Check GitHub Secrets are set correctly
- Secret names are case-sensitive
- Re-add secrets if needed

**Deployment succeeds but site not updated**
- CloudFront caching (wait 10 minutes)
- Force refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check invalidation: AWS Console → CloudFront → Invalidations

**404 errors on routes (e.g., /about)**
- SPA routing issue
- Check `custom_error_response` in `terraform/cloudfront.tf`
- Should redirect 404 → /index.html with 200 status

### DNS Issues

**Domain not resolving**
- DNS propagation takes 5-60 minutes
- Check: `dig clt.show` or `nslookup clt.show`
- Verify CNAME points to CloudFront domain

**SSL certificate error**
- Certificate must be in us-east-1 region
- Certificate must be validated (check ACM console)
- CloudFront must reference certificate ARN

---

## Monitoring & Maintenance

### Check Deployment Status

```bash
# CloudFront distribution status
aws cloudfront get-distribution --id E123456

# Recent invalidations
aws cloudfront list-invalidations --distribution-id E123456

# S3 bucket contents
aws s3 ls s3://cltevents-production/
```

### Cost Monitoring

1. AWS Console → Billing Dashboard
2. Set up Cost Alerts:
   - Billing → Budgets → Create budget
   - Alert when exceeds $10/month

### View Logs

**CloudFront access logs (optional):**

Edit `terraform/cloudfront.tf`:
```hcl
logging_config {
  include_cookies = false
  bucket         = aws_s3_bucket.logs.bucket_domain_name
  prefix         = "cloudfront/"
}
```

**GitHub Actions logs:**
- Repository → Actions → Select workflow run

---

## Rollback

### Rollback Deployment

**If S3 versioning enabled:**
```bash
# List versions
aws s3api list-object-versions --bucket cltevents-production

# Restore previous version
aws s3api copy-object \
  --copy-source cltevents-production/index.html?versionId=VERSION_ID \
  --bucket cltevents-production \
  --key index.html
```

**Otherwise, redeploy previous commit:**
```bash
git revert HEAD
git push origin main
# Triggers automatic deployment of previous version
```

### Rollback Infrastructure

```bash
cd terraform
git checkout HEAD~1 -- *.tf
terraform apply
```

---

## Cleanup

### Temporary Cleanup (Keep Infrastructure)

```bash
# Just clear S3 bucket
aws s3 rm s3://cltevents-production --recursive
```

### Full Cleanup (Destroy Everything)

⚠️ **Warning:** This deletes all resources and data.

```bash
cd terraform
terraform destroy
# Type 'yes' to confirm
```

**What gets deleted:**
- S3 bucket and all files
- CloudFront distribution
- IAM user and credentials
- Secrets Manager secret

**What's NOT deleted:**
- ACM certificate (delete manually)
- CloudWatch logs (if enabled)

---

## Next Steps

- [ ] Set up staging environment
- [ ] Add CloudFront access logs
- [ ] Set up CloudWatch alarms
- [ ] Add Datadog/NewRelic monitoring
- [ ] Configure custom error pages
- [ ] Add security headers
- [ ] Set up backup/restore process
- [ ] Document incident response

---

## Support

**Documentation:**
- [Terraform README](terraform/README.md)
- [Dagger README](dagger/README.md)
- [Migration Plan](MIGRATION-PLAN.md)

**AWS Resources:**
- [CloudFront Docs](https://docs.aws.amazon.com/cloudfront/)
- [S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

**Issues:**
- Check GitHub Actions logs
- Check AWS CloudWatch logs
- Review this guide's troubleshooting section
