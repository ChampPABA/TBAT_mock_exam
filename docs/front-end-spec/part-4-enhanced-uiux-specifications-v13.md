# Part 4: Enhanced UI/UX Specifications (v1.3)

### 4.1 Form Validation & Error Handling

#### Registration Form Validation
- **Unique Code:** Real-time validation after 3 characters typed -> "Checking..." -> ✅ "Valid code" or ❌ "Invalid code - Please check your box"
- **Email:** Format validation on blur -> Pattern: valid email format
- **Password:** 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number
  - Real-time strength indicator (Weak/Medium/Strong)
- **Confirm Password:** Real-time match validation
- **School/Grade:** Required field validation

#### Login Form Validation
- **Email:** Format validation on blur
- **Password:** Required field validation
- **Failed Login:** Clear error message: "Invalid email or password. Please try again or reset your password."

#### Error Message Design Standards
- **Color:** Use semantic colors (red for errors, amber for warnings, green for success)
- **Position:** Inline below each field + summary at top for multiple errors
- **Tone:** Friendly and helpful, not accusatory
- **Actionable:** Always provide next steps or solutions

### 4.2 Loading States & Feedback

#### Loading Indicators
- **Form Submissions:** Button text changes to "Processing..." with spinner
- **Data Loading:** Skeleton screens for dashboard components
- **Image Loading:** Placeholder with loading animation for question images
- **Network Delays:** Progress indicators for longer operations (>2 seconds)

#### Success Feedback
- **Registration Success:** Modal with celebration animation
- **Login Success:** Smooth transition with welcome message
- **Form Saves:** Toast notifications for auto-saves
- **Submission Complete:** Confirmation screen with next steps

### 4.3 Error Recovery

#### Network Issues
- **Offline Detection:** "You appear to be offline" banner
- **Auto-Retry:** Automatic retry for failed requests (3 attempts)
- **Manual Retry:** "Try Again" buttons for failed operations
- **Cached Data:** Show last known data when possible

#### Session Management
- **Session Timeout Warning:** 5-minute warning modal with extend option
- **Auto-Logout:** Clear session data and redirect to login
- **Session Recovery:** Attempt to restore user state after re-login

### 4.4 Data Visualization Components

#### Box Plot Visualization for Score Distribution

**Purpose:** Replace existing bar chart with box plot visualization to show score distribution with clear Min, Max, Mean, and user's position.

**Component Specifications:**

```jsx
<BoxPlotChart 
  data={{
    min: 45,
    q1: 65,
    median: 75,
    q3: 85,
    max: 98,
    userScore: 82,
    mean: 76.5
  }}
  subject="Physics"
  className="w-full h-64"
/>
```

**Visual Requirements:**
- Box plot with whiskers showing quartiles and outliers
- Clear "Your Score" pointer with distinctive color
- Display Min, Max, Mean values as labels
- Responsive design for mobile and desktop
- Subject-specific color coding (Physics: Blue, Chemistry: Green, Biology: Orange)
- Tooltip showing detailed statistics on hover

**Implementation Notes:**
- Use Recharts or D3.js for visualization
- Replace existing bar chart components in results display
- Remove social sharing functionality from chart area
- Ensure accessibility with proper ARIA labels
- Support both Free tier (basic view) and Advanced Package (detailed analysis)

**Box Plot Features:**
- **Free Tier:** Basic box plot with user score indicator
- **Advanced Package:** Detailed statistics, percentile information, historical trend overlay

### 4.5 Enhanced Authentication Modal with Role-Based Routing

**Purpose:** Unified login modal that detects user roles and routes accordingly, with enhanced security and UX improvements.

#### Modal Authentication Component

```jsx
<AuthModal 
  isOpen={showAuthModal}
  onClose={handleClose}
  defaultTab="login"
  redirectAfterLogin="auto" // auto-detect based on role
/>
```

**Enhanced Features:**

1. **Role Detection & Routing:**
   ```typescript
   const handleLoginSuccess = async (user: User) => {
     // Detect user role and route accordingly
     switch (user.role) {
       case 'ADMIN':
         router.push('/admin/dashboard');
         break;
       case 'STUDENT':
         router.push('/dashboard');
         break;
       case 'PARENT':
         router.push('/parent/overview');
         break;
       default:
         router.push('/dashboard');
     }
   };
   ```

