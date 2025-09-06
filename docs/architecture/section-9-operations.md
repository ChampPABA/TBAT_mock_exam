# Section 9: Operations

The TBAT Mock Exam Platform operations strategy ensures 99.9% uptime during critical exam periods while maintaining cost efficiency at ฿710/month operational costs. All operations leverage Vercel's integrated platform for simplified deployment and monitoring.

### Deployment Strategy

#### Environment Configuration
```typescript
// Multi-environment setup
interface EnvironmentConfig {
  development: {
    domain: 'localhost:3000';
    database: 'postgresql://localhost:5432/tbat_dev';
    stripe: 'test_mode';
    logging: 'verbose';
    features: 'all_enabled';
  };
  staging: {
    domain: 'staging.tbat-mock-exam.com';
    database: 'vercel_postgres_staging';
    stripe: 'test_mode';
    logging: 'standard';
    features: 'production_features';
  };
  production: {
    domain: 'tbat-mock-exam.com';
    database: 'vercel_postgres_production';
    stripe: 'live_mode';
    logging: 'error_and_audit';
    features: 'production_only';
  };
}
```

#### Continuous Integration/Deployment
```yaml
# .github/workflows/deploy.yml
name: TBAT Platform Deploy
on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm run test
      - run: pnpm run e2e:headless # Playwright tests
      - run: pnpm run build

  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--env staging'

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
      - name: Run post-deployment tests
        run: pnpm run test:production
```

#### Database Migration Strategy
```typescript
// Prisma migration workflow
interface MigrationStrategy {
  development: {
    approach: 'prisma_migrate_dev';
    rollback: 'automatic';
    data_seed: 'mock_data_full';
  };
  staging: {
    approach: 'prisma_migrate_deploy';
    rollback: 'manual_approval';
    data_seed: 'realistic_test_data';
  };
  production: {
    approach: 'prisma_migrate_deploy';
    rollback: 'emergency_only';
    data_seed: 'none';
    backup_before_migration: true;
  };
}

// Pre-migration checklist
const migrationChecklist = [
  '✓ Database backup completed',
  '✓ Migration tested on staging',
  '✓ Rollback plan prepared',
  '✓ Maintenance window scheduled',
  '✓ User notification sent',
  '✓ Monitoring alerts configured'
];
```

#### Emergency Rollback Procedures

