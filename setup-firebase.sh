#!/bin/bash

# Firebase Setup Helper Script
# Helps you set up Firebase for deployment

set -e

echo "🔥 Firebase Setup Helper"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not installed${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI installed${NC}"
echo ""

# Check if FIREBASE_TOKEN is set
if [ -z "$FIREBASE_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  FIREBASE_TOKEN not set${NC}"
    echo ""
    echo "You have two options:"
    echo ""
    echo "Option 1: Use Firebase Token (Recommended for CI/CD)"
    echo "  1. Run on your LOCAL machine: firebase login:ci"
    echo "  2. Copy the token"
    echo "  3. Run in dev container: export FIREBASE_TOKEN=\"your-token\""
    echo ""
    echo "Option 2: Interactive Login"
    echo "  1. Run: firebase login"
    echo "  2. Authenticate in browser"
    echo ""
    read -p "Do you want to login interactively now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        firebase login
    else
        echo ""
        echo "Please set up authentication and run this script again."
        exit 0
    fi
else
    echo -e "${GREEN}✅ FIREBASE_TOKEN is set${NC}"
fi
echo ""

# Check current project
echo -e "${BLUE}📋 Checking Firebase project...${NC}"
CURRENT_PROJECT=$(firebase projects:list 2>/dev/null | grep selfos-62f70 || echo "")

if [ -z "$CURRENT_PROJECT" ]; then
    echo -e "${YELLOW}⚠️  Project selfos-62f70 not found in your account${NC}"
    echo ""
    echo "Please make sure:"
    echo "  1. You have access to the project"
    echo "  2. You're logged in with the correct account"
    exit 1
fi

echo -e "${GREEN}✅ Project selfos-62f70 found${NC}"
echo ""

# Use the project
echo -e "${BLUE}🔗 Linking to project...${NC}"
firebase use selfos-62f70
echo -e "${GREEN}✅ Project linked${NC}"
echo ""

# Verify configuration
echo -e "${BLUE}🔍 Verifying configuration...${NC}"

if [ ! -f ".firebaserc" ]; then
    echo -e "${RED}❌ .firebaserc not found${NC}"
    exit 1
fi

if [ ! -f "firebase.json" ]; then
    echo -e "${RED}❌ firebase.json not found${NC}"
    exit 1
fi

if [ ! -f "firestore.rules" ]; then
    echo -e "${YELLOW}⚠️  firestore.rules not found${NC}"
fi

if [ ! -f "storage.rules" ]; then
    echo -e "${YELLOW}⚠️  storage.rules not found${NC}"
fi

echo -e "${GREEN}✅ Configuration verified${NC}"
echo ""

# Check if build exists
echo -e "${BLUE}🔍 Checking build output...${NC}"
if [ ! -d "packages/ui/dist" ]; then
    echo -e "${YELLOW}⚠️  Build output not found${NC}"
    echo ""
    read -p "Do you want to build now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔨 Building...${NC}"
        pnpm install
        pnpm -r build
        cd packages/ui
        pnpm build
        cd ../..
        echo -e "${GREEN}✅ Build complete${NC}"
    else
        echo ""
        echo "Please build before deploying:"
        echo "  pnpm -r build"
        echo "  cd packages/ui && pnpm build"
        exit 0
    fi
else
    echo -e "${GREEN}✅ Build output found${NC}"
fi
echo ""

# Summary
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 Firebase setup complete!${NC}"
echo ""
echo "You're ready to deploy. Run:"
echo "  ${BLUE}./deploy.sh${NC}"
echo ""
echo "Or deploy manually:"
echo "  ${BLUE}firebase deploy${NC}"
echo ""
echo "Your app will be live at:"
echo "  🌐 https://selfos-62f70.web.app"
echo "  🌐 https://selfos-62f70.firebaseapp.com"
echo "════════════════════════════════════════════════════════════"
