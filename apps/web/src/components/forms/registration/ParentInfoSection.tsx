"use client"

import { Input } from "@/components/input"
import { Label } from "@/components/label"

interface ParentInfoSectionProps {
  show: boolean
  onToggle: (value: boolean) => void
  register: any
  errors?: any
}

export function ParentInfoSection({
  show,
  onToggle,
  register,
  errors
}: ParentInfoSectionProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => onToggle(e.target.checked)}
          className="mr-2"
        />
        <span className="font-medium">เพิ่มข้อมูลผู้ปกครอง (ไม่บังคับ)</span>
      </label>

      {show && (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="parentName">ชื่อผู้ปกครอง</Label>
            <Input
              id="parentName"
              type="text"
              placeholder="ชื่อ-นามสกุล"
              {...register("parentName")}
            />
            {errors?.parentName && (
              <p className="mt-1 text-sm text-red-600">{errors.parentName.message}</p>
            )}
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
            {errors?.parentRelation && (
              <p className="mt-1 text-sm text-red-600">{errors.parentRelation.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="parentPhone">เบอร์โทรศัพท์ผู้ปกครอง</Label>
            <Input
              id="parentPhone"
              type="tel"
              placeholder="08x-xxx-xxxx"
              {...register("parentPhone")}
            />
            {errors?.parentPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.parentPhone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="parentEmail">อีเมลผู้ปกครอง</Label>
            <Input
              id="parentEmail"
              type="email"
              placeholder="parent@email.com"
              {...register("parentEmail")}
            />
            {errors?.parentEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.parentEmail.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}