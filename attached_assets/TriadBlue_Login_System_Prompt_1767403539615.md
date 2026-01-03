# TriadBlue.com Login System - Replit Builder Agent Prompt

## Project Overview
Update the TriadBlue.com homepage to implement a dropdown login system that allows users to select which operational tool they want to access: LINKBlue Dashboard or ConsoleBlue Panel. Each tool will have its own dedicated login page with separate authentication.

## Current State
- Homepage has a button labeled "Login to ConsoleBlue Dashboard"
- Single login flow

## Required Changes

### 1. HOMEPAGE LOGIN BUTTON UPDATE

**Replace Current Button**
- Remove: "Login to ConsoleBlue Dashboard" button
- Add: "Login" button with dropdown menu

**Dropdown Menu Implementation**
When user clicks "Login" button, show dropdown with two options:
1. **LINKBlue Dashboard** → redirects to `/linkblue/login`
2. **ConsoleBlue Panel** → redirects to `/consoleblue/login`

**UI/UX Requirements**
- Clean, professional dropdown styling matching TriadBlue brand
- Dropdown appears on click (not hover for mobile compatibility)
- Clear visual distinction between the two options
- Brief description under each option (optional but recommended):
  - LINKBlue Dashboard: "Monitor all platforms"
  - ConsoleBlue Panel: "Build & configure apps"
- Dropdown closes when clicking outside of it
- Keyboard accessible (can navigate with arrow keys)

**Button Placement**
- Maintain current button position on homepage
- Desktop: Top right navigation area
- Mobile: Accessible in mobile menu

**Visual Design**
- Button style: Match existing TriadBlue button design
- Dropdown: Clean, modern design with:
  - Subtle drop shadow
  - Smooth animation on open/close
  - Hover states for each option
  - Clear text hierarchy
  - Icons (optional): Chain link icon for LINKBlue, tools/gear icon for ConsoleBlue

### 2. LINKBLUE LOGIN PAGE

**URL**: `triadblue.com/linkblue/login`

**Page Layout**
- Clean, centered login form
- LINKBlue logo/branding (chain link logo)
- Page title: "LINKBlue Dashboard Login"
- Subtitle: "Access your cross-platform operations center"

**Login Form Fields**
- Email address (required)
- Password (required)
- "Remember me" checkbox (optional)
- "Forgot password?" link

**Authentication**
- Secure authentication system
- Session management
- Password validation
- Account lockout after failed attempts (security)
- Error messages for invalid credentials

**Post-Login Redirect**
- After successful login → `/linkblue` (LINKBlue Dashboard home)
- If session expired → Return to `/linkblue/login` with message

**Additional Elements**
- Link back to TriadBlue.com homepage
- "Need access? Contact admin" message for new users
- Loading state during authentication

### 3. CONSOLEBLUE LOGIN PAGE

**URL**: `triadblue.com/consoleblue/login`

**Page Layout**
- Clean, centered login form
- ConsoleBlue branding
- Page title: "ConsoleBlue Panel Login"
- Subtitle: "Access your app development center"

**Login Form Fields**
- Email address (required)
- Password (required)
- "Remember me" checkbox (optional)
- "Forgot password?" link

**Authentication**
- Separate authentication from LINKBlue (different access permissions)
- Secure session management
- Password validation
- Account lockout after failed attempts
- Error messages for invalid credentials

**Post-Login Redirect**
- After successful login → `/consoleblue` (ConsoleBlue Panel home)
- If session expired → Return to `/consoleblue/login` with message

**Additional Elements**
- Link back to TriadBlue.com homepage
- "Need access? Contact admin" message
- Loading state during authentication

### 4. AUTHENTICATION & SECURITY REQUIREMENTS

**Separate Authentication Systems**
- LINKBlue and ConsoleBlue have separate user accounts and permissions
- User may have access to one, both, or neither
- Different session tokens for each system
- Independent authentication flows

