# TBAT Mock Exam Platform - Source Tree

> **Document Status:** v1.0 - Practical Project Structure
> **Last Updated:** 2025-01-03
> **Purpose:** Navigation map for developers and AI assistants

## 🎯 Structure Philosophy

- **Feature-First** - Group by feature, not file type
- **Colocation** - Keep related files together
- **Shallow Nesting** - Max 3-4 levels deep
- **Clear Boundaries** - Obvious where code belongs

---

## 📁 Project Root Structure

```
TBAT_mock_exam/
├── .bmad-core/                 # BMad framework files
├── .github/                    # GitHub Actions, PR templates
├── apps/                       # Application packages (monorepo)
│   └── web/                   # Main Next.js application
├── packages/                   # Shared packages (monorepo)
│   ├── database/              # Prisma schema & migrations
│   ├── ui/                    # Shared UI components
│   └── mock-services/         # Phase 1 mock data layer
├── docs/                       # Project documentation
│   ├── architecture/          # Tech decisions, standards
│   ├── prd/                   # Product requirements (sharded)
│   ├── stories/               # User stories & features
│   └── qa/                    # QA test plans
├── public/                     # Static assets
└── [Config Files]             # package.json, tsconfig, etc.
```

---

## 🚀 Main Application Structure (`apps/web/`)

```
apps/web/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth group route
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx         # Auth-specific layout
│   │
│   ├── (student)/             # Student interface group
│   │   ├── exam/
│   │   │   ├── [examId]/
│   │   │   │   ├── page.tsx   # Exam taking page
│   │   │   │   ├── questions/
│   │   │   │   └── submit/
│   │   ├── results/
│   │   ├── history/
│   │   └── layout.tsx         # Student navigation
│   │
│   ├── (teacher)/             # Teacher interface group
│   │   ├── dashboard/
│   │   ├── exams/
│   │   │   ├── create/
│   │   │   ├── [examId]/
│   │   │   └── analytics/
│   │   ├── students/
│   │   └── layout.tsx         # Teacher navigation
│   │
│   ├── api/                   # API Routes
│   │   ├── auth/
│   │   ├── exams/
│   │   ├── submissions/
│   │   └── analytics/
│   │
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
│
├── components/                 # React Components
│   ├── exam/                  # Exam-specific components
│   │   ├── ExamTimer/
│   │   │   ├── ExamTimer.tsx
│   │   │   ├── ExamTimer.test.tsx
│   │   │   └── index.ts
│   │   ├── QuestionDisplay/
│   │   ├── AnswerSheet/
│   │   └── ExamProgress/
│   │
│   ├── analytics/             # Analytics components
│   │   ├── ScoreChart/
│   │   ├── PerformanceGrid/
│   │   └── StudentReport/
│   │
│   ├── ui/                    # Base UI components (shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── [other shadcn components]
│   │
│   └── shared/                # Shared/common components
│       ├── Header/
│       ├── Footer/
│       ├── LoadingState/
│       └── ErrorBoundary/
│
├── lib/                        # Utilities & Helpers
│   ├── api/                   # API client functions
│   │   ├── client.ts          # Base API client
│   │   ├── exams.ts           # Exam-related API calls
│   │   └── auth.ts            # Auth API calls
│   ├── utils/                 # Utility functions
│   │   ├── formatters.ts      # Date, number formatters
│   │   ├── validators.ts      # Input validation
│   │   └── exam-helpers.ts    # Exam-specific utilities
│   ├── hooks/                 # Custom React hooks
│   │   ├── useExamSession.ts
│   │   ├── useCountdown.ts
│   │   └── useAutoSave.ts
│   └── constants/             # App-wide constants
│       ├── exam.constants.ts
│       └── routes.constants.ts
│
├── types/                      # TypeScript type definitions
│   ├── exam.types.ts
│   ├── student.types.ts
│   ├── api.types.ts
│   └── database.types.ts      # Generated from Prisma
│
├── styles/                     # Additional styles
│   └── exam-print.css         # Print styles for exams
│
└── middleware.ts              # Next.js middleware (auth, etc.)
```

---

## 📦 Shared Packages Structure

