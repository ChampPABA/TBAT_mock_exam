# Sprint Change Proposal - TBAT Cycle 2 Requirements

**Date:** 2025-09-03  
**Prepared By:** Sarah (Product Owner)  
**Change Type:** MAJOR CHANGE  
**Priority:** URGENT

## Executive Summary

This proposal addresses urgent mockup revisions and feature updates for the TBAT Mock Exam Platform (Cycle 2). The changes include rebranding from "VVIP" to "Advanced Package," authentication architecture modifications, new monetization features, and UI/UX improvements based on client feedback.

## 1. Change Context & Trigger

### Triggering Event
Client feedback after initial mockup review revealed necessary adjustments to better align with market positioning and user expectations.

### Core Issues Identified
1. **Branding Misalignment:** "VVIP" terminology doesn't resonate with target audience
2. **Authentication UX:** Unified login system needed for better user experience
3. **Revenue Optimization:** Missing post-exam upgrade monetization opportunity (290 THB)
4. **Feature Refinement:** University prediction feature removed, TBAT scoring formula added
5. **User Engagement:** LINE group integration for mandatory communication channel

## 2. Impact Analysis

### 2.1 Epic & Story Impact

#### Affected Existing Stories
| Story ID | Current Status | Required Changes | Impact Level |
|----------|---------------|------------------|--------------|
| 1.3 Modal Authentication | ✅ Done | Add role-based routing, protected routes | MEDIUM |
| 1.1 Registration | ✅ Done | Exam code timing, LINE QR integration | HIGH |
| 1.2 VVIP Registration | 🚧 In Progress | Complete rebrand to "Advanced Package" | HIGH |
| 1.4 Admin Answer Key | 📋 Planned | Update for TBAT scoring formula | MEDIUM |

#### New Stories Required
1. **Story 2.1:** Post-Exam Upgrade Flow (290 THB)
2. **Story 2.2:** TBAT Scoring System (2400 points formula)
3. **Story 2.3:** Box Plot Visualization Component
4. **Story 2.4:** Dentorium Camp Photo Gallery
5. **Story 2.5:** Protected Routes Implementation

### 2.2 Artifact Conflicts

#### Documentation Updates Required
- **26 files** contain "VVIP" references requiring global replacement
- **PRD Sections:** Update pricing model, add post-exam upgrade path
- **Architecture:** Add role-based routing, protected routes specification
- **Front-End Spec:** Add Box Plot, Photo Gallery, TBAT scoring display
- **Database Schema:** Add upgrade tracking, access duration management

## 3. Recommended Implementation Plan

### Sprint 1: Foundation Updates (Week 1)
**Theme:** Rebranding & Authentication Enhancement

#### Global Rebranding Task
- [ ] Replace "VVIP" → "Advanced Package" across all 26 files
- [ ] Update all UI components with new terminology
- [ ] Update API endpoints and database fields
- [ ] Update test cases and documentation

#### Authentication Enhancement
- [ ] Implement role-based routing logic
- [ ] Add protected routes middleware
- [ ] Create admin panel access control
- [ ] Update modal authentication for role detection
- [ ] Add "Forgot Password" link to login modal

### Sprint 2: Core Feature Development (Week 2)
**Theme:** New Features & Monetization

#### Post-Exam Upgrade Flow
- [ ] Design upgrade offer UI/UX
- [ ] Implement 290 THB payment flow
- [ ] Add 6-month access duration logic
- [ ] Create upgrade tracking in database
- [ ] Build detailed answer key access control

#### TBAT Scoring Implementation
- [ ] Implement scoring formula (2400 points)
- [ ] Create subject-wise calculation (Physics: 800, Chemistry: 800, Biology: 800)
- [ ] Update results display components
- [ ] Add score breakdown visualization

#### Data Visualization Update
- [ ] Replace Bar Chart with Box Plot component
- [ ] Show Min, Max, Mean with "Your Score" pointer
- [ ] Remove social sharing functionality
- [ ] Update free vs advanced results displays

### Sprint 3: Enhancement Features (Week 3)
**Theme:** User Experience & Content

#### Photo Gallery Implementation
- [ ] Create gallery component with carousel/slider
- [ ] Add after Testimonials section
- [ ] Implement image optimization
- [ ] Add responsive design support

