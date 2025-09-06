# Section 7: External APIs

The TBAT Mock Exam Platform integrates with several external services to provide payment processing, email delivery, and administrative capabilities. All integrations are designed for the Thai market with appropriate localization and compliance.

### Stripe Thailand Integration

**Purpose:** Process Thai Baht payments for Advanced packages and post-exam upgrades
**Documentation:** https://stripe.com/docs/api
**Market:** Thailand-specific implementation with THB support

#### Configuration
```typescript
// Stripe Configuration for Thailand
const stripeConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  apiVersion: '2023-10-16',
  locale: 'th', // Thai language support
  currency: 'thb', // Thai Baht only
  accountCountry: 'TH'
};
```

#### Key Integration Points

**Payment Intent Creation:**
```typescript
// Advanced Package Payment (690 THB)
POST https://api.stripe.com/v1/payment_intents
Authorization: Bearer sk_live_...
Content-Type: application/x-www-form-urlencoded

amount=69000 // 690 THB in smallest currency unit
currency=thb
payment_method_types[]=card
payment_method_types[]=promptpay // Thai digital wallet
metadata[user_id]=user_12345
metadata[package_type]=ADVANCED
metadata[exam_date]=2568-09-27
```

**Post-Exam Upgrade Payment (290 THB):**
```typescript
amount=29000 // 290 THB in smallest currency unit  
currency=thb
metadata[upgrade_type]=POST_EXAM
metadata[result_id]=result_67890
```

#### Webhook Integration
```typescript
// Webhook Endpoint: /api/webhook/stripe
interface StripeWebhookHandler {
  'payment_intent.succeeded': handlePaymentSuccess;
  'payment_intent.payment_failed': handlePaymentFailure;
  'payment_intent.canceled': handlePaymentCanceled;
  'charge.dispute.created': handleDispute;
}

async function handlePaymentSuccess(event: StripeEvent) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const userId = paymentIntent.metadata.user_id;
  const packageType = paymentIntent.metadata.package_type;
  
  // Upgrade user account
  await upgradeUserPackage(userId, packageType);
  
  // Send confirmation email
  await sendPaymentConfirmation(userId, paymentIntent);
  
  // Generate exam codes if Advanced package
  if (packageType === 'ADVANCED') {
    await generateAdvancedExamCodes(userId);
  }
}
```

#### Payment Methods Supported
- **Credit/Debit Cards:** Visa, Mastercard, JCB (popular in Thailand)
- **PromptPay:** Thailand's national digital payment system
- **Bank Transfers:** Thai bank integration for larger amounts
- **Mobile Banking:** SCB Easy, Kbank, Bangkok Bank mobile apps

#### Error Handling
```typescript
interface PaymentErrorHandler {
  'card_declined': 'บัตรถูกปฏิเสธ กรุณาตรวจสอบข้อมูลบัตร';
  'insufficient_funds': 'ยอดเงินไม่เพียงพอ กรุณาตรวจสอบบัญชี';
  'payment_method_unactivated': 'ระบบการชำระเงินยังไม่เปิดใช้งาน';
  'processing_error': 'เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่';
}
```

### Email Service Integration (Resend)

**Purpose:** Transactional emails for user notifications and PDF alerts
**Documentation:** https://resend.com/docs
**Plan:** Free tier (3,000 emails/month) suitable for 20-user scale

#### Configuration
```typescript
const resendConfig = {
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: 'noreply@tbat-mock-exam.com',
  fromName: 'TBAT Mock Exam Platform',
  replyTo: 'support@tbat-mock-exam.com',
  locale: 'th-TH'
};
```

#### Email Templates

**Welcome Email (Registration):**
```typescript
interface WelcomeEmail {
  to: string; // user email
  subject: 'ยินดีต้อนรับสู่ TBAT Mock Exam Platform';
  template: 'welcome-th';
  variables: {
    thai_name: string;
    package_type: PackageType;
    exam_date: '27 กันยายน 2568';
    session_time: SessionTime;
  };
}
```

