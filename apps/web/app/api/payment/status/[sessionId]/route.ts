/**
 * GET /api/payment/status/[sessionId]
 * Retrieve the status of a payment checkout session
 */

import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/services/payment.service'
import { z } from 'zod'

// Path parameter validation
const paramsSchema = z.object({
  sessionId: z.string().min(1),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Await params in Next.js 15
    const resolvedParams = await params
    
    // Validate session ID
    const validationResult = paramsSchema.safeParse(resolvedParams)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR',
          message: 'Invalid session ID',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      )
    }

    const { sessionId } = validationResult.data

    // Retrieve session status from Stripe
    const status = await PaymentService.getSessionStatus(sessionId)

    return NextResponse.json(status, { status: 200 })

  } catch (error) {
    console.error('Error retrieving payment status:', error)
    
    // Check if it's a Stripe error for invalid session ID
    if (error && typeof error === 'object' && 'type' in error && 
        error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { 
          error: 'INVALID_SESSION',
          message: 'Session not found or invalid'
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'STATUS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to retrieve payment status'
      },
      { status: 500 }
    )
  }
}