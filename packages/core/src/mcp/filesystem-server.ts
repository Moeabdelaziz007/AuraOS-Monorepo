/**
 * FileSystem MCP Server
 * Provides file system operations through MCP protocol
 */

import { BaseMCPServer } from '../../../ai/src/mcp/server';
import { Tool } from '../../../ai/src/mcp/types';

export class FileSystemMCPServer extends BaseMCPServer {
  name = 'filesystem';
  version = '1.0.0';
  description = 'File system operations for AuraOS';

  tools: Tool[] = [
    {
      name: 'read_file',
      description: 'Read contents of a file from the virtual file system',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path to read',
          },
        },
        required: ['path'],
      },
    },
    {
      name: 'write_file',
      description: 'Write content to a file in the virtual file system',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path to write',
          },
          content: {
            type: 'string',
            description: 'Content to write',
          },
        },
        required: ['path', 'content'],
      },
    },
    {
      name: 'list_directory',
      description: 'List contents of a directory',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Directory path to list',
          },
        },
        required: ['path'],
      },
    },
    {
      name: 'create_directory',
      description: 'Create a new directory',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Directory path to create',
          },
        },
        required: ['path'],
      },
    },
    {
      name: 'delete_file',
      description: 'Delete a file or directory',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to delete',
          },
        },
        required: ['path'],
      },
    },
    {
      name: 'file_exists',
      description: 'Check if a file or directory exists',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to check',
          },
        },
        required: ['path'],
      },
    },
    {
      name: 'search_files',
      description: 'Search for files by name pattern',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Search pattern (supports wildcards)',
          },
          directory: {
            type: 'string',
            description: 'Directory to search in (default: /)',
          },
        },
        required: ['pattern'],
      },
    },
  ];

  private fileSystem: Map<string, string> = new Map();
  private directories: Set<string> = new Set(['/']);

  protected async onInitialize(): Promise<void> {
    // Initialize with some default files
    this.fileSystem.set('/README.txt', 'Welcome to AuraOS File System!');
    this.fileSystem.set('/home/user/welcome.txt', 'Hello, User!');
    this.directories.add('/home');
    this.directories.add('/home/user');
    this.directories.add('/tmp');
    this.directories.add('/var');
  }

  protected async handleToolExecution(
    toolName: string,
    input: Record<string, any>
  ): Promise<any> {
    switch (toolName) {
      case 'read_file':
        return this.readFile(input.path);
      case 'write_file':
        return this.writeFile(input.path, input.content);
      case 'list_directory':
        return this.listDirectory(input.path);
      case 'create_directory':
        return this.createDirectory(input.path);
      case 'delete_file':
        return this.deleteFile(input.path);
      case 'file_exists':
        return this.fileExists(input.path);
      case 'search_files':
        return this.searchFiles(input.pattern, input.directory || '/');
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private readFile(path: string): { content: string; size: number } {
    const normalizedPath = this.normalizePath(path);
    
    if (!this.fileSystem.has(normalizedPath)) {
      throw new Error(`File not found: ${path}`);
    }

    const content = this.fileSystem.get(normalizedPath)!;
    return {
      content,
      size: content.length,
    };
  }

  private writeFile(path: string, content: string): { success: boolean; path: string } {
    const normalizedPath = this.normalizePath(path);
    
    // Ensure parent directory exists
    const parentDir = this.getParentDirectory(normalizedPath);
    if (!this.directories.has(parentDir)) {
      throw new Error(`Parent directory does not exist: ${parentDir}`);
    }

    this.fileSystem.set(normalizedPath, content);
    return {
      success: true,
      path: normalizedPath,
    };
  }

  private listDirectory(path: string): { files: string[]; directories: string[] } {
    const normalizedPath = this.normalizePath(path);
    
    if (!this.directories.has(normalizedPath)) {
      throw new Error(`Directory not found: ${path}`);
    }

    const files: string[] = [];
    const directories: string[] = [];

    // Find files in this directory
    for (const [filePath] of this.fileSystem.entries()) {
      if (this.isInDirectory(filePath, normalizedPath)) {
        files.push(this.getBaseName(filePath));
      }
    }

    // Find subdirectories
    for (const dir of this.directories) {
      if (this.isInDirectory(dir, normalizedPath) && dir !== normalizedPath) {
        directories.push(this.getBaseName(dir));
      }
    }

    return { files, directories };
  }

  private createDirectory(path: string): { success: boolean; path: string } {
    const normalizedPath = this.normalizePath(path);
    
    if (this.directories.has(normalizedPath)) {
      throw new Error(`Directory already exists: ${path}`);
    }

    // Ensure parent exists
    const parentDir = this.getParentDirectory(normalizedPath);
    if (!this.directories.has(parentDir)) {
      throw new Error(`Parent directory does not exist: ${parentDir}`);
    }

    this.directories.add(normalizedPath);
    return {
      success: true,
      path: normalizedPath,
    };
  }

  private deleteFile(path: string): { success: boolean } {
    const normalizedPath = this.normalizePath(path);
    
    if (this.fileSystem.has(normalizedPath)) {
      this.fileSystem.delete(normalizedPath);
      return { success: true };
    }

    if (this.directories.has(normalizedPath)) {
      // Check if directory is empty
      const { files, directories } = this.listDirectory(normalizedPath);
      if (files.length > 0 || directories.length > 0) {
        throw new Error(`Directory not empty: ${path}`);
      }
      this.directories.delete(normalizedPath);
      return { success: true };
    }

    throw new Error(`Path not found: ${path}`);
  }

  private fileExists(path: string): { exists: boolean; type?: 'file' | 'directory' } {
    const normalizedPath = this.normalizePath(path);
    
    if (this.fileSystem.has(normalizedPath)) {
      return { exists: true, type: 'file' };
    }

    if (this.directories.has(normalizedPath)) {
      return { exists: true, type: 'directory' };
    }

    return { exists: false };
  }

  private searchFiles(pattern: string, directory: string): { matches: string[] } {
    const normalizedDir = this.normalizePath(directory);
    const regex = this.patternToRegex(pattern);
    const matches: string[] = [];

    for (const [filePath] of this.fileSystem.entries()) {
      if (filePath.startsWith(normalizedDir)) {
        const fileName = this.getBaseName(filePath);
        if (regex.test(fileName)) {
          matches.push(filePath);
        }
      }
    }

    return { matches };
  }

  // Helper methods

  private normalizePath(path: string): string {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }

  private getParentDirectory(path: string): string {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return '/';
    parts.pop();
    return '/' + parts.join('/');
  }

  private getBaseName(path: string): string {
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] || '/';
  }

  private isInDirectory(path: string, directory: string): boolean {
    if (directory === '/') {
      return path.split('/').filter(Boolean).length === 1;
    }
    const parentPath = this.getParentDirectory(path);
    return parentPath === directory;
  }

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`);
  }
}
