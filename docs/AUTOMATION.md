# AuraOS Automated Deployment

This document describes the automated deployment system for AuraOS.

## Overview

The automation system automatically commits, pushes, and deploys changes to Firebase whenever you make updates to the codebase.

## Features

- ✅ Automatic Git commit and push
- ✅ Automatic build process
- ✅ Firebase Hosting deployment
- ✅ Firestore Rules deployment
- ✅ File change detection
- ✅ Custom commit messages

## Setup

### 1. Firebase Token

The system requires a Firebase CI token. This is already configured in the environment.

To verify:
```bash
echo $FIREBASE_TOKEN
```

If not set, add it to `~/.bashrc`:
```bash
export FIREBASE_TOKEN="your-token-here"
```

### 2. Make Scripts Executable

```bash
chmod +x scripts/auto-deploy.sh
```

## Usage

### Manual Deployment

Deploy with default commit message:
```bash
npm run auto-deploy
```

Deploy with custom commit message:
```bash
./scripts/auto-deploy.sh "feat: your custom message"
```

### Automatic Deployment (Gitpod)

The Gitpod automation is configured to automatically deploy when files change:

**Monitored Files:**
- `packages/ui/src/**/*.{ts,tsx,js,jsx}`
- `packages/core/src/**/*.{ts,tsx,js,jsx}`
- `firestore.rules`
- `firebase.json`

**To trigger:**
1. Make changes to any monitored file
2. Save the file
3. Automation will automatically:
   - Commit changes
   - Push to GitHub
   - Build the project
   - Deploy to Firebase

### Gitpod Tasks

Available in Gitpod:
- **Auto Deploy & Push** - Full automated deployment
- **Deploy to Firebase** - Deploy only (no commit/push)
- **Build UI** - Build without deploying

## What Gets Deployed

1. **Firebase Hosting**: The built UI from `packages/ui/dist`
2. **Firestore Rules**: Security rules from `firestore.rules`

## Deployment URL

After deployment, your app is live at:
[https://adept-student-469614-k2.web.app](https://adept-student-469614-k2.web.app)

## Troubleshooting

### Token Not Set
```
❌ FIREBASE_TOKEN not set
```
**Solution**: Export the token in your current session:
```bash
export FIREBASE_TOKEN="your-token-here"
```

### Build Fails
**Solution**: Check for TypeScript errors:
```bash
npm run typecheck
```

### Push Rejected
**Solution**: Pull latest changes first:
```bash
git pull origin feature/meta-learning-autopilot
```

### Deployment Fails
**Solution**: Check Firebase project ID in `.firebaserc`:
```json
{
  "projects": {
    "default": "adept-student-469614-k2"
  }
}
```

## Script Details

### auto-deploy.sh

The main automation script performs:

1. **Check Token**: Verifies `FIREBASE_TOKEN` is set
2. **Git Status**: Shows current changes
3. **Commit**: Commits all changes with provided message
4. **Push**: Pushes to current branch
5. **Build**: Builds the UI package
6. **Deploy**: Deploys to Firebase Hosting and Firestore Rules

### Gitpod Automation

Configured in `.gitpod/automations.yaml`:

```yaml
tasks:
    auto-deploy:
        name: Auto Deploy & Push
        command: ./scripts/auto-deploy.sh "chore: automated deployment"
        triggeredBy:
        - manual
        - onFileChange:
            patterns:
            - "packages/ui/src/**/*.{ts,tsx,js,jsx}"
            - "packages/core/src/**/*.{ts,tsx,js,jsx}"
            - "firestore.rules"
            - "firebase.json"
```

## Security

⚠️ **Important**: Never commit the Firebase token to the repository.

The token is stored in:
- Environment variables (session)
- `~/.bashrc` (persistent)
- Gitpod environment variables (if configured)

## Best Practices

1. **Test Locally First**: Run `npm run dev:desktop` to test changes
2. **Check Build**: Run `npm run build:desktop` before deploying
3. **Review Changes**: Check `git status` before committing
4. **Custom Messages**: Use descriptive commit messages
5. **Monitor Deployments**: Check Firebase Console for deployment status

## Related Files

- `scripts/auto-deploy.sh` - Main automation script
- `.gitpod/automations.yaml` - Gitpod automation config
- `.gitpod/environment-variables.md` - Environment setup guide
- `package.json` - NPM scripts configuration
- `firebase.json` - Firebase configuration
- `.firebaserc` - Firebase project settings

## Support

For issues or questions:
1. Check this documentation
2. Review error messages carefully
3. Check Firebase Console logs
4. Verify environment variables are set
