/**
 * POST /api/payment/webhook
 * Handle Stripe webhook events for payment processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/services/payment.service'
import { webhookSecret } from '@/lib/stripe/server'
import { webhookRateLimit, WEBHOOK_RATE_LIMIT, addRateLimitHeaders } from '@/lib/middleware/payment-rate-limit'
import type { Stripe } from 'stripe'

// Disable body parsing, we need raw body for signature verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = webhookRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Get Stripe signature from headers
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Get raw body for signature verification
    const rawBody = await request.text()
    
    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = PaymentService.verifyWebhookSignature(
        rawBody,
        signature,
        webhookSecret
      )
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Check for duplicate processing (idempotency)
    const isProcessed = await PaymentService.isWebhookProcessed(event.id)
    if (isProcessed) {
      console.log(`Webhook ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Process successful payment
        if (session.payment_status === 'paid') {
          try {
            await PaymentService.processSuccessfulPayment(session)
            console.log(`Successfully processed payment for session ${session.id}`)
          } catch (error) {
            console.error('Error processing successful payment:', error)
            // Don't return error to Stripe, log for manual review
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        // Backup event in case checkout.session.completed fails
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`Payment intent succeeded: ${paymentIntent.id}`)
        break
      }

      case 'payment_intent.payment_failed': {
        // Track failed payments for analytics
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error(`Payment failed for intent ${paymentIntent.id}`)
        // TODO: Update analytics or send notification
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark webhook as processed
    await PaymentService.markWebhookProcessed(event.id)

    // Return success response with rate limit headers
    let response = NextResponse.json({ received: true }, { status: 200 })
    response = addRateLimitHeaders(response, request, WEBHOOK_RATE_LIMIT)
    
    return response

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Return success to Stripe to prevent retries for application errors
    // Log error for manual review
    return NextResponse.json(
      { received: true, error: 'Processing error logged' },
      { status: 200 }
    )
  }
}

// Health check endpoint for webhook
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      status: 'healthy',
      endpoint: '/api/payment/webhook',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  )
}