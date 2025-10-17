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
export class Cltevents {
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
   * Run tests: linting and unit/component tests
   *
   * @param source - Source code directory
   * @returns String with test results
   */
  @func()
  async test(source: Directory): Promise<string> {
    const testContainer = dag
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
          "e2e", // Exclude E2E tests (require running server)
        ],
      })
      .withWorkdir("/app")
      .withExec(["npm", "install"])
      // Run linting
      .withExec(["npm", "run", "lint"])
      // Run unit and component tests
      .withExec(["npm", "run", "test:unit"])

    const output = await testContainer.stdout()
    return `✅ Tests passed!\n\n${output}`
  }

  /**
   * Deploy to AWS S3 and invalidate CloudFront cache
   *
   * @param source - Source code directory
   * @param awsAccessKeyId - AWS Access Key ID
   * @param awsSecretAccessKey - AWS Secret Access Key
   * @param awsRegion - AWS Region (default: us-east-1)
   * @param s3Bucket - S3 bucket name
   * @param cloudfrontDistId - CloudFront distribution ID
   * @returns Success message
   */
  @func()
  async deploy(
    source: Directory,
    awsAccessKeyId: string,
    awsSecretAccessKey: string,
    s3Bucket: string,
    cloudfrontDistId: string,
    awsRegion?: string
  ): Promise<string> {
    // First, build the application
    const buildOutput = await this.build(source)

    // Set AWS credentials as secrets
    const accessKeySecret = dag.setSecret("AWS_ACCESS_KEY_ID", awsAccessKeyId)
    const secretKeySecret = dag.setSecret("AWS_SECRET_ACCESS_KEY", awsSecretAccessKey)
    const region = awsRegion || "us-east-1"

    // Deploy to S3 using AWS CLI
    const deployContainer = dag
      .container()
      .from("amazon/aws-cli:latest")
      .withSecretVariable("AWS_ACCESS_KEY_ID", accessKeySecret)
      .withSecretVariable("AWS_SECRET_ACCESS_KEY", secretKeySecret)
      .withEnvVariable("AWS_DEFAULT_REGION", region)
      .withDirectory("/build", buildOutput)
      .withWorkdir("/build")
      // Sync files to S3 with proper content types and cache headers
      .withExec([
        "aws",
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
        "aws",
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
        "aws",
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
   * @param awsAccessKeyId - AWS Access Key ID
   * @param awsSecretAccessKey - AWS Secret Access Key
   * @param s3Bucket - S3 bucket name
   * @param cloudfrontDistId - CloudFront distribution ID
   * @param awsRegion - AWS Region (default: us-east-1)
   * @returns Success message
   */
  @func()
  async pipeline(
    source: Directory,
    awsAccessKeyId: string,
    awsSecretAccessKey: string,
    s3Bucket: string,
    cloudfrontDistId: string,
    awsRegion?: string
  ): Promise<string> {
    // Run tests (will throw if tests fail)
    const testResults = await this.test(source)
    console.log(testResults)

    // Deploy (includes build)
    const deployResults = await this.deploy(
      source,
      awsAccessKeyId,
      awsSecretAccessKey,
      s3Bucket,
      cloudfrontDistId,
      awsRegion
    )

    return `${testResults}\n\n${deployResults}`
  }
}
