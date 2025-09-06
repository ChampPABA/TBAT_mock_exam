# Epic 2: User Authentication & Registration System

**Goal:** Enable secure user registration with email/password authentication, basic PDPA consent, and user profile management integrated seamlessly with package selection flow.

### Story 2.1: UI/UX Mockup Implementation

As a **UX Expert**,
I want to create interactive mockups for registration and login modals,
so that the authentication flow is optimized for mobile users and conversion.

#### Acceptance Criteria

**AC1:** Registration modal mockup created with step-by-step flow (package → profile → consent → confirmation)

**AC2:** Login modal mockup with email/password fields, "จำรหัสผ่าน" checkbox, and "ลืมรหัสผ่าน" link

**AC3:** Profile form mockup with Thai name fields, phone number, school, and subject selection for Free users

**AC4:** PDPA consent mockup with clear, simple Thai language explaining data usage

**AC5:** Mobile-optimized modal designs tested for single-thumb operation and keyboard handling

**AC6:** Error states and validation messaging designed for clear user guidance

### Story 2.2: Frontend Development with Mock Data

As a **Frontend Developer**,
I want to build authentication components and modal flows using mock user data,
so that the registration experience is complete and ready for backend integration.

#### Acceptance Criteria

**AC1:** Registration modal component built with multi-step form using React Hook Form and Zod validation

**AC2:** Login modal component with email/password authentication and "remember me" functionality

**AC3:** Profile form component with Thai name validation, phone number formatting, and school selection

**AC4:** PDPA consent component with checkbox validation and clear terms display

**AC5:** Form validation implemented with real-time feedback and Thai language error messages

**AC6:** Modal state management implemented for seamless transitions between login/registration

### Story 2.3: Database Schema Creation

As a **Backend Developer**,
I want to create user authentication and profile tables with proper security measures,
so that user data is stored safely and can support the registration workflow.

#### Acceptance Criteria

**AC1:** User table created with id, email, password_hash, created_at, updated_at, is_active fields

**AC2:** User_Profile table created with thai_name, phone, school, birth_date, pdpa_consent fields

**AC3:** User_Package table created linking users to selected packages with exam_code and session_id

**AC4:** Password_Reset table created for secure password recovery workflow

**AC5:** Email_Verification table created for email confirmation (if needed for security)

**AC6:** Proper indexes and constraints created for email uniqueness and referential integrity

### Story 2.4: Backend API Implementation

As a **Backend Developer**,
I want to create secure authentication APIs with proper validation and security measures,
so that user registration and login work reliably with exam-critical security.

#### Acceptance Criteria

**AC1:** POST /api/auth/register endpoint with email validation, password hashing, and duplicate prevention

**AC2:** POST /api/auth/login endpoint with secure password verification and JWT token generation

**AC3:** POST /api/auth/logout endpoint for secure session termination

**AC4:** Password validation enforcing 8+ characters with letters and numbers requirement

**AC5:** Rate limiting implemented on authentication endpoints to prevent brute force attacks

**AC6:** PDPA consent logging with timestamp and IP address for compliance tracking

### Story 2.5: Frontend-Backend Integration

As a **Full-Stack Developer**,
I want to connect authentication frontend with secure backend APIs,
so that users can register and login successfully with proper session management.

#### Acceptance Criteria

**AC1:** Registration flow integrated end-to-end from package selection through profile completion

**AC2:** Login flow working with JWT token storage and automatic authentication state management

**AC3:** Session persistence implemented with secure token refresh and timeout handling

**AC4:** Form validation connected to backend with proper error message display

**AC5:** PDPA consent integrated with backend logging and user preference storage

**AC6:** Authentication state synchronized across all components with automatic redirect handling
