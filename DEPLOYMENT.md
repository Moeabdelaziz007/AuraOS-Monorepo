# AuraOS Deployment Guide

This guide covers multiple ways to deploy AuraOS to Firebase Hosting.

## 🚀 Quick Deploy Options

### Option 1: GitHub Actions (Recommended)

The easiest way to deploy is to push to the `main` branch. GitHub Actions will automatically build and deploy.

#### Setup (One-Time):

1. **Generate Firebase Service Account Key**:
   ```bash
   # On your local machine with Firebase CLI
   firebase login
   firebase projects:list  # Verify you can see selfos-62f70
   ```

2. **Create Service Account** (in Firebase Console):
   - Go to: https://console.firebase.google.com/project/selfos-62f70/settings/serviceaccounts/adminsdk
   - Click "Generate New Private Key"
   - Download the JSON file

3. **Add GitHub Secret**:
   - Go to: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/settings/secrets/actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the entire contents of the JSON file from step 2
   - Click "Add secret"

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy AuraOS"
   git push origin main
   ```

   Or manually trigger from GitHub:
   - Go to: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/actions
   - Select "Deploy to Firebase"
   - Click "Run workflow"

### Option 2: Gitpod Automation

Deploy directly from your Gitpod workspace.

#### Setup (One-Time):

1. **Generate Firebase CI Token** (on your local machine):
   ```bash
   firebase login:ci
   ```
   Copy the token that's displayed.

2. **Add to Gitpod**:
   - Go to: https://gitpod.io/user/variables
   - Click "New Variable"
   - Name: `FIREBASE_TOKEN`
   - Value: (paste the token from step 1)
   - Scope: `Moeabdelaziz007/AuraOS-Monorepo`
   - Click "Add"

3. **Restart Gitpod workspace** to load the new variable

4. **Deploy**:
   ```bash
   gitpod automations task start deploy-firebase
   ```

### Option 3: Manual Deployment

Deploy from any machine with Firebase CLI.

#### Setup:

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login**:
   ```bash
   firebase login
   ```

3. **Build and Deploy**:
   ```bash
   # Install dependencies
   pnpm install
   
   # Build UI
   cd packages/ui
   pnpm run build
   cd ../..
   
   # Deploy
   firebase deploy --only hosting
   ```

## 🌐 Deployment URLs

After successful deployment, your app will be available at:

- **Primary**: https://selfos-62f70.web.app
- **Alternative**: https://selfos-62f70.firebaseapp.com

## 🔍 Verify Deployment

Check deployment status:

```bash
# List recent deployments
firebase hosting:channel:list

# View hosting details
firebase hosting:sites:list
```

## 🐛 Troubleshooting

### "Site Not Found" Error

This means no deployment has been made yet. Follow one of the deployment options above.

### GitHub Actions Fails

1. Check that `FIREBASE_SERVICE_ACCOUNT` secret is set correctly
2. Verify the service account has "Firebase Hosting Admin" role
3. Check workflow logs: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/actions

### Gitpod Automation Fails

1. Verify `FIREBASE_TOKEN` is set: `echo $FIREBASE_TOKEN`
2. If empty, restart workspace after adding the variable
3. Test token: `firebase projects:list --token "$FIREBASE_TOKEN"`

### Build Fails

1. Ensure all dependencies are installed: `pnpm install`
2. Try building locally: `cd packages/ui && pnpm run build`
3. Check for TypeScript errors: `pnpm run type-check`

### Permission Denied

1. Verify you have Owner or Editor role in Firebase project
2. Check service account permissions in Firebase Console
3. Regenerate token/service account key

## 📊 Monitoring

View deployment history and analytics:

- **Firebase Console**: https://console.firebase.google.com/project/selfos-62f70/hosting
- **GitHub Actions**: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/actions

## 🔄 Rollback

To rollback to a previous deployment:

```bash
# List previous releases
firebase hosting:releases:list

# Rollback to specific version
firebase hosting:rollback
```

## 📝 Notes

- The build output is in `packages/ui/dist/`
- Firebase hosting config is in `firebase.json`
- The project uses pnpm workspaces
- Build time: ~2-3 minutes
- Deploy time: ~30 seconds
