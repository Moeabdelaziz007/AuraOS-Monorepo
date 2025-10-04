# How to Give Cursor Access to Your Workspace

## Method 1: Open Repository in Cursor (Recommended)

### Step 1: Install Cursor
1. Download Cursor from: https://cursor.sh
2. Install it on your computer
3. Open Cursor

### Step 2: Clone Repository in Cursor
1. In Cursor, press `Cmd/Ctrl + Shift + P`
2. Type "Git: Clone"
3. Enter repository URL: `https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git`
4. Choose a folder to clone into
5. Click "Open" when clone completes

### Step 3: Give Cursor the Deployment Task
1. Press `Cmd/Ctrl + K` to open Cursor AI chat
2. Paste this prompt:

```
Deploy the Content Generator MVP to Firebase and give me the live URL.

Repository is already open. Firebase Project: selfos-62f70

Run these commands:
1. npm install -g pnpm@8.15.0 firebase-tools
2. pnpm install
3. firebase login
4. firebase deploy

Expected live URL: https://selfos-62f70.web.app/content-generator

The .env file with Gemini API key is already at: services/firebase/functions/.env

Provide the live URL when done.
```

---

## Method 2: Open Existing Local Clone

If you already have the repository cloned:

1. Open Cursor
2. Click "File" → "Open Folder"
3. Navigate to your `AuraOS-Monorepo` folder
4. Click "Open"
5. Press `Cmd/Ctrl + K` and give it the deployment prompt

---

## Method 3: Use Cursor in Terminal

### Step 1: Open Repository
```bash
# Clone if you haven't already
git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
cd AuraOS-Monorepo

# Open in Cursor
cursor .
```

### Step 2: Use Cursor AI
1. Press `Cmd/Ctrl + K` in Cursor
2. Paste the deployment prompt
3. Let Cursor execute the commands

---

## Method 4: Give Cursor Terminal Access

### In Cursor:
1. Open the integrated terminal: `Cmd/Ctrl + ~`
2. Cursor can execute commands in this terminal
3. Use Cursor AI chat to ask it to run deployment commands

### Example Conversation:
**You**: "Run these commands in the terminal: npm install -g pnpm firebase-tools, then pnpm install, then firebase login, then firebase deploy"

**Cursor**: *Executes the commands and shows output*

---

## Method 5: Use Cursor Composer (Best for Complex Tasks)

### Step 1: Open Composer
1. In Cursor, press `Cmd/Ctrl + Shift + I`
2. This opens Cursor Composer (multi-file editing mode)

### Step 2: Give Deployment Instructions
Paste this in Composer:

```
I need you to deploy the Content Generator MVP to Firebase.

Context:
- Repository: Already open in Cursor
- Firebase Project: selfos-62f70
- All code is complete and ready
- .env file is at: services/firebase/functions/.env

Tasks:
1. Install dependencies: pnpm install
2. Authenticate: firebase login
3. Deploy: firebase deploy
4. Provide live URL: https://selfos-62f70.web.app/content-generator

Execute these commands and give me the live URL.
```

---

## What Cursor Needs Access To

### ✅ Cursor Can Access:
- Files in the opened workspace
- Terminal commands (with your permission)
- Git operations
- File system in the workspace folder

### ❌ Cursor Cannot Access (Without Your Permission):
- Files outside the workspace
- System-wide settings
- Other applications
- Network requests (unless you approve)

---

## Permissions Cursor Will Ask For

When deploying, Cursor will ask permission to:
1. **Run terminal commands** - Click "Allow"
2. **Install npm packages** - Click "Allow"
3. **Execute firebase login** - This will open a browser for you to authenticate
4. **Deploy to Firebase** - Click "Allow"

---

## Quick Start Guide

### Fastest Way to Deploy with Cursor:

1. **Install Cursor**: https://cursor.sh
2. **Open Terminal** and run:
   ```bash
   git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
   cd AuraOS-Monorepo
   cursor .
   ```
3. **In Cursor**, press `Cmd/Ctrl + K` and paste:
   ```
   Deploy to Firebase. Project: selfos-62f70
   Run: pnpm install, firebase login, firebase deploy
   Give me the live URL.
   ```
4. **Approve** any permission requests
5. **Get the live URL** from Cursor

---

## Alternative: Use Cursor with GitHub Codespaces

### Step 1: Open in Codespaces
1. Go to: https://github.com/Moeabdelaziz007/AuraOS-Monorepo
2. Click "Code" → "Codespaces" → "Create codespace on main"
3. Wait for codespace to load

### Step 2: Open in Cursor
1. In the codespace, click the menu (three lines)
2. Select "Open in Cursor"
3. Cursor will open with the codespace connected

### Step 3: Deploy
Use Cursor AI to run deployment commands in the codespace terminal

---

## Troubleshooting

### "Cursor can't access the repository"
**Solution**: Make sure you've opened the folder in Cursor (File → Open Folder)

### "Cursor can't run commands"
**Solution**: 
1. Open integrated terminal: `Cmd/Ctrl + ~`
2. Give Cursor permission to execute commands
3. Or run commands manually and ask Cursor for guidance

### "Firebase login fails"
**Solution**:
1. Run `firebase login` manually in terminal
2. Complete authentication in browser
3. Then ask Cursor to continue with deployment

### "Build errors"
**Solution**: Ask Cursor:
```
There are build errors. Try this:
1. cd packages/ui
2. npx vite build
3. cd ../..
4. firebase deploy --only hosting
```

---

## Security Notes

### Safe to Share with Cursor:
✅ Repository code (it's already public on GitHub)
✅ Firebase project ID (selfos-62f70)
✅ Public URLs

### Keep Private:
❌ Don't share API keys in chat (they're already in .env file)
❌ Don't share Firebase service account JSON in chat
❌ Don't share personal credentials

**Note**: The .env file is already in the repository, so Cursor will have access to it when it opens the workspace. This is intentional for deployment.

---

## Summary

**Easiest Method**:
1. Install Cursor from https://cursor.sh
2. Clone repo: `git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git`
3. Open in Cursor: `cursor AuraOS-Monorepo`
4. Press `Cmd/Ctrl + K` and paste the deployment prompt
5. Approve permissions and get your live URL!

**Time Required**: 5-10 minutes
**Expected Result**: Live Content Generator at https://selfos-62f70.web.app/content-generator
