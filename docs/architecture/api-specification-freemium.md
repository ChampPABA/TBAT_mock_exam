# API Specification - Freemium Model

**Version 2.3 Updates:**
- Added answer key download endpoint: `GET /api/results/answer-key/:examId`
- Added admin upload endpoints: `POST /api/admin/answer-key/upload` and `/publish`
- Simplified answer key delivery system for manual PDF upload workflow

## Overview

This document defines the API endpoints for the TBAT Mock Exam Freemium registration and results portal. All endpoints support the physical exam registration and tier-based results access model.

**Base URL:** `https://api.tbat.com`  
**Authentication:** JWT tokens with secure httpOnly cookies  
**Rate Limiting:** 60 requests per minute per IP (general), 5 per minute (payment)

## API Endpoints

### 1. Authentication & Registration

#### POST /api/auth/register
Register new user for physical exam (FREE or VVIP tier).

**Request:**
```typescript
{
  // User Information
  email: string;           // Required, unique
  password: string;        // Min 8 chars, 1 uppercase, 1 number
  name: string;            // Full name in Thai or English
  
  // Academic Information  
  school: string;          // School name
  grade: "M4" | "M5" | "M6"; // Mattayom level
  
  // Contact Information
  lineId: string;          // LINE ID for notifications
  phone?: string;          // Optional phone number
  
  // Tier Selection
  tier: "FREE" | "VVIP";   // Selected tier
  
  // Subject Selection
  subjects: string[];      // ["Physics"] for FREE, ["Physics","Chemistry","Biology"] for VVIP
  
  // Parent Information (required for minors)
  parent?: {
    name: string;
    relation: "father" | "mother" | "guardian";
    phone: string;
    email?: string;
  };
  
  // Payment (VVIP only)
  paymentMethodId?: string; // Stripe payment method
}
```

**Response (200 OK):**
```typescript
{
  success: true;
  user: {
    id: string;
    email: string;
    name: string;
    tier: "FREE" | "VVIP";
  };
  registration: {
    examTicket: string;      // "TBAT-2025-XXXX"
    examDate: string;        // "2025-09-20"
    examTime: string;        // "09:00"
    venue: string;           // "Chiang Mai University"
    venueAddress: string;    // Full address
    subjects: string[];      // Registered subjects
  };
  // VVIP only
  payment?: {
    status: "success";
    receiptUrl: string;
  };
}
```

**Error Responses:**
- `400` - Invalid input data
- `409` - Email already exists
- `402` - Payment required (VVIP registration failed)
- `500` - Server error

---

#### POST /api/auth/login
Authenticate existing user.

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (200 OK):**
```typescript
{
  success: true;
  user: {
    id: string;
    email: string;
    name: string;
    tier: "FREE" | "VVIP";
  };
  token: string; // JWT token
}
```

---

### 2. Dashboard & User Management

#### GET /api/dashboard
Get user dashboard data based on tier.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```typescript
{
  user: {
    id: string;
    name: string;
    email: string;
    school: string;
    grade: string;
    tier: "FREE" | "VVIP";
  };
  
  registration: {
    examTicket: string;
    examDate: string;
    examTime: string;
    venue: string;
    venueMap: string;        // Google Maps link
    subjects: string[];
    status: "REGISTERED" | "ATTENDED" | "ABSENT";
  };
  
  // Only if results available
  results?: {
    available: boolean;
    summary: {
      subjects: string[];
      overallScore?: number;  // VVIP only
      percentile?: number;    // VVIP only
    };
  };
  
  // FREE tier only
  upgradePrompt?: {
    show: boolean;
    message: string;
    benefits: string[];
  };
}
```

---

### 3. Payment & Upgrades

#### POST /api/payment/create-checkout
Create Stripe checkout session for VVIP upgrade.

**Request:**
```typescript
{
  upgradeType: "PRE_EXAM" | "POST_RESULTS";
  returnUrl?: string;       // Custom return URL
}
```

**Response (200 OK):**
```typescript
{
  checkoutUrl: string;       // Stripe hosted checkout URL
  sessionId: string;         // Stripe session ID
  expiresAt: string;         // ISO timestamp
}
```

---

#### POST /api/payment/webhook
Stripe webhook handler (called by Stripe).

**Headers:**
```
stripe-signature: <signature>
```

