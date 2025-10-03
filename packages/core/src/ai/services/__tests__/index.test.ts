import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../index';

// Mock the AI services
vi.mock('../gemini.service', () => ({
  geminiService: {
    chat: vi.fn(),
    chatStream: vi.fn(),
    embed: vi.fn(),
  },
}));

vi.mock('../zai.service', () => ({
  zaiService: {
    chat: vi.fn(),
    chatStream: vi.fn(),
    embed: vi.fn(),
  },
}));

describe('AI Service - JSON.parse Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeMCPTool', () => {
    it('successfully parses valid JSON response', async () => {
      const { geminiService } = await import('../gemini.service');
      const mockChat = vi.mocked(geminiService.chat);
      
      const validResponse = {
        content: '{"result": "success", "data": {"value": 42}}',
        model: 'gemini-pro',
      };
      
      mockChat.mockResolvedValue(validResponse);

      const result = await aiService.executeMCPTool('test_tool', { param: 'value' });
      
      expect(result).toEqual({ result: 'success', data: { value: 42 } });
    });

    it('throws error with context when JSON parsing fails', async () => {
      const { geminiService } = await import('../gemini.service');
      const mockChat = vi.mocked(geminiService.chat);
      
      const invalidResponse = {
        content: 'This is not valid JSON',
        model: 'gemini-pro',
      };
      
      mockChat.mockResolvedValue(invalidResponse);

      await expect(
        aiService.executeMCPTool('test_tool', { param: 'value' })
      ).rejects.toThrow(/Failed to parse MCP tool response as JSON/);
    });

    it('includes response content in error message', async () => {
      const { geminiService } = await import('../gemini.service');
      const mockChat = vi.mocked(geminiService.chat);
      
      const invalidResponse = {
        content: 'Invalid JSON response with some context',
        model: 'gemini-pro',
      };
      
      mockChat.mockResolvedValue(invalidResponse);

      try {
        await aiService.executeMCPTool('test_tool', { param: 'value' });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Response content:');
        expect(error.message).toContain('Invalid JSON response');
      }
    });

    it('truncates long response content in error message', async () => {
      const { geminiService } = await import('../gemini.service');
      const mockChat = vi.mocked(geminiService.chat);
      
      const longContent = 'x'.repeat(500);
      const invalidResponse = {
        content: longContent,
        model: 'gemini-pro',
      };
      
      mockChat.mockResolvedValue(invalidResponse);

      try {
        await aiService.executeMCPTool('test_tool', { param: 'value' });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        // Should truncate to 200 characters
        const contentInError = error.message.split('Response content: ')[1];
        expect(contentInError.length).toBeLessThanOrEqual(204); // 200 + "..."
      }
    });

    it('handles nested JSON objects correctly', async () => {
      const { geminiService } = await import('../gemini.service');
      const mockChat = vi.mocked(geminiService.chat);
      
      const complexResponse = {
        content: JSON.stringify({
          result: 'success',
          data: {
            nested: {
              deep: {
                value: 'test',
                array: [1, 2, 3],
              },
            },
          },
        }),
        model: 'gemini-pro',
      };
      
      mockChat.mockResolvedValue(complexResponse);

      const result = await aiService.executeMCPTool('test_tool', { param: 'value' });
      
      expect(result.data.nested.deep.value).toBe('test');
      expect(result.data.nested.deep.array).toEqual([1, 2, 3]);
    });

    it('handles empty JSON object', async () => {
      const { geminiService } = await import('../gemini.service');
      const mockChat = vi.mocked(geminiService.chat);
      
      const emptyResponse = {
        content: '{}',
        model: 'gemini-pro',
      };
      
      mockChat.mockResolvedValue(emptyResponse);

      const result = await aiService.executeMCPTool('test_tool', { param: 'value' });
      
      expect(result).toEqual({});
    });

    it('handles JSON array response', async () => {
      const { geminiService } = await import('../gemini.service');
      const mockChat = vi.mocked(geminiService.chat);
      
      const arrayResponse = {
        content: '[1, 2, 3, "test"]',
        model: 'gemini-pro',
      };
      
      mockChat.mockResolvedValue(arrayResponse);

      const result = await aiService.executeMCPTool('test_tool', { param: 'value' });
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([1, 2, 3, 'test']);
    });

    it('system prompt requests valid JSON', async () => {
      const { geminiService } = await import('../gemini.service');
      const mockChat = vi.mocked(geminiService.chat);
      
      mockChat.mockResolvedValue({
        content: '{"result": "success"}',
        model: 'gemini-pro',
      });

      await aiService.executeMCPTool('test_tool', { param: 'value' });
      
      const callArgs = mockChat.mock.calls[0];
      const messages = callArgs[0];
      const systemMessage = messages.find(m => m.role === 'system');
      
      expect(systemMessage?.content).toContain('valid JSON');
    });
  });

  describe('enhanceNote', () => {
    it('successfully enhances note content', async () => {
      const { geminiService } = await import('../gemini.service');
      const mockChat = vi.mocked(geminiService.chat);
      
      mockChat.mockResolvedValue({
        content: 'Enhanced note content with improvements',
        model: 'gemini-pro',
      });

      const result = await aiService.enhanceNote(
        'Original note',
        'Make it more professional'
      );
      
      expect(result).toBe('Enhanced note content with improvements');
    });
  });

  describe('generateAutomation', () => {
    it('successfully generates automation script', async () => {
      const { zaiService } = await import('../zai.service');
      const mockChat = vi.mocked(zaiService.chat);
      
      mockChat.mockResolvedValue({
        content: 'Generated automation script',
        model: 'z-chat-v1',
      });

      const result = await aiService.generateAutomation('Create a backup script');
      
      expect(result).toBe('Generated automation script');
    });
  });
});
