import { Metadata } from "next"
import { LoginForm } from "@/components/forms/LoginForm"

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ - TBAT Mock Exam",
  description: "เข้าสู่ระบบเพื่อทำแบบทดสอบ TBAT และดูผลคะแนน",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            เข้าสู่ระบบ
          </h1>
          <p className="text-gray-600">
            เข้าสู่ระบบเพื่อเข้าถึงแดชบอร์ดและผลคะแนนของคุณ
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}