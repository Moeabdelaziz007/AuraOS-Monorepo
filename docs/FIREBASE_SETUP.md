# Firebase Setup Guide for AuraOS

This guide will help you set up Firebase for AuraOS, including hosting, authentication, Firestore database, and AI integration.

## Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher
- Firebase CLI (`npm install -g firebase-tools`)
- A Google account

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `auraos-monorepo` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Services

### Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click and enable
   - **Google**: Click, enable, and configure OAuth consent screen

### Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in production mode** (we'll configure rules later)
3. Select your preferred location
4. Click "Enable"

### Storage
1. Go to **Storage** → **Get started**
2. Start in production mode
3. Select same location as Firestore
4. Click "Done"

### Hosting
1. Go to **Hosting** → **Get started**
2. Follow the setup wizard (we'll configure via CLI)

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app with nickname: "AuraOS Web"
5. Copy the `firebaseConfig` object

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp packages/ui/.env.example packages/ui/.env.local
   ```

2. Fill in your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=auraos-monorepo.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=auraos-monorepo
   VITE_FIREBASE_STORAGE_BUCKET=auraos-monorepo.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. Add your AI provider configuration:
   ```env
   VITE_AI_PROVIDER=anthropic
   VITE_ANTHROPIC_API_KEY=sk-ant-...
   ```

## Step 5: Configure Firestore Security Rules

Create `firestore.rules` in the project root:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User's chat messages
      match /messages/{messageId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // User's projects
      match /projects/{projectId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Step 6: Configure Storage Security Rules

Create `storage.rules` in the project root:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 7: Initialize Firebase in Your Project

1. Login to Firebase CLI:
   ```bash
   firebase login
   ```

2. Initialize Firebase (if not already done):
   ```bash
   firebase init
   ```
   
   Select:
   - ✅ Firestore
   - ✅ Storage
   - ✅ Hosting
   - ✅ Emulators

3. Configure:
   - Use existing project: `auraos-monorepo`
   - Firestore rules: `firestore.rules`
   - Firestore indexes: `firestore.indexes.json`
   - Storage rules: `storage.rules`
   - Hosting public directory: `packages/ui/dist`
   - Configure as SPA: Yes
   - Set up automatic builds: No
   - Emulators: Select Auth, Firestore, Storage, Hosting

## Step 8: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Step 9: Build and Deploy

1. Build the UI package:
   ```bash
   cd packages/ui
   pnpm build
   ```

2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

3. Your app will be live at: `https://auraos-monorepo.web.app`

## Step 10: Test with Emulators (Development)

For local development, use Firebase emulators:

```bash
# Start all emulators
firebase emulators:start

# Or start specific emulators
firebase emulators:start --only auth,firestore,hosting
```

Access:
- **Hosting**: http://localhost:5000
- **Emulator UI**: http://localhost:4000
- **Firestore**: http://localhost:8080
- **Auth**: http://localhost:9099

## Using Firebase in Your Code

### Initialize Firebase

```typescript
import { initializeFirebase, getFirebaseConfig } from '@auraos/firebase';

const config = getFirebaseConfig();
initializeFirebase(config);
```

### Authentication

```typescript
import { getFirebaseAuth, createAuthService } from '@auraos/firebase';

const auth = getFirebaseAuth();
const authService = createAuthService(auth);

// Sign in
await authService.signInWithEmail('user@example.com', 'password');

// Sign up
await authService.signUpWithEmail('user@example.com', 'password', 'Display Name');

// Google Sign-in
await authService.signInWithGoogle();

// Sign out
await authService.signOut();
```

### Firestore

```typescript
import { getFirebaseFirestore, createFirestoreService } from '@auraos/firebase';

const db = getFirebaseFirestore();
const firestoreService = createFirestoreService(db);

// Save chat message
await firestoreService.saveChatMessage(userId, {
  userId,
  role: 'user',
  content: 'Hello AI!',
  metadata: {},
});

// Get chat history
const messages = await firestoreService.getChatHistory(userId, 50);

// Create project
const projectId = await firestoreService.createProject(userId, {
  name: 'My Project',
  description: 'A new project',
  files: [],
});
```

## Firestore Data Structure

```
users/
  {userId}/
    - uid: string
    - email: string
    - displayName: string
    - photoURL: string
    - createdAt: timestamp
    - updatedAt: timestamp
    - settings: object
    
    messages/
      {messageId}/
        - userId: string
        - role: 'user' | 'assistant' | 'system'
        - content: string
        - timestamp: timestamp
        - metadata: object
    
    projects/
      {projectId}/
        - userId: string
        - name: string
        - description: string
        - files: array
        - createdAt: timestamp
        - updatedAt: timestamp
```

## AI Integration with Firebase

AuraOS integrates AI capabilities with Firebase:

1. **Chat History**: All AI conversations are stored in Firestore
2. **User Context**: AI has access to user's projects and files
3. **Authentication**: AI requests are authenticated via Firebase Auth
4. **Real-time Updates**: Chat messages sync in real-time across devices

## Troubleshooting

### "Firebase not initialized" Error
Make sure to call `initializeFirebase(config)` before using any Firebase services.

### Authentication Errors
- Check that Email/Password and Google providers are enabled in Firebase Console
- Verify your API key and auth domain in `.env.local`

### Firestore Permission Denied
- Ensure security rules are deployed: `firebase deploy --only firestore:rules`
- Check that user is authenticated before accessing Firestore

### Hosting 404 Errors
- Verify `firebase.json` has correct rewrite rules for SPA
- Rebuild UI: `cd packages/ui && pnpm build`
- Redeploy: `firebase deploy --only hosting`

## Next Steps

- Set up Firebase Functions for backend AI processing
- Configure Firebase Analytics for usage tracking
- Set up Firebase Performance Monitoring
- Enable Firebase Crashlytics for error tracking
- Configure Firebase Remote Config for feature flags

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
