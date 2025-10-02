# AuraOS Deployment Guide

Complete guide for deploying AuraOS to Firebase Hosting with full backend integration.

## 🎯 What's Been Completed

### ✅ v0 UI Integration
- **12 Desktop Components**: Complete desktop OS experience with window management
- **7 AI Applications**: Notes, Code Editor, File Manager, Terminal, Automation, Autopilot, Agents
- **50+ shadcn/ui Components**: Complete UI component library
- **Responsive Design**: Glassmorphism with cyberpunk color scheme
- **Animations**: Framer Motion for smooth transitions

### ✅ Backend Integration
- **Real AI Assistant**: Connected to Anthropic Claude and vLLM
- **MCP Servers**: FileSystem and Emulator Control servers
- **Type-Safe**: Full TypeScript with proper module resolution
- **ESM Compatible**: All packages output ES modules for Vite

### ✅ Firebase Package
- **Authentication**: Email/Password and Google Sign-in
- **Firestore**: User data, chat history, and projects
- **Storage**: File uploads and management
- **Real-time**: Live chat message synchronization

## 📦 Project Structure

```
AuraOS-Monorepo/
├── packages/
│   ├── ui/              # React frontend with v0 DesktopOS
│   ├── ai/              # AI assistant with MCP gateway
│   ├── core/            # MCP servers (FileSystem, Emulator)
│   └── firebase/        # Firebase services (Auth, Firestore)
├── docs/
│   ├── V0_INTEGRATION_SUMMARY.md
│   ├── FIREBASE_SETUP.md
│   └── DEPLOYMENT_GUIDE.md
└── firebase.json        # Firebase configuration
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build All Packages

```bash
pnpm -r build
```

### 3. Configure Environment

```bash
cp packages/ui/.env.example packages/ui/.env.local
```

Edit `.env.local` with your Firebase and AI credentials (see FIREBASE_SETUP.md).

### 4. Build UI for Production

```bash
cd packages/ui
pnpm build
```

### 5. Deploy to Firebase

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

## 🔧 Development Workflow

### Local Development with Emulators

```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start

# Terminal 2: Build packages in watch mode
pnpm -r --parallel dev
```

Access:
- **App**: http://localhost:5000
- **Emulator UI**: http://localhost:4000

### Testing Changes

1. Make changes to source files
2. Rebuild affected packages: `pnpm -r build`
3. Rebuild UI: `cd packages/ui && pnpm build`
4. Test locally with emulators
5. Deploy: `firebase deploy --only hosting`

## 📝 Environment Variables

### Required for Firebase

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Required for AI

```env
VITE_AI_PROVIDER=anthropic
VITE_ANTHROPIC_API_KEY=
```

### Optional for vLLM

```env
VITE_VLLM_URL=http://localhost:8000/v1
VITE_VLLM_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

## 🏗️ Build Process

### Package Build Order

1. **@auraos/ai** - AI assistant and MCP gateway
2. **@auraos/core** - MCP servers
3. **@auraos/firebase** - Firebase services
4. **@auraos/ui** - React frontend

### Build Commands

```bash
# Build all packages
pnpm -r build

# Build specific package
pnpm --filter @auraos/ui build

# Clean and rebuild
pnpm -r clean && pnpm -r build
```

## 🎨 UI Features

### Desktop OS
- **Window Management**: Drag, resize, minimize, maximize, close
- **Taskbar**: Show open windows, quick launch
- **Start Menu**: Application launcher
- **Quantum Wallpaper**: Animated background

### Applications
1. **AI Notes**: Smart note-taking with AI assistance
2. **AI Code Editor**: Code editing with AI suggestions
3. **AI File Manager**: File browser with AI operations
4. **AI Terminal**: Command-line interface
5. **AI Automation**: Workflow builder
6. **AI Autopilot**: Autonomous task execution
7. **AI Agents**: Multi-agent orchestration

### AI Chat
- Real-time AI responses
- Chat history persistence
- MCP tool integration
- File system access
- Emulator control

## 🔐 Security

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /projects/{projectId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## 📊 Monitoring

### Firebase Console
- **Authentication**: Monitor user sign-ups and logins
- **Firestore**: View database contents and queries
- **Hosting**: Check deployment history and traffic
- **Performance**: Monitor page load times

### Analytics
Enable Google Analytics in Firebase Console for:
- User engagement metrics
- Feature usage tracking
- Error monitoring

## 🐛 Troubleshooting

### Build Errors

**TypeScript errors in packages/ai or packages/core:**
```bash
cd packages/ai && pnpm build
cd packages/core && pnpm build
```

**Vite build fails:**
```bash
cd packages/ui
rm -rf node_modules dist
pnpm install
pnpm build
```

### Deployment Issues

**Firebase CLI not found:**
```bash
npm install -g firebase-tools
firebase login
```

**Wrong project selected:**
```bash
firebase use your-project-id
```

**Hosting 404 errors:**
- Check `firebase.json` public directory points to `packages/ui/dist`
- Verify SPA rewrite rules are configured
- Rebuild UI: `cd packages/ui && pnpm build`

### Runtime Errors

**"Firebase not initialized":**
- Ensure `.env.local` has all Firebase config variables
- Check that `initializeFirebase()` is called in App.tsx

**AI not responding:**
- Verify `VITE_ANTHROPIC_API_KEY` is set
- Check API key is valid in Anthropic Console
- Review browser console for errors

## 🚢 Production Checklist

- [ ] All environment variables configured
- [ ] Firebase project created and configured
- [ ] Authentication providers enabled
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] All packages built successfully
- [ ] UI built for production
- [ ] Tested locally with emulators
- [ ] Deployed to Firebase Hosting
- [ ] Verified deployment at live URL
- [ ] Tested authentication flow
- [ ] Tested AI chat functionality
- [ ] Tested file operations
- [ ] Monitored for errors in console

## 📚 Additional Resources

- [V0 Integration Summary](./V0_INTEGRATION_SUMMARY.md)
- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

## 🎉 Success!

Your AuraOS deployment is complete! You now have:
- ✅ Full desktop OS experience in the browser
- ✅ 7 AI-powered applications
- ✅ Real-time chat with AI assistant
- ✅ User authentication and data persistence
- ✅ File system and emulator control
- ✅ Production-ready hosting on Firebase

Access your deployment at: `https://your-project-id.web.app`

Enjoy your AI-powered operating system! 🚀
