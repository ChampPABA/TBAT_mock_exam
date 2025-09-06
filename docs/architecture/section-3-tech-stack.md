# Section 3: Tech Stack

**DEFINITIVE Technology Selection - Single Source of Truth**

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.0+ | Type-safe frontend development | Exam-critical reliability requires compile-time error detection |
| **Frontend Framework** | Next.js | 14+ | Full-stack React with App Router | Unified development, excellent Thai i18n support, Vercel optimization |
| **UI Component Library** | shadcn/ui | Latest | Design system components | Professional Thai educational UI, accessibility built-in, rapid development |
| **Styling** | Tailwind CSS | 3.3+ | Utility-first CSS framework | Mobile-first responsive design, consistent spacing, fast iteration |
| **UI Primitives** | Radix UI | Latest | Accessible component primitives | WCAG 2.1 AA compliance, Thai language support, exam accessibility |
| **Backend Language** | TypeScript | 5.0+ | Unified full-stack development | Single language reduces complexity, type safety across entire stack |
| **Backend Framework** | Next.js API Routes | 14+ | Serverless API endpoints | Seamless integration, automatic scaling, simplified deployment |
| **API Type Safety** | tRPC | 10+ | End-to-end type safety | Eliminates API contract drift, reduces development errors |
| **Database** | PostgreSQL | 15+ | Primary data storage | ACID compliance for exam data, excellent JSON support, mature ecosystem |
| **Database Hosting** | Vercel Postgres | Serverless | Managed PostgreSQL service | Zero configuration, automatic scaling, integrated with Vercel platform |
| **ORM** | Prisma | 5.0+ | Database abstraction layer | Type-safe database queries, excellent TypeScript integration, migrations |
| **File Storage** | Vercel Blob | Serverless | PDF and asset storage | Integrated CDN, cost-effective, automatic scaling |
| **Caching** | Vercel Edge Config | Serverless | Session capacity and configuration | Global edge distribution, real-time updates, high performance |
| **Authentication** | NextAuth.js | 4.0+ | User authentication system | Secure session management, social login support, Thai market compatibility |
| **Payment Processing** | Stripe | Latest | Thai Baht payment handling | Established in Thailand, THB support, comprehensive documentation |
| **Email Service** | Resend | Latest | Transactional emails | Developer-friendly, reliable delivery, cost-effective for volume |
| **Deployment Platform** | Vercel | Latest | Application hosting | Zero-configuration deployment, automatic scaling, integrated monitoring |
| **Monitoring** | Vercel Analytics | Built-in | Performance monitoring | Real-time insights, user behavior tracking, performance optimization |
| **Version Control** | Git | Latest | Source code management | Industry standard, GitHub integration, collaborative development |
| **Package Manager** | pnpm | 8.0+ | Dependency management | Fast installs, efficient disk usage, monorepo support |
| **Testing Framework** | Jest | 29+ | Unit and integration testing | Exam-critical reliability, extensive ecosystem, snapshot testing |
| **E2E Testing** | Playwright | Latest | Browser automation testing | Multi-browser support, exam workflow validation, accessibility testing |
| **Linting** | ESLint | 8.0+ | Code quality enforcement | Consistent code style, error prevention, team collaboration |
| **Code Formatting** | Prettier | 3.0+ | Automated code formatting | Consistent formatting, reduced merge conflicts, developer efficiency |
| **Build Tool** | Next.js Built-in | 14+ | Application building | Optimized bundling, automatic code splitting, production optimization |

### Technology Integration Strategy

**Development Workflow:**
1. **Type Safety:** Full-stack TypeScript with tRPC ensures exam data integrity
2. **Performance:** Next.js App Router with Vercel Edge Network for 200ms response times
3. **Reliability:** Prisma ORM with PostgreSQL for ACID compliance in exam transactions
4. **Scalability:** Serverless architecture automatically handles traffic spikes during registration
5. **Security:** NextAuth.js with Stripe integration for secure payment processing

**Quality Assurance:**
- **Testing:** Playwright for exam workflow validation, Jest for business logic
- **Monitoring:** Vercel Analytics for real-time performance tracking
- **Error Handling:** Comprehensive error boundaries with Thai language support
