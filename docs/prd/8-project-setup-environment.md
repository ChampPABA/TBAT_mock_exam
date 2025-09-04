# 8. Project Setup & Environment

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
