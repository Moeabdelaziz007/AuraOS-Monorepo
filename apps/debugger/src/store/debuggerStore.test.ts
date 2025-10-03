import { describe, it, expect, beforeEach } from 'vitest';
import { useDebuggerStore } from './debuggerStore';

describe('Debugger Store', () => {
  beforeEach(() => {
    const { reset } = useDebuggerStore.getState();
    reset();
  });

  describe('Breakpoints', () => {
    it('should add breakpoint', () => {
      const { addBreakpoint, getBreakpoints } = useDebuggerStore.getState();
      
      addBreakpoint({ file: 'test.js', line: 10 });
      
      const breakpoints = getBreakpoints();
      expect(breakpoints).toHaveLength(1);
      expect(breakpoints[0]).toMatchObject({ file: 'test.js', line: 10 });
    });

    it('should remove breakpoint', () => {
      const { addBreakpoint, removeBreakpoint, getBreakpoints } = useDebuggerStore.getState();
      
      const bp = addBreakpoint({ file: 'test.js', line: 10 });
      removeBreakpoint(bp.id);
      
      expect(getBreakpoints()).toHaveLength(0);
    });

    it('should toggle breakpoint enabled state', () => {
      const { addBreakpoint, toggleBreakpoint, getBreakpoints } = useDebuggerStore.getState();
      
      const bp = addBreakpoint({ file: 'test.js', line: 10 });
      toggleBreakpoint(bp.id);
      
      const breakpoints = getBreakpoints();
      expect(breakpoints[0].enabled).toBe(false);
      
      toggleBreakpoint(bp.id);
      expect(getBreakpoints()[0].enabled).toBe(true);
    });

    it('should get breakpoints by file', () => {
      const { addBreakpoint, getBreakpointsByFile } = useDebuggerStore.getState();
      
      addBreakpoint({ file: 'test1.js', line: 10 });
      addBreakpoint({ file: 'test1.js', line: 20 });
      addBreakpoint({ file: 'test2.js', line: 15 });
      
      const test1Breakpoints = getBreakpointsByFile('test1.js');
      expect(test1Breakpoints).toHaveLength(2);
    });

    it('should set conditional breakpoint', () => {
      const { addBreakpoint, getBreakpoints } = useDebuggerStore.getState();
      
      addBreakpoint({
        file: 'test.js',
        line: 10,
        condition: 'x > 5',
      });
      
      const breakpoints = getBreakpoints();
      expect(breakpoints[0].condition).toBe('x > 5');
    });

    it('should set hit count breakpoint', () => {
      const { addBreakpoint, getBreakpoints } = useDebuggerStore.getState();
      
      addBreakpoint({
        file: 'test.js',
        line: 10,
        hitCount: 3,
      });
      
      const breakpoints = getBreakpoints();
      expect(breakpoints[0].hitCount).toBe(3);
    });
  });

  describe('Debug Session', () => {
    it('should start debug session', () => {
      const { startSession, getSessionState } = useDebuggerStore.getState();
      
      startSession();
      
      expect(getSessionState()).toBe('running');
    });

    it('should pause debug session', () => {
      const { startSession, pauseSession, getSessionState } = useDebuggerStore.getState();
      
      startSession();
      pauseSession();
      
      expect(getSessionState()).toBe('paused');
    });

    it('should stop debug session', () => {
      const { startSession, stopSession, getSessionState } = useDebuggerStore.getState();
      
      startSession();
      stopSession();
      
      expect(getSessionState()).toBe('stopped');
    });

    it('should track session duration', () => {
      const { startSession, getSessionDuration } = useDebuggerStore.getState();
      
      startSession();
      
      setTimeout(() => {
        const duration = getSessionDuration();
        expect(duration).toBeGreaterThan(0);
      }, 100);
    });
  });

  describe('Call Stack', () => {
    it('should set call stack', () => {
      const { setCallStack, getCallStack } = useDebuggerStore.getState();
      
      const stack = [
        { function: 'main', file: 'app.js', line: 10 },
        { function: 'helper', file: 'utils.js', line: 5 },
      ];
      
      setCallStack(stack);
      
      expect(getCallStack()).toEqual(stack);
    });

    it('should get current frame', () => {
      const { setCallStack, getCurrentFrame } = useDebuggerStore.getState();
      
      const stack = [
        { function: 'main', file: 'app.js', line: 10 },
        { function: 'helper', file: 'utils.js', line: 5 },
      ];
      
      setCallStack(stack);
      
      expect(getCurrentFrame()).toEqual(stack[0]);
    });

    it('should select stack frame', () => {
      const { setCallStack, selectFrame, getSelectedFrame } = useDebuggerStore.getState();
      
      const stack = [
        { function: 'main', file: 'app.js', line: 10 },
        { function: 'helper', file: 'utils.js', line: 5 },
      ];
      
      setCallStack(stack);
      selectFrame(1);
      
      expect(getSelectedFrame()).toEqual(stack[1]);
    });
  });

  describe('Variables', () => {
    it('should set local variables', () => {
      const { setLocalVariables, getLocalVariables } = useDebuggerStore.getState();
      
      const variables = {
        x: { value: 10, type: 'number' },
        name: { value: 'John', type: 'string' },
      };
      
      setLocalVariables(variables);
      
      expect(getLocalVariables()).toEqual(variables);
    });

    it('should set global variables', () => {
      const { setGlobalVariables, getGlobalVariables } = useDebuggerStore.getState();
      
      const variables = {
        window: { value: '[object Window]', type: 'object' },
      };
      
      setGlobalVariables(variables);
      
      expect(getGlobalVariables()).toEqual(variables);
    });

    it('should expand object variable', () => {
      const { setLocalVariables, expandVariable, isVariableExpanded } = useDebuggerStore.getState();
      
      const variables = {
        obj: {
          value: { a: 1, b: 2 },
          type: 'object',
        },
      };
      
      setLocalVariables(variables);
      expandVariable('obj');
      
      expect(isVariableExpanded('obj')).toBe(true);
    });
  });

  describe('Watch Expressions', () => {
    it('should add watch expression', () => {
      const { addWatch, getWatches } = useDebuggerStore.getState();
      
      addWatch('x + y');
      
      const watches = getWatches();
      expect(watches).toHaveLength(1);
      expect(watches[0].expression).toBe('x + y');
    });

    it('should remove watch expression', () => {
      const { addWatch, removeWatch, getWatches } = useDebuggerStore.getState();
      
      const watch = addWatch('x + y');
      removeWatch(watch.id);
      
      expect(getWatches()).toHaveLength(0);
    });

    it('should update watch value', () => {
      const { addWatch, updateWatchValue, getWatches } = useDebuggerStore.getState();
      
      const watch = addWatch('x + y');
      updateWatchValue(watch.id, 15);
      
      const watches = getWatches();
      expect(watches[0].value).toBe(15);
    });

    it('should handle watch evaluation error', () => {
      const { addWatch, updateWatchError, getWatches } = useDebuggerStore.getState();
      
      const watch = addWatch('invalid.expression');
      updateWatchError(watch.id, 'ReferenceError: invalid is not defined');
      
      const watches = getWatches();
      expect(watches[0].error).toBeDefined();
    });
  });

  describe('Console', () => {
    it('should add console message', () => {
      const { addConsoleMessage, getConsoleMessages } = useDebuggerStore.getState();
      
      addConsoleMessage({ type: 'log', message: 'Hello' });
      
      const messages = getConsoleMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe('Hello');
    });

    it('should clear console', () => {
      const { addConsoleMessage, clearConsole, getConsoleMessages } = useDebuggerStore.getState();
      
      addConsoleMessage({ type: 'log', message: 'Test' });
      clearConsole();
      
      expect(getConsoleMessages()).toHaveLength(0);
    });

    it('should filter console messages by type', () => {
      const { addConsoleMessage, getConsoleMessagesByType } = useDebuggerStore.getState();
      
      addConsoleMessage({ type: 'log', message: 'Log message' });
      addConsoleMessage({ type: 'error', message: 'Error message' });
      addConsoleMessage({ type: 'warn', message: 'Warning message' });
      
      const errors = getConsoleMessagesByType('error');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Error message');
    });
  });

  describe('Source Code', () => {
    it('should set source code', () => {
      const { setSourceCode, getSourceCode } = useDebuggerStore.getState();
      
      const code = 'function test() { return 42; }';
      setSourceCode('test.js', code);
      
      expect(getSourceCode('test.js')).toBe(code);
    });

    it('should set current line', () => {
      const { setCurrentLine, getCurrentLine } = useDebuggerStore.getState();
      
      setCurrentLine('test.js', 10);
      
      expect(getCurrentLine()).toEqual({ file: 'test.js', line: 10 });
    });

    it('should highlight execution line', () => {
      const { setCurrentLine, isExecutionLine } = useDebuggerStore.getState();
      
      setCurrentLine('test.js', 10);
      
      expect(isExecutionLine('test.js', 10)).toBe(true);
      expect(isExecutionLine('test.js', 11)).toBe(false);
    });
  });

  describe('Step Operations', () => {
    it('should track step over operation', () => {
      const { stepOver, getLastStepOperation } = useDebuggerStore.getState();
      
      stepOver();
      
      expect(getLastStepOperation()).toBe('stepOver');
    });

    it('should track step into operation', () => {
      const { stepInto, getLastStepOperation } = useDebuggerStore.getState();
      
      stepInto();
      
      expect(getLastStepOperation()).toBe('stepInto');
    });

    it('should track step out operation', () => {
      const { stepOut, getLastStepOperation } = useDebuggerStore.getState();
      
      stepOut();
      
      expect(getLastStepOperation()).toBe('stepOut');
    });

    it('should track continue operation', () => {
      const { continue: continueExecution, getLastStepOperation } = useDebuggerStore.getState();
      
      continueExecution();
      
      expect(getLastStepOperation()).toBe('continue');
    });
  });

  describe('Performance', () => {
    it('should handle many breakpoints', () => {
      const { addBreakpoint, getBreakpoints } = useDebuggerStore.getState();
      
      for (let i = 0; i < 1000; i++) {
        addBreakpoint({ file: 'test.js', line: i });
      }
      
      expect(getBreakpoints()).toHaveLength(1000);
    });

    it('should handle many console messages', () => {
      const { addConsoleMessage, getConsoleMessages } = useDebuggerStore.getState();
      
      for (let i = 0; i < 1000; i++) {
        addConsoleMessage({ type: 'log', message: `Message ${i}` });
      }
      
      expect(getConsoleMessages()).toHaveLength(1000);
    });

    it('should limit console message history', () => {
      const { addConsoleMessage, getConsoleMessages } = useDebuggerStore.getState();
      
      // Add more than max limit (assuming 10000)
      for (let i = 0; i < 15000; i++) {
        addConsoleMessage({ type: 'log', message: `Message ${i}` });
      }
      
      const messages = getConsoleMessages();
      expect(messages.length).toBeLessThanOrEqual(10000);
    });
  });
});
