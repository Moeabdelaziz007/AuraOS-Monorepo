#!/bin/bash

# AuraOS Firebase Deployment Script
# This script builds and deploys all apps to Firebase Hosting

set -e  # Exit on error

echo "🚀 AuraOS Firebase Deployment"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if service account key exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo -e "${RED}❌ Error: serviceAccountKey.json not found${NC}"
    echo ""
    echo "Please download the service account key from Firebase Console:"
    echo "1. Go to https://console.firebase.google.com/"
    echo "2. Select project 'auraos-ac2e0'"
    echo "3. Settings → Service accounts"
    echo "4. Generate new private key"
    echo "5. Save as 'serviceAccountKey.json' in project root"
    echo ""
    exit 1
fi

# Set environment variable for Firebase
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/serviceAccountKey.json"

echo -e "${GREEN}✓${NC} Service account key found"
echo ""

# Build Terminal App
echo "📦 Building Terminal App..."
cd apps/terminal
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Terminal App built successfully"
else
    echo -e "${RED}❌${NC} Terminal App build failed"
    exit 1
fi
cd ../..
echo ""

# Build Debugger App
echo "📦 Building Debugger App..."
cd apps/debugger
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Debugger App built successfully"
else
    echo -e "${RED}❌${NC} Debugger App build failed"
    exit 1
fi
cd ../..
echo ""

# Build Landing Page (if exists)
if [ -d "apps/landing-page" ]; then
    echo "📦 Building Landing Page..."
    cd apps/landing-page
    if [ -f "package.json" ]; then
        npm run build
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} Landing Page built successfully"
        else
            echo -e "${YELLOW}⚠${NC} Landing Page build failed (continuing...)"
        fi
    fi
    cd ../..
    echo ""
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "📱 Your apps are now live:"
    echo "   Terminal: https://auraos-ac2e0.web.app"
    echo "   (Configure additional sites for Debugger and Landing)"
    echo ""
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
