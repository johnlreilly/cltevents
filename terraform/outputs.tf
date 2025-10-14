# S3 Outputs
output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.website.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.website.arn
}

output "s3_bucket_domain" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_url" {
  description = "CloudFront distribution URL"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

# IAM Outputs
output "deployer_user_name" {
  description = "Name of the deployer IAM user"
  value       = aws_iam_user.deployer.name
}

output "deployer_access_key_id" {
  description = "Access key ID for deployer (sensitive - use with care)"
  value       = aws_iam_access_key.deployer.id
  sensitive   = true
}

output "deployer_secret_access_key" {
  description = "Secret access key for deployer (sensitive - store securely)"
  value       = aws_iam_access_key.deployer.secret
  sensitive   = true
}

output "deployer_credentials_secret_arn" {
  description = "ARN of Secrets Manager secret containing deployer credentials"
  value       = aws_secretsmanager_secret.deployer_credentials.arn
}

# Deployment Instructions
output "deployment_instructions" {
  description = "Next steps for deployment"
  value       = <<-EOT

    ====================================
    AWS Infrastructure Created Successfully!
    ====================================

    CloudFront URL: https://${aws_cloudfront_distribution.website.domain_name}

    Next Steps:
    1. Test the CloudFront URL to verify it works (may take 10-15 minutes to deploy)

    2. Add these secrets to GitHub:
       - AWS_ACCESS_KEY_ID: ${aws_iam_access_key.deployer.id}
       - AWS_SECRET_ACCESS_KEY: (run 'terraform output -raw deployer_secret_access_key')
       - AWS_CLOUDFRONT_DISTRIBUTION_ID: ${aws_cloudfront_distribution.website.id}

    3. Run the Dagger pipeline to deploy your first build:
       dagger call deploy --source=.

    4. (Optional) Set up custom domain:
       - Request ACM certificate in us-east-1
       - Update CloudFront aliases in terraform/cloudfront.tf
       - Update DNS to point to CloudFront distribution

    5. (Later) Migrate DNS from Vercel:
       - Point ${var.domain_name} to ${aws_cloudfront_distribution.website.domain_name}
       - Keep Vercel as staging environment

    ====================================
  EOT
}
