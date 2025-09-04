'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Label } from '@/components/label'
import { ArrowLeft, CheckCircle, GraduationCap, Target, BookOpen } from 'lucide-react'
import { mockSchools } from '@/lib/mock-api'

interface AcademicInfo {
  school: string
  grade: "M.4" | "M.5" | "M.6"
  program: "science-math" | "science-bio" | "arts" | "other"
  goals: string[]
  previousScore?: number
  targetScore?: number
}

interface AcademicInfoStepProps {
  form: UseFormReturn<AcademicInfo>
  onPrevious: () => void
  onSubmit: (data: AcademicInfo) => void
  isLoading: boolean
}

const programOptions = [
  { value: "science-math", label: "วิทย์-คณิต", description: "เน้นคณิตศาสตร์ ฟิสิกส์ เคมี" },
  { value: "science-bio", label: "วิทย์-ชีวะ", description: "เน้นชีวะวิทยา เคมี ฟิสิกส์" },
  { value: "arts", label: "ศิลป์-ภาษา", description: "เน้นภาษาต่างประเทศ สังคม" },
  { value: "other", label: "อื่นๆ", description: "แผนการเรียนอื่น" }
]

const goalOptions = [
  { value: "medical-school", label: "เข้าแพทยศาสตร์", icon: "🩺" },
  { value: "dental-school", label: "เข้าทันตแพทยศาสตร์", icon: "🦷" },
  { value: "pharmacy-school", label: "เข้าเภสัชศาสตร์", icon: "💊" },
  { value: "veterinary-school", label: "เข้าสัตวแพทยศาสตร์", icon: "🐾" },
  { value: "nursing-school", label: "เข้าพยาบาลศาสตร์", icon: "👩‍⚕️" },
  { value: "allied-health", label: "เข้าสาขาสุขภาพอื่นๆ", icon: "⚕️" },
  { value: "improve-skills", label: "พัฒนาทักษะการสอบ", icon: "📚" },
  { value: "school-prep", label: "เตรียมสอบโรงเรียน", icon: "🎓" }
]

