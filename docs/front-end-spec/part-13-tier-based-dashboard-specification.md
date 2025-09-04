# Part 13: Tier-Based Dashboard Front-End Specification

## Overview

This document specifies the tier-differentiated dashboard experiences for FREE and Advanced Package users, focusing on conversion-optimized design patterns that showcase value while maintaining excellent UX for both tiers.

## Executive Summary

The dashboard serves as the primary conversion point where FREE users experience limitations and are motivated to upgrade. The design must balance:
- **Value demonstration** for free users (not frustration)
- **Clear upgrade paths** without being aggressive
- **Premium feel** for Advanced Package users to validate their purchase

## Dashboard Architecture

### Component Hierarchy

```
Dashboard
├── Header
│   ├── Logo
│   ├── TierBadge (FREE/Advanced Package)
│   ├── UserMenu
│   └── UpgradeButton (FREE only)
├── Sidebar
│   ├── Navigation
│   ├── SubjectCards
│   └── QuickStats
├── MainContent
│   ├── WelcomeBanner
│   ├── ExamSection
│   ├── AnalyticsSection
│   └── HistorySection
└── Footer
    └── SupportLinks
```

## FREE Tier Dashboard

### Layout & Visual Design

```
┌────────────────────────────────────────────────────┐
│ TBAT Mock Exam    [FREE]    คุณสมชาย    [อัพเกรด]  │ <- Persistent header
├────────────────────────────────────────────────────┤
│                                                     │
│  👋 สวัสดี สมชาย!                                    │
│  เริ่มต้นการเตรียมสอบ TBAT กับวิชาฟรีของคุณ           │
│                                                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  📚 วิชาของคุณ                                      │
│  ┌─────────────────┐ ┌─────────────────┐          │
│  │  ⚛️ ฟิสิกส์        │ │  🔒 เคมี         │          │
│  │  ✅ พร้อมสอบ      │ │  Advanced Package Only │          │
│  │  [เริ่มสอบ]      │ │  [อัพเกรด]       │          │
│  └─────────────────┘ └─────────────────┘          │
│  ┌─────────────────┐                              │
│  │  🔒 ชีววิทยา      │                              │
│  │  Advanced Package Only │                              │
│  │  [อัพเกรด]       │                              │
│  └─────────────────┘                              │
│                                                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  📊 ผลสอบล่าสุด (แสดง 3 ครั้งล่าสุด)                  │
│  ┌─────────────────────────────────────────┐      │
│  │ ฟิสิกส์ #1 | 75/100 | 2 ม.ค. 2568        │      │
│  │ ฟิสิกส์ #2 | 82/100 | 3 ม.ค. 2568        │      │
│  │ ฟิสิกส์ #3 | 79/100 | 4 ม.ค. 2568        │      │
│  └─────────────────────────────────────────┘      │
│  🔒 ดูประวัติทั้งหมด (Advanced Package)          │
│                                                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  💡 ทำไมต้องอัพเกรด?                                │
│  ┌─────────────────────────────────────────┐      │
│  │ ✅ เข้าถึงทั้ง 3 วิชา                      │      │
│  │ ✅ เฉลยละเอียดพร้อมอธิบาย                 │      │
│  │ ✅ วิเคราะห์จุดอ่อน-จุดแข็ง                │      │
│  │ ✅ ส่งออกผลสอบ PDF                       │      │
│  │                                         │      │
│  │ [อัพเกรดเป็น Advanced Package ฿690] │      │
│  │ จำนวนผู้ใช้ Advanced Package: 1,250+ คน │      │
│  └─────────────────────────────────────────┘      │
└────────────────────────────────────────────────────┘
```

### Key Components

#### 1. Subject Cards (FREE)

```jsx
// Active Subject Card
<Card className="border-green-500 bg-green-50">
  <CardHeader>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Atom className="w-6 h-6 text-green-600" />
        <CardTitle>ฟิสิกส์</CardTitle>
      </div>
      <Badge variant="success">พร้อมสอบ</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-gray-600 mb-4">
      วิชาฟรีที่คุณเลือก - สอบได้ไม่จำกัด
    </p>
    <Button className="w-full" size="lg">
      เริ่มสอบ
    </Button>
  </CardContent>
</Card>

// Locked Subject Card
<Card className="relative opacity-75 border-gray-300">
  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-lg">
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Lock className="w-8 h-8 text-gray-400 mb-2" />
      <p className="text-sm font-medium text-gray-700">สำหรับ Advanced Package</p>
      <Button size="sm" variant="outline" className="mt-2">
        อัพเกรดเพื่อปลดล็อค
      </Button>
    </div>
  </div>
  <CardHeader>
    <div className="flex items-center gap-2">
      <Flask className="w-6 h-6 text-gray-400" />
      <CardTitle className="text-gray-400">เคมี</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-gray-400">
      150 ข้อสอบ พร้อมเฉลยละเอียด
    </p>
  </CardContent>
</Card>
```

