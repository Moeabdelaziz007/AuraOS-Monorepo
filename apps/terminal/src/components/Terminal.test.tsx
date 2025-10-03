import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Terminal from './Terminal';
import { useTerminalStore } from '../store/terminalStore';

vi.mock('../store/terminalStore');

describe('Terminal Component', () => {
  const mockAddToHistory = vi.fn();
  const mockGetHistory = vi.fn();
  const mockClearHistory = vi.fn();
  const mockSetCurrentDirectory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useTerminalStore as any).mockReturnValue({
      history: [],
      currentDirectory: '/home/user',
      addToHistory: mockAddToHistory,
      getHistory: mockGetHistory,
      clearHistory: mockClearHistory,
      setCurrentDirectory: mockSetCurrentDirectory,
    });
  });

  it('should render terminal with prompt', () => {
    render(<Terminal />);
    
    expect(screen.getByTestId('terminal-prompt')).toBeInTheDocument();
    expect(screen.getByTestId('terminal-input')).toBeInTheDocument();
  });

  it('should display current directory in prompt', () => {
    render(<Terminal />);
    
    const prompt = screen.getByTestId('terminal-prompt');
    expect(prompt).toHaveTextContent('/home/user');
  });

  it('should execute command on Enter key', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input');
    await userEvent.type(input, 'ls -la{Enter}');
    
    expect(mockAddToHistory).toHaveBeenCalledWith('ls -la');
  });

  it('should not execute empty command', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input');
    await userEvent.type(input, '{Enter}');
    
    expect(mockAddToHistory).not.toHaveBeenCalled();
  });

  it('should clear input after command execution', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    await userEvent.type(input, 'echo test{Enter}');
    
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should navigate command history with arrow keys', async () => {
    mockGetHistory.mockReturnValue(['ls', 'cd /home', 'pwd']);
    
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    
    // Arrow up should show last command
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('pwd');
    
    // Arrow up again should show previous command
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('cd /home');
    
    // Arrow down should move forward
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('pwd');
  });

  it('should support tab completion', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    await userEvent.type(input, 'hel');
    
    fireEvent.keyDown(input, { key: 'Tab' });
    
    await waitFor(() => {
      expect(input.value).toBe('help');
    });
  });

  it('should display command output', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input');
    await userEvent.type(input, 'echo hello{Enter}');
    
    await waitFor(() => {
      const output = screen.getByTestId('terminal-output');
      expect(output).toHaveTextContent('hello');
    });
  });

  it('should display error messages', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input');
    await userEvent.type(input, 'invalidcommand{Enter}');
    
    await waitFor(() => {
      const output = screen.getByTestId('terminal-output');
      expect(output).toHaveTextContent('command not found');
    });
  });

  it('should handle Ctrl+C to cancel input', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    await userEvent.type(input, 'some text');
    
    fireEvent.keyDown(input, { key: 'c', ctrlKey: true });
    
    expect(input.value).toBe('');
  });

  it('should handle Ctrl+L to clear screen', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input');
    await userEvent.type(input, 'echo test{Enter}');
    
    await waitFor(() => {
      expect(screen.getByTestId('terminal-output')).not.toBeEmptyDOMElement();
    });
    
    fireEvent.keyDown(input, { key: 'l', ctrlKey: true });
    
    await waitFor(() => {
      expect(screen.getByTestId('terminal-output')).toBeEmptyDOMElement();
    });
  });

  it('should auto-scroll to bottom on new output', async () => {
    render(<Terminal />);
    
    const output = screen.getByTestId('terminal-output');
    const scrollSpy = vi.spyOn(output, 'scrollTo');
    
    const input = screen.getByTestId('terminal-input');
    await userEvent.type(input, 'echo test{Enter}');
    
    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalled();
    });
  });

  it('should focus input on terminal click', () => {
    render(<Terminal />);
    
    const terminal = screen.getByTestId('terminal');
    const input = screen.getByTestId('terminal-input');
    
    fireEvent.click(terminal);
    
    expect(input).toHaveFocus();
  });

  it('should display multiple command outputs', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input');
    
    await userEvent.type(input, 'echo first{Enter}');
    await userEvent.type(input, 'echo second{Enter}');
    
    await waitFor(() => {
      const output = screen.getByTestId('terminal-output');
      expect(output).toHaveTextContent('first');
      expect(output).toHaveTextContent('second');
    });
  });

  it('should handle long command output', async () => {
    render(<Terminal />);
    
    const longOutput = 'x'.repeat(10000);
    const input = screen.getByTestId('terminal-input');
    
    await userEvent.type(input, `echo ${longOutput}{Enter}`);
    
    await waitFor(() => {
      const output = screen.getByTestId('terminal-output');
      expect(output).toHaveTextContent(longOutput);
    });
  });

  it('should preserve ANSI color codes', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input');
    await userEvent.type(input, 'ls --color{Enter}');
    
    await waitFor(() => {
      const output = screen.getByTestId('terminal-output');
      const coloredElement = output.querySelector('[style*="color"]');
      expect(coloredElement).toBeInTheDocument();
    });
  });

  it('should handle rapid command execution', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input');
    
    // Execute multiple commands rapidly
    for (let i = 0; i < 10; i++) {
      await userEvent.type(input, `echo ${i}{Enter}`);
    }
    
    await waitFor(() => {
      expect(mockAddToHistory).toHaveBeenCalledTimes(10);
    });
  });

  it('should support copy and paste', async () => {
    render(<Terminal />);
    
    const input = screen.getByTestId('terminal-input');
    
    // Simulate paste
    const pasteText = 'pasted command';
    await userEvent.click(input);
    await userEvent.paste(pasteText);
    
    expect(input).toHaveValue(pasteText);
  });

  it('should display welcome message on mount', () => {
    render(<Terminal />);
    
    const output = screen.getByTestId('terminal-output');
    expect(output).toHaveTextContent('Welcome to AuraOS Terminal');
  });

  it('should handle window resize', () => {
    render(<Terminal />);
    
    // Trigger resize event
    global.dispatchEvent(new Event('resize'));
    
    // Terminal should still be functional
    const input = screen.getByTestId('terminal-input');
    expect(input).toBeInTheDocument();
  });
});
