# Part 2: Student-Facing Application

### 2.1 User Flows

**Flow A: First-Time User (Registration & Exam Submission)**

1.  **Homepage** -> User clicks "Register with Code".
2.  **Registration Page** -> User enters Unique Code, Full Name, School, Grade, Email, and creates a Password.
3.  **Success Modal** -> System confirms account creation.
4.  **Exam Input Page** -> User is directed to a form to input their answers.
5.  **Submission Confirmation** -> User clicks "Submit" and confirms.
6.  **Dashboard/Results Page** -> User is immediately taken to their personalized results.

**Flow B: Returning User (Login & View Results)**

1.  **Homepage** -> User clicks "Login".
2.  **Login Page** -> User enters Email and Password.
3.  **Dashboard/Results Page** -> User lands on their results page.

**Flow C: Forgot Password**

1.  **Login Page** -> User clicks "Forgot Password?".
2.  **Forgot Password Page** -> User enters their registered email.
3.  **Confirmation Message** -> System instructs the user to check their email.
4.  **Email** -> User receives a password reset link.
5.  **Reset Password Page** -> User creates and confirms a new password.
6.  **Login Page** -> User is redirected to the login page.

**Flow D: Error Scenarios & Edge Cases**

1.  **Invalid Registration Code** -> User enters incorrect code -> Error message displays with suggestion to check code or contact support.
2.  **Network Failure During Submission** -> Loading states -> Retry mechanism -> Offline indicator if needed.
3.  **Session Timeout** -> Automatic logout -> User redirected to login with message explaining timeout.
4.  **Duplicate Registration Attempt** -> User tries to register with existing email -> Clear error with login option.
5.  **Form Validation Failures** -> Real-time validation feedback -> Field-specific error messages -> Clear recovery instructions.

### 2.2 Wireframes (Description)

#### Screen 1: Homepage / Landing Page

- **Header:** Logo, "Login" button, "Register with Code" (Primary CTA) button.
- **Hero Section:** Large headline (e.g., "The Ultimate TBAT Mock Exam for Chiang Mai Students").
- **How It Works Section:** Simple 3-step graphic: 1. Get Your Box. 2. Take The Exam. 3. Get Your Analysis Online.
- **Features Section:** Icons and short descriptions for features like "Leaderboard," "Weakness Analysis," and "Detailed Explanations."
- **Footer:** Contact info, Terms of Service, Privacy Policy.

#### Screen 2: Registration Page (Updated)

- **Form Fields:**
  - Unique Code
  - Full Name
  - School (Dropdown list)
  - Grade Level (Dropdown: M.4 / M.5 / M.6)
  - Email Address
  - Create Password
  - Confirm Password
- **Button:** "Create My Account".
- **Link:** "Already have an account? Login here".

#### Screen 3: Login Page

- **Form Fields:** Email Address, Password.
- **Link:** "Forgot Password?".
- **Button:** "Login".

#### Screen 4: Exam Answer Input Page

- **Layout:** Tabbed interface for "Physics," "Chemistry," "Biology."
- **Content per Tab:** A numbered list of questions with radio button options for answers (A, B, C, D, E).
- **Sticky Footer/Header:** A "Submit All Answers" button that is always visible.

#### Screen 5: Dashboard / Results Page (Updated V1.1)

- **Header:** Welcome message ("Hello, [Name]!") and Logout button.

- **Module 1: Overall Performance Summary**

  - Displays Total Score and Percentile Rank.
  - A chart (e.g., Doughnut or Bar chart) showing the score breakdown by subject.
  - Summary boxes: "Best Performing Subject: [Subject Name]" and "Subject to Improve: [Subject Name]".

- **Module 2: In-Depth Analysis & Recommendations**

  - **Layout:** A tabbed interface for "Physics," "Chemistry," "Biology."
  - **Content per Tab:**
    - **Subject Score:** "You scored [Score]/800 in this subject."
    - **Strong Topics:** A list of chapters/topics where the user performed well (e.g., "Kinematics: 8/10 correct").
    - **Topics for Improvement & Recommendations:**
      - Lists the weakest chapters first (e.g., "**Thermodynamics: 2/9 correct**").
      - **Recommendation Text:** "Based on your results, this should be your top priority. Review the fundamentals of..."

- **Module 3: Full Exam Review**
  - **Layout:** A list of all question numbers, each marked with a Correct (✅) or Incorrect (❌) icon.
  - **Interaction:** Clicking on any question expands a detailed view:
    - Displays the full `question_text` and `question_image`.
    - **Your Answer:** [The option the user chose].
    - **Correct Answer:** [The correct option].
    - **Thinking Process:** Displays the step-by-step guide from the `thinking_process` field in the database.
    - **Explanation:**
      - **If the user was correct:** Displays the detailed `explanation`.
      - **If the user was incorrect:**
        - **Why your choice was wrong:** Displays the `reason` from the `choice_logic` field for the user's specific incorrect answer.
        - **Common Misconception:** Displays the `misconception_tested` text.
        - Finally, shows the correct `explanation`.