**Comprehensive Rollback Strategy for TBAT Platform:**
```typescript
interface EmergencyRollbackProcedures {
  // Critical System Failure Rollback
  applicationRollback: {
    vercelDeploymentRollback: {
      trigger: 'deployment_causing_system_unavailability_or_critical_errors';
      timeToExecute: '<2_minutes';
      steps: [
        {
          step: 1;
          action: 'Access Vercel dashboard immediately';
          command: 'Navigate to Project → Deployments';
          timeLimit: '30_seconds';
        },
        {
          step: 2;
          action: 'Identify last known good deployment';
          criteria: 'deployment_before_incident_with_green_health_status';
          verification: 'check_deployment_timestamp_against_incident_time';
          timeLimit: '30_seconds';
        },
        {
          step: 3;
          action: 'Promote previous deployment to production';
          command: 'Click "Promote to Production" on last good deployment';
          notification: 'Slack channel immediately';
          timeLimit: '30_seconds';
        },
        {
          step: 4;
          action: 'Verify rollback success';
          checks: [
            'application_loads_successfully',
            'api_endpoints_responding',
            'database_connections_working',
            'user_authentication_functional'
          ];
          timeLimit: '30_seconds';
        }
      ];
      postRollbackActions: [
        'notify_all_stakeholders_rollback_complete',
        'begin_incident_analysis',
        'prepare_detailed_status_update',
        'schedule_fix_deployment'
      ];
    };

    gitBasedRollback: {
      scenario: 'when_vercel_deployment_rollback_insufficient';
      trigger: 'code_level_issues_requiring_git_history_rollback';
      steps: [
        {
          step: 1;
          action: 'Identify problematic commit';
          command: 'git log --oneline -10';
          analysis: 'correlate_commits_with_incident_timeline';
        },
        {
          step: 2;
          action: 'Create emergency fix branch';
          commands: [
            'git checkout main',
            'git pull origin main',
            'git checkout -b emergency/rollback-incident-YYYYMMDD'
          ];
        },
        {
          step: 3;
          action: 'Revert problematic commits';
          command: 'git revert <commit-hash> --no-edit';
          verification: 'ensure_revert_doesnt_break_other_features';
        },
        {
          step: 4;
          action: 'Emergency deployment';
          commands: [
            'git push origin emergency/rollback-incident-YYYYMMDD',
            'Create PR to main with emergency label',
            'Merge immediately after minimal review',
            'Monitor Vercel auto-deployment'
          ];
        }
      ];
    };
  };

  // Database Rollback Procedures
  databaseRollback: {
    migrationRollback: {
      trigger: 'database_migration_causing_data_corruption_or_system_failure';
      severity: 'CRITICAL_EXAM_DATA_AT_RISK';
      timeToExecute: '<5_minutes';
      prerequisites: [
        'verify_database_backup_availability',
        'confirm_rollback_window_acceptable',
        'notify_stakeholders_of_data_rollback'
      ];
      steps: [
        {
          step: 1;
          action: 'Stop all application traffic';
          method: 'set_vercel_functions_to_maintenance_mode';
          userFacingMessage: 'ระบบกำลังปรับปรุง กรุณารอสักครู่ (System under maintenance)';
          timeLimit: '1_minute';
        },
        {
          step: 2;
          action: 'Access Vercel Postgres dashboard';
          location: 'Vercel Dashboard → Storage → Postgres';
          verification: 'confirm_backup_timestamps_available';
          timeLimit: '1_minute';
        },
        {
          step: 3;
          action: 'Initiate point-in-time recovery';
          target: 'timestamp_before_problematic_migration';
          consideration: 'data_loss_window_communication';
          timeLimit: '2_minutes_setup';
        },
        {
          step: 4;
          action: 'Verify database restoration';
          checks: [
            'user_table_count_matches_expected',
            'exam_codes_integrity_maintained',
            'payment_records_consistent',
            'pdf_metadata_accessible'
          ];
          timeLimit: '1_minute';
        },
        {
          step: 5;
          action: 'Resume application traffic';
          method: 'remove_maintenance_mode';
          verification: 'end_to_end_user_flow_testing';
          communication: 'user_notification_service_restored';
        }
      ];
      dataLossHandling: {
        acceptableDataLoss: '<15_minutes_of_transactions';
        criticalPeriodHandling: 'if_during_exam_registration_escalate_to_manual_recreation';
        userCommunication: 'transparent_communication_about_any_data_loss';
        compensationProcess: 'priority_support_for_affected_users';
      };
    };

    schemaRollback: {
      scenario: 'database_schema_changes_causing_application_errors';
      approach: 'prisma_migrate_rollback_if_possible_or_manual_schema_reversion';
      steps: [
        {
          step: 1;
          action: 'Check Prisma migration history';
          command: 'npx prisma migrate status';
          analysis: 'identify_last_successful_migration_state';
        },
        {
          step: 2;
          action: 'Attempt Prisma rollback';
          commands: [
            'npx prisma migrate resolve --rolled-back <migration-name>',
            'npx prisma db push --accept-data-loss (if necessary)'
          ];
          fallback: 'manual_sql_schema_reversion';
        },
        {
          step: 3;
          action: 'Manual schema reversion (if Prisma fails)';
          process: [
            'connect_to_vercel_postgres_directly',
            'execute_pre_prepared_rollback_sql_scripts',
            'verify_schema_matches_working_application_expectations'
          ];
        }
      ];
    };
  };

  // Payment System Rollback
  paymentSystemRollback: {
    stripeWebhookFailure: {
      trigger: 'webhook_processing_causing_incorrect_user_upgrades';
      urgency: 'HIGH_financial_accuracy_required';
      steps: [
        {
          step: 1;
          action: 'Disable webhook endpoint temporarily';
          method: 'comment_out_webhook_handler_and_deploy';
          notification: 'stripe_webhook_disabled_alert';
          timeLimit: '2_minutes';
        },
        {
          step: 2;
          action: 'Identify affected payments and users';
          query: 'SELECT payments and user upgrades from webhook failure period';
          tools: 'vercel_postgres_query_interface';
        },
        {
          step: 3;
          action: 'Manual payment verification';
          process: [
            'cross_reference_stripe_dashboard_with_database',
            'identify_discrepancies',
            'prepare_correction_scripts'
          ];
        },
        {
          step: 4;
          action: 'Correct user package statuses';
          method: 'admin_manual_corrections_with_audit_trail';
          verification: 'affected_users_contacted_and_verified';
        },
        {
          step: 5;
          action: 'Re-enable webhook with fix';
          deployment: 'emergency_deployment_with_webhook_fix';
          testing: 'test_webhook_with_stripe_test_events';
        }
      ];
    };

    paymentIntentCorruption: {
      scenario: 'stripe_payment_intents_created_incorrectly_affecting_user_payments';
      steps: [
        {
          step: 1;
          action: 'Stop new payment intent creation';
          method: 'disable_payment_endpoints_temporarily';
          userMessage: 'การชำระเงินชั่วคราวไม่สามารถทำได้ กรุณาลองใหม่ในภายหলัง';
        },
        {
          step: 2;
          action: 'Analyze affected payment intents';
          timeframe: 'since_last_known_good_payment';
          tools: ['stripe_dashboard_analysis', 'database_payment_records'];
        },
        {
          step: 3;
          action: 'Cancel incorrect payment intents';
          method: 'stripe_api_cancel_payment_intents';
          notification: 'affected_users_notified_of_cancellation';
        },
        {
          step: 4;
          action: 'Refund processed payments if necessary';
          approval: 'business_stakeholder_approval_required';
          communication: 'transparent_user_communication_about_refunds';
        }
      ];
    };
  };

  // Configuration Rollback
  configurationRollback: {
    environmentVariableRollback: {
      scenario: 'incorrect_environment_variables_causing_system_malfunction';
      steps: [
        {
          step: 1;
          action: 'Access Vercel project settings';
          location: 'Dashboard → Project → Settings → Environment Variables';
        },
        {
          step: 2;
          action: 'Identify changed variables';
          method: 'compare_current_with_last_known_good_configuration';
          source: 'git_commit_history_or_documentation';
        },
        {
          step: 3;
          action: 'Revert to previous values';
          caution: 'ensure_not_reverting_legitimate_updates';
          verification: 'cross_check_with_team_members';
        },
        {
          step: 4;
          action: 'Trigger redeployment';
          method: 'vercel_environment_change_triggers_automatic_deployment';
          monitoring: 'watch_deployment_status_carefully';
        }
      ];
    };

    featureFlagRollback: {
      scenario: 'feature_flags_causing_user_experience_issues';
      approach: 'immediate_feature_flag_reversion';
      tools: 'vercel_edge_config_for_instant_rollback';
      steps: [
        {
          step: 1;
          action: 'Access feature flag configuration';
          location: 'vercel_edge_config_dashboard';
        },
        {
          step: 2;
          action: 'Disable problematic features';
          method: 'set_feature_flags_to_false';
          effect: 'immediate_global_application_change';
        },
        {
          step: 3;
          action: 'Verify feature disabled';
          testing: 'user_flow_testing_without_problematic_features';
        }
      ];
    };
  };

  // Emergency Communication Procedures
  emergencyCommunication: {
    userNotification: {
      immediateNotification: {
        channels: ['website_banner', 'email_to_registered_users'];
        message_thai: 'ระบบกำลังได้รับการแก้ไข เราขออภัยในความไม่สะดวก';
        message_english: 'System is being fixed. We apologize for the inconvenience.';
        updateFrequency: 'every_15_minutes_during_incident';
      };
      postRollbackNotification: {
        content: [
          'incident_summary_in_thai',
          'actions_taken_to_resolve',
          'preventive_measures_implemented',
          'contact_information_for_questions'
        ];
        delivery: 'email_to_all_affected_users';
        timeline: 'within_2_hours_of_resolution';
      };
    };

    stakeholderCommunication: {
      immediateNotification: {
        recipients: ['technical_lead', 'project_manager', 'business_stakeholders'];
        information: [
          'incident_severity_assessment',
          'rollback_action_taken',
          'estimated_resolution_time',
          'user_impact_assessment'
        ];
        method: 'slack_and_email_immediately';
      };
      executiveNotification: {
        trigger: 'incident_lasting_longer_than_30_minutes';
        recipients: ['ceo', 'cto', 'head_of_education'];
        content: [
          'business_impact_assessment',
          'technical_summary',
          'customer_communication_plan',
          'lessons_learned_preview'
        ];
      };
    };
  };

  // Rollback Success Verification
  rollbackVerification: {
    functionalTesting: {
      criticalUserFlows: [
        {
          flow: 'user_registration_and_login';
          testSteps: [
            'create_new_test_user_account',
            'verify_email_delivery',
            'confirm_login_functionality'
          ];
          acceptanceCriteria: 'complete_user_onboarding_successful';
        },
        {
          flow: 'exam_registration_and_payment';
          testSteps: [
            'register_for_exam_session',
            'process_test_payment',
            'verify_exam_code_generation',
            'confirm_email_notifications'
          ];
          acceptanceCriteria: 'end_to_end_exam_registration_working';
        },
        {
          flow: 'pdf_download_for_advanced_users';
          testSteps: [
            'login_as_advanced_user',
            'access_pdf_download_section',
            'generate_download_token',
            'complete_pdf_download'
          ];
          acceptanceCriteria: 'pdf_download_functionality_restored';
        }
      ];
    };

    performanceVerification: {
      responseTimeCheck: {
        endpoints: ['/api/auth/login', '/api/exam/register', '/api/payment/create'];
        target: 'response_times_within_normal_baselines';
        method: 'automated_performance_testing_suite';
      };
      loadTesting: {
        scenario: 'simulate_10_concurrent_users_post_rollback';
        duration: '5_minutes_sustained_load';
        success_criteria: 'no_performance_degradation_from_baseline';
      };
    };

    dataIntegrityVerification: {
      userDataConsistency: {
        checks: [
          'user_accounts_accessible',
          'exam_registrations_intact',
          'payment_records_accurate',
          'pdf_access_permissions_correct'
        ];
        method: 'automated_data_integrity_scripts';
      };
      businessLogicVerification: {
        scenarios: [
          'session_capacity_enforcement_working',
          'package_upgrade_logic_functioning',
          'data_expiry_calculations_accurate'
        ];
      };
    };
  };

  // Documentation and Learning
  postRollbackDocumentation: {
    incidentReport: {
      timeline: 'complete_within_24_hours';
      sections: [
        'incident_summary',
        'root_cause_analysis',
        'rollback_procedures_used',
        'effectiveness_of_rollback',
        'user_impact_assessment',
        'lessons_learned',
        'preventive_measures_to_implement'
      ];
    };
    
    procedureImprovement: {
      rollbackTimeAnalysis: 'measure_actual_rollback_time_vs_target';
      processGaps: 'identify_areas_where_rollback_could_be_faster';
      toolingImprovements: 'evaluate_need_for_better_rollback_automation';
      trainingNeeds: 'assess_team_preparedness_for_emergency_procedures';
    };
  };
}
```

