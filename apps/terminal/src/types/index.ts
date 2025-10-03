/**
 * Terminal App Types
 */

export interface TerminalConfig {
  rows: number;
  cols: number;
  fontSize: number;
  fontFamily: string;
  theme: TerminalTheme;
  cursorBlink: boolean;
  scrollback: number;
}

export interface Command {
  id: string;
  text: string;
  timestamp: Date;
  result?: CommandResult;
  status: 'pending' | 'success' | 'error' | 'cancelled';
}

export interface CommandResult {
  output: string;
  exitCode: number;
  duration: number;
  error?: string;
}

export interface TerminalTheme {
  name: string;
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  colors: {
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    brightBlack: string;
    brightRed: string;
    brightGreen: string;
    brightYellow: string;
    brightBlue: string;
    brightMagenta: string;
    brightCyan: string;
    brightWhite: string;
  };
}

export interface TerminalSettings {
  theme: string;
  fontSize: number;
  fontFamily: string;
  cursorBlink: boolean;
  scrollback: number;
  autoComplete: boolean;
  historySize: number;
  bellSound: boolean;
  copyOnSelect: boolean;
  rightClickSelectsWord: boolean;
}

export interface BasicCommand {
  name: string;
  description: string;
  syntax: string;
  examples: string[];
  category: 'control' | 'data' | 'io' | 'math' | 'string' | 'system';
}

export interface EmulatorState {
  running: boolean;
  paused: boolean;
  program: string;
  variables: Record<string, any>;
  memory: number[];
  registers: {
    pc: number;
    sp: number;
    a: number;
    x: number;
    y: number;
  };
}
