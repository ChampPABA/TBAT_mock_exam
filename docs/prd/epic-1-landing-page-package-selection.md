# Epic 1: Landing Page & Package Selection

**Goal:** Create conversion-optimized landing page with credibility elements and seamless package selection flow for Free vs Advanced packages with capacity management for maximum user acquisition.

### Story 1.1: UI/UX Mockup Implementation

As a **UX Expert**,
I want to create an interactive HTML/CSS/JS mockup of the landing page with package selection,
so that stakeholders can review and approve the look, feel, and basic interactions before frontend development begins.

#### Acceptance Criteria

**AC1:** Interactive HTML mockup created with medical color palette (#0d7276 primary, #529a9d secondary, #cae0e1 light)

**AC2:** Hero section implemented with countdown timer, value proposition "ทดสอบ TBAT ที่เชียงใหม่ ไม่ต้องเดินทางไปกรุงเทพ", and clear CTA button

**AC3:** Credibility section displaying government support logos (STeP, Deepa, Startup Thailand), ASPECT branding, and "ผู้จัด Dentorium Camp" messaging

**AC4:** Package comparison table showing Free vs Advanced (690 THB) with feature highlights and upgrade messaging

**AC5:** Bangkok vs Chiang Mai cost comparison section emphasizing "ประหยัดค่าใช้จ่าย 5,000+ บาท"

**AC6:** Mobile-responsive design tested across iPhone, Android, and tablet devices with touch-friendly interactions

### Story 1.2: Frontend Development with Mock Data

As a **Frontend Developer**,
I want to build the landing page components using Next.js and shadcn/ui with mock package data,
so that the complete user interface is functional and ready for backend integration.

#### Acceptance Criteria

**AC1:** Landing page component built with Next.js 14+ App Router using TypeScript and Tailwind CSS

**AC2:** Hero section component with dynamic countdown timer calculating days until 27 กันยายน 2568

**AC3:** Package selection component with Free/Advanced toggle and capacity status messaging using mock data

**AC4:** Modal system implemented for registration flow with mobile-optimized full-screen design

**AC5:** Government credibility badge component with proper logo placement and responsive scaling

**AC6:** Analytics preview component showing blurred/teaser content for freemium conversion optimization

### Story 1.3: Database Schema Creation

As a **Backend Developer**,
I want to create database tables for package tracking and capacity management,
so that the landing page can display real-time availability and track user selections.

#### Acceptance Criteria

**AC1:** Package table created with Free/Advanced types, pricing (0/690), and feature definitions

**AC2:** Capacity table created tracking morning/afternoon sessions with 300 total, 150 Free limits

**AC3:** User_Package junction table created linking user selections to package types and sessions

**AC4:** Session table created defining morning (9:00-12:00) and afternoon (13:00-16:00) time slots

**AC5:** Capacity_Status table created for real-time availability tracking with Free/Advanced breakdown

**AC6:** Database indexes optimized for high-frequency capacity queries during registration periods

### Story 1.4: Backend API Implementation

As a **Backend Developer**,
I want to create API endpoints for package information and capacity management,
so that the frontend can display accurate, real-time package availability and pricing.

#### Acceptance Criteria

**AC1:** GET /api/packages endpoint returning package types, pricing, features, and current availability

**AC2:** GET /api/capacity endpoint returning real-time session availability with appropriate messaging logic

**AC3:** GET /api/sessions endpoint returning morning/afternoon time slots with current registration counts

**AC4:** Rate limiting implemented on capacity endpoints to prevent abuse during high-traffic periods

**AC5:** Caching strategy implemented for package data with 5-minute TTL to reduce database load

**AC6:** Capacity logic implemented hiding exact Free availability while showing "เต็มแล้ว" status appropriately

### Story 1.5: Frontend-Backend Integration

As a **Full-Stack Developer**,
I want to integrate the landing page frontend with live capacity and package APIs,
so that users see accurate real-time information and can make informed package selections.

#### Acceptance Criteria

**AC1:** Landing page connected to live capacity API with automatic refresh every 30 seconds

**AC2:** Package selection component displays real availability status and appropriate messaging

**AC3:** Capacity management logic working correctly: hide Free options when full, show Advanced-only messaging

**AC4:** Error handling implemented for API failures with graceful degradation to cached data

**AC5:** Loading states implemented for all dynamic content with skeleton placeholders

**AC6:** End-to-end testing completed covering package selection flow from landing page to confirmation
