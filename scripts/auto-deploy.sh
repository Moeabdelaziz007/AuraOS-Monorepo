#!/bin/bash

# Auto Deploy and Push Script
# Automatically commits, pushes, and deploys changes to Firebase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AuraOS Auto Deploy & Push${NC}"
echo ""

# Check if Firebase token is set
if [ -z "$FIREBASE_TOKEN" ]; then
    echo -e "${RED}❌ FIREBASE_TOKEN not set${NC}"
    echo "Please set the Firebase token:"
    echo "  export FIREBASE_TOKEN='your-token-here'"
    exit 1
fi

# Get current branch
BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Current branch: ${BRANCH}${NC}"

# Check for changes
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
    echo -e "${BLUE}📝 Changes detected${NC}"
    git status -s
    echo ""
    
    # Get commit message from argument or use default
    COMMIT_MSG="${1:-chore: auto-deploy updates}"
    
    echo -e "${BLUE}💾 Committing changes...${NC}"
    git add .
    git commit -m "$COMMIT_MSG

Co-authored-by: Ona <no-reply@ona.com>"
    
    echo -e "${GREEN}✅ Changes committed${NC}"
fi

# Push to remote
echo -e "${BLUE}⬆️  Pushing to origin/${BRANCH}...${NC}"
git push origin "$BRANCH"
echo -e "${GREEN}✅ Pushed to GitHub${NC}"
echo ""

# Build the project
echo -e "${BLUE}🏗️  Building project...${NC}"
cd packages/ui
npm run build
cd ../..
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Deploy to Firebase
echo -e "${BLUE}🚀 Deploying to Firebase...${NC}"

# Use service account key if available, otherwise use token
if [ -f "serviceAccountKey.json" ]; then
  export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/serviceAccountKey.json"
  unset FIREBASE_TOKEN
  firebase deploy --only hosting,firestore:rules
else
  firebase deploy --token "$FIREBASE_TOKEN" --only hosting,firestore:rules
fi

echo -e "${GREEN}✅ Deployed to Firebase${NC}"
echo ""

echo -e "${GREEN}🎉 Auto deploy complete!${NC}"
echo -e "${BLUE}🌐 Your app is live at: https://auraos-ac2e0.web.app${NC}"
