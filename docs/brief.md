# Project Brief: TBAT Mock Exam Registration & Results Portal

### Executive Summary

This project will develop the "TBAT Mock Exam Registration & Results Portal," a freemium web platform designed for high school students in Thailand preparing for the Thai Biomedical Admissions Test (TBAT). The portal facilitates online registration for physical, paper-based mock exams conducted at a venue in Chiang Mai. It provides a tiered system for accessing exam results and detailed performance analytics, which are made available online after the physical exams are graded offline.

**Organization:** ASPECT (Previously organized Dentorium Camp)
**Government Support:** STeP, Deepa, Startup Thailand
**Exam Validators:** Olympic วิชาการ certified reviewers
**Launch Target:** 27 กันยายน 2568 (Before TBAT on 5 ตุลาคม 2568)

### Problem Statement

High school students in Chiang Mai and surrounding provinces who are preparing for the TBAT face significant disadvantages. The official exam is held in Bangkok, and most high-quality mock exams are also centralized there, forcing students to incur significant travel time and costs. Furthermore, there is a scarcity of realistic, paper-based mock exams available locally, making it difficult for students to prepare in an environment that simulates the actual test conditions. This creates a clear market gap and a significant pain point for a large pool of aspiring biomedical students in Northern Thailand.

### Proposed Solution

The proposed solution is a web portal that directly addresses this gap. The core workflow is as follows:

1.  **Online Registration:** Students register and pay online for a scheduled physical mock exam event in Chiang Mai.
2.  **Freemium Model:**
    - **Free Package:** Register for one subject (Physics, Chemistry, or Biology).
    - **Advanced Package (690 THB):** Register for all three subjects.
3.  **Offline Exam:** Students attend the event and take the paper-based exam in a formal, timed setting that mimics the real TBAT.
4.  **Online Results & Analytics:** After offline grading, scores are uploaded to the portal.
    - **Free Package Users:** Can view basic score for their single subject (score/800, percentile, rank). Cannot take exam paper home.
    - **Advanced Package Users:** Can take exam paper home and access comprehensive analytics dashboard, including:
      - Detailed scores for all three subjects (weighted scoring: 800 points per subject, 2400 total).
      - Statistical analysis: Box plots, score distribution, percentile rankings.
      - Topic-by-topic performance breakdown (14 Chemistry topics, 7 Physics topics, 6 Biology topics).
      - Personalized study recommendations and time allocation guides.
      - TBAT prediction analysis and improvement potential.
    - **Post-Exam Upgrade (290 THB):** Free users can upgrade after seeing results to unlock detailed analytics for their single subject.

### Target Users

- **Primary User Segment:** High school students in Chiang Mai and Northern Thailand actively preparing for TBAT.
- **Secondary Users:** Parents seeking performance insights for their children.
- **Influencer Stakeholders:** Teachers and school counselors who recommend exam preparation services.
- **Market Size:** 200+ students annually in Chiang Mai region preparing for medical school entrance.

### Goals & Success Metrics

- **Business Objectives:**
  1.  Successfully penetrate the Chiang Mai market as the primary provider of offline TBAT mock exams.
  2.  Achieve a target conversion rate of free users to paid users (full package or analytics upgrade).
  3.  Generate a profitable revenue stream from the initial exam events.
- **User Success Metrics:**
  1.  High user satisfaction scores regarding the realism of the exam experience.
  2.  Positive feedback on the value and clarity of the advanced analytics.
- **Key Performance Indicators (KPIs):**
  1.  Number of total registrations per exam event.
  2.  Percentage of paid users vs. free users.
  3.  Conversion rate of free users purchasing the advanced analytics package.

### Detailed Business Model

**Exam Schedule:** 27 กันยายน 2568 (Fixed date - no additional rounds)

- **Session 1:** 9:00-12:00 (arrive 8:30)
- **Session 2:** 13:00-16:00 (arrive 12:30)
- **Capacity:** 300 students maximum per session
- **Free Package Limit:** 150 students per session (Advanced Package can consume remaining capacity)

**Capacity Management Logic:**

- Free slots don't show remaining count (prevent artificial urgency)
- When Free tier full: Hide Free options, show "เต็มแล้ว - ใช้ Advanced Package เท่านั้น"
- Advanced Package: Unlimited until total session capacity reached

**Results Timeline:** 48 hours after exam completion

### MVP Scope

**Core Features (Must Have):**

- Simple email/password registration (no OTP required, 8+ character password with numbers + letters)
- Landing page with credibility elements (testimonials, government support, organizational background)
- Package selection with capacity management logic
- Session selection and exam code generation (FREE-XXXXXXXX-[Subject], ADV-XXXXXXXX)
- Stripe payment integration for 690 THB Advanced Package
- LINE QR code integration for lead generation (encouraged but not mandatory)
- Printable exam tickets with QR codes
- Admin interface for score upload and capacity management
- Results dashboard with freemium conversion optimization:
  - Free: Basic scores with blurred premium previews + 290 THB upgrade CTA
  - Advanced: Comprehensive statistical analytics with visual charts
  - Post-exam upgrade: One-click 290 THB payment for Free users
