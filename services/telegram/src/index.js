import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import CursorIntegration from './cursor-integration.js';

// Simple logger
const logger = {
  info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
  debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args)
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id.trim())) || [];

if (!BOT_TOKEN) {
  logger.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

logger.info('🤖 Starting AuraOS Telegram Bot...');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Initialize Cursor integration
const cursor = new CursorIntegration();

// Store user sessions
const userSessions = new Map();

// Rate limiting
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

// Analytics
const analytics = {
  totalMessages: 0,
  totalCommands: 0,
  commandUsage: new Map(),
  startTime: Date.now()
};

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

// Rate limiting middleware
function checkRateLimit(userId) {
  const now = Date.now();
  const userLimit = rateLimits.get(userId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > userLimit.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  userLimit.count++;
  rateLimits.set(userId, userLimit);
  return true;
}

// Track command usage
function trackCommand(command) {
  analytics.totalCommands++;
  const count = analytics.commandUsage.get(command) || 0;
  analytics.commandUsage.set(command, count + 1);
}

// Create inline keyboard
function createMainKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📊 Status', callback_data: 'cmd_status' },
        { text: 'ℹ️ Info', callback_data: 'cmd_info' }
      ],
      [
        { text: '🏓 Ping', callback_data: 'cmd_ping' },
        { text: '⏱️ Uptime', callback_data: 'cmd_uptime' }
      ],
      [
        { text: '💾 Memory', callback_data: 'cmd_memory' },
        { text: '🔖 Version', callback_data: 'cmd_version' }
      ],
      [
        { text: '📚 Help', callback_data: 'cmd_help' }
      ]
    ]
  };
}

function createAdminKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📊 Stats', callback_data: 'admin_stats' },
        { text: '👥 Users', callback_data: 'admin_users' }
      ],
      [
        { text: '📈 Analytics', callback_data: 'admin_analytics' },
        { text: '🔄 Refresh', callback_data: 'admin_refresh' }
      ],
      [
        { text: '« Back', callback_data: 'cmd_start' }
      ]
    ]
  };
}

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name || 'User';
  
  if (!checkRateLimit(userId)) {
    bot.sendMessage(chatId, '⚠️ Rate limit exceeded. Please wait a moment.');
    return;
  }
  
  trackCommand('start');
  
  const welcomeMessage = `
🌟 *Welcome to AuraOS Bot!* 🌟

Hello ${userName}! I'm your AI-powered operating system assistant.

*Quick Actions:*
Use the buttons below for quick access to features!

*Available Commands:*
/help - Show all commands
/status - System status
/info - Bot information
/ping - Check bot responsiveness
/echo <text> - Echo your message
/time - Current server time
/uptime - Bot uptime
/menu - Show interactive menu

*Admin Commands:*
/admin - Admin panel (admins only)
/broadcast <msg> - Send message to all users
/stats - Detailed statistics

Type /help for more details!
  `;
  
  bot.sendMessage(chatId, welcomeMessage, { 
    parse_mode: 'Markdown',
    reply_markup: createMainKeyboard()
  });
  
  userSessions.set(chatId, {
    userId: msg.from.id,
    username: msg.from.username,
    firstName: msg.from.first_name,
    startedAt: new Date(),
    messageCount: 0,
    lastActivity: new Date()
  });
});

// Command: /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const isAdminUser = isAdmin(userId);
  
  let helpMessage = `
📚 *AuraOS Bot - Help Guide*

*Basic Commands:*
• /start - Initialize bot session
• /menu - Show interactive menu
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

*AI Commands:*
• /summarize <url> - Summarize web articles
`;

  if (isAdminUser) {
    helpMessage += `
*Admin Commands:* (Admins only)
• /admin - Access admin panel
• /analytics - Usage analytics
• /broadcast <message> - Send to all users
• /stats - Detailed statistics
• /users - List active users

*Cursor CLI Commands:* (Admins only)
• /code <file> - Analyze code file
• /files [dir] - List files in directory
• /search <term> - Search in files
• /git - Git status
• /gitlog - Recent commits
• /tree - Project structure
• /read <file> - Read file content
• /pkg - Package information
• /find <pattern> - Find files by name
• /sysinfo - System information
• /loc - Count lines of code
• /ai <command> - AI-powered command

*Examples:*
\`/code src/index.js\`
\`/search "TODO"\`
\`/find "*.tsx"\`
\`/ai show files\`
`;
  }

  helpMessage += `
*Features:*
✅ AI-powered responses
✅ System monitoring
✅ Real-time notifications
✅ Interactive keyboards
✅ Rate limiting protection
✅ Cursor CLI integration
✅ Code analysis

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
  
  trackCommand('admin');
  
  const adminMessage = `
