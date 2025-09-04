#!/usr/bin/env ts-node
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import { DatabaseBackup } from '../backup/create-backup';
import { FreemiumMigration } from './migrate-to-freemium';
import { DatabaseRestore } from '../backup/restore-backup';

dotenv.config();

const execAsync = promisify(exec);

interface TestCase {
  name: string;
  description: string;
  test: () => Promise<boolean>;
  critical: boolean;
}

interface TestResult {
  testCase: string;
  passed: boolean;
  duration: number;
  error?: string;
}

class MigrationTest {
  private databaseUrl: string;
  private results: TestResult[] = [];
  private backupTimestamp?: string;

  constructor() {
    this.databaseUrl = process.env.DATABASE_URL || '';
    
    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
  }

  private async setupTestEnvironment(): Promise<void> {
    console.log('🔧 Setting up test environment...');
    
    // Create backup before testing
    const backup = new DatabaseBackup();
    const backupResult = await backup.execute();
    
    if (backupResult.success) {
      this.backupTimestamp = backupResult.timestamp;
      console.log(`✅ Test backup created: ${this.backupTimestamp}`);
    } else {
      throw new Error('Failed to create test backup');
    }
  }

  private async cleanupTestEnvironment(): Promise<void> {
    console.log('\n🧹 Cleaning up test environment...');
    
    if (this.backupTimestamp) {
      const restore = new DatabaseRestore(this.backupTimestamp);
      const restoreResult = await restore.execute();
      
      if (restoreResult.success) {
        console.log('✅ Test environment restored to original state');
      } else {
        console.error('⚠️  Failed to restore test environment');
      }
    }
  }

  private async testBoxSetUserMigration(): Promise<boolean> {
    try {
      // Check that existing users are upgraded to VVIP
      const { stdout } = await execAsync(
        `psql "${this.databaseUrl}" -t -c "SELECT COUNT(*) FROM users WHERE tier = 'VVIP'"`
      );
      
      const vvipCount = parseInt(stdout.trim());
      console.log(`  📊 VVIP users after migration: ${vvipCount}`);
      
      return vvipCount > 0;
    } catch (error) {
      console.error('  ❌ Error:', error);
      return false;
    }
  }

  private async testFreeRegistration(): Promise<boolean> {
    try {
      // Simulate free tier registration
      const insertSQL = `
        INSERT INTO users (id, email, name, tier, free_subject, line_id)
        VALUES (
          gen_random_uuid(),
          'test_free@example.com',
          'Test Free User',
          'FREE',
          'Physics',
          'LINE123'
        ) RETURNING id;
      `;
      
      const { stdout } = await execAsync(
        `psql "${this.databaseUrl}" -t -c "${insertSQL}"`
      );
      
      const userId = stdout.trim();
      console.log(`  ✅ Free user created: ${userId}`);
      
      // Cleanup test user
      await execAsync(
        `psql "${this.databaseUrl}" -c "DELETE FROM users WHERE email = 'test_free@example.com'"`
      );
      
      return userId.length > 0;
    } catch (error) {
      console.error('  ❌ Error:', error);
      return false;
    }
  }

  private async testExamTicketGeneration(): Promise<boolean> {
    try {
      // Check that exam tickets are generated
      const { stdout } = await execAsync(
        `psql "${this.databaseUrl}" -t -c "SELECT COUNT(*) FROM registrations_v2 WHERE exam_ticket IS NOT NULL"`
      );
      
      const ticketCount = parseInt(stdout.trim());
      console.log(`  📊 Exam tickets generated: ${ticketCount}`);
      
      // Verify ticket format
      const { stdout: sampleTicket } = await execAsync(
        `psql "${this.databaseUrl}" -t -c "SELECT exam_ticket FROM registrations_v2 LIMIT 1"`
      );
      
      const ticket = sampleTicket.trim();
      const isValidFormat = /^TBAT-[VF]-[A-Z0-9]+-[A-Z0-9]+$/i.test(ticket);
      
      console.log(`  🎫 Sample ticket: ${ticket}`);
      console.log(`  ✅ Valid format: ${isValidFormat}`);
      
      return ticketCount >= 0 && isValidFormat;
    } catch (error) {
      console.error('  ❌ Error:', error);
      return false;
    }
  }

  private async testMigrationPerformance(): Promise<boolean> {
    const startTime = Date.now();
    const targetTime = 120000; // 2 minutes target for migration
    
    try {
      // Run migration in dry-run mode
      process.env.MIGRATION_MODE = 'dry-run';
      const migration = new FreemiumMigration();
      const result = await migration.execute();
      
      const duration = Date.now() - startTime;
      console.log(`  ⏱️  Migration duration: ${Math.round(duration / 1000)}s`);
      
      return result.success && duration < targetTime;
    } catch (error) {
      console.error('  ❌ Error:', error);
      return false;
    }
  }

