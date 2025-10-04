#!/bin/bash
set -e

echo "🚀 Deploying AuraOS Telegram Bot with Research Functionality"
echo "============================================================="
echo ""

# Check if TELEGRAM_BOT_TOKEN is set
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN environment variable is not set"
    echo "Please set your Telegram bot token:"
    echo "export TELEGRAM_BOT_TOKEN='your_bot_token_here'"
    exit 1
fi

echo "✅ Telegram bot token found"
echo "📱 Bot Token: ${TELEGRAM_BOT_TOKEN:0:10}..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Dependencies ready"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
TELEGRAM_CHAT_ID=0
ADMIN_USER_IDS=
EOF
    echo "✅ .env file created"
fi

echo ""
echo "🤖 Starting AuraOS Telegram Bot with Research Features..."
echo ""
echo "✨ Features:"
echo "• /research <query> - Research topics and create notes"
echo "• /research_help - Show research help"
echo "• /start - Welcome message"
echo "• /help - General help"
echo ""
echo "🎯 Ready to receive commands!"
echo ""

# Start the bot
node simple-bot.js