**Request:**
```typescript
// Raw Stripe webhook payload
```

**Response (200 OK):**
```text
OK
```

---

#### GET /api/payment/status/:sessionId
Check payment session status.

**Response (200 OK):**
```typescript
{
  status: "pending" | "processing" | "complete" | "expired";
  paid: boolean;
  userUpgraded: boolean;
}
```

---

### 4. Exam Information

#### GET /api/exam/info
Get current exam session information.

**Response (200 OK):**
```typescript
{
  upcoming: {
    id: string;
    date: string;            // "2025-09-20"
    time: string;            // "09:00-12:00"
    venue: {
      name: string;          // "Chiang Mai University"
      address: string;
      googleMaps: string;
      directions: string;
    };
    registrationDeadline: string;
    availableSeats: number;
    totalSeats: number;
  };
  
  instructions: {
    whatToBring: string[];
    prohibited: string[];
    arrivalTime: string;
  };
}
```

---

### 5. Results API (Post-Exam)

#### GET /api/results/:examTicket
Get exam results based on user tier.

**Response (200 OK) - FREE Tier:**
```typescript
{
  tier: "FREE";
  examDate: string;
  results: {
    subject: string;
    score: number;
    maxScore: number;
    passed: boolean;         // Score >= 50%
  };
  
  upgradePrompt: {
    message: string;
    benefits: [
      "ดูเฉลยละเอียดทุกข้อ",
      "วิเคราะห์จุดอ่อน-จุดแข็ง",
      "ดู Percentile เทียบผู้สอบทั้งหมด",
      "Export ผลเป็น PDF"
    ];
    upgradeUrl: string;
  };
}
```

**Response (200 OK) - VVIP Tier:**
```typescript
{
  tier: "VVIP";
  examDate: string;
  results: {
    subjects: Array<{
      subject: string;
      score: number;
      maxScore: number;
      percentile: number;     // 1-100
      passed: boolean;
      
      // Detailed breakdown
      sections: Array<{
        name: string;
        score: number;
        maxScore: number;
        questions: Array<{
          number: number;
          correct: boolean;
          userAnswer: string;
          correctAnswer: string;
          explanation: string;
        }>;
      }>;
      
      // Analysis
      analysis: {
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
      };
    }>;
    
    // Overall statistics
    overall: {
      totalScore: number;
      totalMaxScore: number;
      averagePercentile: number;
      ranking: number;        // Out of total test takers
      totalTestTakers: number;
    };
  };
  
  // Export options
  export: {
    pdfUrl: string;
    csvUrl: string;
  };
}
```

---

#### GET /api/results/answer-key/:examId
Download answer key PDF for VVIP users.

**Authentication:** JWT required (VVIP tier only)

**Response (200 OK):**
```typescript
{
  available: boolean;
  downloadUrl?: string;
  publishedAt?: string;
}
```

**Response (404):** Answer key not yet available
**Response (403):** Free tier user - upgrade required

---

#### GET /api/results/export/:format
Export results (VVIP only).

**Parameters:**
- `format`: "pdf" | "csv"

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```typescript
// Returns file download
Content-Type: application/pdf | text/csv
Content-Disposition: attachment; filename="tbat-results-2025.pdf"
```

---

### 6. Admin APIs

#### POST /api/admin/upload-results
Upload graded exam results via CSV.

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Request:**
```
FormData:
- file: results.csv
- examSessionId: string
```

**CSV Format:**
```csv
examTicket,subject,score,maxScore,percentile
TBAT-2025-0001,Physics,75,100,85
TBAT-2025-0001,Chemistry,68,100,72
TBAT-2025-0001,Biology,82,100,90
```

**Response (200 OK):**
```typescript
{
  success: true;
  processed: number;
  failed: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
  notifications: {
    sent: number;
    failed: number;
  };
}
```

---

#### POST /api/admin/answer-key/upload
Upload answer key PDF file for exam session.

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Request:**
```
FormData:
- file: answer-key.pdf (max 50MB)
- examSessionId: string
```

**Response (200 OK):**
```typescript
{
  success: true;
  fileId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  previewUrl: string;
}
```

---

#### POST /api/admin/answer-key/publish
Publish answer key to make available to VVIP students.

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request:**
```typescript
{
  examSessionId: string;
  fileId: string;
}
```

