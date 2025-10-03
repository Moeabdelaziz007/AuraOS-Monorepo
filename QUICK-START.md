# 🚀 AuraOS Quick Start Guide

**For Developers, AI Agents, and IDEs**

This is the **ONLY** file you need to read to get started. Everything is automated.

---

## ⚡ Super Quick Start (30 seconds)

```bash
# 1. Clone the repo
git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
cd AuraOS-Monorepo

# 2. Run setup (does everything automatically)
npm run setup

# 3. Start developing
npm run dev:desktop
```

**That's it!** Open http://localhost:3000

---

## 🤖 For AI Agents (Claude, GPT, Copilot, etc.)

### What You Need to Know

1. **This is a monorepo** - Multiple packages in one repo
2. **Main app is in** `packages/ui/` - React + TypeScript + Vite
3. **All scripts are automated** - Just run npm commands
4. **Environment variables** - Copy `.env.template` to `.env`

### Common Tasks

```bash
# Check for errors
npm run auto-check

# Fix common issues automatically
npm run auto-debug

# Deploy to Firebase
npm run auto-deploy "your commit message"

# Build for production
npm run build:desktop
```

### File Structure (What to Edit)

```
packages/ui/src/          ← Main application code
├── components/           ← React components
├── pages/               ← Page components
├── hooks/               ← Custom React hooks
├── lib/                 ← Utilities and helpers
└── App.tsx              ← Main app component

packages/core/src/        ← Business logic
├── ai/                  ← AI services
├── mcp/                 ← MCP tools
└── learning/            ← Learning loop

firestore.rules          ← Database security rules
firebase.json            ← Firebase configuration
```

### Before Making Changes

```bash
# Always check first
npm run auto-check

# If errors, auto-fix them
npm run auto-debug
```

### After Making Changes

```bash
# Check, commit, and deploy (all in one)
npm run auto-deploy "feat: your description"
```

---

## 💻 For Developers

### First Time Setup

```bash
# 1. Install Node.js 18+ from https://nodejs.org/

# 2. Clone and setup
git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
cd AuraOS-Monorepo
npm run setup

# 3. Configure environment
cp .env.template .env
# Edit .env with your API keys

# 4. Start development
npm run dev:desktop
```

### Daily Workflow

```bash
# Morning: Pull latest changes
git pull

# Start development server
npm run dev:desktop

# Make your changes...

# Before committing: Check for errors
npm run auto-check

# If errors: Auto-fix them
npm run auto-debug

# Commit and deploy
npm run auto-deploy "feat: your feature"
```

### Essential Commands

| Command | What It Does |
|---------|-------------|
| `npm run setup` | Setup workspace (first time only) |
| `npm run dev:desktop` | Start development server |
| `npm run build:desktop` | Build for production |
| `npm run auto-check` | Check for errors |
| `npm run auto-debug` | Fix common issues |
| `npm run auto-deploy` | Commit, push, and deploy |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## 🎨 For Different IDEs

### VS Code / Cursor

```bash
# Open project
code .  # or: cursor .

# Install recommended extensions (when prompted)
# Everything else is automatic!
```

**Keyboard Shortcuts:**
- `F5` - Start debugging
- `Ctrl+Shift+B` - Build
- `Ctrl+Shift+P` - Command palette

### IntelliJ IDEA / WebStorm

```bash
# Open project
idea .  # or: File → Open

# Trust project when prompted
# Install recommended plugins
```

**See:** `.idea/workspace-setup.md` for detailed setup

### Other IDEs

```bash
# Just run setup
npm run setup

# Then use your IDE normally
# All configuration is in standard files:
# - tsconfig.json (TypeScript)
# - .eslintrc (ESLint)
# - .prettierrc (Prettier)
```

---

## 🔧 Configuration Files (Don't Touch Unless You Know What You're Doing)

| File | Purpose | Edit? |
|------|---------|-------|
| `.env` | Your secrets and API keys | ✅ YES (but never commit) |
| `.env.template` | Template for .env | ✅ YES (to add new variables) |
| `package.json` | Dependencies and scripts | ⚠️ CAREFUL |
| `firebase.json` | Firebase configuration | ⚠️ CAREFUL |
| `firestore.rules` | Database security | ✅ YES (for new collections) |
| `tsconfig.json` | TypeScript config | ❌ NO (unless you know TypeScript) |
| `.vscode/*` | VS Code settings | ✅ YES (for your preferences) |
| `.idea/*` | IntelliJ settings | ✅ YES (for your preferences) |

---

## 🚨 Common Issues & Solutions

### Issue: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill the process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev:desktop
```

### Issue: "Firebase token not set"

**Solution:**
```bash
# 1. Login to Firebase
firebase login:ci

# 2. Copy the token

# 3. Add to .env
echo 'FIREBASE_TOKEN=your_token_here' >> .env

# 4. Restart terminal
```

### Issue: "TypeScript errors"

**Solution:**
```bash
# Auto-fix common issues
npm run auto-debug

# Check what's wrong
npm run typecheck

# If still broken, reinstall
npm run clean
npm install
```

### Issue: "Git push rejected"

**Solution:**
```bash
# Check for secrets in code
npm run auto-check

# Fix issues
npm run auto-debug

# Try again
git push
```

### Issue: "Build fails"

**Solution:**
```bash
# Clean everything
npm run clean

# Reinstall
npm install

# Try building again
npm run build:desktop
```

---

## 📁 Project Structure (Simple View)

```
AuraOS-Monorepo/
│
├── packages/ui/          ← Main app (edit here)
│   └── src/
│       ├── components/   ← UI components
│       ├── pages/        ← Pages
│       └── App.tsx       ← Main app
│
├── packages/core/        ← Business logic
│   └── src/
│       ├── ai/          ← AI services
│       └── learning/    ← Learning system
│
├── scripts/             ← Automation scripts
│   ├── setup-workspace.sh
│   ├── auto-check.sh
│   ├── auto-debug.sh
│   └── auto-deploy.sh
│
├── .env                 ← Your secrets (never commit!)
├── .env.template        ← Template for .env
├── package.json         ← Dependencies
├── firebase.json        ← Firebase config
└── firestore.rules      ← Database rules
```

---

## 🎯 What to Edit for Common Tasks

### Adding a New Feature

1. **Create component** in `packages/ui/src/components/`
2. **Add page** in `packages/ui/src/pages/`
3. **Update routes** in `packages/ui/src/App.tsx`
4. **Test** with `npm run dev:desktop`
5. **Deploy** with `npm run auto-deploy "feat: new feature"`

### Fixing a Bug

1. **Find the file** (use IDE search)
2. **Make the fix**
3. **Test** with `npm run dev:desktop`
4. **Check** with `npm run auto-check`
5. **Deploy** with `npm run auto-deploy "fix: bug description"`

### Adding AI Functionality

1. **Edit** `packages/core/src/ai/`
2. **Add API key** to `.env`
3. **Test** with `npm run dev:desktop`
4. **Deploy** with `npm run auto-deploy "feat: ai feature"`

### Updating Database Rules

1. **Edit** `firestore.rules`
2. **Test** with Firebase emulator
3. **Deploy** with `npm run auto-deploy "feat: update rules"`

### Adding Environment Variable

1. **Add to** `.env.template`
2. **Add to** `.env`
3. **Use in code** with `import.meta.env.VITE_YOUR_VAR`
4. **Document** in `.env.template`

---

## 🔐 Security Checklist

- [ ] Never commit `.env` file
- [ ] Never hardcode API keys in code
- [ ] Always use `import.meta.env.VITE_*` for frontend
- [ ] Run `npm run auto-check` before committing
- [ ] Keep Firebase token secret
- [ ] Update `firestore.rules` for new collections
- [ ] Use environment-specific configs

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `QUICK-START.md` | This file - start here! |
| `README.md` | Project overview |
| `docs/AUTOMATION.md` | Automation system details |
| `docs/IDE-SETUP.md` | IDE-specific setup |
| `docs/DEPLOYMENT-SUMMARY.md` | Deployment info |
| `.env.template` | Environment variables |
| `.idea/workspace-setup.md` | IntelliJ setup |

---

## 🆘 Getting Help

### 1. Run Diagnostics

```bash
npm run auto-check
```

### 2. Try Auto-Fix

```bash
npm run auto-debug
```

### 3. Check Documentation

- Read `docs/AUTOMATION.md`
- Read `docs/IDE-SETUP.md`
- Check `.env.template`

### 4. Common Commands

```bash
# See all available commands
npm run

# Check Node version
node -v

# Check npm version
npm -v

# Check Git status
git status

# View recent commits
git log --oneline -5
```

---

## 🎓 Learning Resources

### For Beginners

1. **Node.js**: https://nodejs.org/en/learn
2. **React**: https://react.dev/learn
3. **TypeScript**: https://www.typescriptlang.org/docs/
4. **Firebase**: https://firebase.google.com/docs

### For This Project

1. **Start with**: `packages/ui/src/App.tsx`
2. **Understand**: Component structure
3. **Learn**: How state management works
4. **Explore**: AI integration in `packages/core/`

---

## ✅ Quick Checklist

### Before You Start

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] IDE installed (VS Code, IntelliJ, etc.)
- [ ] Firebase account (for deployment)

### First Time Setup

- [ ] Clone repository
- [ ] Run `npm run setup`
- [ ] Copy `.env.template` to `.env`
- [ ] Add your API keys to `.env`
- [ ] Run `npm run dev:desktop`
- [ ] Open http://localhost:3000

### Before Every Commit

- [ ] Run `npm run auto-check`
- [ ] Fix any errors
- [ ] Test your changes
- [ ] Write descriptive commit message

### Before Deployment

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] `.env` not committed
- [ ] Firebase token set

---

## 🚀 Ready to Start?

```bash
# Clone
git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
cd AuraOS-Monorepo

# Setup
npm run setup

# Develop
npm run dev:desktop

# Deploy
npm run auto-deploy "your message"
```

**That's all you need!** Everything else is automated.

---

## 💡 Pro Tips

1. **Use auto-check often** - Catches errors early
2. **Use auto-debug** - Fixes most issues automatically
3. **Read error messages** - They usually tell you what's wrong
4. **Keep .env updated** - Add new variables to template
5. **Commit often** - Small commits are easier to review
6. **Use descriptive messages** - "feat:", "fix:", "docs:", etc.
7. **Test before deploying** - Run `npm run auto-check`
8. **Keep dependencies updated** - Run `npm update` monthly

---

**Last Updated**: October 3, 2025  
**Maintained By**: AuraOS Team  
**Questions?** Check `docs/` folder for detailed guides
