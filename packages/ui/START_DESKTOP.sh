#!/bin/bash

echo "🖥️  Starting AuraOS Desktop Environment..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting development server..."
echo ""
echo "🌐 Desktop will open in your browser"
echo "📝 Features:"
echo "   - Window Manager (drag, resize, minimize, maximize)"
echo "   - Desktop Icons (double-click to launch)"
echo "   - Taskbar with Start Menu"
echo "   - 3 Built-in Apps: Dashboard, Terminal, File Manager"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

# Start the development server
npm run dev
