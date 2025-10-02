/**
 * FileSystem MCP Server Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileSystemMCPServer } from '../filesystem';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('FileSystem MCP Server', () => {
  let server: FileSystemMCPServer;
  let testRoot: string;

  beforeEach(async () => {
    // Create temporary test directory
    testRoot = path.join(os.tmpdir(), `auraos-test-${Date.now()}`);
    await fs.mkdir(testRoot, { recursive: true });

    server = new FileSystemMCPServer(testRoot);
    await server.initialize();
  });

  afterEach(async () => {
    await server.shutdown();
    // Clean up test directory
    await fs.rm(testRoot, { recursive: true, force: true });
  });

  describe('File Operations', () => {
    it('should write and read a file', async () => {
      const writeResult = await server.executeTool('fs_write', {
        path: 'test.txt',
        content: 'Hello, AuraOS!',
      });

      expect(writeResult.success).toBe(true);
      expect(writeResult.data.bytesWritten).toBeGreaterThan(0);

      const readResult = await server.executeTool('fs_read', {
        path: 'test.txt',
      });

      expect(readResult.success).toBe(true);
      expect(readResult.data.content).toBe('Hello, AuraOS!');
    });

    it('should append to a file', async () => {
      await server.executeTool('fs_write', {
        path: 'append.txt',
        content: 'Line 1\n',
      });

      await server.executeTool('fs_write', {
        path: 'append.txt',
        content: 'Line 2\n',
        append: true,
      });

      const readResult = await server.executeTool('fs_read', {
        path: 'append.txt',
      });

      expect(readResult.data.content).toBe('Line 1\nLine 2\n');
    });

    it('should delete a file', async () => {
      await server.executeTool('fs_write', {
        path: 'delete-me.txt',
        content: 'temporary',
      });

      const deleteResult = await server.executeTool('fs_delete', {
        path: 'delete-me.txt',
      });

      expect(deleteResult.success).toBe(true);

      const readResult = await server.executeTool('fs_read', {
        path: 'delete-me.txt',
      });

      expect(readResult.success).toBe(false);
    });

    it('should get file info', async () => {
      await server.executeTool('fs_write', {
        path: 'info.txt',
        content: 'test content',
      });

      const statResult = await server.executeTool('fs_stat', {
        path: 'info.txt',
      });

      expect(statResult.success).toBe(true);
      expect(statResult.data.info.name).toBe('info.txt');
      expect(statResult.data.info.type).toBe('file');
      expect(statResult.data.info.size).toBeGreaterThan(0);
    });
  });

  describe('Directory Operations', () => {
    it('should create a directory', async () => {
      const mkdirResult = await server.executeTool('fs_mkdir', {
        path: 'testdir',
      });

      expect(mkdirResult.success).toBe(true);

      const statResult = await server.executeTool('fs_stat', {
        path: 'testdir',
      });

      expect(statResult.data.info.type).toBe('directory');
    });

    it('should create nested directories', async () => {
      const mkdirResult = await server.executeTool('fs_mkdir', {
        path: 'parent/child/grandchild',
        recursive: true,
      });

      expect(mkdirResult.success).toBe(true);

      const statResult = await server.executeTool('fs_stat', {
        path: 'parent/child/grandchild',
      });

      expect(statResult.data.info.type).toBe('directory');
    });

    it('should list directory contents', async () => {
      await server.executeTool('fs_mkdir', { path: 'listdir' });
      await server.executeTool('fs_write', {
        path: 'listdir/file1.txt',
        content: 'content1',
      });
      await server.executeTool('fs_write', {
        path: 'listdir/file2.txt',
        content: 'content2',
      });

      const listResult = await server.executeTool('fs_list', {
        path: 'listdir',
      });

      expect(listResult.success).toBe(true);
      expect(listResult.data.files.length).toBe(2);
      expect(listResult.data.files.some((f: any) => f.name === 'file1.txt')).toBe(true);
      expect(listResult.data.files.some((f: any) => f.name === 'file2.txt')).toBe(true);
    });

    it('should list directory recursively', async () => {
      await server.executeTool('fs_mkdir', { path: 'recursive/sub', recursive: true });
      await server.executeTool('fs_write', {
        path: 'recursive/file1.txt',
        content: 'content1',
      });
      await server.executeTool('fs_write', {
        path: 'recursive/sub/file2.txt',
        content: 'content2',
      });

      const listResult = await server.executeTool('fs_list', {
        path: 'recursive',
        recursive: true,
      });

      expect(listResult.success).toBe(true);
      expect(listResult.data.files.length).toBeGreaterThanOrEqual(3); // 1 dir + 2 files
    });

    it('should delete directory recursively', async () => {
      await server.executeTool('fs_mkdir', { path: 'deletedir/sub', recursive: true });
      await server.executeTool('fs_write', {
        path: 'deletedir/file.txt',
        content: 'content',
      });

      const deleteResult = await server.executeTool('fs_delete', {
        path: 'deletedir',
        recursive: true,
      });

      expect(deleteResult.success).toBe(true);

      const statResult = await server.executeTool('fs_stat', {
        path: 'deletedir',
      });

      expect(statResult.success).toBe(false);
    });
  });

  describe('File Copy and Move', () => {
    it('should copy a file', async () => {
      await server.executeTool('fs_write', {
        path: 'source.txt',
        content: 'original content',
      });

      const copyResult = await server.executeTool('fs_copy', {
        source: 'source.txt',
        destination: 'destination.txt',
      });

      expect(copyResult.success).toBe(true);

      const readResult = await server.executeTool('fs_read', {
        path: 'destination.txt',
      });

      expect(readResult.data.content).toBe('original content');
    });

    it('should move a file', async () => {
      await server.executeTool('fs_write', {
        path: 'move-source.txt',
        content: 'move me',
      });

      const moveResult = await server.executeTool('fs_move', {
        source: 'move-source.txt',
        destination: 'move-dest.txt',
      });

      expect(moveResult.success).toBe(true);

      const readSource = await server.executeTool('fs_read', {
        path: 'move-source.txt',
      });
      expect(readSource.success).toBe(false);

      const readDest = await server.executeTool('fs_read', {
        path: 'move-dest.txt',
      });
      expect(readDest.data.content).toBe('move me');
    });

    it('should prevent overwriting without flag', async () => {
      await server.executeTool('fs_write', {
        path: 'existing.txt',
        content: 'existing',
      });
      await server.executeTool('fs_write', {
        path: 'new.txt',
        content: 'new',
      });

      const copyResult = await server.executeTool('fs_copy', {
        source: 'new.txt',
        destination: 'existing.txt',
        overwrite: false,
      });

      expect(copyResult.success).toBe(false);
    });
  });

  describe('Search Operations', () => {
    it('should search files by name', async () => {
      await server.executeTool('fs_write', {
        path: 'search-test.txt',
        content: 'content',
      });
      await server.executeTool('fs_write', {
        path: 'other.txt',
        content: 'content',
      });

      const searchResult = await server.executeTool('fs_search', {
        path: '.',
        query: 'search',
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.data.results.length).toBeGreaterThan(0);
      expect(searchResult.data.results.some((r: any) => r.path.includes('search-test.txt'))).toBe(
        true
      );
    });

    it('should search file contents', async () => {
      await server.executeTool('fs_write', {
        path: 'content-search.txt',
        content: 'This file contains the word FINDME',
      });

      const searchResult = await server.executeTool('fs_search', {
        path: '.',
        query: 'FINDME',
        searchContent: true,
      });

      expect(searchResult.success).toBe(true);
      expect(searchResult.data.results.length).toBeGreaterThan(0);
    });

    it('should limit search results', async () => {
      // Create many files
      for (let i = 0; i < 10; i++) {
        await server.executeTool('fs_write', {
          path: `search-${i}.txt`,
          content: 'content',
        });
      }

      const searchResult = await server.executeTool('fs_search', {
        path: '.',
        query: 'search',
        maxResults: 5,
      });

      expect(searchResult.data.results.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Security', () => {
    it('should prevent path traversal', async () => {
      const result = await server.executeTool('fs_read', {
        path: '../../../etc/passwd',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Path traversal');
    });

    it('should enforce file size limits', async () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB

      const writeResult = await server.executeTool('fs_write', {
        path: 'large.txt',
        content: largeContent,
      });

      // Write should succeed
      expect(writeResult.success).toBe(true);

      // But read should fail due to size limit
      const readResult = await server.executeTool('fs_read', {
        path: 'large.txt',
      });

      expect(readResult.success).toBe(false);
      expect(readResult.error).toContain('too large');
    });
  });

  describe('Pattern Matching', () => {
    it('should filter files by pattern', async () => {
      await server.executeTool('fs_write', { path: 'test.txt', content: 'a' });
      await server.executeTool('fs_write', { path: 'test.md', content: 'b' });
      await server.executeTool('fs_write', { path: 'other.txt', content: 'c' });

      const listResult = await server.executeTool('fs_list', {
        path: '.',
        pattern: '*.txt',
      });

      expect(listResult.success).toBe(true);
      expect(listResult.data.files.every((f: any) => f.name.endsWith('.txt'))).toBe(true);
    });
  });
});
