# TBAT Freemium Migration - Rollback Runbook

## 🚨 EMERGENCY ROLLBACK PROCEDURES

**Document Version:** 1.0  
**Last Updated:** 2025-01-03  
**Target Completion Time:** < 30 minutes  

---

## WHEN TO USE THIS RUNBOOK

Execute rollback if ANY of these conditions occur:
- ❌ Migration error rate > 2%
- ❌ Payment processing failure rate > 5%
- ❌ Data integrity check fails
- ❌ System downtime > 30 minutes
- ❌ Critical security vulnerability discovered
- ❌ Conversion rate < 5% after 48 hours

---

## PRE-ROLLBACK CHECKLIST

Before starting rollback, confirm:
- [ ] Incident severity confirmed as Critical
- [ ] Stakeholders notified
- [ ] Backup verification completed
- [ ] Support team on standby
- [ ] Rollback decision authorized by: _____________

---

## ROLLBACK PROCEDURE

### ⏱️ Timeline: 30 Minutes Maximum

### STEP 1: Initiate Emergency Mode (0-2 minutes)
```bash
# 1.1 Set system to maintenance mode
echo "MAINTENANCE_MODE=true" >> .env

# 1.2 Stop accepting new registrations
npm run maintenance:enable

# 1.3 Notify users via banner
npm run notify:maintenance
```
**Verification:** Check that maintenance page is displayed

### STEP 2: Stop Application Services (2-5 minutes)
```bash
# 2.1 Stop all services
npm run stop:all

# 2.2 Kill processes on ports
npx kill-port 3000 3001 5000

# 2.3 Verify services stopped
ps aux | grep node
```
**Verification:** No Node.js processes running

### STEP 3: Create Safety Backup (5-8 minutes)
```bash
# 3.1 Create pre-rollback backup
npm run db:backup:emergency

# 3.2 Verify backup created
ls -la backups/
```
**Record Backup Timestamp:** _________________

### STEP 4: Execute Database Rollback (8-15 minutes)
```bash
# 4.1 Run automated rollback
npm run db:rollback

# OR if automated fails, run manual SQL:
psql $DATABASE_URL -f scripts/rollback/rollback-freemium.sql

# 4.2 Verify rollback
npm run db:verify:rollback
```
**Verification Checklist:**
- [ ] Users table restored
- [ ] Codes table restored  
- [ ] Registrations table restored
- [ ] Freemium fields removed
- [ ] Original indexes recreated

### STEP 5: Rollback Application Code (15-20 minutes)
```bash
# 5.1 Checkout previous stable version
git checkout v1.0-stable

# OR rollback to specific commit
git checkout <commit-hash>

# 5.2 Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 5.3 Rebuild application
npm run build
```
**Verification:** Build completes without errors

### STEP 6: Restart Services (20-25 minutes)
```bash
# 6.1 Start application
npm run start:production

# 6.2 Run health checks
npm run health:check

# 6.3 Verify core functionality
npm run test:smoke
```
**Verification Checklist:**
- [ ] Application accessible
- [ ] Login working
- [ ] Registration working (BoxSet mode)
- [ ] Database connections stable

### STEP 7: Post-Rollback Verification (25-30 minutes)
```bash
# 7.1 Run full system tests
npm run test:rollback

# 7.2 Check system metrics
npm run metrics:check

# 7.3 Disable maintenance mode
npm run maintenance:disable
```
**Final Verification:**
- [ ] All critical paths functional
- [ ] No Freemium features visible
- [ ] BoxSet functionality restored
- [ ] System performance normal

---

## MANUAL FALLBACK PROCEDURES

If automated rollback fails, use these manual commands:

### Database Manual Rollback
```sql
-- Connect to database
psql $DATABASE_URL

-- Find backup schema
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name LIKE 'backup_%' 
ORDER BY schema_name DESC LIMIT 1;

-- Restore from backup (replace backup_20250103 with actual)
TRUNCATE TABLE public.users CASCADE;
INSERT INTO public.users SELECT * FROM backup_20250103.users;

TRUNCATE TABLE public.codes CASCADE;
INSERT INTO public.codes SELECT * FROM backup_20250103.codes;

TRUNCATE TABLE public.registrations CASCADE;
INSERT INTO public.registrations SELECT * FROM backup_20250103.registrations;

-- Remove Freemium columns
ALTER TABLE users 
DROP COLUMN IF EXISTS line_id,
DROP COLUMN IF EXISTS tier,
DROP COLUMN IF EXISTS free_subject,
DROP COLUMN IF EXISTS parent_name,
DROP COLUMN IF EXISTS parent_relation,
DROP COLUMN IF EXISTS parent_phone,
DROP COLUMN IF EXISTS parent_email;

-- Verify
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM codes;
SELECT COUNT(*) FROM registrations;
```

