import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTerminalStore } from './terminalStore';

describe('Terminal Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useTerminalStore());
    act(() => {
      result.current.history.length = 0;
    });
  });

  describe('Command History', () => {
    it('should add command to history', () => {
      const { result } = renderHook(() => useTerminalStore());
      
      act(() => {
        result.current.addToHistory('ls -la');
      });
      
      expect(result.current.history).toContain('ls -la');
      expect(result.current.history).toHaveLength(1);
    });

    it('should add multiple commands to history', () => {
      const { result } = renderHook(() => useTerminalStore());
      
      act(() => {
        result.current.addToHistory('ls');
        result.current.addToHistory('pwd');
        result.current.addToHistory('cd /home');
      });
      
      expect(result.current.history).toHaveLength(3);
      expect(result.current.history).toEqual(['ls', 'pwd', 'cd /home']);
    });

    it('should not add empty commands to history', () => {
      const { result } = renderHook(() => useTerminalStore());
      
      act(() => {
        result.current.addToHistory('');
        result.current.addToHistory('   ');
      });
      
      expect(result.current.history).toHaveLength(0);
    });

    it('should limit history size', () => {
      const { result } = renderHook(() => useTerminalStore());
      
      act(() => {
        // Add more than max history size
        for (let i = 0; i < 150; i++) {
          result.current.addToHistory(`command-${i}`);
        }
      });
      
      // Should keep only last 100 commands
      expect(result.current.history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Current Directory', () => {
    it('should have default directory', () => {
      const { result } = renderHook(() => useTerminalStore());
      
      expect(result.current.currentDirectory).toBe('/home/aura');
    });
  });
});