- Toast notification system for all user feedback
- PDPA compliance features (consent management, data export, right to erasure)
- Mobile-first responsive design with accessibility compliance (WCAG 2.1 AA)

**Out of Scope for MVP:**

- Online exam-taking functionality (hybrid offline/online model)
- Multiple exam dates or venues
- Community features or discussion boards
- Subjects other than Physics, Chemistry, Biology
- Native mobile applications (web-based only)
- Multiple payment gateways (Stripe only)

### Post-MVP Vision

- **Phase 2:** Expand mock exam events to other major provinces outside of Bangkok.
- **Long-term Vision:** Potentially introduce an online mock exam platform to complement the physical exams, reaching a nationwide audience. Develop a larger question bank and offer more specialized analytics.

### Technical Requirements Summary

**Frontend Architecture:**

- Next.js 14+ with App Router and TypeScript
- Tailwind CSS with shadcn/ui component library
- Mobile-first responsive design
- Chart.js/D3.js for analytics visualizations
- Progressive Web App capabilities

**Backend & Database:**

- PostgreSQL database (Neon serverless)
- Prisma ORM for database management
- Real-time replication and automated backups
- Connection pooling for high traffic periods

**Payment & Security:**

- Stripe API integration for Thai Baht processing
- JWT token-based authentication
- PDPA compliance implementation
- SSL encryption and security best practices

**Performance & Scalability:**

- Auto-scaling capabilities for registration periods
- CDN for static asset delivery
- Redis caching for sessions and analytics
- Real-time monitoring and error recovery systems

**Analytics Engine:**

- Custom statistical calculation engine
- Weighted scoring system (800 points per subject)
- Box plot and percentile generation
- Topic-by-topic performance analysis
- Pre-computed statistics with caching

### Constraints & Assumptions

**Constraints:**

- **Time-Critical Launch:** Must launch before 27 กันยายน 2568 to capture exam cycle
- **Single Exam Event:** Fixed date with no additional rounds
- **Venue Dependency:** Physical exam location in Chiang Mai required
- **Capacity Limitations:** Maximum 300 students per session

**Key Assumptions:**

- Sufficient demand in Chiang Mai market (targeting 200+ annual students)
- Students value realistic physical exam experience over online convenience
- Pricing strategy acceptable (690 THB full package, 290 THB upgrade)
- Advanced analytics provide sufficient value proposition for conversion
- Mobile-first approach aligns with student behavior patterns
- Government backing and testimonials establish sufficient credibility

### Risk Analysis & Mitigation

**High-Risk Scenarios:**

- **Registration Day Overload:** Server crashes during peak registration → Auto-scaling, load balancing, queue management
- **Payment Processing Failures:** Stripe gateway issues → Retry logic, clear error messaging, manual verification process
- **Analytics Engine Failures:** Complex calculations crash on results day → Backup systems, pre-computed fallbacks
- **Data Security Breach:** PDPA violations → Enhanced security protocols, incident response plan

**Medium-Risk Scenarios:**

- **Mobile Compatibility Issues:** Browser updates break functionality → Cross-platform testing, progressive enhancement
- **Capacity Management Errors:** Overbooking or system bugs → Manual override capabilities, real-time monitoring

**Mitigation Strategies:**

- Comprehensive load testing with 1000+ concurrent users
- Multiple backup systems and recovery procedures
- Real-time monitoring with automated alerts
- PDPA compliance audit and legal review
- Extensive mobile device and browser compatibility testing

### Competitive Advantages

**Unique Value Propositions:**

- **Hybrid Model:** Only platform combining physical exams with advanced digital analytics
- **Statistical Depth:** Most sophisticated analytics in Thai mock exam market
- **Student Validation:** Organic demand from previous Dentorium Camp participants
- **Government Credibility:** Official support from STeP, Deepa, Startup Thailand
- **PDPA Leadership:** First mock exam platform with full data protection compliance
- **Flexible Pricing:** Innovative freemium model with post-exam upgrade option

### Success Metrics & KPIs

**Primary KPIs:**

- Total registrations per session (Target: 250+/300 capacity)
- Free to Advanced conversion rate (Target: 40-50%)
- Post-exam upgrade rate (Target: 25-35% of Free users)
- Mobile traffic percentage (Expected: 80%+)
- System uptime during critical periods (Target: 99.9%)
- Payment success rate (Target: 95%+)
- User satisfaction scores (Target: 4.5+/5.0)

**Secondary KPIs:**

- Email delivery rates (Target: 98%+)
- Page load times (Target: <2 seconds)
- Analytics engagement time (Target: 5+ minutes for premium users)
- PDPA compliance audit score (Target: 100%)
- Cross-browser compatibility score (Target: 95%+)

### Next Steps for PRD Development

This brief provides comprehensive foundation for PRD creation including:

- ✅ Complete business model with pricing and capacity logic
- ✅ Detailed technical architecture and requirements
- ✅ User experience specifications with mobile optimization
- ✅ Security and compliance requirements (PDPA)
- ✅ Risk analysis with mitigation strategies
- ✅ Competitive positioning and success metrics
- ✅ Implementation constraints and timeline requirements

**Ready for PM handoff to develop detailed PRD with user stories, acceptance criteria, and development roadmap.**
