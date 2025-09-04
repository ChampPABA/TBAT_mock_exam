import { POST } from '@/app/api/codes/validate/route'
import { NextRequest } from 'next/server'

describe('/api/codes/validate', () => {
  it('validates a correct unused code', async () => {
    const request = new NextRequest('http://localhost:3000/api/codes/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'TBAT-2345-6789' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.valid).toBe(true)
    expect(data.message).toContain('รหัสถูกต้องและพร้อมใช้งาน')
  })

  it('rejects an already used code', async () => {
    const request = new NextRequest('http://localhost:3000/api/codes/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'TBAT-USED-9876' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.valid).toBe(false)
    expect(data.message).toContain('รหัสนี้ถูกใช้งานแล้ว')
  })

  it('rejects an invalid code', async () => {
    const request = new NextRequest('http://localhost:3000/api/codes/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'TBAT-9999-9999' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.valid).toBe(false)
    expect(data.message).toContain('ไม่พบรหัสนี้ในระบบ')
  })

  it('validates code length requirements', async () => {
    const request = new NextRequest('http://localhost:3000/api/codes/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'SHORT' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.valid).toBe(false)
    expect(data.message).toContain('รูปแบบรหัสไม่ถูกต้อง')
  })

  it('handles empty code', async () => {
    const request = new NextRequest('http://localhost:3000/api/codes/validate', {
      method: 'POST',
      body: JSON.stringify({ code: '' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.valid).toBe(false)
    expect(data.message).toContain('กรุณากรอกรหัส')
  })
})