# Section 6: Components

The TBAT Mock Exam Platform is built using a component-based architecture with clear separation of concerns across frontend, backend, and data layers. Each component has well-defined interfaces and responsibilities.

### Frontend Components

#### Authentication Components
```typescript
// Core authentication interfaces
interface AuthProvider {
  login(credentials: LoginCredentials): Promise<UserSession>;
  register(userData: RegistrationData): Promise<UserSession>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
}

interface LoginForm {
  onSubmit: (credentials: LoginCredentials) => void;
  validation: FormValidation;
  isLoading: boolean;
}

interface RegistrationForm {
  onSubmit: (userData: RegistrationData) => void;
  packageSelection: PackageType;
  pdpaConsent: boolean;
}
```

#### Exam Management Components
```typescript
interface ExamRegistration {
  sessionSelection: SessionTime;
  packageSelection: PackageType;
  subjectSelection: Subject[];
  capacityCheck: (session: SessionTime) => Promise<boolean>;
  generateCodes: () => Promise<ExamCode[]>;
}

interface ExamCodeDisplay {
  codes: ExamCode[];
  copyToClipboard: (code: string) => void;
  printCodes: () => void;
  sessionDetails: SessionInfo;
}

interface ResultsViewer {
  results: ExamResult[];
  analytics?: Analytics; // Advanced only
  pdfAccess: boolean;
  expiryWarnings: ExpiryStatus[];
}
```

#### PDF Management Components (FR21-FR24)
```typescript
interface PDFViewer {
  pdfUrl: string;
  isPreviewOnly: boolean; // Free users
  downloadToken?: string; // Advanced users
  onUpgradeClick: () => void; // Freemium conversion
}

interface PDFDownloadManager {
  availablePDFs: PDFSolution[];
  userPackage: PackageType;
  downloadPDF: (pdfId: string) => Promise<DownloadResponse>;
  previewPDF: (pdfId: string) => Promise<PreviewResponse>;
}

interface UpgradePrompt {
  currentPackage: PackageType;
  upgradePrice: number; // 290 THB
  benefits: string[];
  onUpgrade: () => void;
}
```

#### Data Lifecycle Components (FR22)
```typescript
interface ExpiryManager {
  expiryStatus: ExpiryStatus[];
  warningLevel: 'none' | 'notice' | 'urgent';
  daysRemaining: number[];
  showExpiryWarning: (level: WarningLevel) => void;
}

interface DataAccessControl {
  checkAccess: (resultId: string) => boolean;
  markExpired: (resultId: string) => void;
  getAccessibleData: (userId: string) => AccessibleData[];
}
```

### Backend Components

#### API Layer Components
```typescript
interface APIRouter {
  authentication: AuthenticationRoutes;
  examManagement: ExamRoutes;
  paymentProcessing: PaymentRoutes;
  resultsAnalytics: ResultsRoutes;
  pdfManagement: PDFRoutes; // FR21-FR24
  adminOperations: AdminRoutes; // FR24
}

interface DatabaseConnection {
  prisma: PrismaClient;
  connectionPool: ConnectionPoolConfig;
  transactionManager: TransactionManager;
  queryOptimizer: QueryOptimizer;
}
```

#### Business Logic Components
```typescript
interface ExamCodeGenerator {
  generateFreeCode: (subject: Subject) => string; // FREE-[8CHAR]-[SUBJECT]
  generateAdvancedCode: () => string; // ADV-[8CHAR]
  validateCode: (code: string) => ValidationResult;
  checkUniqueness: (code: string) => Promise<boolean>;
}

interface PaymentProcessor {
  createPaymentIntent: (amount: number, type: PaymentType) => Promise<PaymentIntent>;
  confirmPayment: (intentId: string) => Promise<PaymentResult>;
  handleWebhook: (stripeEvent: StripeEvent) => Promise<void>;
  upgradeUser: (userId: string) => Promise<void>;
}

interface AnalyticsEngine {
  calculatePercentile: (score: number, subject: Subject) => number;
  generateRecommendations: (results: ExamResult[]) => StudyRecommendation[];
  createSubjectBreakdown: (scores: SubjectScores) => SubjectAnalysis[];
  comparePeerData: (userScore: number) => ComparisonData;
}
```

#### PDF Management Components (FR21-FR24)
```typescript
interface PDFStorageManager {
  uploadPDF: (file: File, metadata: PDFMetadata) => Promise<PDFSolution>;
  generateDownloadToken: (pdfId: string, userId: string) => Promise<string>;
  validateAccess: (userId: string, pdfId: string) => Promise<boolean>;
  cleanupExpiredPDFs: () => Promise<CleanupResult>;
}

interface NotificationService {
  notifyAdvancedUsers: (pdfId: string) => Promise<NotificationResult>;
  sendExpiryWarnings: (userIds: string[]) => Promise<void>;
  queueEmail: (email: EmailData) => Promise<void>;
}
```

