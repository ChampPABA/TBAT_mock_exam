# Version History
- **v1.3 (Final):** Initial architecture with tech stack, system design, and data model
- **v2.0 (PO-Validated):** Enhanced with deployment strategy, project setup, testing infrastructure, external dependencies, and implementation sequencing
- **v2.1 (Previous):** Final alignment with PRD v1.4, front-end spec v1.3, and PO validation report v2.0 - All critical issues resolved, production-ready implementation strategy
- **v2.2 (Previous):** Architect review integration for SCP-2025-001 - Added secure registration flow, multi-step wizard architecture, Variant 6 design system, and enhanced security specifications
- **v2.3 (Current):** Answer key delivery simplification - Removed complex PDF generation in favor of manual admin upload system, removed university admission predictions, and streamlined VVIP features for faster MVP delivery

### 1. Overview & Guiding Principles

This document describes the technical architecture for the "TBAT Mock Exam Platform," aligned with PRD v1.4 and front-end spec v1.3. The design is guided by the following principles:

- **Mock-First Development:** Phase 1 UI development with mock data, Phase 2 database integration
- **Speed to Market:** Selecting a tech stack that accelerates MVP development with proven components
- **Developer Experience:** A modern, productive environment with comprehensive tooling and testing
- **Scalability:** Turborepo monorepo foundation that supports future growth and feature expansion
- **Cost-Effectiveness:** Leveraging serverless services with generous free tiers (Vercel, Neon, Resend)
- **Quality Assurance:** 85%+ test coverage with automated CI/CD pipeline and quality gates

### 2. System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        direction TB
        WEB[Student Interface<br/>Next.js Web App]
        ADMIN[Admin Interface<br/>Next.js Admin Panel]
    end

    subgraph "Vercel Platform"
        direction TB
        subgraph "Frontend"
            UI[shadcn/ui Components<br/>Tailwind CSS]
            AUTH[JWT Authentication<br/>HTTP-only Cookies]
        end
        
        subgraph "API Layer"
            API[Next.js API Routes<br/>Serverless Functions]
            MIDDLEWARE[Auth Middleware<br/>Rate Limiting]
        end
    end

    subgraph "External Services"
        EMAIL[Resend<br/>Email Service]
        BLOB[Vercel Blob<br/>File Storage]
    end

    subgraph "Database Layer"
        PRISMA[Prisma ORM<br/>Type-safe Client]
        DB[(Neon PostgreSQL<br/>Serverless Database)]
    end

    subgraph "Development"
        DOCKER[Docker PostgreSQL<br/>Local Development]
        MOCK[Mock Services<br/>Phase 1 Development]
    end

    subgraph "CI/CD Pipeline"
        GH[GitHub Actions<br/>Automated Testing]
        DEPLOY[Vercel Deployment<br/>Auto-scaling]
    end

    %% User interactions
    WEB --> UI
    ADMIN --> UI
    UI --> AUTH
    AUTH --> API

    %% API connections
    API --> MIDDLEWARE
    MIDDLEWARE --> PRISMA
    PRISMA --> DB

    %% External service connections
    API --> EMAIL
    API --> BLOB

    %% Development connections
    API -.-> DOCKER
    UI -.-> MOCK

    %% Deployment flow
    GH --> DEPLOY
    DEPLOY --> API

    %% Styling
    classDef client fill:#e1f5fe
    classDef platform fill:#f3e5f5
    classDef external fill:#fff3e0
    classDef database fill:#e8f5e8
    classDef development fill:#fce4ec
    classDef cicd fill:#f1f8e9

    class WEB,ADMIN client
    class UI,AUTH,API,MIDDLEWARE platform
    class EMAIL,BLOB external
    class PRISMA,DB database
    class DOCKER,MOCK development
    class GH,DEPLOY cicd
