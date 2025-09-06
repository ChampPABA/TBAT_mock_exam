# User Flows

### Flow 1: Registration & Free Package Selection

**User Goal:** Complete exam registration and receive exam code

**Entry Points:** Landing page CTA, direct URL, social media links

**Success Criteria:** User receives valid exam code and adds mandatory LINE Official Account

```mermaid
graph TD
    A[Landing Page] --> B[Click ลงทะเบียน]
    B --> C[Step 1: Personal Info Form]
    C --> D{Form Valid?}
    D -->|No| E[Show inline errors]
    E --> C
    D -->|Yes| F[Step 2: Subject Selection]
    F --> G{Subject Selected?}
    G -->|No| H[Show error message]
    H --> F
    G -->|Yes| I[Step 3: Confirmation]
    I --> J{Accept Terms?}
    J -->|No| K[Show checkbox error]
    K --> I
    J -->|Yes| L[Submit Registration]
    L --> M[Generate Exam Code]
    M --> N[Show Success + LINE QR]
    N --> O[Mandatory LINE Add]
    O --> P[Email Confirmation Sent]
```

**Edge Cases & Error Handling:**
- Duplicate email registration: "อีเมลนี้ถูกใช้แล้ว กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบ"
- Free quota full: Redirect to Advanced payment, show "Free Package เต็มแล้ว"
- Network timeout during submission: Retry mechanism with clear feedback
- Invalid phone format: Real-time validation with Thai format (08X-XXX-XXXX)
- Missing LINE ID: Hard validation error - cannot proceed

**Notes:** LINE ID is mandatory for receiving exam updates and results notifications

### Flow 2: Advanced Package Payment

**User Goal:** Upgrade to Advanced package for full 3-subject access and detailed analytics

**Entry Points:** Registration upsell, dashboard upgrade CTA, enrollment limitations

**Success Criteria:** Successful payment and immediate access to Advanced features

```mermaid
graph TD
    A[Upgrade Trigger] --> B{User Context}
    B -->|Registration| C[Upsell during subject selection]
    B -->|Dashboard| D[Upgrade CTA button]
    B -->|Quota| E[Free full redirect]
    
    C --> F[Advanced Package Info]
    D --> F
    E --> F
    
    F --> G[Click อัปเกรด 690 บาท]
    G --> H[Redirect to Stripe Checkout]
    H --> I{Payment Result}
    I -->|Success| J[Payment Success Page]
    I -->|Failed| K[Payment Failed Page]
    
    J --> L[Update User Status]
    L --> M[Advanced Dashboard Access]
    L --> N[Email Confirmation]
    
    K --> O[Retry Payment Option]
    O --> H
    K --> P[Contact Support]
```

**Edge Cases & Error Handling:**
- Payment timeout: Clear retry mechanism with preserved cart
- Card declined: Helpful error messages in Thai
- Network issues during payment: Payment status verification system
- Duplicate payment: Automatic refund detection
- Stripe webhook failures: Manual verification fallback

**Notes:** All payments redirect to Stripe Checkout - no custom payment UI in platform

### Flow 3: Results Viewing (Login-Based)

**User Goal:** Access exam results and performance analytics

**Entry Points:** Email notification, dashboard link, direct URL

**Success Criteria:** View appropriate results level based on package type

```mermaid
graph TD
    A[Results Access] --> B[Unified Login Page]
    B --> C{Login Valid?}
    C -->|No| D[Show login error]
    D --> B
    C -->|Yes| E{User Package Type}
    
    E -->|Free| F[Basic Results Display]
    E -->|Advanced| G[Detailed Analytics]
    
    F --> H[Score Overview]
    H --> I[Percentile Ranking]
    I --> J[Premium Preview (Blurred)]
    J --> K[Post-Exam Upgrade CTA]
    K --> L[Stripe Checkout 290 บาท]
    
    G --> M[Full Analytics Dashboard]
    M --> N[Subject Breakdowns]
    N --> O[Box Plot Comparisons]
    O --> P[Study Recommendations]
    P --> Q[PDF Solution Download]
    
    J --> R[PDF Preview (Free Users)]
    R --> S[290 THB Upgrade CTA]
    S --> T[Stripe Checkout]
    T --> U[PDF Access Granted]
```

**Edge Cases & Error Handling:**
- Results not ready: "ผลสอบจะประกาศภายใน 7 วัน"
- Login after exam period: Normal login flow, no exam codes
- Forgotten login credentials: Password reset via email/LINE
- Premium preview loading errors: Graceful degradation

**Notes:** No exam code input required - login-based access only

### Flow 4: Post-Exam Upgrade (290 บาท)

**User Goal:** Upgrade to view detailed analytics after taking free exam

**Entry Points:** Premium preview blur overlay, results dashboard CTA

**Success Criteria:** Access full analytics within 7-day upgrade window

```mermaid
graph TD
    A[Premium Preview] --> B[อัปเกรดเพียง 290 บาท CTA]
    B --> C{Within 7 Days?}
    C -->|No| D[Show expired message]
    C -->|Yes| E[Stripe Checkout 290 บาท]
    
    E --> F{Payment Success?}
    F -->|Yes| G[Immediate Analytics Access]
    F -->|No| H[Payment Error Handling]
    
    G --> I[Remove Blur Effects]
    I --> J[Full Dashboard Access]
    J --> K[Email Confirmation]
    
    H --> L[Retry Payment]
    L --> E
    H --> M[Contact Support]
```

**Edge Cases & Error Handling:**
- Expired upgrade window: Clear messaging about timeframe
- Already upgraded user: Skip payment, direct to analytics
- Payment processing delays: Status checking mechanism

### Flow 5: Admin Enrollment Management

**User Goal:** Monitor and manage exam enrollment quotas in real-time

