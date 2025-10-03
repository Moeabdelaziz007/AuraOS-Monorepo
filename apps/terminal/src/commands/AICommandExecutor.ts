/**
 * AI Command Executor
 * Executes commands using AI and MCP integration
 */

import { CommandResult } from '../types';
import { ParsedCommand } from './CommandParser';

export interface MCPHook {
  file: {
    read: (path: string) => Promise<string>;
    write: (path: string, content: string) => Promise<string>;
    list: (path?: string) => Promise<string>;
    search: (query: string, path?: string) => Promise<string>;
    delete: (path: string) => Promise<string>;
  };
  emulator: {
    run: (code: string) => Promise<{ output: string; success: boolean; explanation?: string }>;
    generate: (prompt: string) => Promise<string>;
    execute: (prompt: string) => Promise<{ code: string; output: string; success: boolean; explanation?: string }>;
    getState: () => Promise<any>;
  };
  ai: {
    chat: (message: string, context?: Record<string, any>) => Promise<string>;
    analyzeCode: (code: string, language?: string) => Promise<string>;
    fixCode: (code: string, error: string) => Promise<string>;
    explainCode: (code: string) => Promise<string>;
    suggestImprovements: (code: string) => Promise<string>;
  };
  execute: (command: string, context?: Record<string, any>) => Promise<any>;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export class AICommandExecutor {
  private mcp: MCPHook;
  private currentDirectory: string = '/home/user';

  constructor(mcp: MCPHook) {
    this.mcp = mcp;
  }

  /**
   * Execute natural language command
   */
  async executeNaturalLanguage(input: string): Promise<CommandResult> {
    const startTime = Date.now();

    try {
      // Use AI to understand the command
      const response = await this.mcp.ai.chat(input, {
        currentDirectory: this.currentDirectory,
        context: 'terminal',
      });

      return {
        output: response,
        exitCode: 0,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Failed to process command',
      };
    }
  }

  /**
   * Execute system command
   */
  async executeSystemCommand(parsed: ParsedCommand): Promise<CommandResult> {
    const startTime = Date.now();

    try {
      let output = '';

      switch (parsed.command.toLowerCase()) {
        case 'ls':
        case 'dir':
          output = await this.listDirectory(parsed.args[0] || '.');
          break;

        case 'cd':
          output = await this.changeDirectory(parsed.args[0] || '/home/user');
          break;

        case 'pwd':
          output = this.currentDirectory;
          break;

        case 'cat':
          if (!parsed.args[0]) {
            throw new Error('cat: missing file operand');
          }
          output = await this.readFile(parsed.args[0]);
          break;

        case 'echo':
          output = parsed.args.join(' ');
          break;

        case 'mkdir':
          if (!parsed.args[0]) {
            throw new Error('mkdir: missing directory operand');
          }
          output = `Directory created: ${parsed.args[0]}`;
          break;

        case 'rm':
          if (!parsed.args[0]) {
            throw new Error('rm: missing file operand');
          }
          output = await this.deleteFile(parsed.args[0]);
          break;

        case 'cp':
          if (parsed.args.length < 2) {
            throw new Error('cp: missing source or destination');
          }
          output = `Copied ${parsed.args[0]} to ${parsed.args[1]}`;
          break;

        case 'mv':
          if (parsed.args.length < 2) {
            throw new Error('mv: missing source or destination');
          }
          output = `Moved ${parsed.args[0]} to ${parsed.args[1]}`;
          break;

        case 'run':
          if (!parsed.args[0]) {
            throw new Error('run: missing code to execute');
          }
          const code = parsed.args.join(' ');
          const result = await this.runBASIC(code);
          output = result.output;
          if (result.explanation) {
            output += `\n\n${result.explanation}`;
          }
          break;

        case 'load':
          if (!parsed.args[0]) {
            throw new Error('load: missing file name');
          }
          output = `Loaded program from ${parsed.args[0]}`;
          break;

        case 'save':
          if (!parsed.args[0]) {
            throw new Error('save: missing file name');
          }
          output = `Saved program to ${parsed.args[0]}`;
          break;

        case 'list':
          output = 'No program loaded';
          break;

        default:
          // Try to execute as natural language
          return this.executeNaturalLanguage(parsed.rawInput);
      }

      return {
        output,
        exitCode: 0,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        output: '',
        exitCode: 1,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Command execution failed',
      };
    }
  }

  /**
   * List directory contents
   */
  private async listDirectory(path: string): Promise<string> {
    try {
      return await this.mcp.file.list(path);
    } catch (error) {
      throw new Error(`ls: cannot access '${path}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Change directory
   */
  private async changeDirectory(path: string): Promise<string> {
    // Normalize path
    if (path.startsWith('/')) {
      this.currentDirectory = path;
    } else if (path === '..') {
      const parts = this.currentDirectory.split('/').filter(p => p);
      parts.pop();
      this.currentDirectory = '/' + parts.join('/');
    } else if (path === '.') {
      // Stay in current directory
    } else {
      this.currentDirectory = `${this.currentDirectory}/${path}`.replace('//', '/');
    }

    return `Changed directory to: ${this.currentDirectory}`;
  }

  /**
   * Read file contents
   */
  private async readFile(path: string): Promise<string> {
    try {
      return await this.mcp.file.read(path);
    } catch (error) {
      throw new Error(`cat: ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file
   */
  private async deleteFile(path: string): Promise<string> {
    try {
      await this.mcp.file.delete(path);
      return `Deleted: ${path}`;
    } catch (error) {
      throw new Error(`rm: cannot remove '${path}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Run BASIC code
   */
  private async runBASIC(code: string): Promise<{ output: string; success: boolean; explanation?: string }> {
    try {
      return await this.mcp.emulator.run(code);
    } catch (error) {
      return {
        output: '',
        success: false,
        explanation: error instanceof Error ? error.message : 'Failed to run BASIC code',
      };
    }
  }

  /**
   * Get current directory
   */
  getCurrentDirectory(): string {
    return this.currentDirectory;
  }

  /**
   * Set current directory
   */
  setCurrentDirectory(path: string): void {
    this.currentDirectory = path;
  }
}