```

**Architecture Description:** 

The system follows a modern serverless architecture hosted entirely on Vercel:

**Client Layer:** Students and administrators access unified Next.js web applications with responsive interfaces built using shadcn/ui components and Tailwind CSS.

**Application Layer:** Next.js API Routes handle all business logic as serverless functions, with JWT authentication using HTTP-only cookies for security, plus middleware for rate limiting and request validation.

**Data Layer:** Prisma ORM provides type-safe database access to a Neon PostgreSQL serverless database with automatic scaling and connection pooling.

**External Services:** Resend handles email functionality (password resets), while Vercel Blob manages file storage for user uploads and question images.

**Development Environment:** Local development uses Docker for PostgreSQL and comprehensive mock services during Phase 1 development to eliminate external dependencies.

**CI/CD Pipeline:** GitHub Actions automates testing, quality checks, and deployment to Vercel with automatic preview deployments for pull requests.

### 3\. Tech Stack Summary (Aligned with PRD v1.4)

| Category               | Technology             | Rationale                                                                                    |
| :--------------------- | :--------------------- | :------------------------------------------------------------------------------------------- |
| **Project Management** | `Turborepo` (Monorepo) | Manages multiple packages (web/admin apps, shared UI/DB) in one repo; enables faster builds and code sharing. |
| **Frontend Framework** | `Next.js 14+` (React)  | High performance, rapid development, integrated API capabilities, and excellent Vercel integration. |
| **UI Components**      | `shadcn/ui`            | Flexible, accessible UI components with Tailwind CSS integration and TypeScript support.    |
| **Styling**            | `Tailwind CSS`         | Utility-first CSS framework with mobile-first responsive design and consistent design system. |
| **Frontend State**     | `Zustand`              | Simple, lightweight global state management for React with TypeScript support.              |
| **Backend Logic**      | `Next.js API Routes`   | Serverless functions with built-in middleware, perfect for JWT authentication and Prisma integration. |
| **Database ORM**       | `Prisma`               | Type-safe database client with migrations, schema validation, and excellent developer experience. |
| **Database**           | `PostgreSQL (Neon)`    | Serverless PostgreSQL with automatic scaling, generous free tier, and built-in connection pooling. |
| **Authentication**     | `JWT + HTTP-only Cookies` | Secure authentication with automatic CSRF protection and session management. |
| **Testing**            | `Vitest + Playwright`  | Fast unit testing with Vitest, comprehensive E2E testing with Playwright. |
| **Email Service**      | `Resend`               | Developer-friendly email service for password resets with template management. |
| **Deployment**         | `Vercel + GitHub Actions` | Native Next.js optimization with automated CI/CD pipeline and preview deployments. |

### 4\. Frontend Architecture (Aligned with Front-end Spec v1.3)

**Turborepo Monorepo Structure:**
```
TBAT-mock-exam/
├── apps/
│   └── web/                 # Next.js application (unified student/admin)
├── packages/
│   ├── ui/                  # Shared UI components (shadcn/ui)
│   ├── database/            # Prisma schema and utilities
│   ├── typescript-config/   # Shared TypeScript configurations
│   └── eslint-config/      # Shared ESLint configurations
├── docker-compose.yml       # Local development environment
├── turbo.json              # Turborepo configuration
└── package.json
```

**Component Architecture:**
- **Design System:** shadcn/ui components with consistent Tailwind CSS theming
- **Accessibility:** WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Responsive Design:** Mobile-first approach with breakpoints at 768px (tablet) and 1024px (desktop)
- **State Management:** Zustand for global state (auth, user data) with TypeScript integration
- **Form Handling:** React Hook Form with Zod validation for type-safe form management
- **Error Handling:** Comprehensive error boundaries with user-friendly error messages and recovery actions

### 5\. Backend Architecture

- **Serverless Approach:** The backend logic will reside in Next.js API Routes, which run as serverless functions. This eliminates the need for managing a traditional, always-on server.
- **Data Logic:** All database interactions will be handled exclusively within the API Routes using the Prisma Client, ensuring a secure and organized data layer.

### 6\. Authentication Flow (Updated for SCP-2025-001)

#### 6.1 Registration Flow (New Multi-Step Process)

**Code-First Registration Flow:**
1. **Code Verification Modal:** User opens modal from landing page and enters TBAT-XXXX-XXXX code
2. **Real-Time Validation:** API validates code format and existence (debounced 500ms)
3. **Security Checks:** Rate limiting (5 attempts/5min), audit logging, format validation  
4. **Modal Success:** Valid code closes modal and proceeds to registration form
5. **Multi-Step Form:** Two-step registration wizard (Personal Info → Academic Info)
6. **Account Creation:** User account created with validated code association
7. **Code Activation:** Code marked as used and linked to new user account

**Security Enhancements:**
- **Secure Code Format:** TBAT-XXXX-XXXX with 32^8 entropy (~1 trillion combinations)
- **Cryptographic Generation:** Using Node.js crypto.randomBytes() with safe character set
- **Rate Limiting:** 5 code validation attempts per IP per 5-minute window
- **Audit Trail:** All validation attempts logged with IP, timestamp, and success status

#### 6.2 Login Flow (Existing Process)

1.  **Login:** The user submits their credentials to a `POST /api/auth/login` endpoint.
2.  **Verification:** The API validates the credentials against the database.
3.  **Token Generation:** Upon success, the server generates a **JWT (JSON Web Token)**.
4.  **Set Cookie:** The server sends the JWT back to the browser in a secure, **`HttpOnly` Cookie** to prevent XSS attacks.
5.  **Authenticated Requests:** All subsequent requests to protected routes will automatically include the JWT cookie for server-side validation.

#### 6.3 Enhanced Security Architecture

**Registration Security Flow:**
```mermaid
sequenceDiagram
    participant U as User
    participant M as Modal
    participant API as Code Validation API
    participant RL as Rate Limiter
    participant DB as Database
    participant RF as Registration Form

    U->>M: Enter TBAT-XXXX-XXXX
    M->>API: Validate Code (debounced 500ms)
    API->>RL: Check rate limits (5/5min)
    RL-->>API: Allow/Deny
    API->>DB: Lookup code + audit log
    DB-->>API: Code status + log entry
    API-->>M: Validation result
    M->>RF: Success → Open registration form
    RF->>API: Submit registration data
    API->>DB: Create user + mark code used
    DB-->>API: Account created
    API-->>RF: Registration complete
