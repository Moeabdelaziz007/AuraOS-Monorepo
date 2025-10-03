import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileSystemMCPServer } from '../filesystem';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs module
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  mkdir: vi.fn(),
  unlink: vi.fn(),
  rm: vi.fn(),
  copyFile: vi.fn(),
  rename: vi.fn(),
  access: vi.fn()
}));

describe('FileSystem MCP Server Integration Tests', () => {
  let server: FileSystemMCPServer;
  const testRootPath = '/tmp/auraos-test';

  beforeEach(() => {
    vi.clearAllMocks();
    server = new FileSystemMCPServer(testRootPath);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('File Operations', () => {
    it('should read file contents', async () => {
      const mockContent = 'Hello World';
      const mockStats = { size: mockContent.length };
      
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);

      const result = await server.executeTool('fs_read', { path: 'test.txt' });

      expect(result).toEqual({
        content: mockContent,
        size: mockContent.length,
        encoding: 'utf-8'
      });
      expect(fs.readFile).toHaveBeenCalledWith(
        path.join(testRootPath, 'test.txt'),
        'utf-8'
      );
    });

    it('should write file contents', async () => {
      const mockContent = 'Hello World';
      const mockStats = { size: mockContent.length };
      
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const result = await server.executeTool('fs_write', { 
        path: 'test.txt', 
        content: mockContent 
      });

      expect(result).toEqual({
        bytesWritten: mockContent.length,
        path: 'test.txt'
      });
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(testRootPath, 'test.txt'),
        mockContent,
        'utf-8'
      );
    });

    it('should handle file size limits', async () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const mockStats = { size: largeContent.length };
      
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);

      await expect(
        server.executeTool('fs_read', { path: 'large.txt' })
      ).rejects.toThrow('File too large');
    });

    it('should handle append mode', async () => {
      const content = 'New content';
      const mockStats = { size: content.length };
      
      vi.mocked(fs.appendFile).mockResolvedValue(undefined);
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const result = await server.executeTool('fs_write', { 
        path: 'test.txt', 
        content,
        append: true
      });

      expect(result.bytesWritten).toBe(content.length);
    });
  });

  describe('Directory Operations', () => {
    it('should list directory contents', async () => {
      const mockEntries = [
        { name: 'file1.txt', isDirectory: () => false },
        { name: 'folder1', isDirectory: () => true }
      ];
      
      vi.mocked(fs.readdir).mockResolvedValue(mockEntries as any);
      vi.mocked(fs.stat).mockImplementation((filePath) => {
        const stats = {
          size: 100,
          birthtime: new Date(),
          mtime: new Date()
        };
        return Promise.resolve(stats as any);
      });

      const result = await server.executeTool('fs_list', { path: '.' });

      expect(result.files).toHaveLength(2);
      expect(result.files[0]).toMatchObject({
        name: 'file1.txt',
        type: 'file'
      });
      expect(result.files[1]).toMatchObject({
        name: 'folder1',
        type: 'directory'
      });
    });

    it('should create directories', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const result = await server.executeTool('fs_mkdir', { path: 'new-folder' });

      expect(result).toEqual({
        created: true,
        path: 'new-folder'
      });
      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(testRootPath, 'new-folder'),
        { recursive: false }
      );
    });

    it('should create directories recursively', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const result = await server.executeTool('fs_mkdir', { 
        path: 'deep/nested/folder',
        recursive: true
      });

      expect(result).toEqual({
        created: true,
        path: 'deep/nested/folder'
      });
      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(testRootPath, 'deep/nested/folder'),
        { recursive: true }
      );
    });
  });

  describe('File Management', () => {
    it('should delete files', async () => {
      const mockStats = { isDirectory: () => false };
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);
      vi.mocked(fs.unlink).mockResolvedValue(undefined);

      const result = await server.executeTool('fs_delete', { path: 'file.txt' });

      expect(result).toEqual({
        deleted: true,
        path: 'file.txt'
      });
      expect(fs.unlink).toHaveBeenCalledWith(
        path.join(testRootPath, 'file.txt')
      );
    });

    it('should delete directories', async () => {
      const mockStats = { isDirectory: () => true };
      vi.mocked(fs.stat).mockResolvedValue(mockStats as any);
      vi.mocked(fs.rm).mockResolvedValue(undefined);

      const result = await server.executeTool('fs_delete', { 
        path: 'folder',
        recursive: true
      });

      expect(result).toEqual({
        deleted: true,
        path: 'folder'
      });
      expect(fs.rm).toHaveBeenCalledWith(
        path.join(testRootPath, 'folder'),
        { recursive: true }
      );
    });

    it('should copy files', async () => {
      vi.mocked(fs.copyFile).mockResolvedValue(undefined);
      vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));

      const result = await server.executeTool('fs_copy', { 
        source: 'source.txt',
        destination: 'dest.txt'
      });

      expect(result).toEqual({
        copied: true,
        destination: 'dest.txt'
      });
      expect(fs.copyFile).toHaveBeenCalledWith(
        path.join(testRootPath, 'source.txt'),
        path.join(testRootPath, 'dest.txt')
      );
    });

    it('should move files', async () => {
      vi.mocked(fs.rename).mockResolvedValue(undefined);

      const result = await server.executeTool('fs_move', { 
        source: 'old.txt',
        destination: 'new.txt'
      });

      expect(result).toEqual({
        moved: true,
        destination: 'new.txt'
      });
      expect(fs.rename).toHaveBeenCalledWith(
        path.join(testRootPath, 'old.txt'),
        path.join(testRootPath, 'new.txt')
      );
    });
  });

  describe('Search Operations', () => {
    it('should search files by name', async () => {
      const mockEntries = [
        { name: 'test.txt', isDirectory: () => false },
        { name: 'other.txt', isDirectory: () => false }
      ];
      
      vi.mocked(fs.readdir).mockResolvedValue(mockEntries as any);
      vi.mocked(fs.stat).mockResolvedValue({ size: 100 } as any);

      const result = await server.executeTool('fs_search', { 
        path: '.',
        query: 'test'
      });

      expect(result.results).toHaveLength(1);
      expect(result.results[0].path).toBe('test.txt');
    });

    it('should search files by content', async () => {
      const mockEntries = [
        { name: 'file1.txt', isDirectory: () => false },
        { name: 'file2.txt', isDirectory: () => false }
      ];
      
      vi.mocked(fs.readdir).mockResolvedValue(mockEntries as any);
      vi.mocked(fs.stat).mockImplementation((filePath) => {
        const size = filePath.includes('file1') ? 50 : 100;
        return Promise.resolve({ size } as any);
      });
      vi.mocked(fs.readFile).mockImplementation((filePath) => {
        const content = filePath.includes('file1') ? 'Hello World' : 'Goodbye World';
        return Promise.resolve(content);
      });

      const result = await server.executeTool('fs_search', { 
        path: '.',
        query: 'Hello',
        searchContent: true
      });

      expect(result.results).toHaveLength(1);
      expect(result.results[0].path).toBe('file1.txt');
    });
  });

  describe('Security', () => {
    it('should prevent path traversal attacks', async () => {
      await expect(
        server.executeTool('fs_read', { path: '../../../etc/passwd' })
      ).rejects.toThrow('Path traversal not allowed');
    });

    it('should prevent access outside root directory', async () => {
      await expect(
        server.executeTool('fs_read', { path: '/etc/passwd' })
      ).rejects.toThrow('Access denied: path outside root directory');
    });
  });

  describe('Error Handling', () => {
    it('should handle file not found errors', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));

      await expect(
        server.executeTool('fs_read', { path: 'nonexistent.txt' })
      ).rejects.toThrow('Path does not exist');
    });

    it('should handle permission errors', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Permission denied'));

      await expect(
        server.executeTool('fs_read', { path: 'protected.txt' })
      ).rejects.toThrow('Permission denied');
    });

    it('should handle directory creation errors', async () => {
      vi.mocked(fs.mkdir).mockRejectedValue(new Error('Permission denied'));

      await expect(
        server.executeTool('fs_mkdir', { path: 'protected-folder' })
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('Performance', () => {
    it('should handle large directory listings', async () => {
      const largeEntryList = Array.from({ length: 1000 }, (_, i) => ({
        name: `file${i}.txt`,
        isDirectory: () => false
      }));
      
      vi.mocked(fs.readdir).mockResolvedValue(largeEntryList as any);
      vi.mocked(fs.stat).mockResolvedValue({ 
        size: 100, 
        birthtime: new Date(), 
        mtime: new Date() 
      } as any);

      const startTime = Date.now();
      const result = await server.executeTool('fs_list', { path: '.' });
      const endTime = Date.now();

      expect(result.files).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent operations', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('content');
      vi.mocked(fs.stat).mockResolvedValue({ size: 100 } as any);

      const promises = Array.from({ length: 10 }, (_, i) =>
        server.executeTool('fs_read', { path: `file${i}.txt` })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.content).toBe('content');
      });
    });
  });
});
