# 🗂️ AuraOS Project Structure

Clean and organized overview of the AuraOS monorepo structure.

---

## 📁 Root Directory

```
AuraOS-Monorepo/
├── 📦 packages/          # Shared packages
├── 📱 apps/              # Applications
├── 🛠️ services/          # Backend services
├── 🔧 tools/             # Development tools
├── 📚 docs/              # Documentation
├── 🤖 .ai/               # AI agent configuration
├── 🔥 .firebase/         # Firebase cache
├── ⚙️ .devcontainer/     # Dev container config
├── 🚀 .github/           # GitHub workflows
└── 📝 Configuration files
```

---

## 📦 Packages (`packages/`)

Shared libraries used across the monorepo.

```
packages/
├── 🧠 ai/                    # MCP infrastructure
│   ├── src/
│   │   ├── gateway.ts        # MCP gateway
│   │   ├── server.ts         # MCP server
│   │   └── client.ts         # MCP client
│   └── README.md
│
├── 🤖 automation/            # Workflow engine
│   ├── src/
│   │   └── mcp/
│   │       └── workflow.ts   # Workflow logic
│   └── README.md
│
├── 💳 billing/               # Stripe integration
│   ├── src/
│   │   ├── checkout.ts       # Checkout sessions
│   │   ├── webhooks.ts       # Webhook handling
│   │   └── entitlements.ts  # Feature gating
│   └── README.md ✅
│
├── 🔧 common/                # Shared components
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   └── pages/            # Common pages
│   └── README.md
│
├── 📝 content-generator/     # AI content generation
│   ├── src/
│   │   ├── generator.ts      # Content generator
│   │   └── mcp-server.ts     # MCP server
│   └── README.md
│
├── 🎯 core/                  # Business logic
│   ├── src/
│   │   ├── ai/               # AI services
│   │   ├── mcp/              # MCP tools
│   │   ├── a2a/              # Agent-to-Agent
│   │   └── learning/         # Learning loop
│   └── README.md ✅
│
├── 🔥 firebase/              # Firebase services
│   ├── src/
│   │   ├── config/           # Firebase config
│   │   ├── services/         # Firestore services
│   │   └── types/            # TypeScript types
│   └── README.md ✅
│
├── 🪝 hooks/                 # React hooks
│   ├── src/
│   │   ├── useAI.ts          # AI hook
│   │   ├── useMCP.ts         # MCP hook
│   │   └── useAuth.ts        # Auth hook
│   └── README.md ✅
│
└── 🖥️ ui/                    # Desktop OS
    ├── src/
    │   ├── apps/             # Built-in apps
    │   ├── components/       # UI components
    │   ├── contexts/         # React contexts
    │   └── pages/            # Route pages
    └── README.md ✅
```

---

## 📱 Applications (`apps/`)

Standalone applications.

```
apps/
├── 🌐 landing-page/          # Marketing website
│   ├── src/
│   │   ├── components/       # Astro components
│   │   ├── layouts/          # Page layouts
│   │   └── pages/            # Route pages
│   └── README.md ✅
│
├── 🖥️ desktop/               # Desktop app
│   ├── src/
│   └── README.md
│
├── 💻 terminal/              # Terminal emulator
│   ├── src/
│   └── README.md
│
└── 🐛 debugger/              # Debugging tools
    ├── src/
    └── README.md
```

---

## 🛠️ Services (`services/`)

Backend services and APIs.

```
services/
├── 🔌 api/                   # REST API + Socket.io
│   ├── src/
│   │   └── index.js          # Main server
│   ├── tests/
│   │   └── api.test.js       # API tests
│   └── README.md ✅
│
├── 🔥 firebase/              # Cloud functions
│   ├── src/
│   │   └── index.ts          # Functions entry
│   └── README.md
│
├── 💬 telegram/              # Telegram bot
│   ├── src/
│   │   └── index.js          # Bot logic
│   └── README.md ✅
│
└── 🌐 websocket/             # WebSocket service
    ├── src/
    └── README.md
```

---

## 🔧 Tools (`tools/`)

Development and build tools.

```
tools/
├── 🔌 plugins/               # Custom plugins
│   └── sample-plugins/
│       └── external-api-plugin/
│
└── 🛠️ basic/                 # Basic tools
```

---

## 📚 Documentation (`docs/`)

Project documentation.

```
docs/
├── 📖 ARCHITECTURE.md        # System architecture
├── 🔌 API_REFERENCE.md ✅    # REST API docs
├── ⚡ SOCKET_IO_EVENTS.md ✅  # Socket.io events
├── 🧩 MCP_USAGE_GUIDE.md     # MCP integration
├── 🤝 A2A_SYSTEM.md          # Agent-to-Agent
├── 🚀 DEPLOYMENT-SUMMARY.md  # Deployment guide
├── 🔄 CI_CD_SETUP.md         # CI/CD setup
├── 💻 IDE-SETUP.md           # Editor setup
├── 📘 COMPLETE-SETUP-GUIDE.md # Setup guide
└── 🤖 AUTOMATION.md          # Automation guide
```

