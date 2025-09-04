# Product Requirements Document (PRD): TBAT Mock Exam Box Set

## 🎯 PO Validation Status: ✅ APPROVED
**Overall Readiness:** 89% | **Critical Issues:** 0 | **Ready for Implementation**

**Version:** 1.4
**Date:** 2025-09-01
**Product Manager:** PM-Agent

**Version History:**
- **v1.4 (2025-09-01):** PO APPROVED - Enhanced implementation strategy with Phase 1/2 development approach, comprehensive project setup, mock-first development strategy, and complete deployment pipeline alignment
- **v1.3 (2025-09-01):** Added implementation strategy, epic breakdown, project setup, testing & deployment sections to address PO validation findings
- **v1.2:** Enhanced user stories and admin panel requirements
- **v1.1:** Initial PRD with core features and target audience definition
- **v1.0:** Basic product concept and user requirements

## 1. Overview & Vision

This project aims to develop and launch the "TBAT Mock Exam Box Set," a hybrid offline/online solution for high school students in Chiang Mai preparing for the Thai Biomedical Admissions Test (TBAT). By combining a physical exam package with a powerful online analytics platform, we will provide an accessible and effective self-assessment tool. The platform's secondary goal is to serve as a high-quality lead generation engine for our future flagship product, the "Adaptive Learning System."

## 2. Target Audience

**Primary Users:** High school students in Chiang Mai and surrounding provinces who are preparing for the TBAT exam.

**Persona:**

- Motivated self-learners who need a reliable tool to gauge their current knowledge and readiness.
- Students who lack access to high-quality, in-person mock exam facilities, which are primarily located in Bangkok.
- They seek to identify specific academic weaknesses to focus their remaining study time effectively.

## 3. User Stories (Student-Facing Application)

### Epic: Onboarding & Account Management

- **Story 1.1 - Registration:** As a new user, I want to use the unique code from my Box Set to register for an account using my email and a password, so that I can save my exam results and access the platform.
- **Story 1.2 - Login:** As a registered user, I want to log in with my email and password, so that I can access my dashboard and review my past results at any time.
- **Story 1.3 - Forgot Password:** As a user who has forgotten my password, I want to follow a "Forgot Password" link, enter my email, and receive a reset link, so that I can securely regain access to my account.
- **Story 1.4 - Logout:** As a logged-in user, I want to click a "Logout" button, so that I can securely end my session.

### Epic: Answer Submission

- **Story 2.1 - Manual Input:** As a student who has completed the physical exam, I want to easily input my answers (e.g., 1-A, 2-C, 3-D) into a web form, so that the system can instantly grade my performance.

### Epic: Results & Analysis

- **Story 3.1 - Score Overview:** As a student who has submitted my answers, I want to immediately see my total score and a breakdown by subject (Physics, Chemistry, Biology), so that I can get a quick overview of my performance.
- **Story 3.2 - Leaderboard:** I want to see my percentile rank compared to all other students who have taken the test, so that I understand where I stand among my peers.
- **Story 3.3 - Weakness Analysis:** I want to see a clear analysis of which chapters or topics I performed poorly on, so that I know exactly what I need to study.
- **Story 3.4 - Personalized Recommendations:** I want to receive automated recommendations on which chapters to prioritize for review, so that I can optimize my study plan.
- **Story 3.5 - Detailed Explanations:** For each question, I want to be able to view a detailed explanation that includes the correct answer, the thought process, why other options are incorrect, and common traps, so that I can learn from my mistakes.

## 4. Admin Panel Requirements

### Epic: Unique Code Management

- **Story 4.1 - Generate Codes:** As an admin, I want to generate batches of unique codes, so that I can provide them for new production runs of the Box Set.
- **Story 4.2 - View Code Status:** As an admin, I want to view the status of any code (e.g., "Not Used," "Activated by user@email.com"), so that I can track usage and troubleshoot issues.
- **Story 4.3 - Export Codes:** As an admin, I want to export a list of generated codes as a CSV file, so that I can easily share it with the printing and packaging team.

### Epic: User Management

- **Story 4.4 - View User List:** As an admin, I want to see a list of all registered users with their basic information (Name, Email, Registration Date), so that I can manage the user base.
- **Story 4.5 - Search Users:** As an admin, I want to search for a specific user by name or email, so that I can provide customer support.
- **Story 4.6 - View User Results:** As an admin, I want to view the detailed exam results of a specific user, so that I can investigate any reported issues.

