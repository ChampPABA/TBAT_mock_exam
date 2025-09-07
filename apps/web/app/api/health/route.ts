import { NextRequest, NextResponse } from "next/server"
import { DatabaseMonitor } from "../../../lib/db"
import { apiRateLimit } from "../../../lib/rate-limiter"

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting for health checks
    const rateLimitResult = await apiRateLimit(request)
    
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          status: 'rate_limited'
        }), 
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
            'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
            'Retry-After': '60' // 1 minute in seconds
          }
        }
      )
    }

    // Check database health
    const dbHealth = await DatabaseMonitor.checkHealth()
    
    // Overall system health status
    const systemStatus = dbHealth.connected ? 'healthy' : 'unhealthy'
    const statusCode = dbHealth.connected ? 200 : 503

    return NextResponse.json({
      status: systemStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbHealth.connected ? 'healthy' : 'unhealthy',
          latency: dbHealth.latency || null,
          error: dbHealth.error || null,
          last_check: dbHealth.timestamp.toISOString()
        }
      },
      environment: process.env.NODE_ENV || 'development'
    }, { status: statusCode })
    
  } catch (error) {
    console.error("Health check error:", error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: {
          status: 'error',
          error: 'Failed to perform health check'
        }
      }
    }, { status: 500 })
  }
}