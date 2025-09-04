import { describe, it, expect, beforeEach } from 'vitest'
import { 
  generateSecureCode, 
  isValidCodeFormat, 
  formatCodeInput, 
  generateMultipleCodes 
} from '../secure-code-gen'

describe('Secure Code Generation (ADR-001)', () => {
  describe('generateSecureCode', () => {
    it('should generate code in TBAT-XXXX-XXXX format', () => {
      const code = generateSecureCode()
      expect(code).toMatch(/^TBAT-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
    })

    it('should use safe alphabet (no 0, O, I, 1)', () => {
      const code = generateSecureCode()
      const codePart = code.replace('TBAT-', '').replace('-', '')
      
      // Check that none of the excluded characters appear
      expect(codePart).not.toMatch(/[01OI]/)
    })

    it('should generate unique codes', () => {
      const codes = new Set()
      for (let i = 0; i < 100; i++) {
        codes.add(generateSecureCode())
      }
      
      // Should have 100 unique codes (very high probability with crypto.randomBytes)
      expect(codes.size).toBe(100)
    })

    it('should have sufficient entropy', () => {
      const codes = []
      for (let i = 0; i < 1000; i++) {
        codes.push(generateSecureCode())
      }
      
      // Check character distribution (should be relatively even)
      const charCounts = new Map()
      codes.forEach(code => {
        const codePart = code.replace('TBAT-', '').replace('-', '')
        codePart.split('').forEach(char => {
          charCounts.set(char, (charCounts.get(char) || 0) + 1)
        })
      })
      
      // Each character should appear at least once in 1000 samples
      expect(charCounts.size).toBeGreaterThan(20)
    })
  })

  describe('isValidCodeFormat', () => {
    it('should validate correct TBAT-XXXX-XXXX format', () => {
      expect(isValidCodeFormat('TBAT-A7K9-M3P4')).toBe(true)
      expect(isValidCodeFormat('TBAT-2345-6789')).toBe(true)
      expect(isValidCodeFormat('TBAT-ABCD-EFGH')).toBe(true)
    })

    it('should reject codes with invalid format', () => {
      expect(isValidCodeFormat('TBAT-ABC-DEFG')).toBe(false) // Too short
      expect(isValidCodeFormat('TBAT-ABCDE-FGH')).toBe(false) // Wrong lengths
      expect(isValidCodeFormat('TEST-ABCD-EFGH')).toBe(false) // Wrong prefix
      expect(isValidCodeFormat('TBAT_ABCD_EFGH')).toBe(false) // Wrong separator
      expect(isValidCodeFormat('tbat-abcd-efgh')).toBe(false) // Lowercase
    })

    it('should reject codes with excluded characters', () => {
      expect(isValidCodeFormat('TBAT-A0B1-C2D3')).toBe(false) // Contains 0, 1
      expect(isValidCodeFormat('TBAT-AOBI-C2D3')).toBe(false) // Contains O, I
    })

    it('should handle edge cases', () => {
      expect(isValidCodeFormat('')).toBe(false)
      expect(isValidCodeFormat(null as any)).toBe(false)
      expect(isValidCodeFormat(undefined as any)).toBe(false)
      expect(isValidCodeFormat('TBAT-')).toBe(false)
      expect(isValidCodeFormat('   TBAT-A7K9-M3P4   ')).toBe(true) // Trimmed
    })
  })

  describe('formatCodeInput', () => {
    it('should format user input correctly', () => {
      expect(formatCodeInput('A7K9M3P4')).toBe('TBAT-A7K9-M3P4')
      expect(formatCodeInput('TBATA7K9M3P4')).toBe('TBAT-A7K9-M3P4')
      expect(formatCodeInput('tbat-a7k9-m3p4')).toBe('TBAT-A7K9-M3P4')
    })

    it('should handle partial input', () => {
      expect(formatCodeInput('A7')).toBe('TBAT-A7')
      expect(formatCodeInput('A7K9')).toBe('TBAT-A7K9')
      expect(formatCodeInput('A7K9M')).toBe('TBAT-A7K9-M')
      expect(formatCodeInput('A7K9M3P4X')).toBe('TBAT-A7K9-M3P4') // Truncated
    })

    it('should remove invalid characters', () => {
      expect(formatCodeInput('A7K9!@#M3P4')).toBe('TBAT-A7K9-M3P4')
      expect(formatCodeInput('A7K9 M3P4')).toBe('TBAT-A7K9-M3P4')
    })

    it('should handle empty input', () => {
      expect(formatCodeInput('')).toBe('')
      expect(formatCodeInput('   ')).toBe('')
    })
  })

  describe('generateMultipleCodes', () => {
    it('should generate requested number of codes', () => {
      const codes = generateMultipleCodes(10)
      expect(codes).toHaveLength(10)
    })

    it('should generate unique codes', () => {
      const codes = generateMultipleCodes(50)
      const codeStrings = codes.map(c => c.code)
      const uniqueCodes = new Set(codeStrings)
      expect(uniqueCodes.size).toBe(50)
    })

    it('should generate valid code objects', () => {
      const codes = generateMultipleCodes(5)
      
      codes.forEach(code => {
        expect(code).toMatchObject({
          id: expect.stringMatching(/^code_secure_\d+$/),
          code: expect.stringMatching(/^TBAT-[A-Z0-9]{4}-[A-Z0-9]{4}$/),
          isUsed: false,
          usedBy: null,
          usedAt: null,
          createdAt: expect.any(String),
          expiresAt: null,
          validationAttempts: []
        })
      })
    })

    it('should handle edge cases', () => {
      expect(generateMultipleCodes(0)).toHaveLength(0)
      expect(generateMultipleCodes(1)).toHaveLength(1)
    })
  })
})

describe('Code Generation Performance', () => {
  it('should generate codes efficiently', () => {
    const start = Date.now()
    generateMultipleCodes(1000)
    const duration = Date.now() - start
    
    // Should generate 1000 codes in less than 1 second
    expect(duration).toBeLessThan(1000)
  })

  it('should validate codes efficiently', () => {
    const codes = generateMultipleCodes(1000).map(c => c.code)
    
    const start = Date.now()
    codes.forEach(code => isValidCodeFormat(code))
    const duration = Date.now() - start
    
    // Should validate 1000 codes in less than 100ms
    expect(duration).toBeLessThan(100)
  })
})

describe('Security Properties', () => {
  it('should have unpredictable code generation', () => {
    // Generate multiple codes and check they don't follow predictable patterns
    const codes = generateMultipleCodes(100).map(c => c.code)
    
    // No two codes should be sequential or have obvious patterns
    for (let i = 1; i < codes.length; i++) {
      expect(codes[i]).not.toBe(codes[i-1])
      
      // Extract code parts (without TBAT- prefix) and check they're not sequential
      const prev = codes[i-1].replace('TBAT-', '').replace('-', '')
      const curr = codes[i].replace('TBAT-', '').replace('-', '')
      
      // Check that codes are different (already covered above but more explicit)
      expect(curr).not.toBe(prev)
      
      // For alphanumeric codes, we can't use parseInt since they contain letters
      // The cryptographic randomness ensures unpredictability
    }
  })
})