import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileSystem } from './fileSystem';

describe('FileSystem Utility', () => {
  let fs: FileSystem;

  beforeEach(() => {
    fs = new FileSystem();
  });

  describe('Directory Operations', () => {
    it('should create directory', async () => {
      await fs.mkdir('/home/testdir');
      
      const exists = await fs.exists('/home/testdir');
      expect(exists).toBe(true);
    });

    it('should create nested directories with -p flag', async () => {
      await fs.mkdir('/home/user/docs/work', { recursive: true });
      
      expect(await fs.exists('/home/user/docs/work')).toBe(true);
      expect(await fs.exists('/home/user/docs')).toBe(true);
    });

    it('should fail to create directory without -p flag', async () => {
      await expect(fs.mkdir('/home/nonexistent/testdir')).rejects.toThrow();
    });

    it('should list directory contents', async () => {
      await fs.mkdir('/home/testdir');
      await fs.writeFile('/home/testdir/file1.txt', 'content1');
      await fs.writeFile('/home/testdir/file2.txt', 'content2');
      
      const contents = await fs.readdir('/home/testdir');
      expect(contents).toContain('file1.txt');
      expect(contents).toContain('file2.txt');
    });

    it('should list directory with details', async () => {
      await fs.mkdir('/home/testdir');
      await fs.writeFile('/home/testdir/file.txt', 'content');
      
      const contents = await fs.readdir('/home/testdir', { detailed: true });
      expect(contents[0]).toHaveProperty('name');
      expect(contents[0]).toHaveProperty('size');
      expect(contents[0]).toHaveProperty('modified');
      expect(contents[0]).toHaveProperty('type');
    });

    it('should remove empty directory', async () => {
      await fs.mkdir('/home/testdir');
      await fs.rmdir('/home/testdir');
      
      expect(await fs.exists('/home/testdir')).toBe(false);
    });

    it('should fail to remove non-empty directory', async () => {
      await fs.mkdir('/home/testdir');
      await fs.writeFile('/home/testdir/file.txt', 'content');
      
      await expect(fs.rmdir('/home/testdir')).rejects.toThrow();
    });

    it('should remove directory recursively', async () => {
      await fs.mkdir('/home/testdir');
      await fs.writeFile('/home/testdir/file.txt', 'content');
      
      await fs.rmdir('/home/testdir', { recursive: true });
      expect(await fs.exists('/home/testdir')).toBe(false);
    });
  });

  describe('File Operations', () => {
    it('should create and read file', async () => {
      await fs.writeFile('/home/test.txt', 'Hello World');
      
      const content = await fs.readFile('/home/test.txt');
      expect(content).toBe('Hello World');
    });

    it('should overwrite existing file', async () => {
      await fs.writeFile('/home/test.txt', 'First');
      await fs.writeFile('/home/test.txt', 'Second');
      
      const content = await fs.readFile('/home/test.txt');
      expect(content).toBe('Second');
    });

    it('should append to file', async () => {
      await fs.writeFile('/home/test.txt', 'First\n');
      await fs.appendFile('/home/test.txt', 'Second\n');
      
      const content = await fs.readFile('/home/test.txt');
      expect(content).toBe('First\nSecond\n');
    });

    it('should delete file', async () => {
      await fs.writeFile('/home/test.txt', 'content');
      await fs.unlink('/home/test.txt');
      
      expect(await fs.exists('/home/test.txt')).toBe(false);
    });

    it('should get file stats', async () => {
      await fs.writeFile('/home/test.txt', 'content');
      
      const stats = await fs.stat('/home/test.txt');
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('modified');
      expect(stats).toHaveProperty('created');
      expect(stats.type).toBe('file');
    });

    it('should copy file', async () => {
      await fs.writeFile('/home/source.txt', 'content');
      await fs.copyFile('/home/source.txt', '/home/dest.txt');
      
      const content = await fs.readFile('/home/dest.txt');
      expect(content).toBe('content');
    });

    it('should move file', async () => {
      await fs.writeFile('/home/source.txt', 'content');
      await fs.rename('/home/source.txt', '/home/dest.txt');
      
      expect(await fs.exists('/home/source.txt')).toBe(false);
      expect(await fs.exists('/home/dest.txt')).toBe(true);
    });
  });

  describe('Path Operations', () => {
    it('should resolve absolute path', () => {
      const path = fs.resolvePath('/home/user/../test.txt');
      expect(path).toBe('/home/test.txt');
    });

    it('should resolve relative path', () => {
      fs.setCurrentDirectory('/home/user');
      const path = fs.resolvePath('./test.txt');
      expect(path).toBe('/home/user/test.txt');
    });

    it('should get basename', () => {
      const name = fs.basename('/home/user/test.txt');
      expect(name).toBe('test.txt');
    });

    it('should get dirname', () => {
      const dir = fs.dirname('/home/user/test.txt');
      expect(dir).toBe('/home/user');
    });

    it('should join paths', () => {
      const path = fs.joinPath('/home', 'user', 'test.txt');
      expect(path).toBe('/home/user/test.txt');
    });

    it('should normalize path', () => {
      const path = fs.normalizePath('/home//user/./test/../file.txt');
      expect(path).toBe('/home/user/file.txt');
    });
  });

  describe('Permissions', () => {
    it('should check read permission', async () => {
      await fs.writeFile('/home/test.txt', 'content');
      
      const canRead = await fs.canRead('/home/test.txt');
      expect(canRead).toBe(true);
    });

    it('should check write permission', async () => {
      await fs.writeFile('/home/test.txt', 'content');
      
      const canWrite = await fs.canWrite('/home/test.txt');
      expect(canWrite).toBe(true);
    });

    it('should check execute permission', async () => {
      await fs.writeFile('/home/script.sh', '#!/bin/bash');
      await fs.chmod('/home/script.sh', 0o755);
      
      const canExecute = await fs.canExecute('/home/script.sh');
      expect(canExecute).toBe(true);
    });

    it('should change file permissions', async () => {
      await fs.writeFile('/home/test.txt', 'content');
      await fs.chmod('/home/test.txt', 0o644);
      
      const stats = await fs.stat('/home/test.txt');
      expect(stats.mode).toBe(0o644);
    });
  });

  describe('Search Operations', () => {
    it('should find files by name', async () => {
      await fs.writeFile('/home/test1.txt', 'content');
      await fs.writeFile('/home/test2.txt', 'content');
      await fs.writeFile('/home/other.txt', 'content');
      
      const results = await fs.find('/home', { name: 'test*.txt' });
      expect(results).toHaveLength(2);
      expect(results).toContain('/home/test1.txt');
      expect(results).toContain('/home/test2.txt');
    });

    it('should find files by content', async () => {
      await fs.writeFile('/home/file1.txt', 'hello world');
      await fs.writeFile('/home/file2.txt', 'goodbye world');
      
      const results = await fs.grep('/home', 'hello');
      expect(results).toHaveLength(1);
      expect(results[0].file).toBe('/home/file1.txt');
    });

    it('should find files by type', async () => {
      await fs.mkdir('/home/dir1');
      await fs.writeFile('/home/file1.txt', 'content');
      
      const files = await fs.find('/home', { type: 'file' });
      const dirs = await fs.find('/home', { type: 'directory' });
      
      expect(files).toContain('/home/file1.txt');
      expect(dirs).toContain('/home/dir1');
    });
  });

  describe('Storage Management', () => {
    it('should get storage usage', async () => {
      await fs.writeFile('/home/test.txt', 'x'.repeat(1000));
      
      const usage = await fs.getStorageUsage();
      expect(usage.used).toBeGreaterThan(0);
      expect(usage.total).toBeGreaterThan(usage.used);
    });

    it('should clear cache', async () => {
      await fs.writeFile('/tmp/cache.txt', 'cached data');
      
      await fs.clearCache();
      
      expect(await fs.exists('/tmp/cache.txt')).toBe(false);
    });

    it('should handle storage quota exceeded', async () => {
      const largeContent = 'x'.repeat(100 * 1024 * 1024); // 100MB
      
      await expect(fs.writeFile('/home/large.txt', largeContent)).rejects.toThrow('quota');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-existent file', async () => {
      await expect(fs.readFile('/nonexistent.txt')).rejects.toThrow();
    });

    it('should throw error for invalid path', async () => {
      await expect(fs.readFile('')).rejects.toThrow();
    });

    it('should throw error for directory as file', async () => {
      await fs.mkdir('/home/testdir');
      await expect(fs.readFile('/home/testdir')).rejects.toThrow();
    });

    it('should throw error for file as directory', async () => {
      await fs.writeFile('/home/test.txt', 'content');
      await expect(fs.readdir('/home/test.txt')).rejects.toThrow();
    });
  });

  describe('Persistence', () => {
    it('should persist data to IndexedDB', async () => {
      await fs.writeFile('/home/test.txt', 'persistent data');
      
      // Create new instance to simulate reload
      const newFs = new FileSystem();
      await newFs.initialize();
      
      const content = await newFs.readFile('/home/test.txt');
      expect(content).toBe('persistent data');
    });

    it('should handle concurrent operations', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(fs.writeFile(`/home/file${i}.txt`, `content${i}`));
      }
      
      await Promise.all(promises);
      
      for (let i = 0; i < 10; i++) {
        const content = await fs.readFile(`/home/file${i}.txt`);
        expect(content).toBe(`content${i}`);
      }
    });
  });
});