export function AcademicInfoStep({ form, onPrevious, onSubmit, isLoading }: AcademicInfoStepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isValid }
  } = form

  const selectedGoals = watch("goals", [])
  const selectedProgram = watch("program")

  const toggleGoal = (goalValue: string) => {
    const currentGoals = selectedGoals || []
    const newGoals = currentGoals.includes(goalValue)
      ? currentGoals.filter(g => g !== goalValue)
      : [...currentGoals, goalValue]
    
    setValue("goals", newGoals, { shouldValidate: true })
  }

  const handleSubmit = () => {
    form.handleSubmit(onSubmit)()
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="text-center pb-6 border-b border-tbat-surface">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-tbat-primary/10 rounded-full mb-4">
          <GraduationCap className="w-6 h-6 text-tbat-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 thai-text mb-2">
          ข้อมูลการศึกษา
        </h2>
        <p className="text-muted-foreground thai-text">
          กรุณากรอกข้อมูลการศึกษาและเป้าหมายของคุณ
        </p>
      </div>

      <div className="grid gap-6">
        {/* School Field */}
        <div className="space-y-2">
          <Label htmlFor="school" className="text-sm font-medium thai-text">
            โรงเรียน *
          </Label>
          <select
            id="school"
            className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 thai-text ${
              errors.school ? 'border-red-500 focus:border-red-500' : 'input-tbat'
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
            <p className="text-sm text-red-600 thai-text">{errors.school.message}</p>
          )}
        </div>

        {/* Grade Field */}
        <div className="space-y-2">
          <Label htmlFor="grade" className="text-sm font-medium thai-text">
            ชั้นเรียนปัจจุบัน *
          </Label>
          <select
            id="grade"
            className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 thai-text ${
              errors.grade ? 'border-red-500 focus:border-red-500' : 'input-tbat'
            }`}
            {...register("grade")}
          >
            <option value="">เลือกชั้นเรียน</option>
            <option value="M.4">มัธยมศึกษาปีที่ 4</option>
            <option value="M.5">มัธยมศึกษาปีที่ 5</option>
            <option value="M.6">มัธยมศึกษาปีที่ 6</option>
          </select>
          {errors.grade && (
            <p className="text-sm text-red-600 thai-text">{errors.grade.message}</p>
          )}
        </div>

        {/* Program Field */}
        <div className="space-y-3">
          <Label className="text-sm font-medium thai-text">
            แผนการเรียน *
          </Label>
          <div className="grid gap-3">
            {programOptions.map((program) => (
              <label
                key={program.value}
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:bg-tbat-surface/50 ${
                  selectedProgram === program.value 
                    ? 'border-tbat-primary bg-tbat-primary/5' 
                    : 'border-tbat-surface'
                }`}
              >
                <input
                  type="radio"
                  value={program.value}
                  className="sr-only"
                  {...register("program")}
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-tbat-primary mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 thai-text">
                        {program.label}
                      </h4>
                      <p className="text-sm text-muted-foreground thai-text">
                        {program.description}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedProgram === program.value && (
                  <CheckCircle className="w-5 h-5 text-tbat-primary" />
                )}
              </label>
            ))}
          </div>
          {errors.program && (
            <p className="text-sm text-red-600 thai-text">{errors.program.message}</p>
          )}
        </div>

        {/* Goals Field */}
        <div className="space-y-3">
          <Label className="text-sm font-medium thai-text">
            เป้าหมายของคุณ * (เลือกได้หลายข้อ)
          </Label>
          <div className="grid gap-3 md:grid-cols-2">
            {goalOptions.map((goal) => (
              <label
                key={goal.value}
                className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-tbat-surface/50 ${
                  selectedGoals?.includes(goal.value)
                    ? 'border-tbat-primary bg-tbat-primary/5' 
                    : 'border-tbat-surface'
                }`}
              >
                <input
                  type="checkbox"
                  value={goal.value}
                  className="sr-only"
                  checked={selectedGoals?.includes(goal.value) || false}
                  onChange={() => toggleGoal(goal.value)}
                />
                <div className="flex items-center">
                  <span className="text-lg mr-3">{goal.icon}</span>
                  <span className="font-medium text-gray-900 thai-text text-sm">
                    {goal.label}
                  </span>
                </div>
                {selectedGoals?.includes(goal.value) && (
                  <CheckCircle className="w-4 h-4 text-tbat-primary ml-auto" />
                )}
              </label>
            ))}
          </div>
          {errors.goals && (
            <p className="text-sm text-red-600 thai-text">{errors.goals.message}</p>
          )}
        </div>

        {/* Optional Score Fields */}
        <div className="border-t border-tbat-surface pt-6">
          <h3 className="font-medium text-gray-900 thai-text mb-4 flex items-center">
            <Target className="w-5 h-5 text-tbat-primary mr-2" />
            คะแนนเป้าหมาย (ไม่บังคับ)
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="previousScore" className="text-sm font-medium thai-text">
                คะแนนครั้งล่าสุด (%)
              </Label>
              <Input
                id="previousScore"
                type="number"
                min="0"
                max="100"
                placeholder="เช่น 75"
                className="input-tbat"
                {...register("previousScore", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetScore" className="text-sm font-medium thai-text">
                คะแนนเป้าหมาย (%)
              </Label>
              <Input
                id="targetScore"
                type="number"
                min="0"
                max="100"
                placeholder="เช่น 85"
                className="input-tbat"
                {...register("targetScore", { valueAsNumber: true })}
              />
              {errors.targetScore && (
                <p className="text-sm text-red-600 thai-text">{errors.targetScore.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-green-800 thai-text">
          <strong>เกือบเสร็จแล้ว!</strong> หลังจากกดลงทะเบียน คุณจะสามารถเข้าใช้ระบบจำลองสอบ TBAT ได้ทันที
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center px-6 py-3 thai-text"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ย้อนกลับ
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="flex items-center px-8 py-3 thai-text bg-tbat-primary hover:bg-tbat-primary/90"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              กำลังลงทะเบียน...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              ลงทะเบียน
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default AcademicInfoStep