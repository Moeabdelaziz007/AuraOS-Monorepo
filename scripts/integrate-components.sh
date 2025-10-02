#!/bin/bash

set -e

echo "🚀 AuraOS Component Integration Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create temp directory for cloning repos
TEMP_DIR="temp"
mkdir -p $TEMP_DIR

echo -e "${BLUE}📦 Step 1: Cloning repositories...${NC}"

# Clone SelfOS
if [ ! -d "$TEMP_DIR/selfos" ]; then
    echo "Cloning SelfOS..."
    git clone --depth 1 https://github.com/Moeabdelaziz007/SelfOS.git $TEMP_DIR/selfos
else
    echo "SelfOS already cloned, skipping..."
fi

# Clone AIOS
if [ ! -d "$TEMP_DIR/aios" ]; then
    echo "Cloning AIOS..."
    git clone --depth 1 https://github.com/Moeabdelaziz007/AIOS.git $TEMP_DIR/aios
else
    echo "AIOS already cloned, skipping..."
fi

# Clone BASIC-M6502
if [ ! -d "$TEMP_DIR/basic" ]; then
    echo "Cloning BASIC-M6502..."
    git clone --depth 1 https://github.com/Moeabdelaziz007/BASIC-M6502.git $TEMP_DIR/basic
else
    echo "BASIC-M6502 already cloned, skipping..."
fi

# Clone auraos
if [ ! -d "$TEMP_DIR/auraos" ]; then
    echo "Cloning auraos..."
    git clone --depth 1 https://github.com/Moeabdelaziz007/auraos.git $TEMP_DIR/auraos
else
    echo "auraos already cloned, skipping..."
fi

echo ""
echo -e "${BLUE}📋 Step 2: Integrating SelfOS components...${NC}"

# SelfOS - Core components
if [ -d "$TEMP_DIR/selfos/engine" ]; then
    echo "Copying SelfOS engine to packages/core/emulator..."
    mkdir -p packages/core/emulator
    cp -r $TEMP_DIR/selfos/engine/* packages/core/emulator/ 2>/dev/null || true
fi

if [ -d "$TEMP_DIR/selfos/bridge" ]; then
    echo "Copying SelfOS bridge to packages/core/bridge..."
    mkdir -p packages/core/bridge
    cp -r $TEMP_DIR/selfos/bridge/* packages/core/bridge/ 2>/dev/null || true
fi

# SelfOS - UI components
if [ -d "$TEMP_DIR/selfos/ui/src" ]; then
    echo "Copying SelfOS UI to packages/ui..."
    mkdir -p packages/ui/src
    cp -r $TEMP_DIR/selfos/ui/src/* packages/ui/src/ 2>/dev/null || true
fi

# SelfOS - Plugins
if [ -d "$TEMP_DIR/selfos/plugins" ]; then
    echo "Copying SelfOS plugins to tools/plugins..."
    cp -r $TEMP_DIR/selfos/plugins/* tools/plugins/ 2>/dev/null || true
fi

echo ""
echo -e "${BLUE}📋 Step 3: Integrating AIOS components...${NC}"

# AIOS - Server
if [ -d "$TEMP_DIR/aios/server" ]; then
    echo "Copying AIOS server to services/api..."
    cp -r $TEMP_DIR/aios/server/* services/api/ 2>/dev/null || true
fi

# AIOS - Firebase config
if [ -d "$TEMP_DIR/aios/config" ]; then
    echo "Copying AIOS config to services/firebase..."
    cp -r $TEMP_DIR/aios/config/* services/firebase/ 2>/dev/null || true
fi

# AIOS - Client auth
if [ -d "$TEMP_DIR/aios/client" ]; then
    echo "Copying AIOS client to packages/common..."
    mkdir -p packages/common/src
    cp -r $TEMP_DIR/aios/client/* packages/common/src/ 2>/dev/null || true
fi

echo ""
echo -e "${BLUE}📋 Step 4: Integrating BASIC-M6502...${NC}"

# BASIC-M6502
if [ -f "$TEMP_DIR/basic/m6502.asm" ]; then
    echo "Copying BASIC-M6502 to tools/basic..."
    cp -r $TEMP_DIR/basic/* tools/basic/ 2>/dev/null || true
fi

echo ""
echo -e "${BLUE}📋 Step 5: Integrating auraos components...${NC}"

# auraos - Automation
if [ -d "$TEMP_DIR/auraos/services" ]; then
    echo "Copying auraos services to packages/automation..."
    mkdir -p packages/automation/src
    cp -r $TEMP_DIR/auraos/services/* packages/automation/src/ 2>/dev/null || true
fi

# auraos - Packages
if [ -d "$TEMP_DIR/auraos/packages" ]; then
    echo "Copying auraos packages to packages/automation..."
    cp -r $TEMP_DIR/auraos/packages/* packages/automation/src/ 2>/dev/null || true
fi

echo ""
echo -e "${BLUE}📋 Step 6: Creating package.json files...${NC}"

# Create package.json for each package
./scripts/create-package-files.sh

echo ""
echo -e "${GREEN}✅ Component integration complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Run: pnpm install"
echo "  2. Run: pnpm build"
echo "  3. Run: pnpm test"
echo ""
echo -e "${YELLOW}🧹 Cleanup:${NC}"
echo "  To remove temp files: rm -rf $TEMP_DIR"
echo ""