---

## 🤖 AI Configuration (`.ai/`)

AI agent instructions and prompts.

```
.ai/
├── INSTRUCTIONS.md           # AI agent guidelines
└── README.md                 # AI integration docs
```

---

## 🔥 Firebase (`.firebase/`)

Firebase deployment cache (gitignored).

```
.firebase/
└── hosting.*.cache           # Hosting cache files
```

---

## ⚙️ Dev Container (`.devcontainer/`)

Development container configuration.

```
.devcontainer/
├── devcontainer.json         # Container config
└── Dockerfile                # Container image
```

---

## 🚀 GitHub (`.github/`)

GitHub Actions workflows.

```
.github/
├── workflows/
│   ├── ci-cd.yml             # CI/CD pipeline
│   ├── deploy.yml            # Deployment workflow
│   └── test.yml              # Test workflow
│
└── ISSUE_TEMPLATE/           # Issue templates
```

---

## 📝 Configuration Files

### Root Level

```
AuraOS-Monorepo/
├── 📦 package.json           # Monorepo config
├── 📦 pnpm-workspace.yaml    # Workspace config
├── 🔒 pnpm-lock.yaml         # Lock file
├── 🔥 firebase.json          # Firebase config
├── 🔥 firestore.rules        # Firestore rules
├── 🔥 firestore.indexes.json # Firestore indexes
├── 🔥 storage.rules          # Storage rules
├── 📘 tsconfig.json          # TypeScript config
├── 📘 tsconfig.base.json     # Base TS config
├── 🎨 .prettierrc.json       # Prettier config
├── 🎨 .prettierignore        # Prettier ignore
├── 🔍 .eslintrc.json         # ESLint config
├── 🔍 .eslintignore          # ESLint ignore
├── 🚫 .gitignore             # Git ignore
├── 🌍 .env                   # Environment vars (gitignored)
├── 🌍 .env.template          # Env template
└── 📖 README.md              # Main README
```

---

## 📊 File Count Summary

| Category | Count | Status |
|----------|-------|--------|
| **Packages** | 10 | 5/10 documented ✅ |
| **Apps** | 4 | 1/4 documented ✅ |
| **Services** | 4 | 2/4 documented ✅ |
| **Docs** | 20+ | Well organized ✅ |
| **Tests** | 13 | Needs expansion ⚠️ |

---

## 🎯 Documentation Status

### ✅ Complete Documentation

- `packages/billing/README.md`
- `packages/core/README.md`
- `packages/firebase/README.md`
- `packages/hooks/README.md`
- `packages/ui/README.md`
- `services/api/README.md`
- `services/telegram/README.md`
- `apps/landing-page/README.md`
- `docs/API_REFERENCE.md`
- `docs/SOCKET_IO_EVENTS.md`
- `CONTRIBUTING.md`

### ⚠️ Needs Documentation

- `packages/ai/README.md`
- `packages/automation/README.md`
- `packages/common/README.md`
- `packages/content-generator/README.md`
- `services/firebase/README.md`
- `services/websocket/README.md`
- `apps/desktop/README.md`
- `apps/terminal/README.md`
- `apps/debugger/README.md`

---

## 🔍 Finding Files

### By Feature

**Authentication:**
- `packages/firebase/src/config/firebase.ts`
- `packages/common/src/contexts/AuthContext.tsx`

**Billing:**
- `packages/billing/src/`
- `packages/common/src/components/billing/`

**Desktop OS:**
- `packages/ui/src/DesktopOS.tsx`
- `packages/ui/src/components/Window.tsx`

**API:**
- `services/api/src/index.js`
- `docs/API_REFERENCE.md`

**AI Integration:**
- `packages/core/src/ai/`
- `packages/ai/src/`

---

## 📦 Package Dependencies

```
ui → hooks → core → firebase
  ↓     ↓      ↓
common ← ← ← ← ←

billing → (standalone)
ai → core
automation → ai, core
content-generator → ai, core
```

---

## 🚀 Build Order

1. **Core packages:** `firebase`, `core`, `hooks`
2. **Feature packages:** `billing`, `ai`, `automation`
3. **UI packages:** `common`, `ui`
4. **Applications:** `landing-page`, `desktop`
5. **Services:** `api`, `telegram`

---

## 📝 Naming Conventions

### Packages
- Format: `@auraos/<name>`
- Example: `@auraos/firebase`

### Files
- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Tests: `*.test.ts` or `*.spec.ts`

### Directories
- lowercase with hyphens
- Example: `user-profile/`

---

## 🔗 Quick Links

- [Documentation Index](./DOCUMENTATION_INDEX.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Week Plan](./WEEK_PLAN.md)
- [API Reference](./docs/API_REFERENCE.md)

---

**Last Updated:** October 3, 2025  
**Structure Version:** 1.0.0
