#!/bin/bash

# AuraOS Deployment Script
# Builds all packages and deploys to Firebase

set -e

echo "🚀 Starting AuraOS deployment..."
echo ""

# Check if Firebase token is set
if [ -z "$FIREBASE_TOKEN" ]; then
    echo "⚠️  FIREBASE_TOKEN not set. Using interactive authentication."
    echo "   To use CI/CD, set FIREBASE_TOKEN environment variable."
    echo ""
    FIREBASE_CMD="firebase"
else
    echo "✅ Using FIREBASE_TOKEN for authentication"
    echo ""
    FIREBASE_CMD="firebase --token $FIREBASE_TOKEN"
fi

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf packages/ui/dist
rm -rf packages/*/dist
echo "✅ Cleaned"
echo ""

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# Step 3: Build all packages
echo "🔨 Building all packages..."
pnpm -r build
echo "✅ All packages built successfully"
echo ""

# Step 4: Build UI for production
echo "🎨 Building UI for production..."
cd packages/ui
pnpm build
cd ../..
echo "✅ UI built successfully"
echo ""

# Step 5: Verify build output
if [ ! -d "packages/ui/dist" ]; then
    echo "❌ Error: Build output not found at packages/ui/dist"
    exit 1
fi
echo "✅ Build output verified"
echo ""

# Step 6: Deploy Firestore rules
echo "🔐 Deploying Firestore rules..."
$FIREBASE_CMD deploy --only firestore:rules
echo "✅ Firestore rules deployed"
echo ""

# Step 7: Deploy Storage rules
echo "📁 Deploying Storage rules..."
$FIREBASE_CMD deploy --only storage:rules
echo "✅ Storage rules deployed"
echo ""

# Step 8: Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
$FIREBASE_CMD deploy --only hosting
echo "✅ Hosting deployed"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "🎉 Deployment complete!"
echo ""
echo "Your app is live at:"
echo "  🌐 https://selfos-62f70.web.app"
echo "  🌐 https://selfos-62f70.firebaseapp.com"
echo ""
echo "Firebase Console:"
echo "  🔥 https://console.firebase.google.com/project/selfos-62f70"
echo "═══════════════════════════════════════════════════════════"
