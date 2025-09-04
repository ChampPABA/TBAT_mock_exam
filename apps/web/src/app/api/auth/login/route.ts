import { NextRequest, NextResponse } from 'next/server'
import { mockAuthService } from '@/lib/mock-api'
import type { LoginData } from '@/lib/mock-api'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Basic validation
    if (!body.email || !body.password) {
      return NextResponse.json(
        { 
          success: false,
          message: "กรุณากรอกอีเมลและรหัสผ่าน (Email and password are required)"
        },
        { status: 400 }
      )
    }

    // Use mockAuthService to handle login
    const loginData: LoginData = {
      email: body.email,
      password: body.password
    }
    
    const result = await mockAuthService.login(loginData)
    
    if (result.success && result.token && result.user) {
      // Set auth cookie
      const cookieStore = await cookies()
      cookieStore.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/'
      })
      
      return NextResponse.json({
        success: true,
        user: result.user,
        message: result.message
      }, { status: 200 })
    }
    
    // Login failed
    return NextResponse.json({
      success: false,
      message: result.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ (Login failed)"
    }, { status: 401 })
    
  } catch (error) {
    console.error('[AUTH] Login error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ (Internal server error)"
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json(
    { 
      status: 'healthy',
      endpoint: '/api/auth/login',
      methods: ['POST']
    },
    { status: 200 }
  )
}