import { PACKAGE_PRICES, formatThaiCurrency, validateWebhookSignature } from '../../lib/stripe'

// Mock Stripe
const mockStripe = {
  paymentIntents: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripe)
})

describe('Stripe Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PACKAGE_PRICES', () => {
    it('should have correct Thai Baht prices', () => {
      expect(PACKAGE_PRICES.ADVANCED_PACKAGE).toBe(69000) // 690 THB in satang
      expect(PACKAGE_PRICES.POST_EXAM_UPGRADE).toBe(29000) // 290 THB in satang
    })

    it('should have all required package types', () => {
      expect(PACKAGE_PRICES).toHaveProperty('ADVANCED_PACKAGE')
      expect(PACKAGE_PRICES).toHaveProperty('POST_EXAM_UPGRADE')
    })
  })

  describe('formatThaiCurrency', () => {
    it('should format satang to Thai Baht correctly', () => {
      expect(formatThaiCurrency(69000)).toBe('฿690.00')
      expect(formatThaiCurrency(29000)).toBe('฿290.00')
      expect(formatThaiCurrency(100)).toBe('฿1.00')
      expect(formatThaiCurrency(50)).toBe('฿0.50')
    })

    it('should handle zero amount', () => {
      expect(formatThaiCurrency(0)).toBe('฿0.00')
    })

    it('should handle large amounts', () => {
      expect(formatThaiCurrency(1000000)).toBe('฿10,000.00')
      expect(formatThaiCurrency(999999)).toBe('฿9,999.99')
    })

    it('should always show 2 decimal places', () => {
      expect(formatThaiCurrency(500)).toBe('฿5.00')
      expect(formatThaiCurrency(1050)).toBe('฿10.50')
    })
  })

  describe('validateWebhookSignature', () => {
    it('should validate webhook signature successfully', () => {
      const mockEvent = { type: 'payment_intent.succeeded' }
      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)
      
      const body = 'webhook_payload'
      const signature = 'stripe_signature'
      const secret = 'webhook_secret'
      
      const result = validateWebhookSignature(body, signature, secret)
      
      expect(result).toEqual(mockEvent)
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(body, signature, secret)
    })

    it('should throw error for invalid signature', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })
      
      const body = 'webhook_payload'
      const signature = 'invalid_signature'
      const secret = 'webhook_secret'
      
      expect(() => {
        validateWebhookSignature(body, signature, secret)
      }).toThrow('Invalid signature')
    })

    it('should handle missing signature', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('No signatures found matching the expected signature for payload')
      })
      
      const body = 'webhook_payload'
      const signature = ''
      const secret = 'webhook_secret'
      
      expect(() => {
        validateWebhookSignature(body, signature, secret)
      }).toThrow()
    })
  })

  describe('Thai Baht specific tests', () => {
    it('should work with Thai Baht currency amounts', () => {
      // Test realistic Thai Baht amounts
      const amounts = [
        { satang: 69000, display: '฿690.00' },
        { satang: 29000, display: '฿290.00' },
        { satang: 199900, display: '฿1,999.00' },
        { satang: 50, display: '฿0.50' },
      ]

      amounts.forEach(({ satang, display }) => {
        expect(formatThaiCurrency(satang)).toBe(display)
      })
    })

    it('should handle fractional Thai Baht correctly', () => {
      // Thai Baht has satang (1/100) as smallest unit
      expect(formatThaiCurrency(1)).toBe('฿0.01') // 1 satang
      expect(formatThaiCurrency(99)).toBe('฿0.99') // 99 satang
      expect(formatThaiCurrency(199)).toBe('฿1.99') // 199 satang
    })

    it('should format large Thai amounts with commas', () => {
      expect(formatThaiCurrency(100000000)).toBe('฿1,000,000.00') // 1 million baht
      expect(formatThaiCurrency(12345678)).toBe('฿123,456.78')
    })
  })

  describe('Business logic validation', () => {
    it('should have prices matching TBAT business requirements', () => {
      // Verify prices match the documented business requirements
      // Advanced Package: 690 THB = 69,000 satang
      expect(PACKAGE_PRICES.ADVANCED_PACKAGE).toBe(69000)
      
      // Post-exam upgrade: 290 THB = 29,000 satang  
      expect(PACKAGE_PRICES.POST_EXAM_UPGRADE).toBe(29000)
    })

    it('should calculate upgrade savings correctly', () => {
      const advancedPrice = PACKAGE_PRICES.ADVANCED_PACKAGE
      const upgradePrice = PACKAGE_PRICES.POST_EXAM_UPGRADE
      const savings = advancedPrice - upgradePrice
      
      // Users save 400 THB by buying Advanced upfront vs upgrading later
      expect(savings).toBe(40000) // 400 THB in satang
      expect(formatThaiCurrency(savings)).toBe('฿400.00')
    })

    it('should support future pricing changes', () => {
      // Ensure the price constants can be easily modified
      expect(typeof PACKAGE_PRICES.ADVANCED_PACKAGE).toBe('number')
      expect(typeof PACKAGE_PRICES.POST_EXAM_UPGRADE).toBe('number')
      
      // Prices should be positive
      expect(PACKAGE_PRICES.ADVANCED_PACKAGE).toBeGreaterThan(0)
      expect(PACKAGE_PRICES.POST_EXAM_UPGRADE).toBeGreaterThan(0)
      
      // Advanced should cost more than upgrade
      expect(PACKAGE_PRICES.ADVANCED_PACKAGE).toBeGreaterThan(PACKAGE_PRICES.POST_EXAM_UPGRADE)
    })
  })
})