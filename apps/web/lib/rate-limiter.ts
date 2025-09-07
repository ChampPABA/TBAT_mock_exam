import { NextRequest } from 'next/server'

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: NextRequest) => string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting (use Redis/Upstash for production)
const store: RateLimitStore = {}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime <= now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator = (req) => getClientIP(req) } = options

  return async (request: NextRequest): Promise<{ success: boolean; reset?: number; remaining?: number }> => {
    const key = keyGenerator(request)
    const now = Date.now()
    const windowStart = now - windowMs

    // Initialize or get existing rate limit data
    let rateLimitData = store[key]
    
    if (!rateLimitData || rateLimitData.resetTime <= windowStart) {
      // Reset the rate limit window
      rateLimitData = {
        count: 0,
        resetTime: now + windowMs
      }
      store[key] = rateLimitData
    }

    // Increment the request count
    rateLimitData.count++

    const success = rateLimitData.count <= maxRequests
    const remaining = Math.max(0, maxRequests - rateLimitData.count)
    const reset = Math.ceil(rateLimitData.resetTime / 1000)

    return {
      success,
      reset,
      remaining
    }
  }
}

// Helper function to extract client IP
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to connection IP
  return request.ip || 'unknown'
}

// Pre-configured rate limiters for common scenarios
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 login attempts per 15 minutes per IP
})

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute per IP
})

export const paymentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10 // 10 payment attempts per hour per IP
})