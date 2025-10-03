/**
 * MCP (Model Context Protocol) Integration for Telegram Bot
 */

import { EventEmitter } from 'events';
import { 
  MCPTool, 
  MCPResult, 
  UserSession, 
  BotResponse 
} from '../types/index.js';

export class MCPIntegration extends EventEmitter {
  private tools: Map<string, MCPTool> = new Map();
  private toolHistory: Map<number, MCPResult[]> = new Map();
  private isConnected: boolean = false;

  constructor() {
    super();
    this.initializeMCP();
  }

  /**
   * Initialize MCP connection and tools
   */
  private async initializeMCP(): Promise<void> {
    try {
      logger.info('🔗 Initializing MCP Integration...');
      
      // Register core MCP tools
      await this.registerCoreTools();
      
      this.isConnected = true;
      logger.info('✅ MCP Integration initialized');
      
    } catch (error) {
      logger.error('❌ MCP initialization failed:', error);
      this.isConnected = false;
    }
  }

  /**
   * Register core MCP tools
   */
  private async registerCoreTools(): Promise<void> {
    // File System Tools
    this.registerTool({
      name: 'fs_read',
      description: 'Read file contents',
      parameters: [
        {
          name: 'path',
          type: 'string',
          required: true,
          description: 'File path to read'
        }
      ],
      execute: this.executeFileRead.bind(this)
    });

    this.registerTool({
      name: 'fs_write',
      description: 'Write content to file',
      parameters: [
        {
          name: 'path',
          type: 'string',
          required: true,
          description: 'File path to write'
        },
        {
          name: 'content',
          type: 'string',
          required: true,
          description: 'Content to write'
        }
      ],
      execute: this.executeFileWrite.bind(this)
    });

    this.registerTool({
      name: 'fs_list',
      description: 'List directory contents',
      parameters: [
        {
          name: 'path',
          type: 'string',
          required: true,
          description: 'Directory path to list'
        }
      ],
      execute: this.executeFileList.bind(this)
    });

    // System Tools
    this.registerTool({
      name: 'system_info',
      description: 'Get system information',
      parameters: [],
      execute: this.executeSystemInfo.bind(this)
    });

    this.registerTool({
      name: 'system_command',
      description: 'Execute system command',
      parameters: [
        {
          name: 'command',
          type: 'string',
          required: true,
          description: 'Command to execute'
        }
      ],
      execute: this.executeSystemCommand.bind(this)
    });

    // AI Tools
    this.registerTool({
      name: 'ai_analyze',
      description: 'Analyze text with AI',
      parameters: [
        {
          name: 'text',
          type: 'string',
          required: true,
          description: 'Text to analyze'
        }
      ],
      execute: this.executeAIAnalyze.bind(this)
    });

    this.registerTool({
      name: 'ai_generate',
      description: 'Generate content with AI',
      parameters: [
        {
          name: 'prompt',
          type: 'string',
          required: true,
          description: 'AI prompt'
        }
      ],
      execute: this.executeAIGenerate.bind(this)
    });
  }

