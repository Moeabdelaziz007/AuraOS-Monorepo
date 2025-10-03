#!/bin/bash

echo "🚀 Deploying AuraOS Desktop to Firebase..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed!${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g firebase-tools"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI installed${NC}"
echo ""

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase${NC}"
    echo ""
    echo "Logging in..."
    firebase login
    echo ""
fi

# Build the project
echo -e "${BLUE}📦 Building project...${NC}"
./scripts/build-desktop.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Cannot deploy.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Deploying to Firebase Hosting...${NC}"
echo ""

# Deploy to Firebase
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "🌐 Your AuraOS Desktop is now live!"
    echo ""
    echo "View your site:"
    firebase hosting:channel:list
    echo ""
    echo "To view logs:"
    echo "  firebase hosting:channel:list"
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo "Check the error messages above."
    exit 1
fi