**Exam Code Delivery:**
```typescript
interface ExamCodeEmail {
  to: string;
  subject: 'รหัสสอบ TBAT Mock Exam - สำคัญมาก';
  template: 'exam-codes-th';
  variables: {
    thai_name: string;
    exam_codes: ExamCode[];
    session_details: SessionInfo;
    important_instructions: string;
  };
}
```

**PDF Solution Notification (Advanced Users - FR23):**
```typescript
interface PDFNotificationEmail {
  to: string[];
  subject: 'เฉลยข้อสอบ TBAT พร้อมแล้ว - ดาวน์โหลดได้ทันที';
  template: 'pdf-ready-th';
  variables: {
    subject: Subject;
    pdf_description: string;
    download_link: string;
    expiry_notice: '6 เดือนจากวันนี้';
  };
}
```

**Data Expiry Warnings (FR22):**
```typescript
interface ExpiryWarningEmail {
  to: string;
  subject: 'แจ้งเตือน: ข้อมูลผลสอบจะหมดอายุ';
  template: 'expiry-warning-th';
  variables: {
    thai_name: string;
    days_remaining: number;
    results_count: number;
    urgent: boolean; // Red styling if < 7 days
  };
}
```

#### Batch Email Processing
```typescript
interface BatchEmailManager {
  queueAdvancedUserNotifications: (pdfId: string) => Promise<void>;
  processPendingEmails: () => Promise<ProcessingResult>;
  retryFailedEmails: () => Promise<RetryResult>;
  trackDeliveryStatus: (emailId: string) => Promise<DeliveryStatus>;
}

// Example: Notify all Advanced users about new PDF
async function notifyAdvancedUsersAboutPDF(pdfId: string) {
  const advancedUsers = await getUsersByPackageType('ADVANCED');
  const emailQueue = advancedUsers.map(user => ({
    to: user.email,
    template: 'pdf-ready-th',
    variables: { thai_name: user.thai_name, pdf_id: pdfId }
  }));
  
  return await batchSendEmails(emailQueue);
}
```

### LINE Integration (Optional Enhancement)

**Purpose:** Alternative communication channel for urgent notifications
**Documentation:** https://developers.line.biz/en/
**Implementation:** Future enhancement based on user adoption

```typescript
interface LineIntegration {
  sendExamReminder: (lineId: string, examDate: Date) => Promise<void>;
  notifyResultsReady: (lineId: string, resultId: string) => Promise<void>;
  sendPDFAlert: (lineId: string, pdfInfo: PDFInfo) => Promise<void>;
}
```

### Administrative External APIs

#### Vercel Analytics Integration
```typescript
// Built-in Vercel Analytics
interface VercelAnalytics {
  trackPageView: (path: string, userId?: string) => void;
  trackEvent: (event: string, properties: object) => void;
  trackConversion: (type: 'REGISTRATION' | 'UPGRADE', value: number) => void;
}

// Usage Examples
analytics.trackEvent('exam_code_generated', { 
  package_type: 'ADVANCED', 
  subject_count: 3 
});

analytics.trackConversion('UPGRADE', 290); // 290 THB upgrade
```

#### External Monitoring (Future)
```typescript
// Optional: External monitoring service
interface ExternalMonitoring {
  healthCheck: () => Promise<HealthStatus>;
  alertOnError: (error: Error, context: object) => Promise<void>;
  trackPerformance: (metric: string, value: number) => Promise<void>;
}
```

### API Security & Compliance

#### Authentication & Authorization
```typescript
// All external API calls include proper authentication
interface ExternalAPIAuth {
  stripe: { 
    secretKey: 'sk_live_...', 
    webhookSecret: 'whsec_...' 
  };
  resend: { 
    apiKey: 're_...' 
  };
  line: { 
    channelToken: 'line_channel_token',
    channelSecret: 'line_channel_secret' 
  };
}
```

#### Data Protection (PDPA Compliance)
```typescript
// PDPA compliance for external data sharing
interface PDPACompliantIntegration {
  stripeMetadata: {
    user_consent: boolean;
    data_retention: '6_months';
    purpose: 'exam_payment_processing';
  };
  emailData: {
    opt_in_status: boolean;
    unsubscribe_link: string;
    retention_policy: string;
  };
}
```

