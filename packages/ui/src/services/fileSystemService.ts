/**
 * Virtual File System Service
 * Uses IndexedDB for persistent file storage
 */

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  parentId: string | null;
  size: number;
  content?: string | Blob;
  mimeType?: string;
  createdAt: Date;
  modifiedAt: Date;
}

const DB_NAME = 'AuraOS_FileSystem';
const DB_VERSION = 1;
const STORE_NAME = 'files';

class FileSystemService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('path', 'path', { unique: false });
          store.createIndex('parentId', 'parentId', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  private ensureDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  async createFile(name: string, parentId: string | null, content: string | Blob = '', mimeType?: string): Promise<FileItem> {
    const db = this.ensureDB();
    const parentPath = parentId ? await this.getPath(parentId) : '/';
    const path = `${parentPath}${parentPath === '/' ? '' : '/'}${name}`;

    const file: FileItem = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'file',
      path,
      parentId,
      size: typeof content === 'string' ? content.length : content.size,
      content,
      mimeType: mimeType || 'text/plain',
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(file);

      request.onsuccess = () => resolve(file);
      request.onerror = () => reject(request.error);
    });
  }

  async createFolder(name: string, parentId: string | null): Promise<FileItem> {
    const db = this.ensureDB();
    const parentPath = parentId ? await this.getPath(parentId) : '/';
    const path = `${parentPath}${parentPath === '/' ? '' : '/'}${name}`;

    const folder: FileItem = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'folder',
      path,
      parentId,
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(folder);

      request.onsuccess = () => resolve(folder);
      request.onerror = () => reject(request.error);
    });
  }

  async getFile(id: string): Promise<FileItem | null> {
    const db = this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async listFiles(parentId: string | null = null): Promise<FileItem[]> {
    const db = this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('parentId');
      const request = index.getAll(parentId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateFile(id: string, updates: Partial<FileItem>): Promise<FileItem> {
    const db = this.ensureDB();
    const file = await this.getFile(id);
    
    if (!file) {
      throw new Error('File not found');
    }

    const updatedFile: FileItem = {
      ...file,
      ...updates,
      modifiedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(updatedFile);

      request.onsuccess = () => resolve(updatedFile);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    const db = this.ensureDB();
    const file = await this.getFile(id);

    if (!file) {
      throw new Error('File not found');
    }

    // If it's a folder, delete all children recursively
    if (file.type === 'folder') {
      const children = await this.listFiles(id);
      await Promise.all(children.map(child => this.deleteFile(child.id)));
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async renameFile(id: string, newName: string): Promise<FileItem> {
    const file = await this.getFile(id);
    
    if (!file) {
      throw new Error('File not found');
    }

    const parentPath = file.parentId ? await this.getPath(file.parentId) : '/';
    const newPath = `${parentPath}${parentPath === '/' ? '' : '/'}${newName}`;

    return this.updateFile(id, { name: newName, path: newPath });
  }

  async moveFile(id: string, newParentId: string | null): Promise<FileItem> {
    const file = await this.getFile(id);
    
    if (!file) {
      throw new Error('File not found');
    }

    const newParentPath = newParentId ? await this.getPath(newParentId) : '/';
    const newPath = `${newParentPath}${newParentPath === '/' ? '' : '/'}${file.name}`;

    return this.updateFile(id, { parentId: newParentId, path: newPath });
  }

  async copyFile(id: string, newParentId: string | null): Promise<FileItem> {
    const file = await this.getFile(id);
    
    if (!file) {
      throw new Error('File not found');
    }

    if (file.type === 'file') {
      return this.createFile(file.name, newParentId, file.content, file.mimeType);
    } else {
      const newFolder = await this.createFolder(file.name, newParentId);
      const children = await this.listFiles(id);
      await Promise.all(children.map(child => this.copyFile(child.id, newFolder.id)));
      return newFolder;
    }
  }

  async searchFiles(query: string): Promise<FileItem[]> {
    const db = this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result.filter((file: FileItem) =>
          file.name.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getTotalSize(): Promise<number> {
    const db = this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const total = request.result.reduce((sum: number, file: FileItem) => sum + file.size, 0);
        resolve(total);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async getPath(id: string): Promise<string> {
    const file = await this.getFile(id);
    return file ? file.path : '/';
  }

  async initializeDefaultFiles(): Promise<void> {
    const files = await this.listFiles(null);
    
    if (files.length === 0) {
      // Create default folders
      const documentsFolder = await this.createFolder('Documents', null);
      const downloadsFolder = await this.createFolder('Downloads', null);
      const picturesFolder = await this.createFolder('Pictures', null);

      // Create sample files
      await this.createFile('Welcome.txt', documentsFolder.id, 
        'Welcome to AuraOS!\n\nThis is your virtual file system.\nYou can create, edit, and manage files here.', 
        'text/plain'
      );
      
      await this.createFile('README.md', documentsFolder.id,
        '# AuraOS File System\n\nA virtual file system powered by IndexedDB.\n\n## Features\n- Create files and folders\n- Copy, move, rename, delete\n- Search functionality\n- Persistent storage',
        'text/markdown'
      );
    }
  }
}

export const fileSystemService = new FileSystemService();
