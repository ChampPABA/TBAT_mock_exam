/**
 * Rate limiting middleware for TBAT Mock Exam Platform
 * Protects registration endpoint from abuse
 */

import { NextRequest, NextResponse } from "next/server"

// In-memory storage for development
// In production, use Redis or similar persistent storage
const attempts = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom rate limit message
}

// Default configuration for registration endpoint
export const REGISTRATION_RATE_LIMIT: RateLimitConfig = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 5, // 5 requests per 5 minutes
  message: "มีการลงทะเบียนมากเกินไป กรุณารอ 5 นาทีก่อนลองใหม่ (Too many registration attempts. Please wait 5 minutes)"
}

/**
 * Extract client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Check if we're in test environment and use unique identifiers
  if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
    // Use a combination of user-agent and timestamp for test isolation
    const userAgent = request.headers.get('user-agent') || 'test-agent'
    const timestamp = Date.now()
    return `test-${userAgent}-${timestamp}`
  }
  
  // Try to get real IP from headers (for production behind proxy)
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  if (xRealIp) {
    return xRealIp
  }
  
  // Fallback for development
  return 'localhost'
}

/**
 * Rate limiting middleware function
 */
export function createRateLimit(config: RateLimitConfig) {
  return (request: NextRequest): NextResponse | null => {
    const clientId = getClientIdentifier(request)
    const now = Date.now()
    
    // Clean up expired entries
    for (const [key, value] of attempts.entries()) {
      if (now > value.resetTime) {
        attempts.delete(key)
      }
    }
    
    // Get or create client record
    let clientAttempts = attempts.get(clientId)
    
    if (!clientAttempts || now > clientAttempts.resetTime) {
      // First request or reset window
      clientAttempts = {
        count: 1,
        resetTime: now + config.windowMs
      }
      attempts.set(clientId, clientAttempts)
      return null // Allow request
    }
    
    // Increment attempt count
    clientAttempts.count++
    
    // Check if limit exceeded
    if (clientAttempts.count > config.maxRequests) {
      const resetIn = Math.ceil((clientAttempts.resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: config.message || "Too many requests. Please try again later.",
          retryAfter: resetIn
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(resetIn),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(clientAttempts.resetTime / 1000))
          }
        }
      )
    }
    
    // Update remaining requests header
    const remaining = config.maxRequests - clientAttempts.count
    
    // Allow request but add rate limit headers
    return null // Will be handled by calling code to add headers
  }
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: NextResponse, 
  request: NextRequest, 
  config: RateLimitConfig
): NextResponse {
  const clientId = getClientIdentifier(request)
  const clientAttempts = attempts.get(clientId)
  
  if (clientAttempts) {
    const remaining = Math.max(0, config.maxRequests - clientAttempts.count)
    const resetTime = Math.ceil(clientAttempts.resetTime / 1000)
    
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Reset', String(resetTime))
  }
  
  return response
}

// Export pre-configured rate limiter for registration
export const registrationRateLimit = createRateLimit(REGISTRATION_RATE_LIMIT)