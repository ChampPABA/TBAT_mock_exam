import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests in window
  message?: string; // Custom error message
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

// Default configurations for different endpoints
export const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: "Too many authentication attempts. Please try again later.",
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registration attempts per hour
    message: "Too many registration attempts. Please try again later.",
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: "Too many password reset requests. Please try again later.",
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute for general API
    message: "Too many requests. Please slow down.",
  },
  payment: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 payment attempts per hour
    message: "Too many payment attempts. Please try again later.",
  },
} as const;

// Initialize Redis client for rate limiting
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// In-memory store fallback for development
const memoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware for Next.js API routes
 * Uses Upstash Redis in production, in-memory store in development
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = rateLimitConfigs.api
): Promise<NextResponse | null> {
  // Get client identifier (IP address or custom key)
  const identifier = config.keyGenerator ? config.keyGenerator(req) : getClientIdentifier(req);

  const key = `rate_limit:${identifier}:${req.nextUrl.pathname}`;
  const now = Date.now();
  const resetTime = now + config.windowMs;

  try {
    if (redis) {
      // Use Redis for rate limiting in production
      const current = await redis.get<{ count: number; resetTime: number }>(key);

      if (current) {
        if (now > current.resetTime) {
          // Window expired, reset counter
          await redis.setex(key, Math.floor(config.windowMs / 1000), {
            count: 1,
            resetTime,
          });
          return null; // Allow request
        }

        if (current.count >= config.max) {
          // Rate limit exceeded
          return createRateLimitResponse(config.message, current.resetTime);
        }

        // Increment counter
        await redis.setex(key, Math.floor(config.windowMs / 1000), {
          count: current.count + 1,
          resetTime: current.resetTime,
        });
      } else {
        // First request in window
        await redis.setex(key, Math.floor(config.windowMs / 1000), {
          count: 1,
          resetTime,
        });
      }
    } else {
      // Use in-memory store for development
      const current = memoryStore.get(key);

      if (current) {
        if (now > current.resetTime) {
          // Window expired, reset counter
          memoryStore.set(key, { count: 1, resetTime });
          return null; // Allow request
        }

        if (current.count >= config.max) {
          // Rate limit exceeded
          return createRateLimitResponse(config.message, current.resetTime);
        }

        // Increment counter
        memoryStore.set(key, {
          count: current.count + 1,
          resetTime: current.resetTime,
        });
      } else {
        // First request in window
        memoryStore.set(key, { count: 1, resetTime });
      }

      // Clean up old entries periodically in memory store
      if (Math.random() < 0.01) {
        // 1% chance on each request
        cleanupMemoryStore();
      }
    }

    return null; // Allow request
  } catch (error) {
    console.error("Rate limiting error:", error);
    // On error, allow request to prevent blocking legitimate users
    return null;
  }
}

/**
 * Get client identifier from request
 * Uses IP address with fallback to user agent
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get real IP from headers (considering proxies)
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = req.ip;

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (ip) {
    return ip;
  }

  // Fallback to user agent hash if no IP available
  const userAgent = req.headers.get("user-agent") || "unknown";
  return `ua_${Buffer.from(userAgent).toString("base64").substring(0, 16)}`;
}

/**
 * Create rate limit exceeded response
 */
function createRateLimitResponse(
  message = "Too many requests. Please try again later.",
  resetTime: number
): NextResponse {
  const retryAfterSeconds = Math.ceil((resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: "Rate limit exceeded",
      message,
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSeconds.toString(),
        "X-RateLimit-Limit": "0",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(resetTime).toISOString(),
      },
    }
  );
}

/**
 * Clean up expired entries from memory store
 */
function cleanupMemoryStore(): void {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetTime) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Middleware wrapper for easier use in API routes
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = await rateLimit(req, config);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(req);
  };
}
