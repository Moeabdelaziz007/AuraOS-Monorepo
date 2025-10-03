/**
 * Command Parser Types
 * Type definitions for the AuraOS command system
 */

export type CommandResultType = 'success' | 'error' | 'info' | 'warning';

export interface CommandResult {
  type: CommandResultType;
  message: string | object;
  data?: any;
  timestamp?: number;
}

export interface CommandContext {
  currentDirectory: string;
  user: string;
  environment: Record<string, string>;
  history: string[];
}

export type CommandHandler = (
  args: string[],
  context: CommandContext
) => Promise<CommandResult> | CommandResult;

export interface CommandDefinition {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
  handler: CommandHandler;
  category: 'system' | 'file' | 'ai' | 'automation' | 'process';
}

export interface CommandRegistry {
  [key: string]: CommandDefinition;
}
