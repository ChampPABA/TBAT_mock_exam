/**
 * Payment Cancel Page
 * Shown when user cancels Stripe payment
 */

"use client"

import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Cancel Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-yellow-100 p-3">
              <XCircle className="h-16 w-16 text-yellow-600" />
            </div>
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            ยกเลิกการชำระเงิน
          </h1>
          <p className="text-center text-gray-600 mb-6">
            คุณได้ยกเลิกการชำระเงินหรือเกิดข้อผิดพลาดในการทำรายการ
          </p>

          {/* Options */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 mb-2">คุณสามารถ:</p>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• กลับไปลงทะเบียนใหม่และเลือกแผนฟรี</li>
              <li>• ลองชำระเงินอีกครั้งสำหรับ VVIP</li>
              <li>• ติดต่อเราหากพบปัญหาในการชำระเงิน</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/registration')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              กลับไปลงทะเบียน
            </button>
            
            <button
              onClick={() => {
                // Could trigger payment retry here
                router.push('/registration')
              }}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              ลองชำระเงินอีกครั้ง
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
            >
              กลับหน้าหลัก
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>ต้องการความช่วยเหลือ?</p>
            <p>ติดต่อ Line: @tbat-support</p>
          </div>
        </div>
      </div>
    </div>
  )
}