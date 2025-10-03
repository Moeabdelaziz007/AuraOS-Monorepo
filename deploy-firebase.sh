#!/bin/bash
set -e

echo "🚀 AuraOS Firebase Deployment Script"
echo "======================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    sudo npm install -g firebase-tools
fi

# Check if user is logged in
echo "📝 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase..."
    firebase login
fi

# Build the application
echo "🔨 Building application for production..."
cd packages/ui
npm run build
cd ../..

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your application is now live at: https://auraos-ac2e0.web.app"
