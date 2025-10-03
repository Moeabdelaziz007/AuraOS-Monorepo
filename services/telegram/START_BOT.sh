#!/bin/bash

echo "🤖 Starting AuraOS Telegram Bot..."
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

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your bot token and chat ID"
    exit 1
fi

echo "🚀 Starting bot..."
echo ""
echo "Press Ctrl+C to stop the bot"
echo "================================"
echo ""

# Start the bot
node src/index.js
