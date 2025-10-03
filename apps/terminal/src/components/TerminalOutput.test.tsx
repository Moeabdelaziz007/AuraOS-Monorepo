import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TerminalOutput from './TerminalOutput';

describe('TerminalOutput Component', () => {
  it('should render output lines', () => {
    const lines = [
      { type: 'output', content: 'Line 1' },
      { type: 'output', content: 'Line 2' },
    ];
    
    render(<TerminalOutput lines={lines} />);
    
    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('Line 2')).toBeInTheDocument();
  });

  it('should render command lines with prompt', () => {
    const lines = [
      { type: 'command', content: 'ls -la', directory: '/home/user' },
    ];
    
    render(<TerminalOutput lines={lines} />);
    
    expect(screen.getByText(/\/home\/user/)).toBeInTheDocument();
    expect(screen.getByText('ls -la')).toBeInTheDocument();
  });

  it('should render error lines with error styling', () => {
    const lines = [
      { type: 'error', content: 'Command not found' },
    ];
    
    render(<TerminalOutput lines={lines} />);
    
    const errorLine = screen.getByText('Command not found');
    expect(errorLine).toHaveClass('error');
  });

  it('should handle empty lines array', () => {
    render(<TerminalOutput lines={[]} />);
    
    const output = screen.getByTestId('terminal-output');
    expect(output).toBeEmptyDOMElement();
  });

  it('should render ANSI color codes', () => {
    const lines = [
      { type: 'output', content: '\x1b[31mRed text\x1b[0m' },
    ];
    
    render(<TerminalOutput lines={lines} />);
    
    const coloredText = screen.getByText('Red text');
    expect(coloredText).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('should render multiline output', () => {
    const lines = [
      { type: 'output', content: 'Line 1\nLine 2\nLine 3' },
    ];
    
    render(<TerminalOutput lines={lines} />);
    
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    expect(screen.getByText(/Line 2/)).toBeInTheDocument();
    expect(screen.getByText(/Line 3/)).toBeInTheDocument();
  });

  it('should handle special characters', () => {
    const lines = [
      { type: 'output', content: '<script>alert("xss")</script>' },
    ];
    
    render(<TerminalOutput lines={lines} />);
    
    // Should render as text, not execute
    expect(screen.getByText(/<script>/)).toBeInTheDocument();
  });

  it('should render links as clickable', () => {
    const lines = [
      { type: 'output', content: 'Visit https://example.com' },
    ];
    
    render(<TerminalOutput lines={lines} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('should render file paths with syntax highlighting', () => {
    const lines = [
      { type: 'output', content: '/home/user/file.txt' },
    ];
    
    render(<TerminalOutput lines={lines} />);
    
    const filePath = screen.getByText('/home/user/file.txt');
    expect(filePath).toHaveClass('file-path');
  });

  it('should handle very long lines', () => {
    const longLine = 'x'.repeat(10000);
    const lines = [
      { type: 'output', content: longLine },
    ];
    
    render(<TerminalOutput lines={lines} />);
    
    expect(screen.getByText(longLine)).toBeInTheDocument();
  });

  it('should render timestamps when enabled', () => {
    const lines = [
      { type: 'output', content: 'Test', timestamp: new Date('2024-01-01T12:00:00') },
    ];
    
    render(<TerminalOutput lines={lines} showTimestamps={true} />);
    
    expect(screen.getByText(/12:00:00/)).toBeInTheDocument();
  });

  it('should not render timestamps when disabled', () => {
    const lines = [
      { type: 'output', content: 'Test', timestamp: new Date('2024-01-01T12:00:00') },
    ];
    
    render(<TerminalOutput lines={lines} showTimestamps={false} />);
    
    expect(screen.queryByText(/12:00:00/)).not.toBeInTheDocument();
  });

  it('should render line numbers when enabled', () => {
    const lines = [
      { type: 'output', content: 'Line 1' },
      { type: 'output', content: 'Line 2' },
    ];
    
    render(<TerminalOutput lines={lines} showLineNumbers={true} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should handle mixed line types', () => {
    const lines = [
      { type: 'command', content: 'ls', directory: '/home' },
      { type: 'output', content: 'file1.txt' },
      { type: 'output', content: 'file2.txt' },
      { type: 'error', content: 'Permission denied' },
    ];
    
    render(<TerminalOutput lines={lines} />);
    
    expect(screen.getByText('ls')).toBeInTheDocument();
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('file2.txt')).toBeInTheDocument();
    expect(screen.getByText('Permission denied')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const lines = [
      { type: 'output', content: 'Test' },
    ];
    
    render(<TerminalOutput lines={lines} className="custom-class" />);
    
    const output = screen.getByTestId('terminal-output');
    expect(output).toHaveClass('custom-class');
  });

  it('should handle rapid updates', () => {
    const { rerender } = render(<TerminalOutput lines={[]} />);
    
    for (let i = 0; i < 100; i++) {
      const lines = Array.from({ length: i + 1 }, (_, idx) => ({
        type: 'output',
        content: `Line ${idx}`,
      }));
      
      rerender(<TerminalOutput lines={lines} />);
    }
    
    expect(screen.getByText('Line 99')).toBeInTheDocument();
  });
});
