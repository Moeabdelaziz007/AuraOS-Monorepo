/**
 * Command Parser
 * Parses and routes terminal commands
 */

import { CommandResult } from '../types';

export interface ParsedCommand {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
  rawInput: string;
}

export class CommandParser {
  /**
   * Parse command string into structured format
   */
  static parse(input: string): ParsedCommand {
    const trimmed = input.trim();
    const parts = trimmed.split(/\s+/);
    const command = parts[0] || '';
    const rest = parts.slice(1);

    const args: string[] = [];
    const flags: Record<string, string | boolean> = {};

    for (let i = 0; i < rest.length; i++) {
      const part = rest[i];
      
      if (part.startsWith('--')) {
        // Long flag: --flag or --flag=value
        const flagName = part.substring(2);
        const equalIndex = flagName.indexOf('=');
        
        if (equalIndex > 0) {
          flags[flagName.substring(0, equalIndex)] = flagName.substring(equalIndex + 1);
        } else {
          flags[flagName] = true;
        }
      } else if (part.startsWith('-')) {
        // Short flag: -f or -f value
        const flagName = part.substring(1);
        
        if (i + 1 < rest.length && !rest[i + 1].startsWith('-')) {
          flags[flagName] = rest[i + 1];
          i++; // Skip next part
        } else {
          flags[flagName] = true;
        }
      } else {
        args.push(part);
      }
    }

    return {
      command,
      args,
      flags,
      rawInput: trimmed,
    };
  }

  /**
   * Check if command is a client-side command
   */
  static isClientSideCommand(command: string): boolean {
    const clientCommands = [
      'clear',
      'cls',
      'help',
      'history',
      'exit',
      'about',
      'version',
      'theme',
      'settings',
    ];

    return clientCommands.includes(command.toLowerCase());
  }

  /**
   * Check if command is a natural language query
   */
  static isNaturalLanguage(input: string): boolean {
    // Check for question words or conversational patterns
    const nlPatterns = [
      /^(what|how|why|when|where|who|can|could|would|should|is|are|do|does)/i,
      /\?$/,
      /^(show me|tell me|explain|find|search for|list all|get me)/i,
      /^(create|make|generate|write|build)/i,
    ];

    return nlPatterns.some(pattern => pattern.test(input.trim()));
  }

  /**
   * Determine command type
   */
  static getCommandType(input: string): 'client' | 'system' | 'natural' {
    const parsed = this.parse(input);
    
    if (this.isClientSideCommand(parsed.command)) {
      return 'client';
    }
    
    if (this.isNaturalLanguage(input)) {
      return 'natural';
    }
    
    return 'system';
  }
}
