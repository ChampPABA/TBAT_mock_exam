# Epic 2: Backend Integration & Database Schema

**Goal:** Create backend APIs and database integration for the completed registration frontend, enabling secure data storage and authentication services.

### Story 2.1: UI/UX Mockup Implementation ✅ COMPLETED
*(Completed in Story 1.2.1 - Registration Flow Enhancement)*

~~As a **UX Expert**,~~
~~I want to create interactive mockups for registration and login pages,~~
~~so that the authentication flow is optimized for mobile users and conversion.~~

#### ✅ Completed Acceptance Criteria
- **AC1-AC6:** All mockup requirements delivered in Story 1.2.1

### Story 2.2: Frontend Development with Mock Data ✅ COMPLETED
*(Completed in Story 1.2.1 - Registration Flow Enhancement)*

~~As a **Frontend Developer**,~~
~~I want to build authentication components and modal flows using mock user data,~~
~~so that the registration experience is complete and ready for backend integration.~~

#### ✅ Completed Acceptance Criteria
- **AC1-AC6:** All frontend components delivered in Story 1.2.1

### Story 2.3: Database Schema Creation

As a **Backend Developer**,
I want to create user authentication and profile tables with proper security measures,
so that user data is stored safely and can support the registration workflow.

#### Acceptance Criteria

**AC1:** User table created with comprehensive denormalized schema including id, email, password_hash, thai_name, phone, school, package_type, pdpa_consent, created_at, updated_at, is_active fields

**AC2:** ~~User_Profile table created with thai_name, phone, school, birth_date, pdpa_consent fields~~ **REMOVED** - Consolidated into denormalized User table per Architecture section-4-data-models.md

**AC3:** ~~User_Package table created linking users to selected packages with exam_code and session_id~~ **REMOVED** - Package linking handled by ExamCode table per Architecture

**AC4:** Password_Reset table created for secure password recovery workflow

**AC5:** ~~Email_Verification table created for email confirmation~~ **REMOVED** - Simple registration without email verification per FR1 requirements

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