#### 2. Limited Analytics Display

```jsx
<Card>
  <CardHeader>
    <CardTitle>📊 สถิติการสอบ</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Basic stats only */}
      <div className="flex justify-between">
        <span>จำนวนครั้งที่สอบ</span>
        <span className="font-bold">3</span>
      </div>
      <div className="flex justify-between">
        <span>คะแนนเฉลี่ย</span>
        <span className="font-bold">78.7%</span>
      </div>
      
      {/* Blurred premium stats */}
      <div className="relative mt-4 p-4 border rounded-lg">
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-10 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">การวิเคราะห์เชิงลึก</p>
            <Button size="sm" variant="link" className="mt-1">
              อัพเกรดเพื่อดู
            </Button>
          </div>
        </div>
        <div className="blur-sm">
          <p>จุดแข็ง: กลศาสตร์ (85%)</p>
          <p>จุดอ่อน: คลื่นและแสง (65%)</p>
          <p>แนะนำ: ฝึกโจทย์คลื่นเพิ่ม</p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

#### 3. Persistent Upgrade Prompt

```jsx
<Alert className="border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
  <Sparkles className="h-4 w-4" />
  <AlertTitle>ปลดล็อคศักยภาพเต็มรูปแบบ</AlertTitle>
  <AlertDescription>
    <div className="mt-2 space-y-2">
      <p>อัพเกรดเป็น Advanced Package วันนี้ รับ:</p>
      <ul className="text-sm space-y-1 ml-4">
        <li>• ทั้ง 3 วิชา (ฟิสิกส์ + เคมี + ชีววิทยา)</li>
        <li>• เฉลยละเอียดทุกข้อ พร้อมวิธีคิด</li>
        <li>• การวิเคราะห์จุดอ่อน-จุดแข็ง</li>
      </ul>
      <Button className="w-full mt-3 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500">
        อัพเกรดเพียง ฿690
      </Button>
      <p className="text-xs text-center text-gray-500">
        เข้าร่วมกับนักเรียน Advanced Package 1,250+ คน
      </p>
    </div>
  </AlertDescription>
