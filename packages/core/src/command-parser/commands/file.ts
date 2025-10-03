/**
 * File System Commands
 * Commands for interacting with the Virtual File System
 */

import type { CommandDefinition } from '../types';

export const fileCommands: CommandDefinition[] = [
  {
    name: 'ls',
    description: 'List directory contents',
    usage: 'ls [path]',
    aliases: ['dir'],
    category: 'file',
    handler: async (args, context) => {
      // TODO: Integrate with VFS
      const path = args[0] || context.currentDirectory;
      
      return {
        type: 'info',
        message: `
Listing directory: ${path}

drwxr-xr-x  2 aura aura 4096 Oct  3 15:00 documents
drwxr-xr-x  2 aura aura 4096 Oct  3 15:00 downloads
drwxr-xr-x  2 aura aura 4096 Oct  3 15:00 projects
-rw-r--r--  1 aura aura  256 Oct  3 15:00 README.md

Note: Virtual File System integration coming soon
`,
      };
    },
  },

  {
    name: 'cd',
    description: 'Change directory',
    usage: 'cd <path>',
    category: 'file',
    handler: async (args, context) => {
      if (args.length === 0) {
        // Go to home directory
        context.currentDirectory = '/home/aura';
        return {
          type: 'success',
          message: 'Changed to home directory',
        };
      }

      const path = args[0];
      
      // TODO: Validate path with VFS
      // For now, just update the context
      if (path === '..') {
        const parts = context.currentDirectory.split('/').filter(Boolean);
        parts.pop();
        context.currentDirectory = '/' + parts.join('/') || '/';
      } else if (path.startsWith('/')) {
        context.currentDirectory = path;
      } else {
        context.currentDirectory = `${context.currentDirectory}/${path}`.replace('//', '/');
      }

      return {
        type: 'success',
        message: `Changed directory to: ${context.currentDirectory}`,
      };
    },
  },

  {
    name: 'pwd',
    description: 'Print working directory',
    usage: 'pwd',
    category: 'file',
    handler: (args, context) => ({
      type: 'info',
      message: context.currentDirectory,
    }),
  },

  {
    name: 'mkdir',
    description: 'Create directory',
    usage: 'mkdir <name>',
    category: 'file',
    handler: async (args) => {
      if (args.length === 0) {
        return {
          type: 'error',
          message: 'Usage: mkdir <directory_name>',
        };
      }

      // TODO: Integrate with VFS
      return {
        type: 'info',
        message: `Directory creation coming soon: ${args[0]}`,
      };
    },
  },

  {
    name: 'touch',
    description: 'Create file',
    usage: 'touch <name>',
    category: 'file',
    handler: async (args) => {
      if (args.length === 0) {
        return {
          type: 'error',
          message: 'Usage: touch <filename>',
        };
      }

      // TODO: Integrate with VFS
      return {
        type: 'info',
        message: `File creation coming soon: ${args[0]}`,
      };
    },
  },

  {
    name: 'rm',
    description: 'Remove file or directory',
    usage: 'rm <name>',
    category: 'file',
    handler: async (args) => {
      if (args.length === 0) {
        return {
          type: 'error',
          message: 'Usage: rm <file_or_directory>',
        };
      }

      // TODO: Integrate with VFS
      return {
        type: 'info',
        message: `File/directory removal coming soon: ${args[0]}`,
      };
    },
  },

  {
    name: 'cat',
    description: 'Display file contents',
    usage: 'cat <file>',
    category: 'file',
    handler: async (args) => {
      if (args.length === 0) {
        return {
          type: 'error',
          message: 'Usage: cat <filename>',
        };
      }

      // TODO: Integrate with VFS
      return {
        type: 'info',
        message: `File reading coming soon: ${args[0]}`,
      };
    },
  },

  {
    name: 'cp',
    description: 'Copy file or directory',
    usage: 'cp <source> <destination>',
    category: 'file',
    handler: async (args) => {
      if (args.length < 2) {
        return {
          type: 'error',
          message: 'Usage: cp <source> <destination>',
        };
      }

      // TODO: Integrate with VFS
      return {
        type: 'info',
        message: `File copying coming soon: ${args[0]} -> ${args[1]}`,
      };
    },
  },

  {
    name: 'mv',
    description: 'Move file or directory',
    usage: 'mv <source> <destination>',
    category: 'file',
    handler: async (args) => {
      if (args.length < 2) {
        return {
          type: 'error',
          message: 'Usage: mv <source> <destination>',
        };
      }

      // TODO: Integrate with VFS
      return {
        type: 'info',
        message: `File moving coming soon: ${args[0]} -> ${args[1]}`,
      };
    },
  },
];