**Response (200 OK):**
```typescript
{
  success: true;
  publishedAt: string;
  studentsNotified: number;
}
```

---

#### GET /api/admin/registrations
Get all registrations for exam session.

**Query Parameters:**
- `sessionId`: string (optional)
- `tier`: "FREE" | "VVIP" | "ALL"
- `page`: number (default: 1)
- `limit`: number (default: 50)

**Response (200 OK):**
```typescript
{
  registrations: Array<{
    examTicket: string;
    userName: string;
    userEmail: string;
    school: string;
    grade: string;
    tier: string;
    subjects: string[];
    status: string;
    registeredAt: string;
  }>;
  
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  
  statistics: {
    total: number;
    free: number;
    vvip: number;
    attended: number;
    absent: number;
  };
}
```

---

#### POST /api/admin/notify
Send bulk notifications to users.

**Request:**
```typescript
{
  type: "RESULTS_READY" | "EXAM_REMINDER" | "CUSTOM";
  recipients: "ALL" | "FREE" | "VVIP" | string[]; // User IDs
  
  message: {
    subject: string;
    body: string;
    channels: ["email", "line"]?;
  };
  
  schedule?: string;         // ISO timestamp for scheduled send
}
```

**Response (200 OK):**
```typescript
{
  success: true;
  scheduled: boolean;
  recipients: number;
  estimatedDelivery: string;
}
```

---

## Error Handling

### Standard Error Response
```typescript
{
  error: {
    code: string;            // "VALIDATION_ERROR"
    message: string;         // Human-readable message
    details?: any;           // Additional error details
    timestamp: string;       // ISO timestamp
  };
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Invalid or expired token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `PAYMENT_REQUIRED` - Payment needed for action
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVER_ERROR` - Internal server error

---

## Rate Limiting

| Endpoint Category | Limit | Window |
|------------------|-------|---------|
| Authentication | 5 | 15 minutes |
| Registration | 5 | 5 minutes |
| Payment | 5 | 5 minutes |
| Results | 10 | 1 minute |
| General API | 60 | 1 minute |
| Admin API | 100 | 1 minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1641024000
```

---

## Security

### Authentication
- JWT tokens with 24-hour expiration
- Refresh tokens with 7-day expiration
- Secure httpOnly cookies for web
- Bearer tokens for mobile

### HTTPS/TLS
- TLS 1.2+ required
- HSTS enabled
- Certificate pinning for mobile apps

### Input Validation
- Request body size limit: 10MB
- File upload limit: 50MB (admin only)
- SQL injection prevention via Prisma ORM
- XSS prevention via input sanitization

### Payment Security
- PCI DSS compliance via Stripe
- No card data stored on servers
- Webhook signature validation
- Idempotency keys for retries

---

## Versioning

**Current Version:** v1.0.0  
**Deprecation Policy:** 6 months notice  
**Version Header:** `X-API-Version: 1.0.0`

### Changelog
- `v1.0.0` - Initial Freemium API release (2025-01-10)

---

## SDK & Examples

### JavaScript/TypeScript
```typescript
import { TBATClient } from '@tbat/sdk';

const client = new TBATClient({
  apiKey: process.env.TBAT_API_KEY,
  environment: 'production'
});

// Register new user
const registration = await client.auth.register({
  email: 'student@example.com',
  password: 'SecurePass123',
  name: 'สมชาย ใจดี',
  school: 'โรงเรียนเชียงใหม่',
  grade: 'M6',
  lineId: 'somchai_123',
  tier: 'FREE',
  subjects: ['Physics']
});

console.log('Exam Ticket:', registration.examTicket);
```

### cURL Examples
```bash
# Register FREE tier
curl -X POST https://api.tbat.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123",
    "name": "สมชาย ใจดี",
    "school": "โรงเรียนเชียงใหม่",
    "grade": "M6",
    "lineId": "somchai_123",
    "tier": "FREE",
    "subjects": ["Physics"]
  }'

# Get results
curl -X GET https://api.tbat.com/api/results/TBAT-2025-0001 \
  -H "Authorization: Bearer <token>"
```

---

## Support

**Documentation:** https://docs.tbat.com  
**Status Page:** https://status.tbat.com  
**Support Email:** api-support@tbat.com  
**Developer Discord:** https://discord.gg/tbat-dev