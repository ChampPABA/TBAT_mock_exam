# Epic 4: Session Booking & Capacity Management

**Goal:** Enable students to select exam sessions (morning/afternoon) with intelligent capacity management hiding exact numbers and dynamic Free/Advanced availability messaging.

### Story 4.1: UI/UX Mockup Implementation

As a **UX Expert**,
I want to create session selection mockups with capacity management messaging,
so that users can choose sessions while capacity logic guides availability appropriately.

#### Acceptance Criteria

**AC1:** Session selection mockup showing morning (9:00-12:00) and afternoon (13:00-16:00) options

**AC2:** Capacity messaging mockup with states: normal, "Free ใกล้เต็ม", "Free เต็มแล้ว - Advanced เท่านั้น"

**AC3:** Session confirmation mockup displaying selected time with exam code and location details

**AC4:** Mobile-optimized session picker with large touch targets and clear time display

**AC5:** Visual indicators for session availability without showing exact numbers

**AC6:** Confirmation flow mockup integrating session selection with payment completion

### Story 4.2: Frontend Development with Mock Data

As a **Frontend Developer**,
I want to build session selection components using mock capacity data,
so that the booking experience is complete before backend capacity logic integration.

#### Acceptance Criteria

**AC1:** Session picker component with morning/afternoon options and capacity status simulation

**AC2:** Dynamic messaging component showing appropriate availability text based on mock capacity

**AC3:** Session confirmation component displaying selected session with exam details

**AC4:** Capacity validation component preventing overbooking using simulated limits

**AC5:** Mobile-responsive session selection with swipe-friendly interface

**AC6:** Integration with payment flow components from Epic 3

### Story 4.3: Database Schema Creation

As a **Backend Developer**,
I want to create session and capacity tracking tables,
so that session bookings can be managed with real-time capacity monitoring.

#### Acceptance Criteria

**AC1:** Exam_Session table created with session_id, date (27 กันยายน 2568), start_time, end_time, max_capacity (300)

**AC2:** Session_Booking table linking user_id, exam_code, session_id with booking timestamp

**AC3:** Session_Capacity table tracking current Free/Advanced bookings per session in real-time

**AC4:** Capacity_Log table for auditing all capacity changes and booking events

**AC5:** Database triggers maintaining accurate capacity counts on booking insert/delete

**AC6:** Indexes optimized for high-frequency capacity queries during registration periods

### Story 4.4: Backend API Implementation

As a **Backend Developer**,
I want to create session booking and capacity management APIs,
so that session selection works with accurate real-time availability and proper limits.

#### Acceptance Criteria

**AC1:** GET /api/sessions endpoint returning available sessions with capacity status messaging

**AC2:** POST /api/sessions/book endpoint handling session selection with capacity validation

**AC3:** GET /api/capacity/status endpoint providing real-time Free/Advanced availability

**AC4:** Capacity logic implementation hiding exact numbers while providing appropriate messaging

**AC5:** Atomic booking transactions preventing race conditions during high-traffic booking

**AC6:** Session overbooking prevention with proper error handling and alternative suggestions

### Story 4.5: Frontend-Backend Integration

As a **Full-Stack Developer**,
I want to connect session selection with live capacity management,
so that users can book sessions with accurate availability and appropriate capacity messaging.

#### Acceptance Criteria

**AC1:** Session selection working with real-time capacity checking and booking confirmation

**AC2:** Dynamic capacity messaging updating based on actual Free/Advanced availability

**AC3:** Session booking integrated with payment and exam code generation from previous epics

**AC4:** Capacity limit enforcement preventing overbooking with clear user feedback

**AC5:** Real-time updates showing capacity changes during active booking sessions

**AC6:** Complete booking flow testing from session selection through confirmation email
