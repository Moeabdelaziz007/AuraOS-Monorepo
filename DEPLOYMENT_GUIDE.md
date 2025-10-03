# 🚀 AuraOS Deployment Guide

Complete guide for code review, merging, CI/CD setup, and production deployment.

**Status:** 📋 Ready to Execute  
**Last Updated:** October 3, 2025

---

## 📋 Quick Start

```bash
# 1. Review code and create PR
git push origin feature/meta-learning-autopilot
# Create PR on GitHub

# 2. After approval, merge to main
# Use GitHub UI to merge

# 3. Set up CI/CD
# Add .github/workflows/ci.yml (see below)

# 4. Deploy to production
npm run build
firebase deploy
```

---

## 1️⃣ Code Review & Pull Request

### Create Pull Request

1. **Push your branch:**
```bash
git push origin feature/meta-learning-autopilot
```

2. **Go to GitHub:**
   - Visit: https://github.com/Moeabdelaziz007/AuraOS-Monorepo
   - Click "Compare & pull request"
   - Fill in PR description (template below)

3. **PR Title:**
```
feat: add comprehensive test suite (400+ tests)
```

4. **PR Description:**
```markdown
## Summary
Added comprehensive test suite covering 6 packages with 400+ tests and 80%+ average coverage.

## Changes
- ✅ Billing tests (50+ tests, 80%+ coverage)
- ✅ Automation tests (40+ tests, 70%+ coverage)
- ✅ Content Generator tests (100+ tests, 85%+ coverage)
- ✅ Hooks tests (150+ tests, 85%+ coverage)
- ✅ Common tests (50+ tests, 90%+ coverage)
- ✅ Auth tests (20+ tests, 75%+ coverage)
- ✅ Documentation (TEST_SUMMARY.md, DEBUG_LOGIN_ISSUE.md, etc.)

## Testing
- [x] All tests passing
- [x] No TypeScript errors
- [x] Build succeeds

## Checklist
- [x] Tests added
- [x] Documentation updated
- [x] No breaking changes
```

---

## 2️⃣ Merge to Main

### Option A: GitHub UI (Recommended)

1. **Wait for approvals** (if team review required)
2. **Click "Squash and merge"** on GitHub
3. **Confirm merge**
4. **Delete branch** (optional)

### Option B: Command Line

```bash
# 1. Switch to main
git checkout main

# 2. Pull latest
git pull origin main

# 3. Merge feature branch
git merge --squash feature/meta-learning-autopilot

# 4. Commit
git commit -m "feat: add comprehensive test suite (400+ tests)"

# 5. Push
git push origin main

# 6. Delete feature branch
git branch -d feature/meta-learning-autopilot
git push origin --delete feature/meta-learning-autopilot
```

---

## 3️⃣ CI/CD Setup with GitHub Actions

### Step 1: Create Workflow File

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test & Build
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build

  deploy:
    name: Deploy to Firebase
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
```

### Step 2: Add GitHub Secrets

Go to: `Settings > Secrets and variables > Actions > New repository secret`

Add these secrets:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT` (JSON from Firebase Console)

### Step 3: Commit and Push

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow"
git push origin main
```

### Step 4: Verify

- Go to: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/actions
- Check that workflow runs successfully

---

## 4️⃣ Production Deployment

### Prerequisites

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Select project
firebase use --add
# Select your project and give it an alias (e.g., "production")
```

### Manual Deployment

```bash
# 1. Build the application
cd apps/landing-page
npm run build

# 2. Test locally
firebase serve

# 3. Deploy to production
firebase deploy --only hosting

# 4. Verify
# Visit your Firebase hosting URL
```

### Automated Deployment (via GitHub Actions)

Once CI/CD is set up, deployment happens automatically:

1. **Push to main branch:**
```bash
git push origin main
```

2. **GitHub Actions will:**
   - Run tests
   - Build application
   - Deploy to Firebase
   - Report status

3. **Monitor deployment:**
   - Check GitHub Actions tab
   - Verify deployment in Firebase Console

### Custom Domain Setup

1. **In Firebase Console:**
   - Go to Hosting > Add custom domain
   - Enter your domain (e.g., auraos.com)

2. **Update DNS:**
   - Add provided A and AAAA records to your DNS provider
   - Wait for SSL certificate (15-30 minutes)

3. **Verify:**
   - Check domain status in Firebase Console
   - Visit your custom domain

---

## 5️⃣ Post-Deployment Verification

### Checklist

```bash
# 1. Check deployment status
firebase hosting:channel:list

# 2. Visit production URL
# https://your-project.web.app

# 3. Test critical features
# - Landing page loads
# - Authentication works
# - Navigation works
# - No console errors

# 4. Check monitoring
# - Firebase Console > Analytics
# - Check for errors
# - Monitor performance
```

### Monitoring Setup

#### Add Sentry (Error Tracking)

```bash
# 1. Install
npm install @sentry/react

# 2. Initialize in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

#### Add Google Analytics

```bash
# 1. Install
npm install react-ga4

# 2. Initialize
import ReactGA from "react-ga4";
ReactGA.initialize("G-XXXXXXXXXX");
```

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Fails

```bash
# Check Firebase CLI
firebase --version

# Update if needed
npm install -g firebase-tools

# Re-authenticate
firebase logout
firebase login
```

### Tests Fail in CI

```bash
# Run tests locally
npm test

# Check for environment-specific issues
# Ensure all dependencies are in package.json
```

---

## 📊 Deployment Checklist

### Before Deployment
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Branch merged to main
- [ ] Environment variables configured
- [ ] Firebase project set up

### During Deployment
- [ ] Build succeeds
- [ ] Tests pass in CI
- [ ] Deployment completes
- [ ] No errors in logs

### After Deployment
- [ ] Site loads correctly
- [ ] Features work as expected
- [ ] No console errors
- [ ] Monitoring active
- [ ] Team notified

---

## 🚀 Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm test                 # Run tests
npm run build           # Build for production

# Firebase
firebase login          # Login to Firebase
firebase init           # Initialize Firebase
firebase serve          # Test locally
firebase deploy         # Deploy to production

# Git
git status              # Check status
git add .               # Stage changes
git commit -m "msg"     # Commit changes
git push origin main    # Push to main

# CI/CD
# Automatic via GitHub Actions after push to main
```

---

## 📚 Resources

- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

---

**Status:** ✅ Ready to Deploy  
**Next Steps:** Follow sections 1-5 in order

**Good luck! 🚀**
