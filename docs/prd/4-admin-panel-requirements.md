# 4. Admin Panel Requirements (v6.0)

**Version 6.0 Updates (Cycle 2 Changes):**
- Updated all VVIP references to "Advanced Package"
- Added TBAT scoring formula calculation in results upload
- Enhanced answer key management for dual-tier access (Advanced + Post-Exam Upgrade)
- Added LINE group management features
- Added photo gallery management

**Version 5.1 Updates:**
- Added Story 5.6: Answer Key Upload functionality for manual PDF upload by admin staff

## Epic: Exam Management

- **Story 4.1 - Create Exam Session:** As an admin, I want to create new exam sessions with date, time, venue, and capacity details for physical exams.
- **Story 4.2 - View Registrations:** As an admin, I want to see all registrations for upcoming exam sessions including student details and tier status.
- **Story 4.3 - Generate Attendance List:** As an admin, I want to export an attendance list for exam day check-in at the physical venue.
- **Story 4.4 - Exam Status Management:** As an admin, I want to mark exam sessions as upcoming, in-progress, or completed.

## Epic: Results Management

- **Story 5.1 - Upload Results CSV:** As an admin, after grading physical exams, I want to upload a CSV file containing student scores with automatic TBAT score calculation (2400 points: Physics 800, Chemistry 800, Biology 800).
- **Story 5.2 - CSV Validation:** The system should validate the CSV format and show errors for any invalid entries before processing.
- **Story 5.3 - Batch Results Processing:** As an admin, I want to see progress and confirmation when uploading results for hundreds of students.
- **Story 5.4 - Results Publication:** As an admin, I want to control when results become visible to students (publish/unpublish).
- **Story 5.5 - Edit Individual Results:** As an admin, I need to correct individual student scores if grading errors are discovered.
- **Story 5.6 - Answer Key Upload:** As an admin, I want to upload answer key PDF files for each exam session and publish them to Advanced Package and Post-Exam Upgrade students.
  - Upload PDF file (max 50MB)
  - Preview uploaded file before publishing
  - One-click publish to make available to Advanced Package and Post-Exam Upgrade users
  - Track access permissions (Advanced vs Post-Exam Upgrade)
  - Replace/update answer key if needed
- **Story 5.7 - Box Plot Configuration:** As an admin, I want to configure box plot parameters for score distribution visualization.

## Epic: User & Registration Management

- **Story 6.1 - View All Users:** As an admin, I want to see a list of all registered users with their tier status (FREE/Advanced Package/Post-Exam Upgrade) and registration details.
- **Story 6.2 - Search Users:** As an admin, I want to search for users by name, email, school, or exam ticket number.
- **Story 6.3 - User Details:** As an admin, I want to view detailed information about any user including their exam history and payment status.
- **Story 6.4 - Manual Tier Upgrade:** As an admin, I want to manually upgrade a user from FREE to Advanced Package or Post-Exam Upgrade tier (for special cases).
- **Story 6.5 - Registration Export:** As an admin, I want to export registration data as CSV for analysis and reporting.

## Epic: Payment & Revenue Tracking

- **Story 7.1 - Payment Dashboard:** As an admin, I want to see total revenue, conversion rates, and payment trends.
- **Story 7.2 - Transaction History:** As an admin, I want to view all payment transactions with user details and amounts.
- **Story 7.3 - Refund Processing:** As an admin, I want to process refunds through the admin panel when needed.
- **Story 7.4 - Revenue Reports:** As an admin, I want to generate monthly revenue reports showing FREE vs Advanced Package conversions and Post-Exam Upgrade revenue (฿290).
- **Story 7.5 - Failed Payments:** As an admin, I want to see and investigate failed payment attempts.

## Epic: Analytics & Reporting

- **Story 8.1 - Dashboard Overview:** As an admin, I want to see key metrics:
  - Total registrations (FREE vs Advanced Package)
  - Conversion rate percentage (pre-exam and post-exam)
  - Post-exam upgrade adoption rate (฿290)
  - Exam attendance rate
  - Average TBAT scores by subject and overall
  - Results viewing rate
  - LINE group join rate
- **Story 8.2 - Conversion Funnel:** As an admin, I want to track the user journey from free registration to Advanced Package upgrade, including post-exam upgrade conversions.
- **Story 8.3 - Performance Analytics:** As an admin, I want to see aggregate exam performance data to identify difficult topics.
- **Story 8.4 - School Performance:** As an admin, I want to compare performance across different schools.
- **Story 8.5 - Export Analytics:** As an admin, I want to export all analytics data for external analysis.

## Epic: Communication Management

- **Story 9.1 - Bulk Email:** As an admin, I want to send bulk emails to specific user segments (FREE users, Advanced Package users, Post-Exam Upgrade users, all users).
- **Story 9.2 - Email Templates:** As an admin, I want to manage email templates for registration confirmation, exam reminders, and results notifications.
- **Story 9.3 - Notification Log:** As an admin, I want to see a log of all sent notifications with delivery status.
- **Story 9.4 - Announcement Banner:** As an admin, I want to post announcements that appear on the student portal.

## Epic: System Administration

- **Story 10.1 - Admin User Management:** As a super admin, I want to create and manage other admin accounts with role-based permissions.
- **Story 10.2 - Activity Logs:** As an admin, I want to see audit logs of all admin actions for security and accountability.
- **Story 10.3 - System Health:** As an admin, I want to monitor system health including server status and error rates.
- **Story 10.4 - Backup Management:** As an admin, I want to trigger and verify database backups.
- **Story 10.5 - Settings Management:** As an admin, I want to configure system settings like exam dates, pricing (฿690/฿290), and tier features.

## Epic: Social & Gallery Management

- **Story 11.1 - LINE Group Management:** As an admin, I want to manage LINE group QR codes and track student join rates.
- **Story 11.2 - Photo Gallery Upload:** As an admin, I want to upload and manage Dentorium Camp photos for the gallery section.
- **Story 11.3 - Gallery Moderation:** As an admin, I want to review, approve, and organize gallery photos with captions.