#### Enhanced Admin Components (FR24)
```typescript
interface AdminUserManager {
  searchUsers: (criteria: SearchCriteria) => Promise<User[]>;
  updateUserData: (userId: string, updates: UserUpdates) => Promise<User>;
  regenerateExamCodes: (userId: string, reason: string) => Promise<ExamCode[]>;
  handleCrisisSupport: (ticket: SupportTicket) => Promise<Resolution>;
}

interface AdminDashboard {
  getUserStats: () => Promise<UserStatistics>;
  getPaymentMetrics: () => Promise<PaymentMetrics>;
  getPDFDownloadStats: () => Promise<PDFStats>;
  getSystemAlerts: () => Promise<Alert[]>;
}

interface AuditLogger {
  logUserUpdate: (adminId: string, changes: UserChanges) => Promise<void>;
  logCodeRegeneration: (adminId: string, details: RegenDetails) => Promise<void>;
  logPDFUpload: (adminId: string, pdfData: PDFUploadData) => Promise<void>;
  generateAuditReport: (timeRange: DateRange) => Promise<AuditReport>;
}
```

### Data Management Components

#### Database Access Layer
```typescript
interface UserRepository {
  create: (userData: CreateUserData) => Promise<User>;
  findByEmail: (email: string) => Promise<User | null>;
  update: (userId: string, updates: UserUpdates) => Promise<User>;
  delete: (userId: string) => Promise<void>; // Soft delete
}

interface ExamRepository {
  createCodes: (userId: string, examData: ExamData) => Promise<ExamCode[]>;
  validateCode: (code: string) => Promise<ValidationResult>;
  saveResults: (resultData: ResultData) => Promise<ExamResult>;
  getResults: (userId: string) => Promise<ExamResult[]>;
}

interface PDFRepository {
  storePDF: (pdfData: PDFData) => Promise<PDFSolution>;
  getPDFsByUser: (userId: string) => Promise<PDFSolution[]>;
  trackDownload: (pdfId: string, userId: string) => Promise<PDFDownload>;
  markExpired: (expiryDate: Date) => Promise<number>; // Returns count
}
```

#### Caching Components
```typescript
interface CacheManager {
  sessionCapacity: EdgeConfigCache;
  userSessions: RedisCache;
  pdfTokens: MemoryCache;
  analyticsData: DatabaseCache;
}

interface SessionCapacityCache {
  getCurrentCapacity: (sessionTime: SessionTime) => Promise<number>;
  updateCapacity: (sessionTime: SessionTime, change: number) => Promise<void>;
  resetDailyCapacity: () => Promise<void>;
}
```

### External Integration Components

#### Stripe Integration
```typescript
interface StripeConnector {
  createPaymentIntent: (amount: number, currency: 'thb') => Promise<PaymentIntent>;
  confirmPayment: (paymentIntentId: string) => Promise<ConfirmationResult>;
  handleWebhook: (signature: string, payload: string) => Promise<StripeEvent>;
  refundPayment: (paymentIntentId: string) => Promise<RefundResult>;
}
```

#### Email Service Integration
```typescript
interface EmailConnector {
  sendWelcomeEmail: (user: User) => Promise<void>;
  sendExamCodes: (user: User, codes: ExamCode[]) => Promise<void>;
  sendResultsReady: (user: User, resultId: string) => Promise<void>;
  sendPDFNotification: (users: User[], pdfInfo: PDFInfo) => Promise<void>;
  sendExpiryWarning: (user: User, expiryData: ExpiryData) => Promise<void>;
}
```

### Component Interaction Patterns

#### Request Flow Pattern
```
User Request → API Route → Authentication Middleware → Business Logic → Database Access → Response
```

#### Event-Driven Pattern
```
Payment Success → Webhook Handler → User Upgrade → Email Notification → Analytics Update
```

#### Caching Pattern  
```
API Request → Cache Check → Database Query (if miss) → Cache Update → Response
```

### Component Dependencies

**Frontend Dependencies:**
- Authentication components depend on NextAuth.js
- Payment components depend on Stripe SDK
- PDF components depend on Vercel Blob Storage APIs
- All components use shadcn/ui for consistent styling

**Backend Dependencies:**
- All database components depend on Prisma ORM
- Payment processing depends on Stripe webhooks
- Email components depend on Resend service
- Admin components depend on audit logging

**Cross-Cutting Concerns:**
- **Error Handling:** All components implement standardized error interfaces
- **Logging:** Structured logging with request correlation IDs
- **Monitoring:** Performance metrics collection at component boundaries
- **Security:** Authentication and authorization checks at all entry points

This component architecture supports the complete TBAT Mock Exam Platform with clear separation of concerns, type safety, and maintainable interfaces that facilitate both development and testing workflows.
