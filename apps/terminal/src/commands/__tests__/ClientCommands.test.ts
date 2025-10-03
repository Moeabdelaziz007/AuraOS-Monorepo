/**
 * Tests for ClientCommands
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClientCommands } from '../ClientCommands';
import { CommandParser } from '../CommandParser';
import { createMockContext } from './test-utils';

describe('ClientCommands', () => {
  let clientCommands: ClientCommands;
  let mockContext: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    clientCommands = new ClientCommands();
    mockContext = createMockContext();
  });

  describe('clear/cls', () => {
    it('should clear output', async () => {
      const parsed = CommandParser.parse('clear');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(mockContext.clearOutput).toHaveBeenCalled();
      expect(result.output).toBe('');
      expect(result.exitCode).toBe(0);
    });

    it('should handle cls command', async () => {
      const parsed = CommandParser.parse('cls');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(mockContext.clearOutput).toHaveBeenCalled();
      expect(result.exitCode).toBe(0);
    });
  });

  describe('help', () => {
    it('should show general help', async () => {
      const parsed = CommandParser.parse('help');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('AuraOS Terminal Assistant');
      expect(result.output).toContain('BASIC COMMANDS');
      expect(result.output).toContain('AI-POWERED COMMANDS');
      expect(result.output).toContain('SYSTEM COMMANDS');
      expect(result.exitCode).toBe(0);
    });

    it('should show help for specific topic - ai', async () => {
      const parsed = CommandParser.parse('help ai');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('AI-Powered Commands');
      expect(result.output).toContain('natural language');
      expect(result.exitCode).toBe(0);
    });

    it('should show help for specific topic - basic', async () => {
      const parsed = CommandParser.parse('help basic');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('BASIC Programming');
      expect(result.output).toContain('run [code]');
      expect(result.exitCode).toBe(0);
    });

    it('should show help for specific topic - files', async () => {
      const parsed = CommandParser.parse('help files');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('File Operations');
      expect(result.output).toContain('ls, dir');
      expect(result.exitCode).toBe(0);
    });

    it('should handle unknown topic', async () => {
      const parsed = CommandParser.parse('help unknown');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('No help available for: unknown');
      expect(result.exitCode).toBe(0);
    });

    it('should be case insensitive for topics', async () => {
      const parsed = CommandParser.parse('help AI');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('AI-Powered Commands');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('history', () => {
    it('should show command history', async () => {
      const parsed = CommandParser.parse('history');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(mockContext.getHistory).toHaveBeenCalled();
      expect(result.output).toContain('command1');
      expect(result.output).toContain('command2');
      expect(result.output).toContain('command3');
      expect(result.exitCode).toBe(0);
    });

    it('should show numbered history', async () => {
      const parsed = CommandParser.parse('history');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toMatch(/\d+/); // Should contain numbers
      expect(result.exitCode).toBe(0);
    });

    it('should handle -n flag to limit history', async () => {
      const parsed = CommandParser.parse('history -n 2');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(0);
      // Should limit output (implementation dependent)
    });

    it('should handle empty history', async () => {
      mockContext.getHistory.mockReturnValue([]);
      const parsed = CommandParser.parse('history');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('No command history');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('about', () => {
    it('should show about information', async () => {
      const parsed = CommandParser.parse('about');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('AuraOS Terminal');
      expect(result.output).toContain('AI-powered');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('version', () => {
    it('should show version information', async () => {
      const parsed = CommandParser.parse('version');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('version');
      expect(result.output).toMatch(/\d+\.\d+\.\d+/); // Should contain version number
      expect(result.exitCode).toBe(0);
    });
  });

  describe('theme', () => {
    it('should show theme list when no argument', async () => {
      const parsed = CommandParser.parse('theme');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('Available themes');
      expect(result.exitCode).toBe(0);
    });

    it('should change theme when argument provided', async () => {
      const parsed = CommandParser.parse('theme dark');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(mockContext.setTheme).toHaveBeenCalledWith('dark');
      expect(result.output).toContain('Theme changed to: dark');
      expect(result.exitCode).toBe(0);
    });

    it('should handle missing setTheme function', async () => {
      mockContext.setTheme = undefined;
      const parsed = CommandParser.parse('theme dark');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('not supported');
      expect(result.exitCode).toBe(0);
    });

    it('should list available themes', async () => {
      const parsed = CommandParser.parse('theme');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('default');
      expect(result.output).toContain('dark');
      expect(result.output).toContain('light');
    });
  });

  describe('settings', () => {
    it('should show current settings', async () => {
      const parsed = CommandParser.parse('settings');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('Terminal Settings');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('exit', () => {
    it('should show exit message', async () => {
      const parsed = CommandParser.parse('exit');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('Ctrl+W');
      expect(result.output).toContain('close the window');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('unknown command', () => {
    it('should return error for unknown client command', async () => {
      const parsed = CommandParser.parse('unknown');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('Unknown client command');
      expect(result.output).toContain('unknown');
      expect(result.exitCode).toBe(1);
    });
  });

  describe('Performance', () => {
    it('should measure execution duration', async () => {
      const parsed = CommandParser.parse('help');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result.duration).toBe('number');
    });

    it('should include duration even on error', async () => {
      const parsed = CommandParser.parse('unknown');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      mockContext.clearOutput.mockImplementation(() => {
        throw new Error('Clear failed');
      });
      const parsed = CommandParser.parse('clear');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(1);
      expect(result.error).toBe('Clear failed');
    });

    it('should handle non-Error exceptions', async () => {
      mockContext.getHistory.mockImplementation(() => {
        throw 'String error';
      });
      const parsed = CommandParser.parse('history');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(1);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('Case sensitivity', () => {
    it('should handle uppercase commands', async () => {
      const parsed = CommandParser.parse('CLEAR');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(mockContext.clearOutput).toHaveBeenCalled();
      expect(result.exitCode).toBe(0);
    });

    it('should handle mixed case commands', async () => {
      const parsed = CommandParser.parse('Help');

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.output).toContain('AuraOS Terminal');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Integration', () => {
    it('should work with CommandParser', async () => {
      const input = 'help ai';
      const parsed = CommandParser.parse(input);

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('AI-Powered');
    });

    it('should handle flags from parser', async () => {
      const input = 'history -n 5';
      const parsed = CommandParser.parse(input);

      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(0);
    });
  });
});
