# API Contract Documentation

## Overview

This document defines the API contracts between frontend and backend services for the TBAT Mock Exam Platform. All APIs follow RESTful conventions with JSON payloads and proper HTTP status codes.

## Base Configuration

```typescript
// Base API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
const API_TIMEOUT = 10000 // 10 seconds
const RETRY_ATTEMPTS = 3

// Common Headers
interface APIHeaders {
  'Content-Type': 'application/json'
  'Authorization'?: `Bearer ${string}`
  'X-Session-ID'?: string
}
```

## Authentication APIs

### POST /api/auth/register
**Epic Dependency:** Epic 2 (User Authentication & Registration)

```typescript
// Request
interface RegisterRequest {
  email: string
  password: string // 8+ chars with numbers + letters
  thai_name: string
  phone: string
  school: string
  line_id?: string
  pdpa_consent: boolean
}

// Response
interface RegisterResponse {
  success: boolean
  user: {
    id: string
    email: string
    thai_name: string
    package_type: "FREE" | "ADVANCED"
  }
  session_token: string
}

// Status Codes
// 201: Created successfully
// 400: Validation error
// 409: Email already exists
```

### POST /api/auth/login
**Epic Dependency:** Epic 2

```typescript
// Request
interface LoginRequest {
  email: string
  password: string
}

// Response
interface LoginResponse {
  success: boolean
  user: User
  session_token: string
  expires_at: string
}
```

## Package & Capacity APIs

### GET /api/packages
**Epic Dependency:** Epic 1 (Landing Page & Package Selection)

```typescript
// Response
interface PackagesResponse {
  packages: Package[]
}

interface Package {
  id: string
  name: "FREE" | "ADVANCED"
  price: number // 0 or 690
  thai_price: string // "ฟรี" or "฿690"
  features: string[]
  subjects: ("BIOLOGY" | "CHEMISTRY" | "PHYSICS")[]
  analytics_included: boolean
  pdf_access: boolean
}
```

### GET /api/capacity?format=detailed
**Epic Dependency:** Epic 4 (Session Booking & Capacity Management)

```typescript
// Query Parameters
interface CapacityQuery {
  format?: 'basic' | 'detailed'
  session?: '09:00-12:00' | '13:00-16:00'
}

// Response
interface CapacityResponse {
  sessions: SessionCapacity[]
  last_updated: string
}

interface SessionCapacity {
  session_time: "09:00-12:00" | "13:00-16:00"
  current_count: number
  max_capacity: number // 300 exam participants per session
  availability_status: "AVAILABLE" | "NEARLY_FULL" | "FULL" | "ADVANCED_ONLY"
  thai_message: string // Localized capacity messaging
  free_available: boolean
  advanced_available: boolean
}
```

## Payment APIs

### POST /api/payments/create-intent
**Epic Dependency:** Epic 3 (Payment & Exam Code Generation)

```typescript
// Request
interface PaymentIntentRequest {
  package_type: "ADVANCED_PACKAGE" | "POST_EXAM_UPGRADE"
  amount: 69000 | 29000 // Thai Satang (690 THB | 290 THB)
  user_id: string
}

// Response
interface PaymentIntentResponse {
  success: boolean
  client_secret: string
  payment_intent_id: string
  amount: number
  currency: "thb"
}
```

### POST /api/payments/confirm
**Epic Dependency:** Epic 3

```typescript
// Request
interface PaymentConfirmRequest {
  payment_intent_id: string
  user_id: string
}

// Response
interface PaymentConfirmResponse {
  success: boolean
  payment: Payment
  exam_codes?: ExamCode[] // Generated after payment
}

interface Payment {
  id: string
  user_id: string
  stripe_payment_intent_id: string
  amount: number
  currency: "thb"
  status: "COMPLETED"
  completed_at: string
}
```

## Exam Code APIs

### GET /api/exam-codes/user/:userId
**Epic Dependency:** Epic 3

