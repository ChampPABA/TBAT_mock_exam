# 1. Overview & Vision

This project develops the "TBAT Mock Exam Registration & Results Portal," a freemium platform for high school students in Thailand preparing for the Thai Biomedical Admissions Test (TBAT). The system facilitates online registration for **physical, paper-based exams** conducted at venues in Chiang Mai, and provides tiered access to exam results and analytics after the exams are graded offline.

## Critical Scope Clarification (v6.0)

**Version Updates (v6.0 - Cycle 2 Changes):**
- Rebranded from "VVIP" to "Advanced Package" for better market positioning
- Added post-exam upgrade option (฿290) for detailed answer keys
- Implemented TBAT scoring formula (2400 points: Physics 800, Chemistry 800, Biology 800)
- Updated data visualization from bar charts to box plots
- Integrated LINE QR code for mandatory group communication
- Added Dentorium Camp photo gallery feature
- Enhanced authentication with role-based routing and protected routes

**Previous Updates (v5.1):**
- Simplified answer key delivery to manual PDF upload by admin staff
- Removed university admission probability predictions
- Streamlined results display for faster MVP delivery

**IMPORTANT:** This is a registration and results portal for PHYSICAL exams, NOT an online testing platform:
- Students register online for physical exam sessions
- Exams are conducted offline at physical venues (e.g., Chiang Mai University)
- Results are uploaded by administrators after manual grading
- Students access their results online with tier-based features

## Business Model: Freemium Registration & Results

**Registration & Exam Format:**
- **Online:** Registration only (FREE or VVIP)
- **Offline:** Physical exam at designated venues
- **Online:** Results viewing with tier-based access

**Tier Structure:**
- **FREE Tier:** Register for 1 subject, basic score viewing
- **Advanced Package:** Register for 3 subjects, detailed analytics & answer keys (฿690)
- **Post-Exam Upgrade:** Access detailed answer keys after exam (฿290, 6-month access)

## Key Value Propositions

### For Students
- **Zero Barrier Entry:** Free registration for one subject
- **Physical Exam Experience:** Authentic test-taking environment
- **Instant Results Access:** View scores online after grading
- **Progressive Value:** Upgrade for detailed performance analysis

### For Business
- **Simplified Operations:** 70% less complexity than online exam platform
- **Faster Time to Market:** 14-day development timeline
- **Scalable Growth:** Free tier enables viral acquisition
- **Clear Monetization:** Post-exam upgrades for detailed insights

## System Components

1. **Registration Portal:** Free/Advanced Package selection, exam ticket generation with LINE QR integration
2. **Payment Gateway:** Stripe integration for Advanced Package and post-exam upgrades
3. **Admin Panel:** CSV upload for exam results with TBAT scoring formula calculation
4. **Results Portal:** Tier-based access to scores with box plot visualizations
5. **Email System:** Registration confirmations, exam reminders, results notifications

## Out of Scope

- ❌ Online exam-taking interface
- ❌ Question display/submission system
- ❌ Real-time scoring engine
- ❌ Timer functionality
- ❌ Practice tests or mock exams online
