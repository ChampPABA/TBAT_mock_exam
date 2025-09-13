# Section 8: Security

The TBAT Mock Exam Platform implements comprehensive security measures to protect student data, ensure exam integrity, and comply with Thai PDPA regulations. Security is designed for the educational context with exam-critical reliability requirements.

### Authentication & Authorization

#### Authentication Strategy

**Simple Registration Flow:** Registration → Welcome Email with Exam Codes → Complete (no email verification required per PRD FR1)

```typescript
// NextAuth.js Configuration for Thai Market
const authConfig = {
  providers: [
    CredentialsProvider({
      name: "email-password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Password requirements: 8+ chars, letters + numbers
        // No email verification required - immediate access upon registration
        const user = await validateUserCredentials(credentials);
        return user
          ? {
              id: user.id,
              email: user.email,
              thai_name: user.thai_name,
              package_type: user.package_type,
            }
          : null;
      },
    }),
  ],
  session: {
    strategy: "jwt", // Serverless-friendly
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
};
```

#### Password Security

```typescript
interface PasswordPolicy {
  minLength: 8;
  requireNumbers: true;
  requireLetters: true;
  requireSpecialChars: false; // Simplified for Thai users
  maxAttempts: 5; // Account lockout
  lockoutDuration: 30 * 60 * 1000; // 30 minutes
}

// Password hashing with bcrypt
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // High security for exam data
  return await bcrypt.hash(password, saltRounds);
}
```

#### Role-Based Access Control

```typescript
enum UserRole {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

interface AccessControl {
  STUDENT: {
    routes: ["/dashboard", "/results", "/profile", "/pdf/preview"];
    api: ["/api/user/*", "/api/results/user", "/api/pdf/preview/*"];
    restrictions: ["no_admin_routes", "package_based_pdf_access"];
  };
  ADMIN: {
    routes: ["/admin/dashboard", "/admin/users", "/admin/pdf-upload"];
    api: ["/api/admin/*", "/api/users/*", "/api/pdf/upload"];
    restrictions: ["no_super_admin_functions"];
  };
  SUPER_ADMIN: {
    routes: ["/*"]; // Full access
    api: ["/api/*"];
    restrictions: [];
  };
}
```

#### API Route Protection

```typescript
// Middleware for API authentication
export async function authMiddleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบ" },
      { status: 401 }
    );
  }

  // Add user context to request
  req.user = {
    id: token.sub,
    email: token.email,
    role: token.role,
    package_type: token.package_type,
  };

  return NextResponse.next();
}

// Route-specific authorization
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new UnauthorizedError("ไม่มีสิทธิ์เข้าถึงส่วนนี้");
    }
  };
}
```

### Data Protection & Privacy

#### PDPA Compliance (Thai Personal Data Protection Act)

```typescript
interface PDPACompliance {
  consentManagement: {
    required: true;
    granular: true; // Separate consent for marketing, analytics
    withdrawable: true;
    recordKeeping: true;
  };
  dataMinimization: {
    collectOnlyNecessary: true;
    purposeLimitation: true;
    storageMinimization: "6_months_max";
  };
  userRights: {
    dataAccess: true; // ขอดูข้อมูลส่วนบุคคล
    dataPortability: true; // ขอรับโอนข้อมูล
    dataDeletion: true; // ขอลบข้อมูล
    dataCorrection: true; // ขอแก้ไขข้อมูล
  };
}
```

#### Personal Data Handling

```typescript
// Data classification for PDPA compliance
interface PersonalDataClass {
  SENSITIVE: {
    data: ["payment_details", "exam_scores"];
    protection: "MAXIMUM";
    retention: "6_months";
    access: "USER_ONLY";
  };
  PERSONAL: {
    data: ["thai_name", "email", "phone", "school"];
    protection: "HIGH";
    retention: "6_months";
    access: "USER_AND_ADMIN";
  };
  OPERATIONAL: {
    data: ["exam_codes", "session_times"];
    protection: "STANDARD";
    retention: "6_months";
    access: "SYSTEM_ADMIN";
  };
}

// Data anonymization for analytics
async function anonymizeUserData(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: `anonymous_${generateHash(userId)}@deleted.local`,
      thai_name: "ข้อมูลถูกลบ",
      phone: "DELETED",
      school: "DELETED",
      line_id: null,
    },
  });
}
```