```

### 7\. Initial Data Model

The following `schema.prisma` defines the core data structures:

```prisma
// file: packages/db/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  school        String
  grade         String    // e.g., "M.4", "M.5", "M.6"
  password      String    // Will be a hashed password
  createdAt     DateTime  @default(now())
  examAttempts  ExamAttempt[]
}

model UniqueCode {
  id        String    @id @default(cuid())
  code      String    @unique  // TBAT-XXXX-XXXX format (SCP-2025-001)
  isUsed    Boolean   @default(false)
  usedBy    String?   // User ID who activated it (updated from email)
  usedAt    DateTime? // When it was activated (new field)
  createdAt DateTime  @default(now())
  expiresAt DateTime? // Optional expiration (future enhancement)
  
  // Audit trail for security (SCP-2025-001)
  validationAttempts CodeValidationAttempt[]
}

// New model for security audit trail (SCP-2025-001)
model CodeValidationAttempt {
  id          String      @id @default(cuid())
  code        String      // The code that was attempted
  ipAddress   String      // IP address of the attempt
  userAgent   String?     // Browser information
  successful  Boolean     // Whether validation succeeded
  createdAt   DateTime    @default(now())
  uniqueCode  UniqueCode? @relation(fields: [code], references: [code])
}

model ExamAttempt {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  score     Int
  answers   Json      // Storing the user's answers as a JSON object
  createdAt DateTime  @default(now())
}
```

### 8\. Project Setup & Scaffolding (Epic 1)

#### 8.1 Project Initialization Steps

**Prerequisites:**
- Node.js 18+ installed
- Docker Desktop installed and running
- Git configured with user credentials

**Repository Setup:**
```bash
# 1. Initialize monorepo structure
npm create turbo@latest tbat-mock-exam
cd tbat-mock-exam

