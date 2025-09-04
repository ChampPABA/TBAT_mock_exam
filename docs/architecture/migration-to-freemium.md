# Migration Plan: BoxSet to Freemium Architecture

## Executive Summary

This document outlines the technical migration strategy from the BoxSet code-based model to the Freemium tier-based model for the TBAT Mock Exam registration and results portal.

**Timeline:** 14 days (reduced from 21 days due to scope clarification)  
**Risk Level:** Medium (with proper backup procedures)  
**Rollback Available:** Yes, at every stage

## Migration Phases

### Phase 0: Preparation & Safety (Day 1-2)

#### Database Backup Strategy
```sql
-- Create timestamped backup schema
CREATE SCHEMA backup_20250103;

-- Backup critical tables
CREATE TABLE backup_20250103.users AS SELECT * FROM public.users;
CREATE TABLE backup_20250103.codes AS SELECT * FROM public.codes;
CREATE TABLE backup_20250103.registrations AS SELECT * FROM public.registrations;

-- Create restoration script (store separately)
-- restoration_script.sql
```

#### Rollback Procedures
```bash
# Rollback script ready at each phase
#!/bin/bash
echo "Starting rollback to BoxSet model..."
psql $DATABASE_URL < ./rollback/restore_boxset_v1.sql
echo "Rollback complete. Verify data integrity."
```

### Phase 1: Schema Migration (Day 2-3)

#### Step 1: Add Freemium Fields (Non-Breaking)
```sql
-- Add new columns without removing old ones
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS line_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS tier VARCHAR(10) DEFAULT 'FREE',
ADD COLUMN IF NOT EXISTS free_subject VARCHAR(20),
ADD COLUMN IF NOT EXISTS parent_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS parent_relation VARCHAR(20),
ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(15),
ADD COLUMN IF NOT EXISTS parent_email VARCHAR(100);

-- Create new tables alongside existing
CREATE TABLE IF NOT EXISTS registrations_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  exam_ticket VARCHAR(50) UNIQUE NOT NULL,
  tier VARCHAR(10) NOT NULL,
  subjects JSON NOT NULL,
  status VARCHAR(20) DEFAULT 'REGISTERED',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Step 2: Data Migration Script
```typescript
// scripts/migrate-to-freemium.ts
async function migrateExistingUsers() {
  const users = await prisma.users.findMany({
    where: { code: { not: null } }
  });
  
  for (const user of users) {
    await prisma.users.update({
      where: { id: user.id },
      data: {
        tier: 'VVIP', // All BoxSet users get VVIP
        examTicket: generateExamTicket(),
        // Preserve existing access
      }
    });
  }
  
  console.log(`Migrated ${users.length} BoxSet users to VVIP tier`);
}
```

### Phase 2: Application Code Updates (Day 4-7)

#### Registration Module Changes
```typescript
// Before (BoxSet)
export async function registerWithCode(code: string, userData: UserData) {
  const validCode = await validateBoxSetCode(code);
  if (!validCode) throw new Error('Invalid code');
  // ... create user
}

// After (Freemium) - Backward Compatible
export async function registerUser(userData: UserData, options?: {
  code?: string,  // Optional for backward compatibility
  tier?: 'FREE' | 'VVIP'
}) {
  // Check if BoxSet code provided (backward compat)
  if (options?.code) {
    const validCode = await validateBoxSetCode(options.code);
    if (validCode) {
      return createVVIPUser(userData); // BoxSet = VVIP
    }
  }
  
  // New Freemium flow
  if (options?.tier === 'VVIP') {
    return await processVVIPRegistration(userData);
  }
  
  return await createFreeUser(userData);
}
```

#### Dual-Mode API Endpoints
```typescript
// Maintain both endpoints during transition
app.post('/api/register', handleFreemiumRegistration);
app.post('/api/register/legacy', handleBoxSetRegistration); // Deprecated