#### Data Encryption

```typescript
// Encryption for sensitive data at rest
interface EncryptionStrategy {
  database: {
    encryption: "AES-256";
    keyRotation: "quarterly";
    backupEncryption: true;
  };
  files: {
    pdfStorage: "Vercel Blob with encryption";
    keyManagement: "Vercel KMS";
  };
  transit: {
    tls: "1.3_minimum";
    hsts: true;
    certificatePinning: true;
  };
}

// Field-level encryption for exam codes
async function encryptExamCode(code: string): Promise<string> {
  const key = process.env.EXAM_CODE_ENCRYPTION_KEY;
  return encrypt(code, key);
}

async function decryptExamCode(encryptedCode: string): Promise<string> {
  const key = process.env.EXAM_CODE_ENCRYPTION_KEY;
  return decrypt(encryptedCode, key);
}
```

### Input Validation & Sanitization

#### Form Input Security

```typescript
// Zod schemas for type-safe validation
const RegistrationSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(/[A-Za-z]/, "รหัสผ่านต้องมีตัวอักษร")
    .regex(/[0-9]/, "รหัสผ่านต้องมีตัวเลข"),
  thai_name: z
    .string()
    .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร"),
  phone: z.string().regex(/^[0-9]{10}$/, "เบอร์โทรต้องเป็นตัวเลข 10 หลัก"),
  school: z.string().min(2, "ชื่อโรงเรียนต้องมีอย่างน้อย 2 ตัวอักษร"),
  line_id: z.string().optional(),
  pdpa_consent: z.boolean().refine((val) => val === true, "ต้องยอมรับเงื่อนไข PDPA"),
});

// SQL injection prevention (automatic with Prisma)
// XSS prevention
function sanitizeUserInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [],
  });
}
```

#### API Input Validation

```typescript
// Rate limiting for API endpoints
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "คำขอเกินกำหนด กรุณาลองใหม่ในภายหลัง",
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload security (PDF solutions)
const fileUploadValidation = {
  allowedTypes: ["application/pdf"],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  virusScanning: true, // Vercel Blob built-in
  sanitizeFilename: true,
};
```

### Security Monitoring & Incident Response

#### Security Event Logging

```typescript
interface SecurityEvent {
  AUTHENTICATION_FAILURE: {
    event: "auth_failed";
    metadata: { email: string; ip: string; timestamp: Date };
    severity: "MEDIUM";
    action: "log_and_monitor";
  };
  MULTIPLE_LOGIN_ATTEMPTS: {
    event: "brute_force_detected";
    metadata: { email: string; attempts: number; timeWindow: string };
    severity: "HIGH";
    action: "account_lockout";
  };
  ADMIN_DATA_ACCESS: {
    event: "admin_user_access";
    metadata: { admin_id: string; target_user: string; action: string };
    severity: "INFO";
    action: "audit_log";
  };
  PDF_UNAUTHORIZED_ACCESS: {
    event: "pdf_access_denied";
    metadata: { user_id: string; pdf_id: string; package_type: string };
    severity: "MEDIUM";
    action: "log_and_alert";
  };
}
```

#### Incident Response Plan

```typescript
interface IncidentResponse {
  SEVERITY_1: {
    // Data breach, payment system down
    responseTime: "30_minutes";
    escalation: ["technical_lead", "project_manager", "legal_team"];
    communication: "immediate_user_notification";
    actions: ["system_lockdown", "forensic_analysis", "pdpa_notification"];
  };
  SEVERITY_2: {
    // Account compromised, PDF leak
    responseTime: "2_hours";
    escalation: ["technical_lead", "project_manager"];
    communication: "affected_user_notification";
    actions: ["password_reset", "audit_investigation", "security_patch"];
  };
  SEVERITY_3: {
    // Failed login attempts, minor data exposure
    responseTime: "24_hours";
    escalation: ["technical_lead"];
    communication: "internal_monitoring";
    actions: ["log_analysis", "security_review"];
  };
}
```

