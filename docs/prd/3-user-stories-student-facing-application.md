# 3. User Stories (Student-Facing Application)

**Version 6.0 Updates (Cycle 2 Changes):**
- Global rebranding: VVIP → Advanced Package
- Added Story 4.6: Post-Exam Upgrade for answer key access (฿290)
- Added Story 4.7: TBAT Scoring Display (2400 points formula)
- Added Story 4.8: Box Plot Visualization for score comparison
- Added Story 7.1: LINE Group Integration
- Added Story 7.2: Dentorium Camp Photo Gallery
- Enhanced authentication with role-based routing

**Version 5.1 Updates:**
- Story 4.3: Simplified answer key to PDF download only
- Story 4.5: Renamed to "Answer Key Download" with admin upload clarification
- Removed university admission probability features

## Epic: Physical Exam Registration

- **Story 1.1 - Free Registration:** As a new student, I want to register online for the physical TBAT mock exam by providing my details and selecting one subject (FREE tier), so I receive an exam ticket for the test venue.
- **Story 1.2 - Advanced Package Registration:** As a student wanting comprehensive assessment, I want to register for all 3 subjects by paying ฿690 during registration, so I can take the complete physical exam.
- **Story 1.3 - Exam Ticket Generation:** After successful registration and payment (if Advanced Package), I want to receive a unique exam ticket/code via email along with a LINE QR code to join the mandatory communication group.
- **Story 1.4 - Venue Information:** As a registered student, I want to see clear exam venue details (location, date, time, what to bring), so I can properly prepare for the physical exam.
- **Story 1.5 - Parent Information:** During registration, I want to provide parent contact details, so they can be informed about exam schedules and results.

## Epic: Pre-Exam Management

- **Story 2.1 - Registration Confirmation:** After registering, I want to receive an email confirmation with my exam details and ticket, so I have a record of my registration.
- **Story 2.2 - Exam Reminders:** As exam day approaches, I want to receive email/Line reminders about the venue, time, and required materials.
- **Story 2.3 - View Registration Status:** As a registered student, I want to log in and view my registration details, exam schedule, and tier status.
- **Story 2.4 - Download Exam Ticket:** I want to download/print my exam ticket from the portal, in case I lose the email version.

## Epic: Physical Exam Day

- **Story 3.1 - Check-in Process:** At the venue, I present my exam ticket to verify my registration and receive my physical exam booklet.
- **Story 3.2 - Paper-Based Exam:** I complete the paper-based exam for my registered subjects (1 for FREE, 3 for Advanced Package) at the physical venue.
- **Story 3.3 - Answer Sheet Submission:** After completing the exam, I submit my answer sheet to exam proctors for offline grading.

## Epic: Results Access & Analysis

- **Story 4.1 - Results Notification:** After exams are graded (24-48 hours), I receive an email/Line notification that results are available online.
- **Story 4.2 - Basic Results (FREE Tier):** As a FREE tier student, I can view my basic score and percentile rank for my selected subject.
- **Story 4.3 - Detailed Results (Advanced Package):** As an Advanced Package student, I can view comprehensive results including:
  - TBAT total score (2400 points) with subject breakdown (Physics: 800, Chemistry: 800, Biology: 800)
  - Box plot visualization showing Min, Max, Mean with "Your Score" indicator
  - Detailed question-by-question analysis
  - Download link for complete answer key PDF (when available)
  - Weakness identification
  - Performance comparison without social sharing
- **Story 4.4 - Upgrade for Details:** As a FREE tier student viewing results, I see upgrade prompts to access detailed analytics by paying ฿690.
- **Story 4.6 - Post-Exam Upgrade:** After completing the exam, FREE tier students can upgrade for ฿290 to access detailed answer keys with 6-month validity.
- **Story 4.7 - TBAT Score Display:** All students can view their TBAT-formatted score (out of 2400) calculated using the official formula.
- **Story 4.8 - Box Plot Visualization:** Results display uses box plots instead of bar charts to show score distribution with statistical insights.
- **Story 4.5 - Answer Key Download:** As an Advanced Package user or post-exam upgrade user, when the answer key PDF is published by administrators, I can download it with one click for detailed explanations and reference.

## Epic: Payment & Upgrades

- **Story 5.1 - Pre-Exam Upgrade:** As a FREE tier registrant, I can upgrade to Advanced Package before the exam to register for additional subjects.
- **Story 5.2 - Post-Results Upgrade:** After seeing my basic results, I can upgrade to Advanced Package (฿690) for full analytics or choose the new Post-Exam Upgrade (฿290) for answer key access only.
- **Story 5.3 - Secure Payment (Stripe):** All payments are processed through Stripe's secure checkout for ฿690.
- **Story 5.4 - Payment Confirmation:** After successful payment, I receive email confirmation and immediate access to Advanced Package features or post-exam upgrade benefits.
- **Story 5.5 - Receipt Download:** I can download official receipts for all payments made.

## Epic: Account Management

- **Story 6.1 - Login/Logout:** I can securely log in with email/password and log out of my account.
- **Story 6.2 - Password Reset:** If I forget my password, I can reset it via email link.
- **Story 6.3 - Profile Management:** I can update my profile information including school, grade, and contact details.
- **Story 6.4 - Tier Status Display:** My current tier (FREE/Advanced Package/Post-Exam Upgrade) is clearly displayed in my dashboard.
- **Story 6.5 - Exam History:** I can view my past exam registrations and results (if Advanced Package or upgraded).

## Epic: Social & Gallery Features

- **Story 7.1 - LINE Group Integration:** Upon successful registration, students receive a LINE QR code to join the mandatory exam communication group for updates and announcements.
- **Story 7.2 - Dentorium Camp Gallery:** Students can view a photo gallery showcasing previous Dentorium Camp events, displayed after the testimonials section with optimized carousel/slider functionality.

## Out of Scope Stories (NOT Implemented)

- ~~Online exam taking interface~~
- ~~Question display and timer system~~
- ~~Real-time answer submission~~
- ~~Instant automated grading~~
- ~~Practice tests or mock questions~~
- ~~Study materials or content library~~
- ~~Live proctoring or monitoring~~