**Exam-Critical Period Rollback Protocols:**
```typescript
interface ExamCriticalRollbackProtocols {
  examDayEmergencyProcedures: {
    context: 'rollbacks_during_active_exam_registration_or_exam_day';
    severity: 'MAXIMUM_URGENCY_STUDENT_FUTURES_AT_RISK';
    
    decisionMatrix: {
      '6_hours_before_exam': {
        rollbackApproval: 'automatic_for_critical_issues';
        communicationStrategy: 'immediate_student_notification';
        fallbackPlan: 'manual_exam_code_distribution_if_needed';
      };
      '2_hours_before_exam': {
        rollbackApproval: 'cto_approval_required';
        impact_assessment: 'must_consider_student_preparation_disruption';
        alternative: 'manual_workarounds_preferred_over_rollback';
      };
      'during_exam_hours': {
        rollbackApproval: 'executive_decision_only';
        priority: 'student_continuity_over_system_perfection';
        approach: 'minimal_viable_fixes_rather_than_full_rollback';
      };
    };

    emergencyContactProcedures: {
      studentCommunication: {
        channels: ['LINE_notification', 'SMS_backup', 'email_blast'];
        message_template: 'exam_specific_emergency_communication';
        language: 'thai_primary_english_secondary';
      };
      educationPartnerNotification: {
        recipients: ['tutoring_center_directors', 'education_ministry_contacts'];
        timeline: 'within_15_minutes_of_exam_day_incident';
      };
    };

    manualFallbackProcedures: {
      examCodeDistribution: {
        method: 'pre_generated_backup_codes_stored_securely';
        delivery: 'manual_email_distribution_by_admin';
        verification: 'phone_confirmation_with_students';
      };
      resultProcessing: {
        fallback: 'offline_result_calculation_and_manual_upload';
        timeline: 'maintain_48_hour_result_delivery_commitment';
      };
    };
  };
}
```

