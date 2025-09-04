/**
 * Payment Success Page
 * Shown after successful Stripe payment
 */

"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { PaymentAPI } from '@/lib/api/payment'
import type { PaymentStatusResponse } from '@/lib/types/payment.types'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  
  const [status, setStatus] = useState<PaymentStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('ไม่พบ Session ID')
      setLoading(false)
      return
    }

    // Check payment status
    PaymentAPI.getPaymentStatus(sessionId)
      .then(setStatus)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg">กำลังตรวจสอบการชำระเงิน...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/registration')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              กลับไปหน้าลงทะเบียน
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status?.paid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              ชำระเงินสำเร็จ! 🎉
            </h1>
            <p className="text-center text-gray-600 mb-6">
              ยินดีต้อนรับสู่ระดับ VVIP
            </p>

            {/* Benefits */}
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-purple-900 mb-2">สิทธิประโยชน์ที่คุณได้รับ:</h2>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>สอบได้ทั้ง 3 วิชา (Physics, Chemistry, Biology)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>รายงานวิเคราะห์ผลอย่างละเอียด</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>ดูเฉลยและคำอธิบายทุกข้อ</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>เปรียบเทียบผลกับนักเรียนคนอื่น</span>
                </li>
              </ul>
            </div>

            {/* Receipt Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <p className="text-gray-600">
                📧 ใบเสร็จรับเงินถูกส่งไปที่อีเมลที่ลงทะเบียนแล้ว
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                ไปที่แดชบอร์ด
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
              >
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Payment not complete
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">รอการยืนยันการชำระเงิน</h1>
          <p className="text-gray-600 mb-6">
            สถานะ: {status?.status === 'processing' ? 'กำลังประมวลผล' : 'รอดำเนินการ'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            ไปที่แดชบอร์ด
          </button>
        </div>
      </div>
    </div>
  )
}