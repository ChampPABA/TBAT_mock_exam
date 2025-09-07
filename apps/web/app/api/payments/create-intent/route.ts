import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../lib/auth"
import { createPaymentIntent, PACKAGE_PRICES, PackagePrice } from "../../../../lib/stripe"
import { prisma } from "../../../../lib/db"
import { paymentRateLimit } from "../../../../lib/rate-limiter"
import { z } from "zod"

const createPaymentIntentSchema = z.object({
  packageType: z.enum(["ADVANCED_PACKAGE", "POST_EXAM_UPGRADE"]),
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for payment endpoints
    const rateLimitResult = await paymentRateLimit(request)
    
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many payment requests. Please try again later.',
          reset: rateLimitResult.reset 
        }), 
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
            'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
            'Retry-After': '3600' // 1 hour in seconds
          }
        }
      )
    }

    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { packageType } = createPaymentIntentSchema.parse(body)

    // Validate business logic
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user already has Advanced package
    if (user.package_type === "ADVANCED") {
      return NextResponse.json(
        { error: "User already has Advanced package" },
        { status: 400 }
      )
    }

    // For POST_EXAM_UPGRADE, user must have taken exam and be FREE package
    if (packageType === "POST_EXAM_UPGRADE") {
      const hasExamResults = await prisma.examResult.findFirst({
        where: { user_id: session.user.id },
      })

      if (!hasExamResults) {
        return NextResponse.json(
          { error: "Cannot upgrade without taking exam first" },
          { status: 400 }
        )
      }

      if (user.package_type !== "FREE") {
        return NextResponse.json(
          { error: "Upgrade only available for FREE package users" },
          { status: 400 }
        )
      }
    }

    const amount = PACKAGE_PRICES[packageType as PackagePrice]

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(
      amount,
      session.user.id,
      packageType,
      {
        userEmail: user.email,
        userName: user.thai_name || user.name || "",
      }
    )

    // Store payment record in database
    const payment = await prisma.payment.create({
      data: {
        user_id: session.user.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount,
        currency: "thb",
        payment_type: packageType,
        status: "PENDING",
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      amount: amount,
      currency: "thb",
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}