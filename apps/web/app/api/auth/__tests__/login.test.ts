import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../login/route"
import { NextRequest } from "next/server"
import { cookies } from "next/headers"

// Mock the mock-api service
vi.mock("@/lib/mock-api", () => ({
  mockAuthService: {
    login: vi.fn()
  }
}))

// Mock Next.js cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn()
}))

const mockCookies = vi.mocked(cookies)

describe("/api/auth/login", () => {
  const mockSet = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookies.mockReturnValue({
      set: mockSet
    } as any)
  })

  it("should login successfully with valid credentials", async () => {
    const { mockAuthService } = await import("@/lib/mock-api")
    
    // Mock successful login
    vi.mocked(mockAuthService.login).mockResolvedValueOnce({
      success: true,
      user: {
        id: "user_123",
        email: "test@email.com",
        name: "Test User",
        school: "Test School",
        grade: "M.6" as const,
        createdAt: "2024-01-01T00:00:00.000Z"
      },
      token: "mock_token_user_123_1234567890",
      message: "เข้าสู่ระบบสำเร็จ (Login successful)"
    })

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@email.com",
        password: "password123"
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({
      success: true,
      user: {
        id: "user_123",
        email: "test@email.com",
        name: "Test User",
        school: "Test School",
        grade: "M.6",
        createdAt: "2024-01-01T00:00:00.000Z"
      },
      message: "เข้าสู่ระบบสำเร็จ (Login successful)"
    })

    // Verify cookie was set
    expect(mockSet).toHaveBeenCalledWith("auth-token", "mock_token_user_123_1234567890", {
      httpOnly: true,
      secure: false, // false in test environment
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/"
    })
  })

  it("should return 400 for missing email", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        password: "password123"
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result).toEqual({
      success: false,
      message: "กรุณากรอกอีเมลและรหัสผ่าน (Email and password are required)"
    })
  })

  it("should return 400 for missing password", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@email.com"
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result).toEqual({
      success: false,
      message: "กรุณากรอกอีเมลและรหัสผ่าน (Email and password are required)"
    })
  })

  it("should return 401 for invalid credentials", async () => {
    const { mockAuthService } = await import("@/lib/mock-api")
    
    // Mock failed login
    vi.mocked(mockAuthService.login).mockResolvedValueOnce({
      success: false,
      message: "ไม่พบผู้ใช้งาน (User not found)"
    })

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "wrong@email.com",
        password: "wrongpassword"
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(401)
    expect(result).toEqual({
      success: false,
      message: "ไม่พบผู้ใช้งาน (User not found)"
    })

    // Cookie should not be set for failed login
    expect(mockSet).not.toHaveBeenCalled()
  })

  it("should return 401 for incorrect password", async () => {
    const { mockAuthService } = await import("@/lib/mock-api")
    
    // Mock failed login with incorrect password
    vi.mocked(mockAuthService.login).mockResolvedValueOnce({
      success: false,
      message: "รหัสผ่านไม่ถูกต้อง (Invalid password)"
    })

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@email.com",
        password: "wrongpassword"
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(401)
    expect(result).toEqual({
      success: false,
      message: "รหัสผ่านไม่ถูกต้อง (Invalid password)"
    })
  })

  it("should handle service errors gracefully", async () => {
    const { mockAuthService } = await import("@/lib/mock-api")
    
    // Mock service error
    vi.mocked(mockAuthService.login).mockRejectedValueOnce(new Error("Service error"))

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@email.com",
        password: "password123"
      })
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result).toEqual({
      success: false,
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ (Internal server error)"
    })
  })

  it("should handle malformed JSON request", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: "invalid json"
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result).toEqual({
      success: false,
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ (Internal server error)"
    })
  })
})