### Epic: Dashboard & Analytics

- **Story 4.7 - Main Dashboard:** As an admin, I want to see a dashboard with key metrics upon login (e.g., Total Users, New Users This Week, Code Activation Rate), so that I can quickly assess the project's health.
- **Story 4.8 - Aggregate Analytics:** As an admin, I want to view aggregate statistics for the exam (e.g., average score, average by subject, most frequently missed questions), so that I can gain insights into test difficulty and user performance.
- **Story 4.9 - Export Leads:** As an admin, I want to export the list of all registered users (Name, Email) as a CSV file, so that I can use this lead list for future marketing campaigns.

## 5. Non-Functional Requirements

- The application must be mobile-responsive.
- The system must provide instant scoring and analysis upon answer submission.
- The platform must be secure to protect user data.

## 6. Out of Scope (for MVP)

- OCR (Optical Character Recognition) for answer sheet uploads.
- In-app purchases for additional exams.
- Community features like forums or discussion boards.
- A built-in timer for the exam.

## 7. Implementation Strategy

### 7.1 Development Approach: Mock-First Strategy

**Phase 1: Mock Data Development (Weeks 1-2)**
- Complete UI development with mock data
- No external service dependencies
- Full user journey implementation
- Component library establishment
- Testing framework setup

**Phase 2: Database Integration & Production (Weeks 3-4)**
- Database schema implementation
- API endpoint development
- External service integration
- Production deployment
- Performance optimization

### 7.2 Epic Breakdown with Phase Alignment

**Phase 1 Epics:**

**Epic 1: Project Setup & Infrastructure**
- Turborepo monorepo scaffolding
- Next.js + shadcn/ui setup
- Development environment with Docker
- Testing infrastructure (Vitest, Playwright)
- Mock data services and utilities

**Epic 2: Frontend Foundation & UI**
- Responsive design system implementation
- Authentication UI flows (mock auth)
- Form components with validation
- Navigation and layout components
- Error handling and loading states

**Epic 3: Student Features (Mock Data)**
- Answer submission interface
- Results display with mock analytics
- Leaderboard with sample data
- Detailed explanations system
- User dashboard and profile

**Epic 4: Admin Features (Mock Data)**
- Admin dashboard with mock metrics
- User management interface
- Code management system UI
- Data export functionality
- Analytics and reporting views

**Phase 2 Epics:**

**Epic 5: Database & Backend Integration**
- PostgreSQL setup with Prisma
- Authentication system (JWT + cookies)
- API endpoints development
- Database migrations and seeding
- User registration and management

**Epic 6: Production Services & Deployment**
- External service integration (Resend email)
- Vercel deployment with CI/CD
- Environment configuration
- Security hardening
- Performance monitoring

### 7.3 Technical Dependencies & Parallel Development

**Phase 1 Dependencies (Mock Development):**
1. Project setup → UI components → Feature implementation
2. Design system → Component library → Feature UIs
3. Mock services → Data flow → User journeys
4. Testing setup → Component tests → Integration tests

**Phase 2 Dependencies (Production Integration):**
1. Database schema → API endpoints → Frontend integration
2. Authentication service → Protected routes → User features
3. External services → Email functionality → Password reset
4. Production deployment → Environment config → Service monitoring

**Parallel Development Opportunities:**
- UI components and mock services can be built simultaneously
- Admin and student features can be developed in parallel
- Testing can be implemented incrementally with each component
- Documentation can be written alongside development

## 8. Project Setup & Environment

### 8.1 Turborepo Monorepo Architecture

**Project Structure:**
```
TBAT-mock-exam/
├── apps/
│   └── web/                 # Next.js application
├── packages/
│   ├── ui/                  # Shared UI components (shadcn/ui)
│   ├── database/            # Prisma schema and utilities
│   ├── typescript-config/   # Shared TypeScript configurations
│   └── eslint-config/      # Shared ESLint configurations
├── docker-compose.yml
├── turbo.json
└── package.json
```

### 8.2 Development Environment Requirements

