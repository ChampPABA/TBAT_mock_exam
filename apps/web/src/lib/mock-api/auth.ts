import type { RegisterData, LoginData, AuthResponse, User } from "./types"
import { mockUsers, mockUniqueCodes, mockSchools, mockPasswords } from "./data"
import bcrypt from "bcryptjs"
import { generateExamTicket } from "../utils/ticket-generator"

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Generate simple JWT-like token for mock
const generateMockToken = (user: User): string => {
  return `mock_token_${user.id}_${Date.now()}`
}

// Generate unique user ID
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const mockAuthService = {
  async register(userData: RegisterData): Promise<AuthResponse> {
    // Simulate API delay
    await delay(Math.random() * 1000 + 500) // 500-1500ms

    try {
      // Determine tier based on BoxSet code (backward compatibility)
      let tier: "FREE" | "VVIP" = userData.tier || "FREE"
      let codeIndex = -1

      if (userData.uniqueCode) {
        // Check if BoxSet code is valid (backward compatibility)
        codeIndex = mockUniqueCodes.findIndex(
          (code) => code.code === userData.uniqueCode && !code.isUsed
        )
        
        if (codeIndex !== -1) {
          // Valid BoxSet code = VVIP tier
          tier = "VVIP"
        } else {
          // Invalid code provided
          return {
            success: false,
            message: "รหัสไม่ถูกต้องหรือถูกใช้งานแล้ว (Invalid or already used code)"
          }
        }
      }

      // Validate subject selection
      if (tier === "FREE" && userData.subjects.length !== 1) {
        return {
          success: false,
          message: "ผู้ใช้ระดับ FREE สามารถเลือกได้เพียง 1 วิชา (FREE tier can select only 1 subject)"
        }
      }

      if (tier === "VVIP" && userData.subjects.length === 0) {
        return {
          success: false,
          message: "กรุณาเลือกวิชาที่ต้องการสอบ (Please select subjects)"
        }
      }

      // Check if email already exists
      const existingUser = mockUsers.find(user => user.email === userData.email)
      if (existingUser) {
        return {
          success: false,
          message: "อีเมลนี้ถูกใช้งานแล้ว (Email already registered)"
        }
      }

      // Validate school
      if (!mockSchools.includes(userData.school)) {
        return {
          success: false,
          message: "โรงเรียนไม่ถูกต้อง (Invalid school)"
        }
      }

      // Generate exam ticket
      const examTicket = generateExamTicket()

      // Create new user
      const newUser: User = {
        id: generateUserId(),
        email: userData.email,
        name: userData.name,
        school: userData.school,
        grade: userData.grade,
        lineId: userData.lineId,
        tier,
        subjects: userData.subjects,
        examTicket,
        parent: userData.parent,
        createdAt: new Date().toISOString()
      }

      // Mark code as used (if provided)
      if (codeIndex !== -1) {
        mockUniqueCodes[codeIndex].isUsed = true
        mockUniqueCodes[codeIndex].usedBy = userData.email
      }

      // Add user to mock database
      mockUsers.push(newUser)
      
      // Hash password with bcrypt for security
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds)
      mockPasswords[userData.email] = hashedPassword

      // Generate token
      const token = generateMockToken(newUser)

      return {
        success: true,
        user: newUser,
        token,
        message: "ลงทะเบียนสำเร็จ (Registration successful)"
      }

    } catch (error) {
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการลงทะเบียน (Registration error)"
      }
    }
  },

  async login(loginData: LoginData): Promise<AuthResponse> {
    // Simulate API delay
    await delay(Math.random() * 800 + 300) // 300-1100ms

    try {
      // Find user by email
      const user = mockUsers.find(u => u.email === loginData.email)
      
      if (!user) {
        return {
          success: false,
          message: "ไม่พบผู้ใช้งาน (User not found)"
        }
      }

      // Compare password with hashed version using bcrypt
      const storedPassword = mockPasswords[loginData.email]
      if (!storedPassword) {
        return {
          success: false,
          message: "รหัสผ่านไม่ถูกต้อง (Invalid password)"
        }
      }

      const passwordMatch = await bcrypt.compare(loginData.password, storedPassword)
      if (!passwordMatch) {
        return {
          success: false,
          message: "รหัสผ่านไม่ถูกต้อง (Invalid password)"
        }
      }

      // Generate token
      const token = generateMockToken(user)

      return {
        success: true,
        user,
        token,
        message: "เข้าสู่ระบบสำเร็จ (Login successful)"
      }

    } catch (error) {
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ (Login error)"
      }
    }
  },

  async validateToken(token: string): Promise<{ valid: boolean; user?: User }> {
    // Simulate API delay
    await delay(200)

    try {
      // Simple token validation for mock
      const tokenParts = token.split('_')
      if (tokenParts.length !== 4 || tokenParts[0] !== 'mock' || tokenParts[1] !== 'token') {
        return { valid: false }
      }

      const userId = tokenParts[2]
      const user = mockUsers.find(u => u.id === userId)
      
      return { valid: !!user, user }
    } catch {
      return { valid: false }
    }
  }
}