### `packages/database/`
```
packages/database/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration files
│   └── seed.ts               # Seed data script
├── src/
│   ├── client.ts             # Prisma client export
│   └── queries/              # Reusable query functions
└── package.json
```

### `packages/ui/`
```
packages/ui/
├── src/
│   ├── components/           # Shared UI components
│   ├── styles/              # Shared styles
│   └── index.ts             # Public exports
└── package.json
```

### `packages/mock-services/`
```
packages/mock-services/
├── src/
│   ├── data/                # Mock data files
│   │   ├── exams.json
│   │   ├── students.json
│   │   └── submissions.json
│   ├── services/            # Mock service implementations
│   │   ├── examService.ts
│   │   └── authService.ts
│   └── index.ts
└── package.json
```

---

## 🧪 Test Files Organization

```
[Any Directory]/
├── ComponentName/
│   ├── ComponentName.tsx
│   ├── ComponentName.test.tsx    # Unit tests (colocated)
│   └── ComponentName.stories.tsx  # Storybook stories

e2e/                               # E2E tests (root level)
├── exam-flow.spec.ts
├── teacher-dashboard.spec.ts
└── student-registration.spec.ts
```

---

## 📝 File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| **Components** | PascalCase | `ExamTimer.tsx` |
| **Utilities** | camelCase | `formatTime.ts` |
| **Hooks** | camelCase with 'use' | `useExamSession.ts` |
| **Types** | camelCase with '.types' | `exam.types.ts` |
| **Constants** | camelCase with '.constants' | `routes.constants.ts` |
| **Tests** | Same as source with '.test' | `ExamTimer.test.tsx` |
| **API Routes** | kebab-case folders | `api/submit-exam/route.ts` |

---

## 🎯 Import Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./app/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"],
      "@/ui/*": ["./components/ui/*"],
      "@tbat/database": ["../../packages/database/src"],
      "@tbat/ui": ["../../packages/ui/src"],
      "@tbat/mock": ["../../packages/mock-services/src"]
    }
  }
}
```

---

## 🚦 Development Phases

### Phase 1 (Current) - Mock Services
```
Focus Areas:
├── apps/web/app/          # Build all UI routes
├── apps/web/components/   # Create all components
├── packages/mock-services/ # Mock data layer
└── e2e/                   # E2E tests
```

### Phase 2 - Database Integration
```
Add/Modify:
├── packages/database/     # Setup Prisma schema
├── apps/web/app/api/     # Real API routes
└── lib/api/              # Connect to real APIs
```

### Phase 3 - Production Features
```
Add:
├── apps/admin/           # Admin dashboard app
├── packages/analytics/   # Analytics service
└── packages/notifications/ # Email/SMS service
```

---

## 📍 Quick Navigation Guide

| I want to... | Go to... |
|--------------|----------|
| Add a new page | `apps/web/app/[route]/page.tsx` |
| Create exam component | `apps/web/components/exam/` |
| Add API endpoint | `apps/web/app/api/[endpoint]/route.ts` |
| Define new types | `apps/web/types/*.types.ts` |
| Add utility function | `apps/web/lib/utils/` |
| Create custom hook | `apps/web/lib/hooks/` |
| Add shadcn component | `apps/web/components/ui/` |
| Write E2E test | `e2e/*.spec.ts` |
| Add mock data | `packages/mock-services/src/data/` |
| Update schema | `packages/database/prisma/schema.prisma` |

---

## 🔒 Security & Private Files

```
NEVER COMMIT:
├── .env.local            # Local environment variables
├── .env.production       # Production secrets
├── *.key                 # Private keys
└── /temp/               # Temporary files

ALWAYS COMMIT:
├── .env.example         # Example environment variables
└── .env.development     # Development defaults (no secrets)
```

---

## 💡 Best Practices

1. **Colocation** - Keep tests, styles, and types with components
2. **Barrel Exports** - Use index.ts for clean imports
3. **Feature Folders** - Group by feature, not file type
4. **Shared Code** - Put in packages/ for reuse
5. **Clear Boundaries** - Obvious where new code belongs

---

*This structure scales from MVP to production. Start simple, expand as needed.*