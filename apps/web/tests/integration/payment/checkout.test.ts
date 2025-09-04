/**
 * Integration tests for Stripe Checkout flow
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { PaymentService } from '@/lib/services/payment.service'
import type { CreateCheckoutRequest } from '@/lib/types/payment.types'

// Mock Stripe SDK
vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      }
    },
    webhooks: {
      constructEvent: vi.fn(),
    }
  },
  webhookSecret: 'test_webhook_secret'
}))

describe('Payment Checkout Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCheckoutSession', () => {
    test('should create a valid checkout session for VVIP upgrade', async () => {
      // Arrange
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        expires_at: Math.floor(Date.now() / 1000) + 1800,
      }

      const { stripe } = await import('@/lib/stripe/server')
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValueOnce(mockSession as any)

      const request: CreateCheckoutRequest = {
        upgradeType: 'PRE_EXAM'
      }

      // Act
      const result = await PaymentService.createCheckoutSession(
        'user_123',
        'test@example.com',
        request
      )

      // Assert
      expect(result).toEqual({
        checkoutUrl: mockSession.url,
        sessionId: mockSession.id,
        expiresAt: expect.any(String),
      })

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        payment_method_types: ['card', 'promptpay'],
        line_items: [{
          price_data: {
            currency: 'thb',
            product_data: {
              name: 'TBAT VVIP Registration',
              description: 'Access to all 3 subjects and detailed analytics',
            },
            unit_amount: 69000,
          },
          quantity: 1,
        }],
        success_url: expect.stringContaining('/registration/success'),
        cancel_url: expect.stringContaining('/registration/cancel'),
        customer_email: 'test@example.com',
        metadata: {
          userId: 'user_123',
          upgradeType: 'PRE_EXAM',
        },
        expires_at: expect.any(Number),
      })
    })

    test('should handle checkout session creation failure', async () => {
      // Arrange
      const { stripe } = await import('@/lib/stripe/server')
      vi.mocked(stripe.checkout.sessions.create).mockRejectedValueOnce(
        new Error('Stripe API error')
      )

      const request: CreateCheckoutRequest = {
        upgradeType: 'PRE_EXAM'
      }

      // Act & Assert
      await expect(
        PaymentService.createCheckoutSession('user_123', 'test@example.com', request)
      ).rejects.toThrow('Failed to create payment session')
    })
  })

  describe('getSessionStatus', () => {
    test('should return correct status for paid session', async () => {
      // Arrange
      const mockSession = {
        id: 'cs_test_123',
        payment_status: 'paid',
        status: 'complete',
      }

      const { stripe } = await import('@/lib/stripe/server')
      vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValueOnce(mockSession as any)

      // Act
      const result = await PaymentService.getSessionStatus('cs_test_123')

      // Assert
      expect(result).toEqual({
        status: 'complete',
        paid: true,
        userUpgraded: true,
      })
    })

    test('should return expired status for expired session', async () => {
      // Arrange
      const mockSession = {
        id: 'cs_test_123',
        payment_status: 'unpaid',
        status: 'expired',
      }

      const { stripe } = await import('@/lib/stripe/server')
      vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValueOnce(mockSession as any)

      // Act
      const result = await PaymentService.getSessionStatus('cs_test_123')

      // Assert
      expect(result).toEqual({
        status: 'expired',
        paid: false,
        userUpgraded: false,
      })
    })
  })

  describe('Webhook Processing', () => {
    test('should verify valid webhook signature', () => {
      // Arrange
      const payload = JSON.stringify({ type: 'checkout.session.completed' })
      const signature = 'valid_signature'
      const secret = 'test_webhook_secret'

      const mockEvent = {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
          }
        }
      }

      const { stripe } = require('@/lib/stripe/server')
      vi.mocked(stripe.webhooks.constructEvent).mockReturnValueOnce(mockEvent as any)

      // Act
      const result = PaymentService.verifyWebhookSignature(payload, signature, secret)

      // Assert
      expect(result).toEqual(mockEvent)
      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        secret
      )
    })

    test('should reject invalid webhook signature', () => {
      // Arrange
      const payload = JSON.stringify({ type: 'checkout.session.completed' })
      const signature = 'invalid_signature'
      const secret = 'test_webhook_secret'

      const { stripe } = require('@/lib/stripe/server')
      vi.mocked(stripe.webhooks.constructEvent).mockImplementationOnce(() => {
        throw new Error('Invalid signature')
      })

      // Act & Assert
      expect(() => {
        PaymentService.verifyWebhookSignature(payload, signature, secret)
      }).toThrow('Invalid webhook signature')
    })
  })

  describe('processSuccessfulPayment', () => {
    test('should process successful payment with valid metadata', async () => {
      // Arrange
      const mockSession = {
        id: 'cs_test_123',
        payment_status: 'paid',
        amount_total: 69000,
        metadata: {
          userId: 'user_123',
          upgradeType: 'PRE_EXAM',
        }
      }

      // Spy on console.log to verify processing
      const consoleSpy = vi.spyOn(console, 'log')

      // Act
      await PaymentService.processSuccessfulPayment(mockSession as any)

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Processing successful payment for user user_123'
      )
      expect(consoleSpy).toHaveBeenCalledWith('Upgrade type: PRE_EXAM')
      expect(consoleSpy).toHaveBeenCalledWith('Amount paid: ฿690')

      consoleSpy.mockRestore()
    })

    test('should throw error for missing user ID in metadata', async () => {
      // Arrange
      const mockSession = {
        id: 'cs_test_123',
        payment_status: 'paid',
        metadata: {}
      }

      // Act & Assert
      await expect(
        PaymentService.processSuccessfulPayment(mockSession as any)
      ).rejects.toThrow('Missing user ID in session metadata')
    })
  })
})