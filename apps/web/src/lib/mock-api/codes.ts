import type { CodeValidationResponse, CodeValidationAttempt } from "./types"
import { mockUniqueCodes } from "./data"
import { isValidCodeFormat, formatCodeInput, generateSecureCode } from "./secure-code-gen"

// Re-export utility functions for client-side use
export { isValidCodeFormat, formatCodeInput, generateSecureCode }

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock in-memory audit trail storage (in real app, this would be in database)
const mockValidationAttempts: CodeValidationAttempt[] = []

// Mock rate limiting storage (IP address -> attempts in last 5 minutes)
const rateLimitStorage: Map<string, number[]> = new Map()

// Helper function to check rate limiting (5 attempts per IP per 5 minutes)
function checkRateLimit(ipAddress: string): boolean {
  const now = Date.now()
  const fiveMinutesAgo = now - (5 * 60 * 1000)
  
  // Get recent attempts for this IP
  const attempts = rateLimitStorage.get(ipAddress) || []
  
  // Filter out attempts older than 5 minutes
  const recentAttempts = attempts.filter(timestamp => timestamp > fiveMinutesAgo)
  
  // Update the storage with only recent attempts
  rateLimitStorage.set(ipAddress, recentAttempts)
  
  // Check if exceeded 5 attempts
  return recentAttempts.length < 5
}

// Helper function to log validation attempts
function logValidationAttempt(
  code: string, 
  ipAddress: string, 
  userAgent: string | null, 
  successful: boolean
): void {
  const attempt: CodeValidationAttempt = {
    id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    code: code,
    ipAddress,
    userAgent,
    successful,
    createdAt: new Date().toISOString(),
    uniqueCode: null // Would be populated with database lookup in real implementation
  }
  
  mockValidationAttempts.push(attempt)
  
  // Add timestamp to rate limiting storage
  const attempts = rateLimitStorage.get(ipAddress) || []
  attempts.push(Date.now())
  rateLimitStorage.set(ipAddress, attempts)
}

export const mockCodeService = {
  async validateCode(
    code: string, 
    ipAddress: string = 'localhost', 
    userAgent: string | null = null
  ): Promise<CodeValidationResponse> {
    // Simulate API delay for real-time validation (reduced for better UX)
    await delay(Math.random() * 400 + 300) // 300-700ms

    try {
      // Rate limiting check - 5 attempts per IP per 5 minutes
      if (!checkRateLimit(ipAddress)) {
        logValidationAttempt(code, ipAddress, userAgent, false)
        return {
          valid: false,
          message: "มีการพยายามยืนยันรหัสมากเกินไป กรุณารอ 5 นาทีก่อนลองใหม่ (Too many attempts. Please wait 5 minutes)"
        }
      }

      // Enhanced format validation using ADR-001 specification
      if (!isValidCodeFormat(code)) {
        logValidationAttempt(code, ipAddress, userAgent, false)
        return {
          valid: false,
          message: "รูปแบบรหัสไม่ถูกต้อง กรุณาใส่รหัสในรูปแบบ TBAT-XXXX-XXXX (Invalid code format. Please use TBAT-XXXX-XXXX format)"
        }
      }

      // Normalize code for lookup (uppercase, consistent format)
      const normalizedCode = code.trim().toUpperCase()

      // Find code in database
      const foundCode = mockUniqueCodes.find(c => c.code === normalizedCode)

      if (!foundCode) {
        logValidationAttempt(normalizedCode, ipAddress, userAgent, false)
        return {
          valid: false,
          message: "ไม่พบรหัสนี้ในระบบ กรุณาตรวจสอบรหัสใน Box Set ของคุณ (Code not found. Please check your Box Set package)"
        }
      }

      if (foundCode.isUsed) {
        logValidationAttempt(normalizedCode, ipAddress, userAgent, false)
        return {
          valid: false,
          message: `รหัสนี้ถูกใช้งานแล้วเมื่อ ${foundCode.usedAt} กรุณาติดต่อทีมสนับสนุนหากต้องการความช่วยเหลือ (Code already used. Contact support for assistance)`
        }
      }

      // Success case
      logValidationAttempt(normalizedCode, ipAddress, userAgent, true)
      return {
        valid: true,
        message: "รหัสถูกต้องและพร้อมใช้งาน (Code is valid and ready for registration)",
        code: foundCode.code
      }

    } catch (error) {
      logValidationAttempt(code, ipAddress, userAgent, false)
      return {
        valid: false,
        message: "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง (System error. Please try again)"
      }
    }
  },

  // Get all available codes (for testing purposes)
  async getAvailableCodes(): Promise<string[]> {
    await delay(300)
    return mockUniqueCodes
      .filter(code => !code.isUsed)
      .map(code => code.code)
  },

  // Get used codes (for testing purposes)  
  async getUsedCodes(): Promise<Array<{ code: string; usedBy: string | null }>> {
    await delay(300)
    return mockUniqueCodes
      .filter(code => code.isUsed)
      .map(code => ({ code: code.code, usedBy: code.usedBy }))
  },

  // Get audit trail for debugging/monitoring (enhanced security feature)
  async getValidationAttempts(limit: number = 50): Promise<CodeValidationAttempt[]> {
    await delay(200)
    return mockValidationAttempts
      .slice(-limit) // Get most recent attempts
      .reverse() // Most recent first
  },

  // Get rate limiting status for an IP (for testing)
  async getRateLimitStatus(ipAddress: string): Promise<{ 
    attemptsInLast5Minutes: number; 
    canAttempt: boolean; 
    resetTime: Date | null 
  }> {
    const now = Date.now()
    const fiveMinutesAgo = now - (5 * 60 * 1000)
    const attempts = rateLimitStorage.get(ipAddress) || []
    const recentAttempts = attempts.filter(timestamp => timestamp > fiveMinutesAgo)
    
    const oldestAttempt = recentAttempts.length > 0 ? Math.min(...recentAttempts) : null
    const resetTime = oldestAttempt ? new Date(oldestAttempt + (5 * 60 * 1000)) : null
    
    return {
      attemptsInLast5Minutes: recentAttempts.length,
      canAttempt: recentAttempts.length < 5,
      resetTime
    }
  },

  // Reset rate limiting for testing purposes
  async resetRateLimit(ipAddress: string): Promise<void> {
    rateLimitStorage.delete(ipAddress)
  }
}