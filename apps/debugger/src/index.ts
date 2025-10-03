/**
 * AuraOS Debugger App
 * Visual debugger for BASIC programs and 6502 emulator
 */

export { DebuggerApp } from './components/DebuggerApp';
export { CPUViewer } from './components/CPUViewer';
export { MemoryViewer } from './components/MemoryViewer';
export { BreakpointManager } from './components/BreakpointManager';
export { CallStack } from './components/CallStack';
export { VariableInspector } from './components/VariableInspector';

export type {
  DebuggerState,
  Breakpoint,
  CPUState,
  MemoryState,
  CallStackFrame,
  Variable,
  DebuggerSettings
} from './types';

export { useDebugger } from './hooks/useDebugger';
export { useBreakpoints } from './hooks/useBreakpoints';
export { useCPUState } from './hooks/useCPUState';
export { useMemoryState } from './hooks/useMemoryState';