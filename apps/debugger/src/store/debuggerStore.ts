import { create } from 'zustand';
import type { Breakpoint, Variable, CallStackFrame } from '../types';

interface DebuggerStore {
  // Code
  code: string;
  setCode: (code: string) => void;

  // Execution state
  isRunning: boolean;
  isPaused: boolean;
  currentLine: number | null;
  setIsRunning: (isRunning: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  setCurrentLine: (line: number | null) => void;

  // Breakpoints
  breakpoints: Breakpoint[];
  addBreakpoint: (line: number) => void;
  removeBreakpoint: (id: string) => void;
  toggleBreakpoint: (id: string) => void;
  clearBreakpoints: () => void;

  // Variables
  variables: Variable[];
  setVariables: (variables: Variable[]) => void;

  // Call stack
  callStack: CallStackFrame[];
  setCallStack: (callStack: CallStackFrame[]) => void;

  // Output
  output: string[];
  addOutput: (message: string) => void;
  clearOutput: () => void;

  // Error
  error: string | null;
  setError: (error: string | null) => void;

  // Actions
  reset: () => void;
}

export const useDebuggerStore = create<DebuggerStore>((set) => ({
  // Code
  code: `// Welcome to AuraOS Debugger
// Write your JavaScript code here and debug it!

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci sequence:');
for (let i = 0; i < 10; i++) {
  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
}`,
  setCode: (code) => set({ code }),

  // Execution state
  isRunning: false,
  isPaused: false,
  currentLine: null,
  setIsRunning: (isRunning) => set({ isRunning }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setCurrentLine: (currentLine) => set({ currentLine }),

  // Breakpoints
  breakpoints: [],
  addBreakpoint: (line) =>
    set((state) => ({
      breakpoints: [
        ...state.breakpoints,
        {
          id: `bp-${Date.now()}`,
          line,
          enabled: true,
        },
      ],
    })),
  removeBreakpoint: (id) =>
    set((state) => ({
      breakpoints: state.breakpoints.filter((bp) => bp.id !== id),
    })),
  toggleBreakpoint: (id) =>
    set((state) => ({
      breakpoints: state.breakpoints.map((bp) =>
        bp.id === id ? { ...bp, enabled: !bp.enabled } : bp
      ),
    })),
  clearBreakpoints: () => set({ breakpoints: [] }),

  // Variables
  variables: [],
  setVariables: (variables) => set({ variables }),

  // Call stack
  callStack: [],
  setCallStack: (callStack) => set({ callStack }),

  // Output
  output: [],
  addOutput: (message) =>
    set((state) => ({
      output: [...state.output, message],
    })),
  clearOutput: () => set({ output: [] }),

  // Error
  error: null,
  setError: (error) => set({ error }),

  // Actions
  reset: () =>
    set({
      isRunning: false,
      isPaused: false,
      currentLine: null,
      variables: [],
      callStack: [],
      output: [],
      error: null,
    }),
}));
