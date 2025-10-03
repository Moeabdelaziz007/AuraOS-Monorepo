/**
 * Core Bot functionality with TypeScript
 */

import TelegramBot from 'node-telegram-bot-api';
import { EventEmitter } from 'events';
import { 
  UserSession, 
  BotConfig, 
  CommandHandler, 
  CommandContext, 
  BotResponse,
  AnalyticsData,
  SystemMetrics
} from '../types/index.js';

export class BotCore extends EventEmitter {
  private bot: TelegramBot;
  private config: BotConfig;
  private userSessions: Map<number, UserSession> = new Map();
  private commandHandlers: Map<string, CommandHandler> = new Map();
  private analytics: AnalyticsData;
  private isRunning: boolean = false;

  constructor(config: BotConfig) {
    super();
    this.config = config;
    this.bot = new TelegramBot(config.token, { polling: true });
    this.analytics = this.initializeAnalytics();
    this.setupEventHandlers();
  }

  private initializeAnalytics(): AnalyticsData {
    return {
      totalMessages: 0,
      totalCommands: 0,
      activeUsers: 0,
      commandUsage: new Map(),
      userActivity: new Map(),
      systemMetrics: this.getSystemMetrics(),
      startTime: new Date()
    };
  }

  private setupEventHandlers(): void {
    this.bot.on('message', this.handleMessage.bind(this));
    this.bot.on('callback_query', this.handleCallbackQuery.bind(this));
    this.bot.on('polling_error', this.handlePollingError.bind(this));
    
    // Custom events
    this.on('user_joined', this.handleUserJoined.bind(this));
    this.on('user_left', this.handleUserLeft.bind(this));
    this.on('command_executed', this.handleCommandExecuted.bind(this));
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    try {
      console.log('🤖 Starting AuraOS Telegram Bot...');
      this.isRunning = true;
      
      // Initialize core services
      await this.initializeServices();
      
      console.log('✅ AuraOS Telegram Bot is running!');
      console.log(`📱 Bot Token: ${this.config.token.substring(0, 10)}...`);
      console.log(`👤 Admin Chat ID: ${this.config.adminChatId}`);
      console.log('🎯 Listening for messages...');
      
      this.emit('bot_started');
    } catch (error) {
      console.error('❌ Failed to start bot:', error);
      throw error;
    }
  }

  /**
   * Stop the bot
   */
  async stop(): Promise<void> {
    try {
      console.log('🛑 Stopping AuraOS Telegram Bot...');
      this.isRunning = false;
      
      // Save analytics data
      await this.saveAnalytics();
      
      // Cleanup
      this.bot.stopPolling();
      
      console.log('✅ Bot stopped successfully');
      this.emit('bot_stopped');
    } catch (error) {
      console.error('❌ Error stopping bot:', error);
      throw error;
    }
  }

  /**
   * Register a command handler
   */
  registerCommand(handler: CommandHandler): void {
    this.commandHandlers.set(handler.command, handler);
    console.log(`📝 Registered command: ${handler.command}`);
  }

  /**
   * Get user session
   */
  getUserSession(userId: number): UserSession | undefined {
    return this.userSessions.get(userId);
  }

  /**
   * Create or update user session
   */
  createUserSession(userId: number, chatId: number, userInfo: any): UserSession {
    const isAdmin = this.config.adminUserIds.includes(userId);
    
    const session: UserSession = {
      userId,
      chatId,
      username: userInfo.username,
      firstName: userInfo.first_name,
      lastName: userInfo.last_name,
      isAdmin,
      messageCount: 0,
      lastActivity: new Date(),
      preferences: {
        language: 'en',
        timezone: 'UTC',
        notifications: true,
        autoSave: true,
        theme: 'auto'
      },
      context: {
        commandHistory: [],
        aiContext: {
          conversationHistory: [],
          learningData: {
            commandPatterns: new Map(),
            userPreferences: new Map(),
            taskHistory: [],
            feedback: []
          }
        }
      }
    };

    this.userSessions.set(userId, session);
    this.analytics.activeUsers = this.userSessions.size;
    
    this.emit('user_joined', session);
    return session;
  }

  /**
   * Handle incoming messages
   */
  private async handleMessage(msg: any): Promise<void> {
    try {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const text = msg.text;

      // Update analytics
      this.analytics.totalMessages++;

      // Get or create user session
      let userSession = this.getUserSession(userId);
      if (!userSession) {
        userSession = this.createUserSession(userId, chatId, msg.from);
      }

      // Update user activity
      userSession.messageCount++;
      userSession.lastActivity = new Date();

      // Handle commands
      if (text && text.startsWith('/')) {
        await this.handleCommand(text, userSession, msg);
      } else {
        await this.handleTextMessage(text, userSession, msg);
      }

    } catch (error) {
      console.error('❌ Error handling message:', error);
      this.emit('error', error);
    }
  }

