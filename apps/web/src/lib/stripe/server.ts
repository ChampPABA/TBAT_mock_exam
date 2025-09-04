import Stripe from 'stripe'

// Initialize Stripe SDK for server-side operations
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Webhook secret for signature verification
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string