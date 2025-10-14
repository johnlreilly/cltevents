# CLT Events - AWS Infrastructure (Terraform)

This directory contains Terraform configuration for deploying CLT Events Discovery to AWS.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────┐
│   GitHub    │─────▶│    Dagger    │─────▶│   S3    │
│   Actions   │      │   Pipeline   │      │ Bucket  │
└─────────────┘      └──────────────┘      └────┬────┘
                                                  │
                                                  ▼
                                           ┌─────────────┐
                                           │ CloudFront  │
                                           │     CDN     │
                                           └──────┬──────┘
                                                  │
                                                  ▼
                                            [ clt.show ]
```

## Resources Created

- **S3 Bucket**: Stores static website files
- **CloudFront Distribution**: Global CDN for fast delivery
- **IAM User**: Deployment credentials for CI/CD
- **Secrets Manager**: Securely stores deployment credentials

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Terraform** >= 1.0 installed ([download](https://www.terraform.io/downloads))
3. **AWS CLI** configured with your credentials

## Initial Setup

### 1. Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and default region
```

### 2. Update Variables (Optional)

Edit `terraform/variables.tf` to customize:
- `domain_name` - Your domain (default: clt.show)
- `s3_bucket_name` - Bucket name (must be globally unique)
- `aws_region` - AWS region (default: us-east-1)

Or create a `terraform.tfvars` file:

```hcl
domain_name     = "clt.show"
s3_bucket_name  = "cltevents-production"
aws_region      = "us-east-1"
```

### 3. Initialize Terraform

```bash
cd terraform
terraform init
```

### 4. Review Infrastructure Plan

```bash
terraform plan
```

This shows what resources will be created without making changes.

### 5. Create Infrastructure

```bash
terraform apply
```

Type `yes` when prompted. This will:
- Create S3 bucket
- Create CloudFront distribution (takes 10-15 minutes)
- Create IAM deployment user
- Store credentials in Secrets Manager

### 6. Get Deployment Credentials

After `terraform apply` completes:

```bash
# View all outputs
terraform output

# Get specific values for GitHub Secrets
terraform output -raw deployer_access_key_id
terraform output -raw deployer_secret_access_key
terraform output -raw cloudfront_distribution_id
```

### 7. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `AWS_ACCESS_KEY_ID` - From terraform output
- `AWS_SECRET_ACCESS_KEY` - From terraform output
- `AWS_REGION` - Your AWS region (e.g., us-east-1)
- `AWS_S3_BUCKET` - Your S3 bucket name
- `AWS_CLOUDFRONT_DISTRIBUTION_ID` - From terraform output

## Testing

### Test CloudFront URL

```bash
# Get the CloudFront URL
terraform output cloudfront_url

# Visit the URL in your browser (after first deployment)
```

## Updating Infrastructure

If you need to modify infrastructure:

```bash
# Edit terraform files
vim cloudfront.tf

# Review changes
terraform plan

# Apply changes
terraform apply
```

## Custom Domain Setup

After infrastructure is created, to use your custom domain:

### 1. Request SSL Certificate

```bash
# Must be in us-east-1 for CloudFront
aws acm request-certificate \
  --domain-name clt.show \
  --validation-method DNS \
  --region us-east-1
```

### 2. Validate Certificate

Follow AWS console instructions to add DNS records for validation.

### 3. Update Terraform

Uncomment the ACM and domain sections in `cloudfront.tf`:

```hcl
# In cloudfront.tf, uncomment:
aliases = [var.domain_name]

# And in viewer_certificate block:
acm_certificate_arn      = aws_acm_certificate.website.arn
ssl_support_method       = "sni-only"
minimum_protocol_version = "TLSv1.2_2021"
```

### 4. Apply Changes

```bash
terraform apply
```

### 5. Update DNS

Point your domain to CloudFront:
- If using Route53: Terraform can manage this
- If using Vercel DNS: Update A/CNAME records to CloudFront domain

## Cost Estimates

| Service | Monthly Cost |
|---------|--------------|
| S3 Storage (20GB) | ~$0.50 |
| S3 Requests | ~$0.10 |
| CloudFront (1TB) | ~$1-3 (free tier first 12 months) |
| Route53 (optional) | $0.50/zone |
| **Total** | **~$2-5/month** |

After free tier expires: ~$5-10/month

## Troubleshooting

### CloudFront shows "Access Denied"
- Wait 10-15 minutes for distribution to fully deploy
- Check S3 bucket policy allows CloudFront OAC access

### Deployment fails
- Verify GitHub secrets are set correctly
- Check IAM user has correct permissions
- Ensure S3 bucket name is unique globally

### 404 errors on SPA routes
- CloudFront custom error responses should redirect to /index.html
- Check `custom_error_response` blocks in `cloudfront.tf`

## Destroying Infrastructure

⚠️ **Warning**: This will delete all resources and data.

```bash
cd terraform
terraform destroy
```

## State Management (Production)

For team collaboration, use remote state:

1. Create S3 bucket for state:
```bash
aws s3 mb s3://cltevents-terraform-state
```

2. Uncomment backend configuration in `main.tf`:
```hcl
backend "s3" {
  bucket = "cltevents-terraform-state"
  key    = "production/terraform.tfstate"
  region = "us-east-1"
}
```

3. Migrate state:
```bash
terraform init -migrate-state
```

## Support

For issues:
1. Check [Terraform AWS Provider docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
2. Check [AWS CloudFront docs](https://docs.aws.amazon.com/cloudfront/)
3. Review GitHub Actions logs for deployment errors
