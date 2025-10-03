import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DebugProtocol } from './debugProtocol';

describe('Debug Protocol', () => {
  let protocol: DebugProtocol;

  beforeEach(() => {
    protocol = new DebugProtocol();
  });

  describe('Connection', () => {
    it('should connect to debugger', async () => {
      await protocol.connect('ws://localhost:9229');
      
      expect(protocol.isConnected()).toBe(true);
    });

    it('should disconnect from debugger', async () => {
      await protocol.connect('ws://localhost:9229');
      await protocol.disconnect();
      
      expect(protocol.isConnected()).toBe(false);
    });

    it('should handle connection error', async () => {
      await expect(protocol.connect('ws://invalid:9999')).rejects.toThrow();
    });

    it('should reconnect after disconnect', async () => {
      await protocol.connect('ws://localhost:9229');
      await protocol.disconnect();
      await protocol.connect('ws://localhost:9229');
      
      expect(protocol.isConnected()).toBe(true);
    });
  });

  describe('Breakpoints', () => {
    beforeEach(async () => {
      await protocol.connect('ws://localhost:9229');
    });

    it('should set breakpoint', async () => {
      const breakpoint = await protocol.setBreakpoint({
        file: 'test.js',
        line: 10,
      });
      
      expect(breakpoint).toHaveProperty('id');
      expect(breakpoint.file).toBe('test.js');
      expect(breakpoint.line).toBe(10);
    });

    it('should remove breakpoint', async () => {
      const breakpoint = await protocol.setBreakpoint({
        file: 'test.js',
        line: 10,
      });
      
      await protocol.removeBreakpoint(breakpoint.id);
      
      const breakpoints = await protocol.getBreakpoints();
      expect(breakpoints).not.toContainEqual(breakpoint);
    });

    it('should set conditional breakpoint', async () => {
      const breakpoint = await protocol.setBreakpoint({
        file: 'test.js',
        line: 10,
        condition: 'x > 5',
      });
      
      expect(breakpoint.condition).toBe('x > 5');
    });

    it('should enable/disable breakpoint', async () => {
      const breakpoint = await protocol.setBreakpoint({
        file: 'test.js',
        line: 10,
      });
      
      await protocol.disableBreakpoint(breakpoint.id);
      let bp = await protocol.getBreakpoint(breakpoint.id);
      expect(bp.enabled).toBe(false);
      
      await protocol.enableBreakpoint(breakpoint.id);
      bp = await protocol.getBreakpoint(breakpoint.id);
      expect(bp.enabled).toBe(true);
    });
  });

  describe('Execution Control', () => {
    beforeEach(async () => {
      await protocol.connect('ws://localhost:9229');
    });

    it('should pause execution', async () => {
      await protocol.pause();
      
      const state = await protocol.getExecutionState();
      expect(state).toBe('paused');
    });

    it('should resume execution', async () => {
      await protocol.pause();
      await protocol.resume();
      
      const state = await protocol.getExecutionState();
      expect(state).toBe('running');
    });

    it('should step over', async () => {
      await protocol.pause();
      const initialLine = await protocol.getCurrentLine();
      
      await protocol.stepOver();
      
      const newLine = await protocol.getCurrentLine();
      expect(newLine).not.toBe(initialLine);
    });

    it('should step into', async () => {
      await protocol.pause();
      await protocol.stepInto();
      
      const callStack = await protocol.getCallStack();
      expect(callStack.length).toBeGreaterThan(0);
    });

    it('should step out', async () => {
      await protocol.pause();
      const initialStackDepth = (await protocol.getCallStack()).length;
      
      await protocol.stepOut();
      
      const newStackDepth = (await protocol.getCallStack()).length;
      expect(newStackDepth).toBeLessThan(initialStackDepth);
    });
  });

  describe('Call Stack', () => {
    beforeEach(async () => {
      await protocol.connect('ws://localhost:9229');
      await protocol.pause();
    });

    it('should get call stack', async () => {
      const callStack = await protocol.getCallStack();
      
      expect(Array.isArray(callStack)).toBe(true);
      expect(callStack[0]).toHaveProperty('function');
      expect(callStack[0]).toHaveProperty('file');
      expect(callStack[0]).toHaveProperty('line');
    });

    it('should get stack frame details', async () => {
      const callStack = await protocol.getCallStack();
      const frame = await protocol.getStackFrame(callStack[0].id);
      
      expect(frame).toHaveProperty('locals');
      expect(frame).toHaveProperty('arguments');
    });
  });

  describe('Variables', () => {
    beforeEach(async () => {
      await protocol.connect('ws://localhost:9229');
      await protocol.pause();
    });

    it('should get local variables', async () => {
      const variables = await protocol.getLocalVariables();
      
      expect(typeof variables).toBe('object');
    });

    it('should get global variables', async () => {
      const variables = await protocol.getGlobalVariables();
      
      expect(typeof variables).toBe('object');
    });

    it('should evaluate expression', async () => {
      const result = await protocol.evaluate('2 + 2');
      
      expect(result.value).toBe(4);
    });

    it('should handle evaluation error', async () => {
      await expect(protocol.evaluate('invalid.expression')).rejects.toThrow();
    });

    it('should get object properties', async () => {
      const result = await protocol.evaluate('({ a: 1, b: 2 })');
      const properties = await protocol.getObjectProperties(result.objectId);
      
      expect(properties).toHaveProperty('a');
      expect(properties).toHaveProperty('b');
    });
  });

  describe('Source Code', () => {
    beforeEach(async () => {
      await protocol.connect('ws://localhost:9229');
    });

    it('should get source code', async () => {
      const source = await protocol.getSource('test.js');
      
      expect(typeof source).toBe('string');
    });

    it('should get source map', async () => {
      const sourceMap = await protocol.getSourceMap('test.js');
      
      expect(sourceMap).toHaveProperty('mappings');
    });

    it('should resolve source location', async () => {
      const location = await protocol.resolveSourceLocation('test.ts', 10);
      
      expect(location).toHaveProperty('file');
      expect(location).toHaveProperty('line');
    });
  });

  describe('Console', () => {
    beforeEach(async () => {
      await protocol.connect('ws://localhost:9229');
    });

    it('should receive console messages', async () => {
      const messages: any[] = [];
      
      protocol.on('console', (message) => {
        messages.push(message);
      });
      
      await protocol.evaluate('console.log("test")');
      
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe('test');
    });

    it('should handle different console types', async () => {
      const messages: any[] = [];
      
      protocol.on('console', (message) => {
        messages.push(message);
      });
      
      await protocol.evaluate('console.log("log")');
      await protocol.evaluate('console.error("error")');
      await protocol.evaluate('console.warn("warn")');
      
      expect(messages).toHaveLength(3);
      expect(messages[0].type).toBe('log');
      expect(messages[1].type).toBe('error');
      expect(messages[2].type).toBe('warn');
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      await protocol.connect('ws://localhost:9229');
    });

    it('should emit paused event', async () => {
      let pausedCalled = false;
      
      protocol.on('paused', () => {
        pausedCalled = true;
      });
      
      await protocol.pause();
      
      expect(pausedCalled).toBe(true);
    });

    it('should emit resumed event', async () => {
      let resumedCalled = false;
      
      protocol.on('resumed', () => {
        resumedCalled = true;
      });
      
      await protocol.pause();
      await protocol.resume();
      
      expect(resumedCalled).toBe(true);
    });

    it('should emit breakpoint hit event', async () => {
      let breakpointHit = false;
      
      protocol.on('breakpointHit', () => {
        breakpointHit = true;
      });
      
      await protocol.setBreakpoint({ file: 'test.js', line: 10 });
      // Simulate hitting breakpoint
      
      expect(breakpointHit).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle protocol errors', async () => {
      await protocol.connect('ws://localhost:9229');
      
      await expect(protocol.evaluate('throw new Error("test")')).rejects.toThrow('test');
    });

    it('should handle disconnection during operation', async () => {
      await protocol.connect('ws://localhost:9229');
      await protocol.disconnect();
      
      await expect(protocol.pause()).rejects.toThrow();
    });

    it('should handle invalid breakpoint', async () => {
      await protocol.connect('ws://localhost:9229');
      
      await expect(protocol.setBreakpoint({
        file: 'nonexistent.js',
        line: 10,
      })).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await protocol.connect('ws://localhost:9229');
    });

    it('should handle rapid commands', async () => {
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(protocol.evaluate(`${i} + ${i}`));
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(100);
    });

    it('should handle large call stacks', async () => {
      // Simulate deep recursion
      await protocol.evaluate(`
        function recurse(n) {
          if (n === 0) {
            debugger;
            return;
          }
          recurse(n - 1);
        }
        recurse(100);
      `);
      
      const callStack = await protocol.getCallStack();
      expect(callStack.length).toBeGreaterThan(50);
    });
  });
});