#### Registration Flow Updates
- [ ] Move exam code generation to post-registration
- [ ] Add LINE QR Code on success
- [ ] Implement mandatory group join messaging
- [ ] Update payment flow connection

#### Final Integration & Testing
- [ ] End-to-end testing of all flows
- [ ] Performance testing for concurrent users
- [ ] Security audit of new features
- [ ] Accessibility compliance check

## 4. Specific Proposed Edits

### 4.1 Immediate Code Changes

```typescript
// Before: src/types/user.ts
interface Package {
  type: 'FREE' | 'VVIP';
  // ...
}

// After: 
interface Package {
  type: 'FREE' | 'ADVANCED';
  // ...
}
```

### 4.2 New API Endpoints

```typescript
// New endpoints required
POST /api/upgrade/post-exam    // Handle 290 THB upgrade
GET /api/scoring/tbat          // Calculate TBAT scores
GET /api/gallery/images        // Serve gallery images
```

### 4.3 Database Schema Updates

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN upgraded_at TIMESTAMP;
ALTER TABLE users ADD COLUMN access_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN line_group_joined BOOLEAN DEFAULT FALSE;

-- Update package types
UPDATE packages SET type = 'ADVANCED' WHERE type = 'VVIP';
```

## 5. Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Rebranding breaks existing code | MEDIUM | HIGH | Comprehensive search/replace with testing |
| Authentication changes cause security issues | LOW | CRITICAL | Thorough security testing, code review |
| Post-exam upgrade complexity | MEDIUM | MEDIUM | Reuse existing payment flow logic |
| Timeline pressure | HIGH | HIGH | Prioritize MVP-critical features |

## 6. Success Criteria

- [ ] All "VVIP" references updated to "Advanced Package"
- [ ] Unified modal login with role-based routing working
- [ ] Post-exam upgrade flow generates revenue
- [ ] TBAT scoring formula correctly calculates 2400 points
- [ ] Box Plot visualization displays accurately
- [ ] Photo gallery loads performantly
- [ ] All tests pass with >90% coverage
- [ ] Client approval on updated mockups

## 7. Resource Requirements

### Team Allocation
- **Frontend Dev:** 2 developers for UI updates
- **Backend Dev:** 1 developer for API/database changes
- **QA:** 1 tester for comprehensive testing
- **DevOps:** Support for deployment and monitoring

### Timeline
- **Total Duration:** 3 weeks (3 sprints)
- **MVP Features:** Weeks 1-2
- **Enhancement Features:** Week 3
- **Buffer for Issues:** Included in estimates

## 8. Next Steps & Handoff

### Immediate Actions
1. **PM/Architect Review:** Validate technical approach
2. **Story Creation:** Break down into detailed user stories
3. **Team Briefing:** Align all developers on changes
4. **Client Communication:** Confirm understanding of timeline

### Handoff Requirements
- **To Dev Team:** This proposal with approved stories
- **To QA Team:** Updated test scenarios
- **To DevOps:** Infrastructure requirements for new features
- **To Client:** Weekly progress updates

## 9. Approval & Sign-off

### Stakeholder Approval Required
- [ ] Product Owner (Sarah)
- [ ] Technical Architect
- [ ] Development Lead
- [ ] Client Representative

### Change Classification
✅ **MAJOR CHANGE** - Requires formal change control process and stakeholder approval before proceeding.

---

## Appendix A: File List for VVIP → Advanced Package Update

The following 26 files require terminology updates:
- docs/stories/1.2.vvip-registration-payment.story.md
- docs/architecture/api-specification-freemium.md
- docs/prd/3-user-stories-student-facing-application.md
- [... and 23 more files]

## Appendix B: Removed Features

- **University Admission Chance Prediction** - Confirmed out of scope, no impact on current implementation

## Appendix C: Technical Debt Considerations

This change introduces some technical debt that should be addressed post-MVP:
- Refactoring authentication system for scalability
- Optimizing Box Plot rendering for large datasets
- Implementing caching for photo gallery

---

**Document Version:** 1.0  
**Last Updated:** 2025-09-03  
**Status:** PENDING APPROVAL