### Exam Integrity Security

#### Anti-Cheating Measures

```typescript
interface ExamIntegrity {
  codeUniqueness: {
    algorithm: "cryptographically_secure_random";
    pattern: "FREE-[8CHAR]-[SUBJECT] | ADV-[8CHAR]";
    collision_check: true;
    audit_trail: true;
  };
  sessionControl: {
    time_validation: true;
    capacity_enforcement: true;
    duplicate_prevention: true;
  };
  resultIntegrity: {
    timestamp_validation: true;
    score_bounds_checking: true;
    submission_deduplication: true;
  };
}

// Exam code generation with integrity checks
async function generateSecureExamCode(
  packageType: PackageType,
  subject?: Subject
): Promise<string> {
  let code: string;
  let isUnique = false;

  do {
    const randomPart = generateCryptoSecureRandom(8);
    code = packageType === "FREE" ? `FREE-${randomPart}-${subject}` : `ADV-${randomPart}`;

    isUnique = await checkCodeUniqueness(code);
  } while (!isUnique);

  // Log code generation for audit
  await auditLogger.logCodeGeneration({
    code,
    packageType,
    subject,
    generatedAt: new Date(),
    userId: getCurrentUser().id,
  });

  return code;
}
```

### Compliance & Audit

#### Audit Trail Requirements

```typescript
interface AuditTrail {
  userDataChanges: {
    who: "admin_id | system";
    what: "field_changes_json";
    when: "timestamp";
    why: "reason_string";
    where: "ip_address";
  };
  paymentTransactions: {
    user_id: string;
    amount: number;
    stripe_intent_id: string;
    status_changes: PaymentStatusChange[];
    admin_actions?: AdminPaymentAction[];
  };
  pdfAccess: {
    user_id: string;
    pdf_id: string;
    action: "view" | "download" | "denied";
    timestamp: Date;
    package_type: PackageType;
  };
  adminActions: {
    admin_id: string;
    target_entity: "user" | "pdf" | "system";
    action: string;
    justification: string;
    approval_required: boolean;
  };
}
```

#### Compliance Reporting

```typescript
// Automated compliance reporting for PDPA
async function generatePDPAComplianceReport(): Promise<ComplianceReport> {
  return {
    dataSubjects: await getUserCount(),
    consentStatus: await getConsentStatistics(),
    dataRetention: await getRetentionCompliance(),
    userRights: await getUserRightsExercised(),
    breaches: await getSecurityIncidents(),
    dataTransfers: await getExternalDataSharing(),
    generatedAt: new Date(),
    period: "monthly",
  };
}
```

### Security Development Lifecycle

#### Secure Coding Practices

```typescript
// Security checklist for development
interface SecurityChecklist {
  authentication: ["✓ NextAuth.js implementation", "✓ Session management", "✓ Password policy"];
  authorization: ["✓ Role-based access", "✓ API route protection", "✓ Resource ownership"];
  dataProtection: ["✓ PDPA compliance", "✓ Encryption at rest", "✓ Secure transit"];
  inputValidation: ["✓ Zod schemas", "✓ SQL injection prevention", "✓ XSS protection"];
  monitoring: ["✓ Security logging", "✓ Incident response", "✓ Audit trails"];
  compliance: ["✓ Thai regulations", "✓ Educational standards", "✓ Exam integrity"];
}
```

This comprehensive security framework ensures the TBAT Mock Exam Platform meets the highest standards for protecting student data, maintaining exam integrity, and complying with Thai data protection regulations while supporting the educational mission of the platform.