🔐 *Admin Panel*

*Available Commands:*
• /stats - Detailed statistics
• /users - List active users
• /analytics - Usage analytics
• /broadcast <msg> - Send to all users
• /restart - Restart bot (coming soon)
• /logs - View logs (coming soon)

*Quick Stats:*
👥 Active Users: ${userSessions.size}
💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
⏱️ Uptime: ${Math.floor(process.uptime() / 60)} minutes
📨 Total Messages: ${analytics.totalMessages}
⚡ Total Commands: ${analytics.totalCommands}

Admin access granted ✅
  `;
  
  bot.sendMessage(chatId, adminMessage, { 
    parse_mode: 'Markdown',
    reply_markup: createAdminKeyboard()
  });
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
      .catch(err => logger.error(`Failed to send to ${userChatId}:`, err.message));
  }
  
  setTimeout(() => {
    bot.sendMessage(chatId, `✅ Broadcast sent to ${sentCount} users.`);
  }, 1000);
});

// Command: /menu
bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!checkRateLimit(userId)) {
    bot.sendMessage(chatId, '⚠️ Rate limit exceeded. Please wait a moment.');
    return;
  }
  
  trackCommand('menu');
  
  bot.sendMessage(chatId, '🎛️ *Interactive Menu*\n\nSelect an option:', {
    parse_mode: 'Markdown',
    reply_markup: createMainKeyboard()
  });
});

// Command: /analytics (Admin only)
bot.onText(/\/analytics/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('analytics');
  
  const uptime = Date.now() - analytics.startTime;
  const hours = Math.floor(uptime / 3600000);
  const minutes = Math.floor((uptime % 3600000) / 60000);
  
  let commandStats = '*Top Commands:*\n';
  const sortedCommands = Array.from(analytics.commandUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sortedCommands.forEach(([cmd, count], index) => {
    commandStats += `${index + 1}. /${cmd}: ${count} times\n`;
  });
  
  const analyticsMessage = `
📈 *Bot Analytics*

*Usage Statistics:*
📨 Total Messages: ${analytics.totalMessages}
⚡ Total Commands: ${analytics.totalCommands}
👥 Active Users: ${userSessions.size}
⏱️ Running: ${hours}h ${minutes}m

${commandStats}

*Performance:*
💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
🔄 Rate Limits Active: ${rateLimits.size}
  `;
  
  bot.sendMessage(chatId, analyticsMessage, { parse_mode: 'Markdown' });
});

// Command: /code <file> - Analyze code file (Admin only)
bot.onText(/\/code (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('code');
  const filePath = match[1];
  
  bot.sendMessage(chatId, '🔍 Analyzing code...');
  
  const result = await cursor.analyzeCode(filePath);
  
  if (result.success) {
    const message = `
📝 *Code Analysis: ${filePath}*

*Statistics:*
📏 Lines: ${result.analysis.lines}
🔧 Functions: ${result.analysis.functions}
📦 Classes: ${result.analysis.classes}
📥 Imports: ${result.analysis.imports}
📤 Exports: ${result.analysis.exports}
💬 Comments: ${result.analysis.comments}
⚠️ TODOs: ${result.analysis.todos}