</Alert>
```

---

## Advanced Package Tier Dashboard

### Layout & Visual Design

```
┌────────────────────────────────────────────────────┐
│ TBAT Mock Exam    [⭐ Advanced Package] คุณสมศรี [Profile] │
├────────────────────────────────────────────────────┤
│                                                     │
│  🌟 สวัสดี สมศรี! (Advanced Package Member)          │
│  คุณมีสิทธิ์เข้าถึงทุกฟีเจอร์ - มาเริ่มกันเลย!          │
│                                                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  📚 วิชาทั้งหมด (3/3 ปลดล็อคแล้ว)                    │
│  ┌─────────────────┐ ┌─────────────────┐          │
│  │  ⚛️ ฟิสิกส์        │ │  ⚗️ เคมี          │          │
│  │  150 ข้อสอบ      │ │  180 ข้อสอบ       │          │
│  │  [เริ่มสอบ]      │ │  [เริ่มสอบ]       │          │
│  └─────────────────┘ └─────────────────┘          │
│  ┌─────────────────┐                              │
│  │  🧬 ชีววิทยา      │                              │
│  │  200 ข้อสอบ      │                              │
│  │  [เริ่มสอบ]      │                              │
│  └─────────────────┘                              │
│                                                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  📈 การวิเคราะห์ประสิทธิภาพ                          │
│  ┌─────────────────────────────────────────┐      │
│  │ [Interactive Chart - Score Trends]       │      │
│  │ คะแนนเฉลี่ย: 82.5% (↑ 5.2%)              │      │
│  │ อันดับ: 125/1,250 (Top 10%)             │      │
│  └─────────────────────────────────────────┘      │
│                                                     │
│  💪 จุดแข็ง-จุดอ่อน                                  │
│  ┌─────────────────────────────────────────┐      │
│  │ จุดแข็ง:                                 │      │
│  │ • ฟิสิกส์: กลศาสตร์ (92%)                 │      │
│  │ • เคมี: อินทรีย์ (88%)                    │      │
│  │                                         │      │
│  │ ควรปรับปรุง:                             │      │
│  │ • ชีววิทยา: พันธุศาสตร์ (68%)              │      │
│  │ • ฟิสิกส์: ฟิสิกส์ยุคใหม่ (71%)             │      │
│  │                                         │      │
│  │ [ดูรายละเอียด] [ส่งออก PDF]              │      │
│  └─────────────────────────────────────────┘      │
│                                                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  📋 ประวัติการสอบ (ทั้งหมด)                          │
│  ┌─────────────────────────────────────────┐      │
│  │ [Full exam history with filters]         │      │
│  │ [Export options: PDF, Excel, CSV]        │      │
│  └─────────────────────────────────────────┘      │
└────────────────────────────────────────────────────┘
```

### Premium Components

#### 1. Full Subject Access Cards

```jsx
<Card className="border-gold-500 shadow-lg hover:shadow-xl transition-shadow">
  <div className="absolute top-2 right-2">
    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
      Advanced Package
    </Badge>
  </div>
  <CardHeader>
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Atom className="w-8 h-8 text-blue-600" />
      </div>
      <div>
        <CardTitle>ฟิสิกส์</CardTitle>
        <p className="text-sm text-gray-600">150 ข้อสอบพร้อมเฉลย</p>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span>สอบไปแล้ว</span>
        <span className="font-medium">12 ครั้ง</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>คะแนนสูงสุด</span>
        <span className="font-medium text-green-600">92/100</span>
      </div>
      <Progress value={92} className="h-2" />
      <div className="flex gap-2">
        <Button className="flex-1">
          เริ่มสอบใหม่
        </Button>
        <Button variant="outline" size="icon">
          <History className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

#### 2. Advanced Analytics Dashboard

```jsx
<Card>
  <CardHeader>
    <div className="flex justify-between items-center">
      <CardTitle>📊 การวิเคราะห์เชิงลึก</CardTitle>
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          <Download className="w-4 h-4 mr-1" />
          PDF
        </Button>
        <Button size="sm" variant="outline">
          <FileSpreadsheet className="w-4 h-4 mr-1" />
          Excel
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    {/* Score Trend Chart */}
    <div className="mb-6">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={scoreData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="physics" stroke="#3B82F6" />
          <Line type="monotone" dataKey="chemistry" stroke="#10B981" />
          <Line type="monotone" dataKey="biology" stroke="#F59E0B" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
    {/* Performance Metrics */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">คะแนนเฉลี่ยรวม</p>
        <p className="text-2xl font-bold text-blue-600">85.2%</p>
        <p className="text-xs text-green-600">↑ 5.2% จากเดือนก่อน</p>
      </div>
      <div className="bg-green-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">อันดับ</p>
        <p className="text-2xl font-bold text-green-600">125/1,250</p>
        <p className="text-xs text-gray-500">Top 10%</p>
      </div>
    </div>
    
    {/* Topic Performance */}
    <div className="mt-6">
      <h4 className="font-medium mb-3">ประสิทธิภาพรายหัวข้อ</h4>
      <div className="space-y-2">
        {topics.map(topic => (
          <div key={topic.name} className="flex items-center gap-3">
            <span className="text-sm w-24">{topic.name}</span>
            <Progress value={topic.score} className="flex-1" />
            <span className="text-sm font-medium w-12">{topic.score}%</span>
          </div>
        ))}
      </div>
    </div>
  </CardContent>
</Card>
```

#### 3. Study Recommendations

