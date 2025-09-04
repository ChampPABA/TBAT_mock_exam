/**
 * Payment Service for handling Stripe operations
 */

import { stripe } from '@/lib/stripe/server'
import { STRIPE_CONFIG } from '@/lib/stripe/config'
import type { 
  CreateCheckoutRequest, 
  CreateCheckoutResponse, 
  CheckoutSessionMetadata,
  PaymentStatus,
  PaymentStatusResponse 
} from '@/lib/types/payment.types'
import type { Stripe } from 'stripe'

export class PaymentService {
  /**
   * Create a Stripe Checkout session for VVIP registration
   */
  static async createCheckoutSession(
    userId: string,
    email: string,
    request: CreateCheckoutRequest
  ): Promise<CreateCheckoutResponse> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: STRIPE_CONFIG.paymentMethodTypes,
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.currency,
              product_data: {
                name: STRIPE_CONFIG.productName,
                description: STRIPE_CONFIG.productDescription,
              },
              unit_amount: STRIPE_CONFIG.vvipPrice,
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/registration/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/registration/cancel`,
        customer_email: email,
        metadata: {
          userId,
          upgradeType: request.upgradeType,
        } as CheckoutSessionMetadata,
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      })

      if (!session.url) {
        throw new Error('Failed to create checkout session URL')
      }

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
        expiresAt: new Date(session.expires_at * 1000).toISOString(),
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw new Error('Failed to create payment session')
    }
  }

  /**
   * Retrieve the status of a checkout session
   */
  static async getSessionStatus(sessionId: string): Promise<PaymentStatusResponse> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      })

      let status: PaymentStatus = 'pending'
      
      if (session.payment_status === 'paid') {
        status = 'complete'
      } else if (session.payment_status === 'unpaid' && session.status === 'expired') {
        status = 'expired'
      } else if (session.payment_intent && 
                 (session.payment_intent as Stripe.PaymentIntent).status === 'processing') {
        status = 'processing'
      }

      return {
        status,
        paid: session.payment_status === 'paid',
        userUpgraded: session.payment_status === 'paid', // In real app, check DB
      }
    } catch (error) {
      console.error('Error retrieving session status:', error)
      throw new Error('Failed to retrieve payment status')
    }
  }

  /**
   * Process successful payment and upgrade user to VVIP
   */
  static async processSuccessfulPayment(session: Stripe.Checkout.Session): Promise<void> {
    const metadata = session.metadata as CheckoutSessionMetadata
    
    if (!metadata?.userId) {
      throw new Error('Missing user ID in session metadata')
    }

    // In a real application, you would:
    // 1. Update user's tier to VVIP in database
    // 2. Create payment record
    // 3. Send confirmation email
    // 4. Update any related records
    
    console.log(`Processing successful payment for user ${metadata.userId}`)
    console.log(`Upgrade type: ${metadata.upgradeType}`)
    console.log(`Amount paid: ฿${session.amount_total! / 100}`)
    
    // TODO: Implement actual database updates when DB is ready
    // await db.user.update({
    //   where: { id: metadata.userId },
    //   data: { tier: 'VVIP' }
    // })
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      throw new Error('Invalid webhook signature')
    }
  }

  /**
   * Check for duplicate webhook processing (idempotency)
   */
  static async isWebhookProcessed(eventId: string): Promise<boolean> {
    // In production, check Redis or database
    // For now, return false to process all webhooks
    return false
  }

  /**
   * Mark webhook as processed
   */
  static async markWebhookProcessed(eventId: string): Promise<void> {
    // In production, store in Redis or database with TTL
    // For now, just log
    console.log(`Marking webhook ${eventId} as processed`)
  }
}