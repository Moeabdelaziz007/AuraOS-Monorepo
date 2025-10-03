/**
 * Virtual File System
 * IndexedDB-based file system for AuraOS
 */

import { PathResolver } from './PathResolver';
import type {
  FileEntry,
  FileMetadata,
  FileType,
  DirectoryEntry,
  VFSStats,
  VFSOptions,
} from './types';
import { VFSError, VFSErrorCode } from './types';

export class VirtualFileSystem {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;
  private maxSize: number;
  private initialized: boolean = false;

  constructor(options: VFSOptions = {}) {
    this.dbName = options.dbName || 'auraos-vfs';
    this.version = options.version || 1;
    this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB default
  }

  /**
   * Initialize the VFS
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new VFSError('Failed to open database', VFSErrorCode.INVALID_OPERATION));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for files
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'path' });
          fileStore.createIndex('type', 'type', { unique: false });
          fileStore.createIndex('parent', 'parent', { unique: false });
        }

        // Initialize root directory
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        const fileStore = transaction.objectStore('files');

        const rootEntry: FileEntry = {
          name: '',
          path: '/',
          type: 'directory',
          size: 0,
          created: Date.now(),
          modified: Date.now(),
          accessed: Date.now(),
          permissions: { read: true, write: true, execute: true },
          owner: 'aura',
          group: 'users',
          children: [],
        };

        fileStore.add(rootEntry);

        // Create default directories
        const defaultDirs = [
          '/home',
          '/home/aura',
          '/home/aura/documents',
          '/home/aura/downloads',
          '/home/aura/projects',
        ];

        defaultDirs.forEach((path) => {
          const entry: FileEntry = {
            name: PathResolver.basename(path),
            path,
            type: 'directory',
            size: 0,
            created: Date.now(),
            modified: Date.now(),
            accessed: Date.now(),
            permissions: { read: true, write: true, execute: true },
            owner: 'aura',
            group: 'users',
            children: [],
          };
          fileStore.add(entry);
        });

        // Create a sample README file
        const readmeEntry: FileEntry = {
          name: 'README.md',
          path: '/home/aura/README.md',
          type: 'file',
          size: 0,
          created: Date.now(),
          modified: Date.now(),
          accessed: Date.now(),
          permissions: { read: true, write: true, execute: false },
          owner: 'aura',
          group: 'users',
          mimeType: 'text/markdown',
          content: `# Welcome to AuraOS!

This is your virtual file system powered by IndexedDB.

## Features
- Create, read, update, and delete files
- Directory management
- File permissions
- Path resolution

## Getting Started
Try these commands in the terminal:
- \`ls\` - List files
- \`cd documents\` - Change directory
- \`pwd\` - Print working directory
- \`cat README.md\` - Read this file
- \`mkdir test\` - Create a directory
- \`touch hello.txt\` - Create a file

Enjoy exploring AuraOS!
`,
        };
        readmeEntry.size = readmeEntry.content?.length || 0;
        fileStore.add(readmeEntry);
      };
    });
  }

  /**
   * Ensure VFS is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.db) {
      throw new VFSError('VFS not initialized', VFSErrorCode.INVALID_OPERATION);
    }
  }

  /**
   * Get a file entry
   */
  private async getEntry(path: string): Promise<FileEntry | null> {
    this.ensureInitialized();
    const normalizedPath = PathResolver.normalize(path);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(normalizedPath);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new VFSError('Failed to get entry', VFSErrorCode.INVALID_OPERATION, path));
      };
    });
  }

  /**
   * Put a file entry
   */
  private async putEntry(entry: FileEntry): Promise<void> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.put(entry);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new VFSError('Failed to put entry', VFSErrorCode.INVALID_OPERATION, entry.path));
      };
    });
  }

  /**
   * Delete a file entry
   */
  private async deleteEntry(path: string): Promise<void> {
    this.ensureInitialized();
    const normalizedPath = PathResolver.normalize(path);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.delete(normalizedPath);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new VFSError('Failed to delete entry', VFSErrorCode.INVALID_OPERATION, path));
      };
    });
  }

  /**
   * List directory contents
   */
  async listDirectory(path: string): Promise<FileMetadata[]> {
    this.ensureInitialized();
    const normalizedPath = PathResolver.normalize(path);
    PathResolver.validate(normalizedPath);

    const entry = await this.getEntry(normalizedPath);

    if (!entry) {
      throw new VFSError('Directory not found', VFSErrorCode.NOT_FOUND, path);
    }

    if (entry.type !== 'directory') {
      throw new VFSError('Not a directory', VFSErrorCode.NOT_A_DIRECTORY, path);
    }

    // Update accessed time
    entry.accessed = Date.now();
    await this.putEntry(entry);

    // Get all children
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const results: FileMetadata[] = [];

      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          const entry = cursor.value as FileEntry;
          const entryParent = PathResolver.dirname(entry.path);

          if (entryParent === normalizedPath && entry.path !== normalizedPath) {
            results.push({
              name: entry.name,
              path: entry.path,
              type: entry.type,
              size: entry.size,
              created: entry.created,
              modified: entry.modified,
              accessed: entry.accessed,
              permissions: entry.permissions,
              owner: entry.owner,
              group: entry.group,
              mimeType: entry.mimeType,
            });
          }

          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(new VFSError('Failed to list directory', VFSErrorCode.INVALID_OPERATION, path));
      };
    });
  }

  /**
   * Create a directory
   */
  async createDirectory(path: string): Promise<void> {
    this.ensureInitialized();
    const normalizedPath = PathResolver.normalize(path);
    PathResolver.validate(normalizedPath);

    // Check if already exists
    const existing = await this.getEntry(normalizedPath);
    if (existing) {
      throw new VFSError('Path already exists', VFSErrorCode.ALREADY_EXISTS, path);
    }

    // Check if parent exists
    const parentPath = PathResolver.dirname(normalizedPath);
    const parent = await this.getEntry(parentPath);

    if (!parent) {
      throw new VFSError('Parent directory not found', VFSErrorCode.NOT_FOUND, parentPath);
    }

    if (parent.type !== 'directory') {
      throw new VFSError('Parent is not a directory', VFSErrorCode.NOT_A_DIRECTORY, parentPath);
    }

    // Create directory
    const entry: FileEntry = {
      name: PathResolver.basename(normalizedPath),
      path: normalizedPath,
      type: 'directory',
      size: 0,
      created: Date.now(),
      modified: Date.now(),
      accessed: Date.now(),
      permissions: { read: true, write: true, execute: true },
      owner: 'aura',
      group: 'users',
      children: [],
    };

    await this.putEntry(entry);

    // Update parent modified time
    parent.modified = Date.now();
    await this.putEntry(parent);
  }

  /**
   * Read file contents
   */
  async readFile(path: string): Promise<string> {
    this.ensureInitialized();
    const normalizedPath = PathResolver.normalize(path);
    PathResolver.validate(normalizedPath);

    const entry = await this.getEntry(normalizedPath);

    if (!entry) {
      throw new VFSError('File not found', VFSErrorCode.NOT_FOUND, path);
    }

    if (entry.type !== 'file') {
      throw new VFSError('Not a file', VFSErrorCode.NOT_A_FILE, path);
    }

    // Update accessed time
    entry.accessed = Date.now();
    await this.putEntry(entry);

    return (entry.content as string) || '';
  }

  /**
   * Write file contents
   */
  async writeFile(path: string, content: string): Promise<void> {
    this.ensureInitialized();
    const normalizedPath = PathResolver.normalize(path);
    PathResolver.validate(normalizedPath);

    let entry = await this.getEntry(normalizedPath);

    if (entry) {
      // Update existing file
      if (entry.type !== 'file') {
        throw new VFSError('Not a file', VFSErrorCode.NOT_A_FILE, path);
      }

      entry.content = content;
      entry.size = content.length;
      entry.modified = Date.now();
      entry.accessed = Date.now();
    } else {
      // Create new file
      const parentPath = PathResolver.dirname(normalizedPath);
      const parent = await this.getEntry(parentPath);

      if (!parent) {
        throw new VFSError('Parent directory not found', VFSErrorCode.NOT_FOUND, parentPath);
      }

      if (parent.type !== 'directory') {
        throw new VFSError('Parent is not a directory', VFSErrorCode.NOT_A_DIRECTORY, parentPath);
      }

      entry = {
        name: PathResolver.basename(normalizedPath),
        path: normalizedPath,
        type: 'file',
        size: content.length,
        created: Date.now(),
        modified: Date.now(),
        accessed: Date.now(),
        permissions: { read: true, write: true, execute: false },
        owner: 'aura',
        group: 'users',
        content,
      };

      // Update parent modified time
      parent.modified = Date.now();
      await this.putEntry(parent);
    }

    await this.putEntry(entry);
  }

  /**
   * Delete a file or directory
   */
  async delete(path: string, recursive: boolean = false): Promise<void> {
    this.ensureInitialized();
    const normalizedPath = PathResolver.normalize(path);
    PathResolver.validate(normalizedPath);

    if (normalizedPath === '/') {
      throw new VFSError('Cannot delete root directory', VFSErrorCode.PERMISSION_DENIED, path);
    }

    const entry = await this.getEntry(normalizedPath);

    if (!entry) {
      throw new VFSError('Path not found', VFSErrorCode.NOT_FOUND, path);
    }

    if (entry.type === 'directory') {
      const children = await this.listDirectory(normalizedPath);

      if (children.length > 0 && !recursive) {
        throw new VFSError('Directory not empty', VFSErrorCode.NOT_EMPTY, path);
      }

      if (recursive) {
        // Delete all children
        for (const child of children) {
          await this.delete(child.path, true);
        }
      }
    }

    await this.deleteEntry(normalizedPath);

    // Update parent modified time
    const parentPath = PathResolver.dirname(normalizedPath);
    const parent = await this.getEntry(parentPath);
    if (parent) {
      parent.modified = Date.now();
      await this.putEntry(parent);
    }
  }

  /**
   * Check if path exists
   */
  async exists(path: string): Promise<boolean> {
    this.ensureInitialized();
    const normalizedPath = PathResolver.normalize(path);
    const entry = await this.getEntry(normalizedPath);
    return entry !== null;
  }

  /**
   * Get file/directory stats
   */
  async stat(path: string): Promise<FileMetadata> {
    this.ensureInitialized();
    const normalizedPath = PathResolver.normalize(path);
    PathResolver.validate(normalizedPath);

    const entry = await this.getEntry(normalizedPath);

    if (!entry) {
      throw new VFSError('Path not found', VFSErrorCode.NOT_FOUND, path);
    }

    return {
      name: entry.name,
      path: entry.path,
      type: entry.type,
      size: entry.size,
      created: entry.created,
      modified: entry.modified,
      accessed: entry.accessed,
      permissions: entry.permissions,
      owner: entry.owner,
      group: entry.group,
      mimeType: entry.mimeType,
    };
  }

  /**
   * Get VFS statistics
   */
  async getStats(): Promise<VFSStats> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.openCursor();

      let totalFiles = 0;
      let totalDirectories = 0;
      let totalSize = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          const entry = cursor.value as FileEntry;

          if (entry.type === 'file') {
            totalFiles++;
            totalSize += entry.size;
          } else if (entry.type === 'directory') {
            totalDirectories++;
          }

          cursor.continue();
        } else {
          resolve({
            totalFiles,
            totalDirectories,
            totalSize,
            usedSpace: totalSize,
            availableSpace: this.maxSize - totalSize,
          });
        }
      };

      request.onerror = () => {
        reject(new VFSError('Failed to get stats', VFSErrorCode.INVALID_OPERATION));
      };
    });
  }

  /**
   * Copy a file or directory
   */
  async copy(sourcePath: string, destPath: string): Promise<void> {
    this.ensureInitialized();
    const normalizedSource = PathResolver.normalize(sourcePath);
    const normalizedDest = PathResolver.normalize(destPath);

    const source = await this.getEntry(normalizedSource);

    if (!source) {
      throw new VFSError('Source not found', VFSErrorCode.NOT_FOUND, sourcePath);
    }

    if (await this.exists(normalizedDest)) {
      throw new VFSError('Destination already exists', VFSErrorCode.ALREADY_EXISTS, destPath);
    }

    if (source.type === 'file') {
      const content = await this.readFile(normalizedSource);
      await this.writeFile(normalizedDest, content);
    } else {
      await this.createDirectory(normalizedDest);
      const children = await this.listDirectory(normalizedSource);

      for (const child of children) {
        const childDest = PathResolver.join(normalizedDest, child.name);
        await this.copy(child.path, childDest);
      }
    }
  }

  /**
   * Move a file or directory
   */
  async move(sourcePath: string, destPath: string): Promise<void> {
    await this.copy(sourcePath, destPath);
    await this.delete(sourcePath, true);
  }
}

// Export singleton instance
export const vfs = new VirtualFileSystem();
