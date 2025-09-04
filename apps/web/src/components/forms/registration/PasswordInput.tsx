"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/input"
import { Label } from "@/components/label"

interface PasswordInputProps {
  id: string
  label: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  showStrength?: boolean
  register?: any
}

export function getPasswordStrength(password: string): { 
  strength: number
  text: string
  color: string 
} {
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

export function PasswordInput({
  id,
  label,
  placeholder,
  value = "",
  onChange,
  error,
  showStrength = false,
  register
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const passwordStrength = showStrength ? getPasswordStrength(value) : null

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={error ? 'border-red-500 pr-10' : 'pr-10'}
          {...(register || { value, onChange })}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      
      {showStrength && value && passwordStrength && (
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
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}