/**
 * A2A Message Bus
 * Core message routing and delivery system for app-to-agent communication
 */

import {
  A2AMessage,
  MessageType,
  Priority,
  MessageHandler,
  MessageFilter,
  MessageSubscription,
  MessageBusStats
} from './types';

interface QueuedMessage {
  message: A2AMessage;
  retries: number;
  addedAt: number;
}

export class A2AMessageBus {
  private subscribers: Map<string, MessageSubscription[]> = new Map();
  private messageQueue: QueuedMessage[] = [];
  private processing: boolean = false;
  private stats: MessageBusStats = {
    totalMessages: 0,
    messagesPerSecond: 0,
    averageLatency: 0,
    queueSize: 0,
    activeSubscribers: 0,
    errorRate: 0
  };
  private latencies: number[] = [];
  private errors: number = 0;
  private readonly maxRetries = 3;
  private readonly maxQueueSize = 10000;

  constructor() {
    this.startProcessing();
    this.startStatsCollection();
  }

  /**
   * Publish a message to the bus
   */
  async publish(message: A2AMessage): Promise<void> {
    const startTime = Date.now();

    // Validate message
    if (!this.validateMessage(message)) {
      throw new Error('Invalid message format');
    }

    // Check queue size
    if (this.messageQueue.length >= this.maxQueueSize) {
      throw new Error('Message queue full');
    }

    // Add to queue
    this.messageQueue.push({
      message,
      retries: 0,
      addedAt: Date.now()
    });

    // Sort by priority
    this.messageQueue.sort((a, b) => a.message.priority - b.message.priority);

    this.stats.totalMessages++;
    this.stats.queueSize = this.messageQueue.length;

    const latency = Date.now() - startTime;
    this.latencies.push(latency);

    console.log(`📨 Message published: ${message.type} from ${message.from} to ${message.to}`);
  }

  /**
   * Subscribe to messages matching a filter
   */
  subscribe(filter: MessageFilter, handler: MessageHandler): MessageSubscription {
    const subscriptionId = this.generateId();
    
    const subscription: MessageSubscription = {
      id: subscriptionId,
      filter,
      handler,
      unsubscribe: () => this.unsubscribe(subscriptionId)
    };

    // Store by message type for efficient lookup
    const types = Array.isArray(filter.type) ? filter.type : [filter.type || '*'];
    
    types.forEach(type => {
      const key = type.toString();
      if (!this.subscribers.has(key)) {
        this.subscribers.set(key, []);
      }
      this.subscribers.get(key)!.push(subscription);
    });

    this.stats.activeSubscribers++;

    console.log(`✅ Subscription created: ${subscriptionId} for types: ${types.join(', ')}`);

    return subscription;
  }

  /**
   * Unsubscribe from messages
   */
  private unsubscribe(subscriptionId: string): void {
    let removed = 0;
    
    this.subscribers.forEach((subs, key) => {
      const filtered = subs.filter(sub => sub.id !== subscriptionId);
      if (filtered.length !== subs.length) {
        removed++;
        this.subscribers.set(key, filtered);
      }
    });

    if (removed > 0) {
      this.stats.activeSubscribers--;
      console.log(`🗑️ Subscription removed: ${subscriptionId}`);
    }
  }

