/**
 * POST /api/payment/create-checkout
 * Create a Stripe checkout session for VVIP registration
 */

import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/services/payment.service'
import { paymentRateLimit, PAYMENT_RATE_LIMIT, addRateLimitHeaders } from '@/lib/middleware/payment-rate-limit'
import type { CreateCheckoutRequest } from '@/lib/types/payment.types'
import { z } from 'zod'

// Request validation schema
const createCheckoutSchema = z.object({
  upgradeType: z.enum(['PRE_EXAM', 'POST_RESULTS']),
  returnUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = paymentRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createCheckoutSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      )
    }

    const data = validationResult.data as CreateCheckoutRequest

    // TODO: Get actual user session when auth is implemented
    // For now, use mock data
    const userId = 'mock-user-' + Date.now()
    const userEmail = 'student@example.com'

    // In production, you would:
    // 1. Verify user session
    // 2. Check if user is eligible for upgrade
    // 3. Check for existing pending payments

    // Create checkout session
    const checkoutSession = await PaymentService.createCheckoutSession(
      userId,
      userEmail,
      data
    )

    // Create response with rate limit headers
    let response = NextResponse.json(checkoutSession, { status: 200 })
    response = addRateLimitHeaders(response, request, PAYMENT_RATE_LIMIT)

    return response

  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    return NextResponse.json(
      { 
        error: 'PAYMENT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create payment session'
      },
      { status: 500 }
    )
  }
}