# AuraOS Deployment Guide

## 🚀 Quick Deploy Summary

**Status**: ✅ Apps built and ready for deployment  
**Firebase Project**: `auraos-ac2e0`  
**Authentication Required**: Yes (Firebase login needed)

### Built Applications
- ✅ Terminal App: `apps/terminal/dist` (444 KB)
- ✅ Debugger App: `apps/debugger/dist` (168 KB)
- ⏳ Landing Page: `apps/landing-page/dist`

---

## Firebase Hosting Deployment

### Prerequisites
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify project access
firebase projects:list
```

### Build All Applications

```bash
# Terminal App
cd apps/terminal && npm run build

# Debugger App  
cd apps/debugger && npm run build

# Landing Page
cd apps/landing-page && npm run build
```

### Deploy to Firebase

#### Single Site Deployment (Current Configuration)
```bash
# Deploy Terminal App (currently configured as default)
firebase deploy --only hosting
```

#### Multi-Site Deployment (Recommended)

First, create additional hosting sites in Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `auraos-ac2e0`
3. Go to Hosting → Add another site
4. Create sites: `auraos-terminal`, `auraos-debugger`

Then configure targets:
```bash
firebase target:apply hosting terminal auraos-terminal
firebase target:apply hosting debugger auraos-debugger
firebase target:apply hosting landing auraos-ac2e0
```

Update `firebase.json` to use targets (see configuration below), then deploy:
```bash
# Deploy all sites
firebase deploy --only hosting

# Or deploy individually
firebase deploy --only hosting:terminal
firebase deploy --only hosting:debugger
firebase deploy --only hosting:landing
```

---

## Firebase Configuration

### Current Project Settings

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBmrG7iMS7hn46IRdRBrYVOd0ZJFTSBvX8",
  authDomain: "auraos-ac2e0.firebaseapp.com",
  projectId: "auraos-ac2e0",
  storageBucket: "auraos-ac2e0.firebasestorage.app",
  messagingSenderId: "53322697327",
  appId: "1:53322697327:web:224560128eb0605c281b9a",
  measurementId: "G-PDPF0MH7L8"
};
```

### Multi-Site firebase.json Configuration

```json
{
  "hosting": [
    {
      "target": "landing",
      "public": "apps/landing-page/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    },
    {
      "target": "terminal",
      "public": "apps/terminal/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    },
    {
      "target": "debugger",
      "public": "apps/debugger/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    }
  ]
}
```

---

## Expected Deployment URLs

After successful deployment:

| App | URL | Status |
|-----|-----|--------|
| Landing Page | https://auraos-ac2e0.web.app | ⏳ Pending |
| Terminal App | https://auraos-terminal.web.app | ⏳ Pending |
| Debugger App | https://auraos-debugger.web.app | ⏳ Pending |

---

## Testing Deployed Applications

### 🖥️ Terminal App Tests

```bash
# Basic commands
ls
pwd
cd /home/aura

# File operations
mkdir projects
cd projects
touch README.md
echo "Hello AuraOS" > README.md
cat README.md

# VFS persistence test
# 1. Create files
# 2. Refresh browser
# 3. Verify files still exist (IndexedDB)
```

### 🐛 Debugger App Tests

1. **Breakpoint Test**:
   - Click line numbers to add breakpoints (red dots)
   - Click "Run" button
   - Verify execution pauses at breakpoints

2. **Code Execution**:
   ```javascript
   function test() {
     let x = 10;
     let y = 20;
     return x + y;
   }
   console.log(test());
   ```
   - Verify output appears in Output panel
   - Check variables in Variable Inspector

3. **Monaco Editor**:
   - Test syntax highlighting
   - Test auto-completion
   - Test code folding

---

## Troubleshooting

### ❌ Authentication Error

```bash
Error: Failed to get Firebase project auraos-ac2e0
```

**Solution**:
```bash
firebase logout
firebase login
# Select the Google account that has access to auraos-ac2e0
```

### ❌ Permission Denied

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `auraos-ac2e0`
3. Settings → Users and permissions
4. Add your email with Owner/Editor role

### ❌ Build Errors

```bash
# Clean and rebuild
cd apps/terminal
npm run clean
npm run build

# If dependencies missing
pnpm install
```

### ❌ Module Resolution Errors

The Terminal app uses Vite alias for @auraos/core:
```typescript
// vite.config.ts
resolve: {
  alias: {
    '@auraos/core': path.resolve(__dirname, '../../packages/core/src'),
  },
}
```

---

## Manual Deployment (Firebase Console)

If CLI fails, deploy via web interface:

1. Build apps locally (see above)
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select `auraos-ac2e0`
4. Hosting → Sites
5. For each site, click "Add release"
6. Upload dist folder:
   - Terminal: `apps/terminal/dist`
   - Debugger: `apps/debugger/dist`
   - Landing: `apps/landing-page/dist`

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main, feature/meta-learning-autopilot]

jobs:
  build-and-deploy:
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
      
      - name: Build Terminal App
        run: cd apps/terminal && npm run build
      
      - name: Build Debugger App
        run: cd apps/debugger && npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: auraos-ac2e0
```

**Setup**:
1. Generate service account key in Firebase Console
2. Add as GitHub secret: `FIREBASE_SERVICE_ACCOUNT`
3. Push to trigger deployment

---

## Performance Targets

| Metric | Target | Terminal | Debugger |
|--------|--------|----------|----------|
| Bundle Size | < 500 KB | 444 KB ✅ | 168 KB ✅ |
| First Paint | < 1.5s | TBD | TBD |
| Interactive | < 3.5s | TBD | TBD |
| Lighthouse | > 90 | TBD | TBD |

---

## Monitoring & Analytics

### Firebase Analytics
- Measurement ID: `G-PDPF0MH7L8`
- Track: Page views, user engagement, errors

### Performance Monitoring
```bash
# Enable in Firebase Console
firebase deploy --only hosting,performance
```

### Error Tracking
- Firebase Crashlytics
- Console errors logged to Analytics

---

## Rollback Procedure

```bash
# List previous versions
firebase hosting:channel:list

# Clone previous version
firebase hosting:clone SOURCE:VERSION DESTINATION

# Example
firebase hosting:clone auraos-terminal:abc123 auraos-terminal
```

---

## Local Testing

Test production builds locally:

```bash
# Terminal App
cd apps/terminal
npm run build
npm run preview
# Opens at http://localhost:4173

# Debugger App
cd apps/debugger
npm run build
npm run preview
# Opens at http://localhost:4173
```

---

## Next Steps

1. ✅ Apps are built and ready
2. ⏳ Authenticate with Firebase (`firebase login`)
3. ⏳ Create additional hosting sites in Firebase Console
4. ⏳ Configure hosting targets
5. ⏳ Deploy with `firebase deploy --only hosting`
6. ⏳ Test deployed applications
7. ⏳ Set up CI/CD pipeline
8. ⏳ Configure custom domains (optional)

---

## Support

For deployment issues:
- Firebase Documentation: https://firebase.google.com/docs/hosting
- Firebase Console: https://console.firebase.google.com/
- GitHub Issues: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues
