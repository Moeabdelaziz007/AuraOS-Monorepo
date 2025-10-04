/**
 * Tests for MCP Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPIntegration } from '../mcp/MCPIntegration.js';
import { UserSession } from '../types/index.js';

describe('MCPIntegration', () => {
  let mcp: MCPIntegration;
  let userSession: UserSession;

  beforeEach(() => {
    mcp = new MCPIntegration();
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

  describe('Tool Execution', () => {
    it('should execute system info tool', async () => {
      const response = await mcp.executeTool('system_info', {}, userSession);
      expect(response.success).toBe(true);
      expect(response.message).toContain('successfully');
    });

    it('should execute system command tool', async () => {
      const response = await mcp.executeTool('system_command', { command: 'echo test' }, userSession);
      expect(response.success).toBe(true);
      expect(response.message).toContain('successfully');
    }, 20000);

    it('should execute AI analyze tool', async () => {
      const response = await mcp.executeTool('ai_analyze', { text: 'Hello world' }, userSession);
      expect(response.success).toBe(true);
      expect(response.message).toContain('successfully');
    });

    it('should execute AI generate tool', async () => {
      const response = await mcp.executeTool('ai_generate', { prompt: 'Generate content' }, userSession);
      expect(response.success).toBe(true);
      expect(response.message).toContain('successfully');
    });

    it('should handle unknown tool', async () => {
      const response = await mcp.executeTool('unknown_tool', {}, userSession);
      expect(response.success).toBe(false);
      expect(response.error).toContain('not found');
    });
  });

  describe('Tool Management', () => {
    it('should get available tools', () => {
      const tools = mcp.getAvailableTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should get tool by name', () => {
      const tool = mcp.getTool('system_info');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('system_info');
    });

    it('should return undefined for unknown tool', () => {
      const tool = mcp.getTool('unknown_tool');
      expect(tool).toBeUndefined();
    });
  });

  describe('Tool History', () => {
    it('should get tool history for user', () => {
      const history = mcp.getToolHistory(userSession.userId);
      expect(history).toBeInstanceOf(Array);
    });

    it('should start with empty history', () => {
      const history = mcp.getToolHistory(userSession.userId);
      expect(history).toHaveLength(0);
    });
  });

  describe('MCP Status', () => {
    it('should check if MCP is connected', () => {
      const isConnected = mcp.isMCPConnected();
      expect(typeof isConnected).toBe('boolean');
    });

    it('should get MCP status', () => {
      const status = mcp.getMCPStatus();
      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('toolsCount');
      expect(status).toHaveProperty('totalExecutions');
    });
  });
});
