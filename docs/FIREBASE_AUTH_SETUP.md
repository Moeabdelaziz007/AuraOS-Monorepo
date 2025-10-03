# Firebase Authentication Setup Guide

## 🔴 Current Issue: `auth/operation-not-allowed`

This error means authentication providers are not enabled in Firebase Console.

## ✅ Solution: Enable Authentication Providers

### Step 1: Go to Firebase Console
[https://console.firebase.google.com/project/auraos-ac2e0/authentication/providers](https://console.firebase.google.com/project/auraos-ac2e0/authentication/providers)

### Step 2: Enable Email/Password Authentication

1. Click on **"Email/Password"** in the providers list
2. Toggle **"Enable"** to ON
3. Click **"Save"**

### Step 3: Enable Google Authentication

1. Click on **"Google"** in the providers list
2. Toggle **"Enable"** to ON
3. Enter **Project support email** (your email)
4. Click **"Save"**

### Step 4: Enable GitHub Authentication

1. Click on **"GitHub"** in the providers list
2. Toggle **"Enable"** to ON
3. You'll need to create a GitHub OAuth App:
   - Go to: https://github.com/settings/developers
   - Click "New OAuth App"
   - **Application name:** AuraOS
   - **Homepage URL:** https://auraos-ac2e0.web.app
   - **Authorization callback URL:** https://auraos-ac2e0.firebaseapp.com/__/auth/handler
   - Copy the **Client ID** and **Client Secret**
4. Paste them in Firebase Console
5. Click **"Save"**

## 🎯 Quick Setup Checklist

- [ ] Enable Email/Password provider
- [ ] Enable Google provider (add support email)
- [ ] Enable GitHub provider (create OAuth app)
- [ ] Test sign up with email
- [ ] Test Google sign in
- [ ] Test GitHub sign in
- [ ] Test Guest mode

## 🔧 Testing After Setup

1. Go to: https://auraos-ac2e0.web.app/auth
2. Try creating an account with email/password
3. Try Google sign in
4. Try GitHub sign in
5. Try Guest mode
6. Check the debug panel for success messages

## 📝 Notes

- **Guest Mode** uses Email/Password authentication internally (creates temporary accounts)
- **Google/GitHub** require additional OAuth setup
- All providers must be enabled for the app to work properly

## 🆘 Still Having Issues?

Check the browser console (F12) for detailed error messages. The debug panel on the auth page shows real-time logs.

Common issues:
- **auth/operation-not-allowed** → Provider not enabled
- **auth/unauthorized-domain** → Add your domain to authorized domains
- **auth/invalid-api-key** → Check Firebase config
- **auth/network-request-failed** → Check internet connection

## 🔗 Useful Links

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/project/auraos-ac2e0)
- [GitHub OAuth Apps](https://github.com/settings/developers)
