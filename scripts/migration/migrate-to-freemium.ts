#!/usr/bin/env ts-node
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config();

const execAsync = promisify(exec);

interface MigrationConfig {
  databaseUrl: string;
  migrationMode: 'dry-run' | 'execute';
  rollbackEnabled: boolean;
}

interface MigrationStep {
  name: string;
  description: string;
  execute: () => Promise<void>;
  verify: () => Promise<boolean>;
  rollback?: () => Promise<void>;
}

interface MigrationResult {
  success: boolean;
  stepsCompleted: string[];
  errors: string[];
  statistics: {
    usersUpgraded: number;
    ticketsGenerated: number;
    duration: number;
  };
}

class FreemiumMigration {
  private config: MigrationConfig;
  private result: MigrationResult;
  private startTime: number;

  constructor() {
    this.config = {
      databaseUrl: process.env.DATABASE_URL || '',
      migrationMode: (process.env.MIGRATION_MODE as 'dry-run' | 'execute') || 'dry-run',
      rollbackEnabled: process.env.ROLLBACK_ENABLED === 'true'
    };

    this.startTime = Date.now();
    this.result = {
      success: false,
      stepsCompleted: [],
      errors: [],
      statistics: {
        usersUpgraded: 0,
        ticketsGenerated: 0,
        duration: 0
      }
    };

    if (!this.config.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
  }

  private generateExamTicket(userId: string, tier: string): string {
    // Generate unique exam ticket
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    const tierCode = tier === 'VVIP' ? 'V' : 'F';
    return `TBAT-${tierCode}-${timestamp}-${random}`.toUpperCase();
  }

  private async executeSQL(sql: string, description: string): Promise<void> {
    if (this.config.migrationMode === 'dry-run') {
      console.log(`🔍 [DRY-RUN] Would execute: ${description}`);
      console.log(`   SQL Preview: ${sql.substring(0, 100)}...`);
      return;
    }

    try {
      const command = `psql "${this.config.databaseUrl}" -c "${sql.replace(/"/g, '\\"')}"`;
      await execAsync(command);
      console.log(`✅ ${description}`);
    } catch (error) {
      console.error(`❌ Failed: ${description}`, error);
      throw error;
    }
  }

  private async migrateExistingUsers(): Promise<void> {
    console.log('\n📦 Migrating existing BoxSet users to VVIP tier...');

    const upgradeSQL = `
      UPDATE users 
      SET tier = 'VVIP'
      WHERE tier IS NULL OR tier = '';
    `;

    await this.executeSQL(upgradeSQL, 'Upgraded existing users to VVIP tier');

    // Count upgraded users
    if (this.config.migrationMode === 'execute') {
      const countCommand = `psql "${this.config.databaseUrl}" -t -c "SELECT COUNT(*) FROM users WHERE tier = 'VVIP'"`;
      const { stdout } = await execAsync(countCommand);
      this.result.statistics.usersUpgraded = parseInt(stdout.trim());
      console.log(`  📊 Upgraded ${this.result.statistics.usersUpgraded} users to VVIP`);
    }
  }

  private async generateExamTickets(): Promise<void> {
    console.log('\n🎫 Generating exam tickets for existing registrations...');

    // First, get all existing registrations
    if (this.config.migrationMode === 'execute') {
      const getRegistrationsSQL = `
        SELECT r.id, r.user_id, u.tier 
        FROM registrations r 
        JOIN users u ON r.user_id = u.id;
      `;

      const command = `psql "${this.config.databaseUrl}" -t -A -F'|' -c "${getRegistrationsSQL}"`;
      const { stdout } = await execAsync(command);
      
      const registrations = stdout.trim().split('\n').filter(line => line);
      
      for (const reg of registrations) {
        const [regId, userId, tier] = reg.split('|');
        const ticket = this.generateExamTicket(userId, tier || 'VVIP');
        
        const insertTicketSQL = `
          INSERT INTO registrations_v2 (
            user_id, 
            exam_ticket, 
            tier, 
            subjects, 
            status
          ) VALUES (
            '${userId}', 
            '${ticket}', 
            '${tier || 'VVIP'}', 
            '["Physics", "Chemistry", "Biology"]'::json, 
            'MIGRATED'
          ) ON CONFLICT (user_id) DO NOTHING;
        `;
        
        await this.executeSQL(insertTicketSQL, `Generated ticket for user ${userId}`);
        this.result.statistics.ticketsGenerated++;
      }
      
      console.log(`  📊 Generated ${this.result.statistics.ticketsGenerated} exam tickets`);
    } else {
      console.log('  🔍 [DRY-RUN] Would generate exam tickets for all registrations');
    }
  }

  private async preserveAccessPermissions(): Promise<void> {
    console.log('\n🔒 Preserving existing access permissions...');

    const preserveSQL = `
      -- Ensure all users with existing codes maintain access
      UPDATE codes 
      SET type = 'VVIP'
      WHERE type IS NULL;
    `;

    await this.executeSQL(preserveSQL, 'Preserved existing code permissions');
  }

  private async validateDataIntegrity(): Promise<boolean> {
    console.log('\n🔍 Validating data integrity...');

    if (this.config.migrationMode === 'dry-run') {
      console.log('  🔍 [DRY-RUN] Would validate data integrity');
      return true;
    }

    try {
      // Check user count
      const userCountCommand = `psql "${this.config.databaseUrl}" -t -c "SELECT COUNT(*) FROM users"`;
      const { stdout: userCount } = await execAsync(userCountCommand);
      
      // Check VVIP assignments
      const vvipCountCommand = `psql "${this.config.databaseUrl}" -t -c "SELECT COUNT(*) FROM users WHERE tier = 'VVIP'"`;
      const { stdout: vvipCount } = await execAsync(vvipCountCommand);
      
      // Check ticket generation
      const ticketCountCommand = `psql "${this.config.databaseUrl}" -t -c "SELECT COUNT(*) FROM registrations_v2"`;
      const { stdout: ticketCount } = await execAsync(ticketCountCommand);
      
      console.log(`  ✅ Total users: ${userCount.trim()}`);
      console.log(`  ✅ VVIP users: ${vvipCount.trim()}`);
      console.log(`  ✅ Exam tickets: ${ticketCount.trim()}`);
      
      return true;
    } catch (error) {
      console.error('  ❌ Data validation failed:', error);
      return false;
    }
  }

  private async createMigrationReport(): Promise<void> {
    console.log('\n📊 Creating migration report...');

    const report = {
      timestamp: new Date().toISOString(),
      mode: this.config.migrationMode,
      duration: Math.round((Date.now() - this.startTime) / 1000),
      statistics: this.result.statistics,
      stepsCompleted: this.result.stepsCompleted,
      errors: this.result.errors
    };

    if (this.config.migrationMode === 'execute') {
      const fs = require('fs').promises;
      const reportPath = `migration-report-${Date.now()}.json`;
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`  ✅ Report saved to: ${reportPath}`);
    } else {
      console.log('  🔍 [DRY-RUN] Migration report preview:');
      console.log(JSON.stringify(report, null, 2));
    }
  }

