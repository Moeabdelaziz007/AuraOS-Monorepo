# 📚 AuraOS Documentation Index

Complete guide to all AuraOS documentation - organized by topic for easy navigation.

---

## 🚀 Quick Start

**New to AuraOS? Start here:**

| Document | Description | Time |
|----------|-------------|------|
| [Quick Start Guide](./QUICK-START.md) | Get up and running in 30 seconds | 5 min |
| [Complete Setup Guide](./docs/COMPLETE-SETUP-GUIDE.md) | Detailed installation and configuration | 15 min |
| [Week Plan](./WEEK_PLAN.md) | Current development sprint plan | 5 min |

---

## 📦 Package Documentation

### Core Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| **@auraos/core** | Business logic and AI services | [README](./packages/core/README.md) |
| **@auraos/ui** | Desktop OS and window manager | [README](./packages/ui/README.md) |
| **@auraos/firebase** | Firestore services and auth | [README](./packages/firebase/README.md) |
| **@auraos/hooks** | React hooks and state management | [README](./packages/hooks/README.md) |
| **@auraos/common** | Shared components and utilities | [README](./packages/common/README.md) |

### Feature Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| **@auraos/billing** | Stripe integration and subscriptions | [README](./packages/billing/README.md) |
| **@auraos/ai** | MCP infrastructure and AI gateway | [README](./packages/ai/README.md) |
| **@auraos/automation** | Workflow engine and automation | [README](./packages/automation/README.md) |
| **@auraos/content-generator** | AI content generation | [README](./packages/content-generator/README.md) |

---

## 🛠️ Services Documentation

| Service | Description | Documentation |
|---------|-------------|---------------|
| **API Server** | REST API and Socket.io | [README](./services/api/README.md) |
| **Firebase Functions** | Cloud functions | [README](./services/firebase/README.md) |
| **Telegram Bot** | Telegram integration | [README](./services/telegram/README.md) |
| **WebSocket** | Real-time communication | [README](./services/websocket/README.md) |

---

## 📱 Applications

| App | Description | Documentation |
|-----|-------------|---------------|
| **Landing Page** | Marketing website | [README](./apps/landing-page/README.md) |
| **Desktop** | Desktop OS application | [README](./apps/desktop/README.md) |
| **Terminal** | Terminal emulator | [README](./apps/terminal/README.md) |
| **Debugger** | Debugging tools | [README](./apps/debugger/README.md) |

---

## 🔌 API Documentation

### REST API

| Document | Description |
|----------|-------------|
| [API Reference](./docs/API_REFERENCE.md) | Complete REST API documentation |
| [Socket.io Events](./docs/SOCKET_IO_EVENTS.md) | Real-time events reference |

### Endpoints

- **Health & Config** - System status and configuration
- **Apps API** - Application CRUD operations
- **System API** - System monitoring and logs
- **Chat API** - Real-time chat and messaging

---

## 🏗️ Architecture & Design

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | System architecture overview |
| [MCP Usage Guide](./docs/MCP_USAGE_GUIDE.md) | Model Context Protocol integration |
| [A2A System](./docs/A2A_SYSTEM.md) | Agent-to-Agent communication |
| [Firestore Schema](./FIRESTORE_SCHEMA.md) | Database schema documentation |

---

## 🔐 Security & Authentication

