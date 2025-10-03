/**
 * Debugger Types
 */

export interface Breakpoint {
  id: string;
  line: number;
  enabled: boolean;
  condition?: string;
}

export interface Variable {
  name: string;
  value: any;
  type: string;
  scope: 'local' | 'global' | 'closure';
}

export interface CallStackFrame {
  id: string;
  functionName: string;
  line: number;
  column: number;
}

export interface DebuggerState {
  isRunning: boolean;
  isPaused: boolean;
  currentLine: number | null;
  breakpoints: Breakpoint[];
  variables: Variable[];
  callStack: CallStackFrame[];
  output: string[];
  error: string | null;
}

export type DebuggerAction =
  | 'run'
  | 'pause'
  | 'step-over'
  | 'step-into'
  | 'step-out'
  | 'stop'
  | 'continue';
