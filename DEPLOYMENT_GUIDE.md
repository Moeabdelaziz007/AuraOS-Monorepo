# 🚀 AuraOS Desktop - Deployment Guide

Complete guide for deploying AuraOS Desktop OS to production.

---

## 📋 Prerequisites

### Required Tools

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```

2. **npm or pnpm**
   ```bash
   npm --version
   ```

3. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase --version
   ```

4. **Git**
   ```bash
   git --version
   ```

### Firebase Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Firebase Hosting**
   - In your project, go to "Hosting"
   - Click "Get started"
   - Follow the instructions

3. **Login to Firebase CLI**
   ```bash
   firebase login
   ```

4. **Initialize Firebase (if not done)**
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Public directory: `packages/ui/dist`
   - Single-page app: Yes
   - GitHub Actions: Yes (optional)

---

## 🏗️ Build Process

### Option 1: Using Build Script (Recommended)

```bash
./scripts/build-desktop.sh
```

This script will:
- ✅ Check Node.js installation
- ✅ Install dependencies if needed
- ✅ Clean previous build
- ✅ Build for production
- ✅ Show build size

### Option 2: Manual Build

```bash
cd packages/ui
npm install
npm run build
```

### Build Output

The build creates optimized files in `packages/ui/dist/`:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── vite.svg
```

---

## 🚀 Deployment Methods

### Method 1: Automated Script (Easiest)

```bash
./scripts/deploy-desktop.sh
```

This will:
1. Build the project
2. Deploy to Firebase Hosting
3. Show deployment URL

### Method 2: Firebase CLI

```bash
# Build first
./scripts/build-desktop.sh

