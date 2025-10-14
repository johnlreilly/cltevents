# Quick Start: AWS Deployment

**TL;DR:** Deploy CLT Events to AWS in ~30 minutes for ~$2/month instead of Vercel $20/month.

## Prerequisites

- AWS account
- Terraform installed: `brew install terraform`
- AWS CLI configured: `aws configure`

## Step 1: Create Infrastructure (10 minutes)

```bash
cd terraform
terraform init
terraform apply  # Type 'yes'
```

Wait 10-15 minutes for CloudFront to deploy.

## Step 2: Set GitHub Secrets (5 minutes)

Get credentials:
```bash
terraform output -raw deployer_access_key_id
terraform output -raw deployer_secret_access_key
terraform output cloudfront_distribution_id
```

Add to **GitHub → Settings → Secrets → Actions:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` = `us-east-1`
- `AWS_S3_BUCKET` = `cltevents-production`
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`

## Step 3: Deploy (2 minutes)

```bash
git push origin main
```

Watch GitHub Actions → "Deploy to AWS" workflow.

## Step 4: Test

```bash
terraform output cloudfront_url
# Visit the URL in your browser
```

## Step 5: Custom Domain (Optional, 15 minutes)

See [AWS-DEPLOYMENT.md](AWS-DEPLOYMENT.md#phase-4-custom-domain-setup-optional) for full instructions.

Quick version:
1. Request ACM certificate: `aws acm request-certificate --domain-name clt.show --region us-east-1`
2. Add DNS validation record
3. Uncomment domain config in `terraform/cloudfront.tf`
4. `terraform apply`
5. Point DNS CNAME to CloudFront domain

---

## What Gets Created

- **S3 Bucket**: Stores your built static files
- **CloudFront CDN**: Fast global delivery
- **IAM User**: Deployment credentials
- **GitHub Actions**: Auto-deploys on push to main

## Cost

- **First year**: ~$1/month (free tier)
- **After**: ~$2-5/month (low traffic) or ~$10/month (medium traffic)
- **Savings**: $15-18/month vs Vercel Pro

## Troubleshooting

**Site not updating?**
- Wait 10 minutes for CloudFront cache invalidation
- Force refresh: Cmd+Shift+R

**Deployment failed?**
- Check GitHub Actions logs
- Verify GitHub Secrets are set

**Need help?**
- Full guide: [AWS-DEPLOYMENT.md](AWS-DEPLOYMENT.md)
- Terraform docs: [terraform/README.md](terraform/README.md)
- Dagger docs: [dagger/README.md](dagger/README.md)

## Rollback to Vercel

If you want to go back:
```bash
cd terraform
terraform destroy  # Removes all AWS resources
```

Vercel deployment still works on `dev` branch as staging.

## Next Steps

- [ ] Test CloudFront URL
- [ ] Set up custom domain
- [ ] Configure staging environment
- [ ] Set up AWS cost alerts
- [ ] Monitor first month costs

---

**Full documentation:** [AWS-DEPLOYMENT.md](AWS-DEPLOYMENT.md)
