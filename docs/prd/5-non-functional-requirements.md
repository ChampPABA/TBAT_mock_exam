# 5. Non-Functional Requirements (v6.0)

**Version 6.0 Updates:**
- Enhanced visualization performance requirements for box plots
- Added photo gallery performance metrics
- Updated payment processing for dual-tier upgrades (690/290 THB)
- Added LINE integration requirements

### 5.1 Performance Requirements
- **Page Load Time:** <2.5 seconds for all pages
- **API Response:** <500ms for all endpoints
- **Concurrent Users:** Support 200+ during exam periods, scalable to 1000+
- **Payment Processing:** <3 seconds for Stripe checkout (690/290 THB)
- **Database Queries:** <100ms average response time
- **Box Plot Rendering:** <1 second for score distribution visualization
- **Photo Gallery Load:** <2 seconds for initial gallery display
- **TBAT Score Calculation:** <200ms per student result

### 5.2 Security Requirements
- **Payment Security:** PCI DSS compliance via Stripe
- **Data Protection:** Encryption at rest and in transit
- **Authentication:** Secure JWT-based authentication
- **Password Policy:** Minimum 8 characters with complexity requirements
- **Webhook Security:** Stripe signature validation for all webhooks
- **Rate Limiting:** Prevent abuse with API rate limits

### 5.3 Scalability Requirements
- **User Growth:** Scale from 500 to 25,000 users in 6 months
- **Auto-scaling:** Automatic server scaling based on load
- **CDN Integration:** Global content delivery for static assets
- **Database Scaling:** Support for read replicas if needed
- **Load Balancing:** Distribute traffic across multiple servers

### 5.4 Availability & Reliability
- **Uptime Target:** 99.9% availability
- **Recovery Time:** <1 minute for critical failures
- **Backup Strategy:** Daily automated backups with 30-day retention
- **Rollback Capability:** <30 minutes rollback time
- **Monitoring:** Real-time alerts for system issues

### 5.5 Usability Requirements
- **Mobile Responsive:** Optimized for all device sizes (320px+)
- **Browser Support:** Chrome, Safari, Firefox, Edge (latest 2 versions)
- **Accessibility:** WCAG 2.1 AA compliance
- **Loading States:** Visual feedback for all interactions
- **Error Handling:** Clear, actionable error messages
- **Social Integration:** Seamless LINE QR code display and group joining
- **Data Visualization:** Interactive box plots with hover tooltips

### 5.6 Payment & Billing Requirements
- **Payment Gateway:** Stripe integration
- **Payment Methods:** Credit/Debit cards initially
- **Transaction Fee:** 2.9% + ฿10 per transaction
- **Receipt Generation:** Automatic PDF receipts
- **Refund Process:** Support manual refunds via admin panel
- **Pricing Tiers:** ฿690 (Advanced Package), ฿290 (Post-Exam Upgrade)
- **Access Duration:** 6-month validity for post-exam upgrades

### 5.7 Compliance & Legal
- **Data Privacy:** PDPA compliance for Thai users
- **Terms of Service:** Clear terms for Free and Advanced Package tiers
- **Age Verification:** Users must be 13+ years old
- **Parental Consent:** Optional parent contact for minors
- **Content Rights:** Proper licensing for all exam content
