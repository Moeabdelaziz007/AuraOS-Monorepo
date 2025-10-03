#!/bin/bash

echo "🚀 AuraOS - Firebase Deployment Script"
echo "======================================="
echo ""

# Check if Firebase token is set
if [ -z "$FIREBASE_TOKEN" ]; then
    echo "❌ Error: FIREBASE_TOKEN environment variable is not set"
    echo ""
    echo "To deploy, you need to:"
    echo "1. Run 'firebase login:ci' on your local machine"
    echo "2. Copy the generated token"
    echo "3. Set it here: export FIREBASE_TOKEN=\"your-token-here\""
    echo ""
    echo "Or add it to Gitpod environment variables:"
    echo "https://gitpod.io/user/variables"
    echo ""
    exit 1
fi

echo "✅ Firebase token found"
echo ""

# Check if build exists
if [ ! -d "packages/ui/dist" ]; then
    echo "❌ Error: Build directory not found"
    echo "Expected: packages/ui/dist"
    echo ""
    echo "Please build the UI first:"
    echo "  cd packages/ui"
    echo "  npm run build"
    echo ""
    exit 1
fi

echo "✅ Build directory found"
echo ""

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found"
    echo ""
    echo "Please install Firebase CLI:"
    echo "  npm install -g firebase-tools"
    echo ""
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Show project info
echo "📋 Deployment Info:"
echo "   Project: adept-student-469614-k2"
echo "   Target: https://adept-student-469614-k2.web.app"
echo "   Source: packages/ui/dist"
echo ""

# Confirm deployment
read -p "Deploy to Firebase? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "🚀 Deploying to Firebase..."
echo ""

# Deploy using token
firebase deploy --only hosting --token "$FIREBASE_TOKEN"

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ Deployment Successful!"
    echo ""
    echo "🌐 Your site is live at:"
    echo "   https://adept-student-469614-k2.web.app"
    echo ""
    echo "📦 What was deployed:"
    echo "   • AuraOS Desktop UI"
    echo "   • Quantum Autopilot (5 execution paths)"
    echo "   • Smart Task Scheduler (progressive learning)"
    echo "   • 43+ MCP Tools"
    echo "   • n8n Workflow Automation"
    echo "   • Kan Project Management"
    echo "   • Reward System (25+ achievements)"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Visit: https://adept-student-469614-k2.web.app"
    echo "   2. Test the quantum autopilot features"
    echo "   3. Try the smart task scheduler"
    echo "   4. Explore MCP tools integration"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    echo ""
    echo "❌ Deployment failed"
    echo ""
    echo "Common issues:"
    echo "  • Invalid or expired token"
    echo "  • Insufficient permissions"
    echo "  • Network connectivity"
    echo ""
    echo "Try:"
    echo "  1. Generate a new token: firebase login:ci"
    echo "  2. Check Firebase console for errors"
    echo "  3. Verify project permissions"
    echo ""
    exit 1
fi