  /**
   * Handle command messages
   */
  private async handleCommand(command: string, userSession: UserSession, msg: any): Promise<void> {
    try {
      const [commandName, ...args] = command.split(' ');
      const handler = this.commandHandlers.get(commandName);

      if (!handler) {
        await this.bot.sendMessage(userSession.chatId, 
          `❌ Unknown command: ${commandName}\n\nType /help for available commands.`);
        return;
      }

      // Check admin permissions
      if (handler.adminOnly && !userSession.isAdmin) {
        await this.bot.sendMessage(userSession.chatId, 
          '❌ This command is only available for administrators.');
        return;
      }

      // Execute command
      const context: CommandContext = {
        bot: this.bot,
        message: msg,
        user: userSession,
        args,
        isAdmin: userSession.isAdmin
      };

      await handler.handler(context);
      
      // Update analytics
      this.analytics.totalCommands++;
      const count = this.analytics.commandUsage.get(commandName) || 0;
      this.analytics.commandUsage.set(commandName, count + 1);

      this.emit('command_executed', { command: commandName, user: userSession });

    } catch (error) {
      console.error(`❌ Error executing command ${command}:`, error);
      await this.bot.sendMessage(userSession.chatId, 
        '❌ An error occurred while executing the command.');
    }
  }

  /**
   * Handle text messages (non-commands)
   */
  private async handleTextMessage(text: string, userSession: UserSession, msg: any): Promise<void> {
    try {
      // Add to conversation history
      userSession.context.aiContext.conversationHistory.push({
        role: 'user',
        content: text,
        timestamp: new Date()
      });

      // Simple AI-like responses
      const response = await this.generateAIResponse(text, userSession);
      
      await this.bot.sendMessage(userSession.chatId, response);

      // Add AI response to conversation history
      userSession.context.aiContext.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Error handling text message:', error);
      await this.bot.sendMessage(userSession.chatId, 
        '❌ Sorry, I encountered an error processing your message.');
    }
  }

  /**
   * Handle callback queries (inline button clicks)
   */
  private async handleCallbackQuery(query: any): Promise<void> {
    try {
      const chatId = query.message.chat.id;
      const userId = query.from.id;
      const data = query.data;

      // Answer callback to remove loading state
      await this.bot.answerCallbackQuery(query.id);

      const userSession = this.getUserSession(userId);
      if (!userSession) {
        await this.bot.sendMessage(chatId, '❌ Session not found. Please restart the bot.');
        return;
      }

      // Handle callback data
      await this.handleCallbackData(data, userSession, query);

    } catch (error) {
      console.error('❌ Error handling callback query:', error);
    }
  }

  /**
   * Handle callback data
   */
  private async handleCallbackData(data: string, userSession: UserSession, query: any): Promise<void> {
    // This will be implemented by specific handlers
    this.emit('callback_query', { data, user: userSession, query });
  }

  /**
   * Generate AI response
   */
  private async generateAIResponse(text: string, userSession: UserSession): Promise<string> {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return '👋 Hello! How can I help you today?\n\nTry /menu for quick actions!';
    } else if (lowerText.includes('how are you')) {
      return '🤖 I\'m functioning perfectly! All systems operational.\n\nWhat can I do for you?';
    } else if (lowerText.includes('thank')) {
      return '😊 You\'re welcome! Happy to help!';
    } else if (lowerText.includes('help')) {
      return 'Type /help to see all available commands!\n\nOr use /menu for quick access.';
    } else if (lowerText.includes('menu')) {
      return '🎛️ Here\'s the interactive menu:';
    } else {
      return `You said: "${text}"\n\nTry /menu for quick actions or /help for all commands!`;
    }
  }

  /**
   * Get system metrics
   */
  private getSystemMetrics(): SystemMetrics {
    const memoryUsage = process.memoryUsage();
    
    return {
      uptime: process.uptime(),
      memoryUsage,
      cpuUsage: 0, // Would need additional monitoring
      diskUsage: {
        total: 0,
        used: 0,
        free: 0,
        percentage: 0
      },
      networkStats: {
        bytesReceived: 0,
        bytesSent: 0,
        packetsReceived: 0,
        packetsSent: 0
      }
    };
  }

  /**
   * Initialize core services
   */
  private async initializeServices(): Promise<void> {
    // Initialize rate limiting
    // Initialize analytics
    // Initialize security
    // Initialize AI services
    // Initialize MCP integration
    // Initialize Autopilot
    // Initialize Learning Loops
  }

  /**
   * Save analytics data
   */
  private async saveAnalytics(): Promise<void> {
    // Save to file or database
    console.log('💾 Saving analytics data...');
  }

  /**
   * Handle polling errors
   */
  private handlePollingError(error: any): void {
    console.error('❌ Polling error:', error);
    this.emit('polling_error', error);
  }

  /**
   * Handle user joined event
   */
  private handleUserJoined(user: UserSession): void {
    console.log(`👤 User joined: ${user.username || user.firstName} (${user.userId})`);
  }

  /**
   * Handle user left event
   */
  private handleUserLeft(user: UserSession): void {
    console.log(`👤 User left: ${user.username || user.firstName} (${user.userId})`);
  }

  /**
   * Handle command executed event
   */
  private handleCommandExecuted(data: any): void {
    console.log(`⚡ Command executed: ${data.command} by user ${data.user.userId}`);
  }

  /**
   * Get analytics data
   */
  getAnalytics(): AnalyticsData {
    return { ...this.analytics };
  }

  /**
   * Get bot instance
   */
  getBot(): TelegramBot {
    return this.bot;
  }

  /**
   * Check if bot is running
   */
  isBotRunning(): boolean {
    return this.isRunning;
  }
}
