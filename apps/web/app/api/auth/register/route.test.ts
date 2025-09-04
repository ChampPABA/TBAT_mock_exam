import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock the auth service
vi.mock('@/lib/mock-api', () => ({
  mockAuthService: {
    register: vi.fn()
  }
}))

import { mockAuthService } from '@/lib/mock-api'

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FREE tier registration', () => {
    it('should register user without BoxSet code', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        school: 'Test School',
        grade: 'M.4' as const,
        lineId: 'line123',
        tier: 'FREE' as const,
        subjects: ['Physics'],
        examTicket: 'TBAT-2025-TEST',
        createdAt: new Date().toISOString()
      }

      vi.mocked(mockAuthService.register).mockResolvedValue({
        success: true,
        user: mockUser,
        token: 'mock_token',
        message: 'Registration successful'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          school: 'Test School',
          grade: 'M.4',
          lineId: 'line123',
          subjects: ['Physics']
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user.tier).toBe('FREE')
      expect(data.user.examTicket).toBeDefined()
    })

    it('should reject FREE tier with multiple subjects', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          school: 'Test School',
          grade: 'M.4',
          lineId: 'line123',
          tier: 'FREE',
          subjects: ['Physics', 'Chemistry']
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('FREE')
    })

    it('should require Line ID field', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          school: 'Test School',
          grade: 'M.4',
          subjects: ['Physics']
          // Missing lineId
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('lineId')
    })
  })

  describe('VVIP tier registration (backward compatibility)', () => {
    it('should register user with valid BoxSet code as VVIP', async () => {
      const mockUser = {
        id: 'user_456',
        email: 'vvip@example.com',
        name: 'VVIP User',
        school: 'Elite School',
        grade: 'M.5' as const,
        lineId: 'line456',
        tier: 'VVIP' as const,
        subjects: ['Physics', 'Chemistry', 'Biology'],
        examTicket: 'TBAT-2025-VVIP',
        createdAt: new Date().toISOString()
      }

      vi.mocked(mockAuthService.register).mockResolvedValue({
        success: true,
        user: mockUser,
        token: 'mock_token',
        message: 'Registration successful'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          uniqueCode: 'TBAT-2345-6789', // Using existing test code
          email: 'vvip@example.com',
          password: 'password123',
          name: 'VVIP User',
          school: 'Elite School',
          grade: 'M.5',
          lineId: 'line456',
          tier: 'VVIP', // Explicitly set tier for test
          subjects: ['Physics', 'Chemistry', 'Biology']
        })
      })

      const response = await POST(request)
      const data = await response.json()

      // Debug log to see what's happening
      if (!data.success) {
        console.log('VVIP registration error:', data.message)
      }

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user.tier).toBe('VVIP')
    })
  })

  describe('Parent information', () => {
    it('should accept optional parent information', async () => {
      const mockUser = {
        id: 'user_789',
        email: 'minor@example.com',
        name: 'Minor Student',
        school: 'High School',
        grade: 'M.4' as const,
        lineId: 'line789',
        tier: 'FREE' as const,
        subjects: ['Physics'],
        examTicket: 'TBAT-2025-MIN',
        parent: {
          name: 'Parent Name',
          relation: 'father' as const,
          phone: '0801234567'
        },
        createdAt: new Date().toISOString()
      }

      vi.mocked(mockAuthService.register).mockResolvedValue({
        success: true,
        user: mockUser,
        token: 'mock_token',
        message: 'Registration successful'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'minor@example.com',
          password: 'password123',
          name: 'Minor Student',
          school: 'High School',
          grade: 'M.4',
          lineId: 'line789',
          subjects: ['Physics'],
          parent: {
            name: 'Parent Name',
            relation: 'father',
            phone: '0801234567'
          }
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user.parent).toBeDefined()
      expect(data.user.parent.name).toBe('Parent Name')
    })
  })
})