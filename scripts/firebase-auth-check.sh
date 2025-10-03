#!/bin/bash

# Firebase Authentication Check Script
# This script helps diagnose Firebase authentication issues

set -e

echo "🔍 Firebase Authentication Diagnostic"
echo "======================================"
echo ""

# Check if Firebase CLI is installed
echo "1️⃣ Checking Firebase CLI..."
if command -v firebase &> /dev/null; then
    VERSION=$(firebase --version)
    echo "   ✅ Firebase CLI installed: $VERSION"
else
    echo "   ❌ Firebase CLI not found"
    echo "   Install with: npm install -g firebase-tools"
    exit 1
fi
echo ""

# Check for FIREBASE_TOKEN environment variable
echo "2️⃣ Checking FIREBASE_TOKEN environment variable..."
if [ -z "$FIREBASE_TOKEN" ]; then
    echo "   ❌ FIREBASE_TOKEN not set"
    echo ""
    echo "   To fix this:"
    echo "   1. On your LOCAL machine, run: firebase login:ci"
    echo "   2. Copy the token that's displayed"
    echo "   3. Go to: https://gitpod.io/user/variables"
    echo "   4. Add variable:"
    echo "      - Name: FIREBASE_TOKEN"
    echo "      - Value: (paste the token)"
    echo "      - Scope: Moeabdelaziz007/AuraOS-Monorepo"
    echo "   5. Restart this workspace"
    echo ""
else
    TOKEN_LENGTH=${#FIREBASE_TOKEN}
    echo "   ✅ FIREBASE_TOKEN is set (length: $TOKEN_LENGTH characters)"
    
    # Test the token
    echo ""
    echo "3️⃣ Testing FIREBASE_TOKEN..."
    if firebase projects:list --token "$FIREBASE_TOKEN" &> /dev/null; then
        echo "   ✅ Token is valid!"
        echo ""
        echo "   Available projects:"
        firebase projects:list --token "$FIREBASE_TOKEN"
    else
        echo "   ❌ Token is invalid or expired"
        echo ""
        echo "   To fix this:"
        echo "   1. Generate a new token on your LOCAL machine: firebase login:ci"
        echo "   2. Update the token in Gitpod: https://gitpod.io/user/variables"
        echo "   3. Restart this workspace"
    fi
fi
echo ""

# Check project configuration
echo "4️⃣ Checking Firebase project configuration..."
if [ -f ".firebaserc" ]; then
    echo "   ✅ .firebaserc found"
    PROJECT_ID=$(grep -o '"default": "[^"]*"' .firebaserc | cut -d'"' -f4)
    echo "   📦 Default project: $PROJECT_ID"
else
    echo "   ❌ .firebaserc not found"
fi
echo ""

# Check if build exists
echo "5️⃣ Checking build output..."
if [ -d "packages/ui/dist" ]; then
    BUILD_SIZE=$(du -sh packages/ui/dist | cut -f1)
    FILE_COUNT=$(find packages/ui/dist -type f | wc -l)
    echo "   ✅ Build exists"
    echo "   📦 Size: $BUILD_SIZE"
    echo "   📄 Files: $FILE_COUNT"
else
    echo "   ❌ Build not found"
    echo "   Run: cd packages/ui && pnpm run build"
fi
echo ""

# Summary
echo "======================================"
echo "📋 Summary"
echo "======================================"
echo ""

if [ -n "$FIREBASE_TOKEN" ] && firebase projects:list --token "$FIREBASE_TOKEN" &> /dev/null && [ -d "packages/ui/dist" ]; then
    echo "✅ Everything looks good! You can deploy with:"
    echo ""
    echo "   gitpod automations task start deploy-firebase"
    echo ""
    echo "   OR"
    echo ""
    echo "   firebase deploy --only hosting --token \"\$FIREBASE_TOKEN\""
    echo ""
else
    echo "❌ Some issues need to be fixed before deploying."
    echo ""
    echo "📖 See FIREBASE_AUTH_GUIDE.md for detailed instructions"
    echo ""
fi
