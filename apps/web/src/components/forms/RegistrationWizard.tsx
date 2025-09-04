'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/button'
import { ProgressStepper, CompactProgressStepper } from '@/components/tbat/progress-stepper'
import { PersonalInfoStep } from './steps/PersonalInfoStep'
import { AcademicInfoStep } from './steps/AcademicInfoStep'
import { mockAuthService } from '@/lib/mock-api'
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react'
import { RegistrationSuccess } from '@/components/tbat/registration-success'
import type { RegisterData } from '@/lib/mock-api'

// Complete registration schema split into steps
const personalInfoSchema = z.object({
  email: z.string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .min(1, "กรุณากรอกอีเมล"),
  name: z.string()
    .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร"),
  phone: z.string()
    .regex(/^0\d{9}$/, "เบอร์โทรศัพท์ต้องเป็นเลข 10 หลัก เริ่มต้นด้วย 0")
    .min(10, "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"),
  birthDate: z.string()
    .min(1, "กรุณาเลือกวันเกิด")
    .refine((date) => {
      const birthYear = new Date(date).getFullYear()
      const currentYear = new Date().getFullYear()
      return currentYear - birthYear >= 15 && currentYear - birthYear <= 25
    }, "อายุต้องอยู่ระหว่าง 15-25 ปี"),
  password: z.string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"]
})

const academicInfoSchema = z.object({
  school: z.string()
    .min(1, "กรุณาเลือกโรงเรียน"),
  grade: z.enum(["M.4", "M.5", "M.6"], {
    errorMap: () => ({ message: "กรุณาเลือกชั้นเรียน" })
  }),
  program: z.enum(["science-math", "science-bio", "arts", "other"], {
    errorMap: () => ({ message: "กรุณาเลือกแผนการเรียน" })
  }),
  goals: z.array(z.string()).min(1, "กรุณาเลือกเป้าหมายอย่างน้อย 1 ข้อ"),
  previousScore: z.number().optional(),
  targetScore: z.number()
    .min(0, "คะแนนเป้าหมายต้องมากกว่า 0")
    .max(100, "คะแนนเป้าหมายต้องไม่เกิน 100")
    .optional()
})

// Combined schema for final submission
const registrationSchema = personalInfoSchema.and(academicInfoSchema)

type PersonalInfo = z.infer<typeof personalInfoSchema>
type AcademicInfo = z.infer<typeof academicInfoSchema>
type RegistrationData = z.infer<typeof registrationSchema>

interface RegistrationWizardProps {
  validatedCodeId: string
}

// Auto-save hook
function useAutoSave<T>(data: T, key: string, delay: number = 30000) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const saveToLocalStorage = useCallback(async (dataToSave: T) => {
    try {
      setIsSaving(true)
      localStorage.setItem(key, JSON.stringify(dataToSave))
      setLastSaved(new Date())
    } catch (error) {
      console.warn('Failed to auto-save to localStorage:', error)
    } finally {
      setIsSaving(false)
    }
  }, [key])

  useEffect(() => {
    if (data && Object.keys(data as object).length > 0) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage(data)
      }, delay)

      return () => clearTimeout(timeoutId)
    }
  }, [data, delay, saveToLocalStorage])

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load saved data:', error)
    }
    return null
  }, [key])

  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setLastSaved(null)
    } catch (error) {
      console.warn('Failed to clear saved data:', error)
    }
  }, [key])

  return { lastSaved, isSaving, clearSaved }
}