```typescript
// Response
interface ExamCodesResponse {
  exam_codes: ExamCode[]
}

interface ExamCode {
  id: string
  code: string // FREE-XXXX-[SUBJECT] or ADV-XXXX (XXXX = 4 chars: alphanumeric uppercase)
  package_type: "FREE" | "ADVANCED"
  subject: "BIOLOGY" | "CHEMISTRY" | "PHYSICS"
  session_time: "09:00-12:00" | "13:00-16:00"
  is_used: boolean
  created_at: string
  used_at?: string
}
```

### POST /api/exam-codes/generate
**Epic Dependency:** Epic 3

```typescript
// Request
interface GenerateCodesRequest {
  user_id: string
  package_type: "FREE" | "ADVANCED"
  session_time: "09:00-12:00" | "13:00-16:00"
  subjects: ("BIOLOGY" | "CHEMISTRY" | "PHYSICS")[]
}

// Response
interface GenerateCodesResponse {
  success: boolean
  exam_codes: ExamCode[]
}
```

## Session Management APIs

### POST /api/sessions/book
**Epic Dependency:** Epic 4

```typescript
// Request
interface BookSessionRequest {
  user_id: string
  session_time: "09:00-12:00" | "13:00-16:00"
  package_type: "FREE" | "ADVANCED"
}

// Response
interface BookSessionResponse {
  success: boolean
  booking: SessionBooking
  capacity_updated: SessionCapacity
}

interface SessionBooking {
  id: string
  user_id: string
  session_time: "09:00-12:00" | "13:00-16:00"
  booking_status: "CONFIRMED"
  created_at: string
}
```

## Results APIs

### GET /api/results/user/:userId
**Epic Dependency:** Epic 6 (Results Display & Freemium Conversion)

```typescript
// Response
interface ResultsResponse {
  results: ExamResult[]
  upgrade_available?: boolean
}

interface ExamResult {
  id: string
  user_id: string
  exam_code: string
  total_score: number
  subject_scores: {
    biology?: number
    chemistry?: number
    physics?: number
  }
  percentile?: number // Advanced package only
  completion_time: number // Minutes
  expires_at: string // 6-month expiry
  is_accessible: boolean
  created_at: string
}
```

### GET /api/results/:resultId/analytics
**Epic Dependency:** Epic 7 (Advanced Analytics Dashboard)

```typescript
// Response (Advanced Package Only)
interface AnalyticsResponse {
  analytics: Analytics
  access_level: "ADVANCED"
}

interface Analytics {
  id: string
  result_id: string
  subject_breakdowns: SubjectBreakdown[]
  recommendations: StudyRecommendation[]
  comparison_data: ComparisonData
  generated_at: string
}

interface SubjectBreakdown {
  subject: "BIOLOGY" | "CHEMISTRY" | "PHYSICS"
  topics: TopicAnalysis[]
  strengths: string[]
  weaknesses: string[]
}

interface TopicAnalysis {
  topic_name: string
  topic_name_thai: string
  score: number
  max_score: number
  percentile: number
}
```

## Admin APIs

### POST /api/admin/scores/upload
**Epic Dependency:** Epic 5 (Admin Management System)

```typescript
// Request (Multipart Form Data)
interface ScoreUploadRequest {
  xlsx_file: File
  exam_date: string
  admin_id: string
}

// Response
interface ScoreUploadResponse {
  success: boolean
  processed_count: number
  error_count: number
  errors?: UploadError[]
}

interface UploadError {
  row: number
  exam_code: string
  error: string
}
```

### GET /api/admin/users
**Epic Dependency:** Epic 5

```typescript
// Query Parameters
interface AdminUsersQuery {
  page?: number
  limit?: number
  package_type?: "FREE" | "ADVANCED"
  search?: string
}

// Response
interface AdminUsersResponse {
  users: AdminUserView[]
  total: number
  page: number
  limit: number
}

interface AdminUserView {
  id: string
  email: string
  thai_name: string
  phone: string
  package_type: "FREE" | "ADVANCED"
  exam_codes_count: number
  has_results: boolean
  created_at: string
}
```

