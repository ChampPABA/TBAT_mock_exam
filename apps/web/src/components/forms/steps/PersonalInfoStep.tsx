'use client'

import React, { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Label } from '@/components/label'
import { Eye, EyeOff, ArrowRight, User, Mail, Phone, Calendar } from 'lucide-react'

interface PersonalInfo {
  email: string
  name: string
  phone: string
  birthDate: string
  password: string
  confirmPassword: string
}

interface PersonalInfoStepProps {
  form: UseFormReturn<PersonalInfo>
  onNext: () => void
  isLoading: boolean
}

// Password strength indicator
const getPasswordStrength = (password: string): { strength: number; text: string; color: string } => {
  let strength = 0
  
  if (password.length >= 8) strength += 1
  if (/[a-z]/.test(password)) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/\d/.test(password)) strength += 1
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1

  const labels = ["อ่อนมาก", "อ่อน", "ปานกลาง", "แข็งแกร่ง", "แข็งแกร่งมาก"]
  const colors = ["text-red-600", "text-red-500", "text-yellow-500", "text-green-500", "text-green-600"]
  
  return {
    strength,
    text: labels[Math.min(strength, 4)] || "อ่อนมาก",
    color: colors[Math.min(strength, 4)] || "text-red-600"
  }
}

export function PersonalInfoStep({ form, onNext, isLoading }: PersonalInfoStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const {
    register,
    watch,
    formState: { errors, isValid }
  } = form

  const password = watch("password", "")
  const passwordStrength = getPasswordStrength(password)

  const handleNext = async () => {
    const isFormValid = await form.trigger()
    if (isFormValid) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center pb-6 border-b border-tbat-surface">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-tbat-primary/10 rounded-full mb-4">
          <User className="w-6 h-6 text-tbat-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 thai-text mb-2">
          ข้อมูลส่วนตัว
        </h2>
        <p className="text-muted-foreground thai-text">
          กรุณากรอกข้อมูลส่วนตัวของคุณให้ครบถ้วน
        </p>
      </div>

      <div className="grid gap-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium thai-text">
            ชื่อ-นามสกุล *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="เช่น สมชาย จิตรดี"
            className={`thai-text ${errors.name ? 'border-red-500 focus:border-red-500' : 'input-tbat'}`}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-600 thai-text">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium thai-text">
            อีเมล *
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : 'input-tbat'}`}
              {...register("email")}
            />
            <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 thai-text">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium thai-text">
            เบอร์โทรศัพท์ *
          </Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              placeholder="0812345678"
              className={`pl-10 ${errors.phone ? 'border-red-500 focus:border-red-500' : 'input-tbat'}`}
              {...register("phone")}
            />
            <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600 thai-text">{errors.phone.message}</p>
          )}
        </div>

        {/* Birth Date Field */}
        <div className="space-y-2">
          <Label htmlFor="birthDate" className="text-sm font-medium thai-text">
            วันเกิด *
          </Label>
          <div className="relative">
            <Input
              id="birthDate"
              type="date"
              className={`pl-10 ${errors.birthDate ? 'border-red-500 focus:border-red-500' : 'input-tbat'}`}
              {...register("birthDate")}
            />
            <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          {errors.birthDate && (
            <p className="text-sm text-red-600 thai-text">{errors.birthDate.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium thai-text">
            รหัสผ่าน *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
              className={`pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : 'input-tbat'}`}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className={`text-sm ${passwordStrength.color} thai-text`}>
                  ความแข็งแกร่ง: {passwordStrength.text}
                </p>
                <span className="text-xs text-muted-foreground thai-text">
                  {passwordStrength.strength}/5
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength.strength <= 1 ? 'bg-red-500' :
                    passwordStrength.strength <= 2 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="text-sm text-red-600 thai-text">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium thai-text">
            ยืนยันรหัสผ่าน *
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className={`pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'input-tbat'}`}
              {...register("confirmPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 thai-text">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="bg-tbat-surface/50 rounded-lg p-4 mt-6">
        <p className="text-sm text-muted-foreground thai-text">
          <strong>การรักษาความเป็นส่วนตัว:</strong> ข้อมูลส่วนตัวของคุณจะถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย 
          เราจะไม่เปิดเผยข้อมูลของคุณให้กับบุคคลที่สาม
        </p>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-6">
        <Button
          onClick={handleNext}
          disabled={!isValid || isLoading}
          className="flex items-center px-8 py-3 thai-text"
        >
          ถัดไป: ข้อมูลการศึกษา
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

export default PersonalInfoStep