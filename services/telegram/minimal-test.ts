import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env['TELEGRAM_BOT_TOKEN'];

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

console.log('🤖 Starting Minimal TypeScript Bot Test...');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Simple logger
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args)
};

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'User';
  
  const welcomeMessage = `
🌟 *Welcome to AuraOS Bot Test!* 🌟

Hello ${userName}! This is a minimal TypeScript test version.

*Available Commands:*
/start - Show this message
/summarize <url> - Test web summarization
/help - Show help

This bot is testing the TypeScript architecture.
  `;
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Command: /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
📚 *Minimal Bot Test - Help*

*Available Commands:*
• /start - Initialize bot session
• /help - Show this help message
• /summarize <url> - Test web summarization

*Features:*
✅ TypeScript architecture
✅ Web summarization testing
✅ Clean implementation

This is a test version to verify the TypeScript bot works.
  `;
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Command: /summarize - THE MAIN TEST
bot.onText(/\/summarize (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const url = match[1];
  
  logger.info(`[Web Summarizer] User ${userId} requested summary for: ${url}`);
  
  try {
    // Send initial message
    const processingMsg = await bot.sendMessage(
      chatId,
      '🔄 Analyzing web content...\nThis may take a few moments.',
      { parse_mode: 'HTML' }
    );

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Delete processing message
    await bot.deleteMessage(chatId, processingMsg.message_id);

    // Mock response for testing
    const mockResult = {
      title: "AI News Article Summary",
      summary: "This is a mock summary of the AI news article. The actual web summarizer would analyze the content and provide a detailed summary with key points, metadata, and insights.",
      keyPoints: [
        "Key point 1: Important AI development",
        "Key point 2: Industry impact", 
        "Key point 3: Future implications"
      ],
      metadata: {
        author: "AI News Author",
        publishedDate: new Date().toISOString().split('T')[0],
        wordCount: 500,
        readingTime: 2,
        confidence: 0.95
      }
    };

    let message = `✅ <b>Summary Complete!</b>\n\n`;
    message += `📰 <b>Title:</b> ${mockResult.title}\n\n`;
    message += `👤 <b>Author:</b> ${mockResult.metadata.author}\n`;
    message += `📅 <b>Published:</b> ${mockResult.metadata.publishedDate}\n`;
    message += `📊 <b>Word Count:</b> ${mockResult.metadata.wordCount}\n`;
    message += `⏱️ <b>Reading Time:</b> ${mockResult.metadata.readingTime} minutes\n`;
    message += `🎯 <b>Confidence:</b> ${Math.round(mockResult.metadata.confidence * 100)}%\n\n`;
    message += `📝 <b>Summary:</b>\n${mockResult.summary}\n\n`;
    message += `🔑 <b>Key Points:</b>\n`;
    mockResult.keyPoints.forEach((point, index) => {
      message += `${index + 1}. ${point}\n`;
    });
    message += `\n💾 <b>Note:</b> This is a mock response. The actual web summarizer integration is in progress.`;

    await bot.sendMessage(chatId, message, { 
      parse_mode: 'HTML',
      disable_web_page_preview: true 
    });

    logger.info(`[Web Summarizer] Successfully sent summary to user ${userId}`);

  } catch (error) {
    logger.error('[Web Summarizer] Error:', error);
    await bot.sendMessage(
      chatId,
      '❌ An error occurred while summarizing the content. Please try again later.',
      { parse_mode: 'HTML' }
    );
  }
});

// Handle /summarize without URL
bot.onText(/\/summarize$/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, '❌ Please provide a URL to summarize.\nUsage: /summarize <url>');
});

// Error handling
bot.on('polling_error', (error) => {
  logger.error('❌ Polling error:', error.message);
});

bot.on('error', (error) => {
  logger.error('❌ Bot error:', error.message);
});

// Set bot commands menu
bot.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'help', description: 'Show help message' },
  { command: 'summarize', description: 'Summarize web articles' }
]).then(() => {
  logger.info('✅ Bot commands menu set successfully');
}).catch(err => {
  logger.error('❌ Failed to set commands menu:', err.message);
});

logger.info('✅ Minimal TypeScript Bot Test is running!');
logger.info(`📱 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
logger.info('🎯 Listening for messages...');
logger.info('🧪 Testing /summarize command functionality');
