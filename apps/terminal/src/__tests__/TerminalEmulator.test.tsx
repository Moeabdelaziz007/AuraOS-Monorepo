import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TerminalEmulator } from '../components/TerminalEmulator';
import { TerminalConfig, TerminalTheme } from '../types';

// Mock hooks
vi.mock('../hooks/useTerminal', () => ({
  useTerminal: () => ({
    output: ['$ test command', 'Hello World'],
    addOutput: vi.fn(),
    clearOutput: vi.fn(),
    getCurrentDirectory: () => '/home/user',
    setCurrentDirectory: vi.fn()
  })
}));

vi.mock('../hooks/useCommandHistory', () => ({
  useCommandHistory: () => ({
    history: ['ls', 'cd /home', 'pwd'],
    addToHistory: vi.fn(),
    getPreviousCommand: vi.fn(() => 'ls'),
    getNextCommand: vi.fn(() => null),
    searchHistory: vi.fn(() => ['ls'])
  })
}));

vi.mock('../hooks/useAutoComplete', () => ({
  useAutoComplete: () => ({
    suggestions: ['ls', 'cd', 'pwd'],
    getSuggestions: vi.fn(),
    clearSuggestions: vi.fn(),
    getCommandHelp: vi.fn(() => 'List directory contents')
  })
}));

describe('TerminalEmulator', () => {
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

  const mockOnCommand = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders terminal emulator', () => {
    render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
    
    expect(screen.getByText('$ test command')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('displays current directory in prompt', () => {
    render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
    
    expect(screen.getByText('/home/user')).toBeInTheDocument();
  });

  it('handles command input', async () => {
    render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ls -la' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnCommand).toHaveBeenCalledWith('ls -la');
    });
  });

  it('handles arrow key navigation', () => {
    render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
    
    const input = screen.getByRole('textbox');
    
    // Test arrow up
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('ls');
    
    // Test arrow down
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('');
  });

  it('handles tab completion', () => {
    render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'l' } });
    fireEvent.keyDown(input, { key: 'Tab' });
    
    expect(input).toHaveValue('ls');
  });

  it('handles clear screen (Ctrl+L)', () => {
    const { useTerminal } = require('../hooks/useTerminal');
    const mockClearOutput = vi.fn();
    
    vi.mocked(useTerminal).mockReturnValue({
      output: ['$ test command'],
      addOutput: vi.fn(),
      clearOutput: mockClearOutput,
      getCurrentDirectory: () => '/home/user',
      setCurrentDirectory: vi.fn()
    });
    
    render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'l', ctrlKey: true });
    
    expect(mockClearOutput).toHaveBeenCalled();
  });

  it('handles interrupt (Ctrl+C)', () => {
    render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'c', ctrlKey: true });
    
    expect(screen.getByText('^C')).toBeInTheDocument();
  });

  it('applies terminal theme', () => {
    render(<TerminalEmulator config={mockConfig} onCommand={mockOnCommand} />);
    
    const terminal = screen.getByRole('textbox').closest('.terminal-emulator');
    expect(terminal).toHaveStyle({
      backgroundColor: '#000000',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontSize: '14px'
    });
  });
});
