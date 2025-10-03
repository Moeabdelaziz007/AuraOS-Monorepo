#!/bin/bash

# Deploy script for AuraOS Landing Page
# Usage: ./deploy.sh [FIREBASE_TOKEN]

set -e

echo "🚀 AuraOS Landing Page Deployment"
echo "=================================="

# Check if token is provided
if [ -z "$1" ]; then
  echo "❌ Error: Firebase token required"
  echo ""
  echo "To get a token:"
  echo "1. Run: firebase login:ci"
  echo "2. Login with amrikyy@gmail.com"
  echo "3. Copy the token"
  echo "4. Run: ./deploy.sh YOUR_TOKEN"
  exit 1
fi

FIREBASE_TOKEN="$1"

echo "📦 Building landing page..."
cd apps/landing-page
pnpm build

echo ""
echo "🔧 Configuring Firebase..."
cd ../..
firebase use adept-student-469614-k2 --token "$FIREBASE_TOKEN"

echo ""
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting --token "$FIREBASE_TOKEN"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site is live at:"
echo "   https://adept-student-469614-k2.web.app"
echo "   https://adept-student-469614-k2.firebaseapp.com"
