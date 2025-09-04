import { describe, it, expect, vi } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

describe('Registration Integration Tests (Story 1.1)', () => {
  describe('FREE tier registration flow', () => {
    it('should complete full FREE tier registration flow', async () => {
      const testData = {
        email: 'free-user@example.com',
        name: 'Free Tier User',
        school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
        grade: 'M.5',
        lineId: 'freeTierUser2025',
        subjects: ['Physics'], // FREE tier: exactly 1 subject
        password: 'SecurePass123',
        parent: {
          name: 'Parent Name',
          relation: 'mother',
          phone: '0801234567',
          email: 'parent@example.com'
        }
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(testData)
      })

      const response = await POST(request)
      const data = await response.json()

      // Should register successfully
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      
      // Verify FREE tier properties
      expect(data.user.tier).toBe('FREE')
      expect(data.user.subjects).toEqual(['Physics'])
      expect(data.user.examTicket).toMatch(/^TBAT-2025-[A-Z0-9]{4}$/)
      expect(data.user.lineId).toBe('freeTierUser2025')
      expect(data.user.parent).toBeDefined()
      expect(data.user.parent.name).toBe('Parent Name')
    })

    it('should reject FREE tier with multiple subjects', async () => {
      const testData = {
        email: 'invalid-free@example.com',
        name: 'Invalid Free User',
        school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
        grade: 'M.5',
        lineId: 'invalidFreeUser',
        subjects: ['Physics', 'Chemistry'], // Invalid for FREE tier
        password: 'SecurePass123'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(testData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('FREE')
    })
  })

  describe('VVIP tier registration with BoxSet code', () => {
    it('should complete VVIP registration with valid BoxSet code', async () => {
      const testData = {
        uniqueCode: 'TBAT-2345-6789', // Valid test code
        email: 'vvip-user@example.com',
        name: 'VVIP User',
        school: 'โรงเรียนยุพราชวิทยาลัย',
        grade: 'M.6',
        lineId: 'vvipUser2025',
        subjects: ['Physics', 'Chemistry', 'Biology'],
        password: 'SecurePass123'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(testData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user.tier).toBe('VVIP')
      expect(data.user.subjects).toEqual(['Physics', 'Chemistry', 'Biology'])
      expect(data.user.examTicket).toMatch(/^TBAT-2025-[A-Z0-9]{4}$/)
    })
  })

  describe('Validation requirements', () => {
    it('should require Line ID field', async () => {
      const testData = {
        email: 'test@example.com',
        name: 'Test User',
        school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
        grade: 'M.5',
        // Missing lineId
        subjects: ['Physics'],
        password: 'SecurePass123'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(testData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('lineId')
    })

    it('should require subjects field', async () => {
      const testData = {
        email: 'test@example.com',
        name: 'Test User',
        school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
        grade: 'M.5',
        lineId: 'testuser',
        // Missing subjects
        password: 'SecurePass123'
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(testData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('subjects')
    })
  })

  describe('Exam ticket generation', () => {
    it('should generate unique exam tickets for multiple registrations', async () => {
      const tickets = new Set<string>()
      const timestamp = Date.now()

      for (let i = 0; i < 3; i++) {
        const testData = {
          email: `user${i}_${timestamp}@example.com`,
          name: `User ${i}`,
          school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
          grade: 'M.5' as const,
          lineId: `user${i}_${timestamp}`,
          subjects: ['Physics'],
          password: 'SecurePass123'
        }

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(testData)
        })

        const response = await POST(request)
        const data = await response.json()

        if (data.success) {
          tickets.add(data.user.examTicket)
        }
      }

      // Should have unique tickets
      expect(tickets.size).toBe(3)
      // All tickets should match format
      tickets.forEach(ticket => {
        expect(ticket).toMatch(/^TBAT-2025-[A-Z0-9]{4}$/)
      })
    }, 10000) // Extended timeout
  })

  describe('Backward compatibility', () => {
    it('should handle optional parent information', async () => {
      const testData = {
        email: 'parent-test@example.com',
        name: 'Student With Parent Info',
        school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
        grade: 'M.4',
        lineId: 'studentWithParent',
        subjects: ['Physics'],
        password: 'SecurePass123',
        parent: {
          name: 'Test Parent',
          relation: 'father',
          phone: '0812345678',
          email: 'test.parent@example.com'
        }
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(testData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user.parent).toBeDefined()
      expect(data.user.parent.name).toBe('Test Parent')
      expect(data.user.parent.relation).toBe('father')
    })

    it('should work without parent information', async () => {
      const testData = {
        email: 'no-parent@example.com',
        name: 'Student Without Parent',
        school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
        grade: 'M.6',
        lineId: 'studentNoParent',
        subjects: ['Physics'],
        password: 'SecurePass123'
        // No parent information
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(testData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user.parent).toBeUndefined()
    })
  })
})