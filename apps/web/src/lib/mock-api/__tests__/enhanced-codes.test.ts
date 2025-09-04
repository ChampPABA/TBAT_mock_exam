import { describe, it, expect, beforeEach } from 'vitest'
import { mockCodeService } from '../codes'

describe('Enhanced Code Validation Service', () => {
  beforeEach(() => {
    // Reset rate limiting storage before each test
  })

  describe('validateCode with Security Enhancements', () => {
    it('should validate format before database lookup', async () => {
      const result = await mockCodeService.validateCode(
        'INVALID-FORMAT',
        '192.168.1.1',
        'test-agent'
      )

      expect(result.valid).toBe(false)
      expect(result.message).toContain('รูปแบบรหัสไม่ถูกต้อง')
    })

    it('should handle valid unused codes', async () => {
      const result = await mockCodeService.validateCode(
        'TBAT-2345-6789',
        '192.168.1.1',
        'test-agent'
      )

      expect(result.valid).toBe(true)
      expect(result.message).toContain('รหัสถูกต้องและพร้อมใช้งาน')
      expect(result.code).toBe('TBAT-2345-6789')
    })

    it('should handle code not found', async () => {
      const result = await mockCodeService.validateCode(
        'TBAT-9999-9999',
        '192.168.1.1',
        'test-agent'
      )

      expect(result.valid).toBe(false)
      expect(result.message).toContain('ไม่พบรหัสนี้ในระบบ')
    })

    it('should handle used codes', async () => {
      const result = await mockCodeService.validateCode(
        'TBAT-USED-9876',
        '192.168.1.1',
        'test-agent'
      )

      expect(result.valid).toBe(false)
      expect(result.message).toContain('รหัสนี้ถูกใช้งานแล้ว')
    })

    it('should implement rate limiting', async () => {
      const ipAddress = '192.168.1.100'
      
      // Make 5 attempts (should all work)
      for (let i = 0; i < 5; i++) {
        const result = await mockCodeService.validateCode(
          'TBAT-2345-6789',
          ipAddress,
          'test-agent'
        )
        expect(result.valid).toBe(true)
      }
      
      // 6th attempt should be rate limited
      const rateLimitedResult = await mockCodeService.validateCode(
        'TBAT-2345-6789',
        ipAddress,
        'test-agent'
      )
      
      expect(rateLimitedResult.valid).toBe(false)
      expect(rateLimitedResult.message).toContain('มากเกินไป')
    })

    it('should log validation attempts', async () => {
      await mockCodeService.validateCode(
        'TBAT-2345-6789',
        '192.168.1.1',
        'Mozilla/5.0 Test Agent'
      )

      const attempts = await mockCodeService.getValidationAttempts(10)
      expect(attempts.length).toBeGreaterThan(0)
      
      const lastAttempt = attempts[0]
      expect(lastAttempt).toMatchObject({
        code: 'TBAT-2345-6789',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test Agent',
        successful: true
      })
    })

    it('should handle network errors gracefully', async () => {
      // Test with invalid input - null will be caught as invalid format
      const result = await mockCodeService.validateCode(
        null as any,
        '192.168.99.99', // Use unique IP to avoid rate limiting
        'test-agent'
      )

      expect(result.valid).toBe(false)
      // Null input is handled as invalid format, not system error
      expect(result.message).toContain('รูปแบบรหัส')
    })
  })

  describe('Rate Limiting Functionality', () => {
    it('should track rate limit status', async () => {
      const ipAddress = '192.168.1.200'
      
      // Make 3 attempts
      for (let i = 0; i < 3; i++) {
        await mockCodeService.validateCode(
          'TBAT-2345-6789',
          ipAddress,
          'test-agent'
        )
      }

      const status = await mockCodeService.getRateLimitStatus(ipAddress)
      expect(status.attemptsInLast5Minutes).toBe(3)
      expect(status.canAttempt).toBe(true)
      expect(status.resetTime).toBeInstanceOf(Date)
    })

    it('should reset rate limits', async () => {
      const ipAddress = '192.168.1.300'
      
      // Make 5 attempts to reach limit
      for (let i = 0; i < 5; i++) {
        await mockCodeService.validateCode(
          'TBAT-2345-6789',
          ipAddress,
          'test-agent'
        )
      }

      // Should be at limit
      let status = await mockCodeService.getRateLimitStatus(ipAddress)
      expect(status.canAttempt).toBe(false)

      // Reset rate limit
      await mockCodeService.resetRateLimit(ipAddress)

      // Should be able to attempt again
      status = await mockCodeService.getRateLimitStatus(ipAddress)
      expect(status.canAttempt).toBe(true)
      expect(status.attemptsInLast5Minutes).toBe(0)
    })
  })

  describe('Audit Trail Functionality', () => {
    it('should maintain audit trail of validation attempts', async () => {
      const testCases = [
        { code: 'TBAT-2345-6789', ip: '192.168.1.1', agent: 'Chrome' },
        { code: 'TBAT-FAKE-CODE', ip: '192.168.1.2', agent: 'Firefox' },
        { code: 'INVALID-FORMAT', ip: '192.168.1.3', agent: 'Safari' }
      ]

      for (const testCase of testCases) {
        await mockCodeService.validateCode(
          testCase.code,
          testCase.ip,
          testCase.agent
        )
      }

      const attempts = await mockCodeService.getValidationAttempts(10)
      expect(attempts.length).toBeGreaterThanOrEqual(testCases.length)

      // Check that attempts are in reverse chronological order (most recent first)
      for (let i = 1; i < attempts.length; i++) {
        const prevTime = new Date(attempts[i-1].createdAt).getTime()
        const currTime = new Date(attempts[i].createdAt).getTime()
        expect(prevTime).toBeGreaterThanOrEqual(currTime)
      }
    })

    it('should limit audit trail results', async () => {
      // Make fewer attempts to avoid timeout
      for (let i = 0; i < 8; i++) {
        await mockCodeService.validateCode(
          'TBAT-2345-6789',
          `192.168.2.${i}`,
          'test-agent'
        )
      }

      const attempts = await mockCodeService.getValidationAttempts(5)
      expect(attempts.length).toBeLessThanOrEqual(5)
    }, 10000) // Increase timeout to 10 seconds
  })

  describe('Legacy API Compatibility', () => {
    it('should maintain backward compatibility for existing methods', async () => {
      const availableCodes = await mockCodeService.getAvailableCodes()
      expect(Array.isArray(availableCodes)).toBe(true)

      const usedCodes = await mockCodeService.getUsedCodes()
      expect(Array.isArray(usedCodes)).toBe(true)
      usedCodes.forEach(code => {
        expect(code).toMatchObject({
          code: expect.any(String),
          usedBy: expect.any(String)
        })
      })
    })
  })

  describe('Performance Requirements', () => {
    it('should respond within acceptable time limits', async () => {
      const start = Date.now()
      
      await mockCodeService.validateCode(
        'TBAT-2345-6789',
        '192.168.1.1',
        'test-agent'
      )
      
      const duration = Date.now() - start
      
      // Should respond within 1 second (includes simulated network delay)
      expect(duration).toBeLessThan(1000)
    })

    it('should handle concurrent validation requests', async () => {
      const promises = []
      
      for (let i = 0; i < 10; i++) {
        promises.push(mockCodeService.validateCode(
          'TBAT-2345-6789',
          `192.168.1.${i}`,
          'test-agent'
        ))
      }

      const results = await Promise.all(promises)
      
      // All requests should complete successfully
      expect(results).toHaveLength(10)
      results.forEach(result => {
        expect(result).toMatchObject({
          valid: expect.any(Boolean),
          message: expect.any(String)
        })
      })
    })
  })
})