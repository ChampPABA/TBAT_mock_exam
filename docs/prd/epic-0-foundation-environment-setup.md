# Epic 0: Foundation & Environment Setup

**Goal:** Establish bulletproof project infrastructure, core services, and essential seed data to support 300+ concurrent users with exam-critical reliability from day one.

### Story 0.1: Project Scaffolding & CI/CD Pipeline Setup

As a **Developer**,
I want to set up the complete project structure with automated CI/CD pipeline,
so that all subsequent development can deploy reliably and consistently to production.

#### Acceptance Criteria

**AC1:** Next.js 14+ monorepo created with Turborepo structure containing /apps/web, /packages/ui, /packages/lib directories

**AC2:** TypeScript configuration established with strict mode, path aliases (@/), and consistent tsconfig across all packages

**AC3:** Tailwind CSS + shadcn/ui integrated with medical color palette (#0d7276 primary, #529a9d secondary, #cae0e1 light)

**AC4:** GitHub Actions CI/CD pipeline configured with automated testing, type checking, and Vercel deployment

**AC5:** ESLint + Prettier + Husky pre-commit hooks enforcing code quality standards

**AC6:** Environment variable structure established for development, staging, production with secure secrets management

**AC7:** Docker development environment configured with:

- Docker Compose orchestration for Next.js app, PostgreSQL, and Redis containers
- Hot reload volumes for rapid development cycles
- Environment parity between local development and production
- Containerized database with persistent data volumes

### Story 0.2: Database Schema & Core Services Setup

As a **Developer**,
I want to establish the complete database schema and core authentication/payment services,
so that all business logic features can integrate with stable, scalable data layer.

#### Acceptance Criteria

**AC1:** PostgreSQL database provisioned on Neon with connection pooling and automatic backups enabled

**AC2:** Prisma ORM configured with complete schema including User, ExamCode, Payment, Results, Session tables

**AC3:** NextAuth.js authentication service configured with JWT strategy and email/password provider

**AC4:** Stripe payment service integrated with Thai Baht support for 690 THB and 290 THB transactions

**AC5:** Email service (Resend) configured with transactional email templates for registration, tickets, results

**AC6:** Redis cache (Upstash) configured for session management and analytics result caching

**AC7:** Docker Compose configuration updated with PostgreSQL service including:

- Persistent volume for database data
- Environment variables for database credentials
- Health check for database readiness
- Automatic database creation on container startup

**AC8:** Database migration workflow configured in Docker with:

- Prisma migrate script in docker-compose.yml
- Seed data script for development environment
- Migration run on container startup or via docker-compose exec command
- Volume mapping for migration files

**AC9:** Service integration verified in Docker environment:

- NextAuth service connects to PostgreSQL container
- Stripe service environment variables properly configured
- Redis (Upstash) connection verified from Docker container
- All services accessible via docker-compose up command

### Story 0.3: Core Utilities & Security Implementation

As a **Developer**,
I want to implement essential security measures and utility functions,
so that all features can handle exam codes, data protection, and user safety reliably.

#### Acceptance Criteria

**AC1:** Random exam code generation service implemented with collision prevention (FREE-XXXX-[SUBJECT], ADV-XXXX) where XXXX = 4 chars: alphanumeric uppercase

**AC2:** Password hashing service implemented with bcrypt and secure validation rules (8+ characters, letters + numbers)

**AC3:** Basic PDPA compliance implemented with consent form, data export capability, and user data deletion

**AC4:** Input validation and sanitization utilities established using Zod schemas for all user inputs

**AC5:** Error logging and monitoring service (Sentry) configured with alerting for critical failures

**AC6:** Rate limiting middleware implemented for API endpoints with special consideration for payment routes

**AC7:** Docker environment security configuration implemented:

- Environment variables properly managed via .env.docker file
- Secrets not exposed in Docker images or logs
- PDPA compliance features accessible in containerized environment
- Rate limiting middleware tested in Docker setup

**AC8:** Utility services verified in Docker:

- Exam code generation service functional in container
- Password hashing service working with proper entropy
- Error logging (Sentry) configured with Docker environment flag
- All utilities accessible via Docker network

### Story 0.4: Performance & Monitoring Foundation

As a **Developer**,
I want to establish performance monitoring and optimization infrastructure,
so that the platform can handle 300+ concurrent users with <2 second load times.

#### Acceptance Criteria

**AC1:** Vercel deployment configured with edge functions, automatic CDN, and geographic optimization for Thailand

**AC2:** Performance monitoring implemented with Core Web Vitals tracking and real-user monitoring

**AC3:** Database query optimization established with connection pooling and query performance logging

**AC4:** Image optimization service configured with Sharp for QR code generation and asset compression

**AC5:** Load testing framework established using Artillery or k6 for simulating 300+ concurrent registration scenarios

**AC6:** Health check endpoints implemented for all critical services with automated alerting for downtime

**AC7:** Docker performance monitoring setup:

- Container resource limits configured (CPU, memory)
- Docker health checks for all services
- Performance metrics accessible from containers
- Load testing executable against Docker environment

**AC8:** Docker development workflow optimized:

- Hot reload working for Next.js in Docker
- Database query logs accessible via docker-compose logs
- Monitoring dashboards accessible from host machine
- Multi-stage Dockerfile for production-ready builds
