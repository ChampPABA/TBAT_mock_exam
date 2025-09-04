'use client'

import React, { useState, useCallback } from 'react'
import { Loader2, AlertCircle, CheckCircle, X } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Label } from '@/components/label'
import { formatCodeInput, isValidCodeFormat } from '@/lib/mock-api/codes'

// Debounce hook for real-time validation
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      const newTimer = setTimeout(() => {
        callback(...args)
      }, delay)

      setDebounceTimer(newTimer)
    },
    [callback, delay, debounceTimer]
  )

  return debouncedCallback
}

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onCodeValidated: (codeId: string) => void
}

interface ValidationState {
  isValidating: boolean
  error: string
  success: boolean
  errorType?: string
}

export function RegistrationModal({
  isOpen,
  onClose,
  onCodeValidated
}: RegistrationModalProps) {
  const [code, setCode] = useState('')
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    error: '',
    success: false
  })

  // Real-time code validation with 500ms debouncing
  const validateCode = useCallback(async (inputCode: string) => {
    if (!inputCode || !isValidCodeFormat(inputCode)) {
      setValidationState(prev => ({ ...prev, error: '', success: false }))
      return
    }
    
    setValidationState(prev => ({ 
      ...prev, 
      isValidating: true, 
      error: '', 
      success: false 
    }))

    try {
      const response = await fetch('/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode })
      })

      const result = await response.json()

      if (response.ok && result.valid) {
        // Success case
        setValidationState({
          isValidating: false,
          error: '',
          success: true
        })

        // Auto-close modal and proceed to registration after 1 second
        setTimeout(() => {
          onCodeValidated(result.codeId)
          onClose()
          // Reset state for next use
          setCode('')
          setValidationState({
            isValidating: false,
            error: '',
            success: false
          })
        }, 1000)
      } else {
        // Error case
        setValidationState({
          isValidating: false,
          error: result.message || 'เกิดข้อผิดพลาดในการตรวจสอบรหัส',
          success: false,
          errorType: result.error
        })
      }
    } catch (error) {
      setValidationState({
        isValidating: false,
        error: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
        success: false,
        errorType: 'NETWORK_ERROR'
      })
    }
  }, [onCodeValidated, onClose])

  // Debounced validation function
  const debouncedValidateCode = useDebounce(validateCode, 500)

  // Handle input change with formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value
    const formatted = formatCodeInput(rawInput)
    
    setCode(formatted)
    
    // Clear previous validation state when user types
    if (validationState.error || validationState.success) {
      setValidationState(prev => ({ 
        ...prev, 
        error: '', 
        success: false 
      }))
    }
    
    // Trigger debounced validation
    debouncedValidateCode(formatted)
  }

  // Handle modal close
  const handleClose = () => {
    if (!validationState.isValidating) {
      setCode('')
      setValidationState({
        isValidating: false,
        error: '',
        success: false
      })
      onClose()
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidCodeFormat(code) && !validationState.isValidating) {
      validateCode(code)
    }
  }

  // Get recovery message based on error type
  const getRecoveryMessage = (errorType?: string): string => {
    switch (errorType) {
      case 'INVALID_FORMAT':
        return 'รหัสต้องมีรูปแบบ TBAT-XXXX-XXXX เช่น TBAT-A7K9-M3P4'
      case 'CODE_NOT_FOUND':
        return 'กรุณาตรวจสอบรหัสใน Box Set ของคุณให้ถูกต้อง'
      case 'CODE_ALREADY_USED':
        return 'หากคุณเป็นเจ้าของรหัสนี้ กรุณาติดต่อทีมสนับสนุน'
      case 'RATE_LIMITED':
        return 'กรุณารอ 5 นาทีก่อนลองใหม่'
      default:
        return 'กรุณาลองใหม่อีกครั้ง หรือติดต่อทีมสนับสนุนหากปัญหายังคงอยู่'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md"
        aria-describedby="code-verification-description"
      >
        {/* Close button */}
        <Button
          variant="ghost"
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={handleClose}
          disabled={validationState.isValidating}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">ปิด</span>
        </Button>

        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center thai-text">
            ตรวจสอบรหัส Box Set
          </DialogTitle>
          <DialogDescription 
            id="code-verification-description"
            className="text-center text-muted-foreground thai-text"
          >
            กรุณาใส่รหัสที่ได้รับจาก Box Set ของคุณ
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="box-set-code" className="text-sm font-medium thai-text">
              รหัส Box Set
            </Label>
            <Input
              id="box-set-code"
              type="text"
              value={code}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="TBAT-XXXX-XXXX"
              className={`text-center text-lg font-mono tracking-wider ${
                validationState.error 
                  ? 'border-red-500 focus:border-red-500' 
                  : validationState.success 
                    ? 'border-green-500 focus:border-green-500' 
                    : ''
              }`}
              disabled={validationState.isValidating || validationState.success}
              autoComplete="off"
              autoFocus
              aria-invalid={!!validationState.error}
              aria-describedby={validationState.error ? "code-error" : undefined}
            />
          </div>
          
          {/* Loading state */}
          {validationState.isValidating && (
            <div className="flex items-center justify-center space-x-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground thai-text">
                กำลังตรวจสอบรหัส...
              </span>
            </div>
          )}
          
          {/* Success state */}
          {validationState.success && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 thai-text">
                รหัสถูกต้อง! กำลังเข้าสู่หน้าลงทะเบียน...
              </AlertDescription>
            </Alert>
          )}
          
          {/* Error state */}
          {validationState.error && (
            <Alert variant="destructive" id="code-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="thai-text">{validationState.error}</div>
                <div className="text-xs text-muted-foreground thai-text">
                  {getRecoveryMessage(validationState.errorType)}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Format hint */}
          {!validationState.error && !validationState.success && !validationState.isValidating && (
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <div className="thai-text">รูปแบบรหัส: TBAT-XXXX-XXXX</div>
              <div className="thai-text">ตัวอย่าง: TBAT-A7K9-M3P4</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RegistrationModal