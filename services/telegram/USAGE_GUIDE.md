# 📱 How to Use Your AuraOS Telegram Bot

## Step-by-Step Guide

### Step 1: Install Node.js (if not installed)

Check if Node.js is installed:
```bash
node --version
```

If not installed, download from: https://nodejs.org/

### Step 2: Install Dependencies

```bash
cd services/telegram
npm install
```

This will install:
- `node-telegram-bot-api` - Telegram bot library
- `dotenv` - Environment variables

### Step 3: Start the Bot

```bash
npm start
```

You should see:
```
🤖 Starting AuraOS Telegram Bot...
✅ AuraOS Telegram Bot is running!
📱 Bot Token: 8310343758...
👤 Admin Chat ID: 1259666822
🎯 Listening for messages...
```

### Step 4: Open Telegram

**Option A: Mobile App**
1. Open Telegram on your phone
2. Search for your bot (get username from @BotFather)
3. Tap on the bot
4. Press "START" button

**Option B: Desktop App**
1. Open Telegram Desktop
2. Use search bar to find your bot
3. Click on the bot
4. Click "START"

**Option C: Web Browser**
1. Go to https://web.telegram.org
2. Login with your phone number
3. Search for your bot
4. Start chatting

### Step 5: Try Commands

Type these in the chat:

```
/start
```
Bot will send welcome message

```
/help
```
Shows all available commands

```
/status
```
Shows system status

```
/ping
```
Tests bot speed

```
Hello
```
Bot will greet you back!

## 🎯 What You Can Do

### 1. Monitor Your System
```
/status    - See if bot is running
/uptime    - How long bot has been online
/memory    - Memory usage
/version   - Bot version
```

### 2. Get Information
```
/info      - About the bot
/time      - Current time
/help      - All commands
```

### 3. Interactive Features
```
/echo Hello World    - Bot repeats your message
/ping               - Check response time
```

### 4. Admin Features (Only You)
```
/admin              - Admin panel
/stats              - Detailed statistics
/users              - See who's using the bot
/broadcast <msg>    - Send message to everyone
```

### 5. Chat Naturally
Just type normal messages:
- "hello" → Bot greets you
- "how are you" → Bot responds
- "thank you" → Bot acknowledges
- Any text → Bot echoes it

## 🔧 Common Issues

### Bot Not Responding?

**Check 1: Is bot running?**
```bash
# In terminal, you should see:
✅ AuraOS Telegram Bot is running!
```

**Check 2: Correct bot token?**
```bash
# Check .env file
cat services/telegram/.env
```

**Check 3: Started conversation?**
- Press "START" button in Telegram
- Or type `/start`

### Bot Says "Access Denied"?

Some commands are admin-only. Make sure:
- Your Chat ID is `1259666822`
- You're using the correct Telegram account

### How to Find Your Bot?

1. Go to @BotFather in Telegram
2. Send `/mybots`
3. Select your bot
4. Copy the username
5. Search for that username in Telegram

## 📊 Example Session

```
You: /start
Bot: 🌟 Welcome to AuraOS Bot! 🌟
     Hello User! I'm your AI-powered operating system assistant.
     [Shows available commands]

You: /status
Bot: 📊 System Status
     🟢 Status: Running
     ⏱️ Uptime: 5 minutes
     💾 Memory: 45MB / 128MB
     All systems operational! ✅

You: /ping
Bot: 🏓 Pong!
     ⚡ Response time: 42ms

You: /echo Testing the bot
Bot: 🔊 Echo: Testing the bot

You: Hello bot
Bot: 👋 Hello! How can I help you today?

You: /admin
Bot: 🔐 Admin Panel
     [Shows admin commands and statistics]

You: /broadcast System update completed!
Bot: 📢 Broadcasting message...
     ✅ Broadcast sent to 3 users.
```

## 🚀 Advanced Usage

### Run Bot in Background

**Using screen:**
```bash
screen -S telegram-bot
cd services/telegram
npm start
# Press Ctrl+A then D to detach
```

**Using PM2:**
```bash
npm install -g pm2
pm2 start src/index.js --name auraos-bot
pm2 logs auraos-bot
```

### Auto-Restart on Changes

```bash
npm run dev
```

This watches for file changes and restarts automatically.

### View Logs

```bash
# If using PM2
pm2 logs auraos-bot

# If running normally
# Logs appear in terminal where you ran npm start
```

## 🎨 Customization

### Change Welcome Message

Edit `services/telegram/src/index.js`:

Find the `/start` command and modify the `welcomeMessage` variable.

### Add Your Own Command

Add this to `src/index.js`:

```javascript
bot.onText(/\/mycommand/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'My custom response!');
});
```

### Change Bot Responses

Find the message handlers in `src/index.js` and modify the responses.

## 📞 Need Help?

1. **Check bot is running**: Look for "✅ AuraOS Telegram Bot is running!" in terminal
2. **Check logs**: Look for error messages in terminal
3. **Restart bot**: Press Ctrl+C, then `npm start` again
4. **Verify token**: Check `.env` file has correct token
5. **Test connection**: Send `/ping` to bot

## 🎯 Next Steps

Once bot is working:

1. ✅ Try all basic commands
2. ✅ Test admin features
3. ✅ Send a broadcast message
4. ✅ Chat naturally with bot
5. 🔜 Add MCP integration (file system, emulator control)
6. 🔜 Connect to AI assistant
7. 🔜 Add custom commands for your needs

---

**Your Bot is Ready! 🎉**

Open Telegram and start chatting with your AuraOS bot!
