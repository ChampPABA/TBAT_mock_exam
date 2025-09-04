/**
 * Payment API client functions
 */

import type { CreateCheckoutRequest, CreateCheckoutResponse, PaymentStatusResponse } from '@/lib/types/payment.types'

export class PaymentAPI {
  /**
   * Create a Stripe checkout session
   */
  static async createCheckoutSession(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse> {
    const response = await fetch('/api/payment/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create checkout session')
    }

    return response.json()
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(sessionId: string): Promise<PaymentStatusResponse> {
    const response = await fetch(`/api/payment/status/${sessionId}`, {
      method: 'GET',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get payment status')
    }

    return response.json()
  }

  /**
   * Redirect to Stripe Checkout
   */
  static async redirectToCheckout(sessionUrl: string): Promise<void> {
    window.location.href = sessionUrl
  }
}