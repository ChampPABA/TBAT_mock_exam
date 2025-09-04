# TBAT Mock Exam Platform - Tech Stack

> **Document Status:** v1.0 - Lean Production Stack
> **Last Updated:** 2025-01-03
> **Purpose:** Core technology decisions and rationales for exam-critical system

## 🎯 Selection Criteria

All technology choices prioritize:
1. **Exam Reliability** - Zero failures during critical exam periods
2. **Rapid Development** - Ship Phase 1 quickly with quality
3. **Thai Market Fit** - Performance in Thai network conditions
4. **Cost Efficiency** - Optimize for 200+ students/exam cycle

---

## 🏗️ Core Stack

### Frontend Framework
**Decision: Next.js 14 (App Router)**
- **Why:** SSR for fast initial loads on varying network speeds
- **Why Not Vite/SPA:** SEO matters for tutoring center discovery
- **Critical Feature:** Parallel routes for student/teacher interfaces

### UI Components
**Decision: shadcn/ui + Radix UI**
- **Why:** Copy-paste components = rapid customization
- **Why Not MUI/Ant Design:** Too opinionated for exam-specific UX
- **Critical Feature:** Accessible by default (WCAG compliance)

### Styling
**Decision: Tailwind CSS**
- **Why:** Mobile-first utility classes, tiny production CSS
- **Why Not CSS-in-JS:** Performance overhead unacceptable for exams
- **Critical Feature:** Dark mode support built-in

### Database
**Decision: PostgreSQL (Neon Serverless)**
- **Why:** ACID transactions critical for exam submissions
- **Why Not MongoDB:** Cannot risk eventual consistency for scores
- **Critical Feature:** Connection pooling for 200+ concurrent users

### ORM
**Decision: Prisma**
- **Why:** Type-safe queries, automatic migrations
- **Why Not Drizzle:** Prisma's maturity for exam-critical operations
- **Critical Feature:** Transaction API for multi-step submissions

### Deployment
**Decision: Vercel**
- **Why:** Zero-config Next.js deployment, Bangkok edge location
- **Why Not AWS/GCP:** Complexity overhead for small team
- **Critical Feature:** Automatic rollback on failed deployments

---

## 📦 Essential Libraries

### Form Handling
**react-hook-form + zod**
- Validation before network round-trip
- Type-safe form schemas

### State Management  
**Zustand** (client) + **React Query** (server state)
- Lightweight, no boilerplate
- Automatic cache invalidation

### Testing
**Playwright** (E2E) + **Vitest** (Unit)
- Playwright for exam workflow testing
- Vitest for fast component tests

### Analytics
**Vercel Analytics** + **Custom Events**
- Built-in Web Vitals monitoring
- Custom exam completion tracking

---

## 🚀 Development Tools

### Package Manager
**pnpm** - Disk space efficiency, faster installs

### Monorepo Tool
**Turborepo** - Incremental builds, parallel execution

### Code Quality
- **ESLint** - Next.js config preset
- **Prettier** - Consistent formatting
- **Husky** - Pre-commit hooks for quality gates

---

## 🔒 Security & Performance

### Authentication
**NextAuth.js v5** 
- Session-based auth for exam security
- Support for future OAuth providers

### File Uploads
**Vercel Blob Storage**
- Direct uploads from client
- Automatic image optimization

### Caching Strategy
- **ISR** for static content (instructions, examples)
- **Dynamic** for exam sessions and live data
- **Edge caching** for API responses where applicable

---

## 📊 Performance Budgets

```typescript
// Critical metrics for exam experience
const performanceBudgets = {
  examPageLoad: {
    FCP: 1.5,  // First Contentful Paint < 1.5s
    TTI: 3.5,  // Time to Interactive < 3.5s
    CLS: 0.1,  // Cumulative Layout Shift < 0.1
  },
  bundleSize: {
    firstLoad: 150,  // First load JS < 150kB
    perRoute: 85,    // Per-route JS < 85kB
  },
  apiResponse: {
    submitAnswer: 500,   // < 500ms
    loadQuestion: 300,   // < 300ms
    generateReport: 5000, // < 5s
  }
};
```

---

## 🎓 Phase-Specific Stack

### Phase 1 (Current) - Mock Data MVP
- **Mock Services** via local JSON/TypeScript
- **MSW** for API mocking in development
- **Faker.js** for realistic test data

### Phase 2 (Planned) - Production Data
- **Database migrations** via Prisma
- **Background jobs** via Vercel Cron
- **Email service** via Resend

---

## ❌ Explicitly NOT Using

| Technology | Reason for Exclusion |
|------------|---------------------|
| **GraphQL** | Overhead for CRUD-heavy exam app |
| **Microservices** | Premature complexity for team size |
| **Redis** | Vercel KV sufficient for session storage |
| **Docker** | Vercel handles containerization |
| **Complex State (Redux)** | Zustand covers all current needs |

---

## 📝 Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12 | Next.js over Remix | Vercel ecosystem integration |
| 2024-12 | PostgreSQL over MySQL | Better JSON support for exam metadata |
| 2024-12 | shadcn over Material UI | Customization freedom for exam UX |

---

## 🔄 Review Schedule

- **Quarterly** - Library updates and security patches
- **Per Feature** - Evaluate if new dependencies needed
- **Post-Exam** - Performance analysis and optimization

---

*This is a living document. Update when making significant technology decisions.*