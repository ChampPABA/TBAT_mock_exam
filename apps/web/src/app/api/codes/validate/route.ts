import { NextRequest, NextResponse } from "next/server"
import { mockCodeService } from "@/lib/mock-api"
import { logApiError } from "@/lib/utils/logger"

// Helper function to extract client IP address
function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP address
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  const xClientIp = request.headers.get('x-client-ip')
  
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return xForwardedFor.split(',')[0].trim()
  }
  
  if (xRealIp) return xRealIp
  if (xClientIp) return xClientIp
  
  // Fallback to a default IP for development
  return 'localhost'
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    // Extract client information for audit trail and rate limiting
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent')
    
    // Basic input validation
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { 
          valid: false, 
          message: "กรุณากรอกรหัส Box Set (Please enter your Box Set code)",
          error: "MISSING_CODE"
        },
        { status: 400 }
      )
    }

    // Call enhanced validation service with audit trail support
    const result = await mockCodeService.validateCode(code, clientIp, userAgent)
    
    // Handle rate limiting response (ADR-001 specification)
    if (result.message.includes('มากเกินไป') || result.message.includes('Too many attempts')) {
      return NextResponse.json(
        { 
          valid: false, 
          message: result.message,
          error: "RATE_LIMITED"
        },
        { status: 429 } // Too Many Requests
      )
    }
    
    // Handle invalid format response
    if (result.message.includes('รูปแบบรหัสไม่ถูกต้อง') || result.message.includes('Invalid code format')) {
      return NextResponse.json(
        { 
          valid: false, 
          message: result.message,
          error: "INVALID_FORMAT"
        },
        { status: 400 }
      )
    }
    
    // Handle code not found
    if (result.message.includes('ไม่พบรหัสนี้') || result.message.includes('Code not found')) {
      return NextResponse.json(
        { 
          valid: false, 
          message: result.message,
          error: "CODE_NOT_FOUND"
        },
        { status: 404 }
      )
    }
    
    // Handle already used code
    if (result.message.includes('ถูกใช้งานแล้ว') || result.message.includes('already used')) {
      return NextResponse.json(
        { 
          valid: false, 
          message: result.message,
          error: "CODE_ALREADY_USED"
        },
        { status: 409 } // Conflict
      )
    }
    
    // Success response
    if (result.valid) {
      return NextResponse.json(
        { 
          valid: true, 
          message: result.message,
          codeId: result.code // Include code ID for registration process
        },
        { status: 200 }
      )
    }
    
    // Generic error fallback
    return NextResponse.json(result, { status: 200 })
    
  } catch (error) {
    // Use proper logging instead of console.error
    logApiError("Code validation API error", error, request, {
      ip: getClientIp(request),
      operation: 'validate-code'
    })
    
    return NextResponse.json(
      { 
        valid: false, 
        message: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง (System error. Please try again)",
        error: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}

// Add OPTIONS method for CORS preflight requests (if needed)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}