**Entry Points:** Admin login, enrollment alerts, scheduled monitoring

**Success Criteria:** Maintain optimal enrollment distribution without exposing Free quota numbers to users

```mermaid
graph TD
    A[Admin Dashboard] --> B[Enrollment Overview]
    B --> C{Enrollment Status}
    C -->|Normal| D[Monitoring Mode]
    C -->|Near Limit| E[Alert Mode]
    C -->|At Limit| F[Management Mode]
    
    E --> G[Promote Advanced Package]
    F --> H[Restrict Free Registration]
    H --> I[Advanced Only Mode]
    
    D --> J[Status Reports]
    G --> J
    I --> J
    
    J --> K[Enrollment Analytics]
    K --> L[Revenue Optimization]
```

**Edge Cases & Error Handling:**
- System overload during peak registration: Queue management system
- Real-time sync failures: Manual override controls available
- Revenue optimization vs enrollment balancing: Configurable alert thresholds

**Notes:** Critical business rule - Free quota numbers must never be displayed to end users

### Flow 6: Unified Login with Role-Based Redirects

**User Goal:** Single login system that routes users appropriately based on role

**Entry Points:** Login button, protected page access, session expiry

**Success Criteria:** Correct dashboard access based on user role

```mermaid
graph TD
    A[Login Form] --> B{Credentials Valid?}
    B -->|No| C[Show login error + shake animation]
    C --> A
    B -->|Yes| D{User Role Check}
    
    D -->|Student + Free| E[Free Dashboard]
    D -->|Student + Advanced| F[Advanced Dashboard]
    D -->|Admin| G[Admin Panel]
    
    E --> H[Basic Features]
    F --> I[Full Features]
    G --> J[Management Tools]
```

**Edge Cases & Error Handling:**
- Role change during session: Force re-login
- Concurrent admin sessions: Session management
- Password reset: Email/LINE verification

**Notes:** Single login form serves all user types - role determined after authentication

### Flow 7: PDF Solution Access & Download

**User Goal:** Access and download exam solution PDFs based on package type

**Entry Points:** Results dashboard, email notification, direct PDF link

**Success Criteria:** Appropriate PDF access with upgrade conversion for Free users

```mermaid
graph TD
    A[PDF Access Request] --> B{User Package Type}
    B -->|Advanced| C[Direct PDF Download]
    B -->|Free| D[PDF Preview Modal]
    
    C --> E[Download Progress]
    E --> F[Success Confirmation]
    E --> G[Download Failed - Retry]
    
    D --> H[Show First Page]
    H --> I[Blur Remaining Content]
    I --> J[290 THB Upgrade CTA]
    J --> K{Within 6-Month Window?}
    K -->|No| L[Expired Access Message]
    K -->|Yes| M[Stripe Checkout 290 บาท]
    M --> N[Payment Success]
    N --> C
```

**Edge Cases & Error Handling:**
- PDF corruption: Fallback download with admin notification
- Mobile PDF viewing: Progressive loading with scroll optimization
- Download interruption: Resume capability with progress persistence
- Expired access: Clear messaging with contact support option
- Concurrent downloads: Rate limiting with queue management

**Notes:** PDF access tied to 6-month data lifecycle policy

### Flow 8: Data Lifecycle & Expiry Management

**User Goal:** Understand and manage data accessibility within 6-month window

**Entry Points:** Login after extended period, countdown notifications, data export requests

**Success Criteria:** Clear awareness of expiry timeline with export options before access loss

```mermaid
graph TD
    A[User Login] --> B{Data Age Check}
    B -->|< 5 months| C[Normal Access + Countdown]
    B -->|5-6 months| D[Warning Phase]
    B -->|> 6 months| E[Expired Access]
    
    C --> F[Subtle Expiry Indicator]
    F --> G[Normal Dashboard Experience]
    
    D --> H[Prominent Warning Banner]
    H --> I[Data Export Options]
    I --> J[Screenshot/Save Prompts]
    J --> K[Contact Information]
    
    E --> L[Graceful Expiry Message]
    L --> M[Historical Data Notice]
    M --> N[Support Contact CTA]
```

**Edge Cases & Error Handling:**
- Timezone considerations: Server-side expiry calculation
- Grace period requests: Admin manual extension capability
- Data export failures: Multiple format options (PDF, Excel, images)
- Legal compliance: PDPA right to erasure vs business needs

**Notes:** Progressive disclosure of urgency - subtle to prominent warnings

### Flow 9: Enhanced Admin PDF & User Management

**User Goal:** Efficiently manage PDF solutions and handle user support issues

**Entry Points:** Admin dashboard, support ticket escalation, exam day operations

**Success Criteria:** Quick resolution of user issues with full audit trail

```mermaid
graph TD
    A[Admin Dashboard] --> B{Operation Type}
    B -->|PDF Management| C[PDF Upload Center]
    B -->|User Issues| D[User Management]
    B -->|Emergency| E[Crisis Tools]
    
    C --> F[Drag-Drop Upload]
    F --> G[Metadata Form]
    G --> H[Bulk User Notification]
    H --> I[Upload Confirmation]
    
    D --> J[User Search/Filter]
    J --> K[Profile Edit Interface]
    K --> L[Exam Code Regeneration]
    L --> M[Audit Log Entry]
    
    E --> N[Quick Code Regen]
    E --> O[Bulk Status Updates]
    E --> P[Emergency Communications]
```

**Edge Cases & Error Handling:**
- PDF upload failures: Chunked upload with resume capability
- Concurrent admin sessions: Lock management for user edits
- Bulk operation failures: Partial success handling with rollback
- Exam day crisis: Mobile-optimized emergency tools

**Notes:** All admin actions logged for compliance and debugging
