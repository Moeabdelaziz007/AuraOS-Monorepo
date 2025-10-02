#!/bin/bash

set -e

echo "📦 Creating package.json files for all packages..."

# Function to create package.json
create_package_json() {
    local dir=$1
    local name=$2
    local description=$3
    
    cat > "$dir/package.json" << EOF
{
  "name": "@auraos/$name",
  "version": "1.0.0",
  "description": "$description",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "dev": "tsc --watch",
    "build": "tsc",
    "test": "vitest",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  },
  "keywords": ["auraos", "$name"],
  "author": "Mohamed Abdelaziz",
  "license": "MIT"
}
EOF
    
    # Create tsconfig.json
    cat > "$dir/tsconfig.json" << EOF
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
EOF

    # Create src directory and index file
    mkdir -p "$dir/src"
    if [ ! -f "$dir/src/index.ts" ]; then
        echo "export {};" > "$dir/src/index.ts"
    fi
    
    echo "  ✓ Created $name"
}

# Create package files for packages
create_package_json "packages/core" "core" "AuraOS Core - Kernel and system components"
create_package_json "packages/ui" "ui" "AuraOS UI - User interface components"
create_package_json "packages/ai" "ai" "AuraOS AI - Artificial intelligence engine"
create_package_json "packages/automation" "automation" "AuraOS Automation - Workflow automation"
create_package_json "packages/common" "common" "AuraOS Common - Shared utilities"

# Create package files for apps
create_package_json "apps/desktop" "desktop" "AuraOS Desktop - Desktop environment"
create_package_json "apps/terminal" "terminal" "AuraOS Terminal - Terminal emulator"
create_package_json "apps/debugger" "debugger" "AuraOS Debugger - Visual debugger"

# Create package files for services
create_package_json "services/api" "api" "AuraOS API - Backend API server"
create_package_json "services/websocket" "websocket" "AuraOS WebSocket - Real-time communication"
create_package_json "services/firebase" "firebase" "AuraOS Firebase - Cloud services"

# Create package files for tools
create_package_json "tools/emulator" "emulator" "AuraOS Emulator - 6502 CPU emulator"
create_package_json "tools/basic" "basic" "AuraOS BASIC - BASIC interpreter"
create_package_json "tools/plugins" "plugins" "AuraOS Plugins - Plugin system"

echo "✅ All package files created!"
