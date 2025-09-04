# 7. Implementation Strategy (v6.0)

**Version 6.0 Updates (Cycle 2 Implementation Plan):**
- Rebranding phase: Global VVIP → Advanced Package migration
- Post-exam upgrade flow implementation (฿290)
- TBAT scoring system integration
- Box plot visualization development
- LINE QR integration
- Dentorium Camp gallery feature
- Role-based authentication enhancement

### 7.1 Development Approach: Cycle 2 Enhancement (21-Day Sprint)

**Updated Sprint Plan based on Change Proposal:**

**Week 1: Rebranding & Foundation Updates (Days 1-7)**
- Global terminology update: VVIP → Advanced Package (26 files)
- Database schema updates for post-exam upgrade tracking
- Enhanced authentication with role-based routing
- LINE QR integration setup
- TBAT scoring formula implementation
- Protected routes middleware development

**Week 2: New Features & Monetization (Days 8-14)**
- Post-exam upgrade flow implementation (฿290)
- Box plot visualization component development
- Answer key access control for dual-tier users
- Dentorium Camp photo gallery feature
- Enhanced Stripe integration (dual pricing)
- Updated results display with TBAT scoring

**Week 3: Integration & Testing (Days 15-21)**
- End-to-end testing of all updated flows
- Post-exam upgrade payment validation
- Box plot rendering performance testing
- LINE integration testing
- Gallery optimization and responsive design
- Role-based authentication security audit
- Client approval and production deployment

### 7.2 Epic Breakdown for Freemium Model

**Critical Path Epics:**

**Epic 0: Database Migration & Safety**
- Complete database backup procedures
- Schema migration for tier system
- Rollback procedures testing
- Data integrity verification
- Migration documentation

**Epic 1: Free Registration System**
- Remove BoxSet code validation
- Add Line ID integration
- Parent information fields (optional)
- Auto-generate FREE codes
- Subject selection during registration

**Epic 2: Payment Integration (Stripe)**
- Stripe Checkout implementation
- Webhook security and processing
- Payment confirmation flow
- Receipt generation
- Failed payment handling

**Epic 3: Enhanced Tier Management System**
- Free tier limitations
- Advanced Package full access features
- Post-exam upgrade tier (฿290, 6-month access)
- Dual-tier feature gating logic
- Updated upgrade CTAs with pricing options
- Dashboard differentiation for all tiers

**Supporting Epics:**

**Epic 4: Enhanced Analytics & Visualization**
- TBAT scoring calculation integration
- Box plot component for score distribution
- Updated conversion funnel (690/290 THB)
- Post-exam upgrade tracking
- LINE integration analytics
- Gallery performance monitoring

**Epic 5: Email & Communication**
- Welcome email for free users
- Upgrade confirmation emails
- Payment receipts
- Result notifications
- Marketing automation setup

**Epic 6: Production Readiness**
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
