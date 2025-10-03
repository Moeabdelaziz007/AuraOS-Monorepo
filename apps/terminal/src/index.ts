/**
 * AuraOS Terminal App
 * Terminal emulator with BASIC interpreter integration
 */

export { TerminalApp } from './components/TerminalApp';
export { TerminalEmulator } from './components/TerminalEmulator';
export { CommandHistory } from './components/CommandHistory';
export { AutoComplete } from './components/AutoComplete';

export type {
  TerminalConfig,
  Command,
  CommandResult,
  TerminalTheme,
  TerminalSettings
} from './types';

export { useTerminal } from './hooks/useTerminal';
export { useCommandHistory } from './hooks/useCommandHistory';
export { useAutoComplete } from './hooks/useAutoComplete';