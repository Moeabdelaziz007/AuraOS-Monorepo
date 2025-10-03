/**
 * Tests for Autopilot Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutopilotIntegration } from '../autopilot/AutopilotIntegration.js';
import { UserSession } from '../types/index.js';

describe('AutopilotIntegration', () => {
  let autopilot: AutopilotIntegration;
  let userSession: UserSession;

  beforeEach(() => {
    autopilot = new AutopilotIntegration();
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

  describe('Task Execution', () => {
    it('should execute system monitor task', async () => {
      const response = await autopilot.executeTask('system_monitor', userSession);
      expect(response.success).toBe(true);
      expect(response.message).toContain('successfully');
    });

    it('should execute user activity track task', async () => {
      const response = await autopilot.executeTask('user_activity_track', userSession);
      expect(response.success).toBe(true);
      expect(response.message).toContain('successfully');
    });

    it('should execute learning insights task', async () => {
      const response = await autopilot.executeTask('learning_insights', userSession);
      expect(response.success).toBe(true);
      expect(response.message).toContain('successfully');
    });

    it('should handle unknown task', async () => {
      const response = await autopilot.executeTask('unknown_task', userSession);
      expect(response.success).toBe(false);
      expect(response.error).toContain('not found');
    });
  });

  describe('Task Management', () => {
    it('should get all tasks', () => {
      const tasks = autopilot.getAllTasks();
      expect(tasks).toBeInstanceOf(Array);
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('should get task by ID', () => {
      const task = autopilot.getTask('system_monitor');
      expect(task).toBeDefined();
      expect(task?.id).toBe('system_monitor');
    });

    it('should return undefined for unknown task', () => {
      const task = autopilot.getTask('unknown_task');
      expect(task).toBeUndefined();
    });

    it('should get user tasks', () => {
      const userTasks = autopilot.getUserTasks(userSession.userId);
      expect(userTasks).toBeInstanceOf(Array);
    });
  });

  describe('User Task Creation', () => {
    it('should create user task', async () => {
      const taskData = {
        name: 'Test Task',
        description: 'A test task',
        trigger: {
          type: 'command' as const,
          pattern: '/test'
        },
        actions: [
          {
            type: 'command' as const,
            target: 'echo test',
            parameters: {}
          }
        ],
        conditions: []
      };

      const response = await autopilot.createUserTask(userSession, taskData);
      expect(response.success).toBe(true);
      expect(response.message).toContain('Created');
    });
  });

  describe('Task Status Management', () => {
    it('should update task status', () => {
      const result = autopilot.updateTaskStatus('system_monitor', 'inactive');
      expect(result).toBe(true);
    });

    it('should return false for unknown task', () => {
      const result = autopilot.updateTaskStatus('unknown_task', 'inactive');
      expect(result).toBe(false);
    });

    it('should delete task', () => {
      const result = autopilot.deleteTask('system_monitor');
      expect(result).toBe(true);
    });

    it('should return false for unknown task deletion', () => {
      const result = autopilot.deleteTask('unknown_task');
      expect(result).toBe(false);
    });
  });

  describe('Task History', () => {
    it('should get task history', () => {
      const history = autopilot.getTaskHistory('system_monitor');
      expect(history).toBeInstanceOf(Array);
    });

    it('should start with empty history', () => {
      const history = autopilot.getTaskHistory('system_monitor');
      expect(history).toHaveLength(0);
    });
  });

  describe('Autopilot Status', () => {
    it('should check if autopilot is active', () => {
      const isActive = autopilot.isAutopilotActive();
      expect(typeof isActive).toBe('boolean');
    });

    it('should get autopilot status', () => {
      const status = autopilot.getAutopilotStatus();
      expect(status).toHaveProperty('active');
      expect(status).toHaveProperty('tasksCount');
      expect(status).toHaveProperty('activeTasks');
      expect(status).toHaveProperty('totalExecutions');
    });
  });
});
