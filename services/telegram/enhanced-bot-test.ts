import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import WebScraper from './src/utils/webScraper.js';
import AISummarizer from './src/utils/aiSummarizer.js';

dotenv.config();

const BOT_TOKEN = process.env['TELEGRAM_BOT_TOKEN'];

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

console.log('🤖 Starting Enhanced Telegram Bot with Real Web Scraping...');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const webScraper = new WebScraper();
const aiSummarizer = new AISummarizer();

// Simple logger
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args)
};

// Analytics tracking
const analytics = {
  totalRequests: 0,
  successfulSummaries: 0,
  failedSummaries: 0,
  startTime: Date.now(),
  userStats: new Map<string, { requests: number, lastUsed: Date }>()
};

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'User';
  
  const welcomeMessage = `
🌟 *Welcome to AuraOS Enhanced Bot!* 🌟

Hello ${userName}! This bot can now perform real web scraping and AI summarization.

*Available Commands:*
/start - Show this message
/summarize <url> - **Real web scraping & AI summarization**
/dashboard - View bot analytics dashboard
/help - Show detailed help

*New Features:*
✅ Real web content scraping
✅ AI-powered summarization
✅ Analytics dashboard
✅ Error handling & timeouts

Try: /summarize https://openai.com/blog/
  `;
  
  bot.sendMessage(chatId, welcomeMessage, { 
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📊 Dashboard', callback_data: 'dashboard' },
          { text: '❓ Help', callback_data: 'help' }
        ],
        [
          { text: '🧪 Test AI News', callback_data: 'test_ai_news' }
        ]
      ]
    }
  });
});

// Command: /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
📚 *Enhanced AuraOS Bot - Help Guide*

*Core Commands:*
• /start - Initialize bot session
• /help - Show this help message
• /dashboard - View analytics dashboard

*AI Web Summarization:*
• /summarize <url> - Scrape and summarize any webpage
• Real-time web scraping
• AI-powered content analysis
• Intelligent key point extraction

*Example URLs to test:*
• /summarize https://openai.com/blog/
• /summarize https://www.anthropic.com/news
• /summarize https://deepmind.google/discover/blog/
• /summarize https://www.microsoft.com/en-us/research/blog/

*Features:*
✅ Real web scraping (no more mocks!)
✅ AI summarization with confidence scores
✅ Key point extraction
✅ Metadata analysis (author, date, etc.)
✅ Error handling & timeouts
✅ Analytics tracking

*Dashboard Features:*
📊 Request statistics
📈 Success/failure rates
👥 User activity tracking
⏱️ Performance metrics

Ready to test real web summarization! 🚀
  `;
  
  bot.sendMessage(chatId, helpMessage, { 
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📊 Dashboard', callback_data: 'dashboard' },
          { text: '🧪 Test Now', callback_data: 'test_ai_news' }
        ]
      ]
    }
  });
});

// Command: /dashboard
bot.onText(/\/dashboard/, (msg) => {
  const chatId = msg.chat.id;
  sendDashboard(chatId);
});

// Command: /summarize - REAL WEB SCRAPING
bot.onText(/\/summarize (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const url = match[1];
  
  analytics.totalRequests++;
  analytics.userStats.set(userId, {
    requests: (analytics.userStats.get(userId)?.requests || 0) + 1,
    lastUsed: new Date()
  });
  
  logger.info(`[Enhanced Bot] User ${userId} requested summary for: ${url}`);
  
  try {
    // Send initial message
    const processingMsg = await bot.sendMessage(
      chatId,
      '🔄 **Real Web Scraping in Progress...**\n\n🌐 Fetching content from: ' + url + '\n🤖 AI analysis starting...\n⏱️ This may take 10-30 seconds',
      { parse_mode: 'Markdown' }
    );

    // Real web scraping
    const webContent = await webScraper.scrapeUrl(url);
    
    // AI summarization
    const summaryResult = await aiSummarizer.summarizeContent(webContent);

    // Delete processing message
    await bot.deleteMessage(chatId, processingMsg.message_id);

    // Send success message with real summary
    await sendSummaryResult(chatId, summaryResult);
    
    analytics.successfulSummaries++;
    logger.info(`[Enhanced Bot] Successfully summarized ${url} for user ${userId}`);

  } catch (error) {
    analytics.failedSummaries++;
    logger.error('[Enhanced Bot] Error:', error);
    
    // Send error message
    let errorMessage = '❌ **Summarization Failed**\n\n';
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage += '⏱️ The website took too long to respond.\nTry a different URL or check your internet connection.';
      } else if (error.message.includes('404')) {
        errorMessage += '🔍 The webpage was not found.\nPlease check the URL and try again.';
      } else if (error.message.includes('403')) {
        errorMessage += '🚫 Access denied to this webpage.\nThe site may block automated requests.';
      } else if (error.message.includes('Invalid URL')) {
        errorMessage += '🔗 Invalid URL format.\nPlease provide a valid web address starting with http:// or https://';
      } else {
        errorMessage += `**Error:** ${error.message}\n\nPlease try a different URL.`;
      }
    }

    await bot.sendMessage(chatId, errorMessage, { 
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔄 Try Again', callback_data: 'retry_summarize' },
            { text: '📊 Dashboard', callback_data: 'dashboard' }
          ]
        ]
      }
    });
  }
});

// Handle /summarize without URL
bot.onText(/\/summarize$/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, 
    '❌ **Please provide a URL to summarize**\n\n**Usage:** `/summarize <url>`\n\n**Examples:**\n• `/summarize https://openai.com/blog/`\n• `/summarize https://www.anthropic.com/news`', 
    { parse_mode: 'Markdown' }
  );
});

