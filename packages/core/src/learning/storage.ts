/**
 * Learning Data Storage
 * Manages persistent storage of learning data
 */

import type { UserInteraction, UserPattern, LearningInsight, AIModelState, LearningMetrics } from './types';

export class LearningStorage {
  private dbName = 'auraos-learning';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Interactions store
        if (!db.objectStoreNames.contains('interactions')) {
          const interactionsStore = db.createObjectStore('interactions', { keyPath: 'id' });
          interactionsStore.createIndex('userId', 'userId', { unique: false });
          interactionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          interactionsStore.createIndex('type', 'type', { unique: false });
        }

        // Patterns store
        if (!db.objectStoreNames.contains('patterns')) {
          const patternsStore = db.createObjectStore('patterns', { keyPath: 'userId' });
          patternsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        // Insights store
        if (!db.objectStoreNames.contains('insights')) {
          const insightsStore = db.createObjectStore('insights', { keyPath: 'id' });
          insightsStore.createIndex('userId', 'userId', { unique: false });
          insightsStore.createIndex('type', 'type', { unique: false });
          insightsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Model state store
        if (!db.objectStoreNames.contains('modelState')) {
          db.createObjectStore('modelState', { keyPath: 'version' });
        }

        // Metrics store
        if (!db.objectStoreNames.contains('metrics')) {
          db.createObjectStore('metrics', { keyPath: 'id' });
        }
      };
    });
  }

  // Interactions
  async saveInteraction(interaction: UserInteraction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['interactions'], 'readwrite');
      const store = transaction.objectStore('interactions');
      const request = store.add(interaction);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getInteractions(userId: string, limit = 100): Promise<UserInteraction[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['interactions'], 'readonly');
      const store = transaction.objectStore('interactions');
      const index = store.index('userId');
      const request = index.getAll(userId, limit);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getRecentInteractions(limit = 50): Promise<UserInteraction[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['interactions'], 'readonly');
      const store = transaction.objectStore('interactions');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      const results: UserInteraction[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Patterns
  async savePattern(pattern: UserPattern): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patterns'], 'readwrite');
      const store = transaction.objectStore('patterns');
      const request = store.put(pattern);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPattern(userId: string): Promise<UserPattern | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patterns'], 'readonly');
      const store = transaction.objectStore('patterns');
      const request = store.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Insights
  async saveInsight(insight: LearningInsight): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readwrite');
      const store = transaction.objectStore('insights');
      const request = store.add(insight);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getInsights(userId: string): Promise<LearningInsight[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readonly');
      const store = transaction.objectStore('insights');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Model State
  async saveModelState(state: AIModelState): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['modelState'], 'readwrite');
      const store = transaction.objectStore('modelState');
      const request = store.put(state);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getModelState(): Promise<AIModelState | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['modelState'], 'readonly');
      const store = transaction.objectStore('modelState');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        resolve(results.length > 0 ? results[results.length - 1] : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Metrics
  async saveMetrics(metrics: LearningMetrics): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metrics'], 'readwrite');
      const store = transaction.objectStore('metrics');
      const request = store.put({ ...metrics, id: 'current' });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMetrics(): Promise<LearningMetrics | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metrics'], 'readonly');
      const store = transaction.objectStore('metrics');
      const request = store.get('current');

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Cleanup old data
  async cleanup(daysToKeep = 30): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['interactions'], 'readwrite');
      const store = transaction.objectStore('interactions');
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export const learningStorage = new LearningStorage();
