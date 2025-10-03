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
  logger.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

if (!config.adminChatId) {
  logger.error('❌ TELEGRAM_CHAT_ID is not set in .env file');
  process.exit(1);
}

// Create enhanced bot instance
const bot = new EnhancedBot(config);

// Initialize and start the bot
async function startBot() {
  try {
    logger.info('🚀 Starting Enhanced AuraOS Telegram Bot...');
    logger.info('📱 Bot Token:', config.token.substring(0, 10) + '...');
    logger.info('👤 Admin Chat ID:', config.adminChatId);
    logger.info('🔧 Features:', Object.keys(config.features).filter(key => config.features[key as keyof typeof config.features]));
    
    await bot.initialize();
    
    logger.info('✅ Enhanced AuraOS Telegram Bot is running!');
    logger.info('🎯 Listening for messages...');
    logger.info('📊 Monitoring active');
    logger.info('🔒 Security enabled');
    logger.info('🧠 AI ready');
    logger.info('🤖 Autopilot active');
    logger.info('📚 Learning enabled');
    
  } catch (error) {
    logger.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('\n🛑 Received SIGINT, shutting down gracefully...');
  try {
    await bot.stop();
    logger.info('✅ Bot stopped successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  logger.info('\n🛑 Received SIGTERM, shutting down gracefully...');
  try {
    await bot.stop();
    logger.info('✅ Bot stopped successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the bot
startBot();

// Export for testing
export { bot, config };