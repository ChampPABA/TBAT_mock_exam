import { hashPassword, verifyPassword, generateExamCode } from '../../lib/auth-utils'

describe('Auth Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'TestPassword123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50) // bcrypt hashes are typically 60 chars
    })

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2) // Salt should make hashes different
    })

    it('should handle special characters', async () => {
      const password = 'Test@#$%^&*()123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123'
      const hash = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123'
      const wrongPassword = 'WrongPassword123'
      const hash = await hashPassword(password)
      
      const isValid = await verifyPassword(wrongPassword, hash)
      expect(isValid).toBe(false)
    })

    it('should handle empty password', async () => {
      const hash = await hashPassword('test123')
      
      const isValid = await verifyPassword('', hash)
      expect(isValid).toBe(false)
    })

    it('should handle invalid hash format', async () => {
      const password = 'TestPassword123'
      const invalidHash = 'invalid_hash_format'
      
      await expect(verifyPassword(password, invalidHash)).rejects.toThrow()
    })
  })

  describe('generateExamCode', () => {
    it('should generate FREE exam code with subject', () => {
      const code = generateExamCode('FREE', 'BIOLOGY')
      
      expect(code).toMatch(/^FREE-[A-Z0-9]{8}-BIOLOGY$/)
    })

    it('should generate ADVANCED exam code without subject', () => {
      const code = generateExamCode('ADVANCED')
      
      expect(code).toMatch(/^ADV-[A-Z0-9]{8}$/)
    })

    it('should generate different codes on multiple calls', () => {
      const code1 = generateExamCode('FREE', 'BIOLOGY')
      const code2 = generateExamCode('FREE', 'BIOLOGY')
      
      expect(code1).not.toBe(code2)
    })

    it('should handle all FREE subjects', () => {
      const biologyCode = generateExamCode('FREE', 'BIOLOGY')
      const chemistryCode = generateExamCode('FREE', 'CHEMISTRY')
      const physicsCode = generateExamCode('FREE', 'PHYSICS')
      
      expect(biologyCode).toContain('BIOLOGY')
      expect(chemistryCode).toContain('CHEMISTRY')
      expect(physicsCode).toContain('PHYSICS')
    })

    it('should throw error for FREE package without subject', () => {
      expect(() => {
        generateExamCode('FREE')
      }).toThrow('FREE package requires a subject')
    })

    it('should ignore subject parameter for ADVANCED package', () => {
      const code1 = generateExamCode('ADVANCED')
      const code2 = generateExamCode('ADVANCED', 'BIOLOGY' as any)
      
      expect(code1).toMatch(/^ADV-[A-Z0-9]{8}$/)
      expect(code2).toMatch(/^ADV-[A-Z0-9]{8}$/)
      expect(code1).not.toContain('BIOLOGY')
      expect(code2).not.toContain('BIOLOGY')
    })

    it('should generate codes with correct length', () => {
      const freeCode = generateExamCode('FREE', 'BIOLOGY')
      const advancedCode = generateExamCode('ADVANCED')
      
      // FREE-XXXXXXXX-BIOLOGY = 18 chars
      expect(freeCode.length).toBe(18)
      
      // ADV-XXXXXXXX = 12 chars
      expect(advancedCode.length).toBe(12)
    })
  })

  describe('Integration tests', () => {
    it('should work with password flow end-to-end', async () => {
      const password = 'UserPassword123!'
      
      // Hash the password
      const hash = await hashPassword(password)
      
      // Verify the correct password
      const isValidCorrect = await verifyPassword(password, hash)
      expect(isValidCorrect).toBe(true)
      
      // Verify incorrect password fails
      const isValidWrong = await verifyPassword('WrongPassword123!', hash)
      expect(isValidWrong).toBe(false)
    })

    it('should generate unique exam codes consistently', () => {
      const codes = new Set()
      const numCodes = 100
      
      // Generate many codes to test uniqueness
      for (let i = 0; i < numCodes; i++) {
        const code = generateExamCode('ADVANCED')
        codes.add(code)
      }
      
      // All codes should be unique
      expect(codes.size).toBe(numCodes)
    })
  })
})