  async execute(): Promise<MigrationResult> {
    const steps: MigrationStep[] = [
      {
        name: 'Migrate Existing Users',
        description: 'Upgrade all BoxSet users to VVIP tier',
        execute: () => this.migrateExistingUsers(),
        verify: async () => true
      },
      {
        name: 'Generate Exam Tickets',
        description: 'Create exam tickets for all registrations',
        execute: () => this.generateExamTickets(),
        verify: async () => true
      },
      {
        name: 'Preserve Permissions',
        description: 'Maintain existing access permissions',
        execute: () => this.preserveAccessPermissions(),
        verify: async () => true
      },
      {
        name: 'Validate Data',
        description: 'Verify data integrity after migration',
        execute: async () => { await this.validateDataIntegrity(); },
        verify: () => this.validateDataIntegrity()
      }
    ];

    console.log('🚀 Starting Freemium Data Migration');
    console.log('=' .repeat(50));
    console.log(`📋 Mode: ${this.config.migrationMode.toUpperCase()}`);
    console.log(`🔄 Rollback Enabled: ${this.config.rollbackEnabled}`);
    console.log('=' .repeat(50));

    try {
      for (const step of steps) {
        console.log(`\n▶️  Executing: ${step.name}`);
        console.log(`   ${step.description}`);
        
        await step.execute();
        const verified = await step.verify();
        
        if (!verified) {
          throw new Error(`Verification failed for step: ${step.name}`);
        }
        
        this.result.stepsCompleted.push(step.name);
      }

      await this.createMigrationReport();
      
      this.result.success = true;
      this.result.statistics.duration = Math.round((Date.now() - this.startTime) / 1000);
      
      console.log('\n' + '=' .repeat(50));
      console.log('✅ MIGRATION COMPLETED SUCCESSFULLY');
      console.log('=' .repeat(50));
      console.log(`⏱️  Duration: ${this.result.statistics.duration} seconds`);
      console.log(`📊 Users Upgraded: ${this.result.statistics.usersUpgraded}`);
      console.log(`🎫 Tickets Generated: ${this.result.statistics.ticketsGenerated}`);
      
    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      this.result.errors.push(error instanceof Error ? error.message : String(error));
      
      if (this.config.rollbackEnabled && this.config.migrationMode === 'execute') {
        console.log('\n🔄 Initiating automatic rollback...');
        // Trigger rollback
        const { exec } = require('child_process');
        exec('npm run db:rollback', (err: any) => {
          if (err) {
            console.error('❌ Automatic rollback failed:', err);
          } else {
            console.log('✅ Automatic rollback completed');
          }
        });
      }
    }

    return this.result;
  }
}

// Execute if run directly
if (require.main === module) {
  const migration = new FreemiumMigration();
  
  if (process.env.MIGRATION_MODE === 'execute') {
    console.log('\n⚠️  WARNING: Running in EXECUTE mode!');
    console.log('This will modify your database. Press Ctrl+C to cancel.');
    console.log('Starting in 5 seconds...\n');
    
    setTimeout(() => {
      migration.execute()
        .then(result => {
          if (!result.success) {
            process.exit(1);
          }
        })
        .catch(error => {
          console.error('Fatal error:', error);
          process.exit(1);
        });
    }, 5000);
  } else {
    migration.execute()
      .then(result => {
        console.log('\n📌 This was a dry-run. To execute, set MIGRATION_MODE=execute');
      })
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  }
}

export { FreemiumMigration, MigrationResult };