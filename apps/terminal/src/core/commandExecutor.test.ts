import { describe, it, expect } from 'vitest';
import { executeCommand } from './commandExecutor';

describe('Command Executor', () => {
  describe('Command Parsing', () => {
    it('should execute help command', async () => {
      const result = await executeCommand('help');
      
      expect(result.type).toBe('info');
      expect(result.message).toContain('AuraOS Command Reference');
    });

    it('should execute clear command', async () => {
      const result = await executeCommand('clear');
      
      expect(result.type).toBe('clear');
    });

    it('should execute echo command', async () => {
      const result = await executeCommand('echo Hello World');
      
      expect(result.type).toBe('success');
      expect(result.message).toBe('Hello World');
    });

    it('should handle unknown commands', async () => {
      const result = await executeCommand('unknowncommand');
      
      expect(result.type).toBe('error');
      expect(result.message).toContain('Command not found');
    });

    it('should handle empty commands', async () => {
      const result = await executeCommand('');
      
      expect(result.type).toBe('error');
    });
  });

  describe('Command with Arguments', () => {
    it('should parse command with single argument', async () => {
      const result = await executeCommand('echo test');
      
      expect(result.type).toBe('success');
      expect(result.message).toBe('test');
    });

    it('should parse command with multiple arguments', async () => {
      const result = await executeCommand('echo hello world test');
      
      expect(result.type).toBe('success');
      expect(result.message).toBe('hello world test');
    });

    it('should handle quoted arguments', async () => {
      const result = await executeCommand('echo "hello world"');
      
      expect(result.type).toBe('success');
      expect(result.message).toContain('hello world');
    });
  });

  describe('System Commands', () => {
    it('should execute date command', async () => {
      const result = await executeCommand('date');
      
      expect(result.type).toBe('success');
      expect(result.message).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should execute whoami command', async () => {
      const result = await executeCommand('whoami');
      
      expect(result.type).toBe('success');
      expect(result.message).toBe('aura');
    });

    it('should execute version command', async () => {
      const result = await executeCommand('version');
      
      expect(result.type).toBe('success');
      expect(result.message).toContain('AuraOS');
    });
  });
});
