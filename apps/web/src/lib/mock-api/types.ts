export interface User {
  id: string
  email: string
  name: string
  school: string
  grade: "M.4" | "M.5" | "M.6"
  lineId: string
  tier: "FREE" | "VVIP"
  subjects: string[]
  examTicket: string
  parent?: {
    name: string
    relation: "father" | "mother" | "guardian"
    phone: string
    email?: string
  }
  createdAt: string
}

export interface UniqueCode {
  id: string
  code: string // TBAT-XXXX-XXXX format
  isUsed: boolean
  usedBy: string | null
  usedAt: string | null
  createdAt: string
  expiresAt: string | null
  validationAttempts?: CodeValidationAttempt[]
}

export interface CodeValidationAttempt {
  id: string
  code: string
  ipAddress: string
  userAgent: string | null
  successful: boolean
  createdAt: string
  uniqueCode?: UniqueCode | null
}

export interface RegisterData {
  uniqueCode?: string // Now optional for backward compatibility
  email: string
  name: string
  school: string
  grade: "M.4" | "M.5" | "M.6"
  password: string
  lineId: string // Required field
  phone?: string
  tier?: "FREE" | "VVIP" // Defaults to FREE
  subjects: string[] // Subject selection
  parent?: {
    name: string
    relation: "father" | "mother" | "guardian"
    phone: string
    email?: string
  }
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

export interface CodeValidationResponse {
  valid: boolean
  message: string
  code?: string
  codeId?: string // For successful validation
  error?: string // Error type for client-side handling
}