// Feature flag for gradual rollout
const useFreemium = process.env.FEATURE_FREEMIUM === 'true';
```

### Phase 3: Payment Integration (Day 8-10)

#### Stripe Setup
```typescript
// lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createUpgradeSession(userId: string) {
  return await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'promptpay'],
    line_items: [{
      price_data: {
        currency: 'thb',
        product_data: {
          name: 'TBAT VVIP Upgrade',
          description: '3 subjects + detailed analytics',
        },
        unit_amount: 69000, // ฿690.00
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    metadata: { userId },
  });
}
```

#### Webhook Security
```typescript
// api/payment/webhook.ts
export async function handleStripeWebhook(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  try {
    const event = stripe.webhooks.constructEvent(
      await req.text(),
      sig,
      webhookSecret
    );
    
    switch (event.type) {
      case 'checkout.session.completed':
        await upgradeUserToVVIP(event.data.object.metadata.userId);
        break;
    }
    
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response('Webhook Error', { status: 400 });
  }
}
```

### Phase 4: Frontend Updates (Day 11-12)

#### Component Updates
```tsx
// components/registration/TierSelector.tsx
export function TierSelector({ onSelect }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <TierCard
        title="FREE"
        price="฿0"
        features={[
          "ลงทะเบียนสอบ 1 วิชา",
          "ดูคะแนนพื้นฐาน",
          "ใบรับรองการสอบ",
        ]}
        onSelect={() => onSelect('FREE')}
      />
      <TierCard
        title="VVIP"
        price="฿690"
        badge="RECOMMENDED"
        features={[
          "ลงทะเบียนสอบ 3 วิชา",
          "วิเคราะห์ผลละเอียด",
          "เฉลยและคำอธิบาย",
          "Export ผลเป็น PDF",
          "ดู Percentile",
        ]}
        onSelect={() => onSelect('VVIP')}
      />
    </div>
  );
}
```

#### Dashboard Tier Gating
```tsx
// app/dashboard/page.tsx
export default async function Dashboard() {
  const user = await getCurrentUser();
  
  return (
    <DashboardLayout>
      {user.tier === 'FREE' && <UpgradeBanner />}
      
      <ExamInfo 
        ticket={user.examTicket}
        venue="Chiang Mai University"
        date="2025-09-20"
      />
      
      {user.results && (
        <ResultsSection 
          results={user.results}
          showDetails={user.tier === 'VVIP'}
        />
      )}
    </DashboardLayout>
  );
}
```

### Phase 5: Testing & Validation (Day 13-14)

#### Test Scenarios
```typescript
// e2e/freemium-migration.spec.ts
describe('Freemium Migration', () => {
  test('BoxSet users maintain VVIP access', async () => {
    const boxSetUser = await loginAsBoxSetUser();
    expect(boxSetUser.tier).toBe('VVIP');
    expect(boxSetUser.hasFullAccess).toBe(true);
  });
  
  test('New FREE users can register without code', async () => {
    await page.goto('/register');
    await selectTier('FREE');
    await fillRegistrationForm();
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('FREE users can upgrade to VVIP', async () => {
    await loginAsFreeUser();
    await page.click('[data-testid="upgrade-button"]');
    await completeStripeCheckout();
    await expect(userTier()).toBe('VVIP');
  });
});
```

## Rollback Plan

### Automatic Rollback Triggers
- Payment failure rate > 5%
- Registration error rate > 2%
- System downtime > 30 minutes

### Manual Rollback Process
```bash
#!/bin/bash
# rollback.sh

echo "=== TBAT Freemium Rollback ==="
echo "1. Disabling new registrations..."
kubectl set env deployment/api MAINTENANCE_MODE=true

echo "2. Restoring database..."
psql $DATABASE_URL < ./backup/boxset_backup.sql

echo "3. Reverting code deployment..."
git checkout tags/v1.0-boxset
vercel deploy --prod

echo "4. Verifying services..."
curl https://api.tbat.com/health

echo "Rollback complete!"
```

## Migration Checklist

### Pre-Migration
- [ ] Full database backup completed
- [ ] Rollback scripts tested in staging
- [ ] Stripe account configured
- [ ] Payment webhook endpoint verified
- [ ] Load testing completed (1000+ users)
- [ ] Support team briefed

### During Migration
- [ ] Maintenance window announced
- [ ] Database migrations applied
- [ ] Application code deployed
- [ ] Payment flow tested
- [ ] Existing users verified
- [ ] Monitoring active

### Post-Migration
- [ ] All BoxSet users have VVIP access
- [ ] New registrations working
- [ ] Payment processing confirmed
- [ ] Metrics dashboard operational
- [ ] Support tickets monitored
- [ ] 24-hour observation period

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | Low | Critical | Full backup, tested restore |
| Payment integration fails | Medium | High | Fallback to manual process |
| User confusion | High | Medium | Clear communication, FAQ |
| Performance degradation | Low | Medium | Load testing, auto-scaling |
| BoxSet users lose access | Low | High | Preserve all existing access |

## Success Metrics

### Technical Success (Day 1)
- ✅ Zero data loss
- ✅ < 2 hour migration window
- ✅ All BoxSet users retained
- ✅ Payment processing active
- ✅ < 1% error rate

### Business Success (Week 1)
- 📊 500+ FREE registrations
- 📊 15%+ conversion to VVIP
- 📊 < 5% support ticket increase
- 📊 95%+ payment success rate
- 📊 NPS score maintained

## Communication Plan

### Internal Communications
```markdown
Subject: TBAT Platform Migration - BoxSet to Freemium

Team,

Migration scheduled for: January 10, 2025, 02:00-04:00 AM
Maintenance window: 2 hours
Rollback ready: Yes

All BoxSet users will automatically receive VVIP status.
New users can choose FREE (1 subject) or VVIP (3 subjects).

Action required:
- Dev team: Standby during migration
- Support: Monitor tickets, use FAQ template
- Marketing: Prepare announcement

Dashboard: [link]
Runbook: [link]
```

### User Communications
```markdown
เรียน นักเรียน TBAT

ระบบจะปรับปรุงในวันที่ 10 มกราคม 2568 เวลา 02:00-04:00 น.

✅ ผู้ใช้ BoxSet เดิม: ได้รับสิทธิ์ VVIP อัตโนมัติ
🆕 ผู้ใช้ใหม่: ทดลองฟรี 1 วิชา หรือ VVIP 3 วิชา

ขออภัยในความไม่สะดวก
ทีม TBAT
```

## Approval Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | Sarah | - | Pending |
| Technical Lead | - | - | Pending |
| DevOps Lead | - | - | Pending |
| QA Lead | Quinn | - | Pending |

---

**Status:** 📋 READY FOR REVIEW

**Next Steps:**
1. Review and approve migration plan
2. Schedule migration window
3. Prepare staging environment
4. Execute dry run
5. Production migration