/**
 * AuraOS Terminal App
 * AI-powered terminal with MCP integration
 */

export { TerminalApp } from './components/TerminalApp';
export { TerminalEmulator } from './components/TerminalEmulator';

export type {
  TerminalConfig,
  Command,
  CommandResult,
  TerminalTheme,
  TerminalSettings,
  EmulatorState,
  BasicCommand
} from './types';

export { useTerminal } from './hooks/useTerminal';
export { useCommandHistory } from './hooks/useCommandHistory';
export { useAutoComplete } from './hooks/useAutoComplete';

export { CommandParser } from './commands/CommandParser';
export { ClientCommands } from './commands/ClientCommands';
export { AICommandExecutor } from './commands/AICommandExecutor';