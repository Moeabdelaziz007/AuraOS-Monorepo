/**
 * Enhanced AuraOS Telegram Bot - Main Entry Point
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EnhancedBot } from './EnhancedBot.js';
import { BotConfig } from './types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Bot configuration
const config: BotConfig = {
  token: process.env.TELEGRAM_BOT_TOKEN || '',
  adminChatId: parseInt(process.env.TELEGRAM_CHAT_ID || '0'),
  adminUserIds: process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id.trim())) || [],
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 20
  },
  features: {
    ai: true,
    mcp: true,
    autopilot: true,
    learning: true,
    monitoring: true
  },
  security: {
    enableWhitelist: false,
    whitelistUsers: [],
    enableBlacklist: false,
    blacklistUsers: []
  }
};

// Validate configuration
if (!config.token) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

if (!config.adminChatId) {
  console.error('❌ TELEGRAM_CHAT_ID is not set in .env file');
  process.exit(1);
}

// Create enhanced bot instance
const bot = new EnhancedBot(config);

// Initialize and start the bot
async function startBot() {
  try {
    console.log('🚀 Starting Enhanced AuraOS Telegram Bot...');
    console.log('📱 Bot Token:', config.token.substring(0, 10) + '...');
    console.log('👤 Admin Chat ID:', config.adminChatId);
    console.log('🔧 Features:', Object.keys(config.features).filter(key => config.features[key as keyof typeof config.features]));
    
    await bot.initialize();
    
    console.log('✅ Enhanced AuraOS Telegram Bot is running!');
    console.log('🎯 Listening for messages...');
    console.log('📊 Monitoring active');
    console.log('🔒 Security enabled');
    console.log('🧠 AI ready');
    console.log('🤖 Autopilot active');
    console.log('📚 Learning enabled');
    
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  try {
    await bot.stop();
    console.log('✅ Bot stopped successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  try {
    await bot.stop();
    console.log('✅ Bot stopped successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the bot
startBot();

// Export for testing
export { bot, config };