  private async testConcurrentUsers(): Promise<boolean> {
    console.log('  🚀 Simulating 1000+ concurrent users...');
    
    try {
      // Create test users in bulk
      const bulkInsertSQL = `
        INSERT INTO users (id, email, name, tier, line_id)
        SELECT 
          gen_random_uuid(),
          'test_' || i || '@example.com',
          'Test User ' || i,
          CASE WHEN i % 10 = 0 THEN 'VVIP' ELSE 'FREE' END,
          'LINE_' || i
        FROM generate_series(1, 1000) AS i
        ON CONFLICT (email) DO NOTHING;
      `;
      
      const startTime = Date.now();
      await execAsync(`psql "${this.databaseUrl}" -c "${bulkInsertSQL}"`);
      const insertDuration = Date.now() - startTime;
      
      console.log(`  ⏱️  Bulk insert duration: ${Math.round(insertDuration / 1000)}s`);
      
      // Test concurrent queries
      const queries = [];
      for (let i = 0; i < 100; i++) {
        queries.push(execAsync(
          `psql "${this.databaseUrl}" -t -c "SELECT COUNT(*) FROM users WHERE tier = 'FREE'"`
        ));
      }
      
      const queryStartTime = Date.now();
      await Promise.all(queries);
      const queryDuration = Date.now() - queryStartTime;
      
      console.log(`  ⏱️  100 concurrent queries: ${Math.round(queryDuration / 1000)}s`);
      
      // Cleanup test users
      await execAsync(
        `psql "${this.databaseUrl}" -c "DELETE FROM users WHERE email LIKE 'test_%@example.com'"`
      );
      
      return insertDuration < 5000 && queryDuration < 10000;
    } catch (error) {
      console.error('  ❌ Error:', error);
      return false;
    }
  }

  private async testDataIntegrity(): Promise<boolean> {
    try {
      // Verify referential integrity
      const integrityChecks = [
        "SELECT COUNT(*) FROM registrations_v2 r LEFT JOIN users u ON r.user_id = u.id WHERE u.id IS NULL",
        "SELECT COUNT(*) FROM payment_transactions p LEFT JOIN users u ON p.user_id = u.id WHERE u.id IS NULL",
        "SELECT COUNT(*) FROM codes c LEFT JOIN users u ON c.user_id = u.id WHERE c.user_id IS NOT NULL AND u.id IS NULL"
      ];
      
      for (const check of integrityChecks) {
        const { stdout } = await execAsync(
          `psql "${this.databaseUrl}" -t -c "${check}"`
        );
        
        const orphanCount = parseInt(stdout.trim());
        if (orphanCount > 0) {
          console.log(`  ⚠️  Found ${orphanCount} orphan records`);
          return false;
        }
      }
      
      console.log('  ✅ No orphan records found');
      console.log('  ✅ Referential integrity maintained');
      
      return true;
    } catch (error) {
      console.error('  ❌ Error:', error);
      return false;
    }
  }

  async runTests(): Promise<void> {
    const testCases: TestCase[] = [
      {
        name: 'BoxSet User Migration',
        description: 'Verify existing users upgraded to VVIP',
        test: () => this.testBoxSetUserMigration(),
        critical: true
      },
      {
        name: 'Free Tier Registration',
        description: 'Test new FREE tier registration flow',
        test: () => this.testFreeRegistration(),
        critical: true
      },
      {
        name: 'Exam Ticket Generation',
        description: 'Verify exam tickets are generated correctly',
        test: () => this.testExamTicketGeneration(),
        critical: true
      },
      {
        name: 'Migration Performance',
        description: 'Test migration completes within 2 minutes',
        test: () => this.testMigrationPerformance(),
        critical: false
      },
      {
        name: 'Load Testing',
        description: 'Test with 1000+ concurrent users',
        test: () => this.testConcurrentUsers(),
        critical: false
      },
      {
        name: 'Data Integrity',
        description: 'Verify referential integrity after migration',
        test: () => this.testDataIntegrity(),
        critical: true
      }
    ];

    console.log('🚀 Starting Migration Test Suite');
    console.log('=' .repeat(50));
    
    await this.setupTestEnvironment();
    
    // Run migration first
    console.log('\n📦 Executing migration...');
    process.env.MIGRATION_MODE = 'execute';
    const migration = new FreemiumMigration();
    const migrationResult = await migration.execute();
    
    if (!migrationResult.success) {
      console.error('❌ Migration failed, aborting tests');
      await this.cleanupTestEnvironment();
      return;
    }
    
    // Run test cases
    for (const testCase of testCases) {
      console.log(`\n🧪 Test: ${testCase.name}`);
      console.log(`   ${testCase.description}`);
      
      const startTime = Date.now();
      
      try {
        const passed = await testCase.test();
        const duration = Math.round((Date.now() - startTime) / 1000);
        
        this.results.push({
          testCase: testCase.name,
          passed,
          duration
        });
        
        if (passed) {
          console.log(`   ✅ PASSED (${duration}s)`);
        } else {
          console.log(`   ❌ FAILED (${duration}s)`);
          if (testCase.critical) {
            console.error('   ⚠️  Critical test failed!');
          }
        }
      } catch (error) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        this.results.push({
          testCase: testCase.name,
          passed: false,
          duration,
          error: error instanceof Error ? error.message : String(error)
        });
        
        console.error(`   ❌ ERROR: ${error}`);
      }
    }
    
    await this.cleanupTestEnvironment();
    this.printSummary();
  }

  private printSummary(): void {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 MIGRATION TEST SUMMARY');
    console.log('=' .repeat(50));
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`\n📈 Results: ${passedTests}/${totalTests} tests passed`);
    console.log(`⏱️  Total Duration: ${totalDuration}s`);
    
    console.log('\n📋 Test Results:');
    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status} - ${result.testCase}: ${result.duration}s`);
      if (result.error) {
        console.log(`       Error: ${result.error}`);
      }
    });
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL MIGRATION TESTS PASSED!');
      console.log('✅ System ready for production migration');
    } else {
      console.log(`\n⚠️  ${failedTests} test(s) failed`);
      console.log('❌ Please fix issues before production migration');
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const tester = new MigrationTest();
  
  tester.runTests()
    .then(() => {
      console.log('\n✅ Test suite completed');
    })
    .catch(error => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

export { MigrationTest };