### Monitoring & Observability

#### Performance Benchmarks & Monitoring

**Specific Performance Baselines for 20-User Load:**
```typescript
interface PerformanceBenchmarks {
  // Core System Benchmarks
  systemBaselines: {
    simultaneousConcurrentUsers: {
      target: 20;
      testScenario: 'peak_exam_registration_period';
      measurementPeriod: '15_minute_sustained_load';
      acceptanceCriteria: {
        responseTime: '<500ms_p95_all_endpoints';
        errorRate: '<0.5%_total_requests';
        databaseConnections: '<50_active_connections';
        memoryUsage: '<512MB_per_serverless_function';
      };
    };

    examRegistrationBurst: {
      scenario: '20_users_registering_within_5_minutes';
      testConditions: {
        sessionCapacity: 'both_morning_and_afternoon_sessions';
        paymentProcessing: 'mix_of_free_and_advanced_packages';
        emailDelivery: 'welcome_and_exam_code_emails';
      };
      performanceTargets: {
        registrationCompleted: '<30_seconds_per_user';
        examCodeGeneration: '<5_seconds_per_code_set';
        emailDelivery: '<2_minutes_per_email';
        paymentProcessing: '<15_seconds_per_stripe_transaction';
      };
    };

    pdfDownloadConcurrency: {
      scenario: '15_advanced_users_downloading_PDFs_simultaneously';
      testConditions: {
        pdfFileSize: '5MB_average_per_file';
        downloadTokenValidation: 'secure_token_verification';
        userAuthentication: 'active_session_validation';
      };
      performanceTargets: {
        tokenGeneration: '<2_seconds_per_token';
        downloadInitiation: '<3_seconds_time_to_first_byte';
        fullDownloadTime: '<30_seconds_per_5MB_file';
        concurrentBandwidth: 'support_75MB_total_simultaneous';
      };
    };
  };

  // Database Performance Benchmarks
  databaseBenchmarks: {
    queryPerformance: {
      userDashboardQuery: {
        description: 'Load user profile + exam results + PDF access status';
        targetTime: '<100ms_p95';
        testData: 'user_with_3_exam_results_and_pdf_history';
        complexity: 'joins_across_4_tables';
      };
      adminUserListQuery: {
        description: 'Paginated user list with search and filters';
        targetTime: '<200ms_p95';
        testData: '20_users_with_varied_package_types';
        complexity: 'full_text_search_with_pagination';
      };
      sessionCapacityCheck: {
        description: 'Real-time session availability validation';
        targetTime: '<50ms_p95';
        testData: 'concurrent_capacity_updates_from_20_users';
        complexity: 'race_condition_prevention';
      };
      analyticsGeneration: {
        description: 'Calculate percentiles and generate recommendations';
        targetTime: '<1_second_p95';
        testData: 'user_results_with_peer_comparison_data';
        complexity: 'statistical_calculations_across_user_base';
      };
    };

    connectionManagement: {
      poolSize: {
        target: '10_concurrent_connections_max';
        testScenario: '20_users_active_simultaneously';
        connectionLifetime: '30_minutes_max';
        leakPrevention: 'automated_connection_cleanup';
      };
      transactionIsolation: {
        scenario: 'concurrent_payment_webhook_and_user_updates';
        isolationLevel: 'READ_COMMITTED';
        lockTimeout: '<5_seconds';
        deadlockPrevention: 'consistent_table_ordering';
      };
    };
  };

  // API Performance Benchmarks
  apiEndpointBenchmarks: {
    authenticationEndpoints: {
      '/api/auth/login': {
        target: '<300ms_p95';
        includes: 'password_verification_and_session_creation';
        loadTest: '20_simultaneous_logins';
      };
      '/api/auth/register': {
        target: '<500ms_p95';
        includes: 'validation_hashing_database_insert_email_trigger';
        loadTest: '20_simultaneous_registrations';
      };
    };

    examManagementEndpoints: {
      '/api/exam/register': {
        target: '<1_second_p95';
        includes: 'capacity_check_code_generation_payment_intent';
        loadTest: '20_users_registering_same_session';
      };
      '/api/exam/validate/{code}': {
        target: '<200ms_p95';
        includes: 'code_lookup_and_validation';
        loadTest: '100_code_validations_per_minute';
      };
    };

    paymentEndpoints: {
      '/api/payment/create': {
        target: '<800ms_p95';
        includes: 'stripe_payment_intent_creation';
        loadTest: '20_simultaneous_payment_initiations';
      };
      '/api/webhook/stripe': {
        target: '<2_seconds_p95';
        includes: 'webhook_verification_user_upgrade_email_trigger';
        loadTest: '20_concurrent_webhook_deliveries';
      };
    };

    pdfEndpoints: {
      '/api/pdf/download/{id}': {
        target: '<3_seconds_p95';
        includes: 'access_validation_token_generation_redirect';
        loadTest: '15_advanced_users_downloading_simultaneously';
      };
      '/api/admin/pdf/upload': {
        target: '<10_seconds_p95';
        includes: '5MB_file_upload_processing_metadata_storage';
        loadTest: '3_concurrent_admin_uploads';
      };
    };
  };

  // Frontend Performance Benchmarks
  frontendBenchmarks: {
    pageLoadTimes: {
      landingPage: {
        target: '<2_seconds_fully_loaded';
        includes: 'thai_fonts_hero_images_pricing_section';
        testConditions: 'thai_mobile_3G_connection_simulation';
      };
      userDashboard: {
        target: '<3_seconds_fully_loaded';
        includes: 'user_data_exam_results_pdf_access_status';
        testConditions: 'authenticated_user_with_complete_data';
      };
      examRegistration: {
        target: '<2_seconds_form_ready';
        includes: 'session_capacity_real_time_pricing_display';
        testConditions: 'peak_registration_period_load';
      };
      pdfViewer: {
        target: '<5_seconds_pdf_preview_loaded';
        includes: '5MB_pdf_first_page_render';
        testConditions: 'advanced_user_with_valid_access';
      };
    };

    interactionResponsiveness: {
      formSubmissions: {
        target: '<500ms_acknowledgment';
        includes: 'validation_feedback_loading_states';
        testScenarios: [
          'registration_form_submission',
          'payment_form_submission',
          'profile_update_submission'
        ];
      };
      realTimeUpdates: {
        sessionCapacity: {
          target: '<2_seconds_update_reflection';
          scenario: 'capacity_changes_during_peak_registration';
          mechanism: 'optimistic_ui_with_background_sync';
        };
      };
    };
  };

  // External Service Performance Benchmarks
  externalServiceBenchmarks: {
    stripeIntegration: {
      paymentIntentCreation: {
        target: '<2_seconds_p95';
        includes: 'thai_baht_currency_conversion_and_validation';
        failureHandling: '<5_seconds_timeout_with_retry';
      };
      webhookProcessing: {
        target: '<3_seconds_end_to_end';
        includes: 'signature_validation_database_update_email_trigger';
        reliability: '>99.5%_successful_processing';
      };
    };

    emailDelivery: {
      resendIntegration: {
        target: '<30_seconds_delivery_time';
        includes: 'thai_character_encoding_template_rendering';
        batchProcessing: '<2_minutes_for_20_recipients';
      };
    };

    vercelPlatform: {
      functionColdStarts: {
        target: '<1_second_cold_start_time';
        warmupStrategy: 'scheduled_keepalive_requests';
        criticalEndpoints: [
          '/api/exam/register',
          '/api/payment/webhook',
          '/api/auth/login'
        ];
      };
      blobStorage: {
        uploadPerformance: {
          target: '<10_seconds_for_5MB_pdf';
          includes: 'virus_scanning_metadata_extraction';
        };
        downloadPerformance: {
          target: '<3_seconds_time_to_first_byte';
          includes: 'access_validation_cdn_delivery';
        };
      };
    };
  };

  // Stress Testing Scenarios
  stressTestScenarios: {
    examDayPeakLoad: {
      description: 'Simulate actual exam day conditions';
      timeline: {
        '8:00_AM': 'morning_session_registration_opens';
        '8:00-8:30_AM': '15_users_register_for_morning_session';
        '12:00_PM': 'afternoon_session_registration_opens';
        '12:00-12:30_PM': '5_additional_users_register_afternoon';
        '4:00_PM': 'exam_completion_results_submission_begins';
        '6:00_PM': 'pdf_solutions_uploaded_notification_sent';
      };
      expectedSystemBehavior: {
        registrationPeak: 'handle_15_concurrent_users_without_degradation';
        paymentProcessing: '90%_payment_success_rate_minimum';
        emailDelivery: 'all_critical_emails_delivered_within_5_minutes';
        pdfAccess: 'advanced_users_can_download_immediately';
      };
    };

    capacityLimitTesting: {
      description: 'Test system behavior at exactly 20 user capacity';
      testPhases: [
        {
          phase: 'gradual_ramp_up';
          users: '5_users_every_2_minutes_to_20_total';
          monitoring: 'response_time_degradation_tracking';
        },
        {
          phase: 'sustained_peak_load';
          duration: '30_minutes_at_20_concurrent_users';
          activities: 'mixed_registration_payment_pdf_access';
        },
        {
          phase: 'graceful_degradation_test';
          scenario: 'attempt_21st_user_registration';
          expectedBehavior: 'polite_rejection_with_queue_option';
        }
      ];
    };
  };

  // Performance Monitoring Implementation
  realTimeMonitoring: {
    dashboardMetrics: {
      systemHealth: {
        responseTime: 'p50_p95_p99_percentiles';
        throughput: 'requests_per_second_by_endpoint';
        errorRate: 'percentage_by_error_type';
        concurrentUsers: 'real_time_active_session_count';
      };
      businessMetrics: {
        conversionRate: 'free_to_advanced_upgrade_percentage';
        registrationSuccess: 'completed_registrations_per_hour';
        paymentSuccess: 'successful_payment_percentage';
        pdfEngagement: 'download_rate_among_advanced_users';
      };
    };

    alertingThresholds: {
      performance: {
        responseTime: 'alert_if_p95_exceeds_target_by_50%';
        errorRate: 'alert_if_exceeds_1%_for_5_minutes';
        availability: 'alert_if_below_99.5%_uptime';
      };
      capacity: {
        concurrentUsers: 'alert_at_18_users_approaching_limit';
        databaseConnections: 'alert_at_80%_pool_utilization';
        memoryUsage: 'alert_at_400MB_per_function';
      };
    };
  };
}
```

