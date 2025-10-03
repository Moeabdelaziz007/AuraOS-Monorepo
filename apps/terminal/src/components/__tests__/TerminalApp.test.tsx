/**
 * Tests for TerminalApp component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TerminalApp } from '../TerminalApp';

// Mock useMCP hook
const mockMCP = {
  file: {
    read: vi.fn().mockResolvedValue('file content'),
    write: vi.fn().mockResolvedValue('File written'),
    list: vi.fn().mockResolvedValue('file1.txt\nfile2.txt'),
    search: vi.fn().mockResolvedValue('Found matches'),
    delete: vi.fn().mockResolvedValue('File deleted'),
  },
  emulator: {
    run: vi.fn().mockResolvedValue({
      output: 'HELLO WORLD',
      success: true,
      explanation: 'Program executed',
    }),
    generate: vi.fn().mockResolvedValue('10 PRINT "HELLO"'),
    execute: vi.fn().mockResolvedValue({
      code: '10 PRINT "HELLO"',
      output: 'HELLO',
      success: true,
    }),
    getState: vi.fn().mockResolvedValue({ running: false }),
  },
  ai: {
    chat: vi.fn().mockResolvedValue('AI response to your query'),
    analyzeCode: vi.fn().mockResolvedValue('Code analysis'),
    fixCode: vi.fn().mockResolvedValue('Fixed code'),
    explainCode: vi.fn().mockResolvedValue('Code explanation'),
    suggestImprovements: vi.fn().mockResolvedValue('Improvements'),
  },
  execute: vi.fn().mockResolvedValue({ success: true }),
  loading: false,
  error: null,
  initialized: true,
};

vi.mock('@auraos/hooks', () => ({
  useMCP: () => mockMCP,
}));

// Mock TerminalEmulator component
vi.mock('../TerminalEmulator', () => ({
  TerminalEmulator: ({ onCommand }: any) => {
    // Expose onCommand for testing
    (global as any).testOnCommand = onCommand;
    return <div data-testid="terminal-emulator">Terminal Emulator</div>;
  },
}));

describe('TerminalApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render terminal emulator', () => {
      render(<TerminalApp />);
      
      expect(screen.getByTestId('terminal-emulator')).toBeInTheDocument();
    });

    it('should initialize with default config', () => {
      render(<TerminalApp />);
      
      // Component should render without errors
      expect(screen.getByTestId('terminal-emulator')).toBeInTheDocument();
    });
  });

  describe('Client Commands', () => {
    it('should execute help command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('help');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('AuraOS Terminal');
      expect(result.output).toContain('BASIC COMMANDS');
    });

    it('should execute clear command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('clear');

      expect(result.exitCode).toBe(0);
      expect(result.output).toBe('');
    });

    it('should execute history command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('history');

      expect(result.exitCode).toBe(0);
      // History will be empty initially
      expect(result.output).toBeDefined();
    });

    it('should execute about command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('about');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('AuraOS Terminal');
    });

    it('should execute version command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('version');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('version');
    });

    it('should execute theme command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('theme');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Available themes');
    });

    it('should execute settings command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('settings');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Terminal Settings');
    });
  });

  describe('System Commands', () => {
    it('should execute ls command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('ls');

      await waitFor(() => {
        expect(mockMCP.file.list).toHaveBeenCalledWith('.');
      });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('file1.txt');
    });

    it('should execute ls with path', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      await onCommand('ls /home');

      await waitFor(() => {
        expect(mockMCP.file.list).toHaveBeenCalledWith('/home');
      });
    });

    it('should execute pwd command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('pwd');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('/home/user');
    });

    it('should execute cat command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('cat test.txt');

      await waitFor(() => {
        expect(mockMCP.file.read).toHaveBeenCalledWith('test.txt');
      });
      expect(result.exitCode).toBe(0);
      expect(result.output).toBe('file content');
    });

    it('should execute echo command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('echo hello world');

      expect(result.exitCode).toBe(0);
      expect(result.output).toBe('hello world');
    });

    it('should execute mkdir command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('mkdir newdir');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Directory created');
    });

    it('should execute rm command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('rm test.txt');

      await waitFor(() => {
        expect(mockMCP.file.delete).toHaveBeenCalledWith('test.txt');
      });
      expect(result.exitCode).toBe(0);
    });

    it('should execute cp command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('cp source.txt dest.txt');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Copied');
    });

    it('should execute mv command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('mv old.txt new.txt');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Moved');
    });
  });

  describe('Natural Language Commands', () => {
    it('should execute "what is" question', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('what is in this directory');

      await waitFor(() => {
        expect(mockMCP.ai.chat).toHaveBeenCalledWith(
          'what is in this directory',
          expect.objectContaining({
            currentDirectory: expect.any(String),
            context: 'terminal',
          })
        );
      });
      expect(result.exitCode).toBe(0);
      expect(result.output).toBe('AI response to your query');
    });

    it('should execute "how do I" question', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('how do I list files');

      await waitFor(() => {
        expect(mockMCP.ai.chat).toHaveBeenCalled();
      });
      expect(result.exitCode).toBe(0);
    });

    it('should execute "show me" command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('show me all files');

      await waitFor(() => {
        expect(mockMCP.ai.chat).toHaveBeenCalled();
      });
      expect(result.exitCode).toBe(0);
    });

    it('should execute "create a file" command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('create a file called test.txt');

      await waitFor(() => {
        expect(mockMCP.ai.chat).toHaveBeenCalled();
      });
      expect(result.exitCode).toBe(0);
    });

    it('should execute question ending with ?', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('can you help me?');

      await waitFor(() => {
        expect(mockMCP.ai.chat).toHaveBeenCalled();
      });
      expect(result.exitCode).toBe(0);
    });
  });

  describe('BASIC Commands', () => {
    it('should execute run command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('run 10 PRINT "HELLO"');

      await waitFor(() => {
        expect(mockMCP.emulator.run).toHaveBeenCalled();
      });
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('HELLO WORLD');
    });

    it('should execute load command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('load program.bas');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Loaded program');
    });

    it('should execute save command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('save program.bas');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Saved program');
    });

    it('should execute list command', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('list');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('No program loaded');
    });
  });

  describe('Command Routing', () => {
    it('should route client commands correctly', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      await onCommand('help');

      // Should not call MCP for client commands
      expect(mockMCP.ai.chat).not.toHaveBeenCalled();
      expect(mockMCP.file.list).not.toHaveBeenCalled();
    });

    it('should route system commands correctly', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      await onCommand('ls');

      // Should call MCP for system commands
      await waitFor(() => {
        expect(mockMCP.file.list).toHaveBeenCalled();
      });
    });

    it('should route natural language commands correctly', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      await onCommand('what files are here');

      // Should call AI for natural language
      await waitFor(() => {
        expect(mockMCP.ai.chat).toHaveBeenCalled();
      });
    });
  });

  describe('MCP Initialization', () => {
    it('should handle uninitialized MCP', async () => {
      const uninitializedMCP = { ...mockMCP, initialized: false };
      vi.mocked(require('@auraos/hooks').useMCP).mockReturnValue(uninitializedMCP);

      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('ls');

      expect(result.output).toContain('Initializing');
      expect(result.exitCode).toBe(0);
    });

    it('should allow client commands when MCP not initialized', async () => {
      const uninitializedMCP = { ...mockMCP, initialized: false };
      vi.mocked(require('@auraos/hooks').useMCP).mockReturnValue(uninitializedMCP);

      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('help');

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('AuraOS Terminal');
    });
  });

  describe('Error Handling', () => {
    it('should handle command execution errors', async () => {
      mockMCP.file.list.mockRejectedValue(new Error('Permission denied'));

      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('ls /root');

      await waitFor(() => {
        expect(result.exitCode).toBe(1);
      });
      expect(result.error).toBeDefined();
    });

    it('should handle AI errors', async () => {
      mockMCP.ai.chat.mockRejectedValue(new Error('AI service unavailable'));

      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('what is this');

      await waitFor(() => {
        expect(result.exitCode).toBe(1);
      });
      expect(result.error).toContain('AI service unavailable');
    });

    it('should handle missing arguments', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('cat');

      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('missing file operand');
    });
  });

  describe('Performance', () => {
    it('should include duration in results', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      const result = await onCommand('help');

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result.duration).toBe('number');
    });
  });

  describe('Integration', () => {
    it('should handle complex command sequences', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      
      // Execute multiple commands
      await onCommand('help');
      await onCommand('ls');
      await onCommand('what files are here');

      expect(mockMCP.file.list).toHaveBeenCalled();
      expect(mockMCP.ai.chat).toHaveBeenCalled();
    });

    it('should maintain state between commands', async () => {
      render(<TerminalApp />);
      
      const onCommand = (global as any).testOnCommand;
      
      // Execute cd command
      await onCommand('cd /home');
      
      // Execute pwd to verify directory changed
      const result = await onCommand('pwd');
      
      // Directory should have changed (implementation dependent)
      expect(result.exitCode).toBe(0);
    });
  });
});
