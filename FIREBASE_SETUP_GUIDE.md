# Firebase Setup Guide for AuraOS Monorepo

This guide walks through the manual steps you must perform in the Firebase Console and CLI to finish wiring the project created in this repository.

## Prerequisites

1. Install the Firebase CLI (requires Node.js):

```bash
npm install -g firebase-tools
```

2. Login to Firebase from your terminal:

```bash
firebase login
```

3. (Optional) To use the local emulator during development, install the Emulator UI:

```bash
# already included with firebase-tools >= 11
```

## Create a Firebase Project

1. Open the Firebase Console: https://console.firebase.google.com/
2. Click "Add project" → enter a project name (for example `auraos-monorepo`) and follow prompts.
3. After the project is created, note the project ID (you'll use it in `.firebaserc` or when running CLI commands).

## Configure Firestore & Authentication

1. In the Firebase Console, choose "Firestore Database" from the left menu.
2. Click "Create database" → Select a location and choose "Start in test mode" (you can switch to production rules later), then click "Enable".
3. In the Console, go to "Authentication" → "Sign-in method".
4. Enable the "Google" provider and save.

## Set the Gemini / Generative AI API Key

The Cloud Function uses a Generative AI API key. Store it securely with Firebase Functions config.

Run (replace YOUR_API_KEY with your Gemini or Google Generative API key):

```bash
firebase functions:config:set generative.api_key="YOUR_API_KEY" --project auraos-monorepo
```

Verify the config:

```bash
firebase functions:config:get --project auraos-monorepo
```

Note: When running locally with the emulator, you can export env vars or use `firebase functions:config:get > .runtimeconfig.json` for the emulator to pick up.

## Deploying

1. Build functions (from repo root):

```bash
pnpm --filter @auraos/functions build
```

2. Deploy to Firebase:

```bash
firebase deploy --only functions,firestore,hosting,storage --project auraos-monorepo
```

That's it — the callable function `callAI` will be available under the functions list and can be invoked from your front-end via the Firebase client SDK.

## Local Development with Emulator (optional)

To run emulators locally:

```bash
firebase emulators:start --only auth,firestore,functions,hosting,storage
```

If you need to seed data, use `firebase emulators:import`/`export`.

## Security Notes

- Do NOT commit real API keys into source.
- Use `firebase functions:config:set` to keep secrets out of source control.
- Consider restricting the Generative API key to allowed IPs or service accounts depending on your cloud provider.

***

If you'd like, I can also wire up a small client-side example that calls `callAI` using the Firebase web SDK and demonstrates the auth flow.