#### Rate Limiting & Retry Logic
```typescript
interface ExternalAPIResilience {
  retryConfig: {
    maxRetries: 3;
    backoffMultiplier: 2;
    initialDelay: 1000; // ms
  };
  rateLimiting: {
    stripe: '100/second';
    resend: '10/second';
    line: '1000/hour';
  };
  circuitBreaker: {
    failureThreshold: 5;
    timeout: 30000; // ms
    resetTimeout: 60000; // ms
  };
}
```

### Integration Testing Strategy

#### Comprehensive Integration Test Scenarios

**Stripe Payment Integration Testing:**
```typescript
interface StripeIntegrationTests {
  // Happy Path Scenarios
  successfulPaymentFlow: {
    testCase: 'Advanced Package Purchase (690 THB)';
    steps: [
      'Create payment intent with Thai Baht currency',
      'Process card payment with test card 4000000000001976 (TH card)',
      'Verify webhook delivery and signature validation',
      'Confirm user package upgrade in database',
      'Validate exam code generation for all 3 subjects',
      'Verify confirmation email delivery'
    ];
    expectedResults: {
      paymentStatus: 'succeeded';
      userPackageType: 'ADVANCED';
      examCodesGenerated: 3;
      emailDelivered: true;
    };
    testData: {
      amount: 69000; // 690 THB in cents
      currency: 'thb';
      testCard: '4000000000001976'; // Thailand test card
    };
  };

  // Error Scenarios
  paymentFailureScenarios: {
    cardDeclined: {
      testCard: '4000000000000002';
      expectedError: 'card_declined';
      expectedUserMessage: 'บัตรถูกปฏิเสธ กรุณาตรวจสอบข้อมูลบัตร';
      rollbackActions: ['restore_user_package', 'cleanup_payment_intent'];
    };
    insufficientFunds: {
      testCard: '4000000000009995';
      expectedError: 'insufficient_funds';
      expectedUserMessage: 'ยอดเงินไม่เพียงพอ กรุณาตรวจสอบบัญชี';
    };
    networkTimeout: {
      scenario: 'webhook_delivery_failure';
      timeout: '30_seconds';
      retryLogic: 'exponential_backoff_3_attempts';
      fallbackAction: 'manual_payment_verification';
    };
  };

  // Thai-Specific Payment Methods
  thaiPaymentMethods: {
    promptPay: {
      testCase: 'PromptPay QR Code Payment';
      steps: [
        'Generate PromptPay payment intent',
        'Display QR code to user',
        'Simulate PromptPay app payment confirmation',
        'Process webhook notification',
        'Complete user upgrade'
      ];
      testData: { paymentMethod: 'promptpay', amount: 69000 };
    };
    bankTransfer: {
      testCase: 'Thai Bank Transfer';
      simulatedBanks: ['SCB', 'KBANK', 'BBL', 'KTB'];
      verificationProcess: 'manual_confirmation_required';
    };
  };

  // Edge Cases
  edgeCaseTests: {
    duplicateWebhook: {
      scenario: 'Same webhook delivered multiple times';
      prevention: 'idempotency_key_validation';
      expectedBehavior: 'process_once_ignore_duplicates';
    };
    concurrentPayments: {
      scenario: 'User initiates multiple payment intents simultaneously';
      prevention: 'user_payment_lock';
      resolution: 'cancel_duplicate_intents';
    };
    examDayPaymentLoad: {
      scenario: '20 users paying simultaneously during registration window';
      loadTest: 'concurrent_payment_processing';
      expectedResponseTime: '<3_seconds_per_payment';
    };
  };
}
```