**Security Features**
- HTTPS required for all login pages
- Password requirements:
  - Minimum 12 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Passwords hashed with bcrypt or similar
- CSRF protection
- Rate limiting on login attempts
- Session timeout (configurable, default 24 hours)
- Secure session cookies (httpOnly, secure, sameSite)

**Failed Login Handling**
- After 5 failed attempts: Account temporarily locked (15 minutes)
- Clear error messages without revealing whether email exists
- Log all failed login attempts for security monitoring

**Password Reset Flow**
- "Forgot password?" sends reset link to email
- Reset link expires after 1 hour
- Reset link can only be used once
- Separate reset flows for LINKBlue and ConsoleBlue

### 5. USER MANAGEMENT & PERMISSIONS

**Admin User Accounts**
- Initially: Single super admin account (you)
- Future: Multiple admin accounts with role-based permissions

**Access Levels** (for future implementation)
- **Super Admin**: Access to both LINKBlue and ConsoleBlue
- **Operations Manager**: Access to LINKBlue only
- **Developer**: Access to ConsoleBlue only
- **Read-Only**: View-only access to LINKBlue

**User Account Storage**
Database tables needed:
- `admin_users` table:
  - user_id (primary key)
  - email (unique)
  - password_hash
  - linkblue_access (boolean)
  - consoleblue_access (boolean)
  - created_at
  - last_login
  - account_locked (boolean)
  - failed_login_attempts (integer)
  - last_failed_login

- `admin_sessions` table:
  - session_id (primary key)
  - user_id (foreign key)
  - platform (linkblue or consoleblue)
  - created_at
  - expires_at
  - ip_address
  - user_agent

### 6. NAVIGATION POST-LOGIN

**LINKBlue Dashboard Navigation**
After login, user should see:
- Top navigation with logout button
- User email/name displayed
- Option to switch to ConsoleBlue (if user has access)
- Clear indication they're in "LINKBlue Dashboard"

**ConsoleBlue Panel Navigation**
After login, user should see:
- Top navigation with logout button
- User email/name displayed
- Option to switch to LINKBlue (if user has access)
- Clear indication they're in "ConsoleBlue Panel"

**Cross-Platform Switching**
If user has access to both:
- Show platform switcher in top nav
- "Switch to LINKBlue" / "Switch to ConsoleBlue"
- Seamless switching without additional login (if both sessions valid)

### 7. RESPONSIVE DESIGN

**Desktop (1200px+)**
- Dropdown menu appears below button
- Login forms centered with generous whitespace
- Full logo and branding visible

**Tablet (768px - 1199px)**
- Dropdown menu adapts to screen size
- Login forms remain centered
- Slightly reduced spacing

**Mobile (< 768px)**
- Dropdown menu full-width or slides from side
- Login forms optimized for mobile input
- Large touch targets for buttons
- Keyboard-friendly input fields

### 8. IMPLEMENTATION DETAILS

**Technology Stack**
- Frontend: React, Next.js, or similar modern framework
- Backend: Node.js/Express, Python/Flask, or similar
- Database: PostgreSQL or MySQL for user accounts
- Session Management: JWT tokens or secure session cookies
- Password Hashing: bcrypt
- Email Service: For password reset emails

**Environment Variables**
- `LINKBLUE_SESSION_SECRET`
- `CONSOLEBLUE_SESSION_SECRET`
- `SESSION_TIMEOUT_HOURS`
- `PASSWORD_RESET_TOKEN_EXPIRY`
- `EMAIL_SERVICE_API_KEY` (for password reset emails)

**File Structure Example**
```
/pages
  /linkblue
    login.js
    index.js (dashboard home)
  /consoleblue
    login.js
    index.js (panel home)
  index.js (homepage)

/components
  /auth
    LoginForm.js
    PasswordReset.js
  /navigation
    LoginDropdown.js
    AdminNav.js

/api
  /auth
    linkblue-login.js
    consoleblue-login.js
    logout.js
    password-reset.js
    verify-session.js

/middleware
  auth-linkblue.js
  auth-consoleblue.js
  rate-limiter.js
```

