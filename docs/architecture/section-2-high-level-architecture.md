# Section 2: High Level Architecture

### System Overview

The TBAT Mock Exam Platform implements a **serverless-first architecture** with **frontend-first development strategy** leveraging Vercel's integrated ecosystem for optimal performance and cost efficiency at 20-user scale.

```mermaid
graph TB
    subgraph "User Access Layer"
        A[Mobile Web App<br/>Next.js 14 PWA]
        B[Desktop Web App<br/>Responsive UI]
    end

    subgraph "Vercel Platform Layer"
        C[Vercel Edge Functions<br/>API Routes + Middleware]
        D[Vercel Postgres<br/>User Data + Results]
        E[Vercel Blob Storage<br/>PDF Solutions + Assets]
        F[Vercel Edge Config<br/>Session Capacity + Cache]
    end

    subgraph "External Services"
        G[Stripe Thailand<br/>THB Payment Processing]
        H[NextAuth.js<br/>Authentication Provider]
        I[Email Service<br/>Notification Delivery]
    end

    subgraph "Administrative Layer"
        J[Admin Dashboard<br/>User & PDF Management]
        K[Analytics Engine<br/>Performance Insights]
    end

    A --> C
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
    C --> H
    C --> I
    J --> C
    K --> C

    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#e8f5e8
    style E fill:#e8f5e8
    style F fill:#e8f5e8
    style G fill:#fff3e0
    style H fill:#fff3e0
    style I fill:#fff3e0
```

### Cost Analysis (Updated for 20 Users)

**Vercel Pro Plan - All-in-One Solution:**

- **Base Plan:** $20/month (฿720/month)
- **Postgres:** Included (100GB storage, 1M queries)
- **Blob Storage:** Included (100GB)
- **Edge Config:** Included
- **Functions:** Included (1M invocations)
- **Bandwidth:** Included (1TB)

**External Services:**

- **Stripe Thailand:** 3.65% + ฿11 per transaction
- **Email Service:** Free tier (Resend: 3,000 emails/month)

**Capacity Management Service:**
- Real-time capacity tracking for Free/Advanced packages
- Enforces 300 total / 150 free hard limits
- Provides availability status without exposing numbers
- Handles Advanced package priority logic
- Integrates with registration flow validation

**Total Monthly Cost:** ~฿710/month (20-user scale)
**Cost per User:** ~฿36/month (highly efficient at small scale)

### Development & Scalability Strategy

**Frontend-First Development Approach:**

- **Epic 1:** Complete frontend package selection experience with mock data and database foundation
- **Epic 2+:** Authentication integration and real backend API replacement
- **Benefits:** Early stakeholder validation, demo-ready platform, reduced Epic 2 dependencies

**Current Capacity:**

- **Registration:** 20 concurrent users during peak registration periods
- **Exam Participants:** 2 sessions × 300 students each (600 total on 27 กันยายน 2568)
- **Concurrent Load:** System optimized for 20 simultaneous registrations
- **Results Processing:** Real-time analytics generation
- **PDF Delivery:** Concurrent downloads supported

**Growth Path (Future 300 Users):**

- Vercel Pro scales automatically with usage-based pricing
- Database connection pooling via Prisma
- CDN distribution for PDF content
- Estimated cost: ฿2,500-3,000/month at 300-user scale
