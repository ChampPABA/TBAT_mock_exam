"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { Loader2, CheckCircle } from "lucide-react"
import { mockAuthService, mockCodeService, mockSchools } from "@/lib/mock-api"
import { RegistrationWizard } from "./RegistrationWizard"
import type { RegisterData } from "@/lib/mock-api"

// Import decomposed components
import { TierSelector, type TierType } from "./registration/TierSelector"
import { CodeValidation, type CodeValidationState } from "./registration/CodeValidation"
import { SubjectSelector } from "./registration/SubjectSelector"
import { PasswordInput } from "./registration/PasswordInput"
import { ParentInfoSection } from "./registration/ParentInfoSection"

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
  uniqueCode: z.string().optional(),
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
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegistrationFormProps {
  validatedCodeId?: string
}

export function RegistrationFormRefactored({ validatedCodeId }: RegistrationFormProps = {}) {
  // If we have a validated code ID, use the multi-step wizard
  if (validatedCodeId) {
    return <RegistrationWizard validatedCodeId={validatedCodeId} />
  }

  // State management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTier, setSelectedTier] = useState<TierType>('FREE')
  const [showParentInfo, setShowParentInfo] = useState(false)
  const [codeValidationState, setCodeValidationState] = useState<CodeValidationState>({ 
    status: "idle", 
    message: "" 
  })
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
    } else if (code.length === 0) {
      setCodeValidationState({ status: "idle", message: "" })
    }
  }

  const handleSubjectToggle = (subject: string) => {
    const current = selectedSubjects || []
    const isFreeTier = selectedTier === 'FREE'
    
    if (current.includes(subject)) {
      setValue("subjects", current.filter(s => s !== subject), { shouldValidate: true })
    } else {
      if (isFreeTier && current.length >= 1) {
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
        tier: data.uniqueCode ? undefined : "FREE",
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
        setExamTicket(result.user?.examTicket || "")
        
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
        
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 3000)
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tier Selection */}
      <TierSelector
        selectedTier={selectedTier}
        onTierChange={setSelectedTier}
        onCodeClear={() => {
          setValue("uniqueCode", "", { shouldValidate: true })
          setCodeValidationState({ status: "idle", message: "" })
        }}
      />

      {/* Optional BoxSet Code */}
      {selectedTier === 'VVIP_BOXSET' && (
        <CodeValidation
          value={uniqueCode}
          state={codeValidationState}
          onChange={handleCodeChange}
          error={errors.uniqueCode?.message}
        />
      )}

      {/* Basic Information Fields */}
      <div className="space-y-4">
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

        {/* Line ID */}
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

        {/* Phone (Optional) */}
        <div>
          <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="08x-xxx-xxxx"
            {...register("phone")}
          />
        </div>

        {/* School */}
        <div>
          <Label htmlFor="school">โรงเรียน *</Label>
          <select
            id="school"
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
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

        {/* Grade */}
        <div>
          <Label htmlFor="grade">ชั้นเรียน *</Label>
          <select
            id="grade"
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
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
      </div>

      {/* Subject Selection */}
      <SubjectSelector
        subjects={availableSubjects}
        selectedSubjects={selectedSubjects}
        isFreeTier={selectedTier === 'FREE'}
        onSubjectToggle={handleSubjectToggle}
        error={errors.subjects?.message}
      />

      {/* Parent Information */}
      <ParentInfoSection
        show={showParentInfo}
        onToggle={setShowParentInfo}
        register={register}
        errors={errors}
      />

      {/* Password Fields */}
      <PasswordInput
        id="password"
        label="รหัสผ่าน *"
        placeholder="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
        value={password}
        error={errors.password?.message}
        showStrength={true}
        register={register("password")}
      />

      <PasswordInput
        id="confirmPassword"
        label="ยืนยันรหัสผ่าน *"
        placeholder="กรอกรหัสผ่านอีกครั้ง"
        error={errors.confirmPassword?.message}
        register={register("confirmPassword")}
      />

      {/* Tier Information */}
      {selectedTier === 'FREE' && (
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
        disabled={isSubmitting || !isValid || (selectedTier === 'VVIP_BOXSET' && codeValidationState.status !== "valid")}
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

      {/* Success Message */}
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