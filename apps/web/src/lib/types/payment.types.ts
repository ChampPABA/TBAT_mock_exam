import type { Stripe } from 'stripe'

export type UpgradeType = 'PRE_EXAM' | 'POST_RESULTS'

export type PaymentStatus = 'pending' | 'processing' | 'complete' | 'expired'

export interface CreateCheckoutRequest {
  upgradeType: UpgradeType
  returnUrl?: string
}

export interface CreateCheckoutResponse {
  checkoutUrl: string
  sessionId: string
  expiresAt: string
}

export interface PaymentStatusResponse {
  status: PaymentStatus
  paid: boolean
  userUpgraded: boolean
}

export interface WebhookEvent {
  id: string
  type: string
  created: number
  data: {
    object: Stripe.Checkout.Session | Stripe.PaymentIntent
  }
}

export interface CheckoutSessionMetadata {
  userId: string
  upgradeType: UpgradeType
  registrationId?: string
}

export interface PaymentError {
  code: string
  message: string
  recoverable: boolean
}