# Then deploy
firebase deploy --only hosting
```

### Method 3: GitHub Actions (Automatic)

Push to main branch:
```bash
git add .
git commit -m "Deploy Desktop OS"
git push origin main
```

GitHub Actions will automatically:
1. Build the project
2. Run tests
3. Deploy to Firebase

---

## 🔧 Configuration

### Firebase Configuration

Edit `firebase.json`:

```json
{
  "hosting": {
    "public": "packages/ui/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Environment Variables

Create `.env.production` in `packages/ui/`:

```env
VITE_API_URL=https://your-api.com
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Build Configuration

Edit `packages/ui/vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

---

## 🔐 Security Setup

### Firebase Security Rules

**Firestore Rules** (`firestore.rules`):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Storage Rules** (`storage.rules`):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Security Headers

Already configured in `firebase.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block

---

## 🧪 Testing Before Deployment

### 1. Local Preview

```bash
cd packages/ui
npm run build
npm run preview
```

Open http://localhost:4173

### 2. Firebase Emulator

```bash
firebase emulators:start
```

Open http://localhost:5000

### 3. Test Checklist

- [ ] All apps launch correctly
- [ ] Windows can be dragged and resized
- [ ] Taskbar works properly
- [ ] Start menu opens
- [ ] Desktop icons respond to double-click
- [ ] No console errors
- [ ] Responsive on different screen sizes

---

## 📊 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] No console errors
- [ ] Environment variables set
- [ ] Firebase project configured
- [ ] Security rules updated

### Deployment

- [ ] Run build script
- [ ] Check build size (should be < 5MB)
- [ ] Test preview locally
- [ ] Deploy to Firebase
- [ ] Verify deployment URL

### Post-Deployment

- [ ] Test live site
- [ ] Check all features work
- [ ] Monitor Firebase console
- [ ] Check analytics
- [ ] Update documentation

---

## 🌐 Custom Domain Setup

### 1. Add Custom Domain in Firebase

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., `auraos.com`)
4. Follow verification steps

### 2. Update DNS Records

Add these records to your DNS provider:

```
Type: A
Name: @
Value: [Firebase IP addresses]

Type: A
Name: www
Value: [Firebase IP addresses]
```

### 3. Wait for SSL Certificate

Firebase automatically provisions SSL certificate (can take up to 24 hours).

---

## 📈 Monitoring & Analytics

### Firebase Analytics

Add to `packages/ui/src/main.tsx`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  // Your config
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

### Performance Monitoring

```bash
npm install firebase
```

```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
```

### Error Tracking

Consider adding:
- Sentry
- LogRocket
- Rollbar

---

## 🔄 Continuous Deployment

### GitHub Actions Setup

1. **Add Firebase Service Account**
   ```bash
   firebase init hosting:github
   ```

2. **Add Secrets to GitHub**
   - Go to Repository → Settings → Secrets
   - Add `FIREBASE_SERVICE_ACCOUNT`
   - Add `FIREBASE_PROJECT_ID`

3. **Workflow File**
   Already created in `.github/workflows/deploy.yml`

### Automatic Deployment

Every push to `main` branch will:
1. Run tests
2. Build project
3. Deploy to Firebase
4. Update live site

---

## 🐛 Troubleshooting

### Build Fails

**Error: Module not found**
```bash
cd packages/ui
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: Out of memory**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Deployment Fails

**Error: Not logged in**
```bash
firebase login --reauth
```

**Error: Permission denied**
```bash
firebase projects:list
firebase use <project-id>
```

**Error: Build directory not found**
```bash
# Make sure build completed
ls -la packages/ui/dist
```

### Site Not Loading

1. **Check Firebase Console**
   - Go to Hosting tab
   - Verify deployment succeeded

2. **Check Browser Console**
   - Look for errors
   - Check network tab

3. **Clear Cache**
   ```bash
   # In browser
   Ctrl+Shift+R (hard refresh)
   ```

4. **Check DNS**
   ```bash
   nslookup your-domain.com
   ```

---

## 📦 Rollback

### Rollback to Previous Version

```bash
firebase hosting:rollback
```

### View Deployment History

```bash
firebase hosting:channel:list
```

### Deploy Specific Version

```bash
firebase hosting:channel:deploy <channel-name>
```

---

## 🎯 Performance Optimization

### 1. Code Splitting

Already configured in `vite.config.ts`:
```typescript
rollupOptions: {
  output: {
    manualChunks: {
      vendor: ['react', 'react-dom'],
    },
  },
}
```

### 2. Asset Optimization

- Images: Use WebP format
- Icons: Use SVG sprites
- Fonts: Subset and preload

### 3. Caching Strategy

Firebase automatically caches:
- Static assets: 1 year
- HTML: No cache (always fresh)

### 4. Compression

Firebase automatically serves:
- Gzip compression
- Brotli compression (when supported)

---

## 📊 Deployment Metrics

### Target Metrics

- **Build Time**: < 2 minutes
- **Build Size**: < 5 MB
- **First Load**: < 3 seconds
- **Time to Interactive**: < 5 seconds
- **Lighthouse Score**: > 90

### Check Metrics

```bash
# Build size
du -sh packages/ui/dist

# Lighthouse
npm install -g lighthouse
lighthouse https://your-site.com
```

---

## 🔄 Update Process

### Regular Updates

1. **Pull latest code**
   ```bash
   git pull origin main
   ```

2. **Install dependencies**
   ```bash
   cd packages/ui
   npm install
   ```

3. **Build and deploy**
   ```bash
   ./scripts/deploy-desktop.sh
   ```

### Hotfix Process

1. **Create hotfix branch**
   ```bash
   git checkout -b hotfix/issue-name
   ```

2. **Make changes and test**
   ```bash
   npm run dev
   ```

3. **Deploy**
   ```bash
   git commit -am "Fix: issue description"
   git push origin hotfix/issue-name
   ./scripts/deploy-desktop.sh
   ```

---

## 📞 Support

### Resources

- **Firebase Docs**: https://firebase.google.com/docs/hosting
- **Vite Docs**: https://vitejs.dev/guide/
- **GitHub Actions**: https://docs.github.com/actions

### Common Issues

- Build errors → Check Node.js version
- Deploy errors → Check Firebase login
- Site not loading → Check browser console
- Slow performance → Check Lighthouse report

---

## ✅ Quick Reference

### Build Commands

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Deploy
./scripts/deploy-desktop.sh
```

### Firebase Commands

```bash
# Login
firebase login

# List projects
firebase projects:list

# Use project
firebase use <project-id>

# Deploy
firebase deploy --only hosting

# Rollback
firebase hosting:rollback
```

### Useful Scripts

```bash
# Build only
./scripts/build-desktop.sh

# Build and deploy
./scripts/deploy-desktop.sh

# Clean and rebuild
rm -rf packages/ui/dist packages/ui/node_modules
cd packages/ui && npm install && npm run build
```

---

## 🎉 Success!

Your AuraOS Desktop is now deployed and live! 🚀

**Next Steps:**
1. ✅ Test the live site
2. ✅ Set up monitoring
3. ✅ Configure custom domain
4. ✅ Enable analytics
5. ✅ Share with users!

---

**Made with ❤️ for AuraOS**
