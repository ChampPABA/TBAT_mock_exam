'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import * as z from 'zod'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Label } from '@/components/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

// Login form validation schema
const loginSchema = z.object({
  email: z.string()
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .min(1, 'กรุณากรอกอีเมล'),
  password: z.string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToBoxSet?: () => void
}

export function LoginModal({ isOpen, onClose, onSwitchToBoxSet }: LoginModalProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        }),
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        // Authentication successful
        reset()
        onClose()
        router.push('/dashboard')
      } else {
        // Handle different error types
        if (response.status === 429) {
          setError('การเข้าสู่ระบบถูกจำกัด กรุณารอสักครู่แล้วลองใหม่')
        } else if (response.status === 401) {
          setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        } else {
          setError(result.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
        }
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setError(null)
    setShowPassword(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center thai-text">
            เข้าสู่ระบบ
          </DialogTitle>
          <DialogDescription className="text-center thai-text">
            เข้าสู่ระบบเพื่อเข้าถึงแดชบอร์ดและผลคะแนนของคุณ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600 thai-text">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="thai-text">อีเมล *</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              className={errors.email ? 'border-red-500' : ''}
              {...register('email')}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-red-600 thai-text">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="thai-text">รหัสผ่าน *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="กรอกรหัสผ่าน"
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                {...register('password')}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 thai-text">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Button
              type="button"
              variant="link"
              className="text-sm font-medium text-primary hover:text-primary/90 thai-text p-0"
              onClick={() => {
                handleClose()
                router.push('/forgot-password')
              }}
            >
              ลืมรหัสผ่าน?
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full thai-text"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </Button>

          {/* Register Link */}
          <div className="text-center pt-2 border-t">
            <p className="text-sm text-gray-600 thai-text">
              ยังไม่มีบัญชี?{' '}
              <Button
                type="button"
                variant="link"
                className="font-medium text-primary hover:text-primary/90 thai-text p-0"
                onClick={() => {
                  handleClose()
                  if (onSwitchToBoxSet) {
                    onSwitchToBoxSet()
                  }
                }}
              >
                กรอก BoxSet Code
              </Button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}