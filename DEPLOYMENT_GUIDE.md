# 🚀 AuraOS Deployment Guide

Complete step-by-step guide to deploy AuraOS to Firebase Hosting.

## Prerequisites

- ✅ Firebase project created (`selfos-62f70`)
- ✅ Firebase CLI installed
- ✅ Code merged to `main` branch
- ✅ All tests passing

## Method 1: Deploy with Firebase Token (Recommended for CI/CD)

### Step 1: Get Firebase Token (On Your Local Machine)

```bash
# Run this on your LOCAL machine (not in dev container)
firebase login:ci
```

This will:
1. Open a browser for authentication
2. Generate a refresh token
3. Display the token in terminal

**Copy the token** - it looks like: `1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Set Environment Variable (In Dev Container)

```bash
# In VS Code terminal (inside dev container)
export FIREBASE_TOKEN="YOUR_REFRESH_TOKEN_HERE"
```

**Important:** Replace `YOUR_REFRESH_TOKEN_HERE` with the actual token from Step 1.

### Step 3: Verify Firebase Project

```bash
# Check current project
firebase projects:list

# Should show: selfos-62f70
```

### Step 4: Link Project (If Needed)

```bash
# Only if project is not linked
firebase use selfos-62f70
```

### Step 5: Deploy

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
1. Clean previous builds
2. Install dependencies
3. Build all packages
4. Build UI for production
5. Deploy Firestore rules
6. Deploy Storage rules
7. Deploy to Firebase Hosting

---

## Method 2: Interactive Deployment (Simpler)

If you don't want to use a token, you can deploy interactively:

### Step 1: Login to Firebase

```bash
firebase login
```

This will open a browser for authentication.

### Step 2: Verify Project

```bash
firebase use selfos-62f70
```

### Step 3: Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Method 3: Manual Deployment

If the script doesn't work, deploy manually:

### Step 1: Build Everything

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Build UI
cd packages/ui
pnpm build
cd ../..
```

### Step 2: Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

---

## Troubleshooting

### Error: "Not authorized"

**Solution:** Make sure you're logged in:
```bash
firebase login
firebase use selfos-62f70
```

### Error: "Build output not found"

**Solution:** Build the UI first:
```bash
cd packages/ui
pnpm build
cd ../..
```

### Error: "Firebase token invalid"

**Solution:** Get a new token:
```bash
# On local machine
firebase login:ci

# Copy new token and set in dev container
export FIREBASE_TOKEN="new-token-here"
```

### Error: "Project not found"

**Solution:** Check project ID:
```bash
# List projects
firebase projects:list

# Use correct project
firebase use selfos-62f70
```

### Error: "Permission denied"

**Solution:** Check Firebase IAM permissions:
1. Go to [Firebase Console](https://console.firebase.google.com/project/selfos-62f70)
2. Go to Project Settings → Users and permissions
3. Make sure your account has "Owner" or "Editor" role

---

## Deployment Checklist

Before deploying, make sure:

- [ ] All code is committed and pushed
- [ ] Tests are passing
- [ ] Environment variables are set (if needed)
- [ ] Firebase project is configured
- [ ] Build completes successfully
- [ ] No sensitive data in code (API keys, tokens)

---

## Post-Deployment

### 1. Verify Deployment

Visit your app:
- **Primary URL:** [https://selfos-62f70.web.app](https://selfos-62f70.web.app)
- **Alternative URL:** [https://selfos-62f70.firebaseapp.com](https://selfos-62f70.firebaseapp.com)

### 2. Test Functionality

- [ ] App loads correctly
- [ ] UI renders properly
- [ ] AI Chat works
- [ ] Window system functions
- [ ] Firebase authentication works
- [ ] Data persistence works

### 3. Monitor Performance

Check Firebase Console:
- **Hosting:** [https://console.firebase.google.com/project/selfos-62f70/hosting](https://console.firebase.google.com/project/selfos-62f70/hosting)
- **Analytics:** [https://console.firebase.google.com/project/selfos-62f70/analytics](https://console.firebase.google.com/project/selfos-62f70/analytics)
- **Performance:** [https://console.firebase.google.com/project/selfos-62f70/performance](https://console.firebase.google.com/project/selfos-62f70/performance)

### 4. Set Up Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the instructions to add DNS records
4. Wait for SSL certificate provisioning (can take up to 24 hours)

---

## Environment Variables for Production

Make sure these are set in Firebase:

```bash
# Firebase Configuration (already in firebase.ts)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=selfos-62f70.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=selfos-62f70
VITE_FIREBASE_STORAGE_BUCKET=selfos-62f70.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# AI Configuration (for backend)
AI_PROVIDER=zai
ZAI_API_KEY=your-zai-api-key
ZAI_MODEL=glm-4.5-flash
```

---

## CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm -r build
      
      - name: Deploy to Firebase
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
        run: |
          chmod +x deploy.sh
          ./deploy.sh
```

Add `FIREBASE_TOKEN` to GitHub Secrets:
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `FIREBASE_TOKEN`
4. Value: Your Firebase token from `firebase login:ci`

---

## Rollback

If something goes wrong, rollback to previous version:

```bash
# List previous deployments
firebase hosting:channel:list

# Rollback to specific version
firebase hosting:rollback
```

---

## Support

- **Firebase Documentation:** [https://firebase.google.com/docs/hosting](https://firebase.google.com/docs/hosting)
- **Firebase Console:** [https://console.firebase.google.com/project/selfos-62f70](https://console.firebase.google.com/project/selfos-62f70)
- **AuraOS Issues:** [https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues)

---

## Quick Reference

### Deploy Commands

```bash
# Full deployment
./deploy.sh

# Deploy only hosting
firebase deploy --only hosting

# Deploy only rules
firebase deploy --only firestore:rules,storage:rules

# Deploy with token
firebase deploy --token "$FIREBASE_TOKEN"
```

### Build Commands

```bash
# Build all packages
pnpm -r build

# Build UI only
cd packages/ui && pnpm build

# Clean and rebuild
rm -rf packages/ui/dist && pnpm -r build
```

### Firebase Commands

```bash
# Login
firebase login

# List projects
firebase projects:list

# Use project
firebase use selfos-62f70

# Check current project
firebase projects:list

# Get token for CI/CD
firebase login:ci
```

---

**Ready to deploy? Run `./deploy.sh` and watch the magic happen! 🚀**
