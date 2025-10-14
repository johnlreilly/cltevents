# IAM User for CI/CD Deployments
resource "aws_iam_user" "deployer" {
  name = "${var.project_name}-deployer"
  path = "/system/"

  tags = {
    Name        = "${var.project_name} Deployer"
    Description = "CI/CD deployment user for ${var.project_name}"
  }
}

# IAM Policy for deployment permissions
resource "aws_iam_user_policy" "deployer_policy" {
  name = "${var.project_name}-deployer-policy"
  user = aws_iam_user.deployer.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3BucketAccess"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = aws_s3_bucket.website.arn
      },
      {
        Sid    = "S3ObjectAccess"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:PutObjectAcl"
        ]
        Resource = "${aws_s3_bucket.website.arn}/*"
      },
      {
        Sid    = "CloudFrontInvalidation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = aws_cloudfront_distribution.website.arn
      }
    ]
  })
}

# Create access key for CI/CD
resource "aws_iam_access_key" "deployer" {
  user = aws_iam_user.deployer.name
}

# Store access key in AWS Secrets Manager (optional but recommended)
resource "aws_secretsmanager_secret" "deployer_credentials" {
  name                    = "${var.project_name}-deployer-credentials"
  description             = "CI/CD deployer credentials for ${var.project_name}"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name} Deployer Credentials"
  }
}

resource "aws_secretsmanager_secret_version" "deployer_credentials" {
  secret_id = aws_secretsmanager_secret.deployer_credentials.id
  secret_string = jsonencode({
    access_key_id     = aws_iam_access_key.deployer.id
    secret_access_key = aws_iam_access_key.deployer.secret
    region            = var.aws_region
    s3_bucket         = aws_s3_bucket.website.id
    cloudfront_id     = aws_cloudfront_distribution.website.id
  })
}
