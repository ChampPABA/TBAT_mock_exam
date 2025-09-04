#!/usr/bin/env ts-node
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createHash } from 'crypto';

dotenv.config();

const execAsync = promisify(exec);

interface RestoreConfig {
  databaseUrl: string;
  backupDir: string;
  timestamp?: string;
  verifyBeforeRestore: boolean;
}

interface RestoreResult {
  success: boolean;
  timestamp: string;
  tablesRestored: string[];
  duration: number;
  errors?: string[];
}

class DatabaseRestore {
  private config: RestoreConfig;
  private startTime: number;

  constructor(timestamp?: string) {
    this.config = {
      databaseUrl: process.env.DATABASE_URL || '',
      backupDir: path.join(process.cwd(), 'backups'),
      timestamp,
      verifyBeforeRestore: true
    };

    this.startTime = Date.now();

    if (!this.config.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
  }

  async findLatestBackup(): Promise<string> {
    if (this.config.timestamp) {
      return this.config.timestamp;
    }

    try {
      const backups = await fs.readdir(this.config.backupDir);
      const validBackups = backups
        .filter(dir => /^\d{14}$/.test(dir))
        .sort((a, b) => b.localeCompare(a));

      if (validBackups.length === 0) {
        throw new Error('No backups found');
      }

      console.log(`📂 Found ${validBackups.length} backup(s)`);
      console.log(`📌 Using latest backup: ${validBackups[0]}`);
      
      return validBackups[0];
    } catch (error) {
      throw new Error(`Failed to find backups: ${error}`);
    }
  }

  async verifyBackup(timestamp: string): Promise<boolean> {
    const manifestFile = path.join(
      this.config.backupDir,
      timestamp,
      'manifest.json'
    );

    try {
      console.log('\n🔍 Verifying backup integrity before restore...');
      
      const manifestContent = await fs.readFile(manifestFile, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      for (const table of manifest.tables) {
        const backupFile = path.join(
          this.config.backupDir,
          timestamp,
          `${table}.sql`
        );

        const fileContent = await fs.readFile(backupFile, 'utf-8');
        const currentChecksum = createHash('sha256').update(fileContent).digest('hex');

        if (currentChecksum !== manifest.checksums[table]) {
          console.error(`❌ Checksum mismatch for ${table}`);
          return false;
        }

        console.log(`✅ Verified ${table} integrity`);
      }

      return true;
    } catch (error) {
      console.error('❌ Backup verification failed:', error);
      return false;
    }
  }

  async createSafetyBackup(): Promise<void> {
    console.log('\n🔒 Creating safety backup before restore...');
    
    const safetyTimestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const safetySchema = `restore_safety_${safetyTimestamp}`;
    
    const safetySQL = `
      CREATE SCHEMA IF NOT EXISTS ${safetySchema};
      CREATE TABLE IF NOT EXISTS ${safetySchema}.users AS SELECT * FROM public.users;
      CREATE TABLE IF NOT EXISTS ${safetySchema}.codes AS SELECT * FROM public.codes;
      CREATE TABLE IF NOT EXISTS ${safetySchema}.registrations AS SELECT * FROM public.registrations;
    `;

    const safetyFile = path.join(this.config.backupDir, `safety_${safetyTimestamp}.sql`);
    await fs.writeFile(safetyFile, safetySQL);
    
    console.log(`✅ Safety backup schema created: ${safetySchema}`);
  }

  async restoreTable(tableName: string, timestamp: string): Promise<void> {
    const backupFile = path.join(
      this.config.backupDir,
      timestamp,
      `${tableName}.sql`
    );

    try {
      // Check if backup file exists
      await fs.access(backupFile);

      // Truncate existing table and restore from backup
      const restoreCommand = `psql "${this.config.databaseUrl}" -c "TRUNCATE TABLE public.${tableName} CASCADE;" && psql "${this.config.databaseUrl}" -f "${backupFile}"`;
      
      await execAsync(restoreCommand);
      console.log(`✅ Restored table: ${tableName}`);
    } catch (error) {
      throw new Error(`Failed to restore table ${tableName}: ${error}`);
    }
  }

  async restoreFullDatabase(timestamp: string): Promise<void> {
    const fullBackupFile = path.join(
      this.config.backupDir,
      timestamp,
      'full_backup.sql'
    );

    try {
      // Check if full backup exists
      await fs.access(fullBackupFile);
      
      console.log('\n🔄 Restoring full database from backup...');
      const restoreCommand = `psql "${this.config.databaseUrl}" -f "${fullBackupFile}"`;
      
      await execAsync(restoreCommand);
      console.log('✅ Full database restored successfully');
    } catch (error) {
      console.warn('⚠️ Full backup not found, using table-by-table restore');
    }
  }

  async validateRestoration(): Promise<boolean> {
    console.log('\n🔍 Validating restored data...');
    
    try {
      // Basic validation queries
      const validationQueries = [
        'SELECT COUNT(*) FROM users',
        'SELECT COUNT(*) FROM codes',
        'SELECT COUNT(*) FROM registrations'
      ];

      for (const query of validationQueries) {
        const command = `psql "${this.config.databaseUrl}" -t -c "${query}"`;
        const { stdout } = await execAsync(command);
        const count = parseInt(stdout.trim());
        
        const tableName = query.match(/FROM (\w+)/)?.[1] || 'unknown';
        console.log(`✅ Table ${tableName}: ${count} records`);
      }

      return true;
    } catch (error) {
      console.error('❌ Validation failed:', error);
      return false;
    }
  }

  async execute(): Promise<RestoreResult> {
    const result: RestoreResult = {
      success: false,
      timestamp: '',
      tablesRestored: [],
      duration: 0
    };

    try {
      console.log('🚀 Starting database restore process...');
      
      // Step 1: Find backup to restore
      const backupTimestamp = await this.findLatestBackup();
      result.timestamp = backupTimestamp;
      
      console.log(`📅 Restoring backup from: ${backupTimestamp}`);

      // Step 2: Verify backup integrity
      if (this.config.verifyBeforeRestore) {
        const isValid = await this.verifyBackup(backupTimestamp);
        if (!isValid) {
          throw new Error('Backup verification failed');
        }
      }

      // Step 3: Create safety backup
      await this.createSafetyBackup();

      // Step 4: Load manifest to get table list
      const manifestFile = path.join(
        this.config.backupDir,
        backupTimestamp,
        'manifest.json'
      );
      const manifestContent = await fs.readFile(manifestFile, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      // Step 5: Restore tables
      console.log('\n📦 Restoring critical tables...');
      for (const table of manifest.tables) {
        await this.restoreTable(table, backupTimestamp);
        result.tablesRestored.push(table);
      }

      // Step 6: Validate restoration
      const isValid = await this.validateRestoration();
      if (!isValid) {
        throw new Error('Data validation failed after restore');
      }

      // Calculate duration
      result.duration = Math.round((Date.now() - this.startTime) / 1000);
      result.success = true;

      console.log('\n✅ Database restore completed successfully!');
      console.log(`⏱️  Duration: ${result.duration} seconds`);
      console.log(`📊 Tables restored: ${result.tablesRestored.join(', ')}`);
      
      return result;
    } catch (error) {
      console.error('\n❌ Restore process failed:', error);
      result.errors = [error instanceof Error ? error.message : String(error)];
      result.duration = Math.round((Date.now() - this.startTime) / 1000);
      return result;
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const timestamp = process.argv[2]; // Optional timestamp argument
  const restore = new DatabaseRestore(timestamp);
  
  restore.execute()
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { DatabaseRestore, RestoreResult };