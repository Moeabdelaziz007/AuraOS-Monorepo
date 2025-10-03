/**
 * Path Resolver
 * Utilities for path manipulation and validation
 */

import { VFSError, VFSErrorCode } from './types';

export class PathResolver {
  /**
   * Normalize a path (remove .., ., trailing slashes, etc.)
   */
  static normalize(path: string): string {
    if (!path) return '/';

    // Split path into parts
    const parts = path.split('/').filter(Boolean);
    const normalized: string[] = [];

    for (const part of parts) {
      if (part === '.') {
        // Current directory, skip
        continue;
      } else if (part === '..') {
        // Parent directory, pop last part
        if (normalized.length > 0) {
          normalized.pop();
        }
      } else {
        normalized.push(part);
      }
    }

    return '/' + normalized.join('/');
  }

  /**
   * Join multiple path segments
   */
  static join(...paths: string[]): string {
    const joined = paths.join('/');
    return this.normalize(joined);
  }

  /**
   * Get the directory name from a path
   */
  static dirname(path: string): string {
    const normalized = this.normalize(path);
    const lastSlash = normalized.lastIndexOf('/');
    
    if (lastSlash === 0) {
      return '/';
    }
    
    return normalized.substring(0, lastSlash) || '/';
  }

  /**
   * Get the base name from a path
   */
  static basename(path: string): string {
    const normalized = this.normalize(path);
    const lastSlash = normalized.lastIndexOf('/');
    return normalized.substring(lastSlash + 1);
  }

  /**
   * Get the file extension
   */
  static extname(path: string): string {
    const basename = this.basename(path);
    const lastDot = basename.lastIndexOf('.');
    
    if (lastDot === -1 || lastDot === 0) {
      return '';
    }
    
    return basename.substring(lastDot);
  }

  /**
   * Check if a path is absolute
   */
  static isAbsolute(path: string): boolean {
    return path.startsWith('/');
  }

  /**
   * Resolve a relative path against a base path
   */
  static resolve(basePath: string, relativePath: string): string {
    if (this.isAbsolute(relativePath)) {
      return this.normalize(relativePath);
    }
    
    return this.join(basePath, relativePath);
  }

  /**
   * Validate a path
   */
  static validate(path: string): void {
    if (!path) {
      throw new VFSError('Path cannot be empty', VFSErrorCode.INVALID_PATH);
    }

    // Check for invalid characters
    const invalidChars = /[<>:"|?*\x00-\x1F]/;
    if (invalidChars.test(path)) {
      throw new VFSError(
        'Path contains invalid characters',
        VFSErrorCode.INVALID_PATH,
        path
      );
    }

    // Check path length
    if (path.length > 4096) {
      throw new VFSError(
        'Path is too long (max 4096 characters)',
        VFSErrorCode.INVALID_PATH,
        path
      );
    }
  }

  /**
   * Get all parent paths
   */
  static getParents(path: string): string[] {
    const normalized = this.normalize(path);
    const parts = normalized.split('/').filter(Boolean);
    const parents: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      parents.push('/' + parts.slice(0, i + 1).join('/'));
    }

    return parents;
  }

  /**
   * Check if path is a child of another path
   */
  static isChildOf(childPath: string, parentPath: string): boolean {
    const normalizedChild = this.normalize(childPath);
    const normalizedParent = this.normalize(parentPath);

    if (normalizedParent === '/') {
      return true;
    }

    return normalizedChild.startsWith(normalizedParent + '/');
  }
}
