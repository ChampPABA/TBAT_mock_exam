# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TBAT Mock Exam Platform** - A hybrid offline/online Thai Biomedical Admissions Test (TBAT) mock exam platform for high school students in Chiang Mai. The system combines physical exam booklets with online analytics and results tracking.

**Current Status:** Greenfield project in documentation phase (94% production ready according to PO validation). No source code implemented yet - comprehensive planning and architecture documentation completed.

## Core Development Philosophy

You are an AI development assistant specialized in building this exam platform with rapid development cycles while maintaining exam-critical quality standards. Your primary focus is implementing the documented architecture using modern tools and maintaining comprehensive knowledge continuity.

## CRITICAL WORKFLOW - MCP Tools Usage

**MANDATORY SEQUENCE FOR ALL TASKS:**

### 1. Knowledge Retrieval Phase (START OF ANY TASK)

```bash
# ALWAYS: Retrieve related context before starting any task
mcp__byterover-mcp__byterover-retrieve-knowledge --query "TBAT exam platform [specific feature]" --limit 3
```

### 2. Development Context Loading

```bash
# Load project context and documentation
mcp__context7__resolve-library-id --libraryName "[framework/library-name]"
mcp__context7__get-library-docs --context7CompatibleLibraryID "/resolved/library/id" --tokens 5000 --topic "[relevant-topic]"
```

### 3. Implementation Phase MCP Usage

**For UI Components (shadcn MCP Integration):**
```bash
# Step 1: ALWAYS get component context via MCP server first
[Use MCP server to pull proper usage examples and patterns]

# Step 2: Install component following MCP-guided patterns
npx shadcn-ui@latest add [component-name]

# Step 3: Implement using MCP demo as source-of-truth
```

**For Testing (Playwright):**
```bash
# Use Playwright MCP for browser automation and testing
mcp__playwright__browser_navigate --url "http://localhost:[dev-port]"  # Check actual port (usually 3000, 3001, etc.)
mcp__playwright__browser_snapshot  # For page analysis
mcp__playwright__browser_click --element "[element-description]" --ref "[element-ref]"
```

### 4. Knowledge Storage Phase (END OF SUCCESSFUL TASKS)

```bash
# ALWAYS: Store all critical information after successful tasks
mcp__byterover-mcp__byterover-store-knowledge --messages "implementation details, solutions, lessons learned, test results, performance metrics"
```

## SPECIFIC MCP USAGE GUIDELINES

### ByteRover MCP (Critical Issues & Important Tasks)
**When to use:**
- **ALWAYS BEFORE** starting any task: Retrieve related context using `byterover-retrieve-knowledge`
- **ALWAYS AFTER** successful tasks: Store all critical information using `byterover-store-knowledge`

**Commands:**
- `mcp__byterover-mcp__byterover-retrieve-knowledge`
- `mcp__byterover-mcp__byterover-store-knowledge`

### Context7 MCP (Documentation & Libraries - ~80% of tasks)
**When to use:**
- When implementing new frameworks or libraries
- When needing up-to-date documentation
- For complex API integrations

**Commands:**
- `mcp__context7__resolve-library-id` (first, to get library ID)
- `mcp__context7__get-library-docs` (second, to get documentation)

### Playwright MCP (Testing & UI Automation - ~60% of tasks)
**When to use:**
- Writing E2E tests for exam workflows
- Testing UI components and user interactions
- Performance testing for 200+ concurrent users
- Accessibility compliance validation

**Commands:**
- `mcp__playwright__browser_navigate`
- `mcp__playwright__browser_snapshot`
- `mcp__playwright__browser_click`
- `mcp__playwright__browser_fill_form`
- `mcp__playwright__browser_evaluate`

### shadcn/ui MCP (Smart Component Implementation - ~90% of UI tasks)
**When to use:**
- Building any UI component with proper context
- Creating forms, buttons, dialogs, etc.
- Implementing design system components with consistent patterns
- When generating or revising UI plans that involve shadcn

**MCP Implementation Rules:**
1. **Always begin** by calling MCP server to get proper usage examples and context
2. **Mirror implementation patterns** shown in the MCP demo exactly
3. **Use demo as context snapshot** - don't improvise unless required
4. **Check for existing Block components** first before composing manually (for multi-component flows like forms, modals, auth flows)

