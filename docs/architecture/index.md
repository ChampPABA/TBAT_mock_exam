# System Architecture Document

## Table of Contents

- [System Architecture Document](#system-architecture-document)
  - [Version History](./version-history.md)
  - [Addresses to PO Validation Issues (v2.0 → v2.1 Final Updates)](./addresses-to-po-validation-issues-v20-v21-final-updates.md)
  - [✅ Ready for Production Development](./ready-for-production-development.md)
  - [**NEW** - Freemium Model Architecture (v3.0)](#freemium-model-architecture-v30)

## Freemium Model Architecture (v3.0)

**🔄 MAJOR PIVOT - Sprint Change Proposal v4.0 (2025-01-03)**

### Critical Scope Clarification
**TBAT is a registration and results portal for PHYSICAL exams** - NOT an online exam platform. This pivot to Freemium model reduces development complexity by 70% while maximizing market reach.

### Architectural Decision Records (ADRs)
- [ADR-001: Secure Code Generation Algorithm](./adr-001-secure-code-generation.md) *(Superseded)*
- [ADR-002: Freemium Model Architecture](./adr-002-freemium-model-architecture.md) **✨ NEW - PRIMARY**

### Freemium Architecture Documentation
- [API Specification - Freemium Model](./api-specification-freemium.md) **✨ NEW**
- [Payment Security Architecture](./payment-security-architecture.md) **✨ NEW**
- [Migration Plan: BoxSet to Freemium](./migration-to-freemium.md) **✨ NEW**
- [Component Library Integration with Variant 6 Design System](./component-library-variant6-integration.md)

### Key Freemium Architecture Changes

#### 🎯 **Business Model Transformation**
- **FREE Tier:** Register for 1 subject, basic results access
- **VVIP Tier (฿690):** Register for 3 subjects, detailed analytics
- **Zero Friction:** No code required for registration
- **Physical Exam Support:** Portal for venue-based exams in Chiang Mai

#### 💳 **Payment Integration**
- **Stripe Checkout:** PCI DSS SAQ-A compliant payment processing
- **Thai Payment Methods:** Card and PromptPay support
- **Webhook Security:** Signature validation and idempotency
- **Upgrade Paths:** Pre-exam or post-results upgrade options

#### 🔒 **Enhanced Security Architecture**
- **Zero Trust Model:** Never store card data on servers
- **Defense in Depth:** Multiple security layers
- **PDPA Compliance:** Thai data protection regulations
- **Fraud Prevention:** Velocity checks and device fingerprinting

#### 🚀 **Simplified Implementation**
- **14-Day Timeline:** Reduced from 21 days (30% faster)
- **70% Less Complex:** No online exam features needed
- **Migration Ready:** Safe transition from BoxSet model
- **Rollback Capable:** Full backup and restore procedures

### Implementation Readiness

✅ **All Freemium Documentation Complete:**
- ADR-002 defines complete Freemium architecture and data flows
- API Specification with all endpoints documented
- Payment Security Architecture with PCI DSS compliance
- Migration Plan with safe rollback procedures
- Component library integration with Variant 6 design system

✅ **Development Ready:**
- **Week 1:** Database migration and registration system
- **Week 2:** Payment integration and tier dashboards
- **Testing:** E2E scenarios for physical exam registration
- **Launch:** Soft launch strategy with 100 users

**Status:** 🎯 **FREEMIUM ARCHITECTURE APPROVED - READY FOR 14-DAY SPRINT**

### Critical Next Steps

1. **Immediate Actions:**
   - Set up Stripe test account
   - Create database backup procedures
   - Prepare staging environment

2. **Development Priorities:**
   - FREE tier registration (no code required)
   - Payment integration for VVIP
   - Admin CSV upload for results
   - Tier-based dashboard gating

3. **Risk Mitigation:**
   - Test rollback procedures
   - Implement rate limiting
   - Set up monitoring dashboards

---

## Architecture Document Structure

The TBAT Mock Exam Platform architecture documentation is organized into the following sections:
