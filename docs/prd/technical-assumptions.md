# Technical Assumptions

### Repository Structure: Monorepo

**Turborepo-based monorepo** structure to enable shared components, utilities, and rapid development cycles. Single repository containing web application, shared UI library, utilities, and configuration packages.

### Service Architecture

**Next.js Full-Stack Monolith with Serverless Functions** - Single Next.js 14+ application with App Router handling both frontend and API routes, deployed on Vercel with serverless function auto-scaling for traffic spikes during registration periods.

### Testing Requirements

**Comprehensive Testing Pyramid** - Unit tests for business logic, integration tests for API endpoints, E2E tests with Playwright for critical user journeys (registration flow, payment processing, results viewing), and load testing for 300+ concurrent users.

### Additional Technical Assumptions and Requests

**Frontend Framework & Tooling:**

- **Next.js 14+** with App Router for file-based routing and server components
- **TypeScript** for type safety and developer experience
- **Tailwind CSS** with shadcn/ui component library for rapid UI development
- **React Hook Form** for form handling with Zod validation
- **Zustand** for lightweight state management and client-side data flow

**Database & Data Management:**

- **PostgreSQL** via Neon serverless for automatic scaling
- **Prisma ORM** for type-safe database operations and migrations
- **Real-time replication** and automated backups for data protection

**Payment & External Services:**

- **Stripe API** for payment processing (Thai Baht support confirmed)
- **Resend** for transactional emails with high delivery rates
- **Sharp** for image optimization and QR code generation
- **Vercel Blob Storage** for secure PDF solution storage and delivery with 6-month retention policy

**Performance & Scalability:**

- **Vercel deployment** with edge functions and automatic CDN
- **Redis caching** (Upstash) for session management and analytics caching
- **Connection pooling** for database efficiency during traffic spikes

**Development Environment & Containerization:**

- **Docker Compose** for consistent local development environment
- **PostgreSQL container** for isolated local database development
- **Redis container** for local caching and session testing
- **Hot reload capabilities** with Docker volumes for rapid development
- **Multi-stage Docker builds** for production deployment optimization
- **Environment parity** ensuring development closely matches production

**Development & Deployment:**

- **GitHub Actions** for CI/CD pipeline with automated testing
- **Docker integration** in CI/CD for consistent build and test environments
- **ESLint + Prettier** for code quality and consistency
- **Husky** pre-commit hooks for quality gates

**Analytics & Monitoring:**

- **Vercel Analytics** for performance monitoring
- **Sentry** for error tracking and debugging
- **Custom analytics engine** for statistical calculations using Chart.js

**Security & Compliance:**

- **NextAuth.js** for authentication with JWT tokens
- **bcrypt** for password hashing
- **HTTPS enforcement** and security headers
- **Basic PDPA compliance** through consent forms