## PDF Management APIs

### GET /api/pdfs/solutions
**Epic Dependency:** Epic 6 (Advanced Package users only)

```typescript
// Response
interface PDFSolutionsResponse {
  solutions: PDFSolution[]
  access_level: "ADVANCED" | "DENIED"
}

interface PDFSolution {
  id: string
  subject: "BIOLOGY" | "CHEMISTRY" | "PHYSICS"
  exam_date: string
  file_url?: string // Only for ADVANCED users
  description: string
  is_active: boolean
  expires_at: string
}
```

### POST /api/admin/pdfs/upload
**Epic Dependency:** Epic 5

```typescript
// Request (Multipart Form Data)
interface PDFUploadRequest {
  pdf_file: File
  subject: "BIOLOGY" | "CHEMISTRY" | "PHYSICS"
  description: string
  admin_id: string
}

// Response
interface PDFUploadResponse {
  success: boolean
  pdf_solution: PDFSolution
  notification_sent: boolean
  notified_users_count: number
}
```

## Error Handling

### Standard Error Response
```typescript
interface APIError {
  success: false
  error: {
    code: string
    message: string
    message_thai?: string
    details?: any
  }
  timestamp: string
}

// Common Error Codes
type ErrorCode = 
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_REQUIRED" 
  | "INSUFFICIENT_PERMISSIONS"
  | "RESOURCE_NOT_FOUND"
  | "PAYMENT_FAILED"
  | "CAPACITY_EXCEEDED"
  | "EXAM_CODE_USED"
  | "RESULTS_NOT_AVAILABLE"
  | "PDF_ACCESS_DENIED"
  | "INTERNAL_SERVER_ERROR"
```

### Thai Error Messages
```typescript
const THAI_ERROR_MESSAGES: Record<ErrorCode, string> = {
  "VALIDATION_ERROR": "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่",
  "AUTHENTICATION_REQUIRED": "กรุณาเข้าสู่ระบบก่อนใช้งาน",
  "INSUFFICIENT_PERMISSIONS": "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
  "PAYMENT_FAILED": "การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  "CAPACITY_EXCEEDED": "ที่นั่งเต็มแล้ว กรุณาเลือกช่วงเวลาอื่น",
  "PDF_ACCESS_DENIED": "เฉพาะผู้ใช้แพ็คเกจ Advanced เท่านั้นที่สามารถดาวน์โหลดไฟล์ PDF ได้"
}
```

## Rate Limiting

### API Rate Limits
```typescript
interface RateLimit {
  endpoint: string
  limit: number
  window: string
  scope: "IP" | "USER"
}

const RATE_LIMITS: RateLimit[] = [
  { endpoint: "/api/auth/*", limit: 10, window: "15m", scope: "IP" },
  { endpoint: "/api/capacity", limit: 60, window: "1m", scope: "IP" },
  { endpoint: "/api/payments/*", limit: 5, window: "5m", scope: "USER" },
  { endpoint: "/api/admin/*", limit: 100, window: "1m", scope: "USER" }
]
```

### Rate Limit Headers
```typescript
interface RateLimitHeaders {
  "X-RateLimit-Limit": string
  "X-RateLimit-Remaining": string
  "X-RateLimit-Reset": string
  "Retry-After"?: string // When rate limited
}
```

## Circuit Breaker Integration

### Circuit Breaker Status
```typescript
interface CircuitBreakerStatus {
  state: "CLOSED" | "OPEN" | "HALF_OPEN"
  failure_count: number
  success_count: number
  last_failure_time?: string
  next_attempt_time?: string
}

// Response Headers
interface CircuitBreakerHeaders {
  "X-Circuit-Breaker-State": CircuitBreakerState
  "X-Fallback-Used"?: "true" | "false"
}
```

---

**Last Updated:** 2025-09-12  
**Version:** 1.0  
**Author:** PO Sarah  
**Epic Integration:** All APIs mapped to specific epics for dependency tracking