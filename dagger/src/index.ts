/**
 * CLT Events Discovery Dagger Pipeline
 *
 * This pipeline builds the Vite app and deploys it to AWS S3 + CloudFront
 */

import {
  dag,
  Container,
  Directory,
  object,
  func,
} from "@dagger.io/dagger"

@object()
class CltEvents {
  /**
   * Build the Vite application
   *
   * @param source - Source code directory
   * @returns Directory containing built static files
   */
  @func()
  async build(source: Directory): Promise<Directory> {
    return await dag
      .container()
      .from("node:20-alpine")
      .withDirectory("/app", source, {
        exclude: [
          "node_modules",
          "dist",
          "dist-dagger",
          ".git",
          "terraform",
          "dagger",
        ],
      })
      .withWorkdir("/app")
      .withExec(["npm", "install"])
      .withExec(["npm", "run", "build"])
      .directory("/app/dist")
  }

  /**
   * Run tests (optional, for future use)
   *
   * @param source - Source code directory
   * @returns Container with test results
   */
  @func()
  async test(source: Directory): Promise<Container> {
    return dag
      .container()
      .from("node:20-alpine")
      .withDirectory("/app", source, {
        exclude: [
          "node_modules",
          "dist",
          "dist-dagger",
          ".git",
          "terraform",
          "dagger",
        ],
      })
      .withWorkdir("/app")
      .withExec(["npm", "install"])
      .withExec(["npm", "run", "lint"])
  }

  /**
   * Deploy to AWS S3 and invalidate CloudFront cache
   *
   * Requires environment variables:
   * - AWS_ACCESS_KEY_ID
   * - AWS_SECRET_ACCESS_KEY
   * - AWS_REGION
   * - AWS_S3_BUCKET
   * - AWS_CLOUDFRONT_DISTRIBUTION_ID
   *
   * @param source - Source code directory
   * @returns Success message
   */
  @func()
  async deploy(source: Directory): Promise<string> {
    // First, build the application
    const buildOutput = await this.build(source)

    // Get AWS credentials from environment
    const awsAccessKeyId = dag.setSecret(
      "AWS_ACCESS_KEY_ID",
      process.env.AWS_ACCESS_KEY_ID || ""
    )
    const awsSecretAccessKey = dag.setSecret(
      "AWS_SECRET_ACCESS_KEY",
      process.env.AWS_SECRET_ACCESS_KEY || ""
    )
    const awsRegion = process.env.AWS_REGION || "us-east-1"
    const s3Bucket = process.env.AWS_S3_BUCKET || ""
    const cloudfrontDistId = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID || ""

    if (!s3Bucket) {
      throw new Error("AWS_S3_BUCKET environment variable is required")
    }

    if (!cloudfrontDistId) {
      throw new Error("AWS_CLOUDFRONT_DISTRIBUTION_ID environment variable is required")
    }

    // Deploy to S3 using AWS CLI
    const deployContainer = dag
      .container()
      .from("amazon/aws-cli:latest")
      .withSecretVariable("AWS_ACCESS_KEY_ID", awsAccessKeyId)
      .withSecretVariable("AWS_SECRET_ACCESS_KEY", awsSecretAccessKey)
      .withEnvVariable("AWS_DEFAULT_REGION", awsRegion)
      .withDirectory("/build", buildOutput)
      .withWorkdir("/build")
      // Sync files to S3 with proper content types and cache headers
      .withExec([
        "s3",
        "sync",
        ".",
        `s3://${s3Bucket}/`,
        "--delete",
        "--cache-control",
        "public,max-age=31536000,immutable",
        "--exclude",
        "index.html",
      ])
      // Upload index.html with short cache
      .withExec([
        "s3",
        "cp",
        "index.html",
        `s3://${s3Bucket}/index.html`,
        "--cache-control",
        "public,max-age=300",
        "--content-type",
        "text/html",
      ])
      // Create CloudFront invalidation
      .withExec([
        "cloudfront",
        "create-invalidation",
        "--distribution-id",
        cloudfrontDistId,
        "--paths",
        "/*",
      ])

    // Execute deployment
    const result = await deployContainer.stdout()

    return `✅ Deployment successful!\n\nCloudFront invalidation created:\n${result}`
  }

  /**
   * Full CI/CD pipeline: test, build, and deploy
   *
   * @param source - Source code directory
   * @returns Success message
   */
  @func()
  async pipeline(source: Directory): Promise<string> {
    // Run tests (will throw if tests fail)
    await this.test(source).stdout()

    // Deploy (includes build)
    return await this.deploy(source)
  }
}

export { CltEvents }
