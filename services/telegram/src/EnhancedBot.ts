/**
 * Enhanced Telegram Bot with all integrations
 */

import { BotCore } from './core/BotCore.js';
import { AIIntegration } from './ai/AIIntegration.js';
import { MCPIntegration } from './mcp/MCPIntegration.js';
import { AutopilotIntegration } from './autopilot/AutopilotIntegration.js';
import { LearningIntegration } from './learning/LearningIntegration.js';
import { SecurityManager } from './security/SecurityManager.js';
import { MonitoringManager } from './monitoring/MonitoringManager.js';
import { CommandHandlers } from './commands/CommandHandlers.js';
import { 
  BotConfig, 
  UserSession, 
  BotResponse,
  CommandHandler 
} from './types/index.js';

export class EnhancedBot {
  private core: BotCore;
  private ai: AIIntegration;
  private mcp: MCPIntegration;
  private autopilot: AutopilotIntegration;
  private learning: LearningIntegration;
  private security: SecurityManager;
  private monitoring: MonitoringManager;
  private isInitialized: boolean = false;

  constructor(config: BotConfig) {
    this.core = new BotCore(config);
    this.ai = new AIIntegration();
    this.mcp = new MCPIntegration();
    this.autopilot = new AutopilotIntegration();
    this.learning = new LearningIntegration();
    this.security = new SecurityManager(config);
    this.monitoring = new MonitoringManager();
    
    this.setupIntegrations();
  }

  /**
   * Setup all integrations
   */
  private setupIntegrations(): void {
    // Setup AI integration
    this.ai.on('insight_generated', (data) => {
      logger.info(`💡 AI Insight generated for user ${data.userId}`);
    });

    // Setup MCP integration
    this.mcp.on('tool_executed', (data) => {
      logger.info(`🔧 MCP Tool executed: ${data.tool}`);
    });

    // Setup Autopilot integration
    this.autopilot.on('task_executed', (data) => {
      logger.info(`🤖 Autopilot task executed: ${data.taskId}`);
    });

    // Setup Learning integration
    this.learning.on('insights_generated', (data) => {
      logger.info(`📚 Learning insights generated for user ${data.userId}`);
    });

    // Setup Security integration
    this.security.on('suspicious_activity', (data) => {
      logger.info(`🚨 Suspicious activity detected: ${data.activity}`);
    });

    // Setup Monitoring integration
    this.monitoring.on('system_metrics_updated', (data) => {
      logger.info(`📊 System metrics updated`);
    });

    // Setup Core integration
    this.core.on('user_joined', (user) => {
      logger.info(`👤 User joined: ${user.username || user.firstName}`);
    });

    this.core.on('command_executed', (data) => {
      logger.info(`⚡ Command executed: ${data.command}`);
    });
  }

  /**
   * Initialize the enhanced bot
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing Enhanced AuraOS Telegram Bot...');
      
      // Register command handlers
      this.registerCommandHandlers();
      
      // Initialize core bot
      await this.core.start();
      
      this.isInitialized = true;
      logger.info('✅ Enhanced AuraOS Telegram Bot initialized successfully!');
      
    } catch (error) {
      logger.error('❌ Enhanced bot initialization failed:', error);
      throw error;
    }
  }

  /**
   * Register all command handlers
   */
  private registerCommandHandlers(): void {
    // Basic commands
    this.core.registerCommand({
      command: '/start',
      description: 'Initialize bot and show welcome message',
      handler: CommandHandlers.handleStart
    });

    this.core.registerCommand({
      command: '/help',
      description: 'Show help message with all commands',
      handler: CommandHandlers.handleHelp
    });

    this.core.registerCommand({
      command: '/menu',
      description: 'Show interactive menu',
      handler: CommandHandlers.handleMenu
    });

    this.core.registerCommand({
      command: '/status',
      description: 'Show system status',
      handler: CommandHandlers.handleStatus
    });

    this.core.registerCommand({
      command: '/info',
      description: 'Show bot information',
      handler: CommandHandlers.handleInfo
    });

    this.core.registerCommand({
      command: '/ping',
      description: 'Test bot responsiveness',
      handler: CommandHandlers.handlePing
    });

    // AI commands
    this.core.registerCommand({
      command: '/ai',
      description: 'AI assistance and chat',
      handler: CommandHandlers.handleAI
    });

    // MCP commands
    this.core.registerCommand({
      command: '/mcp',
      description: 'MCP tools and operations',
      handler: CommandHandlers.handleMCP
    });

    // Autopilot commands
    this.core.registerCommand({
      command: '/autopilot',
      description: 'Autopilot system management',
      handler: CommandHandlers.handleAutopilot
    });

    // Learning commands
    this.core.registerCommand({
      command: '/learning',
      description: 'Learning system and insights',
      handler: CommandHandlers.handleLearning
    });

    logger.info('📝 Command handlers registered');
  }

