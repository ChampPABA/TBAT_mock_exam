"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react"
import { mockAuthService, mockCodeService, mockSchools } from "@/lib/mock-api"
import { RegistrationWizard } from "./RegistrationWizard"
import type { RegisterData } from "@/lib/mock-api"

// Available subjects for selection
const availableSubjects = [
  "Physics",
  "Chemistry", 
  "Biology",
  "Mathematics",
  "English"
]

// Registration form validation schema
const registerSchema = z.object({
  uniqueCode: z.string().optional(), // Now optional for FREE tier
  email: z.string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .min(1, "กรุณากรอกอีเมล"),
  name: z.string()
    .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร"),
  school: z.string()
    .min(1, "กรุณาเลือกโรงเรียน"),
  grade: z.enum(["M.4", "M.5", "M.6"], {
    errorMap: () => ({ message: "กรุณาเลือกชั้นเรียน" })
  }),
  lineId: z.string()
    .min(1, "กรุณากรอก Line ID"),
  phone: z.string().optional(),
  subjects: z.array(z.string())
    .min(1, "กรุณาเลือกอย่างน้อย 1 วิชา"),
  password: z.string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข"),
  confirmPassword: z.string(),
  parentName: z.string().optional(),
  parentRelation: z.enum(["father", "mother", "guardian"]).optional(),
  parentPhone: z.string().optional(),
  parentEmail: z.string().email().optional().or(z.literal(""))
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"]
}).refine((data) => {
  // If no BoxSet code, subjects must be exactly 1 (FREE tier)
  if (!data.uniqueCode && data.subjects.length !== 1) {
    return false
  }
  return true
}, {
  message: "ผู้ใช้ระดับ FREE สามารถเลือกได้เพียง 1 วิชา",
  path: ["subjects"]
})

type RegisterFormData = z.infer<typeof registerSchema>

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

interface RegistrationFormProps {
  validatedCodeId?: string
}

export function RegistrationForm({ validatedCodeId }: RegistrationFormProps = {}) {
  // If we have a validated code ID, use the new multi-step wizard
  if (validatedCodeId) {
    return <RegistrationWizard validatedCodeId={validatedCodeId} />
  }

  // Otherwise, show the legacy single-step form (for backward compatibility)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasBoxSetCode, setHasBoxSetCode] = useState(false)
  const [showParentInfo, setShowParentInfo] = useState(false)
  const [codeValidationState, setCodeValidationState] = useState<{
    status: "idle" | "checking" | "valid" | "invalid"
    message: string
  }>({ status: "idle", message: "" })
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange"
  })

  const password = watch("password", "")
  const passwordStrength = getPasswordStrength(password)

  // Real-time code validation
  const handleCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase()
    setValue("uniqueCode", code, { shouldValidate: true })
    
    if (code.length >= 3) {
      setCodeValidationState({ status: "checking", message: "กำลังตรวจสอบ..." })
      
      try {
        const result = await mockCodeService.validateCode(code)
        setCodeValidationState({
          status: result.valid ? "valid" : "invalid",
          message: result.message
        })
      } catch {
        setCodeValidationState({
          status: "invalid", 
          message: "เกิดข้อผิดพลาดในการตรวจสอบ"
        })
      }
    } else {
      setCodeValidationState({ status: "idle", message: "" })
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    
    try {
      const registerData: RegisterData = {
        uniqueCode: data.uniqueCode,
        email: data.email,
        name: data.name,
        school: data.school,
        grade: data.grade,
        lineId: data.lineId,
        phone: data.phone,
        subjects: data.subjects,
        tier: data.uniqueCode ? undefined : "FREE", // Let service determine tier for BoxSet codes
        password: data.password,
        parent: data.parentName ? {
          name: data.parentName,
          relation: data.parentRelation as "father" | "mother" | "guardian",
          phone: data.parentPhone || "",
          email: data.parentEmail
        } : undefined
      }
      
      const result = await mockAuthService.register(registerData)
      
      if (result.success) {
        // Securely store authentication via HTTP-only cookies
        // Token is now set via secure API response headers
        
        // Redirect to dashboard
        window.location.href = "/dashboard"
      } else {
        alert(`Registration failed: ${result.message}`)
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการลงทะเบียน")
    } finally {
      setIsSubmitting(false)
    }
  }

  const CodeValidationIcon = () => {
    switch (codeValidationState.status) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "invalid":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Unique Code Field */}
      <div>
        <Label htmlFor="uniqueCode">รหัสจาก Box Set *</Label>
        <div className="relative mt-1">
          <Input
            id="uniqueCode"
            type="text"
            placeholder="เช่น TBAT2024-001"
            className={`pr-10 ${errors.uniqueCode ? 'border-red-500' : 
              codeValidationState.status === 'valid' ? 'border-green-500' :
              codeValidationState.status === 'invalid' ? 'border-red-500' : ''
            }`}
            {...register("uniqueCode")}
            onChange={handleCodeChange}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CodeValidationIcon />
          </div>
        </div>
        {errors.uniqueCode && (
          <p className="mt-1 text-sm text-red-600">{errors.uniqueCode.message}</p>
        )}
        {codeValidationState.message && (
          <p className={`mt-1 text-sm ${
            codeValidationState.status === 'valid' ? 'text-green-600' : 
            codeValidationState.status === 'invalid' ? 'text-red-600' : 
            'text-blue-600'
          }`}>
            {codeValidationState.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <Label htmlFor="email">อีเมล *</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          className={errors.email ? 'border-red-500' : ''}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Name Field */}
      <div>
        <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
        <Input
          id="name"
          type="text"
          placeholder="เช่น สมชาย จิตรดี"
          className={errors.name ? 'border-red-500' : ''}
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* School Field */}
      <div>
        <Label htmlFor="school">โรงเรียน *</Label>
        <select
          id="school"
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.school ? 'border-red-500' : ''
          }`}
          {...register("school")}
        >
          <option value="">เลือกโรงเรียน</option>
          {mockSchools.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
        </select>
        {errors.school && (
          <p className="mt-1 text-sm text-red-600">{errors.school.message}</p>
        )}
      </div>

      {/* Grade Field */}
      <div>
        <Label htmlFor="grade">ชั้นเรียน *</Label>
        <select
          id="grade"
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.grade ? 'border-red-500' : ''
          }`}
          {...register("grade")}
        >
          <option value="">เลือกชั้นเรียน</option>
          <option value="M.4">มัธยมศึกษาปีที่ 4</option>
          <option value="M.5">มัธยมศึกษาปีที่ 5</option>
          <option value="M.6">มัธยมศึกษาปีที่ 6</option>
        </select>
        {errors.grade && (
          <p className="mt-1 text-sm text-red-600">{errors.grade.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <Label htmlFor="password">รหัสผ่าน *</Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
            className={errors.password ? 'border-red-500' : ''}
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {password && (
          <div className="mt-1">
            <p className={`text-sm ${passwordStrength.color}`}>
              ความแข็งแกร่ง: {passwordStrength.text}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
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
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</Label>
        <div className="relative mt-1">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            className={errors.confirmPassword ? 'border-red-500' : ''}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !isValid || codeValidationState.status !== "valid"}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลังลงทะเบียน...
          </>
        ) : (
          "ลงทะเบียน"
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          มีบัญชีแล้ว?{" "}
          <a href="/login" className="font-medium text-primary hover:text-primary/90">
            เข้าสู่ระบบ
          </a>
        </p>
      </div>
    </form>
  )
}