# 2. Create application directories
mkdir -p apps/web apps/admin packages/ui packages/db

# 3. Initialize individual packages
cd apps/web && npm init -y
cd ../admin && npm init -y
cd ../../packages/ui && npm init -y
cd ../db && npm init -y
```

**Core Dependencies Installation:**
```bash
# Root level dependencies
npm install -D turbo @types/node typescript

# Web app dependencies
cd apps/web
npm install next react react-dom @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer @types/node typescript
npx tailwindcss init -p

# Database package
cd ../../packages/db
npm install prisma @prisma/client
npm install -D @types/node typescript
```

#### 8.2 Development Environment Setup

**Docker Configuration (`docker-compose.yml`):**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: tbat_mock_exam
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./packages/db/init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

**Environment Configuration:**
```bash
# .env.local (apps/web)
DATABASE_URL="postgresql://dev_user:dev_password@localhost:5432/tbat_mock_exam"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# .env (packages/db)
DATABASE_URL="postgresql://dev_user:dev_password@localhost:5432/tbat_mock_exam"
```

**Development Server Setup:**
```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false,
      "dependsOn": ["db:migrate"]
    }
  }
}
```

### 9\. Testing Infrastructure & Strategy (Enhanced - Aligned with Front-end Spec v1.3)

#### 9.1 Comprehensive Testing Framework Selection

**Unit Testing (Phase 1 & 2):**
- **Framework:** Vitest (faster than Jest, better Vite/Next.js integration)
- **React Testing:** @testing-library/react with accessibility testing utilities
- **Coverage Target:** 85%+ code coverage across all packages
- **Setup:** `packages/ui` component testing and individual app testing

**Component Testing (Phase 1 Focus):**
- **Accessibility Testing:** @testing-library/jest-dom with WCAG 2.1 AA validation
- **Visual Regression:** Automated screenshot testing for UI consistency
- **Responsive Testing:** Automated testing across mobile/tablet/desktop breakpoints
- **Form Testing:** Comprehensive validation testing with React Hook Form + Zod

**Integration Testing (Phase 2):**
- **API Testing:** Supertest with test database and mock external services
- **Database Testing:** Separate PostgreSQL test database with Docker
- **Authentication Testing:** JWT token validation and cookie security testing
- **External Service Testing:** Mock implementations for Resend email service

**End-to-End Testing:**
- **Framework:** Playwright (superior Next.js support and cross-browser testing)
- **Test Environment:** Automated staging deployment with realistic data
- **Critical User Journeys:** Registration → Login → Exam Submission → Results Review
- **Error Scenario Testing:** Network failures, session timeouts, form validation failures

#### 9.2 Test Environment Configuration

**Test Database Setup:**
```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: tbat_mock_exam_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data
```

**Testing Scripts:**
```json
// package.json scripts
{
  "scripts": {
    "test": "turbo run test",
    "test:unit": "vitest run",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:db:setup": "docker-compose -f docker-compose.test.yml up -d",
    "test:db:teardown": "docker-compose -f docker-compose.test.yml down"
  }
}
```

#### 9.3 Enhanced Mock API Strategy (Phase 1) - Production-Ready Mock Services

**Comprehensive Mock Data Structure:**
```typescript
// apps/web/lib/mock-api.ts
export const mockUsers = [
  {
    id: "mock-user-1",
    email: "student@example.com",
    name: "Test Student",
    school: "โรงเรียนสาธิตมหาวิทยาลัยเชียงใหม่",
    grade: "M.6"
  },
  {
    id: "mock-user-2", 
    email: "admin@example.com",
    name: "Test Admin",
    role: "admin"
  }
];

