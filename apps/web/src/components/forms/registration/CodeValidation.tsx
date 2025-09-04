"use client"

import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Input } from "@/components/input"
import { Label } from "@/components/label"

export interface CodeValidationState {
  status: "idle" | "checking" | "valid" | "invalid"
  message: string
}

interface CodeValidationProps {
  value: string
  state: CodeValidationState
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
}

export function CodeValidation({ 
  value, 
  state, 
  onChange, 
  error 
}: CodeValidationProps) {
  const ValidationIcon = () => {
    switch (state.status) {
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
    <div>
      <Label htmlFor="uniqueCode">รหัสจาก Box Set (สำหรับ VVIP)</Label>
      <div className="relative mt-1">
        <Input
          id="uniqueCode"
          type="text"
          placeholder="เช่น TBAT-2345-6789"
          value={value}
          onChange={onChange}
          className={`pr-10 ${
            state.status === 'valid' ? 'border-green-500' :
            state.status === 'invalid' ? 'border-red-500' : 
            error ? 'border-red-500' : ''
          }`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <ValidationIcon />
        </div>
      </div>
      {state.message && (
        <p className={`mt-1 text-sm ${
          state.status === 'valid' ? 'text-green-600' : 
          state.status === 'invalid' ? 'text-red-600' : 
          'text-blue-600'
        }`}>
          {state.message}
        </p>
      )}
      {error && !state.message && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}