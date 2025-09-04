"use client"

import { Label } from "@/components/label"

interface SubjectSelectorProps {
  subjects: string[]
  selectedSubjects: string[]
  isFreeTier: boolean
  onSubjectToggle: (subject: string) => void
  error?: string
}

export function SubjectSelector({
  subjects,
  selectedSubjects,
  isFreeTier,
  onSubjectToggle,
  error
}: SubjectSelectorProps) {
  return (
    <div>
      <Label>
        เลือกวิชาที่ต้องการสอบ * {isFreeTier && "(FREE: เลือกได้ 1 วิชา)"}
      </Label>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {subjects.map((subject) => (
          <label
            key={subject}
            className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedSubjects.includes(subject) 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedSubjects.includes(subject)}
              onChange={() => onSubjectToggle(subject)}
              className="mr-2"
            />
            <span>{subject}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}