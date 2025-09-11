# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The TBAT Mock Exam Platform is a greenfield Next.js application for Thai Biomedical Admissions Test (TBAT) mock exams, serving the Chiang Mai region. The platform combines physical exam experiences with digital analytics through a freemium model.

**Current Status**: Pre-development phase with comprehensive documentation and architecture planning completed.

## Development Architecture

### Tech Stack (Section 3: Tech Stack)

- **Frontend**: Next.js 14+ with App Router, TypeScript 5.0+, Tailwind CSS 3.3+
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: Next.js API Routes with tRPC for type safety
- **Database**: PostgreSQL 15+ with Prisma ORM on Vercel Postgres
- **Storage**: Vercel Blob for PDFs and assets
- **Authentication**: NextAuth.js 4.0+
- **Payments**: Stripe (Thai Baht support)
- **Deployment**: Vercel platform (all-in-one solution)
- **Testing**: Jest 29+ for unit tests, Playwright for E2E
- **Package Manager**: npm 9.0+

### Project Structure

This is a documentation-heavy project with comprehensive architecture planning:

- `docs/architecture/` - Complete technical architecture documentation
  - `section-2-high-level-architecture.md` - System overview and cost analysis
  - `section-3-tech-stack.md` - Technology decisions and integration strategy
  - `section-4-data-models.md` - TypeScript interfaces for all data models
- `.bmad-core/` - BMad Method development workflow and agent configurations
- `docs/stories/` - User stories and development tasks (referenced in git status)

### Development Workflow (BMad Method)

This project uses the BMad Method with specialized AI agents:

1. **Story Creation**: Scrum Master agent (`@sm *draft`)
2. **Implementation**: Developer agent (`@dev *develop-story {story}`)
3. **Quality Assurance**: Test Architect agent with comprehensive QA workflow
   - Risk assessment: `@qa *risk {story}`
   - Test design: `@qa *design {story}`
   - Requirements tracing: `@qa *trace {story}`
   - NFR validation: `@qa *nfr {story}`
   - Full review: `@qa *review {story}` (required before completion)

### Data Models

Key TypeScript interfaces defined in `docs/architecture/section-4-data-models.md`:

- **User Management**: `User`, `UserSession`
- **Exam System**: `ExamCode`, `SessionCapacity`
- **Payments**: `Payment` (Stripe integration with Thai Baht)
- **Results**: `ExamResult`, `Analytics`
- **PDF Management**: `PDFSolution`, `PDFDownload`, `PDFNotification`
- **Admin Operations**: `AdminUser`, `AuditLog`, `SupportTicket`

### Business Logic Constraints

- **Free Package**: Single subject access, basic results
- **Advanced Package**: All three subjects (Biology, Chemistry, Physics), detailed analytics, PDF solutions
- **Data Lifecycle**: 6-month expiry policy with automated cleanup
- **Session Capacity**: 20 concurrent users (2 sessions × 10 students each)
- **PDPA Compliance**: Thai data protection requirements

### Quality Standards

The Test Architect enforces these standards:

- No flaky tests (proper async handling)
- Stateless tests that run independently
- Appropriate test levels (unit/integration/E2E)
- 100% requirements coverage
- Clear quality gate decisions (PASS/CONCERNS/FAIL/WAIVED)

## Development Commands

**Note**: No package.json found in current state. The following commands are expected based on the tech stack:

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm test             # Run Jest tests
npm run test:e2e     # Run Playwright E2E tests

# Package management
npm install          # Install dependencies
npm run build        # Build project
```

## Key Implementation Notes

1. **Serverless-First**: All services leverage Vercel's integrated ecosystem
2. **Type Safety**: Full-stack TypeScript with tRPC eliminates API contract drift
3. **Thai Localization**: UI supports Thai language with appropriate formatting
4. **Cost Optimization**: Designed for ฿710/month operational costs at 20-user scale
5. **Security**: PDPA compliance, secure payment processing, audit logging
6. **Performance**: Target 200ms response times with Edge Network optimization

## CRITICAL WORKFLOW - MCP Tools Usage

### MANDATORY SEQUENCE FOR ALL TASKS

**1. Knowledge Retrieval Phase (START OF ANY TASK)**

```bash
# ALWAYS: Retrieve related context before starting any task
mcp__byterover-mcp__byterover-retrieve-knowledge --query "TBAT exam platform [specific feature]" --limit 3
```

**2. Development Context Loading**

```bash
# Load framework/library documentation
mcp__context7__resolve-library-id --libraryName "[framework/library-name]"
mcp__context7__get-library-docs --context7CompatibleLibraryID "/resolved/library/id" --tokens 5000 --topic "[relevant-topic]"
```

**3. Implementation Phase MCP Usage**

For UI Components (shadcn MCP Integration):

```bash
# Step 1: ALWAYS get component context via MCP server first
mcp__shadcn-ui__get_component_details --componentName "[component-name]"
mcp__shadcn-ui__get_component_examples --componentName "[component-name]"

# Step 2: Install component following MCP-guided patterns
npx shadcn-ui@latest add [component-name]

