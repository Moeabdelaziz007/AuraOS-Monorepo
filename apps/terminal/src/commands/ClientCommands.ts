/**
 * Client-Side Commands
 * Commands that execute locally without MCP
 */

import { CommandResult } from '../types';
import { ParsedCommand } from './CommandParser';

export class ClientCommands {
  private commandHistory: string[] = [];
  private currentTheme: string = 'default';

  /**
   * Execute client-side command
   */
  async execute(
    parsed: ParsedCommand,
    context: {
      clearOutput: () => void;
      getHistory: () => string[];
      setTheme?: (theme: string) => void;
    }
  ): Promise<CommandResult> {
    const startTime = Date.now();

    try {
      let output = '';

      switch (parsed.command.toLowerCase()) {
        case 'clear':
        case 'cls':
          context.clearOutput();
          output = '';
          break;

        case 'help':
          output = this.getHelpText(parsed.args[0]);
          break;

        case 'history':
          output = this.getHistoryText(context.getHistory(), parsed.flags);
          break;

        case 'about':
          output = this.getAboutText();
          break;

        case 'version':
          output = this.getVersionText();
          break;

        case 'theme':
          if (parsed.args[0]) {
            if (context.setTheme) {
              context.setTheme(parsed.args[0]);
              this.currentTheme = parsed.args[0];
              output = `Theme changed to: ${parsed.args[0]}`;
            } else {
              output = 'Theme changing not supported in this context';
            }
          } else {
            output = this.getThemeList();
          }
          break;

        case 'settings':
          output = this.getSettingsText();
          break;

        case 'exit':
          output = 'Use Ctrl+W or close the window to exit';
          break;

        default:
          output = `Unknown client command: ${parsed.command}`;
          return {
            output,
            exitCode: 1,
            duration: Date.now() - startTime,
          };
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
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get help text
   */
  private getHelpText(topic?: string): string {
    if (topic) {
      return this.getTopicHelp(topic);
    }

    return `
AuraOS Terminal Assistant - Help

BASIC COMMANDS:
  clear, cls          Clear the terminal screen
  help [topic]        Show this help message or help for a specific topic
  history [-n NUM]    Show command history
  about               About AuraOS Terminal
  version             Show version information
  theme [name]        Change terminal theme
  settings            Show current settings
  exit                Exit the terminal

AI-POWERED COMMANDS:
  You can use natural language! Try:
  - "list files in current directory"
  - "show me the contents of README.md"
  - "create a file called test.txt"
  - "what files are in /home?"
  - "run a BASIC program that prints hello world"

SYSTEM COMMANDS:
  ls, dir             List directory contents
  cd [path]           Change directory
  pwd                 Print working directory
  cat [file]          Display file contents
  echo [text]         Print text to terminal
  mkdir [dir]         Create directory
  rm [file]           Remove file
  cp [src] [dest]     Copy file
  mv [src] [dest]     Move/rename file

BASIC PROGRAMMING:
  run [code]          Run BASIC code
  load [file]         Load BASIC program
  save [file]         Save BASIC program
  list                List current program

Type 'help [command]' for more information on a specific command.
    `.trim();
  }

  /**
   * Get topic-specific help
   */
  private getTopicHelp(topic: string): string {
    const topics: Record<string, string> = {
      ai: `
AI-Powered Commands:
  The terminal understands natural language! You can ask questions or give
  commands in plain English (or Arabic).

  Examples:
  - "show me all files"
  - "what's in the current directory?"
  - "create a new file called notes.txt"
  - "run a program that counts to 10"
  - "explain what this code does: PRINT 'Hello'"

  The AI will analyze your request and execute the appropriate commands.
      `.trim(),

      basic: `
BASIC Programming:
  AuraOS Terminal includes a BASIC interpreter for running programs.

  Commands:
  - run [code]     : Execute BASIC code directly
  - load [file]    : Load a BASIC program from file
  - save [file]    : Save current program to file
  - list           : Show current program

  Example:
  run PRINT "Hello, World!"
  run FOR I=1 TO 10: PRINT I: NEXT I
      `.trim(),

      files: `
File Operations:
  ls, dir          : List files in directory
  cd [path]        : Change to directory
  pwd              : Show current directory
  cat [file]       : Display file contents
  mkdir [dir]      : Create new directory
  rm [file]        : Delete file
  cp [src] [dest]  : Copy file
  mv [src] [dest]  : Move or rename file

  You can also use natural language:
  - "show me all text files"
  - "what's in the documents folder?"
      `.trim(),
    };

    return topics[topic.toLowerCase()] || `No help available for: ${topic}`;
  }

  /**
   * Get history text
   */
  private getHistoryText(history: string[], flags: Record<string, string | boolean>): string {
    const limit = flags.n ? parseInt(flags.n as string, 10) : history.length;
    const recentHistory = history.slice(-limit);

    if (recentHistory.length === 0) {
      return 'No command history';
    }

    return recentHistory
      .map((cmd, index) => `${history.length - recentHistory.length + index + 1}  ${cmd}`)
      .join('\n');
  }

  /**
   * Get about text
   */
  private getAboutText(): string {
    return `
AuraOS Terminal Assistant v1.0.0

An AI-powered terminal that understands natural language and executes
commands intelligently using the Model Context Protocol (MCP).

Features:
- Natural language command processing
- BASIC programming language support
- File system operations
- AI-assisted code generation and analysis
- Command history and auto-completion

Built with ❤️ for AuraOS
    `.trim();
  }

  /**
   * Get version text
   */
  private getVersionText(): string {
    return `
AuraOS Terminal v1.0.0
MCP Integration: v1.0.0
BASIC Interpreter: v1.0.0
Node.js: ${typeof process !== 'undefined' ? process.version : 'N/A'}
    `.trim();
  }

  /**
   * Get theme list
   */
  private getThemeList(): string {
    return `
Available Themes:
- default     : Classic terminal theme
- dark        : Dark mode theme
- light       : Light mode theme
- matrix      : Matrix-style green on black
- ocean       : Ocean blue theme
- sunset      : Warm sunset colors

Current theme: ${this.currentTheme}

Usage: theme [name]
    `.trim();
  }

  /**
   * Get settings text
   */
  private getSettingsText(): string {
    return `
Terminal Settings:
- Theme: ${this.currentTheme}
- Font: Monospace
- Font Size: 14px
- Cursor: Blink
- History Size: 1000
- Auto-complete: Enabled

Use 'theme [name]' to change theme.
    `.trim();
  }
}
