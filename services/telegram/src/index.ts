import TelegramBot from 'node-telegram-bot-api';

// Replace with your actual bot token from BotFather
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome to AuraOS Telegram Bot! How can I help you?');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(`Received message from ${chatId}: ${msg.text}`);

  // Echo all messages back to the chat
  // bot.sendMessage(chatId, `You said: ${msg.text}`);
});

console.log('AuraOS Telegram Bot started...');

export default bot;