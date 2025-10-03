/**
 * Autopilot Learning Data Storage
 * Persists learned tasks, execution history, and learning context
 */

import {
  LearnedTask,
  TaskExecutionResult,
  AutopilotSuggestion,
  LearningContext,
  AutopilotStats,
} from './types';

export interface AutopilotData {
  tasks: LearnedTask[];
  executionHistory: TaskExecutionResult[];
  suggestions: AutopilotSuggestion[];
  stats: AutopilotStats;
  lastUpdated: Date;
}

/**
 * Storage interface for autopilot learning data
 */
export interface IAutopilotStorage {
  save(data: AutopilotData): Promise<void>;
  load(): Promise<AutopilotData | null>;
  clear(): Promise<void>;
  exportData(): Promise<string>;
  importData(data: string): Promise<void>;
}

/**
 * LocalStorage-based implementation
 */
export class LocalAutopilotStorage implements IAutopilotStorage {
  private readonly STORAGE_KEY = 'auraos_autopilot_data';
  private readonly BACKUP_KEY = 'auraos_autopilot_backup';

  async save(data: AutopilotData): Promise<void> {
    try {
      // Create backup before saving
      const existing = localStorage.getItem(this.STORAGE_KEY);
      if (existing) {
        localStorage.setItem(this.BACKUP_KEY, existing);
      }

      const serialized = JSON.stringify(data, this.replacer);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      
      logger.info('[Autopilot Storage] Data saved successfully');
    } catch (error) {
      logger.error('[Autopilot Storage] Failed to save data:', error);
      throw new Error('Failed to save autopilot data');
    }
  }

  async load(): Promise<AutopilotData | null> {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      
      if (!serialized) {
        logger.info('[Autopilot Storage] No saved data found');
        return null;
      }

      const data = JSON.parse(serialized, this.reviver);
      logger.info('[Autopilot Storage] Data loaded successfully');
      
      return data;
    } catch (error) {
      logger.error('[Autopilot Storage] Failed to load data:', error);
      
      // Try to restore from backup
      try {
        const backup = localStorage.getItem(this.BACKUP_KEY);
        if (backup) {
          logger.info('[Autopilot Storage] Restoring from backup');
          const data = JSON.parse(backup, this.reviver);
          return data;
        }
      } catch (backupError) {
        logger.error('[Autopilot Storage] Backup restoration failed:', backupError);
      }
      
      return null;
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.BACKUP_KEY);
      logger.info('[Autopilot Storage] Data cleared');
    } catch (error) {
      logger.error('[Autopilot Storage] Failed to clear data:', error);
      throw new Error('Failed to clear autopilot data');
    }
  }

  async exportData(): Promise<string> {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      
      if (!serialized) {
        throw new Error('No data to export');
      }

      // Pretty print for export
      const data = JSON.parse(serialized);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      logger.error('[Autopilot Storage] Failed to export data:', error);
      throw new Error('Failed to export autopilot data');
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      // Validate JSON
      const data = JSON.parse(jsonData);
      
      // Validate structure
      if (!this.isValidAutopilotData(data)) {
        throw new Error('Invalid autopilot data structure');
      }

      // Save imported data
      await this.save(data);
      logger.info('[Autopilot Storage] Data imported successfully');
    } catch (error) {
      logger.error('[Autopilot Storage] Failed to import data:', error);
      throw new Error('Failed to import autopilot data');
    }
  }

  /**
   * Custom replacer for JSON.stringify to handle Date objects
   */
  private replacer(key: string, value: any): any {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    if (value instanceof Map) {
      return { __type: 'Map', value: Array.from(value.entries()) };
    }
    return value;
  }

  /**
   * Custom reviver for JSON.parse to restore Date objects
   */
  private reviver(key: string, value: any): any {
    if (value && typeof value === 'object') {
      if (value.__type === 'Date') {
        return new Date(value.value);
      }
      if (value.__type === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }

  /**
   * Validate autopilot data structure
   */
  private isValidAutopilotData(data: any): data is AutopilotData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.tasks) &&
      Array.isArray(data.executionHistory) &&
      Array.isArray(data.suggestions) &&
      data.stats &&
      typeof data.stats === 'object'
    );
  }
}

/**
 * IndexedDB-based implementation for larger datasets
 */
export class IndexedDBAutopilotStorage implements IAutopilotStorage {
  private readonly DB_NAME = 'AuraOS_Autopilot';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'autopilot_data';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async save(data: AutopilotData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      const request = store.put({ id: 'main', ...data });

      request.onsuccess = () => {
        logger.info('[Autopilot Storage] Data saved to IndexedDB');
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to save to IndexedDB'));
      };
    });
  }

  async load(): Promise<AutopilotData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      
      const request = store.get('main');

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { id, ...data } = result;
          resolve(data as AutopilotData);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error('Failed to load from IndexedDB'));
      };
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      const request = store.clear();

      request.onsuccess = () => {
        logger.info('[Autopilot Storage] IndexedDB cleared');
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear IndexedDB'));
      };
    });
  }

  async exportData(): Promise<string> {
    const data = await this.load();
    if (!data) {
      throw new Error('No data to export');
    }
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    await this.save(data);
  }
}

/**
 * In-memory storage for Node.js/testing environments
 */
export class MemoryAutopilotStorage implements IAutopilotStorage {
  private data: AutopilotData | null = null;

  async save(data: AutopilotData): Promise<void> {
    this.data = JSON.parse(JSON.stringify(data)); // Deep clone
    logger.info('[Autopilot Storage] Data saved to memory');
  }

  async load(): Promise<AutopilotData | null> {
    if (this.data) {
      logger.info('[Autopilot Storage] Data loaded from memory');
      return JSON.parse(JSON.stringify(this.data)); // Deep clone
    }
    return null;
  }

  async clear(): Promise<void> {
    this.data = null;
    logger.info('[Autopilot Storage] Memory cleared');
  }

  async exportData(): Promise<string> {
    if (!this.data) {
      throw new Error('No data to export');
    }
    return JSON.stringify(this.data, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    await this.save(data);
  }
}

/**
 * Factory function to create appropriate storage based on environment
 */
export function createAutopilotStorage(): IAutopilotStorage {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    // Use IndexedDB if available and preferred
    if (typeof indexedDB !== 'undefined') {
      return new IndexedDBAutopilotStorage();
    }
    // Fallback to localStorage
    return new LocalAutopilotStorage();
  }
  
  // Use in-memory storage for Node.js/testing
  return new MemoryAutopilotStorage();
}