  /**
   * Process user message with all integrations
   */
  async processMessage(userSession: UserSession, message: string): Promise<BotResponse> {
    try {
      // Security check
      if (!this.security.isUserAuthorized(userSession.userId)) {
        return {
          success: false,
          error: 'User not authorized',
          message: '❌ Access denied. You are not authorized to use this bot.'
        };
      }

      // Rate limiting check
      if (!this.security.checkRateLimit(userSession.userId)) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          message: '⚠️ Rate limit exceeded. Please wait a moment before trying again.'
        };
      }

      // Monitor activity
      this.monitoring.trackUserActivity(userSession, 'message');
      this.security.monitorActivity(userSession.userId, message);

      // Process with AI
      const aiResponse = await this.ai.processMessage(userSession, message);
      
      // Learn from interaction
      await this.learning.learnFromInteraction(
        userSession, 
        message, 
        aiResponse.message || '', 
        aiResponse.success
      );

      return aiResponse;

    } catch (error) {
      logger.error('❌ Message processing error:', error);
      return {
        success: false,
        error: 'Message processing failed',
        message: '❌ Sorry, I encountered an error processing your message.'
      };
    }
  }

  /**
   * Execute MCP tool
   */
  async executeMCPTool(toolName: string, parameters: Record<string, any>, userSession: UserSession): Promise<BotResponse> {
    try {
      // Security check
      if (!this.security.isUserAuthorized(userSession.userId)) {
        return {
          success: false,
          error: 'User not authorized',
          message: '❌ Access denied.'
        };
      }

      // Execute MCP tool
      const result = await this.mcp.executeTool(toolName, parameters, userSession);
      
      // Monitor activity
      this.monitoring.trackUserActivity(userSession, 'mcp_tool', { tool: toolName });
      
      return result;

    } catch (error) {
      logger.error('❌ MCP tool execution error:', error);
      return {
        success: false,
        error: 'MCP tool execution failed',
        message: '❌ Failed to execute MCP tool.'
      };
    }
  }

  /**
   * Execute autopilot task
   */
  async executeAutopilotTask(taskId: string, userSession: UserSession): Promise<BotResponse> {
    try {
      // Security check
      if (!this.security.isUserAuthorized(userSession.userId)) {
        return {
          success: false,
          error: 'User not authorized',
          message: '❌ Access denied.'
        };
      }

      // Execute autopilot task
      const result = await this.autopilot.executeTask(taskId, userSession);
      
      // Monitor activity
      this.monitoring.trackUserActivity(userSession, 'autopilot_task', { taskId });
      
      return result;

    } catch (error) {
      logger.error('❌ Autopilot task execution error:', error);
      return {
        success: false,
        error: 'Autopilot task execution failed',
        message: '❌ Failed to execute autopilot task.'
      };
    }
  }

  /**
   * Get bot status
   */
  getBotStatus(): any {
    return {
      initialized: this.isInitialized,
      core: this.core.isBotRunning(),
      ai: this.ai.isLearningActive(),
      mcp: this.mcp.isMCPConnected(),
      autopilot: this.autopilot.isAutopilotActive(),
      learning: this.learning.isLearningActive(),
      security: this.security.isSecurityActive(),
      monitoring: this.monitoring.isMonitoringActive()
    };
  }

  /**
   * Get analytics data
   */
  getAnalytics(): any {
    return {
      core: this.core.getAnalytics(),
      monitoring: this.monitoring.getAnalytics(),
      system: this.monitoring.getSystemMetrics(),
      performance: this.monitoring.getPerformanceMetrics()
    };
  }

  /**
   * Get monitoring dashboard
   */
  getDashboard(): any {
    return this.monitoring.getDashboardData();
  }

  /**
   * Get user insights
   */
  getUserInsights(userId: number): any {
    return {
      ai: this.ai.getUserInsights(userId),
      learning: this.learning.getUserInsights(userId),
      security: this.security.getUserSecurityInfo(userId),
      activity: this.monitoring.getUserActivity(userId)
    };
  }

  /**
   * Stop the enhanced bot
   */
  async stop(): Promise<void> {
    try {
      logger.info('🛑 Stopping Enhanced AuraOS Telegram Bot...');
      
      await this.core.stop();
      
      this.isInitialized = false;
      logger.info('✅ Enhanced AuraOS Telegram Bot stopped successfully!');
      
    } catch (error) {
      logger.error('❌ Enhanced bot stop failed:', error);
      throw error;
    }
  }

  /**
   * Get bot instance
   */
  getBot(): any {
    return this.core.getBot();
  }

  /**
   * Get core instance
   */
  getCore(): BotCore {
    return this.core;
  }

  /**
   * Get AI instance
   */
  getAI(): AIIntegration {
    return this.ai;
  }

  /**
   * Get MCP instance
   */
  getMCP(): MCPIntegration {
    return this.mcp;
  }

  /**
   * Get Autopilot instance
   */
  getAutopilot(): AutopilotIntegration {
    return this.autopilot;
  }

  /**
   * Get Learning instance
   */
  getLearning(): LearningIntegration {
    return this.learning;
  }

  /**
   * Get Security instance
   */
  getSecurity(): SecurityManager {
    return this.security;
  }

  /**
   * Get Monitoring instance
   */
  getMonitoring(): MonitoringManager {
    return this.monitoring;
  }
}
