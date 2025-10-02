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
- pnpm 8+
- Docker & Docker Compose (for self-hosted AI)
- NVIDIA GPU with 8GB+ VRAM (optional, for vLLM)
- pnpm 8+
- Python 3.11+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
cd AuraOS-Monorepo

# Run setup script
./scripts/setup.sh

# Or manually:
pnpm install
./scripts/create-package-files.sh
```

### Integrate Components from Other Repos

```bash
# Run integration script to pull components from SelfOS, AIOS, etc.
./scripts/integrate-components.sh

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### AI Provider Setup

AuraOS supports two AI providers:

#### Option 1: Anthropic Claude (Cloud-based)

```bash
# Set API key
export ANTHROPIC_API_KEY="your-api-key-here"

# Or add to .env file
echo "AI_PROVIDER=anthropic" >> .env
echo "ANTHROPIC_API_KEY=your-api-key-here" >> .env
```

#### Option 2: vLLM (Self-hosted, Recommended)

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env and set:
#   AI_PROVIDER=vllm
#   VLLM_MODEL=meta-llama/Llama-3.1-8B-Instruct

# 2. Start vLLM service (requires NVIDIA GPU)
docker compose -f docker-compose.vllm.yml up -d

# 3. Wait for model download (first run only, ~10 minutes)
docker compose -f docker-compose.vllm.yml logs -f

# 4. Verify vLLM is running
curl http://localhost:8000/health
```

**Benefits of vLLM:**
- ✅ No API costs
- ✅ Complete privacy
- ✅ Works offline
- ✅ Customizable models

See [vLLM Setup Guide](docs/VLLM_SETUP_GUIDE.md) for detailed instructions.

### Development

```bash
# Start all services in development mode
pnpm dev

# Start specific package
pnpm --filter @auraos/ui dev

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

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