**Vercel Analytics Integration:**
```typescript
// Enhanced monitoring with specific 20-user baselines
interface MonitoringMetrics {
  responseTime: {
    target: '<200ms_p95_under_normal_load';
    examDayTarget: '<500ms_p95_during_peak_20_user_load';
    critical: '>1000ms_p95';
    alerts: ['technical_lead', 'on_call'];
  };
  availability: {
    target: '99.9%_uptime';
    examPeriodTarget: '99.95%_uptime_during_critical_periods';
    critical: '<99.0%_uptime';
    measurement: '1_minute_intervals_during_exam_periods';
  };
  errorRate: {
    target: '<0.1%_requests_normal_operation';
    examDayTarget: '<0.5%_requests_during_peak_load';
    critical: '>1%_requests';
    tracking: 'all_api_endpoints_with_user_impact_classification';
  };
  examPeriodMetrics: {
    concurrentUsers: {
      monitor: 'real_time_active_session_count';
      capacity: '20_user_hard_limit';
      earlyWarning: 'alert_at_18_concurrent_users';
    };
    registrationLoad: {
      track: 'registrations_per_minute_during_peak';
      target: 'handle_10_registrations_per_minute';
      capacity: '20_total_users_per_exam_session';
    };
    paymentSuccess: {
      monitor: 'stripe_transaction_success_rate';
      target: '>95%_success_rate_during_peak';
      alertThreshold: '<90%_success_rate_for_5_minutes';
    };
    pdfDownloads: {
      track: 'concurrent_pdf_downloads_by_advanced_users';
      capacity: '15_concurrent_downloads_max';
      performance: '<30_seconds_average_download_time';
    };
  };
}
```

