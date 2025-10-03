import { renderHook, act, waitFor } from '@testing-library/react';
import { useAI } from '../useAI';
import { aiService } from '@auraos/core/ai/services';
import { useLearningLoop } from '../useLearningLoop';

// Mock dependencies
jest.mock('@auraos/core/ai/services');
jest.mock('../useLearningLoop');

describe('useAI', () => {
  const mockTrackAIInteraction = jest.fn();
  const mockAIResponse = {
    content: 'AI response content',
    model: 'gpt-4',
    usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLearningLoop as jest.Mock).mockReturnValue({
      trackAIInteraction: mockTrackAIInteraction,
    });
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAI());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.chat).toBeDefined();
      expect(result.current.chatStream).toBeDefined();
      expect(result.current.enhanceNote).toBeDefined();
      expect(result.current.generateAutomation).toBeDefined();
      expect(result.current.getAutopilotSuggestion).toBeDefined();
    });
  });

  describe('chat', () => {
    it('should send chat message successfully', async () => {
      (aiService.chat as jest.Mock).mockResolvedValue(mockAIResponse);

      const { result } = renderHook(() => useAI());

      let response;
      await act(async () => {
        response = await result.current.chat([
          { role: 'user', content: 'Hello AI' },
        ]);
      });

      expect(response).toEqual(mockAIResponse);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(aiService.chat).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Hello AI' }],
        undefined
      );
    });

    it('should track AI interaction after successful chat', async () => {
      (aiService.chat as jest.Mock).mockResolvedValue(mockAIResponse);

      const { result } = renderHook(() => useAI());

      await act(async () => {
        await result.current.chat([
          { role: 'user', content: 'Test message' },
        ]);
      });

      await waitFor(() => {
        expect(mockTrackAIInteraction).toHaveBeenCalledWith(
          'Test message',
          'AI response content',
          'gpt-4',
          expect.any(Number)
        );
      });
    });

    it('should handle chat with options', async () => {
      (aiService.chat as jest.Mock).mockResolvedValue(mockAIResponse);

      const { result } = renderHook(() => useAI());

      const options = {
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: 'You are a helpful assistant',
      };

      await act(async () => {
        await result.current.chat(
          [{ role: 'user', content: 'Hello' }],
          options
        );
      });

      expect(aiService.chat).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Hello' }],
        options
      );
    });

    it('should handle chat errors', async () => {
      const error = new Error('AI service unavailable');
      (aiService.chat as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAI());

      let response;
      await act(async () => {
        response = await result.current.chat([
          { role: 'user', content: 'Hello' },
        ]);
      });

      expect(response).toBeNull();
      expect(result.current.error).toBe('AI service unavailable');
      expect(result.current.loading).toBe(false);
    });

    it('should set loading state during chat', async () => {
      let resolveChat: any;
      const chatPromise = new Promise((resolve) => {
        resolveChat = resolve;
      });
      (aiService.chat as jest.Mock).mockReturnValue(chatPromise);

      const { result } = renderHook(() => useAI());

      act(() => {
        result.current.chat([{ role: 'user', content: 'Hello' }]);
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveChat(mockAIResponse);
        await chatPromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should track only last user message', async () => {
      (aiService.chat as jest.Mock).mockResolvedValue(mockAIResponse);

      const { result } = renderHook(() => useAI());

      await act(async () => {
        await result.current.chat([
          { role: 'user', content: 'First message' },
          { role: 'assistant', content: 'Response' },
          { role: 'user', content: 'Second message' },
        ]);
      });

      await waitFor(() => {
        expect(mockTrackAIInteraction).toHaveBeenCalledWith(
          'Second message',
          'AI response content',
          'gpt-4',
          expect.any(Number)
        );
      });
    });
  });

  describe('chatStream', () => {
    it('should stream chat messages successfully', async () => {
      const chunks = [
        { content: 'Hello ', done: false },
        { content: 'world', done: false },
        { content: '', done: true },
      ];

      (aiService.chatStream as jest.Mock).mockImplementation(
        async (messages, options, onChunk) => {
          for (const chunk of chunks) {
            onChunk(chunk);
          }
        }
      );

      const { result } = renderHook(() => useAI());
      const receivedChunks: any[] = [];

      await act(async () => {
        await result.current.chatStream(
          [{ role: 'user', content: 'Hello' }],
          (chunk) => receivedChunks.push(chunk)
        );
      });

      expect(receivedChunks).toEqual(chunks);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should track AI interaction after streaming', async () => {
      (aiService.chatStream as jest.Mock).mockImplementation(
        async (messages, options, onChunk) => {
          onChunk({ content: 'Streamed ', done: false });
          onChunk({ content: 'response', done: false });
          onChunk({ content: '', done: true });
        }
      );

      const { result } = renderHook(() => useAI());

      await act(async () => {
        await result.current.chatStream(
          [{ role: 'user', content: 'Test' }],
          () => {}
        );
      });

      await waitFor(() => {
        expect(mockTrackAIInteraction).toHaveBeenCalledWith(
          'Test',
          'Streamed response',
          'streaming',
          expect.any(Number)
        );
      });
    });

    it('should handle streaming errors', async () => {
      const error = new Error('Stream failed');
      (aiService.chatStream as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAI());

      await expect(
        act(async () => {
          await result.current.chatStream(
            [{ role: 'user', content: 'Hello' }],
            () => {}
          );
        })
      ).rejects.toThrow('Stream failed');

      expect(result.current.error).toBe('Stream failed');
      expect(result.current.loading).toBe(false);
    });

    it('should handle streaming with options', async () => {
      (aiService.chatStream as jest.Mock).mockImplementation(
        async (messages, options, onChunk) => {
          onChunk({ content: 'Response', done: false });
          onChunk({ content: '', done: true });
        }
      );

      const { result } = renderHook(() => useAI());

      const options = {
        temperature: 0.5,
        maxTokens: 500,
      };

      await act(async () => {
        await result.current.chatStream(
          [{ role: 'user', content: 'Hello' }],
          () => {},
          options
        );
      });

      expect(aiService.chatStream).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Hello' }],
        options,
        expect.any(Function)
      );
    });
  });

  describe('enhanceNote', () => {
    it('should enhance note successfully', async () => {
      const enhancedContent = 'Enhanced note content';
      (aiService.enhanceNote as jest.Mock).mockResolvedValue(enhancedContent);

      const { result } = renderHook(() => useAI());

      let enhanced;
      await act(async () => {
        enhanced = await result.current.enhanceNote(
          'Original content',
          'Make it better'
        );
      });

      expect(enhanced).toBe(enhancedContent);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(aiService.enhanceNote).toHaveBeenCalledWith(
        'Original content',
        'Make it better'
      );
    });

    it('should handle note enhancement errors', async () => {
      const error = new Error('Enhancement failed');
      (aiService.enhanceNote as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAI());

      let enhanced;
      await act(async () => {
        enhanced = await result.current.enhanceNote(
          'Content',
          'Instruction'
        );
      });

      expect(enhanced).toBeNull();
      expect(result.current.error).toBe('Enhancement failed');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('generateAutomation', () => {
    it('should generate automation successfully', async () => {
      const automation = 'Generated automation code';
      (aiService.generateAutomation as jest.Mock).mockResolvedValue(automation);

      const { result } = renderHook(() => useAI());

      let generated;
      await act(async () => {
        generated = await result.current.generateAutomation(
          'Send email every Monday'
        );
      });

      expect(generated).toBe(automation);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(aiService.generateAutomation).toHaveBeenCalledWith(
        'Send email every Monday'
      );
    });

    it('should handle automation generation errors', async () => {
      const error = new Error('Generation failed');
      (aiService.generateAutomation as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAI());

      let generated;
      await act(async () => {
        generated = await result.current.generateAutomation('Description');
      });

      expect(generated).toBeNull();
      expect(result.current.error).toBe('Generation failed');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('getAutopilotSuggestion', () => {
    it('should get autopilot suggestion successfully', async () => {
      const suggestion = 'Suggested action';
      (aiService.getAutopilotSuggestion as jest.Mock).mockResolvedValue(
        suggestion
      );

      const { result } = renderHook(() => useAI());

      let received;
      await act(async () => {
        received = await result.current.getAutopilotSuggestion({
          context: 'user context',
        });
      });

      expect(received).toBe(suggestion);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(aiService.getAutopilotSuggestion).toHaveBeenCalledWith({
        context: 'user context',
      });
    });

    it('should handle autopilot suggestion errors', async () => {
      const error = new Error('Suggestion failed');
      (aiService.getAutopilotSuggestion as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAI());

      let received;
      await act(async () => {
        received = await result.current.getAutopilotSuggestion({});
      });

      expect(received).toBeNull();
      expect(result.current.error).toBe('Suggestion failed');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-Error objects', async () => {
      (aiService.chat as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useAI());

      await act(async () => {
        await result.current.chat([{ role: 'user', content: 'Hello' }]);
      });

      expect(result.current.error).toBe('AI request failed');
    });

    it('should clear error on successful request', async () => {
      (aiService.chat as jest.Mock)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockAIResponse);

      const { result } = renderHook(() => useAI());

      await act(async () => {
        await result.current.chat([{ role: 'user', content: 'Hello' }]);
      });

      expect(result.current.error).toBe('First error');

      await act(async () => {
        await result.current.chat([{ role: 'user', content: 'Hello again' }]);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('should manage loading state for all methods', async () => {
      const methods = [
        { name: 'chat', mock: aiService.chat, args: [[{ role: 'user', content: 'Hi' }]] },
        { name: 'enhanceNote', mock: aiService.enhanceNote, args: ['content', 'instruction'] },
        { name: 'generateAutomation', mock: aiService.generateAutomation, args: ['description'] },
        { name: 'getAutopilotSuggestion', mock: aiService.getAutopilotSuggestion, args: [{}] },
      ];

      for (const method of methods) {
        (method.mock as jest.Mock).mockResolvedValue('result');

        const { result } = renderHook(() => useAI());

        expect(result.current.loading).toBe(false);

        await act(async () => {
          await (result.current as any)[method.name](...method.args);
        });

        expect(result.current.loading).toBe(false);
      }
    });
  });
});
