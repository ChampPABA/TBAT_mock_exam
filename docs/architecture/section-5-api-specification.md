# Section 5: API Specification

The TBAT Mock Exam Platform implements a REST API using Next.js API routes with tRPC for type safety. The API supports the hybrid offline-exam + online-analytics model with enhanced PDF management and admin capabilities.

### API Architecture

**Style:** REST API with tRPC type safety layer
**Authentication:** NextAuth.js with session-based authentication  
**Rate Limiting:** Vercel Edge Config for API protection
**Error Handling:** Standardized error responses with Thai language support

### Core API Endpoints

#### Authentication & User Management

```yaml
# User Registration
POST /api/auth/register
Body: { email, password, thai_name, phone, school, line_id?, pdpa_consent }
Response: { user_id, session_token }

# User Login
POST /api/auth/login  
Body: { email, password }
Response: { user_id, session_token, package_type }

# User Profile Management
GET /api/user/profile
Response: { user_data, package_type, upgrade_status }

PUT /api/user/profile
Body: { thai_name?, phone?, school?, line_id? }
Response: { updated_user_data }
```

#### Exam Registration & Code Generation

```yaml
# Package Selection & Registration
POST /api/exam/register
Body: { package_type: "FREE" | "ADVANCED", session_time, subjects[] }
Response: { exam_codes[], payment_intent_id?, total_amount? }

# Exam Code Validation
GET /api/exam/validate/{code}
Response: { valid, user_id, subject, package_type }

# Session Capacity Check
GET /api/exam/sessions
Response: { sessions: [{ time, available_spots, total_capacity }] }
```

#### Payment Processing (Stripe Thailand)

```yaml
# Create Payment Intent
POST /api/payment/create
Body: { package_type: "ADVANCED" | "UPGRADE", amount: 690 | 290 }
Response: { payment_intent_id, client_secret }

# Confirm Payment
POST /api/payment/confirm
Body: { payment_intent_id, user_id }
Response: { payment_status, upgraded_package_type }

# Payment Webhook (Stripe)
POST /api/webhook/stripe
Body: { stripe_event_data }
Response: { received: true }
```

#### Results & Analytics

```yaml
# Submit Exam Results
POST /api/results/submit
Body: { exam_code, total_score, subject_scores[], completion_time }
Response: { result_id, expires_at }

# Get User Results
GET /api/results/user
Response: { results: [{ id, total_score, subjects, created_at, expires_at, is_accessible }] }

# Get Analytics (Advanced Only)
GET /api/analytics/detailed/{result_id}
Response: { percentile, subject_breakdowns, recommendations, study_suggestions }
```

#### PDF Solution Management (FR21-FR24)

```yaml
# PDF Solution Upload (Admin Only)
POST /api/admin/pdf/upload
Body: { file: PDF, subject, exam_date, description }
Response: { pdf_id, url, upload_status }

# Get Available PDFs
GET /api/pdf/available
Response: { pdfs: [{ id, subject, description, upload_date, requires_advanced }] }

# PDF Download (Advanced Users Only)
GET /api/pdf/download/{pdf_id}
Headers: { Authorization: "Bearer {session_token}" }
Response: { pdf_url, download_token } | { error: "UPGRADE_REQUIRED" }

# PDF Preview (Free Users)
GET /api/pdf/preview/{pdf_id}
Response: { preview_pages: [page1_thumbnail, page2_thumbnail], upgrade_cta }

# Notify Advanced Users (Admin Trigger)
POST /api/admin/notify/pdf-ready
Body: { pdf_id, subject }
Response: { notifications_sent: number, failed: number }
```

#### Data Lifecycle Management (FR22)

```yaml
# Check Data Expiry Status
GET /api/user/expiry-status
Response: { 
  results: [{ id, expires_at, days_remaining, is_accessible }],
  urgent_expiry: boolean,
  warning_level: "none" | "notice" | "urgent" 
}

# Extend Data Access (Future Enhancement)
POST /api/user/extend-access
Body: { result_id, extension_period }
Response: { new_expiry_date, cost }
```

#### Enhanced Admin Operations (FR24)

```yaml
# Admin User Management
GET /api/admin/users
Query: { search?, package_type?, page?, limit? }
Response: { users: [], total, pagination }

POST /api/admin/users/{user_id}/update
Body: { thai_name?, email?, phone?, school?, package_type? }
Response: { updated_user, audit_log }

# Emergency Code Regeneration
POST /api/admin/exam-code/regenerate
Body: { user_id, reason, original_code }
Response: { new_codes[], invalidated_codes[], audit_log }

# Crisis Management
POST /api/admin/crisis/user-support
Body: { user_id, issue_type, resolution, notes }
Response: { ticket_id, resolution_status }

# Admin Dashboard Analytics
GET /api/admin/dashboard
Response: { 
  user_stats, registration_trends, payment_metrics, 
  pdf_download_stats, upcoming_expirations, system_alerts 
}
```

### API Security & Performance

#### Authentication Flow
1. NextAuth.js session management with 7-day expiry
2. API route middleware validates session tokens
3. Role-based access control (user, admin)
4. Rate limiting: 100 requests/minute per user

#### Error Response Format
```typescript
interface ApiError {
  error: string;           // Error code (EN)
  message: string;         // User message (TH)
  details?: any;           // Debug info (dev only)
  timestamp: string;
  request_id: string;
}
```

#### Performance Optimizations
- **Caching:** Vercel Edge Config for session capacity
- **CDN:** Vercel Edge Network for PDF delivery
- **Database:** Connection pooling with Prisma
- **Monitoring:** Built-in Vercel Analytics

### API Versioning Strategy

**Current:** `/api/v1/*` (implicit in route structure)
**Future:** `/api/v2/*` when breaking changes needed
**Deprecation:** 6-month notice for version sunset

This API specification supports the complete TBAT Mock Exam Platform functionality with enhanced PDF management, data lifecycle controls, and comprehensive admin capabilities while maintaining high performance for 20 concurrent users during peak periods.
