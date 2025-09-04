/**
 * Redis-backed Rate Limiting Middleware for TBAT Mock Exam Platform
 * Production-ready implementation with fallback to in-memory storage
 */

import { NextRequest, NextResponse } from "next/server"
import Redis from "ioredis"

// Redis client singleton
let redis: Redis | null = null

// Initialize Redis connection
function getRedisClient(): Redis | null {
  if (redis) return redis
  
  // Skip Redis in test environment
  if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
    return null
  }
  
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL
  
  if (!redisUrl) {
    console.warn('[Rate Limiter] Redis URL not configured, using in-memory fallback')
    return null
  }
  
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('[Rate Limiter] Redis connection failed, using in-memory fallback')
          return null // Stop retrying
        }
        return Math.min(times * 100, 3000)
      },
      reconnectOnError: (err) => {
        console.error('[Rate Limiter] Redis error:', err.message)
        return false
      }
    })
    
    redis.on('error', (err) => {
      console.error('[Rate Limiter] Redis error:', err)
      // Don't crash the app, just fallback to in-memory
    })
    
    redis.on('connect', () => {
      console.log('[Rate Limiter] Redis connected successfully')
    })
    
    return redis
  } catch (error) {
    console.error('[Rate Limiter] Failed to initialize Redis:', error)
    return null
  }
}

// In-memory fallback storage
const memoryStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom rate limit message
  keyPrefix?: string // Redis key prefix
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  registration: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5,
    keyPrefix: 'rate:register',
    message: "มีการลงทะเบียนมากเกินไป กรุณารอ 5 นาทีก่อนลองใหม่"
  },
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    keyPrefix: 'rate:login',
    message: "มีการเข้าสู่ระบบมากเกินไป กรุณารอ 15 นาทีก่อนลองใหม่"
  },
  codeValidation: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 20,
    keyPrefix: 'rate:code',
    message: "มีการตรวจสอบรหัสมากเกินไป กรุณารอสักครู่"
  },
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: 'rate:api',
    message: "Too many requests, please slow down"
  }
} as const

/**
 * Extract client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Check if we're in test environment
  if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
    const userAgent = request.headers.get('user-agent') || 'test-agent'
    const timestamp = Date.now()
    return `test-${userAgent}-${timestamp}`
  }
  
  // Try to get real IP from headers (for production behind proxy)
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  if (xRealIp) {
    return xRealIp
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  // Fallback for development
  return 'localhost'
}

/**
 * Check rate limit using Redis with in-memory fallback
 */
async function checkRateLimitRedis(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const client = getRedisClient()
  const now = Date.now()
  
  // Use Redis if available
  if (client && client.status === 'ready') {
    try {
      const redisKey = `${config.keyPrefix}:${key}`
      const ttl = Math.ceil(config.windowMs / 1000) // TTL in seconds
      
      // Use Redis pipeline for atomic operations
      const pipeline = client.pipeline()
      pipeline.incr(redisKey)
      pipeline.expire(redisKey, ttl)
      pipeline.ttl(redisKey)
      
      const results = await pipeline.exec()
      
      if (!results) {
        throw new Error('Redis pipeline failed')
      }
      
      const [[, count], , [, remainingTtl]] = results as [[null, number], any, [null, number]]
      const resetTime = now + (remainingTtl * 1000)
      
      if (count > config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime
        }
      }
      
      return {
        allowed: true,
        remaining: Math.max(0, config.maxRequests - count),
        resetTime
      }
      
    } catch (error) {
      console.error('[Rate Limiter] Redis error, falling back to memory:', error)
      // Fall through to in-memory implementation
    }
  }
  
  // In-memory fallback
  return checkRateLimitMemory(key, config)
}

/**
 * In-memory rate limit check (fallback)
 */
function checkRateLimitMemory(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  
  // Clean up expired entries
  for (const [k, v] of memoryStore.entries()) {
    if (now > v.resetTime) {
      memoryStore.delete(k)
    }
  }
  
  // Get or create client record
  let record = memoryStore.get(key)
  
  if (!record || now > record.resetTime) {
    // First request or reset window
    record = {
      count: 1,
      resetTime: now + config.windowMs
    }
    memoryStore.set(key, record)
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: record.resetTime
    }
  }
  
  // Increment count
  record.count++
  
  // Check if limit exceeded
  if (record.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime
    }
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime
  }
}

/**
 * Create rate limiting middleware
 */
export function createRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
      return null
    }
    
    const clientId = getClientIdentifier(request)
    const { allowed, remaining, resetTime } = await checkRateLimitRedis(clientId, config)
    
    if (!allowed) {
      const resetIn = Math.ceil((resetTime - Date.now()) / 1000)
      
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
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000))
          }
        }
      )
    }
    
    // Request allowed - headers will be added by calling code
    return null
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
  const record = memoryStore.get(clientId)
  
  if (record) {
    const remaining = Math.max(0, config.maxRequests - record.count)
    const resetTime = Math.ceil(record.resetTime / 1000)
    
    response.headers.set('X-RateLimit-Limit', String(config.maxRequests))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Reset', String(resetTime))
  }
  
  return response
}

/**
 * Reset rate limit for a specific client (e.g., after successful login)
 */
export async function resetRateLimit(
  request: NextRequest,
  keyPrefix: string
): Promise<void> {
  const clientId = getClientIdentifier(request)
  const key = `${keyPrefix}:${clientId}`
  
  // Try Redis first
  const client = getRedisClient()
  if (client && client.status === 'ready') {
    try {
      await client.del(key)
      return
    } catch (error) {
      console.error('[Rate Limiter] Failed to reset Redis key:', error)
    }
  }
  
  // Fallback to memory
  memoryStore.delete(clientId)
}

// Export pre-configured rate limiters
export const registrationRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.registration)
export const loginRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.login)
export const codeValidationRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.codeValidation)
export const apiRateLimit = createRateLimit(RATE_LIMIT_CONFIGS.api)

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    if (redis) {
      redis.disconnect()
    }
  })
  
  process.on('SIGTERM', () => {
    if (redis) {
      redis.disconnect()
    }
  })
}