/**
 * Tests for Learning Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LearningIntegration } from '../learning/LearningIntegration.js';
import { UserSession } from '../types/index.js';

describe('LearningIntegration', () => {
  let learning: LearningIntegration;
  let userSession: UserSession;

  beforeEach(() => {
    learning = new LearningIntegration();
    userSession = {
      userId: 123456789,
      chatId: 123456789,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      isAdmin: false,
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
  });

  describe('Learning from Interactions', () => {
    it('should learn from user interaction', async () => {
      await learning.learnFromInteraction(userSession, 'Hello world', 'Hi there!', true);
      
      const learningData = learning.getLearningData(userSession.userId);
      expect(learningData.commandPatterns.size).toBeGreaterThan(0);
    });

    it('should track command patterns', async () => {
      await learning.learnFromInteraction(userSession, 'status help ping', 'Here are the commands', true);
      
      const learningData = learning.getLearningData(userSession.userId);
      expect(learningData.commandPatterns.has('status')).toBe(true);
      expect(learningData.commandPatterns.has('help')).toBe(true);
      expect(learningData.commandPatterns.has('ping')).toBe(true);
    });

    it('should track user preferences', async () => {
      await learning.learnFromInteraction(userSession, 'I prefer dark theme', 'Theme set to dark', true);
      
      const learningData = learning.getLearningData(userSession.userId);
      expect(learningData.userPreferences.get('theme')).toBe('dark');
    });

    it('should track task execution', async () => {
      await learning.learnFromInteraction(userSession, 'execute command', 'Command executed', true);
      
      const learningData = learning.getLearningData(userSession.userId);
      expect(learningData.taskHistory.length).toBeGreaterThan(0);
    });
  });

  describe('Insights Generation', () => {
    it('should generate insights after learning', async () => {
      await learning.learnFromInteraction(userSession, 'status help ping', 'Commands executed', true);
      
      const insights = learning.getUserInsights(userSession.userId);
      expect(insights).toBeInstanceOf(Array);
    });

    it('should generate pattern insights', async () => {
      // Simulate multiple interactions
      for (let i = 0; i < 5; i++) {
        await learning.learnFromInteraction(userSession, 'status help ping', 'Commands executed', true);
      }
      
      const insights = learning.getUserInsights(userSession.userId);
      expect(insights.length).toBeGreaterThan(0);
    });
  });

  describe('Feedback Management', () => {
    it('should add user feedback', async () => {
      await learning.addFeedback(userSession.userId, 'task_123', 5, 'Great job!');
      
      const learningData = learning.getLearningData(userSession.userId);
      expect(learningData.feedback.length).toBeGreaterThan(0);
      expect(learningData.feedback[0].rating).toBe(5);
      expect(learningData.feedback[0].comment).toBe('Great job!');
    });

    it('should limit feedback history', async () => {
      // Add more than 50 feedback entries
      for (let i = 0; i < 60; i++) {
        await learning.addFeedback(userSession.userId, `task_${i}`, 5, `Feedback ${i}`);
      }
      
      const learningData = learning.getLearningData(userSession.userId);
      expect(learningData.feedback.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Learning Data Management', () => {
    it('should get learning data for user', () => {
      const learningData = learning.getLearningData(userSession.userId);
      expect(learningData).toBeDefined();
      expect(learningData.commandPatterns).toBeInstanceOf(Map);
      expect(learningData.userPreferences).toBeInstanceOf(Map);
      expect(learningData.taskHistory).toBeInstanceOf(Array);
      expect(learningData.feedback).toBeInstanceOf(Array);
    });

    it('should get user insights', () => {
      const insights = learning.getUserInsights(userSession.userId);
      expect(insights).toBeInstanceOf(Array);
    });

    it('should get global patterns', () => {
      const patterns = learning.getGlobalPatterns();
      expect(patterns).toBeInstanceOf(Map);
    });
  });

  describe('Recommendations', () => {
    it('should get learning recommendations', () => {
      const recommendations = learning.getLearningRecommendations(userSession.userId);
      expect(recommendations).toBeInstanceOf(Array);
    });

    it('should generate recommendations based on patterns', async () => {
      // Simulate learning
      await learning.learnFromInteraction(userSession, 'status help ping', 'Commands executed', true);
      
      const recommendations = learning.getLearningRecommendations(userSession.userId);
      expect(recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Data Export and Management', () => {
    it('should export learning data', () => {
      const exportedData = learning.exportLearningData(userSession.userId);
      expect(exportedData).toHaveProperty('learningData');
      expect(exportedData).toHaveProperty('insights');
      expect(exportedData).toHaveProperty('recommendations');
      expect(exportedData).toHaveProperty('globalPatterns');
    });

    it('should clear learning data', () => {
      learning.clearLearningData(userSession.userId);
      
      const learningData = learning.getLearningData(userSession.userId);
      expect(learningData.commandPatterns.size).toBe(0);
      expect(learningData.userPreferences.size).toBe(0);
      expect(learningData.taskHistory).toHaveLength(0);
      expect(learningData.feedback).toHaveLength(0);
    });
  });

  describe('Learning Status', () => {
    it('should check if learning is active', () => {
      const isActive = learning.isLearningActive();
      expect(typeof isActive).toBe('boolean');
    });

    it('should get learning status', () => {
      const status = learning.getLearningStatus();
      expect(status).toHaveProperty('active');
      expect(status).toHaveProperty('usersCount');
      expect(status).toHaveProperty('totalInsights');
      expect(status).toHaveProperty('globalPatternsCount');
    });
  });
});
