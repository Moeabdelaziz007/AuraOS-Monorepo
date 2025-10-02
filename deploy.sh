#!/bin/bash

# AuraOS Deployment Script
# Builds all packages and deploys to Firebase

set -e

echo "🚀 Starting AuraOS deployment..."
echo ""

# Step 1: Build all packages
echo "📦 Building all packages..."
pnpm -r build
echo "✅ All packages built successfully"
echo ""

# Step 2: Build UI for production
echo "🎨 Building UI for production..."
cd packages/ui
pnpm build
cd ../..
echo "✅ UI built successfully"
echo ""

# Step 3: Deploy Firestore rules
echo "🔐 Deploying Firestore rules..."
firebase deploy --only firestore:rules
echo "✅ Firestore rules deployed"
echo ""

# Step 4: Deploy Storage rules
echo "📁 Deploying Storage rules..."
firebase deploy --only storage:rules
echo "✅ Storage rules deployed"
echo ""

# Step 5: Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting
echo "✅ Hosting deployed"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "🎉 Deployment complete!"
echo ""
echo "Your app is live at:"
echo "https://selfos-62f70.web.app"
echo ""
echo "Firebase Console:"
echo "https://console.firebase.google.com/project/selfos-62f70"
echo "═══════════════════════════════════════════════════════════"