### 2.3 Dentorium Camp Photo Gallery

**Purpose:** Showcase Dentorium camp photos to build trust and engagement, positioned after Testimonials section on the homepage.

**Component Specifications:**

#### Gallery Layout
```jsx
<PhotoGallery 
  images={campPhotos}
  title="Dentorium Camp - เตรียมตัวสู่ความสำเร็จ"
  layout="carousel" // or "grid"
  autoplay={true}
  interval={4000}
/>
```

**Visual Requirements:**
- **Desktop:** Carousel/slider with 3-4 images visible
- **Mobile:** Single image carousel with swipe gesture support
- Image optimization for fast loading (WebP format, lazy loading)
- Navigation arrows and dot indicators
- Smooth transition animations
- Image aspect ratio: 16:9 or 4:3 consistent

**Content Guidelines:**
- High-quality photos from actual Dentorium camp activities
- Students studying, group discussions, celebration moments
- Professional photography with proper lighting
- Alt text for accessibility describing each scene

**Positioning:**
- After Testimonials section on homepage
- Before final CTA section
- Full-width container with subtle background

**Implementation Notes:**
- Use Swiper.js or similar carousel library
- Implement image lazy loading for performance
- Add loading skeleton while images load
- Ensure responsive design across all devices
- Include caption overlay option for context

### 2.4 TBAT Scoring System (2400 Points)

**Purpose:** Implement the official TBAT scoring formula with 2400 total points distributed across three subjects.

**Scoring Formula:**
- **Total Points:** 2400
- **Physics:** 800 points (100 questions × 8 points each)
- **Chemistry:** 800 points (100 questions × 8 points each)
- **Biology:** 800 points (100 questions × 8 points each)

#### Score Display Components

```jsx
<TBATScoreDisplay 
  scores={{
    physics: { correct: 75, total: 100, points: 600 },
    chemistry: { correct: 80, total: 100, points: 640 },
    biology: { correct: 85, total: 100, points: 680 },
    totalPoints: 1920,
    maxPoints: 2400,
    percentile: 75
  }}
  showBreakdown={userTier === 'ADVANCED'}
/>
```

#### Visual Requirements

**Score Summary Card:**
```jsx
<Card className="border-green-500 shadow-lg">
  <CardHeader>
    <CardTitle className="text-center">
      คะแนน TBAT ของคุณ
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-center mb-6">
      <div className="text-4xl font-bold text-green-600">
        1,920 / 2,400
      </div>
      <div className="text-lg text-gray-600">
        80.0% - อันดับ Top 25%
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-medium">🔵 ฟิสิกส์</span>
        <div className="text-right">
          <div className="font-bold">600/800</div>
          <div className="text-sm text-gray-500">75 ข้อถูก</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="font-medium">🟢 เคมี</span>
        <div className="text-right">
          <div className="font-bold">640/800</div>
          <div className="text-sm text-gray-500">80 ข้อถูก</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="font-medium">🟠 ชีววิทยา</span>
        <div className="text-right">
          <div className="font-bold">680/800</div>
          <div className="text-sm text-gray-500">85 ข้อถูก</div>
        </div>
      </div>
    </div>
    
    <Progress value={80} className="mt-4" />
  </CardContent>
</Card>
```

#### Implementation Requirements

1. **Score Calculation:**
   ```typescript
   const calculateTBATScore = (answers: ExamAnswers) => {
     const subjectScores = {
       physics: calculateSubjectScore(answers.physics, 800),
       chemistry: calculateSubjectScore(answers.chemistry, 800),
       biology: calculateSubjectScore(answers.biology, 800)
     };
     
     return {
       ...subjectScores,
       total: subjectScores.physics.points + 
              subjectScores.chemistry.points + 
              subjectScores.biology.points,
       percentage: (total / 2400) * 100
     };
   };
   ```

2. **Display Logic:**
   - Free Tier: Show total score and basic breakdown
   - Advanced Package: Show detailed analysis and percentile ranking
   - Historical comparison for repeat exam takers

3. **Visual Enhancements:**
   - Color-coded subjects (Physics: Blue, Chemistry: Green, Biology: Orange)
   - Progress bars for each subject
   - Animated score counting on results reveal
   - Responsive design for mobile viewing

4. **Data Storage:**
   ```typescript
   interface TBATScore {
     examId: string;
     userId: string;
     physics: SubjectScore;
     chemistry: SubjectScore;
     biology: SubjectScore;
     totalPoints: number;
     percentage: number;
     percentileRank?: number;
     examDate: Date;
   }
   
   interface SubjectScore {
     correctAnswers: number;
     totalQuestions: number;
     points: number;
     topics: TopicScore[];
   }
   ```

#### Integration Points

- Replace existing percentage-based scoring in results components
- Update Box Plot visualization to use 2400-point scale
- Integrate with Advanced Package analytics features
- Update admin panel to display TBAT-compliant scores
- Ensure compatibility with post-exam upgrade flow
