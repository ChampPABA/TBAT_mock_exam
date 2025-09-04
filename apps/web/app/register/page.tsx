'use client'

import { useState } from 'react'
import { Button } from "@/components/button"
import { RegistrationModal } from "@/components/tbat/registration-modal"
import { RegistrationFormRefactored } from "@/components/forms/RegistrationFormRefactored"

export default function RegisterPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [validatedCodeId, setValidatedCodeId] = useState<string | null>(null)

  const handleCodeValidated = (codeId: string) => {
    setValidatedCodeId(codeId)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  // Direct registration page (no code validation required for FREE tier)
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 thai-text">
            TBAT Mock Exam
          </h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-800 thai-text">
            ลงทะเบียนสอบ TBAT
          </h2>
          <p className="mt-4 text-lg text-gray-600 thai-text">
            ลงทะเบียนฟรีเพื่อเข้าสอบแบบจำลอง หรือชำระเงิน ฿690 สำหรับ VVIP
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-8">
          <RegistrationFormRefactored validatedCodeId={validatedCodeId} />
        </div>
      </div>
    </div>
  )

}