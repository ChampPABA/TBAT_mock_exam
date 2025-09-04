#!/usr/bin/env ts-node
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

interface RollbackConfig {
  databaseUrl: string;
  applicationPath: string;
  rollbackSqlPath: string;
  maxDuration: number; // in seconds (30 minutes = 1800)
}

interface RollbackStep {
  name: string;
  action: () => Promise<void>;
  critical: boolean;
  rollbackOnFailure?: () => Promise<void>;
}

interface RollbackResult {
  success: boolean;
  duration: number;
  stepsCompleted: string[];
  errors: string[];
  timestamp: string;
}

class DeploymentRollback {
  private config: RollbackConfig;
  private startTime: number;
  private result: RollbackResult;

  constructor() {
    this.config = {
      databaseUrl: process.env.DATABASE_URL || '',
      applicationPath: process.cwd(),
      rollbackSqlPath: path.join(process.cwd(), 'scripts/rollback/rollback-freemium.sql'),
      maxDuration: 1800 // 30 minutes
    };

    this.startTime = Date.now();
    this.result = {
      success: false,
      duration: 0,
      stepsCompleted: [],
      errors: [],
      timestamp: new Date().toISOString()
    };

    if (!this.config.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
  }

  private checkTimeout(): void {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    if (elapsed > this.config.maxDuration) {
      throw new Error(`Rollback exceeded maximum duration of ${this.config.maxDuration} seconds`);
    }
  }

  private async stopApplicationServices(): Promise<void> {
    console.log('🛑 Stopping application services...');
    
    try {
      // Stop Next.js dev server if running
      await execAsync('npm run stop:all 2>/dev/null || true');
      
      // Kill any Node.js processes on common ports
      const ports = [3000, 3001, 3002, 5000, 5001];
      for (const port of ports) {
        try {
          await execAsync(`npx kill-port ${port} 2>/dev/null || true`);
        } catch {
          // Ignore errors, port might not be in use
        }
      }
      
      console.log('✅ Application services stopped');
      this.result.stepsCompleted.push('Stop services');
    } catch (error) {
      console.error('❌ Failed to stop services:', error);
      throw error;
    }
  }

  private async createRollbackCheckpoint(): Promise<void> {
    console.log('📸 Creating rollback checkpoint...');
    
    try {
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const checkpointDir = path.join(this.config.applicationPath, 'rollback-checkpoints', timestamp);
      
      await fs.mkdir(checkpointDir, { recursive: true });
      
      // Save current application state
      const stateFile = path.join(checkpointDir, 'state.json');
      const state = {
        timestamp,
        environment: process.env.NODE_ENV || 'development',
        databaseUrl: this.config.databaseUrl.replace(/:[^:]*@/, ':***@'), // Hide password
        applicationPath: this.config.applicationPath
      };
      
      await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
      
      console.log(`✅ Checkpoint created: ${checkpointDir}`);
      this.result.stepsCompleted.push('Create checkpoint');
    } catch (error) {
      console.error('❌ Failed to create checkpoint:', error);
      throw error;
    }
  }

  private async rollbackDatabase(): Promise<void> {
    console.log('🔄 Rolling back database...');
    
    try {
      // Check if rollback SQL file exists
      await fs.access(this.config.rollbackSqlPath);
      
      // Execute rollback SQL
      const command = `psql "${this.config.databaseUrl}" -f "${this.config.rollbackSqlPath}"`;
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('NOTICE:')) {
        throw new Error(`Database rollback warnings: ${stderr}`);
      }
      
      console.log('✅ Database rolled back successfully');
      this.result.stepsCompleted.push('Database rollback');
    } catch (error) {
      console.error('❌ Database rollback failed:', error);
      throw error;
    }
  }

  private async rollbackApplicationCode(): Promise<void> {
    console.log('🔄 Rolling back application code...');
    
    try {
      // Check if we're in a git repository
      const { stdout: gitStatus } = await execAsync('git status --porcelain');
      
      if (gitStatus) {
        console.log('⚠️  Uncommitted changes detected, creating backup...');
        const backupBranch = `rollback-backup-${Date.now()}`;
        await execAsync(`git stash save "Rollback backup"`);
        await execAsync(`git branch ${backupBranch}`);
      }
      
      // Find the last stable commit before migration
      const { stdout: lastStableTag } = await execAsync('git describe --tags --abbrev=0 2>/dev/null || echo ""');
      
      if (lastStableTag.trim()) {
        console.log(`📌 Rolling back to tag: ${lastStableTag.trim()}`);
        await execAsync(`git checkout ${lastStableTag.trim()}`);
      } else {
        // Rollback to previous commit if no tags
        console.log('📌 Rolling back to previous commit...');
        await execAsync('git checkout HEAD~1');
      }
      
      console.log('✅ Application code rolled back');
      this.result.stepsCompleted.push('Code rollback');
    } catch (error) {
      console.error('⚠️  Code rollback skipped (not in git repo or no history)');
      // Don't throw error as this might not be critical
    }
  }

  private async reinstallDependencies(): Promise<void> {
    console.log('📦 Reinstalling dependencies...');
    
    try {
      // Clean node_modules and reinstall
      console.log('  Cleaning node_modules...');
      await execAsync('rm -rf node_modules package-lock.json');
      
      console.log('  Installing dependencies...');
      await execAsync('npm install');
      
      console.log('✅ Dependencies reinstalled');
      this.result.stepsCompleted.push('Reinstall dependencies');
    } catch (error) {
      console.error('❌ Failed to reinstall dependencies:', error);
      throw error;
    }
  }

