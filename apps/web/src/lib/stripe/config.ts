import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with publishable key
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'thb',
  paymentMethodTypes: ['card', 'promptpay'],
  vvipPrice: 69000, // ฿690 in smallest unit (satang)
  productName: 'TBAT VVIP Registration',
  productDescription: 'Access to all 3 subjects and detailed analytics',
} as const