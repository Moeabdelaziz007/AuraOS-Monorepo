/**
 * MCP Tool Executor
 * Handles execution of MCP tools and manages execution results
 */

import './logger'; // Initialize global logger
import { MCPTool, MCP_TOOLS, TOOL_CHAINS } from './mcp-tools';
import { LearningContext, TaskExecutionResult } from './types';

/**
 * Tool Execution Plan
 */
export interface ToolExecutionPlan {
  tools: MCPTool[];
  plan: string;
  estimatedDuration: number;
}

/**
 * Tool Suggestion
 */
export interface ToolSuggestion {
  primaryTool: MCPTool | null;
  alternativeTools: MCPTool[];
  confidence: number;
}

/**
 * Chain Suggestion
 */
export interface ChainSuggestion {
  chainName: string | null;
  tools: MCPTool[];
  confidence: number;
}

/**
 * MCP Tool Executor
 * Executes MCP tools and manages execution lifecycle
 */
export class MCPToolExecutor {
  /**
   * Execute a single tool
   */
  async executeTool(
    tool: MCPTool,
    parameters: Record<string, any>,
    context: LearningContext
  ): Promise<TaskExecutionResult> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      logger.info(`[MCP Executor] Executing tool: ${tool.name}`);
      logger.info(`[MCP Executor] Parameters:`, parameters);

      // Validate parameters
      this.validateParameters(tool, parameters);

      // Simulate tool execution
      // In real implementation, this would call actual MCP tools
      await new Promise(resolve => setTimeout(resolve, 500));
      
      success = true;
      logger.info(`[MCP Executor] ✅ Tool executed successfully`);
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`[MCP Executor] ❌ Tool execution failed:`, error);
    }

    const duration = Date.now() - startTime;

    return {
      taskId: `mcp_${tool.name}`,
      success,
      duration,
      error,
      timestamp: new Date(),
    };
  }

  /**
   * Execute a chain of tools
   */
  async executeToolChain(
    tools: MCPTool[],
    parametersArray: Record<string, any>[],
    context: LearningContext
  ): Promise<TaskExecutionResult[]> {
    const results: TaskExecutionResult[] = [];

    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];
      const parameters = parametersArray[i] || {};

      const result = await this.executeTool(tool, parameters, context);
      results.push(result);

      // Stop chain if a tool fails
      if (!result.success) {
        logger.warn(`[MCP Executor] Chain stopped at ${tool.name} due to failure`);
        break;
      }
    }

    return results;
  }

  /**
   * Plan tool execution for a task
   */
  planToolExecution(
    taskDescription: string,
    context: LearningContext,
    toolSelector: any
  ): ToolExecutionPlan {
    const tools: MCPTool[] = [];
    const steps: string[] = [];
    let estimatedDuration = 0;

    // Analyze task and select tools
    const primaryTool = toolSelector.selectTool(taskDescription, context);
    
    if (primaryTool) {
      tools.push(primaryTool);
      steps.push(`1. Use ${primaryTool.name} to ${primaryTool.description}`);
      estimatedDuration += 1000; // Base 1s per tool
    }

    // Check if additional tools are needed
    if (taskDescription.includes('and')) {
      const parts = taskDescription.split('and');
      for (let i = 1; i < parts.length; i++) {
        const tool = toolSelector.selectTool(parts[i].trim(), context);
        if (tool && !tools.includes(tool)) {
          tools.push(tool);
          steps.push(`${i + 1}. Use ${tool.name} to ${tool.description}`);
          estimatedDuration += 1000;
        }
      }
    }

    return {
      tools,
      plan: steps.join('\n'),
      estimatedDuration,
    };
  }

  /**
   * Validate tool parameters
   */
  private validateParameters(tool: MCPTool, parameters: Record<string, any>): void {
    for (const param of tool.parameters) {
      if (param.required && !(param.name in parameters)) {
        throw new Error(`Missing required parameter: ${param.name}`);
      }

      if (param.name in parameters) {
        const value = parameters[param.name];
        const expectedType = param.type;

        if (expectedType === 'string' && typeof value !== 'string') {
          throw new Error(`Parameter ${param.name} must be a string`);
        }
        if (expectedType === 'number' && typeof value !== 'number') {
          throw new Error(`Parameter ${param.name} must be a number`);
        }
        if (expectedType === 'boolean' && typeof value !== 'boolean') {
          throw new Error(`Parameter ${param.name} must be a boolean`);
        }
        if (expectedType === 'array' && !Array.isArray(value)) {
          throw new Error(`Parameter ${param.name} must be an array`);
        }
        if (expectedType === 'object' && typeof value !== 'object') {
          throw new Error(`Parameter ${param.name} must be an object`);
        }
      }
    }
  }

  /**
   * Suggest tools for a task
   */
  suggestToolsForTask(
    taskDescription: string,
    context: LearningContext,
    toolSelector: any
  ): ToolSuggestion {
    const primaryTool = toolSelector.selectTool(taskDescription, context);
    
    // Get alternative tools from same category
    const alternativeTools = primaryTool
      ? MCP_TOOLS.filter(t => t.category === primaryTool.category && t.name !== primaryTool.name)
      : [];

    // Calculate confidence based on tool usage history
    let confidence = 0.5; // Base confidence
    
    if (primaryTool) {
      const usage = toolSelector['toolUsageHistory'].get(primaryTool.name);
      if (usage) {
        confidence = usage.successRate * 0.7 + 0.3;
      }
    }

    return {
      primaryTool,
      alternativeTools,
      confidence,
    };
  }
}

