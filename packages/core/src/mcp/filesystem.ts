/**
 * FileSystem MCP Server
 * Provides file system operations for AuraOS
 */

import { BaseMCPServer, Tool } from '@auraos/ai';
import * as fs from 'fs/promises';
import * as path from 'path';

interface FileInfo {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  created: string;
  modified: string;
  permissions?: string;
}

interface SearchResult {
  path: string;
  matches: number;
  preview?: string;
}

export class FileSystemMCPServer extends BaseMCPServer {
  name = 'filesystem';
  version = '1.0.0';
  description = 'File system operations for AuraOS';

  private rootPath: string;
  private maxFileSize: number;

  constructor(rootPath: string = '/tmp/auraos', maxFileSize: number = 10 * 1024 * 1024) {
    super();
    this.rootPath = rootPath;
    this.maxFileSize = maxFileSize;
  }

  tools: Tool[] = [
    {
      name: 'fs_read',
      description: 'Read contents of a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to the file to read',
          },
          encoding: {
            type: 'string',
            description: 'File encoding (default: utf-8)',
            enum: ['utf-8', 'ascii', 'base64', 'hex'],
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          size: { type: 'number' },
          encoding: { type: 'string' },
        },
      },
    },
    {
      name: 'fs_write',
      description: 'Write content to a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to the file to write',
          },
          content: {
            type: 'string',
            description: 'Content to write',
          },
          encoding: {
            type: 'string',
            description: 'File encoding (default: utf-8)',
            enum: ['utf-8', 'ascii', 'base64', 'hex'],
          },
          append: {
            type: 'boolean',
            description: 'Append to file instead of overwriting',
          },
        },
        required: ['path', 'content'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          bytesWritten: { type: 'number' },
          path: { type: 'string' },
        },
      },
    },
    {
      name: 'fs_list',
      description: 'List files and directories',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Directory path to list',
          },
          recursive: {
            type: 'boolean',
            description: 'List recursively',
          },
          pattern: {
            type: 'string',
            description: 'Filter pattern (glob)',
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    },
    {
      name: 'fs_delete',
      description: 'Delete a file or directory',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to delete',
          },
          recursive: {
            type: 'boolean',
            description: 'Delete directories recursively',
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          deleted: { type: 'boolean' },
          path: { type: 'string' },
        },
      },
    },
    {
      name: 'fs_mkdir',
      description: 'Create a directory',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Directory path to create',
          },
          recursive: {
            type: 'boolean',
            description: 'Create parent directories if needed',
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          created: { type: 'boolean' },
          path: { type: 'string' },
        },
      },
    },
    {
      name: 'fs_stat',
      description: 'Get file or directory information',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to get info for',
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          info: { type: 'object' },
        },
      },
    },
    {
      name: 'fs_copy',
      description: 'Copy a file or directory',
      inputSchema: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            description: 'Source path',
          },
          destination: {
            type: 'string',
            description: 'Destination path',
          },
          overwrite: {
            type: 'boolean',
            description: 'Overwrite if exists',
          },
        },
        required: ['source', 'destination'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          copied: { type: 'boolean' },
          destination: { type: 'string' },
        },
      },
    },
    {
      name: 'fs_move',
      description: 'Move or rename a file or directory',
      inputSchema: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            description: 'Source path',
          },
          destination: {
            type: 'string',
            description: 'Destination path',
          },
        },
        required: ['source', 'destination'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          moved: { type: 'boolean' },
          destination: { type: 'string' },
        },
      },
    },
    {
      name: 'fs_search',
      description: 'Search for files by name or content',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Directory to search in',
          },
          query: {
            type: 'string',
            description: 'Search query',
          },
          searchContent: {
            type: 'boolean',
            description: 'Search file contents (not just names)',
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of results',
          },
        },
        required: ['path', 'query'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    },
    {
      name: 'fs_watch',
      description: 'Watch a file or directory for changes',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to watch',
          },
          recursive: {
            type: 'boolean',
            description: 'Watch recursively',
          },
        },
        required: ['path'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          watchId: { type: 'string' },
          path: { type: 'string' },
        },
      },
    },
  ];

  protected async onInitialize(): Promise<void> {
    // Ensure root directory exists
    try {
      await fs.mkdir(this.rootPath, { recursive: true });
      console.log(`[FileSystem] Root path initialized: ${this.rootPath}`);
    } catch (error) {
      console.error(`[FileSystem] Failed to initialize root path:`, error);
      throw error;
    }
  }

  protected async handleToolExecution(toolName: string, input: Record<string, any>): Promise<any> {
    switch (toolName) {
      case 'fs_read':
        return this.readFile(input.path, input.encoding || 'utf-8');
      case 'fs_write':
        return this.writeFile(input.path, input.content, input.encoding || 'utf-8', input.append);
      case 'fs_list':
        return this.listDirectory(input.path, input.recursive, input.pattern);
      case 'fs_delete':
        return this.deleteFile(input.path, input.recursive);
      case 'fs_mkdir':
        return this.createDirectory(input.path, input.recursive);
      case 'fs_stat':
        return this.getFileInfo(input.path);
      case 'fs_copy':
        return this.copyFile(input.source, input.destination, input.overwrite);
      case 'fs_move':
        return this.moveFile(input.source, input.destination);
      case 'fs_search':
        return this.searchFiles(input.path, input.query, input.searchContent, input.maxResults);
      case 'fs_watch':
        return this.watchPath(input.path, input.recursive);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  // File operation implementations

  private async readFile(filePath: string, encoding: string): Promise<any> {
    const fullPath = this.resolvePath(filePath);
    await this.validatePath(fullPath);

    const stats = await fs.stat(fullPath);
    if (stats.size > this.maxFileSize) {
      throw new Error(`File too large: ${stats.size} bytes (max: ${this.maxFileSize})`);
    }

    const content = await fs.readFile(fullPath, encoding as BufferEncoding);
    return {
      content,
      size: stats.size,
      encoding,
    };
  }

  private async writeFile(
    filePath: string,
    content: string,
    encoding: string,
    append?: boolean
  ): Promise<any> {
    const fullPath = this.resolvePath(filePath);
    await this.validatePath(fullPath, true);

    // Ensure parent directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    if (append) {
      await fs.appendFile(fullPath, content, encoding as BufferEncoding);
    } else {
      await fs.writeFile(fullPath, content, encoding as BufferEncoding);
    }

    const stats = await fs.stat(fullPath);
    return {
      bytesWritten: stats.size,
      path: filePath,
    };
  }

  private async listDirectory(dirPath: string, recursive?: boolean, pattern?: string): Promise<any> {
    const fullPath = this.resolvePath(dirPath);
    await this.validatePath(fullPath);

    const files: FileInfo[] = [];

    const listDir = async (currentPath: string, relativePath: string = '') => {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name);
        const relPath = path.join(relativePath, entry.name);

        // Apply pattern filter if provided
        if (pattern && !this.matchPattern(entry.name, pattern)) {
          continue;
        }

        const stats = await fs.stat(entryPath);
        const fileInfo: FileInfo = {
          name: entry.name,
          path: relPath,
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
        };

        files.push(fileInfo);

        if (recursive && entry.isDirectory()) {
          await listDir(entryPath, relPath);
        }
      }
    };

    await listDir(fullPath);

    return { files };
  }

  private async deleteFile(filePath: string, recursive?: boolean): Promise<any> {
    const fullPath = this.resolvePath(filePath);
    await this.validatePath(fullPath);

    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      await fs.rm(fullPath, { recursive: recursive || false });
    } else {
      await fs.unlink(fullPath);
    }

    return {
      deleted: true,
      path: filePath,
    };
  }

  private async createDirectory(dirPath: string, recursive?: boolean): Promise<any> {
    const fullPath = this.resolvePath(dirPath);
    await this.validatePath(fullPath, true);

    await fs.mkdir(fullPath, { recursive: recursive || false });

    return {
      created: true,
      path: dirPath,
    };
  }

  private async getFileInfo(filePath: string): Promise<any> {
    const fullPath = this.resolvePath(filePath);
    await this.validatePath(fullPath);

    const stats = await fs.stat(fullPath);
    const info: FileInfo = {
      name: path.basename(fullPath),
      path: filePath,
      type: stats.isDirectory() ? 'directory' : 'file',
      size: stats.size,
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString(),
    };

    return { info };
  }

  private async copyFile(source: string, destination: string, overwrite?: boolean): Promise<any> {
    const sourcePath = this.resolvePath(source);
    const destPath = this.resolvePath(destination);

    await this.validatePath(sourcePath);
    await this.validatePath(destPath, true);

    // Check if destination exists
    try {
      await fs.access(destPath);
      if (!overwrite) {
        throw new Error('Destination already exists');
      }
    } catch {
      // Destination doesn't exist, which is fine
    }

    await fs.copyFile(sourcePath, destPath);

    return {
      copied: true,
      destination,
    };
  }

  private async moveFile(source: string, destination: string): Promise<any> {
    const sourcePath = this.resolvePath(source);
    const destPath = this.resolvePath(destination);

    await this.validatePath(sourcePath);
    await this.validatePath(destPath, true);

    await fs.rename(sourcePath, destPath);

    return {
      moved: true,
      destination,
    };
  }

  private async searchFiles(
    dirPath: string,
    query: string,
    searchContent?: boolean,
    maxResults: number = 100
  ): Promise<any> {
    const fullPath = this.resolvePath(dirPath);
    await this.validatePath(fullPath);

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    const searchDir = async (currentPath: string) => {
      if (results.length >= maxResults) return;

      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        if (results.length >= maxResults) break;

        const entryPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(fullPath, entryPath);

        // Search by filename
        if (entry.name.toLowerCase().includes(queryLower)) {
          results.push({
            path: relativePath,
            matches: 1,
          });
        }

        // Search by content (for files only)
        if (searchContent && entry.isFile()) {
          try {
            const stats = await fs.stat(entryPath);
            if (stats.size <= this.maxFileSize) {
              const content = await fs.readFile(entryPath, 'utf-8');
              const matches = (content.match(new RegExp(query, 'gi')) || []).length;
              if (matches > 0) {
                const lines = content.split('\n');
                const matchLine = lines.find((line) => line.toLowerCase().includes(queryLower));
                results.push({
                  path: relativePath,
                  matches,
                  preview: matchLine?.trim().substring(0, 100),
                });
              }
            }
          } catch {
            // Skip files that can't be read as text
          }
        }

        // Recurse into directories
        if (entry.isDirectory()) {
          await searchDir(entryPath);
        }
      }
    };

    await searchDir(fullPath);

    return { results };
  }

  private async watchPath(filePath: string, recursive?: boolean): Promise<any> {
    const fullPath = this.resolvePath(filePath);
    await this.validatePath(fullPath);

    // Generate watch ID
    const watchId = `watch_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Note: Actual file watching would require maintaining state
    // This is a simplified implementation
    return {
      watchId,
      path: filePath,
      message: 'File watching registered (implementation pending)',
    };
  }

  // Helper methods

  private resolvePath(filePath: string): string {
    // Prevent path traversal attacks
    const normalized = path.normalize(filePath);
    if (normalized.startsWith('..')) {
      throw new Error('Path traversal not allowed');
    }

    return path.join(this.rootPath, normalized);
  }

  private async validatePath(fullPath: string, allowNonExistent: boolean = false): Promise<void> {
    // Ensure path is within root
    if (!fullPath.startsWith(this.rootPath)) {
      throw new Error('Access denied: path outside root directory');
    }

    // Check if path exists
    if (!allowNonExistent) {
      try {
        await fs.access(fullPath);
      } catch {
        throw new Error(`Path does not exist: ${fullPath}`);
      }
    }
  }

  private matchPattern(filename: string, pattern: string): boolean {
    // Simple glob pattern matching
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
      'i'
    );
    return regex.test(filename);
  }
}