export const mockExamAttempts = [
  {
    id: "mock-attempt-1",
    userId: "mock-user-1",
    score: 85,
    totalQuestions: 60,
    correctAnswers: 51,
    answers: { 
      physics: { 1: 0, 2: 1, 3: 2 }, 
      chemistry: { 21: 1, 22: 3, 23: 0 },
      biology: { 41: 2, 42: 1, 43: 4 }
    },
    timeSpent: 7200, // 2 hours in seconds
    completedAt: new Date().toISOString(),
    subjectScores: {
      physics: { score: 28, total: 30 },
      chemistry: { score: 25, total: 30 }, 
      biology: { score: 32, total: 30 }
    }
  }
];

// Mock API with realistic delays and error simulation
export const mockAPI = {
  // Simulate network delays and occasional failures
  async simulateRequest<T>(data: T, delay = 800, failureRate = 0.05): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, delay));
    if (Math.random() < failureRate) {
      throw new Error('Network error - please try again');
    }
    return data;
  },
  
  // Authentication with realistic validation
  async login(email: string, password: string) {
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'password123') {
      return this.simulateRequest({ 
        success: true, 
        user,
        token: 'mock-jwt-token-' + Date.now()
      });
    }
    throw new Error('Invalid credentials');
  },
  
  // Exam submission with validation
  async submitExam(userId: string, answers: Record<string, number>) {
    const answerCount = Object.keys(answers).length;
    if (answerCount < 60) {
      throw new Error('Please answer all questions before submitting');
    }
    
    return this.simulateRequest({
      success: true,
      examAttemptId: 'mock-attempt-' + Date.now(),
      score: Math.floor(Math.random() * 20) + 80, // 80-100 range
      message: 'Exam submitted successfully!'
    });
  }
};
```

**Mock Service Integration with Error Handling:**
```typescript
// Mock API routes with comprehensive error scenarios
// apps/web/pages/api/auth/login.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'production' && process.env.USE_MOCK_API !== 'false') {
    try {
      const result = await mockAPI.login(req.body.email, req.body.password);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        error: error.message,
        code: 'AUTHENTICATION_FAILED'
      });
    }
  }
  
  // Real implementation for production
  return res.status(501).json({ error: 'Real API not implemented yet' });
}
```

### 10\. Deployment & CI/CD Strategy

#### 10.1 Platform Selection: Vercel

**Rationale:**
- Native Next.js optimization
- Built-in serverless functions
- Automatic deployments from Git
- Excellent developer experience
- Generous free tier

#### 10.2 Deployment Pipeline

**Branch Strategy:**
- `main` → Production deployment
- `develop` → Staging deployment
- `feature/*` → Preview deployments

**Vercel Configuration (`vercel.json`):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/admin/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/admin/(.*)",
      "dest": "/apps/admin/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/apps/web/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

**GitHub Actions Workflow (`.github/workflows/deploy.yml`):**
```yaml
name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/test_db

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

#### 10.3 Database Deployment

**Production Database:** Neon (PostgreSQL)
- Serverless PostgreSQL with generous free tier
- Automatic scaling and connection pooling
- Branch-based database workflows

**Migration Strategy:**
```bash
# Production deployment process
npm run db:migrate:deploy  # Runs Prisma migrations
npm run db:seed:prod       # Seeds initial data if needed
```

### 11\. External Dependencies & Integrations

#### 11.1 Third-Party Services

**Email Service: Resend**
- **Purpose:** Password reset, registration confirmation
- **Setup:** Account creation, API key management
- **Integration:** Custom email templates
- **Fallback:** Console logging in development

**File Storage: Vercel Blob (Optional)**
- **Purpose:** User profile images, exam attachments
- **Setup:** Automatic with Vercel deployment
- **Alternative:** Cloudinary for image optimization

#### 11.2 Service Account Setup

**Required Accounts:**
1. **Vercel Account** (Deployment)
   - GitHub integration
   - Environment variable management
   - Domain configuration

2. **Neon Account** (Database)
   - Database creation
   - Connection string generation
   - Backup configuration

3. **Resend Account** (Email)
   - API key generation
   - Domain verification
   - Template management

#### 11.3 API Key Management

**Environment Variables:**
```bash
# Production (.env.production)
DATABASE_URL="postgresql://user:pass@host/db"
NEXTAUTH_SECRET="production-secret-key"
RESEND_API_KEY="re_xxxxxxxxxxxxxxx"
VERCEL_BLOB_READ_WRITE_TOKEN="vercel_blob_token"

# Development (.env.local)
DATABASE_URL="postgresql://dev_user:dev_password@localhost:5432/tbat_mock_exam"
NEXTAUTH_SECRET="dev-secret-key"
RESEND_API_KEY="" # Optional in dev
```

**Security Best Practices:**
- All secrets stored in Vercel environment variables
- No secrets committed to repository
- Different keys for development/staging/production
- Regular key rotation schedule

### 12\. Implementation Sequencing & Dependencies

#### 12.1 Development Phase Breakdown

**CRITICAL: Mock-First Development Approach (Addresses PO Validation Issues)**

เราจะพัฒนาในแบบ Mock-First เพื่อให้ UI สามารถพัฒนาและทำงานได้ครบถ้วนก่อน โดยไม่ต้องรอการเชื่อมต่อ Database - ตรงกับ PO Validation Report v2.0 ที่เน้นการลด blocking issues

**Phase 1: Mock Data UI Development (Weeks 1-2) - Zero External Dependencies**
```mermaid
gantt
    title Mock-First Development Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Mock-First UI
    Project Setup          :done, setup, 2025-09-01, 1d
    Mock Data Structure    :active, mock-data, 2025-09-02, 1d
    UI Components Base     :ui-base, after mock-data, 2d
    Student Registration UI :reg-ui, after ui-base, 2d
    Student Dashboard UI   :dash-ui, after reg-ui, 2d
    Exam Taking UI        :exam-ui, after dash-ui, 3d
    Admin Panel UI        :admin-ui, after exam-ui, 2d
    
    section Phase 2: Database Integration  
    Database Setup         :db-setup, after admin-ui, 1d
    Real Authentication    :real-auth, after db-setup, 2d
    API Endpoints         :api-dev, after real-auth, 3d
    Data Migration        :migration, after api-dev, 1d
    Production Deploy     :deploy, after migration, 1d
```

**Phase 1 Details: Mock Data Development**

เริ่มต้นด้วยการสร้าง Mock API ที่ครบถ้วน:

```typescript
// apps/web/lib/mock-api/index.ts
export const MOCK_MODE = process.env.NODE_ENV !== 'production' && 
                          process.env.USE_MOCK_API !== 'false';

// Mock Authentication
export const mockAuth = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'student@test.com' && password === 'password') {
      return { 
        success: true, 
        user: mockUsers[0],
        token: 'mock-jwt-token'
      };
    }
    return { success: false, error: 'Invalid credentials' };
  },
  
  register: async (userData: RegisterData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newUser = {
      id: `mock-user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return { success: true, user: newUser };
  }
};

// Mock Exam Data
export const mockExamQuestions = [
  {
    id: 1,
    subject: 'Mathematics',
    question: 'What is the derivative of x²?',
    options: ['2x', 'x²', '2', 'x'],
    correctAnswer: 0,
    explanation: 'The derivative of x² is 2x using the power rule.'
  },
  // ... more questions
];

export const mockExamAttempts = [
  {
    id: 'attempt-1',
    userId: 'mock-user-1',
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    answers: { '1': 0, '2': 1, '3': 2 }, // question_id: selected_option
    timeSpent: 1800, // seconds
    completedAt: new Date('2025-09-01').toISOString(),
    subject: 'Mathematics'
  }
];
```

**Phase 1 Mock API Routes:**

```typescript
// apps/web/pages/api/auth/login.ts (Mock Implementation)
import { mockAuth } from '@/lib/mock-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.USE_MOCK_API !== 'false') {
    const result = await mockAuth.login(req.body.email, req.body.password);
    return res.status(result.success ? 200 : 401).json(result);
  }
  
  // Real implementation will replace this
  return res.status(501).json({ error: 'Real API not implemented yet' });
}
```

#### 12.2 Feature Dependencies

**Critical Path:**
1. **Authentication System** → All user features depend on this
2. **User Registration** → Required before exam taking
3. **Exam Taking Flow** → Core business value
4. **Admin Code Management** → Required for user registration

**Parallel Development Opportunities:**
- UI components can be developed with mock data
- Admin features can be built separately from student features
- Database migrations can be prepared alongside API development

#### 12.3 API Endpoint Development Order

**Priority 1 (Core Authentication):**
```typescript
// Authentication endpoints
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

**Priority 2 (User Management):**
```typescript
// User endpoints
GET  /api/users/profile
PUT  /api/users/profile
POST /api/codes/validate
```

**Priority 3 (Exam System):**
```typescript
// Exam endpoints
GET  /api/exams/questions
POST /api/exams/submit
GET  /api/exams/attempts
GET  /api/exams/results/{id}
```

**Priority 4 (Admin Features):**
```typescript
// Admin endpoints
POST /api/admin/codes/generate
GET  /api/admin/codes
GET  /api/admin/users
GET  /api/admin/results
```

### 13\. Quality Assurance & Testing Strategy

#### 13.1 Development Quality Gates

**Phase 1 Quality Gates (Mock Data):**
- All UI components render correctly with mock data
- User flows complete successfully in browser
- No console errors or warnings
- Responsive design works on mobile/tablet/desktop
- Mock API responses match expected Prisma schema

**Phase 2 Quality Gates (Database Integration):**
- All unit tests passing (>90% coverage)
- Integration tests covering API endpoints
- Database migrations run cleanly
- Authentication flows secure and functional
- Performance benchmarks met (<2s page load)

#### 13.2 Test Data Management

**Mock Test Scenarios:**
```typescript
// Test scenarios for mock data
export const testScenarios = {
  // Successful student journey
  happyPath: {
    user: mockUsers[0],
    validCode: 'TEST123',
    examAttempt: mockExamAttempts[0]
  },
  
  // Edge cases
  edgeCases: {
    invalidCode: 'INVALID',
    expiredCode: 'EXPIRED123',
    alreadyUsedCode: 'USED123',
    incompleteExam: {
      ...mockExamAttempts[0],
      answers: { '1': 0 } // Only answered first question
    }
  }
};
```

### 14\. Security Architecture

#### 14.1 Authentication Security

**JWT Implementation:**
```typescript
// Secure JWT configuration
const JWT_CONFIG = {
  secret: process.env.NEXTAUTH_SECRET, // 32+ character random string
  algorithm: 'HS256',
  expiresIn: '24h',
  issuer: 'tbat-mock-exam',
  audience: 'tbat-students'
};

// Token validation middleware
export const validateToken = (req: NextApiRequest) => {
  const token = req.cookies.auth_token;
  if (!token) throw new Error('No token provided');
  
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
```

**Password Security:**
- Bcrypt hashing with salt rounds: 12
- Password strength requirements: 8+ chars, mixed case, numbers
- Account lockout after 5 failed attempts

#### 14.2 API Security

**Rate Limiting:**
```typescript
// Rate limiting configuration
const rateLimits = {
  auth: '5 requests per minute',
  exam: '1 request per 10 seconds',
  general: '100 requests per hour'
};
```

**Input Validation:**
- All inputs validated with Zod schemas
- SQL injection prevention via Prisma
- XSS prevention via React's built-in escaping

### 15\. Monitoring & Analytics

#### 15.1 Application Monitoring

**Vercel Analytics Integration:**
```javascript
// Real-time performance monitoring
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

**Error Tracking:**
- Console error monitoring in production
- Failed authentication attempt logging
- API endpoint failure tracking

#### 15.2 User Analytics (Privacy-Focused)

**Success Metrics Tracking:**
- Registration completion rate
- Exam completion rate
- Average exam scores by school/grade
- Time spent per question analysis

### 16\. Post-MVP Roadmap

#### 16.1 Immediate Enhancements (Month 2-3)

**Enhanced Features:**
- Question difficulty analytics
- Detailed performance breakdowns
- Comparison with peer averages
- PDF report generation

**Technical Improvements:**
- Redis caching layer
- CDN for static assets
- Advanced monitoring (Sentry)
- Automated testing pipeline

#### 16.2 Future Considerations (Month 4+)

**Scalability Enhancements:**
- Multi-region deployment
- Database sharding strategy
- Microservices architecture evaluation
- Mobile app development

**Feature Expansions:**
- Multiple exam types (Physics, Chemistry, Biology)
- Timed exam sessions
- Group/class management
- Advanced reporting dashboards

### 17. API Rate Limits & Performance Monitoring (Addresses PO Concern #1)

#### 17.1 Third-Party Service Rate Limits

**Resend Email Service Limits:**
- **Free Tier:** 3,000 emails/month, 100 emails/day
- **Monitoring:** Built-in usage dashboard with 80% threshold alerts
- **Mitigation:** Queue system for password reset emails during peak usage
- **Fallback:** Local email logging in development, admin notification system

**Neon PostgreSQL Limits:**
- **Free Tier:** 10GB storage, 1 million rows, connection pooling included
- **Monitoring:** Database performance metrics via Neon dashboard
- **Optimization:** Prisma connection pooling, query optimization
- **Scaling:** Automatic scaling within free tier limits

**Vercel Platform Limits:**
- **Free Tier:** 100GB bandwidth/month, 6,000 build minutes
- **Monitoring:** Real-time usage tracking in Vercel dashboard
- **Optimization:** Image optimization, static asset caching, edge functions

#### 17.2 Performance Monitoring Tools

**Real-Time Monitoring Stack:**
```typescript
// Performance monitoring implementation
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Custom performance tracking
const performanceMonitor = {
  trackApiResponse: (endpoint: string, duration: number) => {
    if (duration > 500) {
      console.warn(`Slow API response: ${endpoint} took ${duration}ms`);
    }
  },
  trackPageLoad: (page: string, metrics: any) => {
    // Track Core Web Vitals
    Analytics.track('page_performance', { page, ...metrics });
  }
};
```

**Monitoring Thresholds & Alerts:**
- **API Response Time:** Alert if >500ms average over 5 minutes
- **Database Query Time:** Alert if >100ms average over 10 queries
- **Core Web Vitals:** LCP <2.5s, FID <100ms, CLS <0.1
- **Error Rate:** Alert if >0.1% client errors or >0.01% server errors

### 18. User Documentation Templates (Addresses PO Concern #2)

#### 18.1 Help Documentation Structure

**User Guide Template:**
```markdown
# TBAT Mock Exam Platform - User Guide

## Getting Started
1. **Register Your Account**
   - Locate your unique code in the Box Set package
   - Visit the registration page
   - Fill in your details (name, school, grade, email)
   - Create a secure password

2. **Taking Your Exam**
   - Log in to your account
   - Navigate to "Submit Answers"
   - Select subject tabs (Physics, Chemistry, Biology)
   - Enter your answers (A, B, C, D, E format)
   - Review and submit

3. **Understanding Your Results**
   - View overall score and percentile ranking
   - Analyze subject-specific performance
   - Review detailed explanations for each question
   - Use recommendations to focus your study

## Troubleshooting
- **Can't find your code?** Check the inside cover of your Box Set
- **Forgot your password?** Use the "Forgot Password" link on login
- **Technical issues?** Contact support with your registered email
```

#### 18.2 Error Message Standards

**User-Friendly Error Messages:**
```typescript
const errorMessages = {
  invalidCode: "We couldn't find that code. Please check your Box Set package for the correct unique code, or contact support if you need help.",
  
  networkError: "We're having trouble connecting. Please check your internet connection and try again in a moment.",
  
  sessionExpired: "Your session has expired for security. Please log in again to continue where you left off.",
  
  formValidation: "Please review the highlighted fields above and make sure all required information is provided correctly."
};
```

---