### Application Manual Rollback
```bash
# Find last stable deployment
git tag -l

# Checkout specific version
git checkout tags/v1.0.0

# Force clean state
git clean -fd
git reset --hard

# Rebuild
npm ci
npm run build
```

---

## POST-ROLLBACK ACTIONS

### Immediate (0-1 hour)
- [ ] Update status page
- [ ] Send notification to stakeholders
- [ ] Document incident details
- [ ] Begin root cause analysis

### Short-term (1-24 hours)
- [ ] Complete incident report
- [ ] Schedule post-mortem meeting
- [ ] Review and update rollback procedures
- [ ] Communicate with affected users

### Long-term (1-7 days)
- [ ] Implement fixes for issues found
- [ ] Update migration plan
- [ ] Enhance monitoring
- [ ] Re-plan migration attempt

---

## COMMUNICATION TEMPLATES

### User Notification
```
Subject: Temporary Service Interruption

We are currently performing maintenance to ensure the best experience for our users. 
The service will be restored shortly. 

Expected resolution: [TIME]
Status updates: [STATUS_PAGE_URL]

We apologize for any inconvenience.
```

### Stakeholder Update
```
INCIDENT: Freemium Migration Rollback
STATUS: In Progress
START TIME: [TIME]
EXPECTED RESOLUTION: 30 minutes
IMPACT: Registration and results access temporarily unavailable
ACTION: Executing rollback procedure per runbook
```

---

## CONTACT INFORMATION

### Escalation Chain

| Priority | Role | Name | Contact | When to Contact |
|----------|------|------|---------|----------------|
| 1 | On-Call DevOps | [Name] | [Phone] | Immediately |
| 2 | Database Admin | [Name] | [Phone] | Database issues |
| 3 | Tech Lead | [Name] | [Phone] | Code rollback issues |
| 4 | Product Manager | [Name] | [Phone] | Business decisions |
| 5 | CTO | [Name] | [Phone] | Critical escalation |

### Support Channels
- **Slack Channel:** #incident-response
- **War Room:** [Video Conference Link]
- **Status Page:** [URL]
- **Documentation:** `/docs/emergency/`

---

## TROUBLESHOOTING GUIDE

### Common Issues and Solutions

| Issue | Solution | Time Impact |
|-------|----------|------------|
| Backup not found | Use older backup from `backups/` directory | +5 min |
| Database connection timeout | Increase timeout in connection string | +2 min |
| Git conflicts during checkout | Force checkout with `git checkout -f` | +3 min |
| Dependencies won't install | Clear npm cache: `npm cache clean --force` | +5 min |
| Port already in use | Find and kill process: `lsof -i :3000` | +1 min |
| Rollback SQL fails | Run statements individually | +10 min |
| Services won't start | Check logs in `logs/` directory | +5 min |

---

## VALIDATION SCRIPTS

### Quick Health Check
```bash
#!/bin/bash
echo "=== System Health Check ==="

# Check database
psql $DATABASE_URL -c "SELECT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Database: Connected"
else
  echo "❌ Database: Failed"
fi

# Check application
curl -s http://localhost:3000/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Application: Running"
else
  echo "❌ Application: Not responding"
fi

# Check critical tables
for table in users codes registrations; do
  count=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM $table")
  echo "📊 Table $table: $count records"
done
```

---

## LESSONS LEARNED LOG

Document issues encountered during rollback:

| Date | Issue | Resolution | Prevention |
|------|-------|------------|------------|
| | | | |
| | | | |

---

## RUNBOOK VERIFICATION

This runbook was last tested on: **[DATE]**  
Test duration: **[TIME]**  
Test result: **[PASS/FAIL]**  
Tested by: **[NAME]**  

Next scheduled test: **[DATE]**

---

## APPROVAL

**Approved by:** Technical Lead  
**Date:** 2025-01-03  
**Version:** 1.0  

**Emergency Use Authorization:** This runbook may be executed by any on-call engineer during a critical incident without additional approval.

---

**END OF RUNBOOK**

Remember: **Stay calm, follow the steps, and communicate regularly with the team.**