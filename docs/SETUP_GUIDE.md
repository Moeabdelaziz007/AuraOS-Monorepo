# AuraOS Monorepo - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (Install: `npm install -g pnpm`)
- **Python** 3.11+ ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Moeabdelaziz007/AuraOS-Monorepo.git
cd AuraOS-Monorepo
```

### 2. Install pnpm (if not installed)

```bash
npm install -g pnpm
```

### 3. Run Setup Script

```bash
./scripts/setup.sh
```

This will:
- Install all dependencies
- Create package.json files for all packages
- Build the initial structure

### 4. Integrate Components (Optional)

If you want to pull components from the original repositories:

```bash
./scripts/integrate-components.sh
```

This will clone and integrate:
- SelfOS (6502 emulator, UI, AI engine)
- AIOS (Firebase backend, authentication)
- BASIC-M6502 (BASIC interpreter)
- auraos (Automation, workflows)

## Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create Package Files

```bash
./scripts/create-package-files.sh
```

### 3. Build Packages

```bash
pnpm build
```

## Development

### Start All Services

```bash
pnpm dev
```

This starts all packages in development mode with hot reload.

### Start Specific Package

```bash
# Start UI package only
pnpm --filter @auraos/ui dev

# Start API service only
pnpm --filter @auraos/api dev

# Start desktop app only
pnpm --filter @auraos/desktop dev
```

### Build for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @auraos/core build
```

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @auraos/core test

# Run tests with coverage
pnpm test -- --coverage
```

### Linting and Formatting

```bash
# Lint all code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format all code
pnpm format

# Type check
pnpm typecheck
```

## Project Structure

```
AuraOS-Monorepo/
├── packages/              # Core packages
│   ├── core/             # @auraos/core - Kernel and system
│   ├── ui/               # @auraos/ui - UI components
│   ├── ai/               # @auraos/ai - AI engine
│   ├── automation/       # @auraos/automation - Workflows
│   └── common/           # @auraos/common - Shared utilities
├── apps/                 # Applications
│   ├── desktop/          # @auraos/desktop - Desktop environment
│   ├── terminal/         # @auraos/terminal - Terminal emulator
│   └── debugger/         # @auraos/debugger - Visual debugger
├── services/             # Backend services
│   ├── api/              # @auraos/api - API server
│   ├── websocket/        # @auraos/websocket - Real-time
│   └── firebase/         # @auraos/firebase - Cloud services
├── tools/                # Development tools
│   ├── emulator/         # @auraos/emulator - 6502 emulator
│   ├── basic/            # @auraos/basic - BASIC interpreter
│   └── plugins/          # @auraos/plugins - Plugin system
├── docs/                 # Documentation
├── tests/                # Test suites
└── scripts/              # Build scripts
```

## Package Dependencies

### Internal Dependencies

Packages can depend on each other:

```json
{
  "dependencies": {
    "@auraos/common": "workspace:*",
    "@auraos/core": "workspace:*"
  }
}
```

### Adding External Dependencies

```bash
# Add to specific package
pnpm --filter @auraos/ui add react react-dom

# Add to root (dev dependencies)
pnpm add -D -w typescript

# Add to all packages
pnpm -r add lodash
```

## Common Commands

### Workspace Management

```bash
# List all packages
pnpm list -r --depth 0

# Run command in all packages
pnpm -r <command>

# Run command in parallel
pnpm -r --parallel <command>

# Run command in specific package
pnpm --filter <package-name> <command>
```

### Cleaning

```bash
# Clean all build artifacts
pnpm clean

# Clean and reinstall
pnpm clean && pnpm install

# Remove node_modules completely
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install
```

## Troubleshooting

### pnpm not found

```bash
npm install -g pnpm
```

### Permission errors

```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.pnpm-store
```

### Build errors

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### TypeScript errors

```bash
# Check types
pnpm typecheck

# Clean TypeScript cache
rm -rf packages/*/tsconfig.tsbuildinfo
pnpm build
```

### Port conflicts

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

## Environment Variables

Create a `.env` file in the root:

```env
# API Configuration
API_URL=http://localhost:5000
WS_URL=ws://localhost:5000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id

# AI Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Next Steps

1. ✅ Complete setup
2. 📚 Read [Architecture Overview](./ARCHITECTURE.md)
3. 🔧 Start developing your first feature
4. 🧪 Write tests
5. 📝 Update documentation

## Getting Help

- 📖 [Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues)
- 💬 [Discussions](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/discussions)

---

**Happy Coding! 🚀**