```jsx
<Card className="bg-gradient-to-br from-purple-50 to-pink-50">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Lightbulb className="w-5 h-5 text-purple-600" />
      คำแนะนำการเรียน
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      <Alert className="border-purple-200">
        <AlertDescription>
          <strong>เร่งด่วน:</strong> ควรทบทวน "พันธุศาสตร์" ในชีววิทยา
          คะแนนต่ำกว่าเป้าหมาย 20%
        </AlertDescription>
      </Alert>
      
      <div className="bg-white p-3 rounded-lg">
        <p className="font-medium mb-2">แผนการเรียน 7 วัน</p>
        <ul className="text-sm space-y-1 text-gray-600">
          <li>• วันที่ 1-2: ทบทวนพันธุศาสตร์พื้นฐาน</li>
          <li>• วันที่ 3-4: ฝึกโจทย์ Pedigree Analysis</li>
          <li>• วันที่ 5-6: โจทย์ข้อสอบจริงปีก่อน</li>
          <li>• วันที่ 7: Mock exam ชีววิทยาเต็มรูปแบบ</li>
        </ul>
      </div>
      
      <Button className="w-full" variant="outline">
        <Calendar className="w-4 h-4 mr-2" />
        ตั้งเตือนในปฏิทิน
      </Button>
    </div>
  </CardContent>
</Card>
```

---

## Conversion Optimization Elements

### Strategic CTA Placements

#### 1. After Exam Completion (FREE Users)

```jsx
<Dialog open={showUpgradePrompt}>
  <DialogContent className="max-w-lg">
    <div className="text-center py-4">
      <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
      <DialogTitle className="text-2xl mb-2">
        ยอดเยี่ยม! คุณได้ {score} คะแนน
      </DialogTitle>
      <DialogDescription className="mb-6">
        แต่นี่เป็นแค่จุดเริ่มต้น...
      </DialogDescription>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="font-medium mb-3">สิ่งที่คุณพลาดในฐานะ FREE:</p>
        <ul className="text-left space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 mt-0.5" />
            <span>เฉลยละเอียดพร้อมวิธีคิด</span>
          </li>
          <li className="flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 mt-0.5" />
            <span>การวิเคราะห์จุดอ่อน-จุดแข็ง</span>
          </li>
          <li className="flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 mt-0.5" />
            <span>เข้าถึงอีก 2 วิชา</span>
          </li>
        </ul>
      </div>
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={dismissPrompt} className="flex-1">
          ไว้ทีหลัง
        </Button>
        <Button onClick={goToUpgrade} className="flex-1 bg-gradient-to-r from-green-500 to-green-600">
          อัพเกรดเลย ฿690
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        85% ของนักเรียนที่อัพเกรดพัฒนาคะแนนได้ภายใน 2 สัปดาห์
      </p>
    </div>
  </DialogContent>
</Dialog>
```

#### 2. Time-Based Prompt (48 hours after registration)

```jsx
<Alert className="border-green-500 bg-green-50">
  <Gift className="h-4 w-4" />
  <AlertTitle>ข้อเสนอพิเศษสำหรับคุณ!</AlertTitle>
  <AlertDescription>
    <div className="mt-2">
      <p className="mb-3">
        คุณใช้งาน FREE มา 2 วันแล้ว 
        อัพเกรดวันนี้รับส่วนลดพิเศษ
      </p>
      <div className="flex items-center gap-3 mb-3">
        <span className="line-through text-gray-400">฿690</span>
        <span className="text-2xl font-bold text-green-600">฿590</span>
        <Badge variant="destructive">ประหยัด ฿100</Badge>
      </div>
      <CountdownTimer endTime={offerEndTime} />
      <Button className="w-full mt-3" size="lg">
        รับข้อเสนอนี้
      </Button>
    </div>
  </AlertDescription>
</Alert>
```

### Mobile-Specific Optimizations

#### Floating Upgrade Button (Mobile Only)

```jsx
// Only show on mobile devices
{isMobile && userTier === 'FREE' && (
  <div className="fixed bottom-20 right-4 z-50">
    <Button 
      size="lg"
      className="rounded-full shadow-lg bg-gradient-to-r from-yellow-400 to-orange-400"
      onClick={handleUpgrade}
    >
      <Sparkles className="w-5 h-5 mr-2" />
      อัพเกรด
    </Button>
  </div>
)}
```

#### Swipeable Tier Comparison

```jsx
<div className="overflow-x-auto pb-4">
  <div className="flex gap-4 w-max">
    <Card className="w-72">
      <CardHeader>
        <Badge variant="outline">คุณอยู่ที่นี่</Badge>
        <CardTitle>FREE</CardTitle>
      </CardHeader>
      {/* FREE features */}
    </Card>
    
    <Card className="w-72 border-green-500 shadow-lg">
      <CardHeader>
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
          แนะนำ
        </Badge>
        <CardTitle>VVIP</CardTitle>
      </CardHeader>
      {/* VVIP features */}
    </Card>
  </div>
</div>
```