  /**
   * Request-response pattern
   */
  async request<T = any>(message: A2AMessage, timeout: number = 5000): Promise<A2AMessage<T>> {
    return new Promise((resolve, reject) => {
      const correlationId = this.generateId();
      message.correlationId = correlationId;
      message.requiresResponse = true;

      // Set up response handler
      const responseSubscription = this.subscribe(
        {
          type: MessageType.DATA_RESPONSE,
          from: message.to as string
        },
        (response) => {
          if (response.correlationId === correlationId) {
            responseSubscription.unsubscribe();
            clearTimeout(timeoutHandle);
            resolve(response as A2AMessage<T>);
          }
        }
      );

      // Set timeout
      const timeoutHandle = setTimeout(() => {
        responseSubscription.unsubscribe();
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      // Send request
      this.publish(message).catch(reject);
    });
  }

  /**
   * Broadcast message to all subscribers
   */
  async broadcast(message: Omit<A2AMessage, 'to'>): Promise<void> {
    await this.publish({
      ...message,
      to: 'broadcast'
    } as A2AMessage);
  }

  /**
   * Get current statistics
   */
  getStats(): MessageBusStats {
    return { ...this.stats };
  }

  /**
   * Clear all messages and subscriptions
   */
  clear(): void {
    this.messageQueue = [];
    this.subscribers.clear();
    this.stats.queueSize = 0;
    this.stats.activeSubscribers = 0;
    console.log('🧹 Message bus cleared');
  }

  /**
   * Process message queue
   */
  private async startProcessing(): Promise<void> {
    this.processing = true;

    const processLoop = async () => {
      while (this.processing) {
        if (this.messageQueue.length > 0) {
          const queued = this.messageQueue.shift()!;
          await this.deliverMessage(queued);
        } else {
          // Wait a bit before checking again
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    };

    processLoop();
  }

  /**
   * Deliver message to subscribers
   */
  private async deliverMessage(queued: QueuedMessage): Promise<void> {
    const { message, retries } = queued;
    const startTime = Date.now();

    try {
      // Check TTL
      if (message.ttl && Date.now() - message.timestamp > message.ttl) {
        console.warn(`⏰ Message expired: ${message.id}`);
        return;
      }

      // Find matching subscribers
      const subscribers = this.findSubscribers(message);

      if (subscribers.length === 0) {
        console.warn(`⚠️ No subscribers for message: ${message.type} to ${message.to}`);
        return;
      }

      // Deliver to all subscribers
      await Promise.all(
        subscribers.map(sub => this.invokeHandler(sub.handler, message))
      );

      const latency = Date.now() - startTime;
      this.latencies.push(latency);

      console.log(`✅ Message delivered: ${message.id} to ${subscribers.length} subscriber(s) in ${latency}ms`);

    } catch (error) {
      console.error(`❌ Message delivery failed: ${message.id}`, error);
      this.errors++;

      // Retry logic
      if (retries < this.maxRetries) {
        console.log(`🔄 Retrying message: ${message.id} (attempt ${retries + 1}/${this.maxRetries})`);
        this.messageQueue.push({
          message,
          retries: retries + 1,
          addedAt: queued.addedAt
        });
      } else {
        console.error(`💀 Message failed after ${this.maxRetries} retries: ${message.id}`);
      }
    } finally {
      this.stats.queueSize = this.messageQueue.length;
    }
  }

  /**
   * Find subscribers matching message
   */
  private findSubscribers(message: A2AMessage): MessageSubscription[] {
    const subscribers: MessageSubscription[] = [];

    // Get subscribers for this message type
    const typeSubscribers = this.subscribers.get(message.type) || [];
    const wildcardSubscribers = this.subscribers.get('*') || [];

    [...typeSubscribers, ...wildcardSubscribers].forEach(sub => {
      if (this.matchesFilter(message, sub.filter)) {
        subscribers.push(sub);
      }
    });

    return subscribers;
  }

  /**
   * Check if message matches filter
   */
  private matchesFilter(message: A2AMessage, filter: MessageFilter): boolean {
    // Check type
    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      if (!types.includes(message.type)) {
        return false;
      }
    }

    // Check from
    if (filter.from) {
      const froms = Array.isArray(filter.from) ? filter.from : [filter.from];
      if (!froms.includes(message.from)) {
        return false;
      }
    }

    // Check to
    if (filter.to) {
      const tos = Array.isArray(filter.to) ? filter.to : [filter.to];
      if (message.to !== 'broadcast' && !tos.includes(message.to as string)) {
        return false;
      }
    }

    // Check priority
    if (filter.priority) {
      const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
      if (!priorities.includes(message.priority)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Invoke message handler safely
   */
  private async invokeHandler(handler: MessageHandler, message: A2AMessage): Promise<void> {
    try {
      await handler(message);
    } catch (error) {
      console.error('Handler error:', error);
      throw error;
    }
  }

  /**
   * Validate message format
   */
  private validateMessage(message: A2AMessage): boolean {
    if (!message.id || !message.from || !message.to || !message.type) {
      return false;
    }
    if (message.priority === undefined) {
      return false;
    }
    return true;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Collect statistics
   */
  private startStatsCollection(): void {
    setInterval(() => {
      // Calculate messages per second
      this.stats.messagesPerSecond = this.stats.totalMessages / 
        ((Date.now() - (this.latencies[0] || Date.now())) / 1000);

      // Calculate average latency
      if (this.latencies.length > 0) {
        const sum = this.latencies.reduce((a, b) => a + b, 0);
        this.stats.averageLatency = sum / this.latencies.length;
        
        // Keep only last 100 latencies
        if (this.latencies.length > 100) {
          this.latencies = this.latencies.slice(-100);
        }
      }

      // Calculate error rate
      this.stats.errorRate = this.stats.totalMessages > 0
        ? this.errors / this.stats.totalMessages
        : 0;

    }, 1000);
  }

  /**
   * Stop processing
   */
  stop(): void {
    this.processing = false;
    console.log('🛑 Message bus stopped');
  }
}

// Singleton instance
export const messageBus = new A2AMessageBus();