// Handle callback queries
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  
  await bot.answerCallbackQuery(query.id);
  
  switch (data) {
    case 'dashboard':
      await sendDashboard(chatId);
      break;
      
    case 'help':
      await bot.sendMessage(chatId, '📚 **Help Guide**\n\nUse /help for detailed information about all commands and features.', { parse_mode: 'Markdown' });
      break;
      
    case 'test_ai_news':
      await bot.sendMessage(chatId, 
        '🧪 **Test AI News Summarization**\n\nTry these popular AI news sites:\n\n• `/summarize https://openai.com/blog/`\n• `/summarize https://www.anthropic.com/news`\n• `/summarize https://deepmind.google/discover/blog/`\n• `/summarize https://www.microsoft.com/en-us/research/blog/`', 
        { parse_mode: 'Markdown' }
      );
      break;
      
    case 'retry_summarize':
      await bot.sendMessage(chatId, '🔄 **Ready for another attempt**\n\nSend `/summarize <url>` to try again with a different URL.', { parse_mode: 'Markdown' });
      break;
  }
});

// Send dashboard
async function sendDashboard(chatId: number) {
  const uptime = Math.floor((Date.now() - analytics.startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  const successRate = analytics.totalRequests > 0 
    ? Math.round((analytics.successfulSummaries / analytics.totalRequests) * 100) 
    : 0;
  
  const dashboardMessage = `
📊 **AuraOS Bot Dashboard**

**📈 Statistics:**
• Total Requests: ${analytics.totalRequests}
• Successful: ${analytics.successfulSummaries} (${successRate}%)
• Failed: ${analytics.failedSummaries}
• Uptime: ${hours}h ${minutes}m

**👥 User Activity:**
• Active Users: ${analytics.userStats.size}
• Most Recent: ${Array.from(analytics.userStats.entries())
  .sort((a, b) => b[1].lastUsed.getTime() - a[1].lastUsed.getTime())
  .slice(0, 3)
  .map(([userId, stats]) => `User ${userId} (${stats.requests} requests)`)
  .join('\n• ') || 'None'}

**🚀 Features Active:**
✅ Real Web Scraping
✅ AI Summarization  
✅ Analytics Tracking
✅ Error Handling
✅ Dashboard Monitoring

**Ready for testing!** 🎯
  `;
  
  await bot.sendMessage(chatId, dashboardMessage, { 
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🧪 Test Now', callback_data: 'test_ai_news' },
          { text: '🔄 Refresh', callback_data: 'dashboard' }
        ]
      ]
    }
  });
}

// Send summary result
async function sendSummaryResult(chatId: number, result: any) {
  let message = `✅ **Real Summary Complete!**\n\n`;
  message += `📰 **Title:** ${result.title}\n\n`;
  
  if (result.metadata.author) {
    message += `👤 **Author:** ${result.metadata.author}\n`;
  }
  if (result.metadata.publishedDate) {
    message += `📅 **Published:** ${result.metadata.publishedDate}\n`;
  }
  message += `📊 **Word Count:** ${result.metadata.wordCount}\n`;
  message += `⏱️ **Reading Time:** ${result.metadata.readingTime} minutes\n`;
  message += `🎯 **Confidence:** ${Math.round(result.metadata.confidence * 100)}%\n\n`;

  message += `📝 **Summary:**\n${result.summary}\n\n`;

  if (result.keyPoints.length > 0) {
    message += `🔑 **Key Points:**\n`;
    result.keyPoints.forEach((point, index) => {
      message += `${index + 1}. ${point}\n`;
    });
    message += `\n`;
  }

  if (result.metadata.originalUrl) {
    message += `🔗 **Source:** ${result.metadata.originalUrl}\n`;
  }

  message += `\n💾 **Note:** This is a real summary generated from actual web content!`;

  await bot.sendMessage(chatId, message, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📊 Dashboard', callback_data: 'dashboard' },
          { text: '🧪 Test Another', callback_data: 'test_ai_news' }
        ]
      ]
    }
  });
}

// Error handling
bot.on('polling_error', (error) => {
  logger.error('❌ Polling error:', error.message);
});

bot.on('error', (error) => {
  logger.error('❌ Bot error:', error.message);
});

// Set bot commands menu
bot.setMyCommands([
  { command: 'start', description: 'Start the enhanced bot' },
  { command: 'help', description: 'Show detailed help' },
  { command: 'summarize', description: 'Real web scraping & AI summarization' },
  { command: 'dashboard', description: 'View analytics dashboard' }
]).then(() => {
  logger.info('✅ Enhanced bot commands menu set successfully');
}).catch(err => {
  logger.error('❌ Failed to set commands menu:', err.message);
});

logger.info('✅ Enhanced AuraOS Telegram Bot is running!');
logger.info(`📱 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
logger.info('🎯 Listening for messages...');
logger.info('🌐 Real web scraping enabled');
logger.info('🤖 AI summarization active');
logger.info('📊 Analytics dashboard ready');
logger.info('🚀 Ready for real web summarization testing!');
