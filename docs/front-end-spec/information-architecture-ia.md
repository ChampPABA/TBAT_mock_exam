# Information Architecture (IA)

### Site Map / Screen Inventory

```mermaid
graph TD
    A[Landing Page] --> B[Registration]
    A --> C[Login]
    A --> D[About/FAQ]
    
    B --> E[Personal Info]
    E --> F[Subject Selection]
    F --> G[Confirmation]
    G --> H[Success + LINE QR]
    
    C --> I{Login Check}
    I -->|Student| J[Student Dashboard]
    I -->|Admin| K[Admin Dashboard]
    
    J --> L[Free Dashboard]
    J --> M[Advanced Dashboard]
    L --> N[Upgrade to Advanced]
    L --> O[Results Basic]
    M --> P[Results Detailed]
    M --> Q[Analytics]
    
    N --> R[Payment - Stripe]
    R --> S[Payment Success]
    R --> T[Payment Failed]
    
    K --> U[Quota Management]
    K --> V[Student Overview]
    K --> W[Analytics Panel]
    K --> X[PDF Upload Center]
    K --> Y[User Management CRUD]
    K --> Z[Emergency Tools]
    
    O --> X[Results Login]
    P --> X
    X --> Y[Score Display]
    X --> Z[Premium Preview]
    Z --> AA[Post-Exam Upgrade]
```

### Navigation Structure

**Primary Navigation:** 
- Landing: หน้าแรก | ลงทะเบียน | เข้าสู่ระบบ | เกี่ยวกับ
- Dashboard: หน้าแรก | ผลสอบ | อัปเกรด | ออกจากระบบ
- Admin: จัดการนักเรียน | ความจุ | Analytics | ออกจากระบบ

**Secondary Navigation:** 
- Form steps (1. ข้อมูลส่วนตัว | 2. เลือกวิชา | 3. ยืนยันข้อมูล)
- Dashboard tabs (คะแนนรวม | แต่ละวิชา | เปรียบเทียบ | คำแนะนำ)

**Breadcrumb Strategy:** 
- Simple path for multi-step processes
- Context-aware: "ลงทะเบียน > ข้อมูลส่วนตัว > เลือกวิชา"
