'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Label } from '@/components/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

interface BoxSetCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onCodeValidated?: (codeId: string) => void
}

export function BoxSetCodeModal({ isOpen, onClose, onCodeValidated }: BoxSetCodeModalProps) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleValidate = async () => {
    // Remove any whitespace and convert to uppercase
    const cleanCode = code.trim().toUpperCase()
    
    // Basic format validation
    const codePattern = /^TBAT-[A-Z0-9]{4}-[A-Z0-9]{4}$/
    if (!codePattern.test(cleanCode)) {
      setError('รูปแบบรหัสไม่ถูกต้อง กรุณาใช้รูปแบบ TBAT-XXXX-XXXX')
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      // Call actual API for code validation
      const response = await fetch('/api/auth/validate-boxset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: cleanCode }),
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setSuccess(true)
        
        // Store student info if available
        if (result.studentInfo) {
          sessionStorage.setItem('boxsetStudentInfo', JSON.stringify(result.studentInfo))
        }
        
        // Wait a moment to show success state
        setTimeout(() => {
          if (onCodeValidated) {
            onCodeValidated(cleanCode)
          }
          // Navigate to registration with validated code
          router.push(`/register?code=${encodeURIComponent(cleanCode)}`)
          handleClose()
        }, 1000)
      } else {
        // Handle different error types
        if (response.status === 429) {
          setError('จำนวนการตรวจสอบเกินกำหนด กรุณารอสักครู่แล้วลองใหม่')
        } else {
          setError(result.error || 'รหัส BoxSet ไม่ถูกต้องหรือถูกใช้งานแล้ว')
        }
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsValidating(false)
    }
  }

  const handleClose = () => {
    setCode('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  // Debounced formatting function for better performance
  const formatCode = useCallback((value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    
    // Format as TBAT-XXXX-XXXX
    if (cleaned.startsWith('TBAT')) {
      const withoutPrefix = cleaned.substring(4)
      const part1 = withoutPrefix.substring(0, 4)
      const part2 = withoutPrefix.substring(4, 8)
      
      let formatted = 'TBAT'
      if (part1) formatted += '-' + part1
      if (part2) formatted += '-' + part2
      
      return formatted
    }
    
    return cleaned
  }, [])

  // Debounced handler for input changes
  const debouncedFormatCode = useDebouncedCallback(
    (value: string) => {
      const formatted = formatCode(value)
      setCode(formatted)
    },
    100 // 100ms debounce delay
  )

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Update immediately for user feedback
    setCode(formatCode(value))
    setError(null)
    // Debounce the formatting for performance
    debouncedFormatCode(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center thai-text">
            กรอก BoxSet Code
          </DialogTitle>
          <DialogDescription className="text-center thai-text">
            กรุณาใส่รหัสที่ได้รับจาก Box Set เพื่อเริ่มต้นการลงทะเบียน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success State */}
          {success ? (
            <div className="py-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-600 thai-text">
                ยืนยันรหัสสำเร็จ!
              </p>
              <p className="text-sm text-gray-600 mt-2 thai-text">
                กำลังนำคุณไปยังหน้าลงทะเบียน...
              </p>
            </div>
          ) : (
            <>
              {/* Code Input */}
              <div className="space-y-2">
                <Label htmlFor="boxset-code" className="thai-text">
                  รหัส BoxSet Code
                </Label>
                <Input
                  id="boxset-code"
                  type="text"
                  placeholder="TBAT-XXXX-XXXX"
                  value={code}
                  onChange={handleCodeChange}
                  maxLength={14}
                  className="text-center text-lg font-mono tracking-wider"
                  disabled={isValidating}
                />
                <p className="text-xs text-gray-500 text-center thai-text">
                  รหัสอยู่ด้านหลังกล่อง Box Set ของคุณ
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="thai-text">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-900 mb-1 thai-text">
                  ข้อมูลเพิ่มเติม
                </h4>
                <ul className="text-xs text-blue-700 space-y-1 thai-text">
                  <li>• รหัสประกอบด้วยตัวอักษรและตัวเลข 12 หลัก</li>
                  <li>• รหัสแต่ละชุดใช้ได้เพียงครั้งเดียว</li>
                  <li>• หากไม่มีรหัส กรุณาติดต่อสถาบันการศึกษาของคุณ</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 thai-text"
                  onClick={handleClose}
                  disabled={isValidating}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  className="flex-1 thai-text"
                  onClick={handleValidate}
                  disabled={!code || code.length < 14 || isValidating}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    'ยืนยันรหัส'
                  )}
                </Button>
              </div>

              {/* Help Link */}
              <div className="text-center pt-2 border-t">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-gray-600 hover:text-gray-800 thai-text"
                  onClick={() => {
                    handleClose()
                    router.push('/support')
                  }}
                >
                  ต้องการความช่วยเหลือ?
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}