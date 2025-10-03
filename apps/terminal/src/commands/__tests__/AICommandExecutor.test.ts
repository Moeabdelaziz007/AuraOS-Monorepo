/**
 * Tests for AICommandExecutor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AICommandExecutor } from '../AICommandExecutor';
import { CommandParser } from '../CommandParser';
import { createMockMCP, resetMocks } from './test-utils';

describe('AICommandExecutor', () => {
  let executor: AICommandExecutor;
  let mockMCP: ReturnType<typeof createMockMCP>;

  beforeEach(() => {
    mockMCP = createMockMCP();
    executor = new AICommandExecutor(mockMCP);
    resetMocks(mockMCP);
  });

  describe('executeNaturalLanguage', () => {
    it('should execute natural language command via AI', async () => {
      mockMCP.ai.chat.mockResolvedValue('Here are the files in your directory');

      const result = await executor.executeNaturalLanguage('show me all files');

      expect(mockMCP.ai.chat).toHaveBeenCalledWith(
        'show me all files',
        expect.objectContaining({
          currentDirectory: expect.any(String),
          context: 'terminal',
        })
      );
      expect(result.output).toBe('Here are the files in your directory');
      expect(result.exitCode).toBe(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle AI errors gracefully', async () => {
      mockMCP.ai.chat.mockRejectedValue(new Error('AI service unavailable'));

      const result = await executor.executeNaturalLanguage('what is this');

      expect(result.exitCode).toBe(1);
      expect(result.error).toBe('AI service unavailable');
      expect(result.output).toBe('');
    });

    it('should pass current directory context', async () => {
      mockMCP.ai.chat.mockResolvedValue('Response');

      await executor.executeNaturalLanguage('list files');

      expect(mockMCP.ai.chat).toHaveBeenCalledWith(
        'list files',
        expect.objectContaining({
          currentDirectory: '/home/user',
        })
      );
    });

    it('should measure execution duration', async () => {
      mockMCP.ai.chat.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('Response'), 10))
      );

      const result = await executor.executeNaturalLanguage('test');

      expect(result.duration).toBeGreaterThan(0);
    });
  });

  describe('executeSystemCommand - ls/dir', () => {
    it('should list directory contents', async () => {
      mockMCP.file.list.mockResolvedValue('file1.txt\nfile2.txt\ndir1/');
      const parsed = CommandParser.parse('ls');

      const result = await executor.executeSystemCommand(parsed);

      expect(mockMCP.file.list).toHaveBeenCalledWith('.');
      expect(result.output).toBe('file1.txt\nfile2.txt\ndir1/');
      expect(result.exitCode).toBe(0);
    });

    it('should list specific directory', async () => {
      mockMCP.file.list.mockResolvedValue('contents');
      const parsed = CommandParser.parse('ls /home');

      await executor.executeSystemCommand(parsed);

      expect(mockMCP.file.list).toHaveBeenCalledWith('/home');
    });

    it('should handle dir command', async () => {
      mockMCP.file.list.mockResolvedValue('contents');
      const parsed = CommandParser.parse('dir');

      const result = await executor.executeSystemCommand(parsed);

      expect(mockMCP.file.list).toHaveBeenCalled();
      expect(result.exitCode).toBe(0);
    });

    it('should handle list errors', async () => {
      mockMCP.file.list.mockRejectedValue(new Error('Permission denied'));
      const parsed = CommandParser.parse('ls /root');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('Permission denied');
    });
  });

  describe('executeSystemCommand - cd', () => {
    it('should change directory', async () => {
      const parsed = CommandParser.parse('cd /home/user');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('/home/user');
    });

    it('should default to home directory', async () => {
      const parsed = CommandParser.parse('cd');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(0);
    });
  });

  describe('executeSystemCommand - pwd', () => {
    it('should print working directory', async () => {
      const parsed = CommandParser.parse('pwd');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.output).toBe('/home/user');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('executeSystemCommand - cat', () => {
    it('should read file contents', async () => {
      mockMCP.file.read.mockResolvedValue('File contents here');
      const parsed = CommandParser.parse('cat test.txt');

      const result = await executor.executeSystemCommand(parsed);

      expect(mockMCP.file.read).toHaveBeenCalledWith('test.txt');
      expect(result.output).toBe('File contents here');
      expect(result.exitCode).toBe(0);
    });

    it('should require file argument', async () => {
      const parsed = CommandParser.parse('cat');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('missing file operand');
    });

    it('should handle read errors', async () => {
      mockMCP.file.read.mockRejectedValue(new Error('File not found'));
      const parsed = CommandParser.parse('cat missing.txt');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toBeDefined();
    });
  });

  describe('executeSystemCommand - echo', () => {
    it('should echo arguments', async () => {
      const parsed = CommandParser.parse('echo hello world');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.output).toBe('hello world');
      expect(result.exitCode).toBe(0);
    });

    it('should handle empty echo', async () => {
      const parsed = CommandParser.parse('echo');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.output).toBe('');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('executeSystemCommand - mkdir', () => {
    it('should create directory', async () => {
      const parsed = CommandParser.parse('mkdir newdir');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.output).toContain('Directory created');
      expect(result.output).toContain('newdir');
      expect(result.exitCode).toBe(0);
    });

    it('should require directory argument', async () => {
      const parsed = CommandParser.parse('mkdir');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('missing directory operand');
    });
  });

  describe('executeSystemCommand - rm', () => {
    it('should delete file', async () => {
      mockMCP.file.delete.mockResolvedValue('File deleted');
      const parsed = CommandParser.parse('rm test.txt');

      const result = await executor.executeSystemCommand(parsed);

      expect(mockMCP.file.delete).toHaveBeenCalledWith('test.txt');
      expect(result.output).toBe('File deleted');
      expect(result.exitCode).toBe(0);
    });

    it('should require file argument', async () => {
      const parsed = CommandParser.parse('rm');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('missing file operand');
    });
  });

  describe('executeSystemCommand - cp', () => {
    it('should copy file', async () => {
      const parsed = CommandParser.parse('cp source.txt dest.txt');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.output).toContain('Copied');
      expect(result.output).toContain('source.txt');
      expect(result.output).toContain('dest.txt');
      expect(result.exitCode).toBe(0);
    });

    it('should require source and destination', async () => {
      const parsed = CommandParser.parse('cp source.txt');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('missing source or destination');
    });
  });

  describe('executeSystemCommand - mv', () => {
    it('should move file', async () => {
      const parsed = CommandParser.parse('mv old.txt new.txt');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.output).toContain('Moved');
      expect(result.output).toContain('old.txt');
      expect(result.output).toContain('new.txt');
      expect(result.exitCode).toBe(0);
    });

    it('should require source and destination', async () => {
      const parsed = CommandParser.parse('mv old.txt');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('missing source or destination');
    });
  });

  describe('executeSystemCommand - run (BASIC)', () => {
    it('should execute BASIC code', async () => {
      mockMCP.emulator.run.mockResolvedValue({
        output: 'HELLO WORLD',
        success: true,
        explanation: 'Program executed successfully',
      });
      const parsed = CommandParser.parse('run 10 PRINT "HELLO WORLD"');

      const result = await executor.executeSystemCommand(parsed);

      expect(mockMCP.emulator.run).toHaveBeenCalled();
      expect(result.output).toContain('HELLO WORLD');
      expect(result.output).toContain('Program executed successfully');
      expect(result.exitCode).toBe(0);
    });

    it('should require code argument', async () => {
      const parsed = CommandParser.parse('run');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('missing code to execute');
    });
  });

  describe('executeSystemCommand - load/save/list', () => {
    it('should load program', async () => {
      const parsed = CommandParser.parse('load program.bas');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.output).toContain('Loaded program');
      expect(result.output).toContain('program.bas');
      expect(result.exitCode).toBe(0);
    });

    it('should save program', async () => {
      const parsed = CommandParser.parse('save program.bas');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.output).toContain('Saved program');
      expect(result.output).toContain('program.bas');
      expect(result.exitCode).toBe(0);
    });

    it('should list program', async () => {
      const parsed = CommandParser.parse('list');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.output).toContain('No program loaded');
      expect(result.exitCode).toBe(0);
    });

    it('should require filename for load', async () => {
      const parsed = CommandParser.parse('load');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('missing file name');
    });

    it('should require filename for save', async () => {
      const parsed = CommandParser.parse('save');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('missing file name');
    });
  });

  describe('executeSystemCommand - unknown command', () => {
    it('should fallback to natural language for unknown commands', async () => {
      mockMCP.ai.chat.mockResolvedValue('AI interpreted command');
      const parsed = CommandParser.parse('unknown-command arg1');

      const result = await executor.executeSystemCommand(parsed);

      expect(mockMCP.ai.chat).toHaveBeenCalled();
      expect(result.output).toBe('AI interpreted command');
    });
  });

  describe('Error handling', () => {
    it('should handle MCP errors gracefully', async () => {
      mockMCP.file.list.mockRejectedValue(new Error('Network error'));
      const parsed = CommandParser.parse('ls');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toBeDefined();
    });

    it('should include error message in result', async () => {
      mockMCP.file.read.mockRejectedValue(new Error('Permission denied'));
      const parsed = CommandParser.parse('cat /root/secret.txt');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.error).toContain('Permission denied');
    });

    it('should handle non-Error exceptions', async () => {
      mockMCP.file.list.mockRejectedValue('String error');
      const parsed = CommandParser.parse('ls');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.exitCode).toBe(1);
      expect(result.error).toBe('Command execution failed');
    });
  });

  describe('Performance', () => {
    it('should measure execution duration', async () => {
      const parsed = CommandParser.parse('echo test');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result.duration).toBe('number');
    });

    it('should include duration even on error', async () => {
      const parsed = CommandParser.parse('cat');

      const result = await executor.executeSystemCommand(parsed);

      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
