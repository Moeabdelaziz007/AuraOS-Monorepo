/**
 * System Commands
 * Built-in system commands for AuraOS
 */

import type { CommandDefinition } from '../types';

export const systemCommands: CommandDefinition[] = [
  {
    name: 'help',
    description: 'Show available commands',
    usage: 'help [command]',
    category: 'system',
    handler: (args, context) => {
      if (args.length > 0) {
        // Show help for specific command
        return {
          type: 'info',
          message: `Help for command: ${args[0]} (detailed help coming soon)`,
        };
      }

      return {
        type: 'info',
        message: `
╔══════════════════════════════════════════════════════════════╗
║                  AuraOS Command Reference                    ║
╚══════════════════════════════════════════════════════════════╝

System Commands:
  help [command]    Show this help or help for specific command
  clear             Clear the terminal screen
  echo <text>       Print text to the terminal
  date              Show current date and time
  whoami            Show current user
  version           Show AuraOS version
  history           Show command history
  env               Show environment variables

File System Commands:
  ls [path]         List directory contents
  cd <path>         Change directory
  pwd               Print working directory
  mkdir <name>      Create directory
  touch <name>      Create file
  rm <name>         Remove file/directory
  cat <file>        Display file contents
  cp <src> <dest>   Copy file/directory
  mv <src> <dest>   Move file/directory

AI Commands:
  generate <prompt> Generate content using AI
  ask <question>    Ask AI a question
  summarize <text>  Summarize text
  translate <text>  Translate text

Automation Commands:
  workflows         List available workflows
  run <workflow>    Run a workflow
  schedule <cmd>    Schedule a command

Process Commands:
  ps                List running processes
  kill <pid>        Kill a process
  top               Show system resources

Tips:
  • Use Up/Down arrows to navigate command history
  • Use Ctrl+C to cancel current command
  • Use Ctrl+L to clear screen
  • Use Tab for auto-completion (coming soon)

For detailed help on a command, use: help <command>
`,
      };
    },
  },

  {
    name: 'clear',
    description: 'Clear the terminal screen',
    usage: 'clear',
    aliases: ['cls'],
    category: 'system',
    handler: () => ({
      type: 'info',
      message: '\x1b[2J\x1b[H',
    }),
  },

  {
    name: 'echo',
    description: 'Print text to the terminal',
    usage: 'echo <text>',
    category: 'system',
    handler: (args) => ({
      type: 'success',
      message: args.join(' '),
    }),
  },

  {
    name: 'date',
    description: 'Show current date and time',
    usage: 'date',
    category: 'system',
    handler: () => ({
      type: 'info',
      message: new Date().toString(),
    }),
  },

  {
    name: 'whoami',
    description: 'Show current user',
    usage: 'whoami',
    category: 'system',
    handler: (args, context) => ({
      type: 'info',
      message: context.user,
    }),
  },

  {
    name: 'version',
    description: 'Show AuraOS version',
    usage: 'version',
    category: 'system',
    handler: () => ({
      type: 'info',
      message: `
╔══════════════════════════════════════════════════════════════╗
║                    AuraOS Terminal v1.0.0                    ║
╚══════════════════════════════════════════════════════════════╝

AI-Powered Operating System
Built with ❤️ by Mohamed Abdelaziz

Core Features:
  ✓ xterm.js Terminal Emulator
  ✓ Command Parser & Executor
  ✓ Command History
  ✓ Virtual File System (In Progress)
  ✓ AI Integration (In Progress)
  ✓ Automation Support (In Progress)

Technology Stack:
  • React 18 + TypeScript
  • xterm.js
  • Zustand
  • Firebase
  • Vite

Repository: https://github.com/Moeabdelaziz007/AuraOS-Monorepo
`,
    }),
  },

  {
    name: 'history',
    description: 'Show command history',
    usage: 'history',
    category: 'system',
    handler: (args, context) => {
      if (context.history.length === 0) {
        return {
          type: 'info',
          message: 'No command history',
        };
      }

      const historyList = context.history
        .map((cmd, index) => `  ${index + 1}  ${cmd}`)
        .join('\n');

      return {
        type: 'info',
        message: `Command History:\n${historyList}`,
      };
    },
  },

  {
    name: 'env',
    description: 'Show environment variables',
    usage: 'env',
    category: 'system',
    handler: (args, context) => {
      const envVars = Object.entries(context.environment)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      return {
        type: 'info',
        message: envVars || 'No environment variables set',
      };
    },
  },
];