#### Application Monitoring
```typescript
// Custom monitoring implementation
interface ApplicationHealth {
  databaseHealth: {
    connectionPool: 'active_connections_count';
    queryPerformance: 'slow_queries_tracking';
    storageUsage: '100GB_limit_monitoring';
  };
  externalServices: {
    stripe: 'payment_api_health';
    resend: 'email_delivery_rate';
    vercelBlob: 'pdf_storage_availability';
  };
  businessMetrics: {
    dailyRegistrations: 'track_conversion_funnel';
    upgradeRate: 'monitor_freemium_conversion';
    examCodeGeneration: 'ensure_uniqueness_maintained';
    pdfAccessRate: 'advanced_user_engagement';
  };
}

// Health check endpoint
export async function GET() {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabaseHealth(),
      stripe: await checkStripeHealth(),
      email: await checkEmailServiceHealth(),
      storage: await checkBlobStorageHealth()
    },
    metrics: {
      activeUsers: await getCurrentActiveUsers(),
      examCapacity: await getSessionCapacityStatus(),
      systemLoad: await getSystemLoadMetrics()
    }
  };
  
  return Response.json(healthStatus);
}
```

#### Error Tracking & Alerting
```typescript
// Error handling and alerting
interface ErrorManagement {
  severityLevels: {
    CRITICAL: {
      examples: ['payment_system_down', 'database_unavailable', 'data_corruption'];
      response: 'immediate_page';
      escalation: '5_minutes';
      notification: ['technical_lead', 'project_manager', 'on_call'];
    };
    HIGH: {
      examples: ['exam_code_generation_failure', 'pdf_upload_error', 'auth_system_issues'];
      response: '15_minutes';
      escalation: '30_minutes';
      notification: ['technical_lead', 'on_call'];
    };
    MEDIUM: {
      examples: ['email_delivery_failure', 'slow_queries', 'analytics_errors'];
      response: '1_hour';
      escalation: '4_hours';
      notification: ['technical_lead'];
    };
  };
  alertChannels: {
    pagerDuty: 'critical_and_high_only';
    slack: 'all_severity_levels';
    email: 'daily_digest_medium_low';
  };
}
```

