# Component Library / Design System

### Design System Approach
**Hybrid Approach:** Build upon shadcn/ui component library with TBAT-specific customizations. Utilize existing components where possible, create custom variants for exam-specific needs (score cards, package selection, premium previews).

### Core Components

#### Package Selection Cards
**Purpose:** Allow users to choose between Free and Advanced packages with clear value proposition

**Variants:** 
- Free (available) - Green "เปิดรับสมัคร" status indicator
- Free (full) - Orange "ปิดรับสมัคร" status indicator, disabled state
- Advanced - Always available, prominent call-to-action

**States:** Default, Selected, Disabled, Hover

**Usage Guidelines:** 
- Display enrollment status for Free package only
- Never expose actual quota numbers to users
- Use contrasting colors for clear visual distinction
- Mobile-first responsive design approach

```typescript
// Component Structure Example
<PackageCard
  type="free" | "advanced"
  status="available" | "full" | "disabled"
  selected={boolean}
  price={number}
  features={string[]}
  onSelect={function}
/>
```

#### Score Display Cards
**Purpose:** Present exam results in hierarchical, scannable format

**Variants:**
- Total Score (primary) - Large prominent display
- Percentile Ranking (secondary) - Comparative context
- Individual Subject (tertiary) - Subject breakdowns

**States:** Loading skeleton, Data loaded, Error state

**Usage Guidelines:**
- Use gradient backgrounds for visual hierarchy
- Include contextual information (e.g., "จาก 2,400 คะแนน")
- Progressive disclosure for subject details

#### Form Components with Validation
**Purpose:** Consistent form experience with Thai-language validation

**Variants:**
- Text Input (ชื่อ-นามสกุล, Line ID)
- Email Input (with Thai validation messages)
- Phone Input (with auto-formatting: 08X-XXX-XXXX)
- Select Dropdown (โรงเรียน, ระดับชั้น)
- Password Input (with strength requirements)

**States:** 
- Default
- Focus (with transform and shadow)
- Error (red border + shake animation + error message)
- Success (green border)

**Usage Guidelines:**
- Error messages appear below inputs in small red text
- Mandatory Line ID field with clear messaging
- Real-time validation feedback
- Accessible error announcements

```typescript
// Validation Structure
<FormField>
  <Label>Email <RequiredIndicator /></Label>
  <Input
    type="email"
    onBlur={validateEmail}
    className={validationState}
  />
  <ErrorMessage role="alert" hidden={isValid}>
    กรุณากรอกอีเมลที่ถูกต้อง
  </ErrorMessage>
</FormField>
```

#### Premium Preview Overlay
**Purpose:** Encourage upgrades while showing value of premium content

**Variants:**
- Post-exam upgrade (290 บาท)
- Registration upsell (690 บาท)
- PDF preview with solution teaser

**States:** Default blur, Hover effects, Loading payment

**Usage Guidelines:**
- Use subtle blur effect on content
- Clear value proposition messaging
- Prominent upgrade CTA button
- Maintain content accessibility

#### PDF Download Components
**Purpose:** Secure PDF solution access with appropriate user experience

**Variants:**
- PDF Download Button (Advanced users) - Direct download with progress
- PDF Preview Modal (Free users) - First page visible + blur overlay
- PDF Viewer Embed (Mobile optimized) - Progressive loading for mobile

**States:** Available, Downloading, Complete, Failed, Expired, Restricted

**Usage Guidelines:**
- Download progress indicators with estimated time
- Mobile-first PDF viewing with pinch-to-zoom
- Offline download capability for app-like experience
- Security watermarks with user identification

```typescript
// PDF Component Structure
<PDFDownloadButton
  examCode={string}
  userType="free" | "advanced"
  expiryDate={Date}
  onUpgradeClick={function}
  downloadProgress={number}
  className={string}
/>

<PDFPreviewModal
  isOpen={boolean}
  pdfUrl={string}
  showPages={1} // First page only for free users
  blurPages={boolean}
  upgradePrice={290}
  onUpgrade={function}
/>
```

#### Data Expiry Components
**Purpose:** Manage 6-month data lifecycle with clear user communication

**Variants:**
- Countdown Timer (subtle indicator) - "เหลือเวลาเข้าถึงอีก X วัน"
- Warning Banner (prominent alert) - 30/7/1 day warnings
- Expired State (graceful failure) - Post-expiry access blocked message
- Export Prompt (data preservation) - Save before expiry options

**States:** Normal, Warning (30 days), Urgent (7 days), Critical (1 day), Expired

**Usage Guidelines:**
- Progressive urgency - subtle to prominent warnings
- Thai cultural context - respectful tone for limitations
- Export options before complete loss
- Contact support pathway for edge cases

```typescript
// Expiry Component Structure
<DataExpiryCountdown
  expiryDate={Date}
  urgencyLevel="normal" | "warning" | "urgent" | "critical"
  showExportOptions={boolean}
  onExportClick={function}
/>

<ExpiryWarningBanner
  daysRemaining={number}
  isDismissible={boolean}
  onExportData={function}
  onContactSupport={function}
/>
```

#### Enhanced Admin Components
**Purpose:** Efficient administrative operations with full audit trail

**Variants:**
- PDF Upload Center - Drag-drop with metadata form
- User Management Table - Search/filter with inline editing
- Emergency Tools Panel - Quick access crisis management
- Bulk Operations Modal - Mass updates with progress tracking

**States:** Loading, Processing, Success, Error, Confirmation Required

**Usage Guidelines:**
- Mobile-responsive for exam day tablet usage
- Confirmation dialogs for destructive operations
- Progress indicators for bulk operations
- Clear audit trail for all actions

```typescript
// Admin Component Structure
<PDFUploadCenter
  onFileUpload={function}
  acceptedFormats={".pdf"}
  maxFileSize={50} // MB
  uploadProgress={number}
  onMetadataSubmit={function}
/>

<UserManagementTable
  users={User[]}
  searchQuery={string}
  filters={FilterObject}
  onUserEdit={function}
  onExamCodeRegen={function}
  bulkActions={string[]}
/>

<EmergencyToolsPanel
  quickActions={ActionButton[]}
  onCodeRegenerate={function}
  onBulkUpdate={function}
  onEmergencyContact={function}
/>
```

#### Toast Notifications
**Purpose:** Provide immediate feedback for user actions

**Variants:**
- Success (green) - Registration complete, payment success
- Error (red) - Validation failures, payment errors  
- Warning (orange) - Capacity alerts, time-sensitive notices

**States:** Slide-in animation, Auto-dismiss, Manual close

**Usage Guidelines:**
- Bottom-right positioning on desktop
- Full-width mobile presentation
- Clear, concise Thai messaging
- 5-second auto-dismiss timing