*Preview:*
\`\`\`
${result.preview}
\`\`\`
    `;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ Error: ${result.error}`);
  }
});

// Command: /files [directory] - List files
bot.onText(/\/files(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('files');
  const directory = match[1].trim() || '.';
  
  bot.sendMessage(chatId, '📁 Listing files...');
  
  const result = await cursor.listFiles(directory);
  
  if (result.success) {
    const output = cursor.formatOutput(result.output);
    bot.sendMessage(chatId, `📁 *Files in ${directory}:*\n\`\`\`\n${output}\n\`\`\``, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ Error: ${result.error}`);
  }
});

// Command: /search <term> - Search in files
bot.onText(/\/search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('search');
  const searchTerm = match[1];
  
  bot.sendMessage(chatId, '🔍 Searching...');
  
  const result = await cursor.searchInFiles(searchTerm);
  
  if (result.success) {
    const output = cursor.formatOutput(result.output);
    bot.sendMessage(chatId, `🔍 *Search results for "${searchTerm}":*\n\`\`\`\n${output}\n\`\`\``, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ Error: ${result.error}`);
  }
});

// Command: /git - Git status
bot.onText(/\/git$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('git');
  
  bot.sendMessage(chatId, '📊 Getting git status...');
  
  const result = await cursor.getGitStatus();
  
  if (result.success) {
    const output = cursor.formatOutput(result.output || 'Working tree clean ✅');
    bot.sendMessage(chatId, `📊 *Git Status:*\n\`\`\`\n${output}\n\`\`\``, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ Error: ${result.error}`);
  }
});

// Command: /gitlog - Git log
bot.onText(/\/gitlog/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('gitlog');
  
  bot.sendMessage(chatId, '📜 Getting git log...');
  
  const result = await cursor.getGitLog();
  
  if (result.success) {
    const output = cursor.formatOutput(result.output);
    bot.sendMessage(chatId, `📜 *Recent Commits:*\n\`\`\`\n${output}\n\`\`\``, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ Error: ${result.error}`);
  }
});

// Command: /tree - Project structure
bot.onText(/\/tree/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('tree');
  
  bot.sendMessage(chatId, '🌳 Getting project structure...');
  
  const result = await cursor.getProjectStructure();
  
  if (result.success) {
    const output = cursor.formatOutput(result.output);
    bot.sendMessage(chatId, `🌳 *Project Structure:*\n\`\`\`\n${output}\n\`\`\``, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ Error: ${result.error}`);
  }
});

// Command: /read <file> - Read file content
bot.onText(/\/read (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('read');
  const filePath = match[1];
  
  bot.sendMessage(chatId, '📖 Reading file...');
  
  const result = await cursor.readFile(filePath);
  
  if (result.success) {
    const truncated = result.truncated ? '\n\n... (truncated)' : '';
    bot.sendMessage(chatId, `📖 *File: ${filePath}*\n\`\`\`\n${result.content}${truncated}\n\`\`\`\n\nTotal lines: ${result.totalLines}`, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ Error: ${result.error}`);
  }
});

// Command: /pkg - Package info
bot.onText(/\/pkg/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('pkg');
  
  bot.sendMessage(chatId, '📦 Getting package info...');
  
  const result = await cursor.getPackageInfo();
  
  if (result.success) {
    const message = `
📦 *Package Information*

*Name:* ${result.name}
*Version:* ${result.version}
*Description:* ${result.description}

*Scripts:* ${result.scripts.length}
*Dependencies:* ${result.dependencies}
*Dev Dependencies:* ${result.devDependencies}

*Available Scripts:*
${result.scripts.map(s => `• ${s}`).join('\n')}
    `;
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ Error: ${result.error}`);
  }
});

