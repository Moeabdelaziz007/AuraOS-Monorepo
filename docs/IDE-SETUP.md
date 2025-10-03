# IDE Setup Guide for AuraOS

This guide helps you set up your development environment regardless of which IDE you use.

## Quick Start

```bash
# Run the automated setup script
npm run setup
```

This will:
- ✅ Check Node.js version
- ✅ Install dependencies
- ✅ Create .env from template
- ✅ Setup Git hooks
- ✅ Configure IDE-specific settings
- ✅ Run initial health checks

## Supported IDEs

- [VS Code / Cursor](#vs-code--cursor)
- [IntelliJ IDEA / WebStorm](#intellij-idea--webstorm)
- [Other IDEs](#other-ides)

---

## VS Code / Cursor

### Automatic Setup

1. Open the project:
   ```bash
   code .  # or: cursor .
   ```

2. Install recommended extensions when prompted

3. Settings are automatically applied from `.vscode/settings.json`

### Manual Setup

1. **Install Extensions**
   - Prettier - Code formatter
   - ESLint
   - Tailwind CSS IntelliSense
   - Error Lens
   - GitLens
   - GitHub Copilot (optional)

2. **Configure Settings**
   - Format on save: ✅ Enabled
   - ESLint auto-fix: ✅ Enabled
   - TypeScript version: Use workspace version

3. **Environment Variables**
   - Create `.env` from `.env.template`
   - VS Code will automatically load it

### Available Tasks

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type "Tasks: Run Task":

- **Build UI** - Build the project
- **Run Auto-Check** - Check for errors
- **Run Auto-Debug** - Fix common issues
- **Deploy to Firebase** - Deploy to production
- **Type Check** - Run TypeScript checks
- **Lint** - Run ESLint
- **Format Code** - Format all files

### Keyboard Shortcuts

- `F5` - Start debugging
- `Ctrl+Shift+B` - Build project
- `Ctrl+Shift+P` - Command palette
- `Ctrl+`` - Toggle terminal

---

## IntelliJ IDEA / WebStorm

### Automatic Setup

1. Open the project:
   ```bash
   idea .  # or open from IDE
   ```

2. Trust the project when prompted

3. Follow the setup wizard

### Manual Setup

See detailed instructions in [`.idea/workspace-setup.md`](../.idea/workspace-setup.md)

**Quick Steps:**

1. **Configure Node.js**
   - Settings → Languages & Frameworks → Node.js
   - Set interpreter to Node.js 18+

2. **Configure TypeScript**
   - Settings → Languages & Frameworks → TypeScript
   - Use TypeScript from project

3. **Configure ESLint**
   - Settings → JavaScript → Code Quality Tools → ESLint
   - Enable "Run eslint --fix on save"

4. **Configure Prettier**
   - Settings → JavaScript → Prettier
   - Enable "On save"

5. **Install Plugins**
   - EnvFile (for .env support)
   - Tailwind CSS
   - GitToolBox
   - GitHub Copilot (optional)

### Run Configurations

Create these run configurations:

1. **Dev Server**
   - Command: `npm run dev:desktop`
   - Shortcut: Shift+F10

2. **Build**
   - Command: `npm run build:desktop`
   - Shortcut: Ctrl+F9

3. **Auto-Check**
   - Command: `npm run auto-check`

4. **Deploy**
   - Command: `npm run auto-deploy`
   - Before launch: Run Auto-Check

---

## Other IDEs

### Sublime Text

1. Install Package Control
2. Install packages:
   - TypeScript
   - ESLint
   - Prettier
   - GitGutter

3. Configure build system:
   ```json
   {
     "cmd": ["npm", "run", "build:desktop"],
     "working_dir": "$project_path"
   }
   ```

### Vim / Neovim

1. Install plugins:
   - coc.nvim (LSP support)
   - vim-prettier
   - ale (linting)

2. Configure coc-settings.json:
   ```json
   {
     "tsserver.enable": true,
     "eslint.autoFixOnSave": true,
     "prettier.onSave": true
   }
   ```

### Emacs

1. Install packages:
   - tide (TypeScript)
   - flycheck (linting)
   - prettier-js

2. Configure .emacs:
   ```elisp
   (add-hook 'typescript-mode-hook #'tide-setup)
   (add-hook 'before-save-hook 'prettier-js)
   ```

---

## Common Configuration

### Environment Variables

All IDEs should load environment variables from `.env`:

```bash
# Copy template
cp .env.template .env

# Edit with your values
nano .env  # or your preferred editor
```

**Required variables:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_GEMINI_API_KEY`
- `FIREBASE_TOKEN` (for deployment)

### Git Configuration

All IDEs should respect `.gitignore`:

```
node_modules/
dist/
.env
.DS_Store
*.log
```

### TypeScript Configuration

All IDEs should use the workspace TypeScript version:

```bash
# Check version
npx tsc --version
```

### Formatting

All IDEs should use Prettier with these settings:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## Troubleshooting

### Issue: TypeScript errors not showing

**Solution:**
```bash
# VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# IntelliJ
File → Invalidate Caches → Restart
```

### Issue: ESLint not working

**Solution:**
```bash
# Check ESLint is installed
npm list eslint

# Reinstall if needed
npm install

# Run manually
npm run lint
```

### Issue: Environment variables not loading

**Solution:**
```bash
# Verify .env exists
ls -la .env

# Check format (no spaces around =)
cat .env

# Restart IDE
```

### Issue: Git push fails

**Solution:**
```bash
# Run checks first
npm run auto-check

# Fix issues
npm run auto-debug

# Try again
git push
```

### Issue: Build fails

**Solution:**
```bash
# Clean and rebuild
npm run clean
npm install
npm run build:desktop
```

### Issue: Port already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev:desktop
```

---

## Best Practices

### 1. Always Run Checks Before Committing

```bash
npm run auto-check
```

### 2. Use Auto-Debug for Quick Fixes

```bash
npm run auto-debug
```

### 3. Keep Dependencies Updated

```bash
npm outdated
npm update
```

### 4. Use Consistent Formatting

```bash
npm run format
```

### 5. Test Before Deploying

```bash
npm run auto-check && npm run auto-deploy
```

---

## Workspace Structure

```
AuraOS-Monorepo/
├── .vscode/              # VS Code configuration
│   ├── settings.json     # Editor settings
│   ├── extensions.json   # Recommended extensions
│   ├── launch.json       # Debug configurations
│   └── tasks.json        # Build tasks
├── .idea/                # IntelliJ IDEA configuration
│   └── workspace-setup.md
├── packages/             # Monorepo packages
│   ├── ui/              # Main UI application
│   ├── core/            # Core business logic
│   ├── firebase/        # Firebase integration
│   └── hooks/           # React hooks
├── scripts/             # Build and deployment scripts
│   ├── setup-workspace.sh
│   ├── auto-check.sh
│   ├── auto-debug.sh
│   └── auto-deploy.sh
├── .env                 # Environment variables (gitignored)
├── .env.template        # Environment template
└── package.json         # Root package configuration
```

---

## Useful Commands

### Development
```bash
npm run dev:desktop      # Start dev server
npm run build:desktop    # Build for production
npm run typecheck        # Check types
npm run lint             # Run linter
npm run format           # Format code
```

### Automation
```bash
npm run setup            # Setup workspace
npm run auto-check       # Check for errors
npm run auto-debug       # Fix common issues
npm run auto-deploy      # Deploy to Firebase
```

### Maintenance
```bash
npm run clean            # Clean build artifacts
npm install              # Install dependencies
npm update               # Update dependencies
```

---

## Getting Help

1. **Check Documentation**
   - [Automation Guide](./AUTOMATION.md)
   - [Deployment Summary](./DEPLOYMENT-SUMMARY.md)
   - [Main README](../README.md)

2. **Run Diagnostics**
   ```bash
   npm run auto-check
   ```

3. **Check Logs**
   ```bash
   # Development logs
   npm run dev:desktop

   # Build logs
   npm run build:desktop
   ```

4. **Common Issues**
   - See [Troubleshooting](#troubleshooting) section above

---

## IDE-Specific Features

### VS Code
- ✅ IntelliSense
- ✅ Debugging
- ✅ Git integration
- ✅ Extensions marketplace
- ✅ Integrated terminal

### IntelliJ IDEA
- ✅ Advanced refactoring
- ✅ Database tools
- ✅ HTTP client
- ✅ Profiler
- ✅ Code analysis

### Cursor
- ✅ AI-powered coding
- ✅ VS Code compatibility
- ✅ Natural language commands
- ✅ Code generation

---

**Last Updated**: October 3, 2025  
**Maintained By**: AuraOS Team
