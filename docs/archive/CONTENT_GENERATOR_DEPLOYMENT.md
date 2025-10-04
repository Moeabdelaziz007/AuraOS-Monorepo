# Content Generator MVP - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup

#### Required Tools
- [ ] Node.js 18+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Firebase project created
- [ ] Gemini API key obtained

#### Environment Variables

**Firebase Functions** (`services/firebase/functions/.env`):
```bash
GEMINI_API_KEY=your_gemini_api_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

**UI Package** (`packages/ui/.env`):
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_STRIPE_PRICE_ID_PRO_MONTHLY=price_xxx
VITE_STRIPE_PRICE_ID_PRO_YEARLY=price_xxx
```

### 2. Firestore Security Rules

Create/update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Usage subcollection
      match /usage/{document=**} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false; // Only Cloud Functions can write
      }
    }
    
    // Subscriptions collection
    match /subscriptions/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only Cloud Functions can write (via Stripe webhook)
    }
    
    // Content generations log
    match /content_generations/{generationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### 3. Firestore Indexes

Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "content_generations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Deployment Steps

### Step 1: Install Dependencies

```bash
# Root workspace
pnpm install

# Firebase Functions
cd services/firebase/functions
pnpm install

# UI Package
cd packages/ui
pnpm install

# Content Generator Package
cd packages/content-generator
pnpm install
```

### Step 2: Build Packages

```bash
# Build content-generator package
cd packages/content-generator
pnpm run build

# Build firebase package
cd packages/firebase
pnpm run build

# Build billing package
cd packages/billing
pnpm run build
```

### Step 3: Test Locally

#### Test Firebase Functions Locally
```bash
cd services/firebase/functions

# Build functions
pnpm run build

# Start emulators
firebase emulators:start --only functions,firestore

# In another terminal, test the function
curl -X POST http://localhost:5001/YOUR_PROJECT_ID/us-central1/generateContent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -d '{
    "userId": "test-user",
    "type": "blog_post",
    "topic": "AI in modern web development",
    "style": "professional",
    "length": "short",
    "language": "en"
  }'
```

#### Test UI Locally
```bash
cd packages/ui

# Start dev server
pnpm run dev

# Open browser to http://localhost:5173
# Test the following:
# 1. Login/signup flow
# 2. Navigate to /content-generator
# 3. Generate content (all types)
# 4. Test free tier limits
# 5. Test upgrade flow
```

### Step 4: Deploy Firebase Functions

```bash
cd services/firebase/functions

# Build
pnpm run build

# Deploy
firebase deploy --only functions

# Verify deployment
firebase functions:log --only generateContent
```

### Step 5: Deploy UI to Firebase Hosting

```bash
cd packages/ui

# Build for production
pnpm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Get hosting URL
firebase hosting:channel:list
```

### Step 6: Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/stripeWebhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `.env`

### Step 7: Create Test Users

```bash
# Create free tier test user
firebase auth:import test-users.json

# Or manually in Firebase Console:
# 1. Go to Authentication
# 2. Add user: free@test.com
# 3. Add user: pro@test.com
# 4. For pro user, add subscription document in Firestore
```

## Post-Deployment Verification

### Functional Tests

#### Test 1: Free User Flow
```bash
# 1. Login as free@test.com
# 2. Navigate to /content-generator
# 3. Verify usage shows 0/10
# 4. Generate short blog post
# 5. Verify content generated successfully
# 6. Verify usage incremented to 1/10
# 7. Try to select "medium" length - should be disabled
# 8. Generate 9 more times
# 9. Verify usage shows 10/10
# 10. Try to generate 11th time - should show upgrade modal
```

#### Test 2: Pro User Flow
```bash
# 1. Login as pro@test.com
# 2. Navigate to /content-generator
# 3. Verify usage shows X/∞
# 4. Generate content with "long" length
# 5. Verify SEO tips are displayed
# 6. Generate 15+ times
# 7. Verify no limits enforced
```

#### Test 3: Content Types
```bash
# Test each content type:
# 1. Blog Post - verify title, sections, conclusion
# 2. Social Media (Twitter) - verify < 280 chars, hashtags
# 3. Social Media (LinkedIn) - verify professional tone
# 4. Email (Marketing) - verify subject, CTA
# 5. Email (Welcome) - verify warm tone
```

#### Test 4: Multi-Language
```bash
# 1. Generate content in Arabic
# 2. Generate content in French
# 3. Generate content in Spanish
# 4. Verify proper language output
```

### Performance Tests

```bash
# Test 1: Generation Speed
# - Measure time from click to content display
# - Target: < 5 seconds for short content

# Test 2: Concurrent Users
# - Simulate 10 users generating simultaneously
# - Verify all succeed without errors

# Test 3: Large Content
# - Generate "long" blog post (2500 words)
# - Target: < 15 seconds
```

### Security Tests

```bash
# Test 1: Unauthenticated Access
curl -X POST https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/generateContent \
  -H "Content-Type: application/json" \
  -d '{"type": "blog_post", "topic": "test"}'
# Expected: 401 Unauthenticated

# Test 2: Usage Limit Bypass Attempt
# Try to manually reset usage counter in Firestore
# Expected: Permission denied

# Test 3: Cross-User Access
# User A tries to read User B's usage stats
# Expected: Permission denied
```

## Monitoring and Logging

### Firebase Console Monitoring

1. **Functions Logs**
   ```bash
   firebase functions:log --only generateContent
   ```

2. **Firestore Usage**
   - Monitor read/write operations
   - Check for quota limits

3. **Authentication**
   - Monitor user signups
   - Check for suspicious activity

### Gemini API Monitoring

1. Go to Google Cloud Console
2. Navigate to APIs & Services → Gemini API
3. Monitor:
   - Request count
   - Error rate
   - Quota usage

### Stripe Dashboard

1. Monitor subscription events
2. Check webhook delivery status
3. Review payment success/failure rates

## Rollback Plan

If issues are detected:

### Rollback Functions
```bash
# List function versions
firebase functions:list

# Rollback to previous version
firebase functions:rollback generateContent --version VERSION_NUMBER
```

### Rollback Hosting
```bash
# List hosting releases
firebase hosting:channel:list

# Rollback to previous release
firebase hosting:rollback
```

### Emergency Disable
```bash
# Disable function temporarily
firebase functions:config:unset gemini.api_key
firebase deploy --only functions
```

## Troubleshooting

### Issue: Function Timeout
**Symptom**: Requests taking > 60 seconds
**Solution**: 
```javascript
// In content-generator.ts
export const generateContent = functions
  .runWith({ timeoutSeconds: 120 })
  .https.onCall(async (data, context) => {
    // ...
  });
```

### Issue: Gemini API Rate Limit
**Symptom**: 429 Too Many Requests
**Solution**:
- Implement exponential backoff
- Add request queuing
- Upgrade Gemini API tier

### Issue: Firestore Write Limit
**Symptom**: Usage stats not updating
**Solution**:
- Batch writes
- Use transactions
- Implement write caching

### Issue: CORS Errors
**Symptom**: UI can't call functions
**Solution**:
```javascript
// In functions/src/index.ts
import * as cors from 'cors';
const corsHandler = cors({ origin: true });
```

## Success Metrics

Track these metrics post-deployment:

1. **User Engagement**
   - Daily active users
   - Generations per user
   - Content type distribution

2. **Conversion Rate**
   - Free to Pro upgrade rate
   - Time to first upgrade
   - Churn rate

3. **Technical Performance**
   - Average generation time
   - Error rate
   - Function cold start time

4. **Business Metrics**
   - Monthly recurring revenue (MRR)
   - Customer acquisition cost (CAC)
   - Lifetime value (LTV)

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Check logs every 2 hours
   - Respond to any errors immediately

2. **Gather User Feedback**
   - Add feedback form
   - Monitor support tickets
   - Track feature requests

3. **Optimize Performance**
   - Analyze slow queries
   - Optimize Gemini prompts
   - Implement caching

4. **Plan Next Features**
   - Content history/library
   - Content templates
   - Batch generation
   - API access for Pro users

## Support Contacts

- **Firebase Support**: https://firebase.google.com/support
- **Gemini API Support**: https://ai.google.dev/support
- **Stripe Support**: https://support.stripe.com

## Deployment Checklist

- [ ] All environment variables set
- [ ] Firestore rules deployed
- [ ] Firestore indexes created
- [ ] Firebase Functions deployed
- [ ] UI built and deployed to hosting
- [ ] Stripe webhooks configured
- [ ] Test users created
- [ ] Free user flow tested
- [ ] Pro user flow tested
- [ ] All content types tested
- [ ] Multi-language tested
- [ ] Performance benchmarks met
- [ ] Security tests passed
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Team notified of deployment

**Deployed By**: _________________
**Date**: _________________
**Version**: _________________
**Sign-off**: _________________
