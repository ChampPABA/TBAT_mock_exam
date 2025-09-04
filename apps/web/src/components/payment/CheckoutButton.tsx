/**
 * Stripe Checkout Button Component
 * Handles payment initiation for VVIP tier
 */

"use client"

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { PaymentAPI } from '@/lib/api/payment'
import { toast } from 'sonner'

interface CheckoutButtonProps {
  onCheckout?: () => void
  disabled?: boolean
  className?: string
}

export function CheckoutButton({ 
  onCheckout, 
  disabled = false,
  className = ""
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    if (onCheckout) {
      onCheckout()
    }

    setIsLoading(true)
    
    try {
      // Create checkout session
      const session = await PaymentAPI.createCheckoutSession({
        upgradeType: 'PRE_EXAM'
      })

      // Redirect to Stripe Checkout
      await PaymentAPI.redirectToCheckout(session.checkoutUrl)
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเริ่มการชำระเงิน')
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center px-6 py-3 
        bg-gradient-to-r from-purple-600 to-blue-600 
        text-white font-semibold rounded-lg 
        hover:from-purple-700 hover:to-blue-700 
        disabled:opacity-50 disabled:cursor-not-allowed 
        transition-all duration-200 transform hover:scale-105
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          กำลังเตรียมหน้าชำระเงิน...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-5 w-5" />
          ชำระเงิน ฿690 ผ่าน Stripe
        </>
      )}
    </button>
  )
}