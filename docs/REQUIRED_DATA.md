# 📋 REQUIRED DATA & CONTENT
**Status:** 🔴 **PENDING** - Waiting for Client/UX Team Input  
**Last Updated:** 2025-09-02  
**Developer:** James (Full Stack Developer)

---

## 🎯 Project Overview
**Project:** TBAT Mock Exam Platform  
**Current Phase:** Frontend Mock Implementation (Variant 6 Design)  
**Blocker:** Need actual content and design specifications

---

## ⚠️ CRITICAL REQUIREMENTS

### 1. 🎨 **DESIGN SPECIFICATIONS** 
**Status:** ❌ PENDING  
**Required From:** UX/UI Designer

#### Need:
- [ ] **Figma/Adobe XD/Sketch Files** - Complete design mockups
- [ ] **Design System Documentation**
  - Color codes (exact hex values)
  - Typography scale (font sizes, line heights)
  - Spacing system (8px grid? 4px?)
  - Border radius values
  - Shadow specifications
- [ ] **Component Library Specs**
  - Button variants and states
  - Form field designs
  - Card layouts
  - Modal designs
- [ ] **Responsive Breakpoints**
  - Mobile: ?px
  - Tablet: ?px
  - Desktop: ?px
- [ ] **Animation/Interaction Specs**
  - Hover states
  - Transition timing
  - Loading states

---

### 2. 📝 **CONTENT & COPY**
**Status:** ❌ PENDING  
**Required From:** Content Team / Product Owner

#### Need:

##### **Homepage Content**
- [ ] **Hero Section**
  - Main headline (ภาษาไทย)
  - Subheadline
  - CTA button text
  - Background image/video?
  
- [ ] **Features Section** (6 features)
  - Feature titles
  - Feature descriptions (20-30 words each)
  - Feature icons/illustrations
  
- [ ] **Statistics/Numbers**
  - จำนวนนักเรียนที่ใช้งาน: ???
  - จำนวนข้อสอบในระบบ: ???
  - อัตราความสำเร็จ: ???%
  - คะแนนความพึงพอใจ: ???/5

- [ ] **Testimonials** (3-5 testimonials)
  - ชื่อนักเรียน
  - โรงเรียน
  - คะแนน TBAT
  - ข้อความรีวิว
  - รูปภาพ (optional)

- [ ] **Pricing Plans**
  - Plan names
  - Prices (THB)
  - Feature lists per plan
  - Promotional text

##### **Footer Content**
- [ ] Contact information
- [ ] Social media links
- [ ] Legal pages content (Privacy, Terms)
- [ ] Company description

---

### 3. 🖼️ **MEDIA ASSETS**
**Status:** ❌ PENDING  
**Required From:** Design Team / Marketing

#### Need:
- [ ] **Logo Files**
  - SVG format preferred
  - Different sizes (favicon, header, footer)
  - Dark/Light versions?
  
- [ ] **Images**
  - Hero background image
  - Feature illustrations (6 items)
  - Student photos for testimonials
  - School logos (if needed)
  
- [ ] **Icons**
  - Custom icon set or using library?
  - Icon style guide
  
- [ ] **Videos** (if any)
  - Introduction video
  - Tutorial videos
  - File formats and sizes

---

### 4. 📊 **MOCK EXAM DATA STRUCTURE**
**Status:** ❌ PENDING  
**Required From:** Academic Team / Product Owner

#### Need:
- [ ] **Exam Structure**
  ```javascript
  {
    examId: ???,
    title: "???",
    subjects: [
      {
        name: "ชีววิทยา",
        questionCount: ???,
        duration: ??? // minutes
      },
      // ... other subjects
    ],
    totalQuestions: ???,
    totalDuration: ???,
    passingScore: ???
  }
  ```

- [ ] **Sample Questions** (5-10 per subject)
  ```javascript
  {
    questionId: ???,
    subject: "???",
    question: "???",
    options: ["A. ???", "B. ???", "C. ???", "D. ???"],
    correctAnswer: "?",
    explanation: "???",
    difficulty: "easy|medium|hard"
  }
  ```

- [ ] **Scoring System**
  - Points per question
  - Negative marking?
  - Time bonus?

---

