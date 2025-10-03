/**
 * A2A Message Bus Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { A2AMessageBus } from '../message-bus';
import { MessageType, Priority, A2AMessage } from '../types';

describe('A2A Message Bus', () => {
  let messageBus: A2AMessageBus;

  beforeEach(() => {
    messageBus = new A2AMessageBus();
  });

  afterEach(() => {
    messageBus.shutdown();
  });

  describe('Message Publishing', () => {
    it('should publish a message', async () => {
      const message: A2AMessage = {
        id: 'test-1',
        from: 'agent-1',
        to: 'agent-2',
        type: MessageType.DATA_REQUEST,
        payload: { query: 'test' },
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false
      };

      await expect(messageBus.publish(message)).resolves.not.toThrow();
    });

    it('should handle broadcast messages', async () => {
      const message: A2AMessage = {
        id: 'broadcast-1',
        from: 'agent-1',
        to: 'broadcast',
        type: MessageType.STATE_UPDATE,
        payload: { state: 'active' },
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false
      };

      await expect(messageBus.publish(message)).resolves.not.toThrow();
    });

    it('should respect message priority', async () => {
      const receivedMessages: A2AMessage[] = [];

      messageBus.subscribe({
        type: MessageType.TASK_REQUEST
      }, async (msg) => {
        receivedMessages.push(msg);
      });

      // Publish low priority first
      await messageBus.publish({
        id: 'low-1',
        from: 'agent-1',
        to: 'agent-2',
        type: MessageType.TASK_REQUEST,
        payload: {},
        priority: Priority.LOW,
        timestamp: Date.now(),
        requiresResponse: false
      });

      // Publish high priority second
      await messageBus.publish({
        id: 'high-1',
        from: 'agent-1',
        to: 'agent-2',
        type: MessageType.TASK_REQUEST,
        payload: {},
        priority: Priority.HIGH,
        timestamp: Date.now(),
        requiresResponse: false
      });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // High priority should be processed first
      expect(receivedMessages[0].id).toBe('high-1');
      expect(receivedMessages[1].id).toBe('low-1');
    });
  });

  describe('Message Subscription', () => {
    it('should subscribe to specific message type', async () => {
      const handler = vi.fn();

      messageBus.subscribe({
        type: MessageType.DATA_REQUEST
      }, handler);

      await messageBus.publish({
        id: 'test-1',
        from: 'agent-1',
        to: 'agent-2',
        type: MessageType.DATA_REQUEST,
        payload: {},
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should filter messages by sender', async () => {
      const handler = vi.fn();

      messageBus.subscribe({
        from: 'agent-1'
      }, handler);

      await messageBus.publish({
        id: 'test-1',
        from: 'agent-1',
        to: 'agent-2',
        type: MessageType.DATA_REQUEST,
        payload: {},
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false
      });

      await messageBus.publish({
        id: 'test-2',
        from: 'agent-3',
        to: 'agent-2',
        type: MessageType.DATA_REQUEST,
        payload: {},
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe correctly', async () => {
      const handler = vi.fn();

      const subscription = messageBus.subscribe({
        type: MessageType.DATA_REQUEST
      }, handler);

      await messageBus.publish({
        id: 'test-1',
        from: 'agent-1',
        to: 'agent-2',
        type: MessageType.DATA_REQUEST,
        payload: {},
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      subscription.unsubscribe();

      await messageBus.publish({
        id: 'test-2',
        from: 'agent-1',
        to: 'agent-2',
        type: MessageType.DATA_REQUEST,
        payload: {},
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Request-Response Pattern', () => {
    it('should handle request-response correlation', async () => {
      const correlationId = 'req-123';

      messageBus.subscribe({
        type: MessageType.DATA_REQUEST
      }, async (msg) => {
        // Send response
        await messageBus.publish({
          id: 'resp-1',
          from: msg.to as string,
          to: msg.from,
          type: MessageType.DATA_RESPONSE,
          payload: { result: 'success' },
          priority: Priority.NORMAL,
          timestamp: Date.now(),
          requiresResponse: false,
          correlationId: msg.correlationId
        });
      });

      const responsePromise = new Promise<A2AMessage>((resolve) => {
        messageBus.subscribe({
          type: MessageType.DATA_RESPONSE,
          to: 'agent-1'
        }, async (msg) => {
          if (msg.correlationId === correlationId) {
            resolve(msg);
          }
        });
      });

      await messageBus.publish({
        id: 'req-1',
        from: 'agent-1',
        to: 'agent-2',
        type: MessageType.DATA_REQUEST,
        payload: { query: 'test' },
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: true,
        correlationId
      });

      const response = await Promise.race([
        responsePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000))
      ]);

      expect(response).toBeDefined();
      expect((response as A2AMessage).correlationId).toBe(correlationId);
    });
  });

  describe('Message TTL', () => {
    it('should expire messages after TTL', async () => {
      const handler = vi.fn();

      messageBus.subscribe({
        type: MessageType.DATA_REQUEST
      }, handler);

      await messageBus.publish({
        id: 'test-1',
        from: 'agent-1',
        to: 'agent-2',
        type: MessageType.DATA_REQUEST,
        payload: {},
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false,
        ttl: 50 // 50ms TTL
      });

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    it('should track message statistics', async () => {
      await messageBus.publish({
        id: 'test-1',
        from: 'agent-1',
        to: 'agent-2',
        type: MessageType.DATA_REQUEST,
        payload: {},
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const stats = messageBus.getStats();

      expect(stats.totalMessages).toBeGreaterThan(0);
      expect(stats.activeSubscribers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle subscriber errors gracefully', async () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });

      const successHandler = vi.fn();

      messageBus.subscribe({
        type: MessageType.DATA_REQUEST
      }, errorHandler);

      messageBus.subscribe({
        type: MessageType.DATA_REQUEST
      }, successHandler);

      await messageBus.publish({
        id: 'test-1',
        from: 'agent-1',
        to: 'agent-2',
        type: MessageType.DATA_REQUEST,
        payload: {},
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Both handlers should be called despite error
      expect(errorHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();
    });
  });

  describe('Broadcast Messages', () => {
    it('should deliver broadcast to all subscribers', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      messageBus.subscribe({
        type: MessageType.STATE_UPDATE
      }, handler1);

      messageBus.subscribe({
        type: MessageType.STATE_UPDATE
      }, handler2);

      messageBus.subscribe({
        type: MessageType.STATE_UPDATE
      }, handler3);

      await messageBus.publish({
        id: 'broadcast-1',
        from: 'agent-1',
        to: 'broadcast',
        type: MessageType.STATE_UPDATE,
        payload: { state: 'active' },
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });
  });
});
