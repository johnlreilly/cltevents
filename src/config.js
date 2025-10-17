/**
 * Application configuration
 * Uses Vite environment variables (import.meta.env)
 */

// API Base URL - defaults to current origin for Vercel deployments
// For AWS CloudFront, set VITE_API_BASE_URL to your Vercel production URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// If API_BASE_URL is empty, API calls will be relative (e.g., /api/events)
// If set, API calls will be absolute (e.g., https://clt.show/api/events)