/**
 * Tool Chain Builder
 * Creates and manages sequences of tools for complex tasks
 */
export class ToolChainBuilder {
  /**
   * Get predefined tool chain
   */
  getChain(chainName: string): MCPTool[] {
    const toolNames = TOOL_CHAINS.get(chainName);
    if (!toolNames) {
      return [];
    }

    return toolNames
      .map(name => MCP_TOOLS.find(t => t.name === name))
      .filter((tool): tool is MCPTool => tool !== undefined);
  }

  /**
   * Build custom chain based on task description
   */
  buildCustomChain(taskDescription: string, context: LearningContext): MCPTool[] {
    const keywords = this.extractTaskKeywords(taskDescription);
    const chain: MCPTool[] = [];

    // Start with reading/understanding
    if (keywords.includes('file') || keywords.includes('code')) {
      const tool = MCP_TOOLS.find(t => t.name === 'read_file');
      if (tool) chain.push(tool);
    }

    // Add analysis if needed
    if (keywords.includes('analyze') || keywords.includes('understand')) {
      const tool = MCP_TOOLS.find(t => t.name === 'code_analysis');
      if (tool) chain.push(tool);
    }

    // Add modification tools
    if (keywords.includes('edit') || keywords.includes('modify')) {
      const tool = MCP_TOOLS.find(t => t.name === 'str_replace_based_edit_tool');
      if (tool) chain.push(tool);
    }

    // Add testing
    if (keywords.includes('test') || keywords.includes('verify')) {
      const tool = MCP_TOOLS.find(t => t.name === 'run_tests');
      if (tool) chain.push(tool);
    }

    // Add git operations
    if (keywords.includes('commit') || keywords.includes('push')) {
      const statusTool = MCP_TOOLS.find(t => t.name === 'git_status');
      const commitTool = MCP_TOOLS.find(t => t.name === 'git_commit');
      if (statusTool) chain.push(statusTool);
      if (commitTool) chain.push(commitTool);
    }

    return chain;
  }

  /**
   * Extract task keywords
   */
  private extractTaskKeywords(description: string): string[] {
    const text = description.toLowerCase();
    const keywords: string[] = [];

    if (text.includes('file') || text.includes('code')) keywords.push('file');
    if (text.includes('analyze') || text.includes('understand')) keywords.push('analyze');
    if (text.includes('edit') || text.includes('modify') || text.includes('change')) keywords.push('edit');
    if (text.includes('test') || text.includes('verify')) keywords.push('test');
    if (text.includes('commit') || text.includes('save')) keywords.push('commit');
    if (text.includes('push') || text.includes('deploy')) keywords.push('push');
    if (text.includes('research') || text.includes('search')) keywords.push('research');
    if (text.includes('generate') || text.includes('create')) keywords.push('generate');

    return keywords;
  }

  /**
   * Get all available chain names
   */
  getAllChains(): string[] {
    const chains: string[] = [];
    TOOL_CHAINS.forEach((_, key) => chains.push(key));
    return chains;
  }

  /**
   * Suggest chain for task
   */
  suggestChain(taskDescription: string): ChainSuggestion {
    const text = taskDescription.toLowerCase();
    let bestMatch: string | null = null;
    let maxScore = 0;

    // Score each chain
    for (const chainName of TOOL_CHAINS.keys()) {
      let score = 0;
      
      if (text.includes(chainName.replace('_', ' '))) {
        score += 0.5;
      }

      // Check tool relevance
      const tools = this.getChain(chainName);
      tools.forEach(tool => {
        if (text.includes(tool.name.replace('_', ' '))) {
          score += 0.1;
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestMatch = chainName;
      }
    }

    return {
      chainName: bestMatch,
      tools: bestMatch ? this.getChain(bestMatch) : [],
      confidence: maxScore,
    };
  }
}

// Export singleton instances
export const mcpToolExecutor = new MCPToolExecutor();
export const toolChainBuilder = new ToolChainBuilder();
