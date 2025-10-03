/**
 * Command Parser
 * Core command parsing and execution engine for AuraOS
 */

import type {
  CommandResult,
  CommandContext,
  CommandRegistry,
  CommandDefinition,
} from './types';
import { systemCommands } from './commands/system';
import { fileCommands } from './commands/file';
import { aiCommands } from './commands/ai';
import { automationCommands } from './commands/automation';

export class CommandParser {
  private registry: CommandRegistry = {};
  private context: CommandContext;

  constructor(initialContext?: Partial<CommandContext>) {
    this.context = {
      currentDirectory: initialContext?.currentDirectory || '/home/aura',
      user: initialContext?.user || 'aura',
      environment: initialContext?.environment || {},
      history: initialContext?.history || [],
    };

    // Register built-in commands
    this.registerCommands(systemCommands);
    this.registerCommands(fileCommands);
    this.registerCommands(aiCommands);
    this.registerCommands(automationCommands);
  }

  /**
   * Register commands from a command set
   */
  private registerCommands(commands: CommandDefinition[]): void {
    commands.forEach((cmd) => {
      this.registry[cmd.name] = cmd;
      
      // Register aliases
      if (cmd.aliases) {
        cmd.aliases.forEach((alias) => {
          this.registry[alias] = cmd;
        });
      }
    });
  }

  /**
   * Parse and execute a command
   */
  async execute(input: string): Promise<CommandResult> {
    const trimmed = input.trim();

    if (!trimmed) {
      return { type: 'info', message: '' };
    }

    // Add to history
    this.context.history.push(trimmed);

    // Parse command and arguments
    const parts = this.parseInput(trimmed);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Check if command exists
    const command = this.registry[commandName];

    if (!command) {
      return {
        type: 'error',
        message: `Command not found: ${commandName}. Type 'help' for available commands.`,
        timestamp: Date.now(),
      };
    }

    // Execute command
    try {
      const result = await command.handler(args, this.context);
      return {
        ...result,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        type: 'error',
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Parse input string into command and arguments
   * Handles quoted strings and escape sequences
   */
  private parseInput(input: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const nextChar = input[i + 1];

      // Handle escape sequences
      if (char === '\\' && nextChar) {
        current += nextChar;
        i++; // Skip next character
        continue;
      }

      // Handle quotes
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        continue;
      }

      if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        continue;
      }

      // Handle spaces
      if (char === ' ' && !inQuotes) {
        if (current) {
          parts.push(current);
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * Get all registered commands
   */
  getCommands(): CommandDefinition[] {
    const seen = new Set<string>();
    const commands: CommandDefinition[] = [];

    Object.values(this.registry).forEach((cmd) => {
      if (!seen.has(cmd.name)) {
        seen.add(cmd.name);
        commands.push(cmd);
      }
    });

    return commands;
  }

  /**
   * Get commands by category
   */
  getCommandsByCategory(category: string): CommandDefinition[] {
    return this.getCommands().filter((cmd) => cmd.category === category);
  }

  /**
   * Get command suggestions based on partial input
   */
  getSuggestions(partial: string): string[] {
    const lower = partial.toLowerCase();
    return Object.keys(this.registry)
      .filter((name) => name.startsWith(lower))
      .sort();
  }

  /**
   * Update context
   */
  updateContext(updates: Partial<CommandContext>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Get current context
   */
  getContext(): CommandContext {
    return { ...this.context };
  }
}

// Export singleton instance
export const commandParser = new CommandParser();
