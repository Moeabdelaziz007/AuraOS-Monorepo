/**
 * Tests for CommandParser
 */

import { describe, it, expect } from 'vitest';
import { CommandParser } from '../CommandParser';

describe('CommandParser', () => {
  describe('parse', () => {
    it('should parse simple command', () => {
      const result = CommandParser.parse('ls');
      
      expect(result.command).toBe('ls');
      expect(result.args).toEqual([]);
      expect(result.flags).toEqual({});
      expect(result.rawInput).toBe('ls');
    });

    it('should parse command with arguments', () => {
      const result = CommandParser.parse('cat file.txt');
      
      expect(result.command).toBe('cat');
      expect(result.args).toEqual(['file.txt']);
      expect(result.flags).toEqual({});
    });

    it('should parse command with multiple arguments', () => {
      const result = CommandParser.parse('cp source.txt dest.txt');
      
      expect(result.command).toBe('cp');
      expect(result.args).toEqual(['source.txt', 'dest.txt']);
      expect(result.flags).toEqual({});
    });

    it('should parse long flags with boolean value', () => {
      const result = CommandParser.parse('ls --all');
      
      expect(result.command).toBe('ls');
      expect(result.args).toEqual([]);
      expect(result.flags).toEqual({ all: true });
    });

    it('should parse long flags with value', () => {
      const result = CommandParser.parse('ls --format=long');
      
      expect(result.command).toBe('ls');
      expect(result.args).toEqual([]);
      expect(result.flags).toEqual({ format: 'long' });
    });

    it('should parse short flags with boolean value', () => {
      const result = CommandParser.parse('ls -a');
      
      expect(result.command).toBe('ls');
      expect(result.args).toEqual([]);
      expect(result.flags).toEqual({ a: true });
    });

    it('should parse short flags with value', () => {
      const result = CommandParser.parse('grep -n 5 pattern');
      
      expect(result.command).toBe('grep');
      expect(result.args).toEqual(['pattern']);
      expect(result.flags).toEqual({ n: '5' });
    });

    it('should parse mixed arguments and flags', () => {
      const result = CommandParser.parse('ls /home --all -l');
      
      expect(result.command).toBe('ls');
      expect(result.args).toEqual(['/home']);
      expect(result.flags).toEqual({ all: true, l: true });
    });

    it('should parse multiple flags', () => {
      const result = CommandParser.parse('ls --all --human-readable -l');
      
      expect(result.command).toBe('ls');
      expect(result.args).toEqual([]);
      expect(result.flags).toEqual({
        all: true,
        'human-readable': true,
        l: true,
      });
    });

    it('should handle extra whitespace', () => {
      const result = CommandParser.parse('  ls   -a   /home  ');
      
      expect(result.command).toBe('ls');
      expect(result.args).toEqual(['/home']);
      expect(result.flags).toEqual({ a: true });
      expect(result.rawInput).toBe('ls   -a   /home');
    });

    it('should handle empty input', () => {
      const result = CommandParser.parse('');
      
      expect(result.command).toBe('');
      expect(result.args).toEqual([]);
      expect(result.flags).toEqual({});
    });

    it('should handle command with quoted arguments', () => {
      // Note: Current implementation doesn't handle quotes specially
      const result = CommandParser.parse('echo "hello world"');
      
      expect(result.command).toBe('echo');
      expect(result.args).toEqual(['"hello', 'world"']);
    });

    it('should parse complex command', () => {
      const result = CommandParser.parse('find /home -name test.txt --type=file -v');
      
      expect(result.command).toBe('find');
      expect(result.args).toEqual(['/home', 'test.txt']);
      expect(result.flags).toEqual({
        name: true,
        type: 'file',
        v: true,
      });
    });
  });

  describe('isClientSideCommand', () => {
    it('should identify clear as client command', () => {
      expect(CommandParser.isClientSideCommand('clear')).toBe(true);
    });

    it('should identify cls as client command', () => {
      expect(CommandParser.isClientSideCommand('cls')).toBe(true);
    });

    it('should identify help as client command', () => {
      expect(CommandParser.isClientSideCommand('help')).toBe(true);
    });

    it('should identify history as client command', () => {
      expect(CommandParser.isClientSideCommand('history')).toBe(true);
    });

    it('should identify exit as client command', () => {
      expect(CommandParser.isClientSideCommand('exit')).toBe(true);
    });

    it('should identify about as client command', () => {
      expect(CommandParser.isClientSideCommand('about')).toBe(true);
    });

    it('should identify version as client command', () => {
      expect(CommandParser.isClientSideCommand('version')).toBe(true);
    });

    it('should identify theme as client command', () => {
      expect(CommandParser.isClientSideCommand('theme')).toBe(true);
    });

    it('should identify settings as client command', () => {
      expect(CommandParser.isClientSideCommand('settings')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(CommandParser.isClientSideCommand('CLEAR')).toBe(true);
      expect(CommandParser.isClientSideCommand('Help')).toBe(true);
      expect(CommandParser.isClientSideCommand('HISTORY')).toBe(true);
    });

    it('should not identify system commands as client commands', () => {
      expect(CommandParser.isClientSideCommand('ls')).toBe(false);
      expect(CommandParser.isClientSideCommand('cat')).toBe(false);
      expect(CommandParser.isClientSideCommand('cd')).toBe(false);
    });
  });

  describe('isNaturalLanguage', () => {
    it('should identify questions starting with what', () => {
      expect(CommandParser.isNaturalLanguage('what is the time')).toBe(true);
    });

    it('should identify questions starting with how', () => {
      expect(CommandParser.isNaturalLanguage('how do I create a file')).toBe(true);
    });

    it('should identify questions starting with why', () => {
      expect(CommandParser.isNaturalLanguage('why is this not working')).toBe(true);
    });

    it('should identify questions ending with ?', () => {
      expect(CommandParser.isNaturalLanguage('can you help me?')).toBe(true);
    });

    it('should identify show me commands', () => {
      expect(CommandParser.isNaturalLanguage('show me all files')).toBe(true);
    });

    it('should identify tell me commands', () => {
      expect(CommandParser.isNaturalLanguage('tell me about this directory')).toBe(true);
    });

    it('should identify explain commands', () => {
      expect(CommandParser.isNaturalLanguage('explain this code')).toBe(true);
    });

    it('should identify find commands', () => {
      expect(CommandParser.isNaturalLanguage('find all text files')).toBe(true);
    });

    it('should identify create commands', () => {
      expect(CommandParser.isNaturalLanguage('create a new file')).toBe(true);
    });

    it('should identify make commands', () => {
      expect(CommandParser.isNaturalLanguage('make a directory')).toBe(true);
    });

    it('should identify generate commands', () => {
      expect(CommandParser.isNaturalLanguage('generate a report')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(CommandParser.isNaturalLanguage('WHAT is this')).toBe(true);
      expect(CommandParser.isNaturalLanguage('How does this work')).toBe(true);
    });

    it('should not identify system commands as natural language', () => {
      expect(CommandParser.isNaturalLanguage('ls -la')).toBe(false);
      expect(CommandParser.isNaturalLanguage('cat file.txt')).toBe(false);
      expect(CommandParser.isNaturalLanguage('cd /home')).toBe(false);
    });

    it('should not identify client commands as natural language', () => {
      expect(CommandParser.isNaturalLanguage('clear')).toBe(false);
      expect(CommandParser.isNaturalLanguage('help')).toBe(false);
    });
  });

  describe('getCommandType', () => {
    it('should identify client commands', () => {
      expect(CommandParser.getCommandType('clear')).toBe('client');
      expect(CommandParser.getCommandType('help')).toBe('client');
      expect(CommandParser.getCommandType('history')).toBe('client');
      expect(CommandParser.getCommandType('theme dark')).toBe('client');
    });

    it('should identify natural language commands', () => {
      expect(CommandParser.getCommandType('what is this')).toBe('natural');
      expect(CommandParser.getCommandType('how do I list files')).toBe('natural');
      expect(CommandParser.getCommandType('create a file for me')).toBe('natural');
      expect(CommandParser.getCommandType('can you help?')).toBe('natural');
    });

    it('should identify system commands', () => {
      expect(CommandParser.getCommandType('ls')).toBe('system');
      expect(CommandParser.getCommandType('cat file.txt')).toBe('system');
      expect(CommandParser.getCommandType('cd /home')).toBe('system');
      expect(CommandParser.getCommandType('pwd')).toBe('system');
    });

    it('should prioritize client commands over natural language', () => {
      // Even if "help" could be interpreted as natural language,
      // it should be identified as client command
      expect(CommandParser.getCommandType('help')).toBe('client');
    });

    it('should handle empty input', () => {
      expect(CommandParser.getCommandType('')).toBe('system');
    });

    it('should handle complex commands', () => {
      expect(CommandParser.getCommandType('ls -la /home')).toBe('system');
      expect(CommandParser.getCommandType('help commands')).toBe('client');
      expect(CommandParser.getCommandType('show me all files in /home')).toBe('natural');
    });
  });

  describe('Edge cases', () => {
    it('should handle commands with only flags', () => {
      const result = CommandParser.parse('--help');
      
      expect(result.command).toBe('--help');
      expect(result.args).toEqual([]);
      expect(result.flags).toEqual({});
    });

    it('should handle single character command', () => {
      const result = CommandParser.parse('a');
      
      expect(result.command).toBe('a');
      expect(result.args).toEqual([]);
    });

    it('should handle numeric arguments', () => {
      const result = CommandParser.parse('head -n 10 file.txt');
      
      expect(result.command).toBe('head');
      expect(result.args).toEqual(['file.txt']);
      expect(result.flags).toEqual({ n: '10' });
    });

    it('should handle paths with special characters', () => {
      const result = CommandParser.parse('cd /home/user/my-folder');
      
      expect(result.command).toBe('cd');
      expect(result.args).toEqual(['/home/user/my-folder']);
    });

    it('should handle multiple consecutive flags', () => {
      const result = CommandParser.parse('ls -a -l -h');
      
      expect(result.command).toBe('ls');
      expect(result.flags).toEqual({ a: true, l: true, h: true });
    });
  });
});