---

## Implementation Guidelines

### State Management

```typescript
interface DashboardState {
  user: {
    id: string;
    name: string;
    tier: 'FREE' | 'VVIP';
    lineId: string;
    selectedFreeSubject?: 'PHYSICS' | 'CHEMISTRY' | 'BIOLOGY';
  };
  examHistory: ExamResult[];
  analytics: {
    scores: SubjectScores;
    strengths: Topic[];
    weaknesses: Topic[];
    recommendations: Recommendation[];
  };
  ui: {
    showUpgradePrompt: boolean;
    dismissedPrompts: string[];
    lastPromptTime: Date;
  };
}
```

### Feature Gating Logic

```typescript
const FeatureGate = ({ feature, tier, children }) => {
  const userTier = useUserTier();
  
  if (tier === 'VVIP' && userTier === 'FREE') {
    return <LockedFeature feature={feature} />;
  }
  
  return children;
};

// Usage
<FeatureGate feature="detailed-analytics" tier="VVIP">
  <DetailedAnalytics />
</FeatureGate>
```

### Conversion Tracking

```typescript
// Track all upgrade-related interactions
const trackUpgradeEvent = (event: UpgradeEvent) => {
  analytics.track('upgrade_interaction', {
    event_type: event.type,
    location: event.location,
    user_tier: 'FREE',
    time_since_registration: getTimeSinceRegistration(),
    subject_selected: user.selectedFreeSubject,
  });
};

// Events to track
enum UpgradeEventType {
  VIEW_LOCKED_CONTENT = 'view_locked_content',
  CLICK_UPGRADE_CTA = 'click_upgrade_cta',
  DISMISS_UPGRADE_PROMPT = 'dismiss_upgrade_prompt',
  START_CHECKOUT = 'start_checkout',
  COMPLETE_PURCHASE = 'complete_purchase',
}
```

---

## Performance Considerations

### Lazy Loading Strategy

```typescript
// Lazy load premium components for VVIP users only
const AdvancedAnalytics = lazy(() => 
  import('./components/AdvancedAnalytics')
);

const ExportTools = lazy(() => 
  import('./components/ExportTools')
);

// Preload on upgrade button hover
const preloadPremiumComponents = () => {
  import('./components/AdvancedAnalytics');
  import('./components/ExportTools');
};
```

### Optimistic UI Updates

```typescript
// Immediately update UI on successful payment
const handleUpgradeSuccess = async (paymentResult) => {
  // Optimistically update tier
  setUserTier('VVIP');
  
  // Update UI immediately
  showSuccessAnimation();
  unlockAllFeatures();
  
  // Confirm with backend
  try {
    await confirmUpgrade(paymentResult);
  } catch (error) {
    // Rollback if needed
    handleUpgradeError(error);
  }
};
```

---

## A/B Testing Variants

### Test 1: Upgrade CTA Colors
- Variant A: Green gradient (current)
- Variant B: Gold gradient
- Variant C: Red urgency

### Test 2: Lock Pattern
- Variant A: Blur with lock icon
- Variant B: Grayscale with "VVIP Only" badge
- Variant C: Partial preview with fade

### Test 3: Prompt Timing
- Variant A: After first exam
- Variant B: After 24 hours
- Variant C: After 3 exams

### Test 4: Social Proof
- Variant A: User count only
- Variant B: Recent upgrades feed
- Variant C: Success stories

---

## Success Metrics

### Dashboard KPIs
- **Page Load Time:** < 2 seconds
- **Time to First Interaction:** < 1 second
- **Upgrade CTA Click Rate:** > 25%
- **Feature Lock Interaction:** > 40%
- **Dashboard Return Rate:** > 60% daily

### Conversion Metrics
- **Dashboard to Upgrade Page:** > 20%
- **Upgrade Page to Checkout:** > 30%
- **Checkout Completion:** > 70%
- **Post-Upgrade Engagement:** > 80% use within 24hr

---

## Conclusion

This tier-based dashboard specification creates clear value differentiation between FREE and VVIP tiers while maintaining excellent UX for both. The design prioritizes:

1. **Value demonstration** over frustration
2. **Strategic CTA placement** at conversion moments
3. **Clear upgrade paths** with compelling benefits
4. **Premium experience** for VVIP validation
5. **Mobile optimization** for 80% of users

Ready for implementation in the 21-day freemium sprint.