import { renderHook, act, waitFor } from '@testing-library/react';
import { useMCP } from '../useMCP';
import { mcpCommands } from '@auraos/core/ai/mcp-commands';

// Mock MCP commands
jest.mock('@auraos/core/ai/mcp-commands', () => ({
  mcpCommands: {
    initialize: jest.fn(),
    shutdown: jest.fn(),
    execute: jest.fn(),
    file: {
      read: jest.fn(),
      write: jest.fn(),
      list: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
    },
    emulator: {
      run: jest.fn(),
      generate: jest.fn(),
      execute: jest.fn(),
      getState: jest.fn(),
    },
    ai: {
      chat: jest.fn(),
      analyzeCode: jest.fn(),
      fixCode: jest.fn(),
      explainCode: jest.fn(),
      suggestImprovements: jest.fn(),
    },
  },
}));

describe('useMCP', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mcpCommands.initialize as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Initialization', () => {
    it('should initialize MCP on mount', async () => {
      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(mcpCommands.initialize).toHaveBeenCalled();
        expect(result.current.initialized).toBe(true);
      });
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      (mcpCommands.initialize as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.error).toBe('Initialization failed');
      });
    });

    it('should shutdown MCP on unmount', async () => {
      const { unmount } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(mcpCommands.initialize).toHaveBeenCalled();
      });

      unmount();

      expect(mcpCommands.shutdown).toHaveBeenCalled();
    });

    it('should start with correct initial state', () => {
      const { result } = renderHook(() => useMCP());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.initialized).toBe(false);
    });
  });

  describe('execute', () => {
    it('should execute command successfully', async () => {
      (mcpCommands.execute as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let response;
      await act(async () => {
        response = await result.current.execute('test-command', { param: 'value' });
      });

      expect(response).toEqual({ success: true });
      expect(mcpCommands.execute).toHaveBeenCalledWith('test-command', { param: 'value' });
    });

    it('should handle execute errors', async () => {
      const error = new Error('Command failed');
      (mcpCommands.execute as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await expect(
        act(async () => {
          await result.current.execute('failing-command');
        })
      ).rejects.toThrow('Command failed');

      expect(result.current.error).toBe('Command failed');
    });
  });

  describe('file operations', () => {
    beforeEach(async () => {
      (mcpCommands.initialize as jest.Mock).mockResolvedValue(undefined);
    });

    it('should read file successfully', async () => {
      const fileContent = 'File content';
      (mcpCommands.file.read as jest.Mock).mockResolvedValue(fileContent);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let content;
      await act(async () => {
        content = await result.current.file.read('/path/to/file.txt');
      });

      expect(content).toBe(fileContent);
      expect(mcpCommands.file.read).toHaveBeenCalledWith('/path/to/file.txt');
    });

    it('should write file successfully', async () => {
      (mcpCommands.file.write as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let response;
      await act(async () => {
        response = await result.current.file.write('/path/to/file.txt', 'New content');
      });

      expect(response).toEqual({ success: true });
      expect(mcpCommands.file.write).toHaveBeenCalledWith('/path/to/file.txt', 'New content');
    });

    it('should list directory successfully', async () => {
      const files = ['file1.txt', 'file2.txt'];
      (mcpCommands.file.list as jest.Mock).mockResolvedValue(files);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let list;
      await act(async () => {
        list = await result.current.file.list('/path/to/dir');
      });

      expect(list).toEqual(files);
      expect(mcpCommands.file.list).toHaveBeenCalledWith('/path/to/dir');
    });

    it('should list current directory by default', async () => {
      (mcpCommands.file.list as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.file.list();
      });

      expect(mcpCommands.file.list).toHaveBeenCalledWith('.');
    });

    it('should search files successfully', async () => {
      const results = [{ path: '/file1.txt', matches: 3 }];
      (mcpCommands.file.search as jest.Mock).mockResolvedValue(results);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let searchResults;
      await act(async () => {
        searchResults = await result.current.file.search('query', '/path');
      });

      expect(searchResults).toEqual(results);
      expect(mcpCommands.file.search).toHaveBeenCalledWith('query', '/path');
    });

    it('should search in current directory by default', async () => {
      (mcpCommands.file.search as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.file.search('query');
      });

      expect(mcpCommands.file.search).toHaveBeenCalledWith('query', '.');
    });

    it('should delete file successfully', async () => {
      (mcpCommands.file.delete as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let response;
      await act(async () => {
        response = await result.current.file.delete('/path/to/file.txt');
      });

      expect(response).toEqual({ success: true });
      expect(mcpCommands.file.delete).toHaveBeenCalledWith('/path/to/file.txt');
    });

    it('should handle file operation errors', async () => {
      const error = new Error('File not found');
      (mcpCommands.file.read as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await expect(
        act(async () => {
          await result.current.file.read('/nonexistent.txt');
        })
      ).rejects.toThrow('File not found');

      expect(result.current.error).toBe('File not found');
    });
  });

  describe('emulator operations', () => {
    it('should run code successfully', async () => {
      const output = { result: 'Success', output: 'Hello World' };
      (mcpCommands.emulator.run as jest.Mock).mockResolvedValue(output);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let runResult;
      await act(async () => {
        runResult = await result.current.emulator.run('PRINT "Hello"');
      });

      expect(runResult).toEqual(output);
      expect(mcpCommands.emulator.run).toHaveBeenCalledWith('PRINT "Hello"');
    });

    it('should generate code successfully', async () => {
      const generatedCode = 'PRINT "Generated code"';
      (mcpCommands.emulator.generate as jest.Mock).mockResolvedValue(generatedCode);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let code;
      await act(async () => {
        code = await result.current.emulator.generate('Print hello world');
      });

      expect(code).toBe(generatedCode);
      expect(mcpCommands.emulator.generate).toHaveBeenCalledWith('Print hello world');
    });

    it('should execute prompt successfully', async () => {
      const result_data = { success: true, output: 'Executed' };
      (mcpCommands.emulator.execute as jest.Mock).mockResolvedValue(result_data);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let execResult;
      await act(async () => {
        execResult = await result.current.emulator.execute('Run calculation');
      });

      expect(execResult).toEqual(result_data);
      expect(mcpCommands.emulator.execute).toHaveBeenCalledWith('Run calculation');
    });

    it('should get emulator state successfully', async () => {
      const state = { variables: {}, memory: [] };
      (mcpCommands.emulator.getState as jest.Mock).mockResolvedValue(state);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let emulatorState;
      await act(async () => {
        emulatorState = await result.current.emulator.getState();
      });

      expect(emulatorState).toEqual(state);
      expect(mcpCommands.emulator.getState).toHaveBeenCalled();
    });

    it('should handle emulator errors', async () => {
      const error = new Error('Syntax error');
      (mcpCommands.emulator.run as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await expect(
        act(async () => {
          await result.current.emulator.run('INVALID CODE');
        })
      ).rejects.toThrow('Syntax error');

      expect(result.current.error).toBe('Syntax error');
    });
  });

  describe('AI operations', () => {
    it('should chat successfully', async () => {
      const response = { message: 'AI response' };
      (mcpCommands.ai.chat as jest.Mock).mockResolvedValue(response);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let chatResponse;
      await act(async () => {
        chatResponse = await result.current.ai.chat('Hello AI', { context: 'test' });
      });

      expect(chatResponse).toEqual(response);
      expect(mcpCommands.ai.chat).toHaveBeenCalledWith('Hello AI', { context: 'test' });
    });

    it('should analyze code successfully', async () => {
      const analysis = { complexity: 'low', suggestions: [] };
      (mcpCommands.ai.analyzeCode as jest.Mock).mockResolvedValue(analysis);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let analysisResult;
      await act(async () => {
        analysisResult = await result.current.ai.analyzeCode('PRINT "Hello"', 'BASIC');
      });

      expect(analysisResult).toEqual(analysis);
      expect(mcpCommands.ai.analyzeCode).toHaveBeenCalledWith('PRINT "Hello"', 'BASIC');
    });

    it('should use default language for code analysis', async () => {
      (mcpCommands.ai.analyzeCode as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.ai.analyzeCode('code');
      });

      expect(mcpCommands.ai.analyzeCode).toHaveBeenCalledWith('code', 'BASIC');
    });

    it('should fix code successfully', async () => {
      const fixedCode = 'PRINT "Fixed"';
      (mcpCommands.ai.fixCode as jest.Mock).mockResolvedValue(fixedCode);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let fixed;
      await act(async () => {
        fixed = await result.current.ai.fixCode('PRINT "Broken', 'Syntax error');
      });

      expect(fixed).toBe(fixedCode);
      expect(mcpCommands.ai.fixCode).toHaveBeenCalledWith('PRINT "Broken', 'Syntax error');
    });

    it('should explain code successfully', async () => {
      const explanation = 'This code prints Hello';
      (mcpCommands.ai.explainCode as jest.Mock).mockResolvedValue(explanation);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let explain;
      await act(async () => {
        explain = await result.current.ai.explainCode('PRINT "Hello"');
      });

      expect(explain).toBe(explanation);
      expect(mcpCommands.ai.explainCode).toHaveBeenCalledWith('PRINT "Hello"');
    });

    it('should suggest improvements successfully', async () => {
      const suggestions = ['Use variables', 'Add comments'];
      (mcpCommands.ai.suggestImprovements as jest.Mock).mockResolvedValue(suggestions);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      let improvements;
      await act(async () => {
        improvements = await result.current.ai.suggestImprovements('PRINT "Hello"');
      });

      expect(improvements).toEqual(suggestions);
      expect(mcpCommands.ai.suggestImprovements).toHaveBeenCalledWith('PRINT "Hello"');
    });

    it('should handle AI operation errors', async () => {
      const error = new Error('AI service error');
      (mcpCommands.ai.chat as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await expect(
        act(async () => {
          await result.current.ai.chat('Hello');
        })
      ).rejects.toThrow('AI service error');

      expect(result.current.error).toBe('AI service error');
    });
  });

  describe('Loading State', () => {
    it('should manage loading state for execute', async () => {
      let resolveExecute: any;
      const executePromise = new Promise((resolve) => {
        resolveExecute = resolve;
      });
      (mcpCommands.execute as jest.Mock).mockReturnValue(executePromise);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      act(() => {
        result.current.execute('command');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await act(async () => {
        resolveExecute({ success: true });
        await executePromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should manage loading state for file operations', async () => {
      (mcpCommands.file.read as jest.Mock).mockResolvedValue('content');

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await act(async () => {
        await result.current.file.read('/file.txt');
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Messages', () => {
    it('should use Arabic error messages', async () => {
      const error = new Error('Test error');
      (mcpCommands.file.read as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await expect(
        act(async () => {
          await result.current.file.read('/file.txt');
        })
      ).rejects.toThrow();

      expect(result.current.error).toBe('Test error');
    });

    it('should handle non-Error objects with Arabic fallback', async () => {
      (mcpCommands.file.write as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useMCP());

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });

      await expect(
        act(async () => {
          await result.current.file.write('/file.txt', 'content');
        })
      ).rejects.toThrow();

      expect(result.current.error).toContain('فشل');
    });
  });
});
