# 🧪 End-to-End Authentication Test Plan

## Overview

Comprehensive end-to-end testing plan for the AuraOS authentication flow.

**Status:** 📋 Test Plan Ready  
**Priority:** High  
**Estimated Time:** 2-3 hours

---

## 🎯 Test Objectives

1. Verify complete authentication flow from login to protected routes
2. Ensure proper user profile creation and loading
3. Validate session persistence across page refreshes
4. Test all authentication methods (email, Google, guest)
5. Verify proper error handling and user feedback

---

## 🔧 Test Environment Setup

### Prerequisites:
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Add Firebase credentials

# 3. Start development server
cd apps/landing-page
npm run dev

# 4. Open browser to http://localhost:5173
```

### Required Tools:
- ✅ Browser DevTools (Console, Network, Application tabs)
- ✅ Firebase Console access
- ✅ Firestore database access
- ✅ Test user accounts

---

## 📝 Test Scenarios

### Scenario 1: Email/Password Sign Up

**Steps:**
1. Navigate to `/auth`
2. Click "Sign Up" tab
3. Enter:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "TestPass123!"
4. Click "Sign Up" button

**Expected Results:**
- ✅ Loading indicator appears
- ✅ User is created in Firebase Auth
- ✅ User profile is created in Firestore
- ✅ User is redirected to `/desktop`
- ✅ User session is active
- ✅ No console errors

**Verification:**
```javascript
// Check in browser console
console.log('User:', auth.currentUser);
console.log('Profile:', userProfile);

// Check in Firestore
// Navigate to users/{uid} and verify:
// - uid matches
// - email is correct
// - displayName is set
// - createdAt timestamp exists
// - lastLogin timestamp exists
```

---

### Scenario 2: Email/Password Sign In

**Steps:**
1. Navigate to `/auth`
2. Ensure "Sign In" tab is active
3. Enter:
   - Email: "test@example.com"
   - Password: "TestPass123!"
4. Click "Sign In" button

**Expected Results:**
- ✅ Loading indicator appears
- ✅ User is authenticated
- ✅ User profile is loaded from Firestore
- ✅ lastLogin timestamp is updated
- ✅ User is redirected to `/desktop`
- ✅ User session is active
- ✅ No console errors

**Verification:**
```javascript
// Check in browser console
console.log('User:', auth.currentUser);
console.log('Profile:', userProfile);
console.log('Last Login:', userProfile.lastLogin);

// Verify lastLogin was updated in Firestore
```

---

### Scenario 3: Google Sign-In

**Steps:**
1. Navigate to `/auth`
2. Click "Sign in with Google" button
3. Complete Google OAuth flow
4. Grant permissions

**Expected Results:**
- ✅ Google popup opens
- ✅ User selects Google account
- ✅ User is authenticated
- ✅ User profile is created/updated in Firestore
- ✅ User is redirected to `/desktop`
- ✅ User session is active
- ✅ No console errors

**Verification:**
```javascript
// Check in browser console
console.log('User:', auth.currentUser);
console.log('Provider:', auth.currentUser.providerData);
console.log('Profile:', userProfile);

// Verify Google provider data is present
```

---

### Scenario 4: Guest Sign-In

**Steps:**
1. Navigate to `/auth`
2. Click "Continue as Guest" button

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Guest account is created automatically
- ✅ Guest profile is created in Firestore with `isGuest: true`
- ✅ User is redirected to `/desktop`
- ✅ User session is active
- ✅ Guest email format: `guest_[timestamp]@auraos.local`
- ✅ Guest name format: `Guest_[last4digits]`
- ✅ No console errors

**Verification:**
```javascript
// Check in browser console
console.log('User:', auth.currentUser);
console.log('Profile:', userProfile);
console.log('Is Guest:', userProfile.isGuest);

