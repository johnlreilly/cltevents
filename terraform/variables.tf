# AWS Region
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

# Project Configuration
variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "cltevents"
}

variable "environment" {
  description = "Environment name (production, staging)"
  type        = string
  default     = "production"
}

# Domain Configuration
variable "domain_name" {
  description = "Primary domain name (e.g., clt.show)"
  type        = string
  default     = "clt.show"
}

variable "create_dns" {
  description = "Whether to create Route53 hosted zone (false if using external DNS)"
  type        = bool
  default     = false
}

# S3 Bucket Configuration
variable "s3_bucket_name" {
  description = "Name of S3 bucket for static hosting"
  type        = string
  default     = "cltevents-production"
}

# CloudFront Configuration
variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_100 = US/EU only, PriceClass_All = global)"
  type        = string
  default     = "PriceClass_100"
}

variable "cloudfront_min_ttl" {
  description = "Minimum TTL for CloudFront cache (seconds)"
  type        = number
  default     = 0
}

variable "cloudfront_default_ttl" {
  description = "Default TTL for CloudFront cache (seconds)"
  type        = number
  default     = 3600 # 1 hour
}

variable "cloudfront_max_ttl" {
  description = "Maximum TTL for CloudFront cache (seconds)"
  type        = number
  default     = 86400 # 24 hours
}

# Cost Control
variable "enable_versioning" {
  description = "Enable S3 versioning for rollback capability"
  type        = bool
  default     = false
}

variable "lifecycle_days" {
  description = "Days to keep old versions (if versioning enabled)"
  type        = number
  default     = 30
}