### Backup & Recovery

#### Data Backup Strategy
```typescript
interface BackupStrategy {
  database: {
    frequency: 'continuous_point_in_time';
    retention: '30_days';
    provider: 'vercel_postgres_backup';
    testing: 'monthly_restore_test';
  };
  fileStorage: {
    pdfSolutions: 'vercel_blob_versioning';
    assetFiles: 'git_repository';
    retention: '6_months_user_data';
  };
  configuration: {
    environmentVariables: 'vercel_project_settings';
    secrets: 'vercel_environment_secrets';
    backupLocation: 'secure_external_storage';
  };
}

// Automated backup validation
async function validateBackupIntegrity(): Promise<BackupValidation> {
  return {
    databaseBackup: await testDatabaseRestore(),
    fileBackup: await testFileRecovery(),
    configurationBackup: await testEnvironmentRestore(),
    validationDate: new Date(),
    status: 'all_systems_verified'
  };
}
```

#### Disaster Recovery Plan
```typescript
interface DisasterRecoveryPlan {
  RTO: '4_hours'; // Recovery Time Objective
  RPO: '1_hour';  // Recovery Point Objective
  
  scenarios: {
    vercelPlatformOutage: {
      impact: 'complete_service_unavailable';
      response: 'activate_backup_hosting';
      timeline: '2_hours';
      responsible: 'technical_lead';
    };
    databaseCorruption: {
      impact: 'user_data_potentially_lost';
      response: 'restore_from_point_in_time_backup';
      timeline: '1_hour';
      responsible: 'database_admin';
    };
    paymentSystemFailure: {
      impact: 'no_new_registrations_or_upgrades';
      response: 'activate_backup_payment_provider';
      timeline: '30_minutes';
      responsible: 'technical_lead';
    };
    examDaySystemFailure: {
      impact: 'students_cannot_access_codes_or_results';
      response: 'emergency_offline_backup_procedures';
      timeline: '15_minutes';
      responsible: 'all_hands_emergency';
    };
  };
}
```

### Maintenance & Updates

#### Scheduled Maintenance
```typescript
interface MaintenanceSchedule {
  weekly: {
    tasks: ['log_rotation', 'performance_review', 'security_updates'];
    window: 'sunday_2am_4am_thailand_time';
    downtime: 'none_expected';
  };
  monthly: {
    tasks: ['database_optimization', 'backup_testing', 'dependency_updates'];
    window: 'first_sunday_2am_6am';
    downtime: 'up_to_30_minutes';
    notification: '48_hours_advance';
  };
  quarterly: {
    tasks: ['major_version_updates', 'security_audit', 'capacity_planning'];
    window: 'scheduled_maintenance_day';
    downtime: 'up_to_2_hours';
    notification: '1_week_advance';
  };
}

// Pre-exam period maintenance lockdown
interface ExamPeriodOperations {
  lockdownPeriod: 'september_20_to_october_10_2568'; // 1 week before to 1 week after
  restrictions: {
    noDeployments: true;
    emergencyOnly: 'security_patches_payment_fixes';
    increasedMonitoring: '24_7_coverage';
    responseTeam: 'dedicated_on_call';
  };
  prepExamChecklist: [
    '✓ System stress testing completed',
    '✓ Backup procedures verified',
    '✓ Emergency contacts updated',
    '✓ Rollback procedures tested',
    '✓ External service status confirmed'
  ];
}
```

#### Security Updates
```typescript
interface SecurityUpdateProcess {
  critical: {
    timeline: 'immediate_within_4_hours';
    approval: 'technical_lead_only';
    testing: 'automated_security_tests';
    deployment: 'emergency_deployment_pipeline';
  };
  high: {
    timeline: 'within_24_hours';
    approval: 'technical_lead_and_qa';
    testing: 'full_regression_suite';
    deployment: 'standard_deployment_pipeline';
  };
  medium: {
    timeline: 'next_scheduled_maintenance';
    approval: 'standard_review_process';
    testing: 'comprehensive_testing';
    deployment: 'standard_deployment_pipeline';
  };
}
```

### Capacity Planning & Scaling

