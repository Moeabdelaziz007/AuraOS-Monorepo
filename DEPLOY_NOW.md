# 🚀 Deploy AuraOS Desktop to Firebase - Quick Guide

Since Firebase CLI is not available in this environment, here's how to deploy from your local machine:

---

## 📋 Prerequisites

You need to have these installed on your local machine:

1. **Node.js 18+**
   - Download: https://nodejs.org/
   - Check: `node --version`

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

---

## 🚀 Deploy Steps

### Step 1: Clone/Pull Latest Code

```bash
cd /path/to/AuraOS-Monorepo
git pull origin main
```

### Step 2: Install Dependencies

```bash
cd packages/ui
npm install
```

### Step 3: Build the Project

```bash
npm run build
```

This creates the `dist/` folder with optimized files.

### Step 4: Login to Firebase

```bash
firebase login
```

This opens your browser to authenticate.

### Step 5: Initialize Firebase (First Time Only)

```bash
firebase init hosting
```

Select:
- **Use existing project** or **Create new project**
- **Public directory:** `packages/ui/dist`
- **Single-page app:** Yes
- **Overwrite index.html:** No

### Step 6: Deploy

```bash
firebase deploy --only hosting
```

---

## ⚡ Quick Deploy (One Command)

If you've already set up Firebase:

```bash
./scripts/deploy-desktop.sh
```

This script will:
1. Build the project
2. Deploy to Firebase
3. Show you the live URL

---

## 🌐 Get Your Firebase URL

After deployment, you'll see:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/YOUR_PROJECT
Hosting URL: https://YOUR_PROJECT.web.app
```

Your live URL will be: **https://YOUR_PROJECT.web.app**

---

## 🔧 Alternative: Manual Deployment

### 1. Build Locally

```bash
cd packages/ui
npm install
npm run build
```

### 2. Go to Firebase Console

1. Visit: https://console.firebase.google.com/
2. Select your project (or create new one)
3. Go to **Hosting** section
4. Click **Get Started**

### 3. Upload Files

You can drag and drop the `packages/ui/dist/` folder contents to Firebase Console.

---

## 📱 Using Firebase Console (No CLI Needed)

### Option 1: Web Interface

1. **Go to Firebase Console**
   - https://console.firebase.google.com/

2. **Create/Select Project**
   - Click "Add project" or select existing

3. **Enable Hosting**
   - Click "Hosting" in left menu
   - Click "Get started"

4. **Upload via Console**
   - Build your project locally first
   - Use Firebase Console to upload files

### Option 2: GitHub Actions (Automatic)

Your repository already has GitHub Actions configured!

1. **Add Firebase Secrets to GitHub**
   ```bash
   # On your local machine
   firebase init hosting:github
   ```

2. **Push to Main Branch**
   ```bash
   git push origin main
   ```

3. **GitHub Actions Will:**
   - Build the project
   - Deploy to Firebase
   - Give you the URL

---

## 🎯 Recommended: Use GitHub Actions

This is the easiest way since you already have the workflow configured!

### Setup (One Time):

1. **On Your Local Machine:**
   ```bash
   cd /path/to/AuraOS-Monorepo
   firebase login
   firebase init hosting:github
   ```

2. **Follow Prompts:**
   - Select your Firebase project
   - Allow GitHub Actions
   - It will add secrets automatically

3. **Done!** Now every push to main deploys automatically.

---

## 📊 Check Deployment Status

### Via Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Click "Hosting"
4. See deployment history and URLs

### Via CLI

```bash
firebase hosting:channel:list
```

---

## 🔗 Your Firebase URLs

After deployment, you'll get:

1. **Default URL:**
   ```
   https://YOUR_PROJECT_ID.web.app
   https://YOUR_PROJECT_ID.firebaseapp.com
   ```

2. **Custom Domain (Optional):**
   - Add in Firebase Console → Hosting → Add custom domain
   - Follow DNS setup instructions

---

## 🐛 Troubleshooting

### Build Fails

```bash
cd packages/ui
rm -rf node_modules dist
npm install
npm run build
```

### Firebase Login Issues

```bash
firebase logout
firebase login --reauth
```

### Deployment Fails

```bash
# Check you're in the right project
firebase projects:list
firebase use YOUR_PROJECT_ID

# Try deploying again
firebase deploy --only hosting
```

---

## 📞 Quick Help

### Get Firebase Project ID

```bash
firebase projects:list
```

### Check Current Project

```bash
firebase use
```

### View Hosting Sites

```bash
firebase hosting:sites:list
```

---

## ✅ Deployment Checklist

- [ ] Node.js installed
- [ ] Firebase CLI installed
- [ ] Logged into Firebase
- [ ] Project built successfully
- [ ] Firebase project selected
- [ ] Deployment successful
- [ ] Live URL working

---

## 🎉 After Deployment

Once deployed, your AuraOS Desktop will be live at:

**https://YOUR_PROJECT_ID.web.app**

You can:
- ✅ Share the link
- ✅ Test all features
- ✅ Add custom domain
- ✅ Monitor analytics
- ✅ Update anytime with `firebase deploy`

---

## 🚀 Next Deploy

After initial setup, deploying is just:

```bash
./scripts/deploy-desktop.sh
```

Or:

```bash
git push origin main  # If using GitHub Actions
```

---

**Need the link now?**

1. Run these commands on your local machine:
   ```bash
   cd AuraOS-Monorepo
   ./scripts/deploy-desktop.sh
   ```

2. Copy the URL from the output

3. Share it!

---

**Made with ❤️ for AuraOS**