| Document | Description |
|----------|-------------|
| [Firebase Auth Guide](./FIREBASE_AUTH_GUIDE.md) | Authentication setup |
| [Security Setup](./docs/FIREBASE_SECURITY_SETUP.md) | Security rules and best practices |
| [Billing Security](./packages/billing/README.md#security-considerations) | Payment security |

---

## 🚀 Deployment

| Document | Description |
|----------|-------------|
| [Deployment Summary](./docs/DEPLOYMENT-SUMMARY.md) | Deployment overview |
| [CI/CD Setup](./docs/CI_CD_SETUP.md) | Continuous integration setup |
| [Firebase Deployment](./FIREBASE_DEPLOYMENT.md) | Firebase hosting deployment |
| [Automation Guide](./docs/AUTOMATION.md) | Auto-deploy scripts |

---

## 💻 Development

### Getting Started

| Document | Description |
|----------|-------------|
| [Contributing Guide](./CONTRIBUTING.md) | How to contribute |
| [IDE Setup](./docs/IDE-SETUP.md) | Editor configuration |
| [Development Guide](./DEVELOPMENT.md) | Development workflow |

### Testing

| Document | Description |
|----------|-------------|
| [Testing Guide](./docs/TESTING_GUIDE.md) | Testing strategy and examples |
| [Test Plan](./CONTENT_GENERATOR_TEST_PLAN.md) | Content generator tests |

### AI Integration

| Document | Description |
|----------|-------------|
| [AI Instructions](./.ai/INSTRUCTIONS.md) | AI agent guidelines |
| [Cursor Prompt](./CURSOR_PROMPT.txt) | Cursor AI configuration |

---

## 📊 Features & Status

| Document | Description |
|----------|-------------|
| [Feature Summary](./FEATURE_SUMMARY.md) | Implemented features |
| [Status Report](./AURAOS_STATUS_REPORT.md) | Current project status |
| [Phase 2 Complete](./PHASE2_COMPLETE.md) | Phase 2 achievements |
| [Desktop Shell Complete](./DESKTOP_SHELL_COMPLETE.md) | Desktop OS completion |

---

## 💳 Subscription & Billing

| Document | Description |
|----------|-------------|
| [Subscription System](./SUBSCRIPTION_SYSTEM.md) | Subscription tiers and features |
| [Payment Strategy](./PAYMENT_AND_FEATURES_STRATEGY.md) | Monetization strategy |
| [Billing Package](./packages/billing/README.md) | Stripe integration |

---

## 🎯 Guides & Tutorials

### User Guides

| Guide | Description |
|-------|-------------|
| [Desktop OS Guide](./packages/ui/DESKTOP_OS_GUIDE.md) | Using the desktop environment |
| [Telegram Bot Guide](./services/telegram/README.md) | Using the Telegram bot |

### Developer Guides

| Guide | Description |
|-------|-------------|
| [MCP Integration](./docs/MCP_USAGE_GUIDE.md) | Integrating MCP tools |
| [Content Generator](./CONTENT_GENERATOR_UI.md) | Content generation UI |
| [Gitpod Guide](./GITPOD_GUIDE.md) | Using Gitpod for development |

---

## 🔧 Configuration

| Document | Description |
|----------|-------------|
| [Environment Template](./.env.template) | Required environment variables |
| [Firebase Config](./firebase.json) | Firebase configuration |
| [Package Config](./package.json) | Monorepo configuration |

---

## 📝 Checklists & Plans

| Document | Description |
|----------|-------------|
| [Week Plan](./WEEK_PLAN.md) | Current week development plan |
| [Daily Tasks](./DAILY_TASKS.md) | Today's task list |
| [Deploy Checklist](./DEPLOY_CHECKLIST.md) | Pre-deployment checklist |
| [Component Checklist](./packages/ui/COMPONENT_CHECKLIST.md) | UI component status |

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Firebase connection errors | Check [Firebase Auth Guide](./FIREBASE_AUTH_GUIDE.md) |
| Build failures | See [Development Guide](./DEVELOPMENT.md) |
| Deployment issues | Check [Deployment Summary](./docs/DEPLOYMENT-SUMMARY.md) |
| API errors | See [API Reference](./docs/API_REFERENCE.md) |

### Package-Specific

- **Billing Issues:** [Billing Troubleshooting](./packages/billing/README.md#troubleshooting)
- **Firebase Issues:** [Firebase Troubleshooting](./packages/firebase/README.md#troubleshooting)
- **API Issues:** [API Troubleshooting](./services/api/README.md#troubleshooting)

---

## 📖 External Resources

| Resource | Link |
|----------|------|
| **Firebase Docs** | https://firebase.google.com/docs |
| **Stripe Docs** | https://stripe.com/docs |
| **React Docs** | https://react.dev |
| **TypeScript Docs** | https://www.typescriptlang.org/docs |
| **Vite Docs** | https://vitejs.dev |

---

## 🗺️ Documentation Map

```
AuraOS-Monorepo/
│
├── 📘 Getting Started
│   ├── README.md (Main overview)
│   ├── QUICK-START.md (30-second setup)
│   └── docs/COMPLETE-SETUP-GUIDE.md (Detailed setup)
│
├── 📦 Packages
│   ├── packages/*/README.md (Package docs)
│   └── Package-specific guides
│
├── 🛠️ Services
│   ├── services/*/README.md (Service docs)
│   └── API documentation
│
├── 🏗️ Architecture
│   ├── docs/ARCHITECTURE.md
│   ├── docs/MCP_USAGE_GUIDE.md
│   └── docs/A2A_SYSTEM.md
│
├── 🚀 Deployment
│   ├── docs/DEPLOYMENT-SUMMARY.md
│   ├── docs/CI_CD_SETUP.md
│   └── Deployment guides
│
├── 💻 Development
│   ├── CONTRIBUTING.md
│   ├── docs/IDE-SETUP.md
│   └── Development guides
│
└── 📊 Status & Plans
    ├── WEEK_PLAN.md
    ├── DAILY_TASKS.md
    └── Status reports
```

---

## 🔍 Search Tips

### Finding Documentation

**By Topic:**
- Authentication → [Firebase Auth Guide](./FIREBASE_AUTH_GUIDE.md)
- API → [API Reference](./docs/API_REFERENCE.md)
- Deployment → [Deployment Summary](./docs/DEPLOYMENT-SUMMARY.md)
- Testing → [Testing Guide](./docs/TESTING_GUIDE.md)

**By Package:**
- Use package README: `packages/<package-name>/README.md`

**By Service:**
- Use service README: `services/<service-name>/README.md`

**By Feature:**
- Check [Feature Summary](./FEATURE_SUMMARY.md)

---

## 📞 Need Help?

1. **Check this index** for relevant documentation
2. **Search existing docs** using the map above
3. **Check troubleshooting** sections in package READMEs
4. **Open an issue** on GitHub if you can't find what you need

---

## 🔄 Keeping Documentation Updated

When adding new features:
1. Update relevant package README
2. Add API documentation if applicable
3. Update this index
4. Add examples and usage guides
5. Update troubleshooting sections

---

**Last Updated:** October 3, 2025  
**Documentation Version:** 1.0.0

---

**Made with ❤️ for AuraOS**
