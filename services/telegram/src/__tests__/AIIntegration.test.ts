/**
 * Tests for AI Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIIntegration } from '../ai/AIIntegration.js';
import { UserSession } from '../types/index.js';

describe('AIIntegration', () => {
  let ai: AIIntegration;
  let userSession: UserSession;

  beforeEach(() => {
    ai = new AIIntegration();
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

  describe('Message Processing', () => {
    it('should process greeting message', async () => {
      const response = await ai.processMessage(userSession, 'Hello');
      expect(response.success).toBe(true);
      expect(response.message).toContain('Hello');
    });

    it('should process help request', async () => {
      const response = await ai.processMessage(userSession, 'Help me');
      expect(response.success).toBe(true);
      expect(response.message).toContain('help');
    });

    it('should process system info request', async () => {
      const response = await ai.processMessage(userSession, 'What is the system status?');
      expect(response.success).toBe(true);
      expect(response.message).toContain('System');
    });

    it('should process general conversation', async () => {
      const response = await ai.processMessage(userSession, 'How are you today?');
      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
    });
  });

  describe('Learning Data', () => {
    it('should get learning data for user', () => {
      const learningData = ai.getLearningData(userSession.userId);
      expect(learningData).toBeDefined();
      expect(learningData.commandPatterns).toBeInstanceOf(Map);
      expect(learningData.userPreferences).toBeInstanceOf(Map);
      expect(learningData.taskHistory).toBeInstanceOf(Array);
      expect(learningData.feedback).toBeInstanceOf(Array);
    });

    it('should get user insights', () => {
      const insights = ai.getUserInsights(userSession.userId);
      expect(insights).toBeInstanceOf(Array);
    });

    it('should get conversation history', () => {
      const history = ai.getConversationHistory(userSession.userId);
      expect(history).toBeInstanceOf(Array);
    });
  });

  describe('Data Management', () => {
    it('should clear conversation history', () => {
      ai.clearConversationHistory(userSession.userId);
      const history = ai.getConversationHistory(userSession.userId);
      expect(history).toHaveLength(0);
    });

    it('should clear learning data', () => {
      ai.clearLearningData(userSession.userId);
      const learningData = ai.getLearningData(userSession.userId);
      expect(learningData.commandPatterns.size).toBe(0);
      expect(learningData.userPreferences.size).toBe(0);
      expect(learningData.taskHistory).toHaveLength(0);
      expect(learningData.feedback).toHaveLength(0);
    });

    it('should export learning data', () => {
      const exportedData = ai.exportLearningData(userSession.userId);
      expect(exportedData).toHaveProperty('conversationHistory');
      expect(exportedData).toHaveProperty('learningData');
      expect(exportedData).toHaveProperty('insights');
    });
  });
});
