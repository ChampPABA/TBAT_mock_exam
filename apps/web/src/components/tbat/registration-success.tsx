'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/button'
import { 
  CheckCircle, 
  Trophy, 
  BookOpen, 
  Calendar, 
  User, 
  Mail,
  School,
  Target,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface RegistrationSuccessProps {
  userInfo: {
    name: string
    email: string
    school: string
    grade: string
    codeActivated: string
  }
  autoRedirectSeconds?: number
  onDashboardRedirect?: () => void
}

export function RegistrationSuccess({
  userInfo,
  autoRedirectSeconds = 10,
  onDashboardRedirect
}: RegistrationSuccessProps) {
  const [countdown, setCountdown] = useState(autoRedirectSeconds)
  const [showCelebration, setShowCelebration] = useState(true)

  // Countdown timer for auto-redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Auto-redirect when countdown reaches 0
      if (onDashboardRedirect) {
        onDashboardRedirect()
      } else {
        window.location.href = '/dashboard'
      }
    }
  }, [countdown, onDashboardRedirect])

  // Hide celebration animation after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCelebration(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleDashboardClick = () => {
    if (onDashboardRedirect) {
      onDashboardRedirect()
    } else {
      window.location.href = '/dashboard'
    }
  }

  const nextSteps = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "เข้าสู่ระบบจำลองสอบ",
      description: "เริ่มทำแบบทดสอบ TBAT ได้ทันที",
      action: "เริ่มทำแบบทดสอบ"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "ดูผลการสอบ",
      description: "วิเคราะห์จุดแข็ง-จุดอ่อนของคุณ",
      action: "ดูสถิติ"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "จองสอบครั้งถัดไป",
      description: "วางแผนการเตรียมสอบล่วงหน้า",
      action: "ดูตารางสอบ"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-tbat-white via-tbat-surface/30 to-tbat-background/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Celebration Animation */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 animate-bounce delay-100">
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="absolute top-1/3 right-1/3 animate-bounce delay-300">
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <div className="absolute top-1/2 left-1/6 animate-bounce delay-500">
              <Sparkles className="w-10 h-10 text-green-500" />
            </div>
            <div className="absolute bottom-1/3 right-1/4 animate-bounce delay-700">
              <Sparkles className="w-7 h-7 text-purple-500" />
            </div>
          </div>
        )}

        {/* Main Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-tbat-surface/50 overflow-hidden">
          {/* Success Header */}
          <div className="bg-tbat-gradient text-white px-8 py-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold thai-text mb-4">
                ลงทะเบียนสำเร็จ!
              </h1>
              <p className="text-xl thai-text opacity-90 mb-2">
                ยินดีต้อนรับสู่ระบบ TBAT Mock Exam
              </p>
              <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2">
                <Trophy className="w-5 h-5 mr-2" />
                <span className="text-sm thai-text">
                  คุณพร้อมสำหรับการสอบแล้ว!
                </span>
              </div>
            </div>
          </div>

          {/* Account Summary */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-900 thai-text mb-6 flex items-center">
              <User className="w-6 h-6 text-tbat-primary mr-3" />
              ข้อมูลบัญชีของคุณ
            </h2>
            
            <div className="grid gap-4 mb-8">
              <div className="flex items-center p-4 bg-tbat-surface/50 rounded-lg">
                <User className="w-5 h-5 text-tbat-primary mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground thai-text">ชื่อ-นามสกุล</p>
                  <p className="font-medium text-gray-900 thai-text">{userInfo.name}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-tbat-surface/50 rounded-lg">
                <Mail className="w-5 h-5 text-tbat-primary mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground thai-text">อีเมล</p>
                  <p className="font-medium text-gray-900">{userInfo.email}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-tbat-surface/50 rounded-lg">
                <School className="w-5 h-5 text-tbat-primary mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground thai-text">โรงเรียน</p>
                  <p className="font-medium text-gray-900 thai-text">{userInfo.school}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-green-700 thai-text">รหัส Box Set</p>
                  <p className="font-mono font-medium text-green-800">{userInfo.codeActivated}</p>
                  <p className="text-xs text-green-600 thai-text">ใช้งานสำเร็จแล้ว</p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <h3 className="text-lg font-semibold text-gray-900 thai-text mb-4">
              ขั้นตอนถัดไป
            </h3>
            
            <div className="space-y-4 mb-8">
              {nextSteps.map((step, index) => (
                <div 
                  key={index}
                  className="flex items-center p-4 border border-tbat-surface rounded-lg hover:bg-tbat-surface/30 transition-colors"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-tbat-primary/10 rounded-full mr-4">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 thai-text">{step.title}</h4>
                    <p className="text-sm text-muted-foreground thai-text">{step.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>

            {/* Auto-redirect Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mr-3">
                  <span className="text-sm font-bold text-blue-600">{countdown}</span>
                </div>
                <div>
                  <p className="text-sm text-blue-800 thai-text">
                    <strong>กำลังเข้าสู่หน้า Dashboard อัตโนมัติใน {countdown} วินาที</strong>
                  </p>
                  <p className="text-xs text-blue-600 thai-text">
                    คุณสามารถกดปุ่มด้านล่างเพื่อเข้าทันที
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleDashboardClick}
                className="flex-1 h-12 text-lg font-medium thai-text bg-tbat-primary hover:bg-tbat-primary/90"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                เข้าสู่ Dashboard
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '/profile'}
                className="flex-1 h-12 text-lg font-medium thai-text border-tbat-primary text-tbat-primary hover:bg-tbat-primary/5"
              >
                <User className="w-5 h-5 mr-2" />
                แก้ไขโปรไฟล์
              </Button>
            </div>

            {/* Support Information */}
            <div className="mt-8 pt-6 border-t border-tbat-surface">
              <p className="text-center text-sm text-muted-foreground thai-text">
                หากต้องการความช่วยเหลือ กรุณาติดต่อ{' '}
                <a 
                  href="mailto:support@tbat-mock.com" 
                  className="text-tbat-primary hover:underline"
                >
                  support@tbat-mock.com
                </a>
                {' '}หรือโทร 02-XXX-XXXX
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationSuccess