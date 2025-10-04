# Content Generator - Test Plan

## Test Environment Setup

### Prerequisites
1. Firebase project configured
2. Gemini API key set in Firebase Functions environment
3. Stripe configured for subscription management
4. Test users created (one free, one pro)

### Test Data
```javascript
// Free User
{
  uid: 'test-free-user',
  email: 'free@test.com',
  subscription: { tier: 'free', status: 'active' }
}

// Pro User
{
  uid: 'test-pro-user',
  email: 'pro@test.com',
  subscription: { tier: 'pro', status: 'active' }
}
```

## Test Cases

### 1. Authentication Tests

#### TC-1.1: Unauthenticated Access
- **Action**: Navigate to `/content-generator` without logging in
- **Expected**: Redirect to `/auth` page
- **Status**: ⬜ Not Tested

#### TC-1.2: Authenticated Access
- **Action**: Login and navigate to `/content-generator`
- **Expected**: Page loads successfully with form
- **Status**: ⬜ Not Tested

### 2. Free Tier Tests

#### TC-2.1: Usage Display
- **Action**: Login as free user, view usage stats
- **Expected**: Shows "X/10" generations, progress bar visible
- **Status**: ⬜ Not Tested

#### TC-2.2: Content Length Restriction
- **Action**: Try to select "Medium" or "Long" content length
- **Expected**: Dropdown is disabled, only "Short" available
- **Status**: ⬜ Not Tested

#### TC-2.3: First Generation
- **Action**: Generate content with valid topic
- **Expected**: Content generated successfully, usage increments to 1/10
- **Status**: ⬜ Not Tested

#### TC-2.4: Multiple Generations
- **Action**: Generate content 9 more times (total 10)
- **Expected**: All succeed, usage shows 10/10, progress bar at 100%
- **Status**: ⬜ Not Tested

#### TC-2.5: Limit Exceeded
- **Action**: Try to generate 11th content
- **Expected**: Upgrade modal appears, generation blocked
- **Status**: ⬜ Not Tested

#### TC-2.6: Upgrade Modal
- **Action**: Click "Upgrade Now" in modal
- **Expected**: Redirect to `/pricing` page
- **Status**: ⬜ Not Tested

### 3. Pro Tier Tests

#### TC-3.1: Usage Display
- **Action**: Login as pro user, view usage stats
- **Expected**: Shows "X/∞" generations, no progress bar
- **Status**: ⬜ Not Tested

#### TC-3.2: Content Length Access
- **Action**: Check content length dropdown
- **Expected**: All options (Short, Medium, Long) available
- **Status**: ⬜ Not Tested

#### TC-3.3: Unlimited Generations
- **Action**: Generate content 15+ times
- **Expected**: All succeed, no limit warnings
- **Status**: ⬜ Not Tested

#### TC-3.4: SEO Tips Display
- **Action**: Generate blog post content
- **Expected**: SEO tips section visible in output
- **Status**: ⬜ Not Tested

### 4. Content Generation Tests

#### TC-4.1: Blog Post Generation
- **Action**: Select "Blog Post", enter topic, generate
- **Expected**: 
  - Title generated
  - Content with intro, sections, conclusion
  - Metadata (word count, reading time, keywords)
  - Content length matches selection
- **Status**: ⬜ Not Tested

#### TC-4.2: Social Media Post - Twitter
- **Action**: Select "Social Media", platform "Twitter", generate
- **Expected**:
  - Content under 280 characters
  - Hashtags included
  - Emojis included (if enabled)
- **Status**: ⬜ Not Tested

#### TC-4.3: Social Media Post - LinkedIn
- **Action**: Select "Social Media", platform "LinkedIn", generate
- **Expected**:
  - Professional tone
  - Longer format (1-2 paragraphs)
  - Relevant hashtags
- **Status**: ⬜ Not Tested

#### TC-4.4: Email Template - Marketing
- **Action**: Select "Email Template", purpose "Marketing", generate
- **Expected**:
  - Subject line generated
  - Professional email body
  - Call-to-action included
- **Status**: ⬜ Not Tested

#### TC-4.5: Email Template - Welcome
- **Action**: Select "Email Template", purpose "Welcome", generate
- **Expected**:
  - Warm, welcoming tone
  - Onboarding-focused content
  - Clear next steps
- **Status**: ⬜ Not Tested

### 5. Multi-Language Tests

#### TC-5.1: Arabic Content
- **Action**: Select language "العربية", generate content
- **Expected**: Content generated in Arabic with proper RTL formatting
- **Status**: ⬜ Not Tested

#### TC-5.2: French Content
- **Action**: Select language "Français", generate content
- **Expected**: Content generated in French
- **Status**: ⬜ Not Tested

#### TC-5.3: Spanish Content
- **Action**: Select language "Español", generate content
- **Expected**: Content generated in Spanish
- **Status**: ⬜ Not Tested

### 6. Writing Style Tests

#### TC-6.1: Professional Style
- **Action**: Select "Professional" style, generate
- **Expected**: Formal, business-appropriate tone
- **Status**: ⬜ Not Tested

#### TC-6.2: Casual Style
- **Action**: Select "Casual" style, generate
- **Expected**: Relaxed, conversational tone
- **Status**: ⬜ Not Tested

#### TC-6.3: Creative Style
- **Action**: Select "Creative" style, generate
- **Expected**: Imaginative, engaging tone
- **Status**: ⬜ Not Tested

### 7. UI Interaction Tests

#### TC-7.1: Copy to Clipboard
- **Action**: Generate content, click "Copy" button
- **Expected**: Content copied, confirmation alert shown
- **Status**: ⬜ Not Tested

#### TC-7.2: Export Content
- **Action**: Generate content, click "Export" button
- **Expected**: Text file downloaded with content
- **Status**: ⬜ Not Tested

#### TC-7.3: Form Validation
- **Action**: Try to generate without entering topic
- **Expected**: Error message "Please enter a topic"
- **Status**: ⬜ Not Tested

#### TC-7.4: Loading State
- **Action**: Click generate, observe UI during generation
- **Expected**: 
  - Button shows "Generating..."
  - Loading spinner visible
  - Form disabled during generation
- **Status**: ⬜ Not Tested

### 8. Error Handling Tests

#### TC-8.1: Network Error
- **Action**: Disconnect network, try to generate
- **Expected**: Error message displayed, graceful failure
- **Status**: ⬜ Not Tested

#### TC-8.2: Invalid API Key
- **Action**: Use invalid Gemini API key
- **Expected**: Error message, user-friendly explanation
- **Status**: ⬜ Not Tested

#### TC-8.3: Firestore Permission Error
- **Action**: Simulate Firestore permission denial
- **Expected**: Error message, fallback behavior
- **Status**: ⬜ Not Tested

### 9. Usage Tracking Tests

#### TC-9.1: Usage Increment
- **Action**: Generate content, check Firestore
- **Expected**: 
  - `generationsThisMonth` incremented
  - `totalGenerations` incremented
  - `lastGeneration` timestamp updated
- **Status**: ⬜ Not Tested

#### TC-9.2: Monthly Reset
- **Action**: Simulate month change, check usage
- **Expected**: `generationsThisMonth` resets to 0
- **Status**: ⬜ Not Tested

#### TC-9.3: Generation Logging
- **Action**: Generate content, check `content_generations` collection
- **Expected**: New document created with metadata
- **Status**: ⬜ Not Tested

### 10. Integration Tests

#### TC-10.1: Subscription Upgrade Flow
- **Action**: 
  1. Login as free user
  2. Reach generation limit
  3. Click upgrade
  4. Complete Stripe checkout
  5. Return to content generator
- **Expected**: 
  - Usage shows unlimited
  - All features unlocked
  - Can generate immediately
- **Status**: ⬜ Not Tested

#### TC-10.2: Subscription Downgrade
- **Action**:
  1. Login as pro user
  2. Cancel subscription
  3. Wait for period end
  4. Try to generate content
- **Expected**:
  - Reverts to free tier limits
  - Usage capped at 10/month
  - Content length restricted
- **Status**: ⬜ Not Tested

## Performance Tests

### PT-1: Generation Speed
- **Metric**: Time from click to content display
- **Target**: < 5 seconds for short content
- **Status**: ⬜ Not Tested

### PT-2: Concurrent Users
- **Metric**: 10 users generating simultaneously
- **Target**: All succeed without errors
- **Status**: ⬜ Not Tested

### PT-3: Large Content Generation
- **Metric**: Generate "long" blog post (2500 words)
- **Target**: < 15 seconds
- **Status**: ⬜ Not Tested

## Security Tests

### ST-1: User Isolation
- **Action**: User A tries to access User B's usage stats
- **Expected**: Access denied, Firestore rules block
- **Status**: ⬜ Not Tested

### ST-2: Function Authentication
- **Action**: Call `generateContent` without auth token
- **Expected**: 401 Unauthenticated error
- **Status**: ⬜ Not Tested

### ST-3: Usage Manipulation
- **Action**: Try to manually reset usage counter
- **Expected**: Firestore rules prevent unauthorized writes
- **Status**: ⬜ Not Tested

## Accessibility Tests

### AT-1: Keyboard Navigation
- **Action**: Navigate entire form using only keyboard
- **Expected**: All elements accessible, logical tab order
- **Status**: ⬜ Not Tested

### AT-2: Screen Reader
- **Action**: Use screen reader to navigate page
- **Expected**: All labels and content properly announced
- **Status**: ⬜ Not Tested

### AT-3: Color Contrast
- **Action**: Check color contrast ratios
- **Expected**: WCAG AA compliance (4.5:1 minimum)
- **Status**: ⬜ Not Tested

## Browser Compatibility

### BC-1: Chrome
- **Status**: ⬜ Not Tested

### BC-2: Firefox
- **Status**: ⬜ Not Tested

### BC-3: Safari
- **Status**: ⬜ Not Tested

### BC-4: Edge
- **Status**: ⬜ Not Tested

### BC-5: Mobile Safari (iOS)
- **Status**: ⬜ Not Tested

### BC-6: Chrome Mobile (Android)
- **Status**: ⬜ Not Tested

## Test Execution

### Manual Testing Checklist
```bash
# 1. Setup test environment
cd packages/ui
pnpm install
pnpm run dev

# 2. Create test users in Firebase Console
# - free@test.com (no subscription)
# - pro@test.com (with active Pro subscription)

# 3. Run through test cases systematically
# - Mark each test as Pass ✅ or Fail ❌
# - Document any issues found

# 4. Test Cloud Function locally
cd services/firebase/functions
pnpm run serve

# 5. Deploy to staging environment
pnpm run deploy
```

### Automated Testing (Future)
```bash
# Unit tests
pnpm test

# E2E tests with Playwright
pnpm test:e2e

# Integration tests
pnpm test:integration
```

## Bug Report Template

```markdown
### Bug ID: BUG-XXX
**Title**: [Brief description]
**Severity**: Critical | High | Medium | Low
**Test Case**: TC-X.X
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Screenshots**: [If applicable]
**Environment**: 
- Browser: 
- OS: 
- User Type: Free/Pro
**Additional Notes**: [Any other relevant information]
```

## Test Sign-off

- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Known issues documented
- [ ] Performance benchmarks met
- [ ] Security tests passed
- [ ] Ready for production deployment

**Tested By**: _________________
**Date**: _________________
**Sign-off**: _________________