2. **Forgot Password Integration:**
   ```jsx
   <div className="text-center mt-4">
     <Button 
       variant="link" 
       onClick={() => setActiveTab('forgot-password')}
       className="text-sm text-blue-600"
     >
       ลืมรหัสผ่าน?
     </Button>
   </div>
   ```

3. **Exam Code Timing Enhancement:**
   - Move exam code generation to post-registration
   - Display LINE QR code on registration success
   - Add mandatory group join messaging

4. **Visual Enhancements:**
   - Smooth tab transitions between Login/Register/Forgot Password
   - Loading states during authentication
   - Success animations for registration
   - Error handling with actionable recovery options

### 4.6 Protected Routes Implementation

**Purpose:** Comprehensive route protection system with role-based access control and seamless user experience.

#### Route Protection Architecture

```typescript
interface ProtectedRouteConfig {
  path: string;
  requiredRole?: UserRole;
  requiredTier?: UserTier;
  fallbackPath: string;
  showUpgradePrompt?: boolean;
}

const routeConfig: ProtectedRouteConfig[] = [
  {
    path: '/admin/*',
    requiredRole: 'ADMIN',
    fallbackPath: '/login',
  },
  {
    path: '/dashboard/analytics',
    requiredTier: 'ADVANCED',
    fallbackPath: '/dashboard',
    showUpgradePrompt: true,
  },
  {
    path: '/dashboard/export',
    requiredTier: 'ADVANCED',
    fallbackPath: '/dashboard',
    showUpgradePrompt: true,
  },
];
```

#### Implementation Components

1. **ProtectedRoute Wrapper:**
   ```jsx
   <ProtectedRoute 
     requiredRole="ADMIN"
     requiredTier="ADVANCED"
     fallback="/dashboard"
     showUpgradePrompt={true}
   >
     <AdminPanel />
   </ProtectedRoute>
   ```

2. **Route Guards:**
   ```typescript
   const useRouteGuard = (config: ProtectedRouteConfig) => {
     const { user, isLoading } = useAuth();
     const router = useRouter();
     
     useEffect(() => {
       if (!isLoading && !hasAccess(user, config)) {
         if (config.showUpgradePrompt) {
           showUpgradeModal();
         } else {
           router.replace(config.fallbackPath);
         }
       }
     }, [user, isLoading]);
   };
   ```

3. **Access Control Logic:**
   ```typescript
   const hasAccess = (user: User, config: ProtectedRouteConfig) => {
     // Check authentication
     if (!user) return false;
     
     // Check role requirement
     if (config.requiredRole && user.role !== config.requiredRole) {
       return false;
     }
     
     // Check tier requirement
     if (config.requiredTier && user.tier !== config.requiredTier) {
       return false;
     }
     
     return true;
   };
   ```

4. **Admin Panel Access Control:**
   ```jsx
   // Admin-only routes
   <ProtectedRoute requiredRole="ADMIN" fallback="/login">
     <AdminLayout>
       <Routes>
         <Route path="/admin/dashboard" element={<AdminDashboard />} />
         <Route path="/admin/users" element={<UserManagement />} />
         <Route path="/admin/answer-keys" element={<AnswerKeyManagement />} />
       </Routes>
     </AdminLayout>
   </ProtectedRoute>
   ```

5. **Tier-Based Feature Gating:**
   ```jsx
   // Advanced Package only features
   <ProtectedRoute 
     requiredTier="ADVANCED" 
     fallback="/dashboard"
     showUpgradePrompt={true}
   >
     <DetailedAnalytics />
   </ProtectedRoute>
   ```

#### Security Considerations

- Server-side validation of all protected routes
- JWT token validation on route access
- Automatic logout on token expiration
- CSRF protection for state-changing operations
- Rate limiting for authentication attempts

#### User Experience Features

- Seamless redirect after login based on intended destination
- "Return to where you left off" functionality
- Progress preservation during authentication flow
- Clear messaging for access denied scenarios
- Upgrade prompts integrated with route protection

---