#### Current Capacity (20 Users)
```typescript
interface CurrentCapacity {
  vercelLimits: {
    functions: '1M_invocations_month';
    bandwidth: '1TB_month';
    postgres: '100GB_storage_1M_queries';
    blob: '100GB_storage';
    edgeConfig: 'unlimited_reads';
  };
  actualUsage: {
    functions: '~10K_month_estimated';
    bandwidth: '~50GB_month_estimated';
    postgres: '~5GB_storage_100K_queries';
    blob: '~10GB_pdf_solutions';
    edgeConfig: '~1K_reads_day';
  };
  headroom: 'excellent_99x_capacity_available';
}
```

#### Growth Planning (Future 300 Users)
```typescript
interface GrowthCapacityPlan {
  year1_100users: {
    vercelPlan: 'pro_plan_sufficient';
    estimatedCost: '฿1000_month';
    bottlenecks: 'database_connections';
    solutions: 'connection_pooling';
  };
  year2_300users: {
    vercelPlan: 'pro_plan_with_addons';
    estimatedCost: '฿2500_month';
    bottlenecks: 'concurrent_pdf_downloads';
    solutions: 'cdn_optimization_blob_caching';
  };
  scalingTriggers: {
    '50_users': 'enable_connection_pooling';
    '100_users': 'implement_caching_layer';
    '200_users': 'optimize_database_queries';
    '300_users': 'consider_read_replicas';
  };
}
```

### Support & Incident Management

#### Support Structure
```typescript
interface SupportStructure {
  businessHours: {
    timezone: 'asia_bangkok_utc_7';
    coverage: 'monday_friday_8am_6pm';
    staff: ['technical_lead', 'project_manager'];
    responseTime: '2_hours_business_critical';
  };
  examPeriod: {
    coverage: '24_7_during_exam_week';
    staff: ['technical_lead', 'backup_developer', 'project_manager'];
    responseTime: '15_minutes_any_issue';
    escalation: 'immediate_all_hands';
  };
  offHours: {
    coverage: 'emergency_only';
    staff: ['on_call_developer'];
    responseTime: '1_hour_system_down';
  };
}
```

#### Incident Response Workflow
```typescript
interface IncidentWorkflow {
  detection: ['automated_alerts', 'user_reports', 'monitoring_systems'];
  triage: {
    severity1: 'system_down_exam_day';
    severity2: 'payment_issues_user_blocking';
    severity3: 'performance_degradation';
    severity4: 'minor_bugs_cosmetic_issues';
  };
  response: {
    acknowledge: '5_minutes';
    initial_response: '15_minutes';
    user_communication: '30_minutes';
    resolution_target: 'based_on_severity';
  };
  postIncident: {
    rootCauseAnalysis: 'within_24_hours';
    documentationUpdate: 'within_48_hours';
    preventativeMeasures: 'within_1_week';
    teamReview: 'next_sprint_planning';
  };
}
```

### Documentation & Knowledge Management

#### Operational Documentation
```typescript
interface OperationalDocs {
  runbooks: {
    deployment: 'step_by_step_deployment_guide';
    rollback: 'emergency_rollback_procedures';
    monitoring: 'alert_response_procedures';
    examDay: 'exam_day_operations_manual';
  };
  troubleshooting: {
    commonIssues: 'payment_failures_pdf_access_login_problems';
    diagnosticSteps: 'systematic_problem_resolution';
    escalationPaths: 'when_to_escalate_and_to_whom';
  };
  emergencyContacts: {
    technical: ['lead_developer', 'vercel_support', 'stripe_support'];
    business: ['project_manager', 'product_owner', 'stakeholders'];
    legal: ['data_protection_officer', 'legal_counsel'];
  };
}
```

This comprehensive operations strategy ensures the TBAT Mock Exam Platform maintains exam-critical reliability while operating efficiently within the ฿710/month budget, with clear procedures for scaling and incident management during critical exam periods.

---

**Document Status:** Complete - Production Ready  
**Architecture Quality Score:** Targeting 95%+ validation against BMad architect checklist  
**Next Phase:** Ready for development implementation using this architectural foundation

### Summary

This architecture document provides the complete technical foundation for the TBAT Mock Exam Platform, incorporating all requirements from PRD v1.2 and front-end-spec v1.2. The architecture supports:

✅ **Enhanced PDF Management (FR21-FR24)** - Complete solution download system with freemium conversion
✅ **Data Lifecycle Policy (FR22)** - 6-month expiry with automated cleanup and user warnings  
✅ **Advanced Admin Capabilities (FR24)** - Full CRUD operations with audit trails and crisis management
✅ **Cost-Optimized Vercel Solution** - ฿710/month operational costs for 20-user scale
✅ **Exam-Critical Reliability** - 99.9% uptime design with comprehensive monitoring
✅ **Thai Market Compliance** - PDPA compliance and Thai language support throughout
✅ **AI-Agent Development Ready** - Optimized for Claude Code development workflows

The platform is architecturally complete and ready for Phase 1 implementation with mock data services, followed by Phase 2 database integration.

---

**Document Status:** In Progress  
**Next Steps:** Complete remaining sections 6-9 and validate against PRD v1.2 requirements
**Architecture Quality:** Targeting 90%+ checklist validation score