  /**
   * Register a new MCP tool
   */
  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
    logger.info(`🔧 Registered MCP tool: ${tool.name}`);
  }

  /**
   * Execute MCP tool
   */
  async executeTool(
    toolName: string, 
    parameters: Record<string, any>, 
    userSession: UserSession
  ): Promise<BotResponse> {
    try {
      const tool = this.tools.get(toolName);
      if (!tool) {
        return {
          success: false,
          error: `Tool '${toolName}' not found`,
          message: `❌ Tool '${toolName}' is not available.`
        };
      }

      // Validate parameters
      const validation = this.validateParameters(tool, parameters);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          message: `❌ Invalid parameters: ${validation.error}`
        };
      }

      // Execute tool
      const result = await tool.execute(parameters);
      
      // Store in history
      this.addToToolHistory(userSession.userId, result);

      return {
        success: result.success,
        message: result.success ? 
          `✅ Tool '${toolName}' executed successfully` : 
          `❌ Tool '${toolName}' failed: ${result.error}`,
        data: result.data,
        error: result.error,
        metadata: {
          tool: toolName,
          parameters,
          timestamp: new Date()
        }
      };

    } catch (error) {
      logger.error(`❌ MCP tool execution error (${toolName}):`, error);
      return {
        success: false,
        error: 'Tool execution failed',
        message: `❌ Failed to execute tool '${toolName}': ${error}`
      };
    }
  }

  /**
   * Validate tool parameters
   */
  private validateParameters(tool: MCPTool, parameters: Record<string, any>): { valid: boolean; error?: string } {
    for (const param of tool.parameters) {
      if (param.required && !(param.name in parameters)) {
        return { valid: false, error: `Missing required parameter: ${param.name}` };
      }
      
      if (param.name in parameters) {
        const value = parameters[param.name];
        if (!this.validateParameterType(value, param.type)) {
          return { valid: false, error: `Invalid type for parameter '${param.name}': expected ${param.type}` };
        }
      }
    }
    
    return { valid: true };
  }

  /**
   * Validate parameter type
   */
  private validateParameterType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null;
      default:
        return true;
    }
  }

  /**
   * Execute file read tool
   */
  private async executeFileRead(params: Record<string, any>): Promise<MCPResult> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(params.path, 'utf-8');
      
      return {
        success: true,
        data: content,
        metadata: {
          file: params.path,
          size: content.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error}`
      };
    }
  }

  /**
   * Execute file write tool
   */
  private async executeFileWrite(params: Record<string, any>): Promise<MCPResult> {
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(params.path, params.content, 'utf-8');
      
      return {
        success: true,
        data: 'File written successfully',
        metadata: {
          file: params.path,
          size: params.content.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to write file: ${error}`
      };
    }
  }

  /**
   * Execute file list tool
   */
  private async executeFileList(params: Record<string, any>): Promise<MCPResult> {
    try {
      const fs = await import('fs/promises');
      const files = await fs.readdir(params.path);
      
      return {
        success: true,
        data: files,
        metadata: {
          directory: params.path,
          count: files.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to list directory: ${error}`
      };
    }
  }

  /**
   * Execute system info tool
   */
  private async executeSystemInfo(params: Record<string, any>): Promise<MCPResult> {
    try {
      const info = {
        platform: process.platform,
        arch: process.arch,
        version: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cwd: process.cwd()
      };
      
      return {
        success: true,
        data: info,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get system info: ${error}`
      };
    }
  }

  /**
   * Execute system command tool
   */
  private async executeSystemCommand(params: Record<string, any>): Promise<MCPResult> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout, stderr } = await execAsync(params.command);
      
      return {
        success: true,
        data: stdout || stderr,
        metadata: {
          command: params.command,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Command execution failed: ${error}`
      };
    }
  }

  /**
   * Execute AI analyze tool
   */
  private async executeAIAnalyze(params: Record<string, any>): Promise<MCPResult> {
    try {
      // Simple text analysis (can be enhanced with actual AI models)
      const text = params.text;
      const analysis = {
        length: text.length,
        words: text.split(' ').length,
        sentences: text.split('.').length,
        sentiment: this.analyzeSentiment(text),
        keywords: this.extractKeywords(text)
      };
      
      return {
        success: true,
        data: analysis,
        metadata: {
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `AI analysis failed: ${error}`
      };
    }
  }

  /**
   * Execute AI generate tool
   */
  private async executeAIGenerate(params: Record<string, any>): Promise<MCPResult> {
    try {
      // Simple text generation (can be enhanced with actual AI models)
      const prompt = params.prompt;
      const response = `AI Generated Response for: "${prompt}"\n\nThis is a placeholder response. In a real implementation, this would use an AI model to generate content based on the prompt.`;
      
      return {
        success: true,
        data: response,
        metadata: {
          prompt,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `AI generation failed: ${error}`
      };
    }
  }

  /**
   * Analyze sentiment
   */
  private analyzeSentiment(text: string): string {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Extract keywords
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(' ');
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    return words
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 10); // Top 10 keywords
  }

  /**
   * Add to tool history
   */
  private addToToolHistory(userId: number, result: MCPResult): void {
    const history = this.toolHistory.get(userId) || [];
    history.push(result);
    
    // Keep only last 100 results
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.toolHistory.set(userId, history);
  }

  /**
   * Get available tools
   */
  getAvailableTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool by name
   */
  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get tool history for user
   */
  getToolHistory(userId: number): MCPResult[] {
    return this.toolHistory.get(userId) || [];
  }

  /**
   * Check if MCP is connected
   */
  isMCPConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get MCP status
   */
  getMCPStatus(): any {
    return {
      connected: this.isConnected,
      toolsCount: this.tools.size,
      totalExecutions: Array.from(this.toolHistory.values())
        .reduce((sum, history) => sum + history.length, 0)
    };
  }
}
