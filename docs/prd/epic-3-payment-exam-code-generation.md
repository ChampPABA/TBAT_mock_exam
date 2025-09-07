# Epic 3: Payment & Exam Code Generation

**Goal:** Implement Stripe payment processing for 690 THB Advanced packages and generate unique random exam codes (FREE-[8CHAR]-[SUBJECT] / ADV-[8CHAR]) with printable tickets.

### Story 3.1: UI/UX Mockup Implementation

As a **UX Expert**,
I want to create interactive mockups for payment flow and exam code display,
so that the payment experience is optimized for mobile Thai users and exam code presentation is clear.

#### Acceptance Criteria

**AC1:** Payment modal mockup created with Stripe elements integration and Thai Baht (฿690) display

**AC2:** Exam code display mockup showing FREE-A1B2C3D4-PHYSICS and ADV-E5F6G7H8 format examples

**AC3:** Printable ticket mockup with QR code, exam details, and session information

**AC4:** Payment success confirmation mockup with exam code prominent display

**AC5:** Mobile payment flow optimized for Thai banking cards and mobile payment methods

**AC6:** Error states mockup for payment failures with clear Thai language guidance

### Story 3.2: Frontend Development with Mock Data

As a **Frontend Developer**,
I want to build payment components and exam code display using mock Stripe and code data,
so that the complete payment experience is functional before live integration.

#### Acceptance Criteria

**AC1:** Payment modal component built with Stripe Elements integration using test keys

**AC2:** Exam code generation component simulating random code creation with proper format validation

**AC3:** Printable ticket component with QR code generation using Sharp library

**AC4:** Payment confirmation component displaying exam code and session details prominently

**AC5:** Loading states and payment processing animations for mobile user experience

**AC6:** Error handling components for payment failures with retry functionality

### Story 3.3: Database Schema Creation

As a **Backend Developer**,
I want to create payment and exam code tracking tables,
so that all transactions and codes are properly recorded and tracked.

#### Acceptance Criteria

**AC1:** Payment table created with stripe_payment_id, amount (690/290), status, user_id fields

**AC2:** Exam_Code table created with code, type (FREE/ADV), subject, user_id, created_at fields

**AC3:** Exam_Ticket table created linking exam codes to session details and QR data

**AC4:** Payment_Audit table for tracking all payment attempts and failures

**AC5:** Unique constraints implemented on exam codes to prevent collisions

**AC6:** Indexes optimized for code lookup performance during high-traffic periods

### Story 3.4: Backend API Implementation

As a **Backend Developer**,
I want to create secure payment processing and exam code generation APIs,
so that payments work reliably and exam codes are unique and trackable.

#### Acceptance Criteria

**AC1:** POST /api/payment/create endpoint integrating with Stripe for 690 THB processing

**AC2:** POST /api/examcode/generate endpoint creating unique random codes with collision prevention

**AC3:** GET /api/ticket/[examCode] endpoint returning printable ticket data with QR code

**AC4:** Stripe webhook handler for payment confirmation and code generation triggering

**AC5:** Rate limiting on code generation to prevent abuse and ensure uniqueness

**AC6:** Payment retry logic and failure handling with proper error responses

### Story 3.5: Frontend-Backend Integration

As a **Full-Stack Developer**,
I want to connect payment frontend with live Stripe integration and real exam code generation,
so that users can successfully pay and receive valid exam codes immediately.

#### Acceptance Criteria

**AC1:** Complete payment flow working from package selection through exam code delivery

**AC2:** Real Stripe payment processing with Thai Baht and local payment methods

**AC3:** Exam code generation working with unique random codes stored in database

**AC4:** Email delivery integration sending exam tickets with QR codes automatically

**AC5:** Payment failure handling with clear user messaging and retry options

**AC6:** End-to-end testing covering payment success, code generation, and ticket delivery
