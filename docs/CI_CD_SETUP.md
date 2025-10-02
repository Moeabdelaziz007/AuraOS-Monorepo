# CI/CD Setup Guide

## Overview

AuraOS Monorepo now has a complete CI/CD pipeline with automated testing and Firebase deployment.

## GitHub Actions Workflows

### 1. Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

Runs on every push and pull request to `main` and `develop` branches.

#### Jobs:

1. **Install Dependencies**
   - Caches pnpm store for faster builds
   - Installs all workspace dependencies

2. **Lint & Format Check**
   - Runs ESLint on all packages
   - Checks code formatting with Prettier

3. **TypeScript Type Check**
   - Validates TypeScript types across all packages

4. **Build**
   - Builds all packages in the monorepo
   - Uploads build artifacts for deployment

5. **Test**
   - Runs all test suites
   - Uploads coverage to Codecov

6. **Deploy to Production** (main branch only)
   - Deploys to Firebase Hosting
   - URL: https://auraos-monorepo.web.app

7. **Deploy to Staging** (develop branch only)
   - Deploys to Firebase Staging
   - URL: https://auraos-staging.web.app

8. **Create Release** (on version tags)
   - Automatically creates GitHub releases

9. **Notify Status**
   - Reports deployment success/failure

### 2. Automated Testing Pipeline (`.github/workflows/test.yml`)

Comprehensive testing across multiple environments.

#### Test Types:

1. **Unit Tests**
   - Runs on Ubuntu, Windows, macOS
   - Tests with Node.js 18 and 20
   - Generates test reports

2. **Integration Tests**
   - Uses PostgreSQL service
   - Tests API integrations
   - Database operations

3. **E2E Tests**
   - Uses Playwright
   - Tests full user workflows
   - Captures screenshots on failure

4. **Performance Tests**
   - Runs Lighthouse CI
   - Measures page load times
   - Checks accessibility

5. **Security Tests**
   - npm audit for vulnerabilities
   - Snyk security scanning
   - Dependency checks

6. **Code Coverage**
   - Aggregates coverage from all tests
   - Uploads to Codecov
   - Generates coverage badges

## Firebase Configuration

### Hosting

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Firestore Rules

Security rules for database access:
- Users can read all authenticated data
- Users can only write their own data
- Projects and workflows have owner-based access control

### Storage Rules

File upload rules:
- 10MB limit for user uploads
- 50MB limit for project files
- Image validation for user uploads

## Required GitHub Secrets

Add these secrets to your GitHub repository:

### 1. Firebase Service Account

```bash
# Generate service account key from Firebase Console
# Settings > Service Accounts > Generate New Private Key

# Add to GitHub Secrets as:
FIREBASE_SERVICE_ACCOUNT
```

### 2. Snyk Token (Optional)

```bash
# Get token from https://snyk.io/account

# Add to GitHub Secrets as:
SNYK_TOKEN
```

### 3. Codecov Token (Optional)

```bash
# Get token from https://codecov.io

# Add to GitHub Secrets as:
CODECOV_TOKEN
```

## Setup Instructions

### 1. Initialize Firebase Project

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Select:
# - Hosting
# - Firestore
# - Storage
```

### 2. Configure GitHub Repository

```bash
# Add secrets to GitHub
gh secret set FIREBASE_SERVICE_ACCOUNT < service-account-key.json

# Enable GitHub Actions
# Go to: Settings > Actions > General
# Allow all actions and reusable workflows
```

### 3. Test Locally

```bash
# Run tests
pnpm test

# Build project
pnpm build

# Test Firebase deployment
firebase deploy --only hosting
```

### 4. Push to GitHub

```bash
# Push to develop branch (staging)
git checkout -b develop
git push origin develop

# Push to main branch (production)
git checkout main
git merge develop
git push origin main
```

## Deployment Workflow

### Development Flow

```
1. Create feature branch
   git checkout -b feature/my-feature

2. Make changes and commit
   git add .
   git commit -m "feat: add new feature"

3. Push and create PR
   git push origin feature/my-feature
   gh pr create

4. CI runs automatically:
   ✓ Lint
   ✓ Type check
   ✓ Build
   ✓ Test

5. Merge to develop
   - Deploys to staging automatically

6. Merge to main
   - Deploys to production automatically
```

### Release Flow

```
1. Update version in package.json
   npm version patch|minor|major

2. Create git tag
   git tag v1.0.0

3. Push tag
   git push origin v1.0.0

4. GitHub Actions:
   ✓ Builds release
   ✓ Deploys to production
   ✓ Creates GitHub release
```

## Monitoring

### GitHub Actions

View workflow runs:
```
https://github.com/YOUR_USERNAME/AuraOS-Monorepo/actions
```

### Firebase Console

Monitor deployments:
```
https://console.firebase.google.com/project/auraos-monorepo
```

### Codecov

View coverage reports:
```
https://codecov.io/gh/YOUR_USERNAME/AuraOS-Monorepo
```

## Troubleshooting

### Build Failures

```bash
# Check logs in GitHub Actions
# Common issues:
# - Missing dependencies
# - Type errors
# - Test failures

# Fix locally:
pnpm install
pnpm build
pnpm test
```

### Deployment Failures

```bash
# Check Firebase logs
firebase functions:log

# Verify Firebase config
firebase projects:list

# Test deployment locally
firebase emulators:start
```

### Test Failures

```bash
# Run tests locally
pnpm test

# Run specific test
pnpm --filter @auraos/core test

# Debug with verbose output
pnpm test -- --verbose
```

## Performance Optimization

### Build Time

- Uses pnpm caching
- Parallel builds where possible
- Incremental TypeScript compilation

### Test Time

- Runs tests in parallel
- Uses test result caching
- Skips unchanged packages

### Deployment Time

- Only deploys changed files
- Uses Firebase CDN
- Compressed assets

## Security Best Practices

1. **Never commit secrets**
   - Use GitHub Secrets
   - Use environment variables

2. **Review dependencies**
   - Run `npm audit` regularly
   - Update dependencies monthly

3. **Monitor deployments**
   - Check Firebase logs
   - Review error reports

4. **Access control**
   - Limit Firebase permissions
   - Use service accounts

## Next Steps

1. ✅ Setup complete
2. 📝 Add more tests
3. 🚀 Configure staging environment
4. 📊 Setup monitoring dashboards
5. 🔒 Add security scanning

---

**Last Updated:** October 2, 2025
**Status:** Production Ready