**Email Service Integration Testing:**
```typescript
interface ResendIntegrationTests {
  emailDeliveryTests: {
    welcomeEmail: {
      testCase: 'New user registration email (Thai language)';
      recipients: ['test+thai@tbat-mock-exam.com'];
      templateValidation: {
        thaiCharacters: 'rendered_correctly';
        userPersonalization: 'thai_name_displayed';
        examDetails: 'session_time_and_date_accurate';
      };
      deliveryMetrics: {
        targetDeliveryTime: '<30_seconds';
        expectedDeliveryRate: '>99%';
      };
    };

    examCodeDelivery: {
      testCase: 'Critical exam code delivery email';
      priority: 'HIGH_PRIORITY';
      testScenarios: [
        {
          packageType: 'FREE';
          expectedCodes: 1;
          subject: 'BIOLOGY' | 'CHEMISTRY' | 'PHYSICS';
          template: 'exam-codes-free-th';
        },
        {
          packageType: 'ADVANCED';
          expectedCodes: 3;
          subjects: ['BIOLOGY', 'CHEMISTRY', 'PHYSICS'];
          template: 'exam-codes-advanced-th';
        }
      ];
      failureHandling: {
        retryAttempts: 3;
        alternativeDelivery: 'sms_backup_or_user_portal_notification';
        escalation: 'manual_admin_intervention';
      };
    };

    batchEmailTests: {
      pdfNotificationBatch: {
        testCase: 'Notify all Advanced users about PDF availability';
        recipientCount: 'all_advanced_users_up_to_20';
        batchProcessing: {
          batchSize: 10;
          delayBetweenBatches: '1_second';
          failureHandling: 'individual_retry_logic';
        };
        performanceTargets: {
          totalProcessingTime: '<2_minutes_for_20_users';
          deliverySuccessRate: '>95%';
        };
      };
    };
  };

  emailContentValidation: {
    thaiLanguageSupport: {
      encoding: 'UTF-8';
      fontRendering: 'thai_fonts_supported';
      readabilityTest: 'native_thai_speaker_validation';
    };
    linkValidation: {
      downloadLinks: 'verify_secure_token_generation';
      unsubscribeLinks: 'PDPA_compliance_validation';
      trackingPixels: 'privacy_compliant_analytics';
    };
  };

  errorScenarios: {
    serviceUnavailable: {
      scenario: 'Resend API returns 503 Service Unavailable';
      fallbackAction: 'queue_for_retry';
      userNotification: 'delay_notification_in_user_dashboard';
    };
    rateLimitExceeded: {
      scenario: 'API rate limit exceeded during peak usage';
      prevention: 'intelligent_queueing';
      backoffStrategy: 'exponential_backoff';
    };
    invalidEmailAddresses: {
      scenario: 'Bounce handling for invalid email addresses';
      actions: ['mark_email_invalid', 'notify_user_to_update', 'admin_alert'];
    };
  };
}
```

**Database Integration Testing:**
```typescript
interface DatabaseIntegrationTests {
  concurrencyTests: {
    examRegistration: {
      testCase: '20 users registering simultaneously';
      scenario: 'session_capacity_enforcement';
      expectedBehavior: {
        successfulRegistrations: 'up_to_session_limit';
        queuedRegistrations: 'handled_with_proper_messaging';
        databaseConsistency: 'no_race_conditions';
      };
      verificationSteps: [
        'Check session capacity not exceeded',
        'Verify all exam codes are unique',
        'Confirm payment intents created correctly',
        'Validate database transactions completed'
      ];
    };

    dataConsistency: {
      paymentToUpgrade: {
        scenario: 'Stripe webhook concurrent with user actions';
        testSteps: [
          'User initiates payment',
          'User updates profile simultaneously',
          'Stripe webhook processes payment success',
          'Verify final user state consistency'
        ];
        expectedOutcome: 'upgraded_user_with_consistent_profile_data';
      };
    };
  };

  dataLifecycleTests: {
    sixMonthExpiry: {
      testCase: 'Automated data expiry process';
      testData: 'mock_data_with_various_expiry_dates';
      automatedProcess: {
        dailyCronJob: 'mark_expired_data_inaccessible';
        userNotifications: 'progressive_warning_system';
        verificationPoints: [
          '30_days_before_expiry_warning_sent',
          '7_days_before_expiry_urgent_warning',
          '1_day_before_expiry_final_notice',
          'expiry_date_data_marked_inaccessible'
        ];
      };
    };

    backupAndRestore: {
      testCase: 'Point-in-time recovery testing';
      frequency: 'monthly';
      testSteps: [
        'Create test data in production-like environment',
        'Simulate database corruption or data loss',
        'Restore from Vercel Postgres backup',
        'Verify data integrity and completeness'
      ];
      successCriteria: {
        recoveryTime: '<1_hour';
        dataLoss: '<15_minutes_from_backup_point';
        applicationFunctionality: 'fully_restored';
      };
    };
  };

  performanceTests: {
    queryOptimization: {
      testQueries: {
        userDashboard: 'SELECT user data with results and PDF access';
        adminUserList: 'SELECT all users with pagination';
        analyticsGeneration: 'Complex queries for percentile calculations';
      };
      performanceTargets: {
        simpleQueries: '<50ms_p95';
        complexQueries: '<200ms_p95';
        bulkOperations: '<1s_for_20_user_operations';
      };
    };
  };
}
```

