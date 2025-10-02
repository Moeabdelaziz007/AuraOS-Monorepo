/**
 * AI Assistant Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AIAssistant } from '../assistant';
import { MCPGateway } from '../mcp/gateway';
import { BaseMCPServer } from '../mcp/server';
import { Tool } from '../mcp/types';

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn(),
      };
    },
  };
});

// Test MCP Server
class TestMCPServer extends BaseMCPServer {
  name = 'test-server';
  version = '1.0.0';

  tools: Tool[] = [
    {
      name: 'get_data',
      description: 'Get test data',
      inputSchema: {
        type: 'object',
        properties: {
          key: { type: 'string' },
        },
        required: ['key'],
      },
    },
    {
      name: 'set_data',
      description: 'Set test data',
      inputSchema: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          value: { type: 'string' },
        },
        required: ['key', 'value'],
      },
    },
  ];

  private data: Map<string, string> = new Map();

  protected async handleToolExecution(toolName: string, input: Record<string, any>): Promise<any> {
    switch (toolName) {
      case 'get_data':
        return { value: this.data.get(input.key) || null };
      case 'set_data':
        this.data.set(input.key, input.value);
        return { success: true };
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

describe('AIAssistant', () => {
  let gateway: MCPGateway;
  let assistant: AIAssistant;
  let testServer: TestMCPServer;

  beforeEach(async () => {
    gateway = new MCPGateway({
      maxServers: 10,
      requestTimeout: 5000,
      enableLogging: false,
    });

    testServer = new TestMCPServer();
    await gateway.registerServer(testServer);

    assistant = new AIAssistant(gateway, 'test-api-key');
  });

  afterEach(async () => {
    await gateway.shutdown();
  });

  describe('Initialization', () => {
    it('should create assistant with gateway', () => {
      expect(assistant).toBeDefined();
    });

    it('should get available tools from gateway', () => {
      const tools = assistant.getAvailableTools();
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some((t) => t.name === 'get_data')).toBe(true);
    });

    it('should access gateway statistics', () => {
      const stats = assistant.getStats();
      expect(stats).toBeDefined();
      expect(stats.totalRequests).toBe(0);
    });
  });

  describe('Conversation Management', () => {
    it('should maintain conversation history', async () => {
      // Mock Claude response
      const mockClaude = assistant['claude'] as any;
      mockClaude.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'Hello!' }],
        stop_reason: 'end_turn',
      });

      await assistant.chat('Hello');

      const history = assistant.getHistory();
      expect(history.length).toBe(2); // User message + assistant response
      expect(history[0].role).toBe('user');
      expect(history[1].role).toBe('assistant');
    });

    it('should clear conversation history', async () => {
      const mockClaude = assistant['claude'] as any;
      mockClaude.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'Hello!' }],
        stop_reason: 'end_turn',
      });

      await assistant.chat('Hello');
      expect(assistant.getHistory().length).toBeGreaterThan(0);

      assistant.clearHistory();
      expect(assistant.getHistory().length).toBe(0);
    });

    it('should allow custom system prompt', () => {
      const customPrompt = 'You are a custom assistant';
      assistant.setSystemPrompt(customPrompt);
      expect(assistant['systemPrompt']).toBe(customPrompt);
    });
  });

  describe('Tool Execution', () => {
    it('should handle simple text response', async () => {
      const mockClaude = assistant['claude'] as any;
      mockClaude.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'This is a simple response' }],
        stop_reason: 'end_turn',
      });

      const response = await assistant.chat('Hello');
      expect(response).toBe('This is a simple response');
    });

    it('should execute tool when requested by AI', async () => {
      const mockClaude = assistant['claude'] as any;

      // First call: AI requests tool use
      mockClaude.messages.create.mockResolvedValueOnce({
        content: [
          { type: 'text', text: 'Let me get that data for you.' },
          {
            type: 'tool_use',
            id: 'tool_1',
            name: 'get_data',
            input: { key: 'test-key' },
          },
        ],
        stop_reason: 'tool_use',
      });

      // Second call: AI responds with final answer
      mockClaude.messages.create.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'The data is: null' }],
        stop_reason: 'end_turn',
      });

      const response = await assistant.chat('Get the data for test-key');
      expect(response).toContain('null');
    });

    it('should handle multiple tool calls', async () => {
      const mockClaude = assistant['claude'] as any;

      // First call: AI requests multiple tools
      mockClaude.messages.create.mockResolvedValueOnce({
        content: [
          { type: 'text', text: 'Setting and getting data.' },
          {
            type: 'tool_use',
            id: 'tool_1',
            name: 'set_data',
            input: { key: 'test', value: 'hello' },
          },
          {
            type: 'tool_use',
            id: 'tool_2',
            name: 'get_data',
            input: { key: 'test' },
          },
        ],
        stop_reason: 'tool_use',
      });

      // Second call: AI responds with final answer
      mockClaude.messages.create.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Data set and retrieved successfully' }],
        stop_reason: 'end_turn',
      });

      const response = await assistant.chat('Set test to hello and get it back');
      expect(response).toContain('successfully');
    });

    it('should handle tool execution errors', async () => {
      const mockClaude = assistant['claude'] as any;

      // First call: AI requests invalid tool
      mockClaude.messages.create.mockResolvedValueOnce({
        content: [
          {
            type: 'tool_use',
            id: 'tool_1',
            name: 'invalid_tool',
            input: {},
          },
        ],
        stop_reason: 'tool_use',
      });

      // Second call: AI handles error
      mockClaude.messages.create.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Sorry, that tool is not available' }],
        stop_reason: 'end_turn',
      });

      const response = await assistant.chat('Use invalid tool');
      expect(response).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockClaude = assistant['claude'] as any;
      mockClaude.messages.create.mockRejectedValue(new Error('API Error'));

      await expect(assistant.chat('Hello')).rejects.toThrow('AI Assistant error');
    });

    it('should handle max tokens stop reason', async () => {
      const mockClaude = assistant['claude'] as any;
      mockClaude.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'This is a long response...' }],
        stop_reason: 'max_tokens',
      });

      const response = await assistant.chat('Tell me a long story');
      expect(response).toContain('truncated');
    });
  });

  describe('Tool Format Conversion', () => {
    it('should convert MCP tools to Anthropic format', () => {
      const tools = assistant.getAvailableTools();
      const converted = assistant['convertToolsToAnthropicFormat'](tools);

      expect(converted).toBeDefined();
      expect(converted.length).toBe(tools.length);
      expect(converted[0]).toHaveProperty('name');
      expect(converted[0]).toHaveProperty('description');
      expect(converted[0]).toHaveProperty('input_schema');
    });
  });

  describe('Response Extraction', () => {
    it('should extract text from response content', () => {
      const content = [
        { type: 'text', text: 'First part' },
        { type: 'text', text: 'Second part' },
      ];

      const extracted = assistant['extractTextFromResponse'](content);
      expect(extracted).toBe('First part\nSecond part');
    });

    it('should ignore non-text blocks', () => {
      const content = [
        { type: 'text', text: 'Text content' },
        { type: 'tool_use', name: 'some_tool' },
      ];

      const extracted = assistant['extractTextFromResponse'](content);
      expect(extracted).toBe('Text content');
    });
  });

  describe('Chat Options', () => {
    it('should accept custom max tokens', async () => {
      const mockClaude = assistant['claude'] as any;
      mockClaude.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'Response' }],
        stop_reason: 'end_turn',
      });

      await assistant.chat('Hello', { maxTokens: 1000 });

      expect(mockClaude.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 1000,
        })
      );
    });

    it('should accept custom temperature', async () => {
      const mockClaude = assistant['claude'] as any;
      mockClaude.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'Response' }],
        stop_reason: 'end_turn',
      });

      await assistant.chat('Hello', { temperature: 0.5 });

      expect(mockClaude.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.5,
        })
      );
    });

    it('should accept custom system prompt per message', async () => {
      const mockClaude = assistant['claude'] as any;
      mockClaude.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'Response' }],
        stop_reason: 'end_turn',
      });

      const customPrompt = 'Custom prompt for this message';
      await assistant.chat('Hello', { systemPrompt: customPrompt });

      expect(mockClaude.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          system: customPrompt,
        })
      );
    });
  });
});
