/**
 * MCP Integration Tests
 * Tests the complete MCP infrastructure including gateway, servers, and client
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MCPGateway } from '../gateway';
import { MCPClient } from '../client';
import { BaseMCPServer } from '../server';
import { Tool, ToolResponse } from '../types';

// Mock MCP Server for testing
class TestMCPServer extends BaseMCPServer {
  name = 'test-server';
  version = '1.0.0';
  description = 'Test MCP server';

  tools: Tool[] = [
    {
      name: 'echo',
      description: 'Echo back the input',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
        required: ['message'],
      },
    },
    {
      name: 'add',
      description: 'Add two numbers',
      inputSchema: {
        type: 'object',
        properties: {
          a: { type: 'number' },
          b: { type: 'number' },
        },
        required: ['a', 'b'],
      },
    },
    {
      name: 'error',
      description: 'Always throws an error',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];

  protected async handleToolExecution(toolName: string, input: Record<string, any>): Promise<any> {
    switch (toolName) {
      case 'echo':
        return { message: input.message };
      case 'add':
        return { result: input.a + input.b };
      case 'error':
        throw new Error('Test error');
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

describe('MCP Integration Tests', () => {
  let gateway: MCPGateway;
  let client: MCPClient;
  let testServer: TestMCPServer;

  beforeEach(async () => {
    gateway = new MCPGateway({
      maxServers: 10,
      requestTimeout: 5000,
      enableLogging: true,
    });

    testServer = new TestMCPServer();
    await gateway.registerServer(testServer);

    client = new MCPClient(gateway, 'test-user', 'test-session');
  });

  afterEach(async () => {
    await gateway.shutdown();
  });

  describe('Gateway Registration', () => {
    it('should register a server successfully', async () => {
      const servers = gateway.getRegisteredServers();
      expect(servers).toContain('test-server');
    });

    it('should list all tools from registered servers', () => {
      const tools = gateway.getToolDefinitions();
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some((t) => t.name === 'echo')).toBe(true);
      expect(tools.some((t) => t.name === 'add')).toBe(true);
    });

    it('should prevent duplicate server registration', async () => {
      const duplicateServer = new TestMCPServer();
      await expect(gateway.registerServer(duplicateServer)).rejects.toThrow();
    });
  });

  describe('Tool Execution', () => {
    it('should execute echo tool successfully', async () => {
      const response = await client.executeTool('echo', { message: 'Hello, MCP!' });

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ message: 'Hello, MCP!' });
      expect(response.metadata).toBeDefined();
    });

    it('should execute add tool successfully', async () => {
      const response = await client.executeTool('add', { a: 5, b: 3 });

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ result: 8 });
    });

    it('should handle tool errors gracefully', async () => {
      const response = await client.executeTool('error', {});

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error).toContain('Test error');
    });

    it('should return error for non-existent tool', async () => {
      const response = await client.executeTool('non-existent', {});

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should validate required input fields', async () => {
      const response = await client.executeTool('echo', {});

      expect(response.success).toBe(false);
      expect(response.error).toContain('Missing required field');
    });
  });

  describe('Client Operations', () => {
    it('should get all available tools', () => {
      const tools = client.getAvailableTools();

      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some((t) => t.name === 'echo')).toBe(true);
    });

    it('should search tools by name', () => {
      const results = client.searchTools('echo');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('echo');
    });

    it('should search tools by description', () => {
      const results = client.searchTools('add');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some((t) => t.name === 'add')).toBe(true);
    });

    it('should get tools by server name', () => {
      const tools = client.getToolsByServer('test-server');

      expect(tools.length).toBe(3);
      expect(tools.map((t) => t.name)).toContain('echo');
      expect(tools.map((t) => t.name)).toContain('add');
    });

    it('should update user context', () => {
      client.setUser('new-user', 'new-session');

      // User context is internal, but we can verify it doesn't throw
      expect(() => client.setUser('another-user')).not.toThrow();
    });
  });

  describe('Gateway Statistics', () => {
    it('should track request statistics', async () => {
      await client.executeTool('echo', { message: 'test' });
      await client.executeTool('add', { a: 1, b: 2 });

      const stats = gateway.getStats();

      expect(stats.totalRequests).toBeGreaterThanOrEqual(2);
      expect(stats.successfulRequests).toBeGreaterThanOrEqual(2);
    });

    it('should track failed requests', async () => {
      await client.executeTool('error', {});

      const stats = gateway.getStats();

      expect(stats.failedRequests).toBeGreaterThanOrEqual(1);
    });

    it('should calculate average response time', async () => {
      await client.executeTool('echo', { message: 'test' });

      const stats = gateway.getStats();

      expect(stats.averageResponseTime).toBeGreaterThan(0);
    });
  });

  describe('Gateway Logging', () => {
    it('should log successful requests', async () => {
      await client.executeTool('echo', { message: 'test' });

      const logs = gateway.getLogs();

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[logs.length - 1].success).toBe(true);
    });

    it('should log failed requests', async () => {
      await client.executeTool('error', {});

      const logs = gateway.getLogs();

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[logs.length - 1].success).toBe(false);
    });

    it('should limit log size', async () => {
      // Execute many requests
      for (let i = 0; i < 150; i++) {
        await client.executeTool('echo', { message: `test-${i}` });
      }

      const logs = gateway.getLogs();

      // Should not exceed max log size (100)
      expect(logs.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Server Lifecycle', () => {
    it('should initialize server on first use', async () => {
      const newServer = new TestMCPServer();
      expect(newServer.isInitialized()).toBe(false);

      await gateway.registerServer(newServer);
      expect(newServer.isInitialized()).toBe(true);
    });

    it('should unregister server', async () => {
      await gateway.unregisterServer('test-server');

      const servers = gateway.getRegisteredServers();
      expect(servers).not.toContain('test-server');
    });

    it('should shutdown all servers', async () => {
      await gateway.shutdown();

      expect(testServer.isInitialized()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle server initialization errors', async () => {
      class FailingServer extends BaseMCPServer {
        name = 'failing-server';
        version = '1.0.0';
        tools: Tool[] = [];

        protected async onInitialize(): Promise<void> {
          throw new Error('Initialization failed');
        }

        protected async handleToolExecution(): Promise<any> {
          return {};
        }
      }

      const failingServer = new FailingServer();
      await expect(gateway.registerServer(failingServer)).rejects.toThrow('Initialization failed');
    });

    it('should handle tool execution timeout', async () => {
      class SlowServer extends BaseMCPServer {
        name = 'slow-server';
        version = '1.0.0';
        tools: Tool[] = [
          {
            name: 'slow',
            description: 'Slow operation',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ];

        protected async handleToolExecution(): Promise<any> {
          // Simulate slow operation
          await new Promise((resolve) => setTimeout(resolve, 10000));
          return {};
        }
      }

      const slowServer = new SlowServer();
      await gateway.registerServer(slowServer);

      const slowClient = new MCPClient(gateway);
      const response = await slowClient.executeTool('slow', {});

      expect(response.success).toBe(false);
      expect(response.error).toContain('timeout');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent tool executions', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        client.executeTool('echo', { message: `concurrent-${i}` })
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(10);
      expect(results.every((r) => r.success)).toBe(true);
    });

    it('should handle mixed success and failure', async () => {
      const promises = [
        client.executeTool('echo', { message: 'success' }),
        client.executeTool('error', {}),
        client.executeTool('add', { a: 1, b: 2 }),
        client.executeTool('error', {}),
      ];

      const results = await Promise.all(promises);

      expect(results.filter((r) => r.success).length).toBe(2);
      expect(results.filter((r) => !r.success).length).toBe(2);
    });
  });
});
