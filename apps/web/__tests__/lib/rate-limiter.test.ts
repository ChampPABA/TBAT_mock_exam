import { NextRequest } from 'next/server'
import { rateLimit, authRateLimit, apiRateLimit, paymentRateLimit } from '../../lib/rate-limiter'

// Helper function to create a mock NextRequest
function createMockRequest(ip: string = '127.0.0.1'): NextRequest {
  return {
    ip,
    headers: new Headers(),
  } as unknown as NextRequest
}

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Clear any existing rate limit data
    jest.clearAllMocks()
  })

  describe('rateLimit function', () => {
    it('should allow requests within the limit', async () => {
      const limiter = rateLimit({
        windowMs: 60000, // 1 minute
        maxRequests: 3
      })

      const request = createMockRequest()
      
      // First request should succeed
      const result1 = await limiter(request)
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(2)
      
      // Second request should succeed
      const result2 = await limiter(request)
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(1)
      
      // Third request should succeed
      const result3 = await limiter(request)
      expect(result3.success).toBe(true)
      expect(result3.remaining).toBe(0)
    })

    it('should block requests over the limit', async () => {
      const limiter = rateLimit({
        windowMs: 60000, // 1 minute
        maxRequests: 2
      })

      const request = createMockRequest()
      
      // First two requests should succeed
      await limiter(request)
      await limiter(request)
      
      // Third request should fail
      const result = await limiter(request)
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.reset).toBeDefined()
    })

    it('should differentiate between different IPs', async () => {
      const limiter = rateLimit({
        windowMs: 60000,
        maxRequests: 1
      })

      const request1 = createMockRequest('192.168.1.1')
      const request2 = createMockRequest('192.168.1.2')
      
      // First IP - first request should succeed
      const result1 = await limiter(request1)
      expect(result1.success).toBe(true)
      
      // First IP - second request should fail
      const result2 = await limiter(request1)
      expect(result2.success).toBe(false)
      
      // Second IP - first request should succeed
      const result3 = await limiter(request2)
      expect(result3.success).toBe(true)
    })

    it('should handle X-Forwarded-For header', async () => {
      const limiter = rateLimit({
        windowMs: 60000,
        maxRequests: 1
      })

      const headers = new Headers()
      headers.set('x-forwarded-for', '203.0.113.1, 198.51.100.1')
      
      const request = {
        headers,
        ip: '127.0.0.1'
      } as unknown as NextRequest
      
      // Should use the first IP from X-Forwarded-For
      const result1 = await limiter(request)
      expect(result1.success).toBe(true)
      
      const result2 = await limiter(request)
      expect(result2.success).toBe(false)
    })
  })

  describe('Pre-configured rate limiters', () => {
    it('authRateLimit should have correct configuration', async () => {
      const request = createMockRequest()
      
      // Should allow up to 5 requests
      for (let i = 0; i < 5; i++) {
        const result = await authRateLimit(request)
        expect(result.success).toBe(true)
      }
      
      // 6th request should fail
      const result = await authRateLimit(request)
      expect(result.success).toBe(false)
    })

    it('apiRateLimit should have higher limits', async () => {
      const request = createMockRequest()
      
      // Should allow many more requests than auth limiter
      for (let i = 0; i < 10; i++) {
        const result = await apiRateLimit(request)
        expect(result.success).toBe(true)
      }
    })

    it('paymentRateLimit should have strict limits', async () => {
      const request = createMockRequest()
      
      // Should allow up to 10 requests
      for (let i = 0; i < 10; i++) {
        const result = await paymentRateLimit(request)
        expect(result.success).toBe(true)
      }
      
      // 11th request should fail
      const result = await paymentRateLimit(request)
      expect(result.success).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle requests without IP', async () => {
      const limiter = rateLimit({
        windowMs: 60000,
        maxRequests: 1
      })

      const request = {
        headers: new Headers(),
        ip: undefined
      } as unknown as NextRequest
      
      // Should still work with 'unknown' as key
      const result = await limiter(request)
      expect(result.success).toBe(true)
    })

    it('should reset after window expires', async () => {
      const limiter = rateLimit({
        windowMs: 100, // Very short window for testing
        maxRequests: 1
      })

      const request = createMockRequest()
      
      // First request should succeed
      const result1 = await limiter(request)
      expect(result1.success).toBe(true)
      
      // Second request should fail
      const result2 = await limiter(request)
      expect(result2.success).toBe(false)
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Request should succeed again after window reset
      const result3 = await limiter(request)
      expect(result3.success).toBe(true)
    })
  })
})