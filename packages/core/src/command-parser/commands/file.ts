/**
 * File System Commands
 * Commands for interacting with the Virtual File System
 */

import type { CommandDefinition } from '../types';
import { vfs } from '../../vfs';
import { VFSError } from '../../vfs/types';

/**
 * Format file size in human-readable format
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format file permissions
 */
function formatPermissions(perms: { read: boolean; write: boolean; execute: boolean }): string {
  return (perms.read ? 'r' : '-') + (perms.write ? 'w' : '-') + (perms.execute ? 'x' : '-');
}

/**
 * Format date
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export const fileCommands: CommandDefinition[] = [
  {
    name: 'ls',
    description: 'List directory contents',
    usage: 'ls [path]',
    aliases: ['dir'],
    category: 'file',
    handler: async (args, context) => {
      try {
        const path = args[0] || context.currentDirectory;
        const entries = await vfs.listDirectory(path);

        if (entries.length === 0) {
          return {
            type: 'info',
            message: `Directory is empty: ${path}`,
          };
        }

        // Sort: directories first, then files, alphabetically
        entries.sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === 'directory' ? -1 : 1;
        });

        // Format output
        let output = `\nListing: ${path}\n\n`;
        
        entries.forEach((entry) => {
          const perms = formatPermissions(entry.permissions);
          const type = entry.type === 'directory' ? 'd' : '-';
          const size = entry.type === 'file' ? formatSize(entry.size).padStart(8) : '    -   ';
          const date = formatDate(entry.modified);
          const name = entry.type === 'directory' ? `\x1b[1;34m${entry.name}/\x1b[0m` : entry.name;

          output += `${type}${perms}${perms}${perms}  ${entry.owner.padEnd(8)} ${size}  ${date.padEnd(12)} ${name}\n`;
        });

        output += `\nTotal: ${entries.length} items\n`;

        return {
          type: 'success',
          message: output,
        };
      } catch (error) {
        if (error instanceof VFSError) {
          return {
            type: 'error',
            message: `ls: ${error.message}`,
          };
        }
        throw error;
      }
    },
  },

  {
    name: 'cd',
    description: 'Change directory',
    usage: 'cd <path>',
    category: 'file',
    handler: async (args, context) => {
      try {
        let targetPath: string;

        if (args.length === 0) {
          // Go to home directory
          targetPath = '/home/aura';
        } else {
          const path = args[0];
          
          // Resolve path
          if (path.startsWith('/')) {
            targetPath = path;
          } else {
            targetPath = `${context.currentDirectory}/${path}`.replace('//', '/');
          }
        }

        // Normalize path
        const parts = targetPath.split('/').filter(Boolean);
        const normalized: string[] = [];

        for (const part of parts) {
          if (part === '.') {
            continue;
          } else if (part === '..') {
            if (normalized.length > 0) {
              normalized.pop();
            }
          } else {
            normalized.push(part);
          }
        }

        targetPath = '/' + normalized.join('/');

        // Check if directory exists
        const stat = await vfs.stat(targetPath);

        if (stat.type !== 'directory') {
          return {
            type: 'error',
            message: `cd: not a directory: ${args[0]}`,
          };
        }

        // Update context
        context.currentDirectory = targetPath;

        return {
          type: 'success',
          message: targetPath,
        };
      } catch (error) {
        if (error instanceof VFSError) {
          return {
            type: 'error',
            message: `cd: ${error.message}`,
          };
        }
        throw error;
      }
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
    handler: async (args, context) => {
      if (args.length === 0) {
        return {
          type: 'error',
          message: 'Usage: mkdir <directory_name>',
        };
      }

      try {
        const name = args[0];
        const path = name.startsWith('/') ? name : `${context.currentDirectory}/${name}`;
        
        await vfs.createDirectory(path);

        return {
          type: 'success',
          message: `Directory created: ${name}`,
        };
      } catch (error) {
        if (error instanceof VFSError) {
          return {
            type: 'error',
            message: `mkdir: ${error.message}`,
          };
        }
        throw error;
      }
    },
  },

  {
    name: 'touch',
    description: 'Create file',
    usage: 'touch <name>',
    category: 'file',
    handler: async (args, context) => {
      if (args.length === 0) {
        return {
          type: 'error',
          message: 'Usage: touch <filename>',
        };
      }

      try {
        const name = args[0];
        const path = name.startsWith('/') ? name : `${context.currentDirectory}/${name}`;
        
        await vfs.writeFile(path, '');

        return {
          type: 'success',
          message: `File created: ${name}`,
        };
      } catch (error) {
        if (error instanceof VFSError) {
          return {
            type: 'error',
            message: `touch: ${error.message}`,
          };
        }
        throw error;
      }
    },
  },

  {
    name: 'rm',
    description: 'Remove file or directory',
    usage: 'rm [-r] <name>',
    category: 'file',
    handler: async (args, context) => {
      if (args.length === 0) {
        return {
          type: 'error',
          message: 'Usage: rm [-r] <file_or_directory>',
        };
      }

      try {
        let recursive = false;
        let name = args[0];

        if (args[0] === '-r' || args[0] === '-rf') {
          recursive = true;
          name = args[1];
        }

        if (!name) {
          return {
            type: 'error',
            message: 'Usage: rm [-r] <file_or_directory>',
          };
        }

        const path = name.startsWith('/') ? name : `${context.currentDirectory}/${name}`;
        
        await vfs.delete(path, recursive);

        return {
          type: 'success',
          message: `Removed: ${name}`,
        };
      } catch (error) {
        if (error instanceof VFSError) {
          return {
            type: 'error',
            message: `rm: ${error.message}`,
          };
        }
        throw error;
      }
    },
  },

  {
    name: 'cat',
    description: 'Display file contents',
    usage: 'cat <file>',
    category: 'file',
    handler: async (args, context) => {
      if (args.length === 0) {
        return {
          type: 'error',
          message: 'Usage: cat <filename>',
        };
      }

      try {
        const name = args[0];
        const path = name.startsWith('/') ? name : `${context.currentDirectory}/${name}`;
        
        const content = await vfs.readFile(path);

        return {
          type: 'success',
          message: content,
        };
      } catch (error) {
        if (error instanceof VFSError) {
          return {
            type: 'error',
            message: `cat: ${error.message}`,
          };
        }
        throw error;
      }
    },
  },

  {
    name: 'cp',
    description: 'Copy file or directory',
    usage: 'cp <source> <destination>',
    category: 'file',
    handler: async (args, context) => {
      if (args.length < 2) {
        return {
          type: 'error',
          message: 'Usage: cp <source> <destination>',
        };
      }

      try {
        const source = args[0].startsWith('/') ? args[0] : `${context.currentDirectory}/${args[0]}`;
        const dest = args[1].startsWith('/') ? args[1] : `${context.currentDirectory}/${args[1]}`;
        
        await vfs.copy(source, dest);

        return {
          type: 'success',
          message: `Copied: ${args[0]} -> ${args[1]}`,
        };
      } catch (error) {
        if (error instanceof VFSError) {
          return {
            type: 'error',
            message: `cp: ${error.message}`,
          };
        }
        throw error;
      }
    },
  },

  {
    name: 'mv',
    description: 'Move file or directory',
    usage: 'mv <source> <destination>',
    category: 'file',
    handler: async (args, context) => {
      if (args.length < 2) {
        return {
          type: 'error',
          message: 'Usage: mv <source> <destination>',
        };
      }

      try {
        const source = args[0].startsWith('/') ? args[0] : `${context.currentDirectory}/${args[0]}`;
        const dest = args[1].startsWith('/') ? args[1] : `${context.currentDirectory}/${args[1]}`;
        
        await vfs.move(source, dest);

        return {
          type: 'success',
          message: `Moved: ${args[0]} -> ${args[1]}`,
        };
      } catch (error) {
        if (error instanceof VFSError) {
          return {
            type: 'error',
            message: `mv: ${error.message}`,
          };
        }
        throw error;
      }
    },
  },
];