**Required Software:**
- Node.js 18+ with pnpm (recommended for Turborepo)
- Docker and Docker Compose for PostgreSQL
- Git for version control
- VS Code with recommended extensions (Prisma, Tailwind CSS, TypeScript)

**Environment Configuration:**
- Local PostgreSQL via Docker (port 5432)
- Redis for session management (optional, can use memory store)
- Hot reload development servers
- TypeScript strict mode with path mapping
- ESLint + Prettier with pre-commit hooks

### 8.3 Step-by-Step Project Initialization

**Phase 1 Setup (Mock Development):**

1. **Monorepo Initialization:**
   ```bash
   npx create-turbo@latest TBAT-mock-exam --package-manager pnpm
   cd TBAT-mock-exam
   pnpm install
   ```

2. **Next.js App Setup:**
   ```bash
   cd apps/web
   npx shadcn-ui@latest init
   pnpm add @hookform/resolvers zod lucide-react
   ```

3. **Shared Packages Configuration:**
   - UI package with shadcn/ui components
   - TypeScript config inheritance
   - Shared utilities and constants

4. **Development Environment:**
   ```bash
   docker-compose up -d  # PostgreSQL + Redis
   pnpm dev              # Start all development servers
   ```

**Phase 2 Setup (Production Integration):**

5. **Database Setup:**
   ```bash
   cd packages/database
   pnpm prisma generate
   pnpm prisma db push
   pnpm prisma db seed
   ```

6. **External Service Integration:**
   - Resend email service configuration
   - Vercel deployment setup
   - Environment variables configuration

### 8.4 External Dependencies & Service Requirements

**Phase 1 (No External Dependencies):**
- All development uses mock data and services
- Local development environment only
- No external API calls or service requirements

**Phase 2 (Production Services):**

**Required Third-Party Services:**
- **Email Service:** Resend (chosen for developer experience)
- **Database:** Neon PostgreSQL (serverless, generous free tier)
- **Deployment:** Vercel (integrated with Next.js)
- **Monitoring:** Vercel Analytics + built-in error tracking

**Service Account Requirements:**
- Resend account with API key
- Neon PostgreSQL database URL
- Vercel account with GitHub integration
- Domain configuration (optional for MVP)