#### Mock Services for Development
```typescript
// Enhanced Development/Testing mock implementations
interface MockExternalServices {
  mockStripe: {
    createPaymentIntent: (params: PaymentParams) => Promise<MockPaymentIntent>;
    confirmPayment: (intentId: string) => Promise<MockPaymentResult>;
    simulateWebhook: (event: StripeEventType) => Promise<void>;
    simulateFailures: (errorType: StripeErrorType) => Promise<MockError>;
  };
  mockResend: {
    sendEmail: (emailData: EmailData) => Promise<MockEmailResult>;
    batchSend: (emails: EmailData[]) => Promise<MockBatchResult>;
    simulateDeliveryDelay: (delayMs: number) => Promise<void>;
    simulateBounce: (emailAddress: string) => Promise<MockBounce>;
  };
  mockVercelServices: {
    blob: MockBlobStorage;
    postgres: MockDatabase;
    analytics: MockAnalytics;
  };
}

// Example: Comprehensive Stripe Mock for testing
const mockStripe = {
  createPaymentIntent: async (params) => ({
    id: `pi_test_${generateTestId()}`,
    status: 'requires_payment_method',
    amount: params.amount,
    currency: params.currency,
    metadata: params.metadata,
    client_secret: `pi_test_${generateTestId()}_secret_test`
  }),
  
  simulateSuccessfulPayment: async (intentId: string) => ({
    id: intentId,
    status: 'succeeded',
    charges: {
      data: [{
        id: `ch_test_${generateTestId()}`,
        paid: true,
        outcome: { network_status: 'approved_by_network' }
      }]
    }
  }),

  simulateThaiPaymentMethods: {
    promptpay: async (intentId: string) => ({
      id: intentId,
      status: 'processing',
      payment_method: {
        type: 'promptpay',
        promptpay: { reference: 'PROMPTPAY_REF_123' }
      }
    })
  }
};
```

#### Integration Health Monitoring
```typescript
interface ExternalServiceHealth {
  stripe: {
    status: 'healthy' | 'degraded' | 'down';
    lastCheck: Date;
    responseTime: number; // milliseconds
    errorRate: number; // percentage
    testTransactionSuccess: boolean;
  };
  resend: {
    status: 'healthy' | 'degraded' | 'down';
    lastCheck: Date;
    deliveryRate: number; // percentage
    queueLength: number;
    lastSuccessfulDelivery: Date;
  };
  vercelPlatform: {
    status: 'healthy' | 'degraded' | 'down';
    lastCheck: Date;
    services: {
      functions: 'healthy' | 'degraded' | 'down';
      database: 'healthy' | 'degraded' | 'down';
      blob: 'healthy' | 'degraded' | 'down';
      analytics: 'healthy' | 'degraded' | 'down';
    };
  };
}

// Automated Integration Health Checks
async function performIntegrationHealthCheck(): Promise<IntegrationHealthReport> {
  const healthResults = await Promise.allSettled([
    testStripeConnection(),
    testResendDelivery(),
    testDatabaseConnection(),
    testBlobStorageAccess()
  ]);

  return {
    overall: calculateOverallHealth(healthResults),
    details: healthResults,
    recommendations: generateHealthRecommendations(healthResults),
    timestamp: new Date(),
    nextCheckScheduled: addMinutes(new Date(), 5)
  };
}
```

This external API integration strategy ensures reliable payment processing, effective communication, and compliance with Thai market requirements while maintaining system resilience and user experience quality.
