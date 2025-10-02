#!/bin/bash

set -e

echo "🚀 AuraOS Monorepo Setup"
echo "======================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed${NC}"
    echo "Installing pnpm..."
    npm install -g pnpm
fi

echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
pnpm install

echo ""
echo -e "${BLUE}📋 Step 2: Creating package files...${NC}"
./scripts/create-package-files.sh

echo ""
echo -e "${BLUE}🔨 Step 3: Building packages...${NC}"
pnpm build || echo -e "${YELLOW}⚠️  Build failed (expected if no source files yet)${NC}"

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Run integration: ./scripts/integrate-components.sh"
echo "  2. Start development: pnpm dev"
echo "  3. Run tests: pnpm test"
echo ""
