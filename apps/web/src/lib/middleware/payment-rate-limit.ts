/**
 * Payment-specific rate limiting middleware
 * Protects payment endpoints from abuse
 */

import { createRateLimit, RateLimitConfig, addRateLimitHeaders } from './rate-limiter'

// Payment endpoint rate limit configuration
export const PAYMENT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 5, // 5 requests per 5 minutes
  message: "Too many payment requests. Please wait before trying again."
}

// Webhook endpoint rate limit (more lenient for Stripe)
export const WEBHOOK_RATE_LIMIT: RateLimitConfig = {
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 20, // 20 requests per minute
  message: "Too many webhook requests."
}

// Export pre-configured rate limiters
export const paymentRateLimit = createRateLimit(PAYMENT_RATE_LIMIT)
export const webhookRateLimit = createRateLimit(WEBHOOK_RATE_LIMIT)

// Re-export addRateLimitHeaders for convenience
export { addRateLimitHeaders }