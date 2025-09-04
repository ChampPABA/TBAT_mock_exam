import { POST } from '@/app/api/auth/register/route'
import { NextRequest } from 'next/server'

describe('/api/auth/register', () => {
  it('registers a new user successfully', async () => {
    const registerData = {
      uniqueCode: 'TBAT-2345-6789',
      email: 'newuser@example.com',
      name: 'สมชาย ใหม่',
      school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
      grade: 'M.6',
      password: 'Password123',
      lineId: 'test.line.id',
      subjects: ['Physics', 'Chemistry']
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe(registerData.email)
    expect(data.token).toBeDefined()
  })

  it('rejects registration with used code', async () => {
    const registerData = {
      uniqueCode: 'TBAT-USED-9876',
      email: 'test@example.com',
      name: 'Test User',
      school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
      grade: 'M.6',
      password: 'Password123',
      lineId: 'test.line.id2',
      subjects: ['Physics']
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain('รหัสไม่ถูกต้องหรือถูกใช้งานแล้ว')
  })

  it('rejects registration with existing email', async () => {
    const registerData = {
      uniqueCode: 'TBAT-ABCD-EFGH',
      email: 'somchai@example.com', // Existing user email
      name: 'Test User',
      school: 'โรงเรียนมัธยมศึกษาเชียงใหม่',
      grade: 'M.6',
      password: 'Password123',
      lineId: 'test.line.id3',
      subjects: ['Physics']
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain('อีเมลนี้ถูกใช้งานแล้ว')
  })

  it('validates required fields', async () => {
    const incompleteData = {
      uniqueCode: 'TBAT2024-001',
      email: 'test@example.com'
      // Missing name, school, grade, password
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(incompleteData)
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain('กรุณากรอกข้อมูลให้ครบถ้วน')
  })
})