# Requirements

### Functional

**FR1:** The system shall provide simple email/password user registration without OTP requirements, enforcing 8+ character passwords containing both numbers and letters

**FR2:** The system shall display a landing page with credibility elements including testimonials, government support badges (STeP, Deepa, Startup Thailand), and organizational background

**FR3:** The system shall offer package selection between Free Package (single subject) and Advanced Package (690 THB for all three subjects) with dynamic capacity management

**FR4:** The system shall provide session selection for two time slots (9:00-12:00 and 13:00-16:00) with maximum 300 students per session

**FR5:** The system shall generate unique random exam codes using English letters + numbers following patterns: FREE-[8-CHAR-RANDOM]-[SUBJECT] and ADV-[8-CHAR-RANDOM] (no sequential numbering)

**FR6:** The system shall integrate Stripe payment processing for both 690 THB Advanced Package purchases and 290 THB post-exam upgrade payments in Thai Baht

**FR7:** The system shall display LINE QR code image with text instructing users to add LINE for faster information updates, implemented as a simple clickable link

**FR8:** The system shall generate printable exam tickets with QR codes containing student verification information

**FR9:** The system shall provide admin interface for score upload via xlsx file import, PDF solution upload, capacity management, user data management with CRUD operations, and xlsx export functionality for registration data and student information to support exam materials creation (seating charts, etc.)

**FR10:** The system shall display results dashboard with freemium conversion optimization, showing basic scores for Free users with blurred premium previews and 290 THB upgrade CTA

**FR11:** The system shall provide comprehensive statistical analytics for Advanced Package users including box plots, percentiles, score distribution, and topic-by-topic performance breakdown

**FR12:** The system shall enable post-exam upgrade functionality allowing Free users one-click 290 THB payment to unlock detailed analytics

**FR13:** The system shall implement toast notification system for all user feedback and system status communications

**FR14:** The system shall provide PDPA compliance features including consent management, data export capabilities, and right to erasure functionality

**FR15:** The system shall implement capacity management logic hiding Free availability numbers while showing "เต็มแล้ว - ใช้ Advanced Package เท่านั้น" when Free tier is full

**FR16:** The system shall calculate weighted scoring with 800 points per subject (Physics: 30 items, Chemistry: 55 items, Biology: 55 items) totaling 2400 points

**FR17:** The system shall provide topic-by-topic analysis covering 14 Chemistry topics, 7 Physics topics, and 6 Biology topics

**FR18:** The system shall generate personalized study recommendations and time allocation guides based on performance data

**FR19:** The system shall provide TBAT prediction analysis and improvement potential calculations

**FR20:** The system shall deliver results within 48 hours of exam completion with automated email notifications

**FR21:** The system shall provide PDF solution download capability exclusively for Advanced Package users, implementing freemium conversion strategy by restricting Free users from accessing exam solutions

**FR22:** The system shall implement data lifecycle management with 6-month accessibility period for exam results and PDF solutions, after which data becomes inaccessible to maintain resource optimization

**FR23:** The system shall enable admin PDF solution upload with automated email notifications to all Advanced Package users when solutions become available

**FR24:** The system shall provide comprehensive admin user management with full CRUD capabilities including user data modification, exam code regeneration, and emergency technical issue resolution

### Non Functional

**NFR1:** The system shall support 300+ concurrent users during peak registration periods without performance degradation

**NFR2:** The system shall maintain 99.9% uptime during critical periods (registration opening, exam day, results release)

**NFR3:** The system shall achieve page load times of less than 2 seconds on mobile devices over 3G connections

**NFR4:** The system shall maintain 95%+ payment success rate through Stripe integration with proper retry logic and error handling

**NFR5:** The system shall comply with WCAG 2.1 AA accessibility standards including proper color contrast, screen reader support, and keyboard navigation

**NFR6:** The system shall implement mobile-first responsive design supporting 80%+ expected mobile traffic across all major browsers and devices

**NFR7:** The system shall ensure email delivery rates of 98%+ for critical communications including registration confirmations and results notifications

**NFR8:** The system shall provide 95%+ cross-browser compatibility across Chrome, Safari, Firefox, and Edge browsers

**NFR9:** The system shall implement Progressive Web App capabilities including offline functionality and app-like experience

**NFR10:** The system shall maintain real-time data replication and automated backup systems with point-in-time recovery capabilities

**NFR11:** The system shall implement connection pooling and auto-scaling capabilities to handle traffic spikes during registration periods

**NFR12:** The system shall provide comprehensive monitoring, alerting, and error recovery systems with automated incident response

**NFR13:** The system shall implement basic PDPA compliance through simple consent form during registration (full PDPA loop deferred to post-launch)

**NFR14:** The system shall implement CDN for static asset delivery ensuring fast content loading across geographical regions

**NFR15:** The system shall provide Redis caching for sessions and analytics to optimize performance and reduce database load

**NFR16:** The system shall implement secure PDF storage and delivery with 99%+ download success rate, supporting concurrent access during peak periods while maintaining 6-month data retention policy
