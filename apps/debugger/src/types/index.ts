/**
 * Debugger App Types
 */

export interface DebuggerState {
  running: boolean;
  paused: boolean;
  stepping: boolean;
  currentLine: number;
  program: string;
  breakpoints: Breakpoint[];
  callStack: CallStackFrame[];
  variables: Variable[];
}

export interface Breakpoint {
  id: string;
  line: number;
  condition?: string;
  enabled: boolean;
  hitCount: number;
  lastHit?: Date;
}

export interface CPUState {
  pc: number; // Program Counter
  sp: number; // Stack Pointer
  a: number;  // Accumulator
  x: number;  // X Register
  y: number;  // Y Register
  flags: {
    carry: boolean;
    zero: boolean;
    interrupt: boolean;
    decimal: boolean;
    break: boolean;
    overflow: boolean;
    negative: boolean;
  };
  cycles: number;
  frequency: number;
}

export interface MemoryState {
  size: number;
  used: number;
  regions: MemoryRegion[];
  data: number[];
}

export interface MemoryRegion {
  start: number;
  end: number;
  type: 'ram' | 'rom' | 'io' | 'reserved';
  writable: boolean;
  name?: string;
}

export interface CallStackFrame {
  id: string;
  function: string;
  line: number;
  variables: Variable[];
  returnAddress: number;
}

export interface Variable {
  name: string;
  value: any;
  type: 'number' | 'string' | 'array' | 'object' | 'function';
  scope: 'global' | 'local' | 'parameter';
  address?: number;
  size?: number;
}

export interface DebuggerSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  showHex: boolean;
  showDisassembly: boolean;
  autoStep: boolean;
  stepDelay: number;
  maxCallStack: number;
  memoryViewSize: number;
}

export interface DisassemblyLine {
  address: number;
  opcode: string;
  operand: string;
  mnemonic: string;
  bytes: number[];
  cycles: number;
}

export interface WatchExpression {
  id: string;
  expression: string;
  value: any;
  type: string;
  error?: string;
}
