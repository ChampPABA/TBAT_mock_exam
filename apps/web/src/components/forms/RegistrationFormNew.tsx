"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
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

  // State management
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasBoxSetCode, setHasBoxSetCode] = useState(false)
  const [showParentInfo, setShowParentInfo] = useState(false)
  const [codeValidationState, setCodeValidationState] = useState<{
    status: "idle" | "checking" | "valid" | "invalid"
    message: string
  }>({ status: "idle", message: "" })
  const [examTicket, setExamTicket] = useState<string>("")
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      subjects: []
    }
  })

  const password = watch("password", "")
  const selectedSubjects = watch("subjects", [])
  const uniqueCode = watch("uniqueCode", "")
  const passwordStrength = getPasswordStrength(password)

  // Real-time code validation (optional)
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
    } else if (code.length === 0) {
      setCodeValidationState({ status: "idle", message: "" })
    }
  }

  const handleSubjectToggle = (subject: string) => {
    const current = selectedSubjects || []
    const isFreeTier = !uniqueCode
    
    if (current.includes(subject)) {
      setValue("subjects", current.filter(s => s !== subject), { shouldValidate: true })
    } else {
      if (isFreeTier && current.length >= 1) {
        // FREE tier can only select 1 subject
        setValue("subjects", [subject], { shouldValidate: true })
      } else {
        setValue("subjects", [...current, subject], { shouldValidate: true })
      }
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
        // Store exam ticket for display
        setExamTicket(result.user?.examTicket || "")
        
        // Show success message with exam ticket
        toast.success(
          <div className="space-y-2">
            <p className="font-semibold">ลงทะเบียนสำเร็จ!</p>
            <div className="bg-green-50 p-2 rounded">
              <p className="text-sm">รหัสสอบของคุณ:</p>
              <p className="font-mono font-bold text-lg">{result.user?.examTicket}</p>
            </div>
            <p className="text-xs text-gray-600">กรุณาบันทึกรหัสนี้ไว้สำหรับการเข้าสอบ</p>
          </div>,
          { duration: 8000 }
        )
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 2000)
      } else {
        toast.error(result.message || "การลงทะเบียนล้มเหลว")
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง")
      console.error("Registration error:", error)
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
      {/* Registration Type Selection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">ประเภทการลงทะเบียน</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={hasBoxSetCode}
              onChange={(e) => {
                setHasBoxSetCode(e.target.checked)
                if (!e.target.checked) {
                  setValue("uniqueCode", "", { shouldValidate: true })
                  setCodeValidationState({ status: "idle", message: "" })
                }
              }}
              className="mr-2"
            />
            <span>ฉันมีรหัสจาก Box Set (VVIP)</span>
          </label>
          {!hasBoxSetCode && (
            <p className="text-sm text-blue-700 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              ลงทะเบียนฟรี - เลือกได้ 1 วิชา
            </p>
          )}
        </div>
      </div>

      {/* Optional BoxSet Code Field */}
      {hasBoxSetCode && (
        <div>
          <Label htmlFor="uniqueCode">รหัสจาก Box Set (สำหรับ VVIP)</Label>
          <div className="relative mt-1">
            <Input
              id="uniqueCode"
              type="text"
              placeholder="เช่น TBAT-2345-6789"
              className={`pr-10 ${
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
      )}

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

      {/* Line ID Field (Required) */}
      <div>
        <Label htmlFor="lineId">Line ID * (สำหรับรับการแจ้งเตือน)</Label>
        <Input
          id="lineId"
          type="text"
          placeholder="เช่น @username"
          className={errors.lineId ? 'border-red-500' : ''}
          {...register("lineId")}
        />
        {errors.lineId && (
          <p className="mt-1 text-sm text-red-600">{errors.lineId.message}</p>
        )}
      </div>

      {/* Phone Field (Optional) */}
      <div>
        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="08x-xxx-xxxx"
          {...register("phone")}
        />
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

      {/* Subject Selection */}
      <div>
        <Label>เลือกวิชาที่ต้องการสอบ * {!uniqueCode && "(FREE: เลือกได้ 1 วิชา)"}</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {availableSubjects.map((subject) => (
            <label
              key={subject}
              className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                selectedSubjects?.includes(subject) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSubjects?.includes(subject) || false}
                onChange={() => handleSubjectToggle(subject)}
                className="mr-2"
              />
              <span>{subject}</span>
            </label>
          ))}
        </div>
        {errors.subjects && (
          <p className="mt-1 text-sm text-red-600">{errors.subjects.message}</p>
        )}
      </div>

      {/* Parent Information Toggle */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showParentInfo}
            onChange={(e) => setShowParentInfo(e.target.checked)}
            className="mr-2"
          />
          <span className="font-medium">เพิ่มข้อมูลผู้ปกครอง (ไม่บังคับ)</span>
        </label>

        {showParentInfo && (
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="parentName">ชื่อผู้ปกครอง</Label>
              <Input
                id="parentName"
                type="text"
                placeholder="ชื่อ-นามสกุล"
                {...register("parentName")}
              />
            </div>

            <div>
              <Label htmlFor="parentRelation">ความสัมพันธ์</Label>
              <select
                id="parentRelation"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("parentRelation")}
              >
                <option value="">เลือกความสัมพันธ์</option>
                <option value="father">บิดา</option>
                <option value="mother">มารดา</option>
                <option value="guardian">ผู้ปกครอง</option>
              </select>
            </div>

            <div>
              <Label htmlFor="parentPhone">เบอร์โทรศัพท์ผู้ปกครอง</Label>
              <Input
                id="parentPhone"
                type="tel"
                placeholder="08x-xxx-xxxx"
                {...register("parentPhone")}
              />
            </div>

            <div>
              <Label htmlFor="parentEmail">อีเมลผู้ปกครอง</Label>
              <Input
                id="parentEmail"
                type="email"
                placeholder="parent@email.com"
                {...register("parentEmail")}
              />
            </div>
          </div>
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

      {/* Tier Information */}
      {!hasBoxSetCode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">ระดับ FREE</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• สอบได้ 1 วิชาเท่านั้น</li>
            <li>• ดูผลคะแนนและเฉลยหลังสอบเสร็จ</li>
            <li>• อัพเกรดเป็น VVIP เพื่อสอบทุกวิชาและดู Analytics</li>
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !isValid || (hasBoxSetCode && codeValidationState.status !== "valid")}
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

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          มีบัญชีแล้ว?{" "}
          <a href="/login" className="font-medium text-primary hover:text-primary/90">
            เข้าสู่ระบบ
          </a>
        </p>
      </div>

      {/* Display Exam Ticket if registration successful */}
      {examTicket && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <h3 className="font-semibold text-green-900 mb-1">ลงทะเบียนสำเร็จ!</h3>
          <p className="text-lg font-mono text-green-800">
            รหัสสอบ: {examTicket}
          </p>
          <p className="text-sm text-green-700 mt-2">
            กรุณาบันทึกรหัสนี้ไว้สำหรับการเข้าสอบ
          </p>
        </div>
      )}
    </form>
  )
}