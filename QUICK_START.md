# 🚀 AuraOS Quick Start Guide

Your Firebase project **selfos-62f70** is already configured! Follow these steps to get AuraOS running.

## ✅ What's Already Done

- ✅ Firebase configuration added
- ✅ Environment variables set
- ✅ All packages built successfully
- ✅ UI production build ready
- ✅ Firestore rules configured
- ✅ Storage rules configured
- ✅ Deployment script created

## 📋 Prerequisites

1. **Firebase CLI** installed:
   ```bash
   npm install -g firebase-tools
   ```

2. **Logged into Firebase**:
   ```bash
   firebase login
   ```

## 🎯 Quick Deploy (3 Steps)

### Step 1: Enable Firebase Services

Go to [Firebase Console](https://console.firebase.google.com/project/selfos-62f70) and enable:

1. **Authentication** → Sign-in method:
   - ✅ Email/Password
   - ✅ Google

2. **Firestore Database**:
   - Click "Create database"
   - Start in **production mode**
   - Choose your location

3. **Storage**:
   - Click "Get started"
   - Start in **production mode**

### Step 2: Add Your AI API Key

Edit `packages/ui/.env.local` and add your Anthropic API key:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your key from: https://console.anthropic.com/

### Step 3: Deploy!

```bash
./deploy.sh
```

That's it! Your app will be live at:
**https://selfos-62f70.web.app**

## 🎨 What You Get

### Desktop OS Experience
- Full window management (drag, resize, minimize, maximize)
- Taskbar with open windows
- Start menu for launching apps
- Animated quantum wallpaper

### 7 AI-Powered Applications
1. **AI Notes** - Smart note-taking
2. **AI Code Editor** - Code with AI assistance
3. **AI File Manager** - Browse files with AI
4. **AI Terminal** - Command-line interface
5. **AI Automation** - Build workflows
6. **AI Autopilot** - Autonomous tasks
7. **AI Agents** - Multi-agent system

### Backend Features
- 🔐 User authentication (Email + Google)
- 💾 Firestore database for data persistence
- 💬 Real-time chat with AI
- 📁 File system access via MCP
- 🤖 Anthropic Claude integration

## 🧪 Test Locally First

Before deploying, test with Firebase emulators:

```bash
# Start emulators
firebase emulators:start

# Access at:
# - App: http://localhost:5000
# - Emulator UI: http://localhost:4000
```

## 🔧 Manual Deployment Steps

If you prefer manual deployment:

```bash
# 1. Build everything
pnpm -r build

# 2. Deploy Firestore rules
firebase deploy --only firestore:rules

# 3. Deploy Storage rules
firebase deploy --only storage:rules

# 4. Deploy hosting
firebase deploy --only hosting
```

## 📊 Monitor Your App

### Firebase Console
https://console.firebase.google.com/project/selfos-62f70

Check:
- **Authentication** - User sign-ups
- **Firestore** - Database contents
- **Hosting** - Deployment status
- **Analytics** - Usage metrics

### Your Live App
https://selfos-62f70.web.app

## 🐛 Troubleshooting

### "Permission denied" errors
- Make sure you're logged in: `firebase login`
- Check you have access to project: `firebase projects:list`

### Authentication not working
- Enable Email/Password in Firebase Console
- Enable Google provider in Firebase Console
- Check `.env.local` has correct Firebase config

### AI not responding
- Add your Anthropic API key to `.env.local`
- Rebuild: `cd packages/ui && pnpm build`
- Redeploy: `firebase deploy --only hosting`

### Build errors
```bash
# Clean and rebuild
pnpm -r clean
pnpm install
pnpm -r build
```

## 🎓 Learn More

- [Full Documentation](./docs/INTEGRATION_COMPLETE.md)
- [Firebase Setup Guide](./docs/FIREBASE_SETUP.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)

## 🎉 You're Ready!

Your AuraOS is configured and ready to deploy. Just run:

```bash
./deploy.sh
```

And visit: **https://selfos-62f70.web.app**

Enjoy your AI-powered operating system! 🚀

---

**Need help?** Check the documentation in the `/docs` folder or review error messages in the browser console.
