# 🚀 Quick Start: Deploy AuraOS in 5 Minutes

## Current Status

✅ Build is ready (784K, 19 files)  
✅ Firebase CLI installed  
✅ Project configured (selfos-62f70)  
❌ **Authentication needed**

---

## 🎯 Choose Your Path

### Path A: Deploy from Gitpod (Recommended)

**Time: 5 minutes**

#### Step 1: Get Firebase Token (Do this on YOUR LOCAL COMPUTER)

Open terminal on your local machine and run:

```bash
firebase login:ci
```

**What happens:**
1. Browser opens
2. Sign in with Google
3. Allow Firebase access
4. Token appears in terminal

**Copy the entire token** - looks like:
```
1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 2: Add Token to Gitpod

1. Open: [https://gitpod.io/user/variables](https://gitpod.io/user/variables)
2. Click **"New Variable"**
3. Enter:
   ```
   Name:  FIREBASE_TOKEN
   Value: (paste your token here)
   Scope: Moeabdelaziz007/AuraOS-Monorepo
   ```
4. Click **"Add"**

#### Step 3: Restart Workspace

In Gitpod, click the menu (☰) → **"Gitpod: Stop Workspace"**

Then reopen: [https://gitpod.io/#https://github.com/Moeabdelaziz007/AuraOS-Monorepo](https://gitpod.io/#https://github.com/Moeabdelaziz007/AuraOS-Monorepo)

#### Step 4: Deploy!

In the new workspace terminal:

```bash
gitpod automations task start deploy-firebase
```

**Done!** Your app will be live at:
- https://selfos-62f70.web.app
- https://selfos-62f70.firebaseapp.com

---

### Path B: Deploy from Local Machine

**Time: 3 minutes**

#### Step 1: Clone & Install

```bash
git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
cd AuraOS-Monorepo
pnpm install
```

#### Step 2: Login to Firebase

```bash
firebase login
```

Browser opens → Sign in → Allow access

#### Step 3: Build & Deploy

```bash
cd packages/ui
pnpm run build
cd ../..
firebase deploy --only hosting
```

**Done!** Check: https://selfos-62f70.web.app

---

### Path C: Deploy via GitHub Actions

**Time: 10 minutes (includes setup)**

#### Step 1: Create Service Account

1. Go to: [Firebase Console → Service Accounts](https://console.firebase.google.com/project/selfos-62f70/settings/serviceaccounts/adminsdk)
2. Click **"Generate New Private Key"**
3. Click **"Generate Key"** (downloads JSON file)

#### Step 2: Add to GitHub

1. Go to: [GitHub Secrets](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/secrets/actions)
2. Click **"New repository secret"**
3. Enter:
   ```
   Name:  FIREBASE_SERVICE_ACCOUNT
   Value: (paste entire JSON file contents)
   ```
4. Click **"Add secret"**

#### Step 3: Fix GitHub Billing

1. Go to: [GitHub Billing](https://github.com/settings/billing)
2. Resolve any billing issues

#### Step 4: Trigger Deployment

**Option A:** Push to main
```bash
git push origin main
```

**Option B:** Manual trigger
1. Go to: [Actions](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/actions/workflows/deploy.yml)
2. Click **"Run workflow"**
3. Select branch: **main**
4. Click **"Run workflow"**

**Done!** Check: https://selfos-62f70.web.app

---

## 🔍 Verify Authentication

Run this diagnostic script anytime:

```bash
bash scripts/firebase-auth-check.sh
```

---

## ❓ Troubleshooting

### "FIREBASE_TOKEN not set"

**Solution:** Follow Path A, Steps 1-3 above

### "Token is invalid or expired"

**Solution:** Generate new token:
```bash
firebase login:ci
```
Then update in Gitpod variables and restart workspace

### "Permission denied"

**Solution:** 
1. Check you're using the correct Google account
2. Verify access: [Firebase IAM](https://console.firebase.google.com/project/selfos-62f70/settings/iam)
3. You need "Editor" or "Owner" role

### "Build not found"

**Solution:**
```bash
cd packages/ui
pnpm run build
```

---

## 📞 Need More Help?

See detailed guides:
- **Authentication:** `FIREBASE_AUTH_GUIDE.md`
- **Deployment:** `DEPLOYMENT.md`
- **Gitpod Automations:** `.gitpod/README.md`

---

## ⚡ One-Line Deploy (After Auth Setup)

```bash
gitpod automations task start deploy-firebase
```

That's it! 🎉
