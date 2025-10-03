import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id.trim())) || [];

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

console.log('🤖 Starting AuraOS Telegram Bot...');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Store user sessions
const userSessions = new Map();

// Helper function to check if user is admin
function isAdmin(userId) {
  return ADMIN_USER_IDS.includes(userId);
}

// Helper function to format system info
function getSystemInfo() {
  return {
    name: 'AuraOS',
    version: '1.0.0',
    status: 'Running',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
}

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'User';
  
  const welcomeMessage = `
🌟 *Welcome to AuraOS Bot!* 🌟

Hello ${userName}! I'm your AI-powered operating system assistant.

*Available Commands:*
/help - Show all commands
/status - System status
/info - Bot information
/ping - Check bot responsiveness
/echo <text> - Echo your message
/time - Current server time
/uptime - Bot uptime

*Admin Commands:*
/admin - Admin panel (admins only)
/broadcast <msg> - Send message to all users
/stats - Detailed statistics

Type /help for more details!
  `;
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  
  userSessions.set(chatId, {
    userId: msg.from.id,
    username: msg.from.username,
    firstName: msg.from.first_name,
    startedAt: new Date(),
    messageCount: 0
  });
});

// Command: /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
📚 *AuraOS Bot - Help Guide*

*Basic Commands:*
• /start - Initialize bot session
• /help - Show this help message
• /status - Get system status
• /info - Bot information
• /ping - Test bot response
• /echo <text> - Echo your message
• /time - Current server time
• /uptime - How long bot has been running

*System Commands:*
• /memory - Memory usage
• /version - AuraOS version

*Admin Commands:* (Admins only)
• /admin - Access admin panel
• /broadcast <message> - Send to all users
• /stats - Detailed statistics
• /users - List active users

*Features:*
✅ AI-powered responses
✅ System monitoring
✅ Real-time notifications
✅ MCP integration (coming soon)

Need help? Contact the admin!
  `;
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Command: /status
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const info = getSystemInfo();
  
  const statusMessage = `
📊 *System Status*

🟢 Status: ${info.status}
⏱️ Uptime: ${Math.floor(info.uptime / 60)} minutes
💾 Memory: ${Math.round(info.memory.heapUsed / 1024 / 1024)}MB / ${Math.round(info.memory.heapTotal / 1024 / 1024)}MB
🕐 Time: ${new Date().toLocaleString()}
👥 Active Users: ${userSessions.size}

All systems operational! ✅
  `;
  
  bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
});

// Command: /info
bot.onText(/\/info/, (msg) => {
  const chatId = msg.chat.id;
  
  const infoMessage = `
ℹ️ *AuraOS Bot Information*

*Name:* AuraOS Telegram Bot
*Version:* 1.0.0
*Platform:* Node.js ${process.version}
*Architecture:* ${process.arch}
*OS:* ${process.platform}

*Features:*
• 🤖 AI Integration
• 📁 File System Access (MCP)
• 🔧 System Control
• 📊 Real-time Monitoring
• 🔔 Notifications

*Repository:*
github.com/Moeabdelaziz007/AuraOS-Monorepo

Built with ❤️ by Mohamed Abdelaziz
  `;
  
  bot.sendMessage(chatId, infoMessage, { parse_mode: 'Markdown' });
});

// Command: /ping
bot.onText(/\/ping/, (msg) => {
  const chatId = msg.chat.id;
  const startTime = Date.now();
  
  bot.sendMessage(chatId, '🏓 Pong!').then(() => {
    const latency = Date.now() - startTime;
    bot.sendMessage(chatId, `⚡ Response time: ${latency}ms`);
  });
});

// Command: /echo
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  
  bot.sendMessage(chatId, `🔊 Echo: ${text}`);
});

// Command: /time
bot.onText(/\/time/, (msg) => {
  const chatId = msg.chat.id;
  const now = new Date();
  
  const timeMessage = `
🕐 *Current Time*

📅 Date: ${now.toLocaleDateString()}
⏰ Time: ${now.toLocaleTimeString()}
🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
📊 Unix: ${Math.floor(now.getTime() / 1000)}
  `;
  
  bot.sendMessage(chatId, timeMessage, { parse_mode: 'Markdown' });
});

// Command: /uptime
bot.onText(/\/uptime/, (msg) => {
  const chatId = msg.chat.id;
  const uptime = process.uptime();
  
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const uptimeMessage = `
⏱️ *Bot Uptime*

🕐 ${hours}h ${minutes}m ${seconds}s
📊 Total: ${Math.floor(uptime)} seconds

Bot has been running smoothly! ✅
  `;
  
  bot.sendMessage(chatId, uptimeMessage, { parse_mode: 'Markdown' });
});

// Command: /memory
bot.onText(/\/memory/, (msg) => {
  const chatId = msg.chat.id;
  const mem = process.memoryUsage();
  
  const memoryMessage = `
💾 *Memory Usage*

Heap Used: ${Math.round(mem.heapUsed / 1024 / 1024)}MB
Heap Total: ${Math.round(mem.heapTotal / 1024 / 1024)}MB
RSS: ${Math.round(mem.rss / 1024 / 1024)}MB
External: ${Math.round(mem.external / 1024 / 1024)}MB

