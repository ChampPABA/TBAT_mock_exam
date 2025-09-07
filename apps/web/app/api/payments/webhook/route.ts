import { NextRequest, NextResponse } from "next/server"
import { constructWebhookEvent } from "../../../../lib/stripe"
import { prisma } from "../../../../lib/db"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    // Verify webhook signature
    const event = constructWebhookEvent(body, signature)

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object

        // Update payment record
        const payment = await prisma.payment.update({
          where: { stripe_payment_intent_id: paymentIntent.id },
          data: {
            status: "COMPLETED",
            completed_at: new Date(),
          },
          include: { user: true },
        })

        // Update user package type based on payment type
        if (payment.payment_type === "ADVANCED_PACKAGE") {
          await prisma.user.update({
            where: { id: payment.user_id },
            data: { package_type: "ADVANCED" },
          })
        } else if (payment.payment_type === "POST_EXAM_UPGRADE") {
          await prisma.user.update({
            where: { id: payment.user_id },
            data: { 
              package_type: "ADVANCED",
              is_upgraded: true,
            },
          })
        }

        console.log(`Payment succeeded for user ${payment.user.email}`)
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object

        await prisma.payment.update({
          where: { stripe_payment_intent_id: paymentIntent.id },
          data: { status: "FAILED" },
        })

        console.log(`Payment failed for payment intent ${paymentIntent.id}`)
        break
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object

        await prisma.payment.update({
          where: { stripe_payment_intent_id: paymentIntent.id },
          data: { status: "FAILED" },
        })

        console.log(`Payment canceled for payment intent ${paymentIntent.id}`)
        break
      }

      case "charge.dispute.created": {
        const dispute = event.data.object
        const charge = dispute.charge

        if (typeof charge === "string") {
          // Handle dispute - mark payment as disputed
          console.log(`Dispute created for charge ${charge}`)
          // You might want to implement dispute handling logic here
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    )
  }
}