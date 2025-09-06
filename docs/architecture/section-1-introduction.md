# Section 1: Introduction

### Project Overview

The TBAT Mock Exam Platform is a **greenfield hybrid offline/online exam system** designed to address the significant educational gap in Northern Thailand. High school students preparing for TBAT (Thai Biomedical Admissions Test) face limited access to realistic mock exams outside Bangkok, creating barriers to medical school preparation.

This platform delivers a unique value proposition combining **physical exam experiences** with **advanced digital analytics**, serving the Chiang Mai region's 200+ annual TBAT candidates through a freemium model.

### Architecture Approach

**Development Strategy:** Mock-First Greenfield Development
- **Phase 1 (Current):** UI implementation with comprehensive mock data services
- **Phase 2 (Future):** Full database integration with real-time analytics
- **Rationale:** Enables rapid development and early user feedback while building production-quality foundation

**Key Architectural Decisions:**
- **Full-Stack Monolith:** Next.js 14+ App Router for unified development
- **Vercel All-in-One:** Integrated hosting, database, storage, and analytics
- **AI-Agent Friendly:** Optimized for Claude Code development workflows
- **Cost-Optimized:** Designed for ฿710/month operational costs targeting 20 concurrent users

### Business Context

**Target Market:** Private tutoring centers in Chiang Mai serving medical school aspirants
**Revenue Model:** Freemium (Free package: single subject, Advanced package: ฿690 for all three subjects)
**Conversion Strategy:** 40-50% registration conversion, 25-35% post-exam upgrade through strategic PDF restriction
**Technical Requirements:** 99.9% uptime during exam periods, 48-hour result delivery, PDPA compliance
