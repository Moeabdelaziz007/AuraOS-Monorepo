# Firebase Authentication Setup Guide

This guide will help you authenticate with Firebase to deploy your AuraOS application.

## 🎯 Choose Your Authentication Method

### Method 1: CI Token (For Gitpod/CI/CD) ⭐ RECOMMENDED

This method generates a token you can use in non-interactive environments like Gitpod.

#### Step 1: Generate Token on Local Machine

**On your local computer** (not in Gitpod), open a terminal and run:

```bash
firebase login:ci
```

This will:
1. Open your browser
2. Ask you to sign in to your Google account
3. Request permission to access Firebase
4. Display a token in the terminal

**Copy the entire token** - it looks like this:
```
1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 2: Add Token to Gitpod

1. Go to: https://gitpod.io/user/variables
2. Click "New Variable"
3. Fill in:
   - **Name**: `FIREBASE_TOKEN`
   - **Value**: (paste the token from Step 1)
   - **Scope**: `Moeabdelaziz007/AuraOS-Monorepo`
4. Click "Add"

#### Step 3: Restart Gitpod Workspace

Stop and restart your Gitpod workspace to load the new environment variable.

#### Step 4: Deploy

```bash
gitpod automations task start deploy-firebase
```

Or manually:
```bash
firebase deploy --only hosting --token "$FIREBASE_TOKEN"
```

---

### Method 2: Service Account (For GitHub Actions)

This method uses a service account key for automated deployments.

#### Step 1: Create Service Account

1. Go to Firebase Console: https://console.firebase.google.com/project/selfos-62f70/settings/serviceaccounts/adminsdk
2. Click "Generate New Private Key"
3. Click "Generate Key" in the confirmation dialog
4. A JSON file will be downloaded - **keep this secure!**

#### Step 2: Add to GitHub Secrets

1. Go to: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/secrets/actions
2. Click "New repository secret"
3. Fill in:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Open the downloaded JSON file and paste the **entire contents**
4. Click "Add secret"

#### Step 3: Trigger Deployment

Push to main branch or manually trigger:
1. Go to: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/actions/workflows/deploy.yml
2. Click "Run workflow"
3. Select branch: `main`
4. Click "Run workflow"

---

### Method 3: Interactive Login (Local Machine Only)

This method only works on your local computer with a browser.

#### Step 1: Login

```bash
firebase login
```

This will:
1. Open your browser
2. Ask you to sign in to Google
3. Request Firebase permissions
4. Save credentials locally

#### Step 2: Verify Access

```bash
firebase projects:list
```

You should see `selfos-62f70` in the list.

#### Step 3: Deploy

```bash
# From the project root
cd /path/to/AuraOS-Monorepo

# Install dependencies
pnpm install

# Build UI
cd packages/ui
pnpm run build
cd ../..

# Deploy
firebase deploy --only hosting
```

---

## 🔍 Troubleshooting

### "Failed to authenticate" Error

**Problem**: Token is invalid or expired

**Solution**:
1. Generate a new token: `firebase login:ci`
2. Update the token in Gitpod variables
3. Restart workspace

### "Permission denied" Error

**Problem**: Your Google account doesn't have access to the Firebase project

**Solution**:
1. Verify you're logged in with the correct Google account
2. Check project access: https://console.firebase.google.com/project/selfos-62f70/settings/iam
3. You need at least "Editor" or "Owner" role

### "Project not found" Error

**Problem**: Firebase CLI can't find the project

**Solution**:
```bash
# Check current project
firebase use

# Set correct project
firebase use selfos-62f70

# Or add project
firebase use --add
```

### Token Not Loading in Gitpod

**Problem**: Environment variable not set

**Solution**:
```bash
# Check if token is set
echo $FIREBASE_TOKEN

# If empty, you need to:
# 1. Add it to Gitpod variables (see Method 1, Step 2)
# 2. Restart workspace
```

### GitHub Actions Still Failing

**Problem**: Billing issue or missing secret

**Solution**:
1. Check GitHub billing: https://github.com/settings/billing
2. Verify secret exists: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/secrets/actions
3. Ensure secret name is exactly: `FIREBASE_SERVICE_ACCOUNT`

---

## ✅ Verify Authentication

Test your authentication with:

```bash
# Using token
firebase projects:list --token "$FIREBASE_TOKEN"

# Using interactive login
firebase projects:list
```

You should see:
```
┌──────────────┬────────────────┬────────────────┬──────────────────────┐
│ Project ID   │ Display Name   │ Resource Name  │ Location             │
├──────────────┼────────────────┼────────────────┼──────────────────────┤
│ selfos-62f70 │ SelfOS         │ selfos-62f70   │ us-central           │
└──────────────┴────────────────┴────────────────┴──────────────────────┘
```

---

## 🚀 Quick Deploy Commands

Once authenticated, use these commands:

### Gitpod (with token)
```bash
gitpod automations task start deploy-firebase
```

### Manual (with token)
```bash
firebase deploy --only hosting --token "$FIREBASE_TOKEN"
```

### Local Machine (interactive)
```bash
firebase deploy --only hosting
```

---

## 📝 Important Notes

1. **Never commit tokens or service account keys** to git
2. **Tokens expire** - regenerate if you get auth errors
3. **Service account keys don't expire** but should be rotated periodically
4. **Keep credentials secure** - treat them like passwords
5. **Use CI tokens for Gitpod** - they're designed for non-interactive environments

---

## 🆘 Still Having Issues?

If you're still stuck:

1. **Check Firebase status**: https://status.firebase.google.com
2. **Verify project exists**: https://console.firebase.google.com/project/selfos-62f70
3. **Check your role**: You need Editor or Owner permissions
4. **Try logging out and back in**:
   ```bash
   firebase logout
   firebase login
   ```

---

## 📚 Additional Resources

- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [CI/CD with Firebase](https://firebase.google.com/docs/cli#cli-ci-systems)
- [Service Account Keys](https://cloud.google.com/iam/docs/keys-create-delete)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