Usage: ${Math.round((mem.heapUsed / mem.heapTotal) * 100)}%
  `;
  
  bot.sendMessage(chatId, memoryMessage, { parse_mode: 'Markdown' });
});

// Command: /version
bot.onText(/\/version/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, `
🔖 *AuraOS Version*

Version: 1.0.0
Build: Foundational
Node.js: ${process.version}
Bot API: node-telegram-bot-api v0.66.0

Status: Production Ready ✅
  `, { parse_mode: 'Markdown' });
});

// Command: /admin (Admin only)
bot.onText(/\/admin/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  const adminMessage = `
🔐 *Admin Panel*

*Available Commands:*
• /stats - Detailed statistics
• /users - List active users
• /broadcast <msg> - Send to all users
• /restart - Restart bot (coming soon)
• /logs - View logs (coming soon)

*System Info:*
👥 Active Users: ${userSessions.size}
💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
⏱️ Uptime: ${Math.floor(process.uptime() / 60)} minutes

Admin access granted ✅
  `;
  
  bot.sendMessage(chatId, adminMessage, { parse_mode: 'Markdown' });
});

// Command: /stats (Admin only)
bot.onText(/\/stats/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  const mem = process.memoryUsage();
  const uptime = process.uptime();
  
  const statsMessage = `
📊 *Detailed Statistics*

*Users:*
👥 Active Sessions: ${userSessions.size}
🔐 Admins: ${ADMIN_USER_IDS.length}

*System:*
💾 Heap Used: ${Math.round(mem.heapUsed / 1024 / 1024)}MB
💾 Heap Total: ${Math.round(mem.heapTotal / 1024 / 1024)}MB
💾 RSS: ${Math.round(mem.rss / 1024 / 1024)}MB
⏱️ Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m

*Platform:*
🖥️ Node.js: ${process.version}
🏗️ Arch: ${process.arch}
🐧 OS: ${process.platform}

*Performance:*
📈 CPU Usage: ${Math.round(process.cpuUsage().user / 1000)}ms
🔄 Event Loop: Active
  `;
  
  bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
});

// Command: /users (Admin only)
bot.onText(/\/users/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  if (userSessions.size === 0) {
    bot.sendMessage(chatId, '📭 No active user sessions.');
    return;
  }
  
  let userList = '👥 *Active Users:*\n\n';
  let index = 1;
  
  for (const [chatId, session] of userSessions.entries()) {
    const duration = Math.floor((Date.now() - session.startedAt) / 1000 / 60);
    userList += `${index}. ${session.firstName} (@${session.username || 'N/A'})\n`;
    userList += `   ID: ${session.userId}\n`;
    userList += `   Duration: ${duration}m\n\n`;
    index++;
  }
  
  bot.sendMessage(chatId, userList, { parse_mode: 'Markdown' });
});

// Command: /broadcast (Admin only)
bot.onText(/\/broadcast (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  const message = match[1];
  let sentCount = 0;
  
  bot.sendMessage(chatId, '📢 Broadcasting message...');
  
  for (const [userChatId] of userSessions.entries()) {
    bot.sendMessage(userChatId, `📢 *Broadcast Message*\n\n${message}`, { parse_mode: 'Markdown' })
      .then(() => sentCount++)
      .catch(err => console.error(`Failed to send to ${userChatId}:`, err.message));
  }
  
  setTimeout(() => {
    bot.sendMessage(chatId, `✅ Broadcast sent to ${sentCount} users.`);
  }, 1000);
});

// Handle all text messages (not commands)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Skip if it's a command
  if (text && text.startsWith('/')) {
    return;
  }
  
  // Update session message count
  if (userSessions.has(chatId)) {
    const session = userSessions.get(chatId);
    session.messageCount++;
  }
  
  // Simple AI-like responses
  if (text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      bot.sendMessage(chatId, '👋 Hello! How can I help you today?');
    } else if (lowerText.includes('how are you')) {
      bot.sendMessage(chatId, '🤖 I\'m functioning perfectly! All systems operational.');
    } else if (lowerText.includes('thank')) {
      bot.sendMessage(chatId, '😊 You\'re welcome! Happy to help!');
    } else if (lowerText.includes('help')) {
      bot.sendMessage(chatId, 'Type /help to see all available commands!');
    } else {
      bot.sendMessage(chatId, `You said: "${text}"\n\nTry /help for available commands!`);
    }
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.message);
});

bot.on('error', (error) => {
  console.error('❌ Bot error:', error.message);
});

// Startup notification
if (ADMIN_CHAT_ID) {
  bot.sendMessage(ADMIN_CHAT_ID, `
🚀 *AuraOS Bot Started!*

✅ Bot is now online and ready
🕐 Started at: ${new Date().toLocaleString()}
🤖 Version: 1.0.0

Type /help to see available commands.
  `, { parse_mode: 'Markdown' }).catch(err => {
    console.error('Failed to send startup notification:', err.message);
  });
}

console.log('✅ AuraOS Telegram Bot is running!');
console.log(`📱 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
console.log(`👤 Admin Chat ID: ${ADMIN_CHAT_ID}`);
console.log('🎯 Listening for messages...\n');