export function RegistrationWizard({ validatedCodeId }: RegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [personalData, setPersonalData] = useState<Partial<PersonalInfo>>({})
  const [academicData, setAcademicData] = useState<Partial<AcademicInfo>>({})
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [registeredUserInfo, setRegisteredUserInfo] = useState<any>(null)

  // Auto-save functionality
  const allData = { ...personalData, ...academicData }
  const { lastSaved, isSaving, clearSaved } = useAutoSave(
    allData, 
    `tbat-registration-${validatedCodeId}`,
    30000 // 30 seconds
  )

  // Form for current step
  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onChange",
    defaultValues: personalData
  })

  const academicForm = useForm<AcademicInfo>({
    resolver: zodResolver(academicInfoSchema),
    mode: "onChange",
    defaultValues: academicData
  })

  // Step definitions
  const steps = [
    {
      id: 1,
      title: "ข้อมูลส่วนตัว",
      description: "Personal Info",
      completed: currentStep > 1
    },
    {
      id: 2,
      title: "ข้อมูลการศึกษา",
      description: "Academic Info",
      completed: currentStep > 2
    }
  ]

  // Navigation handlers
  const goToNextStep = async () => {
    if (currentStep === 1) {
      const isValid = await personalForm.trigger()
      if (isValid) {
        const data = personalForm.getValues()
        setPersonalData(data)
        setCurrentStep(2)
      }
    }
  }

  const goToPreviousStep = () => {
    if (currentStep === 2) {
      const data = academicForm.getValues()
      setAcademicData(data)
      setCurrentStep(1)
    }
  }

  const handleFinalSubmit = async (academicInfo: AcademicInfo) => {
    setIsSubmitting(true)
    
    try {
      // Combine all data for final registration
      const finalData: RegisterData = {
        uniqueCode: validatedCodeId,
        email: personalData.email!,
        name: personalData.name!,
        school: academicInfo.school,
        grade: academicInfo.grade,
        password: personalData.password!
      }

      const result = await mockAuthService.register(finalData)
      
      if (result.success) {
        // Clear auto-saved data
        clearSaved()
        
        // Set registration complete and user info for success page
        setRegisteredUserInfo({
          name: personalData.name!,
          email: personalData.email!,
          school: academicInfo.school,
          grade: academicInfo.grade,
          codeActivated: validatedCodeId
        })
        setRegistrationComplete(true)
      } else {
        alert(`Registration failed: ${result.message}`)
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert("เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle browser navigation warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(allData).length > 0) {
        e.preventDefault()
        e.returnValue = 'คุณมีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [allData])

  // Show success page when registration is complete
  if (registrationComplete && registeredUserInfo) {
    return (
      <RegistrationSuccess
        userInfo={registeredUserInfo}
        autoRedirectSeconds={10}
        onDashboardRedirect={() => {
          window.location.href = '/dashboard'
        }}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Stepper */}
      <div className="hidden md:block">
        <ProgressStepper
          currentStep={currentStep}
          totalSteps={2}
          steps={steps}
          className="mb-8"
        />
      </div>
      
      {/* Compact Progress for Mobile */}
      <div className="md:hidden">
        <CompactProgressStepper
          currentStep={currentStep}
          totalSteps={2}
          className="mb-6"
        />
      </div>

      {/* Auto-save indicator */}
      {(isSaving || lastSaved) && (
        <div className="mb-4 text-center">
          <div className="inline-flex items-center text-xs text-muted-foreground thai-text">
            <Save className="w-3 h-3 mr-1" />
            {isSaving ? (
              "กำลังบันทึกอัตโนมัติ..."
            ) : lastSaved ? (
              `บันทึกล่าสุด: ${lastSaved.toLocaleTimeString('th-TH', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}`
            ) : null}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-tbat-surface p-6 mb-6">
        {currentStep === 1 && (
          <PersonalInfoStep
            form={personalForm}
            onNext={goToNextStep}
            isLoading={false}
          />
        )}
        
        {currentStep === 2 && (
          <AcademicInfoStep
            form={academicForm}
            onPrevious={goToPreviousStep}
            onSubmit={handleFinalSubmit}
            isLoading={isSubmitting}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStep === 1}
          className="flex items-center thai-text"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ย้อนกลับ
        </Button>

        <div className="text-xs text-muted-foreground thai-text">
          ขั้นตอนที่ {currentStep} จาก 2
        </div>

        {currentStep < 2 ? (
          <Button
            onClick={goToNextStep}
            className="flex items-center thai-text"
          >
            ถัดไป
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => academicForm.handleSubmit(handleFinalSubmit)()}
            disabled={isSubmitting}
            className="flex items-center thai-text"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังลงทะเบียน...
              </>
            ) : (
              "ลงทะเบียน"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default RegistrationWizard