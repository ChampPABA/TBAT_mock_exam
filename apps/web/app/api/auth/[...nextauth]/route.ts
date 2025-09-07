import { handlers } from "../../../../lib/auth"
import { authRateLimit } from "../../../../lib/rate-limiter"
import { NextRequest, NextResponse } from 'next/server'

// Rate-limited GET handler
export async function GET(request: NextRequest) {
  const rateLimitResult = await authRateLimit(request)
  
  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Too many authentication requests. Please try again later.',
        reset: rateLimitResult.reset 
      }), 
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
          'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
          'Retry-After': '900' // 15 minutes in seconds
        }
      }
    )
  }

  return handlers.GET(request)
}

// Rate-limited POST handler
export async function POST(request: NextRequest) {
  const rateLimitResult = await authRateLimit(request)
  
  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Too many authentication requests. Please try again later.',
        reset: rateLimitResult.reset 
      }), 
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
          'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
          'Retry-After': '900' // 15 minutes in seconds
        }
      }
    )
  }

  return handlers.POST(request)
}