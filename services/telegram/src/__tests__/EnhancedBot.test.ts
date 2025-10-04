/**
 * Tests for Enhanced Telegram Bot
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedBot } from '../EnhancedBot.js';
import { BotConfig } from '../types/index.js';

// Mock dependencies
vi.mock('../core/BotCore.js', () => ({
  BotCore: vi.fn().mockImplementation(() => ({
    getBot: vi.fn().mockReturnValue({
      onText: vi.fn(),
      sendMessage: vi.fn(),
      on: vi.fn(),
      getMe: vi.fn().mockResolvedValue({ id: 123456789, username: 'testbot' })
    }),
    start: vi.fn(),
    stop: vi.fn(),
    getAnalytics: vi.fn().mockReturnValue({
      totalMessages: 0,
      totalCommands: 0,
      activeUsers: 0,
      commandUsage: new Map(),
      userActivity: new Map(),
      systemMetrics: {},
      startTime: new Date()
    }),
    getSystemMetrics: vi.fn().mockReturnValue({
      uptime: 0,
      memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0 },
      cpuUsage: 0,
      activeConnections: 0
    }),
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    isBotRunning: vi.fn().mockReturnValue(true)
  }))
}));

vi.mock('../ai/AIIntegration.js', () => ({
  AIIntegration: vi.fn().mockImplementation(() => ({
    processMessage: vi.fn().mockResolvedValue({ success: true, message: 'AI response' }),
    getInsights: vi.fn().mockReturnValue([]),
    isActive: vi.fn().mockReturnValue(true),
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    getUserInsights: vi.fn().mockReturnValue([])
  }))
}));

vi.mock('../mcp/MCPIntegration.js', () => ({
  MCPIntegration: vi.fn().mockImplementation(() => ({
    executeTool: vi.fn().mockResolvedValue({ success: true, message: 'Tool executed' }),
    getAvailableTools: vi.fn().mockReturnValue([]),
    isMCPConnected: vi.fn().mockReturnValue(true),
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn()
  }))
}));

vi.mock('../autopilot/AutopilotIntegration.js', () => ({
  AutopilotIntegration: vi.fn().mockImplementation(() => ({
    executeTask: vi.fn().mockResolvedValue({ success: true, message: 'Task executed' }),
    getAllTasks: vi.fn().mockReturnValue([]),
    isAutopilotActive: vi.fn().mockReturnValue(true),
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn()
  }))
}));

vi.mock('../learning/LearningIntegration.js', () => ({
  LearningIntegration: vi.fn().mockImplementation(() => ({
    learnFromInteraction: vi.fn(),
    getUserInsights: vi.fn().mockReturnValue([]),
    isLearningActive: vi.fn().mockReturnValue(true),
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    getUserInsights: vi.fn().mockReturnValue([])
  }))
}));

vi.mock('../security/SecurityManager.js', () => ({
  SecurityManager: vi.fn().mockImplementation(() => ({
    checkAccess: vi.fn().mockReturnValue(true),
    logSecurityEvent: vi.fn(),
    isSecurityActive: vi.fn().mockReturnValue(true),
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    getUserSecurityInfo: vi.fn().mockReturnValue({})
  }))
}));

vi.mock('../monitoring/MonitoringManager.js', () => ({
  MonitoringManager: vi.fn().mockImplementation(() => ({
    trackEvent: vi.fn(),
    getMetrics: vi.fn().mockReturnValue({}),
    isMonitoringActive: vi.fn().mockReturnValue(true),
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    getAnalytics: vi.fn().mockReturnValue({}),
    getDashboardData: vi.fn().mockReturnValue({
      system: { status: 'active', uptime: 1000 },
      analytics: { totalUsers: 10, messages: 100 },
      performance: { cpu: 50, memory: 60 },
      users: { active: 5, total: 10 }
    }),
    getPerformanceMetrics: vi.fn().mockReturnValue({}),
    getUserActivity: vi.fn().mockReturnValue({})
  }))
}));

describe('EnhancedBot', () => {
  let bot: EnhancedBot;
  let config: BotConfig;

  beforeEach(() => {
    config = {
      token: 'test-token',
      adminChatId: 123456789,
      adminUserIds: [123456789],
      rateLimit: {
        windowMs: 60000,
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

    bot = new EnhancedBot(config);
  });

  describe('Initialization', () => {
    it('should initialize with config', () => {
      expect(bot).toBeDefined();
      expect(bot.getBotStatus()).toBeDefined();
    });

    it('should have all integrations', () => {
      expect(bot.getCore()).toBeDefined();
      expect(bot.getAI()).toBeDefined();
      expect(bot.getMCP()).toBeDefined();
      expect(bot.getAutopilot()).toBeDefined();
      expect(bot.getLearning()).toBeDefined();
      expect(bot.getSecurity()).toBeDefined();
      expect(bot.getMonitoring()).toBeDefined();
    });
  });

  describe('Bot Status', () => {
    it('should return bot status', () => {
      const status = bot.getBotStatus();
      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('core');
      expect(status).toHaveProperty('ai');
      expect(status).toHaveProperty('mcp');
      expect(status).toHaveProperty('autopilot');
      expect(status).toHaveProperty('learning');
      expect(status).toHaveProperty('security');
      expect(status).toHaveProperty('monitoring');
    });
  });

  describe('Analytics', () => {
    it('should return analytics data', () => {
      const analytics = bot.getAnalytics();
      expect(analytics).toHaveProperty('core');
      expect(analytics).toHaveProperty('monitoring');
      expect(analytics).toHaveProperty('system');
      expect(analytics).toHaveProperty('performance');
    });
  });

  describe('Dashboard', () => {
    it('should return dashboard data', () => {
      const dashboard = bot.getDashboard();
      expect(dashboard).toHaveProperty('system');
      expect(dashboard).toHaveProperty('analytics');
      expect(dashboard).toHaveProperty('performance');
      expect(dashboard).toHaveProperty('users');
    });
  });

  describe('User Insights', () => {
    it('should return user insights', () => {
      const userId = 123456789;
      const insights = bot.getUserInsights(userId);
      expect(insights).toHaveProperty('ai');
      expect(insights).toHaveProperty('learning');
      expect(insights).toHaveProperty('security');
      expect(insights).toHaveProperty('activity');
    });
  });
});