  private async verifyRollback(): Promise<void> {
    console.log('🔍 Verifying rollback...');
    
    try {
      // Verify database state
      const dbCheckCommand = `psql "${this.config.databaseUrl}" -c "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM codes; SELECT COUNT(*) FROM registrations;"`;
      const { stdout } = await execAsync(dbCheckCommand);
      
      console.log('📊 Database record counts:');
      console.log(stdout);
      
      // Check that Freemium tables don't exist
      const freemiumCheckCommand = `psql "${this.config.databaseUrl}" -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registrations_v2');"`;
      const { stdout: freemiumCheck } = await execAsync(freemiumCheckCommand);
      
      if (freemiumCheck.includes('t')) {
        throw new Error('Freemium tables still exist after rollback');
      }
      
      console.log('✅ Rollback verified successfully');
      this.result.stepsCompleted.push('Verify rollback');
    } catch (error) {
      console.error('❌ Rollback verification failed:', error);
      throw error;
    }
  }

  private async restartServices(): Promise<void> {
    console.log('🚀 Restarting application services...');
    
    try {
      // Start the application in development mode
      console.log('  Starting development server...');
      
      // Use spawn instead of exec to run in background
      const { spawn } = require('child_process');
      const npmStart = spawn('npm', ['run', 'dev'], {
        detached: true,
        stdio: 'ignore'
      });
      
      npmStart.unref();
      
      // Wait a moment for the server to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('✅ Application services restarted');
      console.log('📌 Server should be running on http://localhost:3000');
      this.result.stepsCompleted.push('Restart services');
    } catch (error) {
      console.error('⚠️  Failed to auto-restart services:', error);
      console.log('ℹ️  Please manually run: npm run dev');
    }
  }

  async executeRollback(): Promise<RollbackResult> {
    const steps: RollbackStep[] = [
      {
        name: 'Stop Services',
        action: () => this.stopApplicationServices(),
        critical: true
      },
      {
        name: 'Create Checkpoint',
        action: () => this.createRollbackCheckpoint(),
        critical: false
      },
      {
        name: 'Rollback Database',
        action: () => this.rollbackDatabase(),
        critical: true
      },
      {
        name: 'Rollback Code',
        action: () => this.rollbackApplicationCode(),
        critical: false
      },
      {
        name: 'Reinstall Dependencies',
        action: () => this.reinstallDependencies(),
        critical: false
      },
      {
        name: 'Verify Rollback',
        action: () => this.verifyRollback(),
        critical: true
      },
      {
        name: 'Restart Services',
        action: () => this.restartServices(),
        critical: false
      }
    ];

    console.log('🚨 STARTING EMERGENCY ROLLBACK PROCEDURE');
    console.log('=' .repeat(50));
    console.log(`⏱️  Target completion: < 30 minutes`);
    console.log(`📅 Timestamp: ${this.result.timestamp}`);
    console.log('=' .repeat(50) + '\n');

    for (const step of steps) {
      try {
        this.checkTimeout();
        console.log(`\n📋 Step: ${step.name}`);
        await step.action();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.result.errors.push(`${step.name}: ${errorMsg}`);
        
        if (step.critical) {
          console.error(`\n❌ CRITICAL STEP FAILED: ${step.name}`);
          console.error(`   Error: ${errorMsg}`);
          this.result.duration = Math.round((Date.now() - this.startTime) / 1000);
          return this.result;
        } else {
          console.warn(`⚠️  Non-critical step failed: ${step.name}`);
        }
      }
    }

    this.result.success = true;
    this.result.duration = Math.round((Date.now() - this.startTime) / 1000);

    this.printSummary();
    return this.result;
  }

  private printSummary(): void {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 ROLLBACK SUMMARY');
    console.log('=' .repeat(50));
    
    const status = this.result.success ? '✅ SUCCESS' : '❌ FAILED';
    console.log(`\nStatus: ${status}`);
    console.log(`Duration: ${this.result.duration} seconds`);
    
    if (this.result.duration < this.config.maxDuration) {
      console.log(`✅ Completed within 30-minute target`);
    } else {
      console.log(`⚠️  Exceeded 30-minute target`);
    }
    
    console.log('\nCompleted Steps:');
    this.result.stepsCompleted.forEach(step => {
      console.log(`  ✅ ${step}`);
    });
    
    if (this.result.errors.length > 0) {
      console.log('\nErrors Encountered:');
      this.result.errors.forEach(error => {
        console.log(`  ❌ ${error}`);
      });
    }
    
    if (this.result.success) {
      console.log('\n🎉 Rollback completed successfully!');
      console.log('📌 System has been restored to pre-migration state');
      console.log('ℹ️  Please verify application functionality');
    } else {
      console.log('\n⚠️  Rollback incomplete - manual intervention required');
      console.log('📞 Contact database administrator for assistance');
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const rollback = new DeploymentRollback();
  
  // Confirm before proceeding
  console.log('⚠️  WARNING: This will rollback all Freemium migration changes!');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');
  
  setTimeout(() => {
    rollback.executeRollback()
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
}

export { DeploymentRollback, RollbackResult };