**Environment Variables:**
```env
# Phase 1 (Local Development)
NODE_ENV=development
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/tbat

# Phase 2 (Production)
RESEND_API_KEY=your-resend-key
DATABASE_URL=your-neon-connection-string
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 9. Comprehensive Testing Strategy

### 9.1 Testing Framework Selection & Setup

**Testing Stack:**
- **Unit Testing:** Vitest (faster than Jest, better Vite integration)
- **Component Testing:** React Testing Library with Vitest
- **Integration Testing:** Playwright for API endpoints
- **End-to-End Testing:** Playwright for critical user journeys
- **Type Safety:** TypeScript strict mode with 100% type coverage target

**Test Environment Setup:**
- Separate test database (PostgreSQL in Docker)
- Mock services for external APIs (Phase 1)
- Test data factories with Prisma
- Parallel test execution for faster CI/CD

### 9.2 Phase-Aligned Testing Strategy

**Phase 1 Testing (Mock Data):**
- Component unit tests with mock data
- User interface integration tests
- Mock service validation
- Accessibility testing (WCAG 2.1 AA)
- Responsive design testing

**Phase 2 Testing (Database Integration):**
- Database operation tests
- API endpoint integration tests
- Authentication flow testing
- External service integration tests
- End-to-end user journey tests

### 9.3 Testing Requirements & Coverage

**Core Test Coverage Areas:**
- **Authentication Flows:** Login, registration, password reset, session management
- **Answer Submission:** Input validation, grading logic, result calculation
- **Admin Panel:** User management, code generation, analytics dashboard
- **Database Operations:** CRUD operations, data integrity, migration testing
- **API Endpoints:** Input validation, error handling, response formatting
- **UI Components:** Rendering, interaction, accessibility, responsive behavior

**Quality Gates & CI/CD Integration:**
- **Minimum 85% code coverage** (increased from 80%)
- **All tests must pass** before merge to main branch
- **TypeScript strict mode** with zero errors
- **ESLint + Prettier** rules satisfied
- **Accessibility tests** must pass
- **Performance budget** enforcement

**Testing Automation:**
- Pre-commit hooks run unit tests
- Pull request triggers full test suite
- Staging deployment runs E2E tests
- Production deployment requires manual approval after tests

## 10. Production Deployment & Infrastructure

### 10.1 Deployment Platform & Strategy

**Selected Platform:** Vercel + Neon PostgreSQL
- **Frontend:** Vercel (seamless Next.js integration, global CDN)
- **Database:** Neon PostgreSQL (serverless, automatic scaling)
- **Email Service:** Resend (developer-friendly, reliable delivery)

**Deployment Pipeline (GitHub Actions + Vercel):**
1. **Code Push:** Triggers automated build process
2. **Quality Gates:** 
   - Run full test suite (unit, integration, E2E)
   - TypeScript type checking
   - ESLint and Prettier validation
   - Security vulnerability scanning
3. **Build Process:** 
   - Next.js optimization and bundling
   - Asset optimization and CDN preparation
   - Environment-specific configuration
4. **Staging Deployment:** 
   - Automatic deployment to staging environment
   - Smoke tests and health checks
5. **Production Deployment:** 
   - Manual approval gate
   - Blue-green deployment strategy
   - Rollback capability

### 10.2 Environment Configuration & Management

**Environment Tiers:**
- **Development:** Local Docker setup with hot reload and mock services
- **Staging:** Cloud-hosted with production-like configuration and test data
- **Production:** Optimized build with CDN, database scaling, and monitoring

**Configuration Management:**
- **Environment Variables:** Managed through Vercel dashboard
- **Secret Management:** No secrets in repository, encrypted at rest
- **Database Connections:** Connection pooling and SSL enforcement
- **API Keys:** Secure storage with automatic rotation support

**Security Configuration:**
- HTTPS enforcement with automatic SSL certificates
- CORS configuration for API endpoints
- Rate limiting on authentication endpoints
- Input validation and sanitization
- Security headers (CSP, HSTS, etc.)

### 10.3 Monitoring, Analytics & Performance

**Application Monitoring Stack:**
- **Performance:** Vercel Analytics (Core Web Vitals, page load times)
- **Error Tracking:** Built-in Vercel error reporting + custom error boundaries
- **Database Monitoring:** Neon dashboard (query performance, connection pooling)
- **Uptime Monitoring:** Vercel status page + custom health checks

**User Analytics & Metrics:**
- **Engagement Tracking:** User registration, exam completion rates
- **Performance Metrics:** Page load times, API response times
- **Business Metrics:** Activation rates, lead generation
- **Error Rates:** Client-side and server-side error tracking

**System Health Dashboards:**
- Real-time application performance metrics
- Database query performance and optimization recommendations
- User engagement and conversion funnel analysis
- Error rate trends and alert thresholds

## 11. Success Metrics & KPIs

### 11.1 Business Success Metrics
- **Activation Rate:** > 85% of sold Box Sets result in a registered user
- **User Satisfaction (CSAT):** > 4.0 / 5.0 rating on post-analysis survey
- **Lead Generation:** Target 1000+ high-quality user emails in first 6 months
- **Retention Rate:** > 70% of users return to view results multiple times
- **Completion Rate:** > 90% of started exams are completed

### 11.2 Technical Performance Metrics
- **Page Load Performance:** < 2 second Core Web Vitals scores
- **API Response Times:** < 500ms for all endpoint responses
- **System Uptime:** 99.9% availability with < 1 minute recovery time
- **Database Performance:** < 100ms average query response time
- **Error Rates:** < 0.1% client-side errors, < 0.01% server-side errors

### 11.3 Development Quality Metrics
- **Test Coverage:** > 85% code coverage across all packages
- **Security:** Zero critical or high-severity vulnerabilities
- **Code Quality:** TypeScript strict mode with zero errors
- **Performance Budget:** Bundle size < 250KB gzipped
- **Accessibility:** WCAG 2.1 AA compliance across all pages

### 11.4 User Experience Metrics
- **Mobile Responsiveness:** Optimized for 320px+ screen widths
- **Form Completion:** < 5% form abandonment rate
- **Navigation Efficiency:** < 3 clicks to reach any major feature
- **Error Recovery:** Clear error messages with actionable solutions
- **Loading States:** All interactions provide immediate visual feedback
