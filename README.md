# AuraOS Monorepo

> Complete Operating System with AI Integration - Bridging Vintage Computing with Modern Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)

## 🌟 Overview

AuraOS is a revolutionary operating system that combines:
- 🕹️ **Vintage Computing** - 6502 CPU emulation and BASIC interpreter
- 🤖 **Modern AI** - Advanced AI engine with multiple provider support
- ⚡ **Automation** - n8n-style workflow automation with 400+ connectors
- 🎨 **Beautiful UI** - React-based desktop environment
- 🔧 **Developer Tools** - Visual debugger, plugin system, and more

## 📁 Project Structure

```
AuraOS-Monorepo/
├── packages/          # Core packages
│   ├── core/         # Kernel and system components
│   ├── ui/           # User interface components
│   ├── ai/           # AI engine
│   ├── automation/   # Workflow automation
│   └── common/       # Shared utilities
├── apps/             # Applications
│   ├── desktop/      # Desktop environment
│   ├── terminal/     # Terminal emulator
│   └── debugger/     # Visual debugger
├── services/         # Backend services
│   ├── api/          # API server
│   ├── websocket/    # Real-time communication
│   └── firebase/     # Cloud services
├── tools/            # Development tools
│   ├── emulator/     # 6502 emulator
│   ├── basic/        # BASIC interpreter
│   └── plugins/      # Plugin system
├── docs/             # Documentation
├── tests/            # Test suites
└── scripts/          # Build and deployment scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 10+ or pnpm 8+
- Python 3.11+ (optional, for backend)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
cd AuraOS-Monorepo

# Install dependencies
npm install
# or
pnpm install
```

### Run Desktop OS

```bash
# Start the desktop environment
npm run dev:desktop

# Or
cd packages/ui
npm install
npm run dev
```

Open your browser to http://localhost:5173

### Integrate Components from Other Repos

```bash
# Run integration script to pull components from SelfOS, AIOS, etc.
./scripts/integrate-components.sh

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Start desktop environment
npm run dev:desktop

# Build for production
npm run build:desktop

# Deploy to Firebase
npm run deploy

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Deployment

```bash
# Build and deploy to Firebase
./scripts/deploy-desktop.sh

# Or manually
cd packages/ui
npm run build
firebase deploy --only hosting
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

## 📦 Packages

### Core Packages

- **@auraos/core** - Kernel, memory management, process management
- **@auraos/ui** - React components, desktop environment
- **@auraos/ai** - AI engine with hybrid architecture
- **@auraos/automation** - Workflow automation engine
- **@auraos/common** - Shared utilities and types

### Applications

- **@auraos/desktop** - Desktop environment and window manager
- **@auraos/terminal** - Terminal emulator with BASIC support
- **@auraos/debugger** - Visual debugger for 6502 code

### Services

- **@auraos/api** - Backend API server (FastAPI/Express)
- **@auraos/websocket** - Real-time communication server
- **@auraos/firebase** - Cloud services integration

### Tools

- **@auraos/emulator** - 6502 CPU emulator
- **@auraos/basic** - Microsoft BASIC interpreter
- **@auraos/plugins** - Plugin system and hot reload

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + Framer Motion
- Zustand (state management)

### Backend
- Python FastAPI
- Node.js + Express
- WebSocket
- Firebase (Firestore, Auth)

### AI/ML
- Hybrid AI architecture
- Multiple provider support (OpenAI, Claude, Grok)
- Quantized inference (INT8/FP16)

### DevOps
- pnpm workspaces
- GitHub Actions
- ESLint + Prettier
- Vitest + Jest

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Component Analysis](./OS_COMPONENTS_ANALYSIS.md)
- [Repository Valuation](./REPOSITORY_VALUATION_REPORT.md)
- [API Documentation](./docs/API.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)

## 🎯 Features

### ✅ Implemented
- 6502 CPU emulation
- BASIC interpreter
- React UI framework
- Python backend
- AI engine
- Plugin system
- Real-time collaboration
- Visual debugger

### 🚧 In Progress
- File system (VFS)
- Device drivers
- Network stack
- Boot loader
- Package manager

### 📋 Planned
- Multi-user support
- Security layer
- System utilities
- Network utilities

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Microsoft BASIC for 6502 (original source)
- n8n workflow automation (inspiration)
- React and TypeScript communities
- All contributors and supporters

## 📞 Contact

- **Author:** Mohamed Abdelaziz
- **GitHub:** [@Moeabdelaziz007](https://github.com/Moeabdelaziz007)

---

**Made with ❤️ by the AuraOS Team**
