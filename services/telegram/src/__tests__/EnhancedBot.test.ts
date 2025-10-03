/**
 * Tests for Enhanced Telegram Bot
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedBot } from '../EnhancedBot.js';
import { BotConfig } from '../types/index.js';

// Mock dependencies
vi.mock('../core/BotCore.js');
vi.mock('../ai/AIIntegration.js');
vi.mock('../mcp/MCPIntegration.js');
vi.mock('../autopilot/AutopilotIntegration.js');
vi.mock('../learning/LearningIntegration.js');
vi.mock('../security/SecurityManager.js');
vi.mock('../monitoring/MonitoringManager.js');

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
