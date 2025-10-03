/**
 * MCP Bridge for Telegram Bot
 * Connects Telegram commands to MCP servers
 */

import { MCPGateway } from '../../../packages/ai/src/mcp/gateway.js';
import { FileSystemMCPServer } from '../../../packages/core/src/mcp/filesystem-server.js';
import { EmulatorMCPServer } from '../../../packages/core/src/mcp/emulator-server.js';
import { BasicMCPServer } from '../../../packages/core/src/mcp/basic-server.js';

export class TelegramMCPBridge {
  constructor() {
    this.gateway = new MCPGateway({
      enableAuth: false,
      enableLogging: true,
    });
    this.initialized = false;
  }

  /**
   * Initialize MCP gateway and register servers
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('[MCP Bridge] Initializing MCP servers...');

    try {
      // Register MCP servers
      await this.gateway.registerServer(new FileSystemMCPServer());
      await this.gateway.registerServer(new EmulatorMCPServer());
      await this.gateway.registerServer(new BasicMCPServer());

      this.initialized = true;
      console.log('[MCP Bridge] ✅ MCP servers initialized successfully');
      console.log(`[MCP Bridge] Available tools: ${this.gateway.getAllTools().length}`);
    } catch (error) {
      console.error('[MCP Bridge] ❌ Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Execute a tool through MCP
   */
  async executeTool(toolName, input) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const result = await this.gateway.handleRequest({
        tool: toolName,
        input,
      });

      return result;
    } catch (error) {
      console.error(`[MCP Bridge] Tool execution failed:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Get all available tools
   */
  getAvailableTools() {
    if (!this.initialized) {
      return [];
    }

    return this.gateway.getAllTools();
  }

  /**
   * Get MCP statistics
   */
  getStats() {
    if (!this.initialized) {
      return null;
    }

    return this.gateway.getStats();
  }

  /**
   * Get recent execution logs
   */
  getLogs(limit = 50) {
    if (!this.initialized) {
      return [];
    }

    return this.gateway.getLogs(limit);
  }

  /**
   * Shutdown MCP gateway
   */
  async shutdown() {
    if (!this.initialized) {
      return;
    }

    console.log('[MCP Bridge] Shutting down...');
    await this.gateway.shutdown();
    this.initialized = false;
  }

  // Convenience methods for common operations

  /**
   * Read a file
   */
  async readFile(path) {
    return this.executeTool('read_file', { path });
  }

  /**
   * Write a file
   */
  async writeFile(path, content) {
    return this.executeTool('write_file', { path, content });
  }

  /**
   * List directory
   */
  async listDirectory(path) {
    return this.executeTool('list_directory', { path });
  }

  /**
   * Execute BASIC code
   */
  async executeBasic(code) {
    return this.executeTool('execute', { code });
  }

  /**
   * Load program into emulator
   */
  async loadProgram(code, address) {
    return this.executeTool('load_program', { code, address });
  }

  /**
   * Run emulator program
   */
  async runProgram(maxCycles) {
    return this.executeTool('run_program', { maxCycles });
  }

  /**
   * Get emulator registers
   */
  async getRegisters() {
    return this.executeTool('get_registers', {});
  }

  /**
   * Format tool result for Telegram
   */
  formatResult(result) {
    if (!result.success) {
      return `❌ Error: ${result.error}`;
    }

    // Format based on data type
    if (typeof result.data === 'object') {
      return '✅ Success:\n```json\n' + JSON.stringify(result.data, null, 2) + '\n```';
    }

    return `✅ Success: ${result.data}`;
  }
}

// Singleton instance
let bridgeInstance = null;

export function getMCPBridge() {
  if (!bridgeInstance) {
    bridgeInstance = new TelegramMCPBridge();
  }
  return bridgeInstance;
}