// Command: /find <pattern> - Find files
bot.onText(/\/find (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('find');
  const pattern = match[1];
  
  bot.sendMessage(chatId, '🔍 Finding files...');
  
  const result = await cursor.findFiles(pattern);
  
  if (result.success) {
    const output = cursor.formatOutput(result.output || 'No files found');
    bot.sendMessage(chatId, `🔍 *Files matching "${pattern}":*\n\`\`\`\n${output}\n\`\`\``, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ Error: ${result.error}`);
  }
});

// Command: /sysinfo - System information
bot.onText(/\/sysinfo/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('sysinfo');
  
  bot.sendMessage(chatId, '💻 Getting system info...');
  
  const result = await cursor.getSystemInfo();
  
  const message = `
💻 *System Information*

*Disk Usage:*
\`\`\`
${result.disk}
\`\`\`

*Memory:*
\`\`\`
${result.memory}
\`\`\`

*CPU:*
\`\`\`
${result.cpu}
\`\`\`
  `;
  
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Command: /loc - Count lines of code
bot.onText(/\/loc/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('loc');
  
  bot.sendMessage(chatId, '📊 Counting lines of code...');
  
  const result = await cursor.countLinesOfCode();
  
  if (result.success) {
    bot.sendMessage(chatId, `📊 *Lines of Code:*\n\`\`\`\n${result.output}\n\`\`\``, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ Error: ${result.error}`);
  }
});

// Command: /ai <command> - AI-powered command execution
bot.onText(/\/ai (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
    return;
  }
  
  trackCommand('ai');
  const command = match[1];
  
  bot.sendMessage(chatId, '🤖 Processing AI command...');
  
  const result = await cursor.executeAICommand(command);
  
  if (result.success) {
    const output = cursor.formatOutput(result.output);
    bot.sendMessage(chatId, `🤖 *AI Command Result:*\n\`\`\`\n${output}\n\`\`\``, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ Error: ${result.error}`);
  }
});

// Command: /summarize
bot.onText(/\/summarize (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const url = match[1];
  
  trackCommand('summarize');
  
  try {
    // Send initial message
    const processingMsg = await bot.sendMessage(
      chatId,
      '🔄 Analyzing web content...\nThis may take a few moments.',
      { parse_mode: 'HTML' }
    );

    // For now, we'll create a simple mock response since the web summarizer handler isn't integrated
    // In a real implementation, you would call the webSummarizerHandler here
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

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

  } catch (error) {
    logger.error('[Telegram Web Summarizer] Error:', error);
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

// Handle callback queries (inline button clicks)
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;
  
  // Answer callback to remove loading state
  bot.answerCallbackQuery(query.id);
  
  if (!checkRateLimit(userId)) {
    bot.sendMessage(chatId, '⚠️ Rate limit exceeded. Please wait a moment.');
    return;
  }
  
  // Handle different callback actions
  switch (data) {
    case 'cmd_start':
      bot.sendMessage(chatId, '🎛️ *Main Menu*', {
        parse_mode: 'Markdown',
        reply_markup: createMainKeyboard()
      });
      break;
      
    case 'cmd_status':
      trackCommand('status');
      const info = getSystemInfo();
      bot.sendMessage(chatId, `
📊 *System Status*

🟢 Status: ${info.status}
⏱️ Uptime: ${Math.floor(info.uptime / 60)} minutes
💾 Memory: ${Math.round(info.memory.heapUsed / 1024 / 1024)}MB / ${Math.round(info.memory.heapTotal / 1024 / 1024)}MB
🕐 Time: ${new Date().toLocaleString()}
👥 Active Users: ${userSessions.size}

All systems operational! ✅
      `, { parse_mode: 'Markdown', reply_markup: createMainKeyboard() });
      break;
      
    case 'cmd_info':
      trackCommand('info');
      bot.sendMessage(chatId, `
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
• ⚡ Rate Limiting
• 📈 Analytics

*Repository:*
github.com/Moeabdelaziz007/AuraOS-Monorepo

Built with ❤️ by Mohamed Abdelaziz
      `, { parse_mode: 'Markdown', reply_markup: createMainKeyboard() });
      break;
      
    case 'cmd_ping':
      trackCommand('ping');
      const startTime = Date.now();
      bot.sendMessage(chatId, '🏓 Pong!').then(() => {
        const latency = Date.now() - startTime;
        bot.sendMessage(chatId, `⚡ Response time: ${latency}ms`, {
          reply_markup: createMainKeyboard()
        });
      });
      break;
      
    case 'cmd_uptime':
      trackCommand('uptime');
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      bot.sendMessage(chatId, `
⏱️ *Bot Uptime*

🕐 ${hours}h ${minutes}m ${seconds}s
📊 Total: ${Math.floor(uptime)} seconds

Bot has been running smoothly! ✅
      `, { parse_mode: 'Markdown', reply_markup: createMainKeyboard() });
      break;
      
    case 'cmd_memory':
      trackCommand('memory');
      const mem = process.memoryUsage();
      bot.sendMessage(chatId, `
💾 *Memory Usage*

Heap Used: ${Math.round(mem.heapUsed / 1024 / 1024)}MB
Heap Total: ${Math.round(mem.heapTotal / 1024 / 1024)}MB
RSS: ${Math.round(mem.rss / 1024 / 1024)}MB
External: ${Math.round(mem.external / 1024 / 1024)}MB

Usage: ${Math.round((mem.heapUsed / mem.heapTotal) * 100)}%
      `, { parse_mode: 'Markdown', reply_markup: createMainKeyboard() });
      break;
      
    case 'cmd_version':
      trackCommand('version');
      bot.sendMessage(chatId, `
🔖 *AuraOS Version*

Version: 1.0.0
Build: Enhanced
Node.js: ${process.version}
Bot API: node-telegram-bot-api v0.66.0

Status: Production Ready ✅
      `, { parse_mode: 'Markdown', reply_markup: createMainKeyboard() });
      break;
      
    case 'cmd_help':
      trackCommand('help');
      bot.sendMessage(chatId, `
📚 *AuraOS Bot - Help Guide*

*Basic Commands:*
• /start - Initialize bot session
• /menu - Show interactive menu
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

*AI Commands:*
• /summarize <url> - Summarize web articles

*Admin Commands:* (Admins only)
• /admin - Access admin panel
• /analytics - Usage analytics
• /broadcast <message> - Send to all users
• /stats - Detailed statistics
• /users - List active users

*Features:*
✅ AI-powered responses
✅ System monitoring
✅ Real-time notifications
✅ Rate limiting protection
✅ Interactive buttons
✅ Usage analytics

Need help? Contact the admin!
      `, { parse_mode: 'Markdown', reply_markup: createMainKeyboard() });
      break;
      
    case 'admin_stats':
      if (!isAdmin(userId)) {
        bot.sendMessage(chatId, '❌ Access denied.');
        return;
      }
      trackCommand('stats');
      const memStats = process.memoryUsage();
      const uptimeStats = process.uptime();
      bot.sendMessage(chatId, `
📊 *Detailed Statistics*

*Users:*
👥 Active Sessions: ${userSessions.size}
🔐 Admins: ${ADMIN_USER_IDS.length}

*System:*
💾 Heap Used: ${Math.round(memStats.heapUsed / 1024 / 1024)}MB
💾 Heap Total: ${Math.round(memStats.heapTotal / 1024 / 1024)}MB
💾 RSS: ${Math.round(memStats.rss / 1024 / 1024)}MB
⏱️ Uptime: ${Math.floor(uptimeStats / 3600)}h ${Math.floor((uptimeStats % 3600) / 60)}m

*Platform:*
🖥️ Node.js: ${process.version}
🏗️ Arch: ${process.arch}
🐧 OS: ${process.platform}

*Performance:*
📈 CPU Usage: ${Math.round(process.cpuUsage().user / 1000)}ms
🔄 Event Loop: Active
      `, { parse_mode: 'Markdown', reply_markup: createAdminKeyboard() });
      break;
      
    case 'admin_users':
      if (!isAdmin(userId)) {
        bot.sendMessage(chatId, '❌ Access denied.');
        return;
      }
      trackCommand('users');
      if (userSessions.size === 0) {
        bot.sendMessage(chatId, '📭 No active user sessions.', {
          reply_markup: createAdminKeyboard()
        });
        return;
      }
      
      let userList = '👥 *Active Users:*\n\n';
      let index = 1;
      
      for (const [chatId, session] of userSessions.entries()) {
        const duration = Math.floor((Date.now() - session.startedAt) / 1000 / 60);
        userList += `${index}. ${session.firstName} (@${session.username || 'N/A'})\n`;
        userList += `   ID: ${session.userId}\n`;
        userList += `   Duration: ${duration}m\n`;
        userList += `   Messages: ${session.messageCount}\n\n`;
        index++;
      }
      
      bot.sendMessage(chatId, userList, { 
        parse_mode: 'Markdown',
        reply_markup: createAdminKeyboard()
      });
      break;
      
    case 'admin_analytics':
      if (!isAdmin(userId)) {
        bot.sendMessage(chatId, '❌ Access denied.');
        return;
      }
      trackCommand('analytics');
      const analyticsUptime = Date.now() - analytics.startTime;
      const analyticsHours = Math.floor(analyticsUptime / 3600000);
      const analyticsMinutes = Math.floor((analyticsUptime % 3600000) / 60000);
      
      let cmdStats = '*Top Commands:*\n';
      const sortedCmds = Array.from(analytics.commandUsage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      sortedCmds.forEach(([cmd, count], idx) => {
        cmdStats += `${idx + 1}. /${cmd}: ${count}x\n`;
      });
      
      bot.sendMessage(chatId, `
📈 *Bot Analytics*

*Usage:*
📨 Total Messages: ${analytics.totalMessages}
⚡ Total Commands: ${analytics.totalCommands}
👥 Active Users: ${userSessions.size}
⏱️ Running: ${analyticsHours}h ${analyticsMinutes}m

${cmdStats}

*Performance:*
💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
🔄 Rate Limits: ${rateLimits.size}
      `, { parse_mode: 'Markdown', reply_markup: createAdminKeyboard() });
      break;
      
    case 'admin_refresh':
      bot.sendMessage(chatId, '🔄 Refreshed!', {
        reply_markup: createAdminKeyboard()
      });
      break;
  }
});

// Handle all text messages (not commands)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  // Skip if it's a command
  if (text && text.startsWith('/')) {
    return;
  }
  
  if (!checkRateLimit(userId)) {
    bot.sendMessage(chatId, '⚠️ Rate limit exceeded. Please wait a moment.');
    return;
  }
  
  analytics.totalMessages++;
  
  // Update session message count
  if (userSessions.has(chatId)) {
    const session = userSessions.get(chatId);
    session.messageCount++;
    session.lastActivity = new Date();
  }
  
  // Simple AI-like responses
  if (text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      bot.sendMessage(chatId, '👋 Hello! How can I help you today?\n\nTry /menu for quick actions!', {
        reply_markup: createMainKeyboard()
      });
    } else if (lowerText.includes('how are you')) {
      bot.sendMessage(chatId, '🤖 I\'m functioning perfectly! All systems operational.\n\nWhat can I do for you?', {
        reply_markup: createMainKeyboard()
      });
    } else if (lowerText.includes('thank')) {
      bot.sendMessage(chatId, '😊 You\'re welcome! Happy to help!');
    } else if (lowerText.includes('help')) {
      bot.sendMessage(chatId, 'Type /help to see all available commands!\n\nOr use /menu for quick access.', {
        reply_markup: createMainKeyboard()
      });
    } else if (lowerText.includes('menu')) {
      bot.sendMessage(chatId, '🎛️ Here\'s the interactive menu:', {
        reply_markup: createMainKeyboard()
      });
    } else {
      bot.sendMessage(chatId, `You said: "${text}"\n\nTry /menu for quick actions or /help for all commands!`);
    }
  }
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
  { command: 'menu', description: 'Show interactive menu' },
  { command: 'help', description: 'Show help message' },
  { command: 'status', description: 'System status' },
  { command: 'info', description: 'Bot information' },
  { command: 'ping', description: 'Test bot response' },
  { command: 'echo', description: 'Echo your message' },
  { command: 'time', description: 'Current server time' },
  { command: 'uptime', description: 'Bot uptime' },
  { command: 'memory', description: 'Memory usage' },
  { command: 'version', description: 'AuraOS version' },
  { command: 'summarize', description: 'Summarize web articles' },
  { command: 'admin', description: 'Admin panel (admins only)' },
  { command: 'code', description: 'Analyze code file (admin)' },
  { command: 'files', description: 'List files (admin)' },
  { command: 'git', description: 'Git status (admin)' },
  { command: 'tree', description: 'Project structure (admin)' },
  { command: 'ai', description: 'AI command (admin)' }
]).then(() => {
  logger.info('✅ Bot commands menu set successfully');
}).catch(err => {
  logger.error('❌ Failed to set commands menu:', err.message);
});

// Startup notification
if (ADMIN_CHAT_ID) {
  bot.sendMessage(ADMIN_CHAT_ID, `
🚀 *AuraOS Bot Started!*

✅ Bot is now online and ready
🕐 Started at: ${new Date().toLocaleString()}
🤖 Version: 1.0.0 Enhanced

*New Features:*
• ⚡ Rate limiting protection
• 🎛️ Interactive inline keyboards
• 📈 Usage analytics
• 📋 Command menu autocomplete
• 🔄 Improved error handling

Type /help to see available commands or /menu for quick access.
  `, { 
    parse_mode: 'Markdown',
    reply_markup: createMainKeyboard()
  }).catch(err => {
    logger.error('Failed to send startup notification:', err.message);
  });
}

logger.info('✅ AuraOS Telegram Bot is running!');
logger.info(`📱 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
logger.info(`👤 Admin Chat ID: ${ADMIN_CHAT_ID}`);
logger.info('🎯 Listening for messages...');
logger.info('🎛️ Interactive keyboards enabled');
logger.info('⚡ Rate limiting active');
logger.info('📈 Analytics tracking enabled\n');