**Commands:**
```bash
# Step 1: Get shadcn component context and examples via MCP
[Use appropriate MCP command to get component demo and usage patterns]

# Step 2: Install component following MCP-provided patterns
npx shadcn-ui@latest add [component-name]

# Step 3: Implement following exact MCP demo patterns
```

## Enhanced Tech Stack & Architecture

### Core Technologies

- **Framework:** Next.js 14+ with App Router and TypeScript
- **UI Library:** shadcn/ui components with Tailwind CSS and Radix UI
- **Database:** PostgreSQL (Neon serverless) with Prisma ORM
- **Deployment:** Vercel with GitHub Actions CI/CD
- **Monorepo:** Turborepo architecture planned

### AI & Context Management Tools

- **MCP (Model Context Protocol)**: For AI-powered analytics and student performance insights
- **context7**: Maintain development context across sessions and team collaboration
- **ByteRover**: Knowledge continuity and solution storage

### Testing & Quality Assurance

- **Playwright**: Critical for exam workflow testing
  - End-to-end exam session testing
  - Multi-browser compatibility (exam accessibility)
  - Performance testing for 200+ concurrent users
  - Accessibility compliance testing

### Development Strategy

**Enhanced Two-Phase Mock-First Approach:**

1. **Phase 1:** UI implementation with mock data services (current focus)
   - Integrate MCP for analytics simulation
   - Use context7 for development state tracking
2. **Phase 2:** Database integration with AI-powered insights

### Project Structure (Enhanced)

```
/apps/
  /web/                    # Next.js application
/packages/
  /ui/                     # Shared shadcn/ui components
  /lib/                    # Shared utilities
  /mock-services/          # Mock data services (Phase 1)
  /mcp-servers/            # MCP configurations for AI features
  /playwright-tests/       # E2E test suites
```

## Enhanced Development Workflow

### 1. Knowledge Retrieval Phase (MANDATORY START)

```bash
# STEP 1: Load existing TBAT platform knowledge (MANDATORY)
mcp__byterover-mcp__byterover-retrieve-knowledge --query "TBAT [current-task] implementation" --limit 3

# STEP 2: Get relevant library documentation if needed
mcp__context7__resolve-library-id --libraryName "[framework/library]"
mcp__context7__get-library-docs --context7CompatibleLibraryID "/resolved/id" --tokens 5000

# STEP 3: Review current documentation and story status
```

### 2. Planning Phase

- Analyze retrieved knowledge and BMad documentation
- Plan implementation using shadcn + MCP architecture
- Design Playwright test strategies for exam-critical workflows
- Consider performance targets (200+ concurrent users)
- Review current story requirements in `docs/stories/`

### 3. Implementation Phase

**UI Development (shadcn MCP-First Approach):**
```bash
# Step 1: Route through MCP server for component structure and UX flow
[Get component demo and usage context via MCP]

# Step 2: Prioritize component usage where atomic UI pieces are needed
npx shadcn-ui@latest add [component-name]

# Step 3: Prefer entire UI blocks (login, dashboard, calendar) when they exist
[Check for existing Block components first]

# Step 4: Treat MCP output as source-of-truth for layout and flow decisions
```

**Testing Development:**
```bash
# Use Playwright MCP for E2E testing
mcp__playwright__browser_navigate --url "http://localhost:[dev-port]"  # Check actual dev server port
mcp__playwright__browser_snapshot
mcp__playwright__browser_click --element "[description]" --ref "[ref]"
```

**Documentation Lookup (when needed):**
```bash
# Get up-to-date library docs
mcp__context7__get-library-docs --context7CompatibleLibraryID "/library/id" --tokens 3000 --topic "[topic]"
```

### 4. Validation & Storage Phase (MANDATORY END)

```bash
# STEP 1: Run validation workflows
npm run lint  # or appropriate linting command
npm run test  # or appropriate testing command

# STEP 2: Final E2E testing with Playwright MCP (if UI changes)
mcp__playwright__browser_navigate --url "http://localhost:[dev-port]"  # Use actual running port
mcp__playwright__browser_snapshot

# STEP 3: ALWAYS - Store all critical information after successful tasks
mcp__byterover-mcp__byterover-store-knowledge --messages "implementation details, solutions, test results, performance metrics, lessons learned"
```

## Code Quality Standards

### UI/UX Standards

- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1)
- Dark/light theme support
- Smooth animations and transitions
- Loading states and error handling

### Testing Standards

```typescript
// Example Playwright test structure
test.describe("AI Feature Integration", () => {
  test("should handle AI responses correctly", async ({ page }) => {
    // Test implementation
  });
});
```

### Performance Standards

- Lazy loading for components
- Optimized bundle sizes
- Fast API responses
- Efficient state management

## AI Product Specific Guidelines

### MCP Integration Best Practices

- Use MCP servers for different AI capabilities
- Implement proper error handling for AI responses
- Cache AI responses when appropriate
- Handle rate limiting gracefully

### User Experience for AI Features

- Show loading indicators for AI processing
- Provide fallback options when AI fails
- Allow users to modify AI outputs
- Clear feedback on AI actions

### Data Handling

- Secure handling of user data
- Proper consent management
- Data retention policies
- Privacy-first design

## File Structure Recommendations

```
project/
├── components/ui/          # shadcn components
├── components/ai/          # AI-specific components
├── lib/mcp/               # MCP configurations
├── tests/playwright/       # E2E tests
├── context/               # Context7 configurations
└── docs/                  # Project documentation
```

## Business Context & AI Enhancement

**Target Market:** Private tutoring centers in Chiang Mai serving 200+ high school students annually preparing for TBAT medical school entrance exams.

**Enhanced Success Metrics with AI:**

- 95%+ exam completion rate (monitored via real-time analytics)
- <2% technical failure rate during exams (Playwright-validated reliability)
- 90%+ user satisfaction with AI-powered analytics features
- 50%+ efficiency improvement in exam administration
- **New AI Metrics:**
  - 85%+ accuracy in performance prediction models
  - 75%+ student engagement with AI-driven recommendations
  - 60%+ reduction in manual analytics generation time

## Rapid Development Strategy

### Mock-First Development with AI

1. **Component Reuse:** Leverage shadcn/ui component library extensively
2. **MCP Templates:** Create reusable MCP server configurations for different analytics
3. **Playwright Templates:** Use exam-specific test templates for critical scenarios
4. **Knowledge Base:** Utilize ByteRover's stored solutions for similar educational platforms

### Performance Optimization Framework

```typescript
// TBAT-specific performance monitoring
const performanceMetrics = {
  examLoad: { target: "<2s", critical: true },
  submission: { target: "<3s", critical: true },
  analytics: { target: "<5s", standard: true },
  aiInsights: { target: "<10s", enhanced: true },
};
```

## AI-Enhanced Development Notes

### Current Enhanced Capabilities

- **Architecture:** Fully planned with AI integration points identified
- **Knowledge Continuity:** ByteRover ensures no solution is lost across development sessions
- **Context Management:** context7 maintains team alignment and project state
- **Quality Assurance:** Playwright ensures exam-critical reliability
- **Mock-First + AI:** Phase 1 includes AI analytics simulation with MCP

### Future AI Evolution Path

- **Phase 1:** Mock data with MCP analytics simulation
- **Phase 2:** Real database integration with ML-driven insights
- **Phase 3:** Advanced AI features (adaptive testing, predictive analytics)
- **Phase 4:** Multi-language AI support and accessibility enhancements

### Knowledge Management Strategy

```bash
# Critical knowledge areas to maintain in ByteRover:
- Exam workflow implementations and edge cases
- Performance optimization solutions for 200+ concurrent users
- shadcn/ui component customizations for TBAT design system
- MCP server configurations and AI analytics patterns
- Playwright test strategies for exam-critical scenarios
- BMad framework integration patterns and validation results
```

## Important Development Reminders

**ALWAYS REMEMBER:**

1. **ByteRover First:** Retrieve knowledge before starting, store solutions after completion
2. **Exam-Critical Quality:** Every feature impacts student futures - test thoroughly
3. **Performance Priority:** 200+ concurrent users during exam periods - optimize everything
4. **Mobile-First:** Students use various devices - ensure responsive design
5. **Offline Capability:** Network issues during exams are unacceptable - build resilience
6. **AI Ethics:** Performance insights should encourage, never discourage students
7. **BMad Validation:** Use framework checklists to ensure production readiness

**Success Formula:** ByteRover Knowledge + shadcn/ui Speed + MCP Intelligence + Playwright Reliability + BMad Quality = Exam-Critical Excellence