# Step 3: Implement using MCP demo as source-of-truth
```

For Testing (Playwright):

```bash
# Use Playwright MCP for browser automation and testing
mcp__playwright__browser_navigate --url "http://localhost:3000"  # Dev server
mcp__playwright__browser_snapshot  # For page analysis
mcp__playwright__browser_click --element "[element-description]" --ref "[element-ref]"
mcp__playwright__browser_fill_form --fields '[{"name":"field","type":"textbox","ref":"ref","value":"value"}]'
```

**4. Knowledge Storage Phase (END OF SUCCESSFUL TASKS)**

```bash
# ALWAYS: Store all critical information after successful tasks
mcp__byterover-mcp__byterover-store-knowledge --messages "implementation details, solutions, lessons learned, test results, performance metrics"
```

### Specific MCP Usage Guidelines

#### ByteRover MCP (Critical for All Tasks)

**Usage Pattern:**

- **MANDATORY BEFORE** starting any task: Retrieve context
- **MANDATORY AFTER** successful tasks: Store implementation knowledge
- Store critical bugs, solutions, patterns, and TBAT-specific learnings

**Key Commands:**

- `mcp__byterover-mcp__byterover-retrieve-knowledge` - Get related context
- `mcp__byterover-mcp__byterover-store-knowledge` - Store critical learnings

#### Context7 MCP (Documentation & Libraries - ~80% of tasks)

**When to use:**

- Next.js 14+ App Router implementation
- TypeScript/tRPC integration patterns
- Prisma ORM and database operations
- NextAuth.js authentication flows
- Stripe payment processing (Thai Baht)

**Pattern:**

1. Resolve library ID first
2. Get documentation with specific topics
3. Focus on TBAT platform requirements

#### Playwright MCP (Testing & UI Automation - ~60% of tasks)

**Critical for TBAT Platform:**

- Exam workflow E2E testing (registration → exam → results)
- Thai language UI testing and validation
- Payment flow testing with Stripe Thailand
- Performance testing for 20 concurrent users
- PDF download and accessibility testing

**Key Testing Scenarios:**

- User registration and package selection
- Exam code generation and validation
- Session capacity management (2 sessions × 10 users)
- Results analytics and PDF access (Advanced package)

#### shadcn/ui MCP (Smart Component Implementation - ~90% of UI tasks)

**TBAT-Specific Implementation Rules:**

1. **Always get component context first** via MCP before implementation
2. **Thai language support** - ensure components work with Thai text
3. **Accessibility compliance** for educational platform requirements
4. **Mobile-first responsive** design for exam interface

**Critical Components for TBAT:**

- Registration forms with Thai validation
- Exam dashboard with countdown timers
- Results display with analytics charts
- Payment forms with Thai Baht formatting
- Admin panels for user management

**MCP Pattern:**

```bash
# Get component details and examples
mcp__shadcn-ui__get_component_details --componentName "form"
mcp__shadcn-ui__get_component_examples --componentName "form"

# Install and implement following exact MCP patterns
npx shadcn-ui@latest add form
# Follow MCP demo patterns exactly for consistency
```

### MCP Integration Best Practices

1. **Context First**: Always retrieve relevant knowledge before starting
2. **Pattern Following**: Use MCP demos as authoritative implementation guides
3. **Thai Localization**: Validate all MCP implementations work with Thai language
4. **Performance Awareness**: Consider 200ms response time targets in all implementations
5. **Knowledge Storage**: Store all TBAT-specific patterns and solutions for team learning

### Common MCP Workflows for TBAT Platform

**User Registration Flow:**

```bash
# 1. Get context
mcp__byterover-mcp__byterover-retrieve-knowledge --query "TBAT user registration form validation"

# 2. Get shadcn form patterns
mcp__shadcn-ui__get_component_examples --componentName "form"

# 3. Implement with NextAuth context
mcp__context7__get-library-docs --context7CompatibleLibraryID "/nextauthjs/next-auth"

# 4. Test with Playwright
mcp__playwright__browser_fill_form --fields '[registration_data]'

# 5. Store learnings
mcp__byterover-mcp__byterover-store-knowledge --messages "Thai form validation patterns, NextAuth integration"
```

**Exam Interface Development:**

```bash
# Context retrieval for exam UI patterns
mcp__byterover-mcp__byterover-retrieve-knowledge --query "TBAT exam interface timer countdown"

# Get component patterns
mcp__shadcn-ui__get_component_details --componentName "dialog"

# Test exam workflows
mcp__playwright__browser_navigate --url "http://localhost:3000/exam"
mcp__playwright__browser_evaluate --function "() => { /* timer validation */ }"

# Store exam-specific patterns
mcp__byterover-mcp__byterover-store-knowledge --messages "Exam timer implementation, session management patterns"
```

## Development Phase Strategy

- **Phase 1 (Current)**: Mock-first development with comprehensive UI implementation using MCP-guided patterns
- **Phase 2 (Future)**: Full database integration and real-time analytics with MCP testing validation
- **Testing**: Exam workflow validation critical for platform reliability using Playwright MCP automation
