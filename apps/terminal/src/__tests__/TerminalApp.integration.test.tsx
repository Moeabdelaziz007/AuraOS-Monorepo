import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TerminalEmulator } from '../components/TerminalEmulator';
import { TerminalConfig } from '../types';

// Mock MCP Commands
const mockMCPCommands = {
  file: {
    read: vi.fn(),
    write: vi.fn(),
    list: vi.fn(),
    delete: vi.fn()
  },
  emulator: {
    create: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    execute: vi.fn()
  }
};

vi.mock('@auraos/core', () => ({
  mcpCommands: mockMCPCommands
}));

// Mock AI Services
vi.mock('@auraos/ai', () => ({
  aiService: {
    chat: vi.fn(),
    generate: vi.fn(),
    analyze: vi.fn()
  }
}));

describe('Terminal App Integration Tests', () => {
  const mockConfig: TerminalConfig = {
    rows: 24,
    cols: 80,
    fontSize: 14,
    fontFamily: 'monospace',
    theme: {
      name: 'dark',
      background: '#000000',
      foreground: '#ffffff',
      cursor: '#ffffff',
      selection: '#333333',
      colors: {
        black: '#000000',
        red: '#ff0000',
        green: '#00ff00',
        yellow: '#ffff00',
        blue: '#0000ff',
        magenta: '#ff00ff',
        cyan: '#00ffff',
        white: '#ffffff',
        brightBlack: '#333333',
        brightRed: '#ff6666',
        brightGreen: '#66ff66',
        brightYellow: '#ffff66',
        brightBlue: '#6666ff',
        brightMagenta: '#ff66ff',
        brightCyan: '#66ffff',
        brightWhite: '#ffffff'
      }
    },
    cursorBlink: true,
    scrollback: 1000
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Command Execution', () => {
    it('should execute basic commands', async () => {
      const mockOnCommand = vi.fn().mockResolvedValue({
        output: 'Hello World',
        exitCode: 0,
        duration: 100
      });

      render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'echo Hello World' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockOnCommand).toHaveBeenCalledWith('echo Hello World');
        expect(screen.getByText('Hello World')).toBeInTheDocument();
      });
    });

    it('should handle command errors', async () => {
      const mockOnCommand = vi.fn().mockResolvedValue({
        output: '',
        exitCode: 1,
        duration: 50,
        error: 'Command not found'
      });

      render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'invalid-command' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Error: Command not found')).toBeInTheDocument();
        expect(screen.getByText('Exit code: 1')).toBeInTheDocument();
      });
    });

    it('should handle long-running commands', async () => {
      const mockOnCommand = vi.fn().mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            output: 'Long running task completed',
            exitCode: 0,
            duration: 2000
          }), 100)
        )
      );

      render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'sleep 2' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      // Should show loading state
      expect(screen.getByText('$ sleep 2')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('Long running task completed')).toBeInTheDocument();
      });
    });
  });

  describe('Command History', () => {
    it('should navigate command history with arrow keys', async () => {
      const mockOnCommand = vi.fn().mockResolvedValue({
        output: 'Command executed',
        exitCode: 0,
        duration: 100
      });

      render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
      
      const input = screen.getByRole('textbox');
      
      // Execute multiple commands
      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      fireEvent.change(input, { target: { value: 'pwd' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      // Navigate history
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input).toHaveValue('pwd');
      
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input).toHaveValue('ls');
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input).toHaveValue('pwd');
    });

    it('should handle empty history gracefully', async () => {
      render(<TerminalEmulator config={mockConfig} />);
      
      const input = screen.getByRole('textbox');
      
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input).toHaveValue('');
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input).toHaveValue('');
    });
  });

  describe('Auto-complete', () => {
    it('should show command suggestions', async () => {
      render(<TerminalEmulator config={mockConfig} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'l' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('terminal-suggestions')).toBeVisible();
        expect(screen.getByText('ls')).toBeInTheDocument();
      });
    });

    it('should handle tab completion', async () => {
      render(<TerminalEmulator config={mockConfig} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'l' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      
      expect(input).toHaveValue('ls');
    });

    it('should handle multiple suggestions', async () => {
      render(<TerminalEmulator config={mockConfig} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'c' } });
      
      await waitFor(() => {
        const suggestions = screen.getAllByTestId('terminal-suggestion');
        expect(suggestions.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Terminal Controls', () => {
    it('should handle clear screen (Ctrl+L)', async () => {
      render(<TerminalEmulator config={mockConfig} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'echo test' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument();
      });
      
      fireEvent.keyDown(input, { key: 'l', ctrlKey: true });
      
      await waitFor(() => {
        expect(screen.queryByText('test')).not.toBeInTheDocument();
      });
    });

    it('should handle interrupt (Ctrl+C)', async () => {
      render(<TerminalEmulator config={mockConfig} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'sleep 10' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      fireEvent.keyDown(input, { key: 'c', ctrlKey: true });
      
      await waitFor(() => {
        expect(screen.getByText('^C')).toBeInTheDocument();
      });
    });
  });

  describe('MCP Integration', () => {
    it('should integrate with file system commands', async () => {
      mockMCPCommands.file.list.mockResolvedValue({
        files: [
          { name: 'file1.txt', type: 'file' },
          { name: 'folder1', type: 'directory' }
        ]
      });

      const mockOnCommand = vi.fn().mockImplementation(async (command) => {
        if (command === 'ls') {
          const result = await mockMCPCommands.file.list();
          return {
            output: result.files.map(f => f.name).join('\n'),
            exitCode: 0,
            duration: 100
          };
        }
        return { output: 'Command not found', exitCode: 1, duration: 0 };
      });

      render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockMCPCommands.file.list).toHaveBeenCalled();
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
        expect(screen.getByText('folder1')).toBeInTheDocument();
      });
    });

    it('should integrate with emulator commands', async () => {
      mockMCPCommands.emulator.execute.mockResolvedValue({
        output: 'BASIC program executed',
        exitCode: 0
      });

      const mockOnCommand = vi.fn().mockImplementation(async (command) => {
        if (command.startsWith('RUN')) {
          const result = await mockMCPCommands.emulator.execute(command);
          return {
            output: result.output,
            exitCode: result.exitCode,
            duration: 100
          };
        }
        return { output: 'Command not found', exitCode: 1, duration: 0 };
      });

      render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'RUN 10 PRINT "Hello"' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockMCPCommands.emulator.execute).toHaveBeenCalledWith('RUN 10 PRINT "Hello"');
        expect(screen.getByText('BASIC program executed')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid command execution', async () => {
      const mockOnCommand = vi.fn().mockResolvedValue({
        output: 'Command executed',
        exitCode: 0,
        duration: 10
      });

      render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
      
      const input = screen.getByRole('textbox');
      
      // Execute multiple commands rapidly
      for (let i = 0; i < 10; i++) {
        fireEvent.change(input, { target: { value: `echo ${i}` } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
        });
      }
      
      await waitFor(() => {
        expect(mockOnCommand).toHaveBeenCalledTimes(10);
      });
    });

    it('should handle large output without performance issues', async () => {
      const largeOutput = 'Line\n'.repeat(1000);
      const mockOnCommand = vi.fn().mockResolvedValue({
        output: largeOutput,
        exitCode: 0,
        duration: 100
      });

      render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'generate-large-output' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Line')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle command execution failures', async () => {
      const mockOnCommand = vi.fn().mockRejectedValue(new Error('Command execution failed'));

      render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'failing-command' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Error: Command execution failed')).toBeInTheDocument();
      });
    });

    it('should handle MCP command failures', async () => {
      mockMCPCommands.file.list.mockRejectedValue(new Error('File system error'));

      const mockOnCommand = vi.fn().mockImplementation(async (command) => {
        if (command === 'ls') {
          try {
            await mockMCPCommands.file.list();
          } catch (error) {
            return {
              output: '',
              exitCode: 1,
              duration: 0,
              error: error.message
            };
          }
        }
        return { output: 'Command not found', exitCode: 1, duration: 0 };
      });

      render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'ls' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Error: File system error')).toBeInTheDocument();
      });
    });
  });
});
