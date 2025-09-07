import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  appInfo: {
    name: "TBAT Mock Exam Platform",
    version: "1.0.0",
  },
})

// TBAT Package Pricing in Thai Baht
export const PACKAGE_PRICES = {
  ADVANCED_PACKAGE: 69000, // 690 THB in satang (Stripe uses smallest currency unit)
  POST_EXAM_UPGRADE: 29000, // 290 THB in satang
} as const

export type PackagePrice = keyof typeof PACKAGE_PRICES

export async function createPaymentIntent(
  amount: number,
  userId: string,
  paymentType: "ADVANCED_PACKAGE" | "POST_EXAM_UPGRADE",
  metadata?: Record<string, string>
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "thb", // Thai Baht
      payment_method_types: ["card"],
      metadata: {
        userId,
        paymentType,
        ...metadata,
      },
    })

    return paymentIntent
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw error
  }
}

export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error("Error confirming payment intent:", error)
    throw error
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error("Error retrieving payment intent:", error)
    throw error
  }
}

export function formatThbAmount(amountInSatang: number): string {
  const amountInBaht = amountInSatang / 100
  return `฿${amountInBaht.toLocaleString("th-TH")}`
}

// Helper function to validate webhook signatures
export function constructWebhookEvent(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not defined")
  }

  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Error constructing webhook event:", error)
    throw error
  }
}