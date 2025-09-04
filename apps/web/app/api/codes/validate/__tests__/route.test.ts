import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, OPTIONS } from '../route'

// Mock the mockCodeService
vi.mock('@/lib/mock-api', () => ({
  mockCodeService: {
    validateCode: vi.fn()
  }
}))

import { mockCodeService } from '@/lib/mock-api'

describe('/api/codes/validate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST method', () => {
    it('should validate code and return success response', async () => {
      const mockValidateCode = vi.mocked(mockCodeService.validateCode)
      mockValidateCode.mockResolvedValue({
        valid: true,
        message: 'รหัสถูกต้องและพร้อมใช้งาน',
        code: 'TBAT-A7K9-M3P4'
      })

      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0 Test'
        },
        body: JSON.stringify({ code: 'TBAT-A7K9-M3P4' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        valid: true,
        message: 'รหัสถูกต้องและพร้อมใช้งาน',
        codeId: 'TBAT-A7K9-M3P4'
      })
      
      expect(mockValidateCode).toHaveBeenCalledWith(
        'TBAT-A7K9-M3P4',
        '192.168.1.1',
        'Mozilla/5.0 Test'
      )
    })

    it('should handle missing code parameter', async () => {
      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        valid: false,
        message: 'กรุณากรอกรหัส Box Set (Please enter your Box Set code)',
        error: 'MISSING_CODE'
      })
    })

    it('should handle invalid code type', async () => {
      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 123 })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('MISSING_CODE')
    })

    it('should handle rate limiting responses', async () => {
      const mockValidateCode = vi.mocked(mockCodeService.validateCode)
      mockValidateCode.mockResolvedValue({
        valid: false,
        message: 'มีการพยายามยืนยันรหัสมากเกินไป กรุณารอ 5 นาทีก่อนลองใหม่'
      })

      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'TBAT-A7K9-M3P4' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('RATE_LIMITED')
    })

    it('should handle invalid format responses', async () => {
      const mockValidateCode = vi.mocked(mockCodeService.validateCode)
      mockValidateCode.mockResolvedValue({
        valid: false,
        message: 'รูปแบบรหัสไม่ถูกต้อง กรุณาใส่รหัสในรูปแบบ TBAT-XXXX-XXXX'
      })

      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'INVALID' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('INVALID_FORMAT')
    })

    it('should handle code not found responses', async () => {
      const mockValidateCode = vi.mocked(mockCodeService.validateCode)
      mockValidateCode.mockResolvedValue({
        valid: false,
        message: 'ไม่พบรหัสนี้ในระบบ กรุณาตรวจสอบรหัสใน Box Set ของคุณ'
      })

      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'TBAT-NOTF-OUND' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('CODE_NOT_FOUND')
    })

    it('should handle already used codes', async () => {
      const mockValidateCode = vi.mocked(mockCodeService.validateCode)
      mockValidateCode.mockResolvedValue({
        valid: false,
        message: 'รหัสนี้ถูกใช้งานแล้วเมื่อ 2024-01-15T08:30:00Z'
      })

      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'TBAT-USED-GONE' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('CODE_ALREADY_USED')
    })

    it('should extract client IP from various headers', async () => {
      const mockValidateCode = vi.mocked(mockCodeService.validateCode)
      mockValidateCode.mockResolvedValue({
        valid: true,
        message: 'Valid',
        code: 'TEST'
      })

      const testCases = [
        {
          headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178' },
          expectedIp: '203.0.113.195'
        },
        {
          headers: { 'x-real-ip': '203.0.113.195' },
          expectedIp: '203.0.113.195'
        },
        {
          headers: { 'x-client-ip': '203.0.113.195' },
          expectedIp: '203.0.113.195'
        },
        {
          headers: {},
          expectedIp: 'localhost'
        }
      ]

      for (const testCase of testCases) {
        const request = new NextRequest('http://localhost/api/codes/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...testCase.headers
          },
          body: JSON.stringify({ code: 'TBAT-TEST-CODE' })
        })

        await POST(request)

        expect(mockValidateCode).toHaveBeenCalledWith(
          'TBAT-TEST-CODE',
          testCase.expectedIp,
          null
        )

        mockValidateCode.mockClear()
      }
    })

    it('should handle service errors gracefully', async () => {
      const mockValidateCode = vi.mocked(mockCodeService.validateCode)
      mockValidateCode.mockRejectedValue(new Error('Service unavailable'))

      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'TBAT-A7K9-M3P4' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        valid: false,
        message: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง (System error. Please try again)',
        error: 'INTERNAL_ERROR'
      })
    })

    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('INTERNAL_ERROR')
    })
  })

  describe('OPTIONS method', () => {
    it('should return CORS headers', async () => {
      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'OPTIONS'
      })

      const response = await OPTIONS(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type')
    })
  })

  describe('Error Logging', () => {
    it('should log detailed error information using structured logging', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const mockValidateCode = vi.mocked(mockCodeService.validateCode)
      mockValidateCode.mockRejectedValue(new Error('Test error'))

      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Test Agent'
        },
        body: JSON.stringify({ code: 'TBAT-A7K9-M3P4' })
      })

      await POST(request)

      // Expect structured JSON logging format
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"ERROR"')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"message":"Code validation API error"')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"error":"Test error"')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"ip":"192.168.1.1"')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"userAgent":"Test Agent"')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Security Headers', () => {
    it('should not expose sensitive information in error responses', async () => {
      const mockValidateCode = vi.mocked(mockCodeService.validateCode)
      mockValidateCode.mockRejectedValue(new Error('Database connection failed with password: secret123'))

      const request = new NextRequest('http://localhost/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'TBAT-A7K9-M3P4' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.message).not.toContain('password')
      expect(data.message).not.toContain('secret123')
      expect(data.message).toContain('เกิดข้อผิดพลาดในระบบ')
    })
  })
})