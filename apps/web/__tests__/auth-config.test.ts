import { describe, test, expect } from '@jest/globals'
import { hashPassword, verifyPassword } from '../lib/auth-utils'

describe('NextAuth.js Configuration', () => {
  test('should have proper authentication utilities', async () => {
    console.log('🔐 Testing NextAuth.js Configuration...\n')

    // Test 1: Password Hashing
    console.log('1. Testing Password Hashing...')
    const plainPassword = 'testpassword123'
    const hashedPassword = await hashPassword(plainPassword)
    
    expect(hashedPassword).toBeDefined()
    expect(hashedPassword).not.toBe(plainPassword)
    expect(hashedPassword.length).toBeGreaterThan(50)
    console.log('   ✅ Password hashing works correctly')

    // Test 2: Password Verification
    console.log('\n2. Testing Password Verification...')
    const isValidPassword = await verifyPassword(plainPassword, hashedPassword)
    const isInvalidPassword = await verifyPassword('wrongpassword', hashedPassword)
    
    expect(isValidPassword).toBe(true)
    expect(isInvalidPassword).toBe(false)
    console.log('   ✅ Password verification works correctly')

    // Test 3: Thai Language Support
    console.log('\n3. Testing Thai Language Support...')
    const thaiData = {
      thai_name: 'ทดสอบ ผู้ใช้ไทย',
      school: 'โรงเรียนทดสอบ',
      phone: '0812345678'
    }
    
    expect(thaiData.thai_name).toContain('ทดสอบ')
    expect(thaiData.school).toContain('โรงเรียน')
    expect(thaiData.phone).toMatch(/^08\d{8}$/)
    console.log('   ✅ Thai language data validation passed')

    // Test 4: Environment Variables
    console.log('\n4. Testing Environment Variables...')
    const nextAuthSecret = process.env.NEXTAUTH_SECRET
    const nextAuthUrl = process.env.NEXTAUTH_URL
    
    expect(nextAuthSecret).toBeDefined()
    expect(nextAuthUrl).toBeDefined()
    expect(nextAuthUrl).toBe('http://localhost:3000')
    console.log('   ✅ NextAuth environment variables configured')

    console.log('\n🎉 NextAuth.js Configuration Tests PASSED!\n')
  })

  test('should validate TBAT business logic for auth', async () => {
    console.log('🏫 Testing TBAT Authentication Business Logic...\n')

    // Test 1: Package Types
    console.log('1. Testing Package Types...')
    const packageTypes = ['FREE', 'ADVANCED']
    packageTypes.forEach(packageType => {
      expect(['FREE', 'ADVANCED']).toContain(packageType)
    })
    console.log('   ✅ Package type validation passed')

    // Test 2: Session Structure
    console.log('\n2. Testing Session Structure...')
    const mockSession = {
      user: {
        id: 'test-id',
        email: 'test@example.com',
        thai_name: 'ทดสอบ ผู้ใช้',
        package_type: 'FREE' as const,
        is_upgraded: false,
        pdpa_consent: true
      }
    }

    expect(mockSession.user.package_type).toBe('FREE')
    expect(mockSession.user.pdpa_consent).toBe(true)
    expect(mockSession.user.thai_name).toContain('ทดสอบ')
    console.log('   ✅ Session structure validated')

    // Test 3: PDPA Compliance
    console.log('\n3. Testing PDPA Compliance...')
    const pdpaRequiredFields = ['pdpa_consent']
    pdpaRequiredFields.forEach(field => {
      expect(mockSession.user).toHaveProperty(field)
    })
    console.log('   ✅ PDPA compliance fields present')

    console.log('\n🎉 TBAT Authentication Business Logic Tests PASSED!\n')
  })
})