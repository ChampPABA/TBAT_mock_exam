# TBAT Mock Exam Platform - Coding Standards

> **Document Status:** v1.0 - Minimal Practical Standards
> **Last Updated:** 2025-01-03
> **Philosophy:** Consistency over perfection, clarity over cleverness

## 🎯 Core Principles

1. **Exam Safety First** - Code that handles exams must be bulletproof
2. **Readable > Clever** - Future you (or teammate) should understand instantly
3. **Fail Loudly** - Better to catch errors in dev than during student exams
4. **Mobile-First** - Every UI decision considers mobile devices

---

## 📁 File Organization

### Naming Conventions
```typescript
// ✅ Files & Folders
components/ExamTimer.tsx       // PascalCase for components
lib/formatTime.ts              // camelCase for utilities
hooks/useExamSession.ts        // camelCase with 'use' prefix
types/exam.types.ts            // lowercase with .types suffix
constants/EXAM_DURATION.ts     // SCREAMING_SNAKE for constants

// ✅ Component Structure
ExamTimer/
  ├── ExamTimer.tsx           // Main component
  ├── ExamTimer.types.ts      // Type definitions
  ├── ExamTimer.test.tsx      // Tests
  └── index.ts                // Public export
```

### Import Order
```typescript
// 1. React/Next
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { z } from 'zod'
import { useForm } from 'react-hook-form'

// 3. Internal absolute imports
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

// 4. Relative imports
import { ExamHeader } from './ExamHeader'

// 5. Types (if separate)
import type { ExamSession } from '@/types/exam.types'
```

---

## 🏗️ TypeScript Standards

### Type Everything Meaningful
```typescript
// ✅ GOOD - Explicit types for exam-critical data
interface ExamSubmission {
  studentId: string
  answers: Record<number, string>
  startTime: Date
  endTime: Date
  isComplete: boolean
}

// ❌ BAD - Using 'any' for exam data
const handleSubmit = (data: any) => { }
```

### Prefer Interface over Type (for objects)
```typescript
// ✅ Interfaces for object shapes
interface Student {
  id: string
  name: string
  examCode: string
}

// ✅ Types for unions/primitives
type ExamStatus = 'pending' | 'active' | 'completed' | 'expired'
type StudentId = string
```

---

## ⚛️ React/Next.js Patterns

### Component Structure
```tsx
// ✅ Consistent component pattern
export function ExamQuestion({ 
  question, 
  onAnswer 
}: ExamQuestionProps) {
  // 1. Hooks first
  const [selected, setSelected] = useState<string>()
  const router = useRouter()
  
  // 2. Derived state
  const isAnswered = selected !== undefined
  
  // 3. Handlers
  const handleSubmit = () => {
    if (!selected) return
    onAnswer(selected)
  }
  
  // 4. Effects (if needed)
  useEffect(() => {
    // Effect logic
  }, [])
  
  // 5. Render
  return (
    <div className="space-y-4">
      {/* JSX */}
    </div>
  )
}
```

### Server vs Client Components
```tsx
// ✅ Default to Server Components
// app/exam/[id]/page.tsx
export default async function ExamPage({ params }: Props) {
  const exam = await getExam(params.id) // Server-side data fetch
  return <ExamContent exam={exam} />
}

// ✅ Use Client only when needed
// 'use client'
// components/ExamTimer.tsx - Needs useState, useEffect
```

---

## 🛡️ Error Handling

### Exam-Critical Operations
```typescript
// ✅ ALWAYS handle submission failures
async function submitExam(data: ExamSubmission) {
  try {
    const result = await api.submitExam(data)
    return { success: true, result }
  } catch (error) {
    // Log for debugging
    console.error('Exam submission failed:', error)
    
    // Store locally for recovery
    localStorage.setItem('failed_submission', JSON.stringify({
      data,
      timestamp: Date.now(),
      error: error.message
    }))
    
    // Inform user clearly
    return {
      success: false,
      error: 'การส่งข้อสอบล้มเหลว กรุณาแจ้งผู้คุมสอบ',
      recoverable: true
    }
  }
}
```

### Form Validation
```typescript
// ✅ Validate on client AND server
const examSchema = z.object({
  studentId: z.string().length(10, 'รหัสนักเรียนต้องมี 10 หลัก'),
  answers: z.record(z.string()).refine(
    (answers) => Object.keys(answers).length >= 50,
    'ต้องตอบอย่างน้อย 50 ข้อ'
  )
})

// Client validation
const form = useForm({
  resolver: zodResolver(examSchema)
})

// Server validation (API route)
export async function POST(request: Request) {
  const body = await request.json()
  const validated = examSchema.safeParse(body)
  
  if (!validated.success) {
    return Response.json(
      { error: validated.error.flatten() },
      { status: 400 }
    )
  }
  // Process validated.data
}
```

---

## 🎨 Styling Standards

### Tailwind Classes Order
```tsx
// ✅ Consistent order: layout → spacing → styling → states
<div className="
  flex flex-col items-center
  p-4 mt-8 mb-4
  bg-white rounded-lg border border-gray-200
  hover:shadow-lg transition-shadow
  dark:bg-gray-800 dark:border-gray-700
">
```

### Component Variants with CVA
```typescript
// ✅ Use cva for component variants
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)
```

---

## 🧪 Testing Standards

### Critical Path Testing
```typescript
// ✅ MUST test exam workflows
describe('Exam Submission', () => {
  it('should not lose answers on network failure', async () => {
    // Test implementation
  })
  
  it('should prevent duplicate submissions', async () => {
    // Test implementation
  })
  
  it('should auto-save progress every 30 seconds', async () => {
    // Test implementation
  })
})
```

### Component Testing Priority
```typescript
// Priority 1: Exam-critical components
// - ExamTimer, QuestionDisplay, AnswerSheet, SubmitButton

// Priority 2: Data handling
// - Score calculation, Answer validation, Report generation

// Priority 3: UI/UX
// - Navigation, Modals, Tooltips
```

---

## 📱 Mobile-First Requirements

### Touch Targets
```tsx
// ✅ Minimum 44x44px touch targets
<button className="min-h-[44px] min-w-[44px] p-3">
  ส่งคำตอบ
</button>
```

### Responsive Design
```tsx
// ✅ Mobile-first breakpoints
<div className="
  grid grid-cols-1 gap-4      // Mobile default
  md:grid-cols-2               // Tablet
  lg:grid-cols-3               // Desktop
">
```

---

## 🚫 Forbidden Patterns

```typescript
// ❌ NEVER in production
console.log(studentData)          // Don't log sensitive data
eval(userInput)                    // Security risk
// @ts-ignore                      // Fix the type issue
dangerouslySetInnerHTML           // Only with sanitization
localStorage.setItem('password')  // Never store secrets client-side
```

---

## 📋 PR Checklist

Before merging any exam-related code:
- [ ] No console.logs with student data
- [ ] Error handling for network failures
- [ ] Mobile tested (responsive + touch)
- [ ] Loading states implemented
- [ ] Thai language UI text
- [ ] Accessibility (ARIA labels)

---

## 🔄 Gradual Adoption

**Phase 1 (Now):** Focus on exam-critical paths only
**Phase 2:** Expand to all new components
**Phase 3:** Refactor existing code during updates

---

*Remember: These are guidelines, not laws. Use judgment for edge cases.*