### 9. TESTING REQUIREMENTS

**Functional Testing**
- Dropdown opens and closes correctly
- Both login pages load properly
- Authentication works for both systems
- Password reset flow works
- Failed login lockout works
- Session timeout works
- Logout works from both platforms

**Security Testing**
- SQL injection attempts blocked
- XSS attempts blocked
- CSRF protection works
- Rate limiting prevents brute force
- Sessions are secure
- Passwords are properly hashed

**User Experience Testing**
- Mobile-friendly (test on actual devices)
- Keyboard navigation works
- Screen reader compatible
- Fast load times
- Clear error messages

### 10. SUCCESS CRITERIA

- [x] Homepage "Login" button has functional dropdown
- [x] Dropdown shows LINKBlue Dashboard and ConsoleBlue Panel options
- [x] LINKBlue login page is accessible at `/linkblue/login`
- [x] ConsoleBlue login page is accessible at `/consoleblue/login`
- [x] Both login systems authenticate correctly
- [x] Successful login redirects to correct dashboard/panel
- [x] Sessions are secure and expire appropriately
- [x] Password reset flow works for both systems
- [x] Failed login attempts are tracked and accounts lock after 5 attempts
- [x] Mobile-responsive design works flawlessly
- [x] Navigation post-login is clear and intuitive
- [x] Users can access both platforms if they have permissions

## Visual Design Mockup Description

**Homepage Login Dropdown**
```
┌─────────────────────────────────────┐
│  TriadBlue.com Header               │
│                         [ Login ▼ ] │ ← Button
└─────────────────────────────────────┘
                              ┌───────────────────────────┐
                              │ 🔗 LINKBlue Dashboard    │
                              │    Monitor all platforms  │
                              ├───────────────────────────┤
                              │ 🔧 ConsoleBlue Panel     │
                              │    Build & configure apps │
                              └───────────────────────────┘
```

**LINKBlue Login Page**
```
┌─────────────────────────────────────────────┐
│         [LINKBlue Chain Link Logo]          │
│                                             │
│        LINKBlue Dashboard Login             │
│   Access your cross-platform operations     │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Email Address                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Password                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ☐ Remember me      Forgot password?       │
│                                             │
│         [ Login to LINKBlue ]               │
│                                             │
│        ← Back to TriadBlue.com              │
└─────────────────────────────────────────────┘
```

**ConsoleBlue Login Page**
```
┌─────────────────────────────────────────────┐
│         [ConsoleBlue Tools Logo]            │
│                                             │
│         ConsoleBlue Panel Login             │
│      Access your app development center     │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Email Address                       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Password                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ☐ Remember me      Forgot password?       │
│                                             │
│         [ Login to ConsoleBlue ]            │
│                                             │
│        ← Back to TriadBlue.com              │
└─────────────────────────────────────────────┘
```

## Notes for Replit Builder Agent

- This is a production authentication system - security is paramount
- Keep UI clean and professional (executive/enterprise aesthetic)
- Ensure all security best practices are followed
- Make sure sessions are properly managed across both platforms
- Test thoroughly on mobile devices
- Include inline code comments for authentication logic
- Use environment variables for all secrets
- Implement proper logging for security events
- Consider future expansion: might add more platforms/tools later
- Build with accessibility in mind (WCAG 2.1 AA)
- Ensure smooth UX - no jarring transitions or slow load times

## Priority Items

**Must Have (Phase 1)**
- Dropdown menu on homepage
- Both login pages functional
- Basic authentication working
- Secure password handling
- Session management

**Should Have (Phase 2)**
- Password reset functionality
- Account lockout after failed attempts
- Cross-platform switching for users with access to both
- Mobile optimization

**Nice to Have (Phase 3)**
- Two-factor authentication
- Login activity history
- IP-based security alerts
- Customizable session timeouts per user
