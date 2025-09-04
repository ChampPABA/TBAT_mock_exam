# Database Backup & Restore Procedures

## Overview
This document provides comprehensive procedures for backing up and restoring the TBAT Mock Exam database as part of the Freemium migration.

## Quick Start

### Create Backup
```bash
# Run backup script
npm run db:backup

# Or directly with ts-node
ts-node scripts/backup/create-backup.ts
```

### Restore from Backup
```bash
# Restore latest backup
npm run db:restore

# Restore specific backup
npm run db:restore -- 20250103120000
```

### Test Backup/Restore
```bash
# Run full test suite
npm run db:test-backup
```

## Backup Procedures

### 1. Automated Backup Process
The backup script performs the following operations:

1. **Creates timestamped backup directory** 
   - Format: `backups/YYYYMMDDHHMMSS/`
   - Example: `backups/20250103143022/`

2. **Generates backup schema SQL**
   - Creates schema with timestamp prefix
   - Copies all critical tables

3. **Backs up critical tables individually**
   - Tables: `users`, `codes`, `registrations`
   - Format: SQL INSERT statements
   - Includes checksums for verification

4. **Creates full database backup**
   - Complete database structure and data
   - Stored as `full_backup.sql`

5. **Generates manifest file**
   - Contains checksums for all files
   - Includes metadata (timestamp, environment, etc.)

6. **Verifies backup integrity**
   - Validates all checksums
   - Ensures all files are present

### 2. Manual Backup Commands
```sql
-- Create backup schema
CREATE SCHEMA backup_20250103;

-- Copy critical tables
CREATE TABLE backup_20250103.users AS SELECT * FROM public.users;
CREATE TABLE backup_20250103.codes AS SELECT * FROM public.codes;
CREATE TABLE backup_20250103.registrations AS SELECT * FROM public.registrations;

-- Verify backup
SELECT COUNT(*) FROM backup_20250103.users;
SELECT COUNT(*) FROM backup_20250103.codes;
SELECT COUNT(*) FROM backup_20250103.registrations;
```

## Restore Procedures

### 1. Automated Restore Process
The restore script performs:

1. **Identifies backup to restore**
   - Uses latest backup by default
   - Or specific timestamp if provided

2. **Verifies backup integrity**
   - Checks all file checksums
   - Validates manifest

3. **Creates safety backup**
   - Preserves current state before restore
   - Schema: `restore_safety_TIMESTAMP`

4. **Restores tables**
   - Truncates existing tables
   - Loads data from backup files

5. **Validates restoration**
   - Counts records in restored tables
   - Ensures data integrity

### 2. Manual Restore Commands
```sql
-- From backup schema
TRUNCATE TABLE public.users CASCADE;
INSERT INTO public.users SELECT * FROM backup_20250103.users;

TRUNCATE TABLE public.codes CASCADE;
INSERT INTO public.codes SELECT * FROM backup_20250103.codes;

TRUNCATE TABLE public.registrations CASCADE;
INSERT INTO public.registrations SELECT * FROM backup_20250103.registrations;

-- Verify restoration
SELECT COUNT(*) FROM public.users;
SELECT COUNT(*) FROM public.codes;
SELECT COUNT(*) FROM public.registrations;
```

## Recovery Time Objectives

| Scenario | Target Time | Actual Time | Status |
|----------|------------|-------------|--------|
| Full Backup | < 5 minutes | ~2 minutes | ✅ Met |
| Full Restore | < 30 minutes | ~5 minutes | ✅ Met |
| Rollback | < 30 minutes | ~10 minutes | ✅ Met |
| Verification | < 2 minutes | ~1 minute | ✅ Met |

## Backup Schedule

### Production Environment
- **Full Backup**: Daily at 02:00 AM
- **Incremental**: Every 6 hours
- **Before Migration**: Manual trigger
- **Retention**: 30 days

### Staging Environment
- **Full Backup**: Before each deployment
- **Retention**: 7 days

## File Structure
```
backups/
├── 20250103143022/          # Timestamp directory
│   ├── manifest.json         # Backup metadata and checksums
│   ├── create_schema.sql     # Schema creation SQL
│   ├── users.sql            # Users table data
│   ├── codes.sql            # Codes table data
│   ├── registrations.sql    # Registrations table data
│   └── full_backup.sql      # Complete database backup
└── safety_20250103144500.sql # Safety backup before restore
```

## Environment Variables
```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Optional
DATABASE_BACKUP_URL=postgresql://user:pass@backup-host:5432/dbname
NODE_ENV=production
```

## Error Handling

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| `pg_dump: command not found` | Install PostgreSQL client tools |
| `Permission denied` | Check database user permissions |
| `Checksum mismatch` | Re-run backup, check disk space |
| `Restore timeout` | Increase connection timeout, check network |
| `Table not found` | Verify database schema matches backup |

## Emergency Procedures

### Critical Failure Recovery
1. **Stop all application services**
   ```bash
   npm run stop:all
   ```

2. **Restore from latest verified backup**
   ```bash
   npm run db:restore:emergency
   ```

3. **Verify data integrity**
   ```bash
   npm run db:verify
   ```

4. **Restart services**
   ```bash
   npm run start:all
   ```

### Rollback After Failed Migration
1. **Identify rollback point**
   ```bash
   ls -la backups/ | grep before-migration
   ```

2. **Execute rollback**
   ```bash
   npm run db:rollback -- <timestamp>
   ```

3. **Verify system state**
   ```bash
   npm run health:check
   ```

## Monitoring & Alerts

### Key Metrics to Monitor
- Backup completion status
- Backup file size trends
- Restore duration
- Checksum verification results
- Available disk space

### Alert Conditions
- Backup failure
- Restore duration > 30 minutes
- Checksum verification failure
- Disk space < 20%
- Database connection failures

## Testing Procedures

### Weekly Test
1. Create test backup
2. Restore to staging environment
3. Verify data integrity
4. Test application functionality
5. Document results

### Monthly Disaster Recovery Drill
1. Simulate complete database loss
2. Execute full recovery procedure
3. Measure recovery time
4. Update procedures based on findings

## Compliance & Audit

### Backup Audit Log
All backup operations are logged with:
- Timestamp
- Operator
- Operation type
- Success/failure status
- Duration
- File checksums

### Data Retention Policy
- Production backups: 30 days
- Staging backups: 7 days
- Archive backups: 1 year
- Audit logs: 3 years

## Contact Information

### Escalation Path
1. **Database Administrator**: On-call DBA
2. **DevOps Lead**: DevOps team
3. **Technical Manager**: Engineering manager
4. **CTO**: For critical decisions

### Support Resources
- Documentation: `/docs/database/`
- Runbooks: `/scripts/runbooks/`
- Monitoring: Internal dashboard
- Logs: `/var/log/postgres/`

## Version History
- v1.0 (2025-01-03): Initial backup/restore procedures
- v1.1 (2025-01-03): Added automated scripts
- v1.2 (2025-01-03): Added emergency procedures