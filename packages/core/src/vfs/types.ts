/**
 * Virtual File System Types
 * Type definitions for AuraOS VFS
 */

export type FileType = 'file' | 'directory' | 'symlink';

export interface FileMetadata {
  name: string;
  path: string;
  type: FileType;
  size: number;
  created: number;
  modified: number;
  accessed: number;
  permissions: FilePermissions;
  owner: string;
  group: string;
  mimeType?: string;
}

export interface FilePermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface FileEntry extends FileMetadata {
  content?: string | ArrayBuffer;
  children?: string[]; // For directories
  target?: string; // For symlinks
}

export interface DirectoryEntry {
  path: string;
  entries: FileMetadata[];
}

export interface VFSStats {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  usedSpace: number;
  availableSpace: number;
}

export interface VFSOptions {
  dbName?: string;
  version?: number;
  maxSize?: number; // in bytes
}

export class VFSError extends Error {
  constructor(
    message: string,
    public code: VFSErrorCode,
    public path?: string
  ) {
    super(message);
    this.name = 'VFSError';
  }
}

export enum VFSErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NOT_A_DIRECTORY = 'NOT_A_DIRECTORY',
  NOT_A_FILE = 'NOT_A_FILE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_PATH = 'INVALID_PATH',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NOT_EMPTY = 'NOT_EMPTY',
  INVALID_OPERATION = 'INVALID_OPERATION',
}