// Verify guest flag in Firestore
```

---

### Scenario 5: Protected Route Access

**Steps:**
1. Ensure user is NOT logged in
2. Navigate directly to `/desktop`

**Expected Results:**
- ✅ User is redirected to `/auth`
- ✅ Original URL is preserved in location state
- ✅ After login, user is redirected back to `/desktop`
- ✅ No console errors

**Verification:**
```javascript
// Check in browser console
console.log('Location:', window.location);
console.log('State:', history.state);
```

---

### Scenario 6: Session Persistence

**Steps:**
1. Log in with any method
2. Navigate to `/desktop`
3. Refresh the page (F5)
4. Wait for auth state to load

**Expected Results:**
- ✅ Loading indicator appears briefly
- ✅ User remains logged in
- ✅ User profile is loaded
- ✅ User stays on `/desktop`
- ✅ No redirect to `/auth`
- ✅ No console errors

**Verification:**
```javascript
// Check in browser console after refresh
console.log('User:', auth.currentUser);
console.log('Profile:', userProfile);
console.log('Loading:', loading);
```

---

### Scenario 7: Logout

**Steps:**
1. Ensure user is logged in
2. Navigate to `/desktop`
3. Click logout button (if available) or call logout programmatically

**Expected Results:**
- ✅ User is signed out from Firebase
- ✅ User profile is cleared
- ✅ User is redirected to `/auth`
- ✅ Session is terminated
- ✅ No console errors

**Verification:**
```javascript
// Check in browser console
console.log('User:', auth.currentUser); // Should be null
console.log('Profile:', userProfile); // Should be null

// Try to access protected route
// Should redirect to /auth
```

---

### Scenario 8: Invalid Credentials

**Steps:**
1. Navigate to `/auth`
2. Enter:
   - Email: "wrong@example.com"
   - Password: "WrongPassword"
3. Click "Sign In" button

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Error message is displayed
- ✅ Error message is user-friendly
- ✅ User remains on `/auth`
- ✅ Form is still usable
- ✅ No console errors (except expected auth error)

**Verification:**
```javascript
// Check error message displayed to user
// Should show: "Invalid email or password" or similar
```

---

### Scenario 9: Weak Password

**Steps:**
1. Navigate to `/auth`
2. Click "Sign Up" tab
3. Enter:
   - Name: "Test User"
   - Email: "newuser@example.com"
   - Password: "123" (weak password)
4. Click "Sign Up" button

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Error message is displayed
- ✅ Error explains password requirements
- ✅ User remains on `/auth`
- ✅ Form is still usable
- ✅ No console errors (except expected validation error)

**Verification:**
```javascript
// Check error message
// Should mention password requirements
```

---

### Scenario 10: Duplicate Email

**Steps:**
1. Navigate to `/auth`
2. Click "Sign Up" tab
3. Enter email that already exists
4. Click "Sign Up" button

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Error message is displayed
- ✅ Error indicates email is already in use
- ✅ User remains on `/auth`
- ✅ Suggestion to sign in instead
- ✅ No console errors (except expected auth error)

---

### Scenario 11: Network Failure

**Steps:**
1. Open DevTools > Network tab
2. Enable "Offline" mode
3. Try to sign in

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Error message is displayed
- ✅ Error indicates network issue
- ✅ User remains on `/auth`
- ✅ Retry option available
- ✅ Appropriate console error

**Verification:**
```javascript
// Check error handling
// Should gracefully handle network errors
```

---

### Scenario 12: Profile Update

**Steps:**
1. Log in successfully
2. Navigate to profile settings
3. Update display name
4. Save changes

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Profile is updated in Firestore
- ✅ UI reflects new display name
- ✅ Success message is shown
- ✅ No console errors

**Verification:**
```javascript
// Check in browser console
console.log('Updated Profile:', userProfile);

// Verify in Firestore
// Check users/{uid} for updated displayName
```

---

## 🔍 Manual Testing Checklist

### Before Testing:
- [ ] Clear browser cache and cookies
- [ ] Clear localStorage and sessionStorage
- [ ] Clear Firestore test data
- [ ] Verify Firebase config is correct
- [ ] Check environment variables

### During Testing:
- [ ] Monitor browser console for errors
- [ ] Check Network tab for failed requests
- [ ] Verify Firestore writes in Firebase Console
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile viewport
- [ ] Test with slow network (throttling)

### After Testing:
- [ ] Document any issues found
- [ ] Create bug reports for failures
- [ ] Update test plan with new scenarios
- [ ] Clean up test data

---

## 🐛 Common Issues to Watch For

### Issue 1: Redirect Loop
**Symptoms:** Page keeps redirecting between `/auth` and `/desktop`  
**Check:** AuthContext loading state, ProtectedRoute logic

### Issue 2: Profile Not Loading
**Symptoms:** User is authenticated but profile is null  
**Check:** Firestore permissions, loadUserProfile function

### Issue 3: Session Not Persisting
**Symptoms:** User is logged out after refresh  
**Check:** Firebase persistence settings, onAuthStateChanged listener

### Issue 4: Slow Initial Load
**Symptoms:** Long loading time on first visit  
**Check:** Firebase initialization, network requests

### Issue 5: Google Sign-In Popup Blocked
**Symptoms:** Google popup doesn't open  
**Check:** Browser popup blocker, CORS settings

---

## 📊 Test Results Template

```markdown
## Test Execution Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Dev/Staging/Prod]
**Browser:** [Chrome/Firefox/Safari]

### Results:

| Scenario | Status | Notes |
|----------|--------|-------|
| Email Sign Up | ✅ Pass | - |
| Email Sign In | ✅ Pass | - |
| Google Sign-In | ✅ Pass | - |
| Guest Sign-In | ✅ Pass | - |
| Protected Routes | ✅ Pass | - |
| Session Persistence | ✅ Pass | - |
| Logout | ✅ Pass | - |
| Invalid Credentials | ✅ Pass | - |
| Weak Password | ✅ Pass | - |
| Duplicate Email | ✅ Pass | - |
| Network Failure | ✅ Pass | - |
| Profile Update | ✅ Pass | - |

### Issues Found:
1. [Issue description]
2. [Issue description]

### Recommendations:
1. [Recommendation]
2. [Recommendation]
```

---

## 🚀 Automated E2E Tests (Future)

### Recommended Tools:
- **Cypress** - For comprehensive E2E testing
- **Playwright** - For cross-browser testing
- **Testing Library** - For component testing

### Sample Cypress Test:
```javascript
describe('Authentication Flow', () => {
  it('should sign up a new user', () => {
    cy.visit('/auth');
    cy.get('[data-testid="signup-tab"]').click();
    cy.get('[data-testid="name-input"]').type('Test User');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('TestPass123!');
    cy.get('[data-testid="signup-button"]').click();
    
    cy.url().should('include', '/desktop');
    cy.get('[data-testid="user-menu"]').should('contain', 'Test User');
  });
});
```

---

## ✅ Success Criteria

The authentication flow is considered successful when:

1. ✅ All 12 test scenarios pass
2. ✅ No console errors during normal flow
3. ✅ User profiles are correctly created/updated in Firestore
4. ✅ Sessions persist across page refreshes
5. ✅ Error messages are user-friendly and helpful
6. ✅ Loading states are properly displayed
7. ✅ Redirects work as expected
8. ✅ All authentication methods work (email, Google, guest)
9. ✅ Protected routes are properly secured
10. ✅ Logout clears session completely

---

## 📝 Notes

- Test with real Firebase project, not emulator
- Use test accounts, not production accounts
- Document any edge cases discovered
- Update test plan as features evolve
- Consider adding automated tests for regression prevention

---

**Created:** 2025-10-03  
**Author:** Ona AI Assistant  
**Status:** 📋 Ready for Execution
