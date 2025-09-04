#!/usr/bin/env ts-node
import { exec } from 'child_process';
import { promisify } from 'util';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

interface BackupConfig {
  databaseUrl: string;
  backupUrl?: string;
  backupDir: string;
  criticalTables: string[];
  timestamp: string;
}

interface BackupResult {
  success: boolean;
  timestamp: string;
  tables: string[];
  checksums: Record<string, string>;
  errors?: string[];
}

class DatabaseBackup {
  private config: BackupConfig;

  constructor() {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    
    this.config = {
      databaseUrl: process.env.DATABASE_URL || '',
      backupUrl: process.env.DATABASE_BACKUP_URL,
      backupDir: path.join(process.cwd(), 'backups'),
      criticalTables: ['users', 'codes', 'registrations'],
      timestamp
    };

    if (!this.config.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
  }

  async ensureBackupDirectory(): Promise<void> {
    await fs.mkdir(this.config.backupDir, { recursive: true });
    await fs.mkdir(path.join(this.config.backupDir, this.config.timestamp), { recursive: true });
  }

  async createBackupSchema(): Promise<void> {
    const schemaName = `backup_${this.config.timestamp}`;
    const createSchemaSQL = `
      CREATE SCHEMA IF NOT EXISTS ${schemaName};
      ${this.config.criticalTables.map(table => `
        CREATE TABLE IF NOT EXISTS ${schemaName}.${table} AS 
        SELECT * FROM public.${table};
      `).join('\n')}
    `;

    const sqlFile = path.join(this.config.backupDir, this.config.timestamp, 'create_schema.sql');
    await fs.writeFile(sqlFile, createSchemaSQL);

    console.log(`📝 Created backup schema: ${schemaName}`);
    console.log(`📁 SQL file saved to: ${sqlFile}`);
  }

  async backupTable(tableName: string): Promise<string> {
    const outputFile = path.join(
      this.config.backupDir,
      this.config.timestamp,
      `${tableName}.sql`
    );

    const pgDumpCommand = `pg_dump "${this.config.databaseUrl}" -t public.${tableName} --data-only --inserts -f "${outputFile}"`;

    try {
      await execAsync(pgDumpCommand);
      
      // Calculate checksum for verification
      const fileContent = await fs.readFile(outputFile, 'utf-8');
      const checksum = createHash('sha256').update(fileContent).digest('hex');
      
      console.log(`✅ Backed up table: ${tableName} (checksum: ${checksum.slice(0, 8)}...)`);
      return checksum;
    } catch (error) {
      console.error(`❌ Failed to backup table ${tableName}:`, error);
      throw error;
    }
  }

  async backupFullDatabase(): Promise<void> {
    const outputFile = path.join(
      this.config.backupDir,
      this.config.timestamp,
      'full_backup.sql'
    );

    const pgDumpCommand = `pg_dump "${this.config.databaseUrl}" -f "${outputFile}"`;

    try {
      await execAsync(pgDumpCommand);
      console.log(`✅ Full database backup created: ${outputFile}`);
    } catch (error) {
      console.error(`❌ Failed to create full backup:`, error);
      throw error;
    }
  }

  async generateBackupManifest(checksums: Record<string, string>): Promise<void> {
    const manifest = {
      timestamp: this.config.timestamp,
      date: new Date().toISOString(),
      tables: this.config.criticalTables,
      checksums,
      environment: process.env.NODE_ENV || 'development',
      backupDir: this.config.backupDir
    };

    const manifestFile = path.join(
      this.config.backupDir,
      this.config.timestamp,
      'manifest.json'
    );

    await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2));
    console.log(`📋 Backup manifest created: ${manifestFile}`);
  }

  async verifyBackup(): Promise<boolean> {
    const manifestFile = path.join(
      this.config.backupDir,
      this.config.timestamp,
      'manifest.json'
    );

    try {
      const manifestContent = await fs.readFile(manifestFile, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      console.log('\n🔍 Verifying backup integrity...');

      for (const table of manifest.tables) {
        const backupFile = path.join(
          this.config.backupDir,
          this.config.timestamp,
          `${table}.sql`
        );

        const fileContent = await fs.readFile(backupFile, 'utf-8');
        const currentChecksum = createHash('sha256').update(fileContent).digest('hex');

        if (currentChecksum !== manifest.checksums[table]) {
          console.error(`❌ Checksum mismatch for ${table}`);
          return false;
        }

        console.log(`✅ Verified ${table} (checksum match)`);
      }

      console.log('✅ All backup files verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Backup verification failed:', error);
      return false;
    }
  }

  async execute(): Promise<BackupResult> {
    const result: BackupResult = {
      success: false,
      timestamp: this.config.timestamp,
      tables: [],
      checksums: {}
    };

    try {
      console.log('🚀 Starting database backup process...');
      console.log(`📅 Timestamp: ${this.config.timestamp}`);
      
      // Step 1: Ensure backup directory exists
      await this.ensureBackupDirectory();

      // Step 2: Create backup schema SQL
      await this.createBackupSchema();

      // Step 3: Backup critical tables
      console.log('\n📦 Backing up critical tables...');
      for (const table of this.config.criticalTables) {
        const checksum = await this.backupTable(table);
        result.checksums[table] = checksum;
        result.tables.push(table);
      }

      // Step 4: Create full database backup
      console.log('\n💾 Creating full database backup...');
      await this.backupFullDatabase();

      // Step 5: Generate manifest
      await this.generateBackupManifest(result.checksums);

      // Step 6: Verify backup
      const isValid = await this.verifyBackup();
      
      if (!isValid) {
        throw new Error('Backup verification failed');
      }

      result.success = true;
      console.log('\n✅ Database backup completed successfully!');
      console.log(`📁 Backup location: ${path.join(this.config.backupDir, this.config.timestamp)}`);
      
      return result;
    } catch (error) {
      console.error('\n❌ Backup process failed:', error);
      result.errors = [error instanceof Error ? error.message : String(error)];
      return result;
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const backup = new DatabaseBackup();
  backup.execute()
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

export { DatabaseBackup, BackupResult };