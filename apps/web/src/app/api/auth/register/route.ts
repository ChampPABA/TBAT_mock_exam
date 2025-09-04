import { NextRequest, NextResponse } from "next/server"
import { mockAuthService } from "@/lib/mock-api"
import type { RegisterData } from "@/lib/mock-api"
import { registrationRateLimit, addRateLimitHeaders, REGISTRATION_RATE_LIMIT } from "@/lib/middleware/rate-limiter"
import { logApiError } from "@/lib/utils/logger"

export async function POST(request: NextRequest) {
  // Apply rate limiting first
  const rateLimitResponse = registrationRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body: RegisterData = await request.json()
    
    // Validate required fields based on tier
    const requiredFields = ['email', 'name', 'school', 'grade', 'password', 'lineId', 'subjects']
    const missingFields = requiredFields.filter(field => !body[field as keyof RegisterData])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Set default tier if not provided and no BoxSet code
    if (!body.tier && !body.uniqueCode) {
      body.tier = "FREE"
    }
    
    // Only validate subject selection for FREE tier when no BoxSet code is provided
    // BoxSet codes will automatically set tier to VVIP in the service
    if (!body.uniqueCode && body.tier === "FREE" && body.subjects.length !== 1) {
      return NextResponse.json(
        { success: false, message: "ผู้ใช้ระดับ FREE สามารถเลือกได้เพียง 1 วิชา" },
        { status: 400 }
      )
    }

    const result = await mockAuthService.register(body)
    
    if (result.success) {
      // Set secure HTTP-only cookie for authentication
      const response = NextResponse.json(
        { success: true, user: result.user, message: result.message },
        { status: 201 }
      )
      
      // Set authentication cookie with security flags
      response.cookies.set("tbat_token", result.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/"
      })
      
      // Add rate limiting headers to successful response
      return addRateLimitHeaders(response, request, REGISTRATION_RATE_LIMIT)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    // Use proper logging instead of console.error
    logApiError("Registration error", error, request, {
      operation: 'register'
    })
    
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการลงทะเบียน" },
      { status: 500 }
    )
  }
}