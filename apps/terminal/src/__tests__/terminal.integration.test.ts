/**
 * Terminal Integration Tests
 * Tests the AI-powered terminal functionality
 */

import { CommandParser } from '../commands/CommandParser';
import { ClientCommands } from '../commands/ClientCommands';

describe('Terminal Integration', () => {
  describe('CommandParser', () => {
    it('should parse simple commands', () => {
      const parsed = CommandParser.parse('ls -la /home');
      
      expect(parsed.command).toBe('ls');
      expect(parsed.args).toContain('/home');
      expect(parsed.flags).toHaveProperty('la', true);
    });

    it('should parse commands with flags', () => {
      const parsed = CommandParser.parse('cat --line-numbers file.txt');
      
      expect(parsed.command).toBe('cat');
      expect(parsed.args).toContain('file.txt');
      expect(parsed.flags).toHaveProperty('line-numbers', true);
    });

    it('should identify client-side commands', () => {
      expect(CommandParser.isClientSideCommand('clear')).toBe(true);
      expect(CommandParser.isClientSideCommand('help')).toBe(true);
      expect(CommandParser.isClientSideCommand('ls')).toBe(false);
    });

    it('should identify natural language', () => {
      expect(CommandParser.isNaturalLanguage('what files are here?')).toBe(true);
      expect(CommandParser.isNaturalLanguage('show me all files')).toBe(true);
      expect(CommandParser.isNaturalLanguage('ls -la')).toBe(false);
    });

    it('should determine command type', () => {
      expect(CommandParser.getCommandType('clear')).toBe('client');
      expect(CommandParser.getCommandType('ls')).toBe('system');
      expect(CommandParser.getCommandType('what files are here?')).toBe('natural');
    });
  });

  describe('ClientCommands', () => {
    let clientCommands: ClientCommands;
    let mockContext: any;

    beforeEach(() => {
      clientCommands = new ClientCommands();
      mockContext = {
        clearOutput: jest.fn(),
        getHistory: jest.fn(() => ['ls', 'cd /home', 'pwd']),
        setTheme: jest.fn(),
      };
    });

    it('should execute help command', async () => {
      const parsed = CommandParser.parse('help');
      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('AuraOS Terminal Assistant');
      expect(result.output).toContain('BASIC COMMANDS');
    });

    it('should execute history command', async () => {
      const parsed = CommandParser.parse('history');
      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('ls');
      expect(result.output).toContain('cd /home');
    });

    it('should execute history with limit', async () => {
      const parsed = CommandParser.parse('history -n 2');
      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(0);
      const lines = result.output.split('\n');
      expect(lines.length).toBeLessThanOrEqual(2);
    });

    it('should execute about command', async () => {
      const parsed = CommandParser.parse('about');
      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('AuraOS Terminal Assistant');
      expect(result.output).toContain('v1.0.0');
    });

    it('should execute version command', async () => {
      const parsed = CommandParser.parse('version');
      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('AuraOS Terminal');
      expect(result.output).toContain('MCP Integration');
    });

    it('should execute theme command', async () => {
      const parsed = CommandParser.parse('theme dark');
      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Theme changed to: dark');
      expect(mockContext.setTheme).toHaveBeenCalledWith('dark');
    });

    it('should list themes when no theme specified', async () => {
      const parsed = CommandParser.parse('theme');
      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Available Themes');
      expect(result.output).toContain('default');
      expect(result.output).toContain('matrix');
    });

    it('should handle clear command', async () => {
      const parsed = CommandParser.parse('clear');
      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(0);
      expect(mockContext.clearOutput).toHaveBeenCalled();
    });

    it('should handle unknown client command', async () => {
      const parsed = CommandParser.parse('unknown');
      const result = await clientCommands.execute(parsed, mockContext);

      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Unknown client command');
    });
  });

  describe('Command Parsing Edge Cases', () => {
    it('should handle empty input', () => {
      const parsed = CommandParser.parse('');
      
      expect(parsed.command).toBe('');
      expect(parsed.args).toEqual([]);
      expect(parsed.flags).toEqual({});
    });

    it('should handle multiple spaces', () => {
      const parsed = CommandParser.parse('ls    -la     /home');
      
      expect(parsed.command).toBe('ls');
      expect(parsed.args).toContain('/home');
    });

    it('should handle flags with equals', () => {
      const parsed = CommandParser.parse('command --flag=value');
      
      expect(parsed.flags).toHaveProperty('flag', 'value');
    });

    it('should handle mixed flags', () => {
      const parsed = CommandParser.parse('cmd -a --long -b value --flag=test');
      
      expect(parsed.flags).toHaveProperty('a', true);
      expect(parsed.flags).toHaveProperty('long', true);
      expect(parsed.flags).toHaveProperty('b', 'value');
      expect(parsed.flags).toHaveProperty('flag', 'test');
    });
  });

  describe('Natural Language Detection', () => {
    const naturalLanguageExamples = [
      'what files are here?',
      'show me all files',
      'how do I list files?',
      'can you help me?',
      'create a new file',
      'tell me about this directory',
      'find all text files',
    ];

    const commandExamples = [
      'ls -la',
      'cd /home',
      'cat file.txt',
      'mkdir test',
      'rm file',
    ];

    naturalLanguageExamples.forEach(example => {
      it(`should detect "${example}" as natural language`, () => {
        expect(CommandParser.isNaturalLanguage(example)).toBe(true);
      });
    });

    commandExamples.forEach(example => {
      it(`should detect "${example}" as command`, () => {
        expect(CommandParser.isNaturalLanguage(example)).toBe(false);
      });
    });
  });
});
