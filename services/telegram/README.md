# AuraOS Telegram Bot

A powerful Telegram bot for interacting with AuraOS system.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd services/telegram
npm install
# or if you have pnpm installed
pnpm install
```

### 2. Configuration

The bot is already configured with your credentials in `.env`:
- Bot Token: `8310343758:AAFLtyqdQ5PE8YtyChwJ4uGfAgy4s5qMYi0`
- Your Chat ID: `1259666822`

### 3. Run the Bot

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

## 📱 How to Use

### Open Telegram App

1. **On Mobile:**
   - Open Telegram app on your phone
   - Search for your bot (use the bot username from @BotFather)
   - Or click this link: `https://t.me/YOUR_BOT_USERNAME`

2. **On Desktop:**
   - Open Telegram Desktop app
   - Search for your bot
   - Start chatting

3. **On Web:**
   - Go to https://web.telegram.org
   - Search for your bot
   - Start conversation

### Available Commands

Once you open the bot, type these commands:

#### Basic Commands
- `/start` - Initialize bot and see welcome message
- `/menu` - Show interactive menu with buttons
- `/help` - Show all available commands
- `/status` - Get system status
- `/info` - Bot information
- `/ping` - Test bot responsiveness
- `/time` - Current server time
- `/uptime` - How long bot has been running
- `/memory` - Memory usage statistics
- `/version` - AuraOS version info

#### Interactive Commands
- `/echo <text>` - Bot will echo your message
  - Example: `/echo Hello World`

#### Admin Commands (Only for you - Chat ID: 1259666822)
- `/admin` - Access admin panel with interactive buttons
- `/stats` - Detailed system statistics
- `/users` - List all active users
- `/analytics` - View usage analytics and command statistics
- `/broadcast <message>` - Send message to all users
  - Example: `/broadcast System maintenance in 10 minutes`

#### Cursor CLI Commands (Admin Only) 🤖
- `/code <file>` - Analyze code file with statistics
  - Example: `/code src/index.js`
- `/files [directory]` - List files in directory
  - Example: `/files src`
- `/search <term>` - Search for text in files
  - Example: `/search "TODO"`
- `/git` - Show git status
- `/gitlog` - Show recent commits
- `/tree` - Display project structure
- `/read <file>` - Read file content
  - Example: `/read package.json`
- `/pkg` - Show package.json information
- `/find <pattern>` - Find files by pattern
  - Example: `/find "*.tsx"`
- `/sysinfo` - Display system information
- `/loc` - Count lines of code
- `/ai <command>` - Execute AI-powered natural language command
  - Example: `/ai show files`
  - Example: `/ai git status`

### Chat with the Bot

You can also just send regular messages:
- Say "hello" or "hi" - Bot will greet you
- Say "how are you" - Bot will respond
- Say "thank you" - Bot will acknowledge
- Any other text - Bot will echo it back

## 🎯 Use Cases

### 1. System Monitoring
```
You: /status
Bot: Shows system uptime, memory, active users
```

### 2. Quick Checks
```
You: /ping
Bot: Pong! Response time: 45ms
```

### 3. Admin Notifications
```
You: /broadcast Server will restart in 5 minutes
Bot: Sends to all active users
```

### 4. Get Information
```
You: /info
Bot: Shows AuraOS version, features, repository link
```

## 🔧 Integration with AuraOS

### ✅ Current Features

1. **Cursor CLI Integration** 🤖
   - Code analysis and statistics
   - File operations (read, list, search)
   - Git operations (status, log)
   - Project structure visualization
   - AI-powered command execution
   - System monitoring

2. **Interactive UI** 🎛️
   - Inline keyboard buttons
   - Quick command access
   - Admin panel with dedicated keyboard
   - Command menu autocomplete

3. **Analytics & Monitoring** 📈
   - Usage statistics tracking
   - Command popularity metrics
   - User activity monitoring
   - Performance analytics

4. **Security Features** 🔐
   - Rate limiting (20 req/min)
   - Admin-only commands
   - Safe command execution
   - Input validation

### Future Features (Coming Soon)

1. **MCP Integration**
   - Execute file system commands via bot
   - Control emulator remotely
   - Run BASIC programs

2. **AI Assistant**
   - OpenAI/Claude integration
   - Natural language code queries
   - Automated code reviews
   - Debug assistance

3. **Notifications**
   - Build status updates
   - Error alerts
   - System events
   - Git push notifications

4. **Remote Control**
   - Start/stop services
   - Deploy applications
   - View logs
   - Run tests remotely

## 📝 Example Usage Session

```
You: /start
Bot: Welcome message with available commands

You: /status
Bot: System is running, 15 minutes uptime, 45MB memory

You: Hello
Bot: 👋 Hello! How can I help you today?

You: /echo Testing the bot
Bot: 🔊 Echo: Testing the bot

You: /admin
Bot: Admin panel with statistics

You: /broadcast Important update!
Bot: Broadcast sent to 5 users
```

## 🛠️ Development

### Project Structure
```
services/telegram/
├── src/
│   └── index.js          # Main bot implementation
├── .env                  # Configuration (your credentials)
├── .env.example          # Example configuration
├── package.json          # Dependencies
└── README.md            # This file
```

### Adding New Commands

Edit `src/index.js` and add:

```javascript
bot.onText(/\/mycommand/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'My custom response!');
});
```

### Testing

1. Start the bot: `npm start`
2. Open Telegram
3. Send `/start` to your bot
4. Try different commands

## 🔐 Security

- Bot token is stored in `.env` file (not committed to git)
- Admin commands only work for your Chat ID (1259666822)
- User sessions are stored in memory (cleared on restart)

## 📞 Support

If the bot doesn't respond:
1. Check if bot is running: `npm start`
2. Verify bot token in `.env`
3. Make sure you're using the correct bot username
4. Check console for error messages

## 🎨 Customization

### Change Bot Name
Edit `.env`:
```
BOT_NAME=My Custom Bot Name
```

### Add More Admins
Edit `.env`:
```
ADMIN_USER_IDS=1259666822,123456789,987654321
```

### Modify Responses
Edit `src/index.js` and change the message templates.

## 📚 Resources

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [node-telegram-bot-api Docs](https://github.com/yagop/node-telegram-bot-api)
- [AuraOS Repository](https://github.com/Moeabdelaziz007/AuraOS-Monorepo)
- [Cursor CLI Guide](./CURSOR_CLI_GUIDE.md) - Detailed guide for Cursor integration
- [Improvements](./IMPROVEMENTS.md) - New features and enhancements

## 📖 Additional Documentation

- **USAGE_GUIDE.md** - Step-by-step usage instructions
- **CURSOR_CLI_GUIDE.md** - Complete Cursor CLI integration guide
- **IMPROVEMENTS.md** - List of all improvements and new features

## 🎉 What's New in v1.0.0 Enhanced

- ✅ **Interactive Inline Keyboards** - Button-based UI for all commands
- ✅ **Cursor CLI Integration** - AI-powered code analysis and file operations
- ✅ **Rate Limiting** - Protection against spam (20 req/min)
- ✅ **Usage Analytics** - Track command usage and patterns
- ✅ **Command Menu** - Autocomplete for all commands
- ✅ **Enhanced Admin Panel** - Dedicated keyboard with quick access
- ✅ **Better Error Handling** - Graceful error recovery
- ✅ **Improved Logging** - Detailed startup and error logs

---

**Version:** 1.0.0 Enhanced  
**Made with ❤️ for AuraOS**
