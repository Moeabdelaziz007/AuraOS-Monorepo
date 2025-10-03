/**
 * MCP (Model Context Protocol) Integration for Autopilot
 * Orchestrates MCP tools, execution, and context management
 * 
 * This module serves as the main entry point for MCP functionality,
 * delegating to specialized modules for tools, execution, and context.
 */

// Re-export types and interfaces
export type {
  MCPTool,
  ToolUsagePattern,
} from './mcp-tools';

export type {
  ToolExecutionPlan,
  ToolSuggestion,
  ChainSuggestion,
} from './mcp-executor';

export type {
  ToolStatistics,
} from './mcp-context';

// Re-export tool definitions
export {
  MCP_TOOLS,
  TOOL_RECOMMENDATIONS,
  TOOL_CHAINS,
} from './mcp-tools';

// Re-export executor classes
export {
  MCPToolExecutor,
  ToolChainBuilder,
  mcpToolExecutor,
  toolChainBuilder,
} from './mcp-executor';

// Re-export context management
export {
  IntelligentToolSelector,
  MCPContextManager,
  mcpContextManager,
} from './mcp-context';

import {
  TaskAction,
  LearningContext,
  TaskExecutionResult,
} from './types';

import { IntelligentToolSelector } from './mcp-context';
import { MCPToolExecutor, ToolChainBuilder } from './mcp-executor';
import { MCPTool } from './mcp-tools';

/**
 * MCP-Enhanced Autopilot Actions
 * High-level interface for autopilot to interact with MCP tools
 */
export class MCPAutopilotActions {
  private toolSelector: IntelligentToolSelector;
  private executor: MCPToolExecutor;
  private chainBuilder: ToolChainBuilder;

  constructor() {
    this.toolSelector = new IntelligentToolSelector();
    this.executor = new MCPToolExecutor();
    this.chainBuilder = new ToolChainBuilder();
  }

  /**
   * Convert task description to MCP tool calls
   */
  async planToolExecution(
    taskDescription: string,
    context: LearningContext
  ): Promise<{
    tools: MCPTool[];
    plan: string;
    estimatedDuration: number;
  }> {
    return this.executor.planToolExecution(taskDescription, context, this.toolSelector);
  }

  /**
   * Execute tool with autopilot
   */
  async executeTool(
    tool: MCPTool,
    parameters: Record<string, any>,
    context: LearningContext
  ): Promise<TaskExecutionResult> {
    const result = await this.executor.executeTool(tool, parameters, context);
    
    // Record usage for learning
    this.toolSelector.recordToolUsage(
      tool.name,
      result.duration,
      result.success,
      parameters,
      context
    );

    return result;
  }

  /**
   * Get tool selector for statistics
   */
  getToolSelector(): IntelligentToolSelector {
    return this.toolSelector;
  }

  /**
   * Suggest tools for automation
   */
  suggestToolsForTask(taskDescription: string, context: LearningContext): {
    primaryTool: MCPTool | null;
    alternativeTools: MCPTool[];
    confidence: number;
  } {
    return this.executor.suggestToolsForTask(taskDescription, context, this.toolSelector);
  }

  /**
   * Get tool chain builder
   */
  getChainBuilder(): ToolChainBuilder {
    return this.chainBuilder;
  }

  /**
   * Execute a predefined tool chain
   */
  async executeChain(
    chainName: string,
    parametersArray: Record<string, any>[],
    context: LearningContext
  ): Promise<TaskExecutionResult[]> {
    const tools = this.chainBuilder.getChain(chainName);
    return this.executor.executeToolChain(tools, parametersArray, context);
  }

  /**
   * Build and execute custom tool chain
   */
  async executeCustomChain(
    taskDescription: string,
    parametersArray: Record<string, any>[],
    context: LearningContext
  ): Promise<TaskExecutionResult[]> {
    const tools = this.chainBuilder.buildCustomChain(taskDescription, context);
    return this.executor.executeToolChain(tools, parametersArray, context);
  }
}

/**
 * MCPIntegration - Compatibility wrapper for legacy code
 * @deprecated Use MCPAutopilotActions instead
 */
export class MCPIntegration {
  private static instance: MCPIntegration;
  private actions: MCPAutopilotActions;

  private constructor() {
    this.actions = new MCPAutopilotActions();
  }

  static getInstance(): MCPIntegration {
    if (!MCPIntegration.instance) {
      MCPIntegration.instance = new MCPIntegration();
    }
    return MCPIntegration.instance;
  }

  getActions(): MCPAutopilotActions {
    return this.actions;
  }

  // Delegate methods for backward compatibility
  async planToolExecution(taskDescription: string, context: LearningContext) {
    return this.actions.planToolExecution(taskDescription, context);
  }

  async executeTool(tool: MCPTool, parameters: Record<string, any>, context: LearningContext) {
    return this.actions.executeTool(tool, parameters, context);
  }

  getToolSelector() {
    return this.actions.getToolSelector();
  }

  suggestToolsForTask(taskDescription: string, context: LearningContext) {
    return this.actions.suggestToolsForTask(taskDescription, context);
  }
}

// Export singleton instance
export const mcpAutopilotActions = new MCPAutopilotActions();
