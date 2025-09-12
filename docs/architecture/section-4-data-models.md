# Section 4: Data Models

### Core Data Models

The data models support the hybrid offline/online exam system with **frontend-first development strategy**. Epic 1 utilizes mock data while maintaining production database readiness for Epic 2+ integration. Enhanced PDF management and 6-month data lifecycle policy as defined in PRD v1.2.

#### User Management

```typescript
interface User {
  id: string; // UUID primary key
  email: string; // Unique identifier
  password_hash: string; // Hashed password (8+ chars, letters+numbers)
  thai_name: string; // Thai display name
  phone: string; // Contact number
  school: string; // High school name
  line_id?: string; // Optional LINE contact (FR21-FR24 update)
  package_type: "FREE" | "ADVANCED"; // Current package level
  is_upgraded: boolean; // Track upgrade status
  pdpa_consent: boolean; // GDPR compliance
  created_at: Date;
  updated_at: Date;
}

interface UserSession {
  id: string;
  user_id: string; // Foreign key to User
  session_token: string; // NextAuth.js session
  expires_at: Date; // 7-day expiry
  created_at: Date;
}
```

#### Exam Registration & Codes

```typescript
interface ExamCode {
  id: string;
  user_id: string; // Foreign key to User
  code: string; // FREE-[8CHAR]-[SUBJECT] or ADV-[8CHAR]
  package_type: "FREE" | "ADVANCED";
  subject: "BIOLOGY" | "CHEMISTRY" | "PHYSICS";
  session_time: "09:00-12:00" | "13:00-16:00";
  is_used: boolean; // Track exam completion
  created_at: Date;
  used_at?: Date;
}

interface SessionCapacity {
  id: string;
  session_time: "09:00-12:00" | "13:00-16:00";
  current_count: number;
  max_capacity: number; // 300 exam participants per session (system serves 20 concurrent users)
  exam_date: Date; // 27 กันยายน 2568
  created_at: Date;
  updated_at: Date;
}
```

#### Payment Processing

```typescript
interface Payment {
  id: string;
  user_id: string; // Foreign key to User
  stripe_payment_intent_id: string;
  amount: number; // 690 THB (Advanced) or 290 THB (Upgrade)
  currency: "thb"; // Thai Baht only
  payment_type: "ADVANCED_PACKAGE" | "POST_EXAM_UPGRADE";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  completed_at?: Date;
  created_at: Date;
}
```

#### Results & Analytics

```typescript
interface ExamResult {
  id: string;
  user_id: string; // Foreign key to User
  exam_code: string; // Foreign key to ExamCode
  total_score: number; // Overall exam score
  subject_scores: {
    // Detailed breakdown
    biology?: number;
    chemistry?: number;
    physics?: number;
  };
  percentile?: number; // Advanced package only
  completion_time: number; // Minutes taken
  expires_at: Date; // 6-month expiry (FR22)
  is_accessible: boolean; // Data lifecycle control
  created_at: Date;
}

interface Analytics {
  id: string;
  result_id: string; // Foreign key to ExamResult
  user_id: string; // Foreign key to User
  subject_breakdowns: JSON; // Detailed analytics (Advanced only)
  recommendations: JSON; // Study suggestions (Advanced only)
  comparison_data: JSON; // Percentile comparisons (Advanced only)
  generated_at: Date;
}
```

#### PDF Solution Management (FR21-FR24)

```typescript
interface PDFSolution {
  id: string;
  subject: "BIOLOGY" | "CHEMISTRY" | "PHYSICS";
  exam_date: Date; // 27 กันยายน 2568
  file_url: string; // Vercel Blob Storage URL
  file_size: number; // Bytes
  description: string; // Thai description
  upload_admin_id: string; // Admin who uploaded
  is_active: boolean; // Availability control
  expires_at: Date; // 6-month data lifecycle
  created_at: Date;
}

interface PDFDownload {
  id: string;
  pdf_id: string; // Foreign key to PDFSolution
  user_id: string; // Foreign key to User
  download_token: string; // Secure download link
  downloaded_at: Date;
  expires_at: Date; // Token expiry (24 hours)
}

interface PDFNotification {
  id: string;
  pdf_id: string; // Foreign key to PDFSolution
  sent_to_user_ids: string[]; // Advanced users notified
  email_count: number; // Successful notifications
  failed_count: number; // Failed deliveries
  sent_at: Date;
}
```

#### Enhanced Admin Operations (FR24)

```typescript
interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  thai_name: string;
  role: "ADMIN" | "SUPER_ADMIN";
  permissions: string[]; // CRUD permissions
  created_at: Date;
  updated_at: Date;
}

interface AuditLog {
  id: string;
  admin_id: string; // Who performed action
  action_type: "USER_UPDATE" | "CODE_REGEN" | "PDF_UPLOAD" | "CRISIS_RESOLUTION";
  target_id: string; // User/Resource affected
  original_data: JSON; // Before state
  new_data: JSON; // After state
  reason: string; // Admin notes
  created_at: Date;
}

interface SupportTicket {
  id: string;
  user_id: string; // Affected user
  admin_id: string; // Handling admin
  issue_type: "CODE_PROBLEM" | "PAYMENT_ISSUE" | "RESULT_ERROR" | "PDF_ACCESS";
  description: string; // Thai description
  resolution: string; // Admin solution
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  created_at: Date;
  resolved_at?: Date;
}
```

### Data Lifecycle Management (FR22)

**6-Month Expiry Policy:**

- **ExamResult.expires_at:** Set to `created_at + 6 months`
- **PDFSolution.expires_at:** Set to `upload_date + 6 months`
- **Automated Cleanup:** Daily cron job marks `is_accessible = false`
- **User Warning System:** Progressive notifications at 30, 7, 1 day before expiry

**Data Retention Strategy:**

- **Soft Delete:** Data marked inaccessible, not physically deleted
- **Analytics Preservation:** Anonymized data retained for platform improvement

---

## Change Log

| Date       | Version | Description                                                                                                     | Author   |
| ---------- | ------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| 2025-09-11 | 1.1     | Clarified SessionCapacity max_capacity comment: 300 exam participants per session vs 20 concurrent system users | PO Sarah |
| 2025-09-12 | 1.2     | Added frontend-first development strategy: Epic 1 mock data, Epic 2+ database integration                       | PO Sarah |

- **Emergency Extension:** Admin override capability for special circumstances

### Database Relationships

**Primary Relationships:**

- User → ExamCode (1:many) - Users can have multiple exam codes
- User → ExamResult (1:many) - Users can have results from multiple subjects
- User → Payment (1:many) - Users can make multiple purchases
- ExamResult → Analytics (1:1) - Each result has corresponding analytics
- PDFSolution → PDFDownload (1:many) - PDFs downloaded by multiple users
- AdminUser → AuditLog (1:many) - Admins generate multiple audit entries

**Business Logic Constraints:**

- Free users: Maximum 1 ExamCode per registration
- Advanced users: 3 ExamCodes (one per subject)
- PDF access: Advanced package required
- Data expiry: Enforced at application level with database triggers

This data model supports the complete TBAT Mock Exam Platform functionality with enhanced PDF management, comprehensive admin capabilities, and robust data lifecycle management while maintaining high performance and data integrity for exam-critical operations.