### 5. 🔐 **AUTHENTICATION & USER DATA**
**Status:** ❌ PENDING  
**Required From:** Product Owner

#### Need:
- [ ] **Registration Fields**
  - Required fields
  - Optional fields
  - Validation rules
  - Thai ID format?
  
- [ ] **Box Set Code Format**
  - Current: TBAT-XXXX-XXXX
  - Confirmed format?
  - Validation rules
  
- [ ] **User Roles**
  - Student
  - Teacher?
  - Admin?
  - Parent?

---

### 6. 🌐 **LOCALIZATION**
**Status:** ❌ PENDING  
**Required From:** Content Team

#### Need:
- [ ] **Language Support**
  - Thai only?
  - English version needed?
  - Language switcher?
  
- [ ] **Error Messages** (Thai)
  - Form validation errors
  - System errors
  - Success messages
  
- [ ] **Email Templates**
  - Registration confirmation
  - Password reset
  - Exam results

---

### 7. 📈 **ANALYTICS & TRACKING**
**Status:** ❌ PENDING  
**Required From:** Marketing / Product

#### Need:
- [ ] Google Analytics ID
- [ ] Facebook Pixel ID
- [ ] Conversion events to track
- [ ] UTM parameters structure

---

### 8. 🚀 **DEPLOYMENT & ENVIRONMENT**
**Status:** ❌ PENDING  
**Required From:** DevOps / Product Owner

#### Need:
- [ ] Domain name
- [ ] Hosting preferences
- [ ] SSL certificate
- [ ] CDN requirements
- [ ] Email service (SendGrid, AWS SES?)
- [ ] Database preferences
- [ ] Backup strategy

---

## 📍 CURRENT MOCK IMPLEMENTATION

### ✅ What We Have (Mock Data)
```javascript
// Current mock implementation uses placeholder data
const mockData = {
  hero: {
    title: "เตรียมพร้อมสอบ TBAT อย่างมั่นใจ",
    subtitle: "แพลตฟอร์มสอบจำลอง TBAT ออนไลน์ที่ใหญ่ที่สุดในเชียงใหม่"
  },
  features: [
    { title: "ข้อสอบครบทุกวิชา", description: "[PLACEHOLDER]" },
    // ... etc
  ],
  stats: {
    students: "200+", // NEED REAL NUMBER
    questions: "5,000+", // NEED REAL NUMBER
    successRate: "85%", // NEED REAL NUMBER
  }
}
```

### 🔄 What Needs Replacement
- All text content
- All numbers/statistics
- All images
- Brand colors (currently using Variant 6)
- Typography (currently using Google Fonts Prompt)

---

## 📅 TIMELINE IMPACT

**Current Status:** Development is proceeding with mock data  
**Risk:** Major UI/UX changes needed once real content arrives  
**Recommendation:** Get design files ASAP to avoid rework

---

## 💬 QUESTIONS FOR STAKEHOLDERS

1. **Design Team:**
   - Is Variant 6 the final design direction?
   - Any existing brand guidelines?
   - Need dark mode support?

2. **Content Team:**
   - When will Thai copy be ready?
   - Who approves final content?
   - SEO keywords identified?

3. **Product Owner:**
   - MVP features confirmed?
   - Launch date target?
   - Budget for third-party services?

4. **Academic Team:**
   - Sample questions ready?
   - Exam format finalized?
   - Scoring system confirmed?

---

## 🔔 ACTION ITEMS

### **For Client/Product Owner:**
1. ⏰ Provide Figma/design files
2. ⏰ Confirm content delivery date
3. ⏰ Approve current mock layout
4. ⏰ Provide real statistics/numbers

### **For Developer (Me):**
1. ✅ Continue with mock implementation
2. ✅ Mark all placeholder content
3. ⏳ Wait for required data
4. 📝 Update this document when data received

---

## 📞 CONTACT FOR QUESTIONS

**Developer:** James (Full Stack Dev)  
**Availability:** Ready to implement once data is provided  
**Blocked By:** Waiting for above requirements  

---

## 🏷️ TAGS
`#pending` `#waiting-for-content` `#needs-design` `#blocked`

---

**Note:** This document should be updated as requirements are received. Each item should be marked as ✅ when completed.