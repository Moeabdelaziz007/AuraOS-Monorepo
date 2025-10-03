/**
 * MCP (Model Context Protocol) Integration for Autopilot
 * Gives autopilot access to powerful tools for intelligent automation
 */

import {
  TaskAction,
  LearningContext,
  TaskExecutionResult,
} from './types';

/**
 * MCP Tool Definition
 */
export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  category: 'file' | 'code' | 'web' | 'system' | 'ai' | 'data';
}

/**
 * Available MCP Tools
 */
export const MCP_TOOLS: MCPTool[] = [
  // File Operations
  {
    name: 'read_file',
    description: 'Read file contents with optional line range',
    parameters: [
      { name: 'path', type: 'string', description: 'File path', required: true },
      { name: 'start_line', type: 'number', description: 'Start line', required: false },
      { name: 'end_line', type: 'number', description: 'End line', required: false },
    ],
    category: 'file',
  },
  {
    name: 'str_replace_based_edit_tool',
    description: 'Edit files with view, create, str_replace, or insert operations',
    parameters: [
      { name: 'command', type: 'string', description: 'Operation: view, create, str_replace, insert', required: true },
      { name: 'path', type: 'string', description: 'File path', required: true },
      { name: 'old_str', type: 'string', description: 'String to replace', required: false },
      { name: 'new_str', type: 'string', description: 'Replacement string', required: false },
    ],
    category: 'file',
  },
  {
    name: 'list_directory',
    description: 'List files and directories in a path',
    parameters: [
      { name: 'path', type: 'string', description: 'Directory path', required: true },
      { name: 'recursive', type: 'boolean', description: 'List recursively', required: false },
    ],
    category: 'file',
  },
  {
    name: 'search_files',
    description: 'Search for files by name or pattern',
    parameters: [
      { name: 'pattern', type: 'string', description: 'Search pattern', required: true },
      { name: 'path', type: 'string', description: 'Search path', required: false },
    ],
    category: 'file',
  },
  {
    name: 'file_stats',
    description: 'Get file statistics (size, modified date, permissions)',
    parameters: [
      { name: 'path', type: 'string', description: 'File path', required: true },
    ],
    category: 'file',
  },
  
  // Code Operations
  {
    name: 'exec',
    description: 'Execute shell commands',
    parameters: [
      { name: 'command', type: 'string', description: 'Command to execute', required: true },
      { name: 'working_dir', type: 'string', description: 'Working directory', required: false },
      { name: 'timeout', type: 'number', description: 'Timeout in seconds', required: false },
    ],
    category: 'code',
  },
  {
    name: 'exec_preview',
    description: 'Run development server and get preview URL',
    parameters: [
      { name: 'command', type: 'string', description: 'Server command', required: true },
      { name: 'port', type: 'number', description: 'Port number', required: true },
    ],
    category: 'code',
  },
  {
    name: 'annotate_code',
    description: 'Create code annotations for explanations and suggestions',
    parameters: [
      { name: 'file_path', type: 'string', description: 'File to annotate', required: true },
      { name: 'start_line', type: 'number', description: 'Start line', required: true },
      { name: 'end_line', type: 'number', description: 'End line', required: true },
      { name: 'description', type: 'string', description: 'Annotation description', required: true },
    ],
    category: 'code',
  },
  {
    name: 'run_tests',
    description: 'Execute test suite',
    parameters: [
      { name: 'test_path', type: 'string', description: 'Test file or directory', required: false },
      { name: 'framework', type: 'string', description: 'Test framework (jest, vitest, etc)', required: false },
    ],
    category: 'code',
  },
  {
    name: 'lint_code',
    description: 'Run linter on code',
    parameters: [
      { name: 'path', type: 'string', description: 'File or directory to lint', required: true },
      { name: 'fix', type: 'boolean', description: 'Auto-fix issues', required: false },
    ],
    category: 'code',
  },
  {
    name: 'format_code',
    description: 'Format code with prettier or similar',
    parameters: [
      { name: 'path', type: 'string', description: 'File or directory to format', required: true },
    ],
    category: 'code',
  },
  
  // Web Operations
  {
    name: 'web_read',
    description: 'Read website content and convert to markdown',
    parameters: [
      { name: 'url', type: 'string', description: 'Website URL', required: true },
      { name: 'length', type: 'number', description: 'Max content length', required: false },
    ],
    category: 'web',
  },
  {
    name: 'web_search',
    description: 'Search the web for information',
    parameters: [
      { name: 'query', type: 'string', description: 'Search query', required: true },
      { name: 'max_results', type: 'number', description: 'Maximum results', required: false },
    ],
    category: 'web',
  },
  {
    name: 'api_request',
    description: 'Make HTTP API requests',
    parameters: [
      { name: 'url', type: 'string', description: 'API endpoint', required: true },
      { name: 'method', type: 'string', description: 'HTTP method', required: false },
      { name: 'body', type: 'object', description: 'Request body', required: false },
    ],
    category: 'web',
  },
  
  // AI Operations
  {
    name: 'researcher',
    description: 'Research codebase concepts and architecture',
    parameters: [
      { name: 'description', type: 'string', description: 'Research task description', required: true },
      { name: 'context', type: 'string', description: 'Additional context', required: false },
    ],
    category: 'ai',
  },
  {
    name: 'code_analysis',
    description: 'Analyze code for patterns, issues, and improvements',
    parameters: [
      { name: 'path', type: 'string', description: 'File or directory to analyze', required: true },
      { name: 'focus', type: 'string', description: 'Analysis focus area', required: false },
    ],
    category: 'ai',
  },
  {
    name: 'generate_code',
    description: 'Generate code based on description',
    parameters: [
      { name: 'description', type: 'string', description: 'What to generate', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
      { name: 'style', type: 'string', description: 'Code style preferences', required: false },
    ],
    category: 'ai',
  },
  {
    name: 'explain_code',
    description: 'Explain how code works',
    parameters: [
      { name: 'code', type: 'string', description: 'Code to explain', required: true },
      { name: 'detail_level', type: 'string', description: 'brief, detailed, or expert', required: false },
    ],
    category: 'ai',
  },
  {
    name: 'suggest_improvements',
    description: 'Suggest code improvements and optimizations',
    parameters: [
      { name: 'path', type: 'string', description: 'File to improve', required: true },
      { name: 'focus', type: 'string', description: 'performance, readability, security', required: false },
    ],
    category: 'ai',
  },
  
  // System Operations
  {
    name: 'git_status',
    description: 'Check git repository status',
    parameters: [
      { name: 'path', type: 'string', description: 'Repository path', required: false },
    ],
    category: 'system',
  },
  {
    name: 'git_commit',
    description: 'Commit changes to git',
    parameters: [
      { name: 'message', type: 'string', description: 'Commit message', required: true },
      { name: 'files', type: 'array', description: 'Files to commit', required: false },
    ],
    category: 'system',
  },
  {
    name: 'git_push',
    description: 'Push commits to remote',
    parameters: [
      { name: 'remote', type: 'string', description: 'Remote name', required: false },
      { name: 'branch', type: 'string', description: 'Branch name', required: false },
    ],
    category: 'system',
  },
  {
    name: 'git_diff',
    description: 'Show git diff',
    parameters: [
      { name: 'path', type: 'string', description: 'File or directory', required: false },
      { name: 'staged', type: 'boolean', description: 'Show staged changes', required: false },
    ],
    category: 'system',
  },
  {
    name: 'environment_info',
    description: 'Get environment information',
    parameters: [],
    category: 'system',
  },
  {
    name: 'install_dependencies',
    description: 'Install project dependencies',
    parameters: [
      { name: 'package_manager', type: 'string', description: 'npm, pnpm, yarn', required: false },
      { name: 'path', type: 'string', description: 'Project path', required: false },
    ],
    category: 'system',
  },
  {
    name: 'build_project',
    description: 'Build the project',
    parameters: [
      { name: 'path', type: 'string', description: 'Project path', required: false },
      { name: 'target', type: 'string', description: 'Build target', required: false },
    ],
    category: 'system',
  },
  
  // Data Operations
  {
    name: 'parse_json',
    description: 'Parse and validate JSON data',
    parameters: [
      { name: 'data', type: 'string', description: 'JSON string', required: true },
    ],
    category: 'data',
  },
  {
    name: 'parse_yaml',
    description: 'Parse YAML data',
    parameters: [
      { name: 'data', type: 'string', description: 'YAML string', required: true },
    ],
    category: 'data',
  },
  {
    name: 'query_database',
    description: 'Query database',
    parameters: [
      { name: 'query', type: 'string', description: 'SQL or query string', required: true },
      { name: 'database', type: 'string', description: 'Database name', required: false },
    ],
    category: 'data',
  },
  {
    name: 'transform_data',
    description: 'Transform data between formats',
    parameters: [
      { name: 'data', type: 'string', description: 'Input data', required: true },
      { name: 'from_format', type: 'string', description: 'Source format', required: true },
      { name: 'to_format', type: 'string', description: 'Target format', required: true },
    ],
    category: 'data',
  },
  {
    name: 'validate_data',
    description: 'Validate data against schema',
    parameters: [
      { name: 'data', type: 'string', description: 'Data to validate', required: true },
      { name: 'schema', type: 'string', description: 'Validation schema', required: true },
    ],
    category: 'data',
  },
];

/**
 * Tool Usage Pattern
 */
export interface ToolUsagePattern {
  toolName: string;
  frequency: number;
  avgDuration: number;
  successRate: number;
  commonParameters: Record<string, any>;
  lastUsed: Date;
  context: string[];
}

/**
 * Intelligent Tool Selector
 */
export class IntelligentToolSelector {
  private toolUsageHistory: Map<string, ToolUsagePattern> = new Map();
  private toolRecommendations: Map<string, string[]> = new Map();

  constructor() {
    this.initializeRecommendations();
  }

  /**
   * Initialize tool recommendations based on task types
   */
  private initializeRecommendations(): void {
    // File operations
    this.toolRecommendations.set('file_operation', [
      'read_file',
      'str_replace_based_edit_tool',
      'list_directory',
      'search_files',
      'file_stats',
    ]);
    
    // Code analysis and development
    this.toolRecommendations.set('code_analysis', [
      'read_file',
      'researcher',
      'annotate_code',
      'code_analysis',
      'explain_code',
    ]);
    
    this.toolRecommendations.set('code_generation', [
      'generate_code',
      'str_replace_based_edit_tool',
      'format_code',
      'lint_code',
    ]);
    
    this.toolRecommendations.set('code_improvement', [
      'suggest_improvements',
      'code_analysis',
      'lint_code',
      'format_code',
    ]);
    
    // Testing and quality
    this.toolRecommendations.set('testing', [
      'run_tests',
      'lint_code',
      'code_analysis',
    ]);
    
    // Automation
    this.toolRecommendations.set('automation', [
      'exec',
      'read_file',
      'str_replace_based_edit_tool',
      'exec_preview',
    ]);
    
    // Web operations
    this.toolRecommendations.set('web_scraping', [
      'web_read',
      'str_replace_based_edit_tool',
      'parse_json',
    ]);
    
    this.toolRecommendations.set('api_integration', [
      'api_request',
      'parse_json',
      'validate_data',
    ]);
    
    // Research and learning
    this.toolRecommendations.set('research', [
      'researcher',
      'read_file',
      'web_read',
      'web_search',
    ]);
    
    // Git operations
    this.toolRecommendations.set('version_control', [
      'git_status',
      'git_diff',
      'git_commit',
      'git_push',
    ]);
    
    // Project management
    this.toolRecommendations.set('project_setup', [
      'install_dependencies',
      'build_project',
      'environment_info',
    ]);
    
    // Data operations
    this.toolRecommendations.set('data_processing', [
      'parse_json',
      'parse_yaml',
      'transform_data',
      'validate_data',
    ]);
  }

  /**
   * Select best tool for a task
   */
  selectTool(
    taskDescription: string,
    context: LearningContext,
    availableTools: MCPTool[] = MCP_TOOLS
  ): MCPTool | null {
    // Analyze task description for keywords
    const keywords = this.extractKeywords(taskDescription);
    
    // Score each tool
    const scores = availableTools.map(tool => ({
      tool,
      score: this.calculateToolScore(tool, keywords, context),
    }));

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    // Return best tool if score is above threshold
    return scores[0]?.score > 0.3 ? scores[0].tool : null;
  }

  /**
   * Calculate tool relevance score
   */
  private calculateToolScore(
    tool: MCPTool,
    keywords: string[],
    context: LearningContext
  ): number {
    let score = 0;

    // Check tool name and description for keywords
    const toolText = `${tool.name} ${tool.description}`.toLowerCase();
    keywords.forEach(keyword => {
      if (toolText.includes(keyword)) {
        score += 0.3;
      }
    });

    // Boost score based on usage history
    const usage = this.toolUsageHistory.get(tool.name);
    if (usage) {
      score += usage.successRate * 0.2;
      score += Math.min(usage.frequency / 100, 0.2);
    }

    // Context-based scoring
    if (context.recentApps.some(app => toolText.includes(app))) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Extract keywords from task description
   */
  private extractKeywords(description: string): string[] {
    const text = description.toLowerCase();
    const keywords: string[] = [];

    // File operations
    if (text.match(/read|view|open|check|inspect|show|display|cat/)) keywords.push('read');
    if (text.match(/write|create|edit|modify|update|change|add|insert/)) keywords.push('edit');
    if (text.match(/delete|remove|rm|unlink/)) keywords.push('delete');
    if (text.match(/list|ls|dir|directory|files|find|search/)) keywords.push('list');
    if (text.match(/copy|cp|move|mv|rename/)) keywords.push('copy');

    // Code operations
    if (text.match(/run|execute|command|script|shell|bash/)) keywords.push('exec');
    if (text.match(/test|verify|validate|check|assert/)) keywords.push('test');
    if (text.match(/build|compile|bundle|package/)) keywords.push('build');
    if (text.match(/lint|format|prettier|eslint|style/)) keywords.push('lint');
    if (text.match(/debug|fix|error|bug|issue/)) keywords.push('debug');
    if (text.match(/preview|serve|dev|development|server/)) keywords.push('preview');

    // Web operations
    if (text.match(/web|website|url|scrape|fetch|http|https/)) keywords.push('web');
    if (text.match(/download|get|retrieve|pull/)) keywords.push('fetch');
    if (text.match(/api|rest|graphql|endpoint|request/)) keywords.push('api');
    if (text.match(/search|google|find|lookup/)) keywords.push('search');

    // AI operations
    if (text.match(/research|analyze|understand|explain|study/)) keywords.push('research');
    if (text.match(/suggest|recommend|improve|optimize|enhance/)) keywords.push('suggest');
    if (text.match(/generate|create|make|build|write/)) keywords.push('generate');
    if (text.match(/refactor|restructure|reorganize/)) keywords.push('refactor');

    // Git operations
    if (text.match(/git|commit|push|pull|branch|merge/)) keywords.push('git');
    if (text.match(/status|diff|log|history/)) keywords.push('status');
    if (text.match(/stage|add|unstage/)) keywords.push('stage');

    // Data operations
    if (text.match(/json|parse|stringify/)) keywords.push('json');
    if (text.match(/yaml|yml/)) keywords.push('yaml');
    if (text.match(/database|sql|query|select/)) keywords.push('database');
    if (text.match(/transform|convert|format|serialize/)) keywords.push('transform');
    if (text.match(/validate|schema|check/)) keywords.push('validate');

    // Project operations
    if (text.match(/install|npm|pnpm|yarn|dependencies/)) keywords.push('install');
    if (text.match(/deploy|publish|release/)) keywords.push('deploy');
    if (text.match(/environment|env|config|settings/)) keywords.push('environment');

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Record tool usage
   */
  recordToolUsage(
    toolName: string,
    duration: number,
    success: boolean,
    parameters: Record<string, any>,
    context: LearningContext
  ): void {
    const existing = this.toolUsageHistory.get(toolName);

    if (existing) {
      existing.frequency++;
      existing.avgDuration = (existing.avgDuration * (existing.frequency - 1) + duration) / existing.frequency;
      existing.successRate = (existing.successRate * (existing.frequency - 1) + (success ? 1 : 0)) / existing.frequency;
      existing.lastUsed = new Date();
      
      // Update common parameters
      Object.entries(parameters).forEach(([key, value]) => {
        if (!existing.commonParameters[key]) {
          existing.commonParameters[key] = value;
        }
      });
      
      // Add context
      if (!existing.context.includes(context.timeOfDay)) {
        existing.context.push(context.timeOfDay);
      }
    } else {
      this.toolUsageHistory.set(toolName, {
        toolName,
        frequency: 1,
        avgDuration: duration,
        successRate: success ? 1 : 0,
        commonParameters: { ...parameters },
        lastUsed: new Date(),
        context: [context.timeOfDay],
      });
    }
  }

  /**
   * Get tool usage statistics
   */
  getToolStats(): {
    totalTools: number;
    mostUsedTool: string | null;
    avgSuccessRate: number;
    toolsByCategory: Record<string, number>;
  } {
    const stats = {
      totalTools: this.toolUsageHistory.size,
      mostUsedTool: null as string | null,
      avgSuccessRate: 0,
      toolsByCategory: {} as Record<string, number>,
    };

    let maxFrequency = 0;
    let totalSuccessRate = 0;

    this.toolUsageHistory.forEach((usage, toolName) => {
      if (usage.frequency > maxFrequency) {
        maxFrequency = usage.frequency;
        stats.mostUsedTool = toolName;
      }
      totalSuccessRate += usage.successRate;

      // Count by category
      const tool = MCP_TOOLS.find(t => t.name === toolName);
      if (tool) {
        stats.toolsByCategory[tool.category] = (stats.toolsByCategory[tool.category] || 0) + 1;
      }
    });

    stats.avgSuccessRate = this.toolUsageHistory.size > 0 
      ? totalSuccessRate / this.toolUsageHistory.size 
      : 0;

    return stats;
  }

  /**
   * Get recommended tools for task type
   */
  getRecommendedTools(taskType: string): MCPTool[] {
    const toolNames = this.toolRecommendations.get(taskType) || [];
    return MCP_TOOLS.filter(tool => toolNames.includes(tool.name));
  }

  /**
   * Learn tool combinations that work well together
   */
  learnToolCombination(tools: string[], success: boolean): void {
    if (tools.length < 2) return;

    const combination = tools.sort().join('->');
    console.log(`[MCP Integration] ${success ? '✅' : '❌'} Tool combination: ${combination}`);
  }
}

/**
 * MCP-Enhanced Autopilot Actions
 */
export class MCPAutopilotActions {
  private toolSelector: IntelligentToolSelector;

  constructor() {
    this.toolSelector = new IntelligentToolSelector();
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
    const tools: MCPTool[] = [];
    const steps: string[] = [];
    let estimatedDuration = 0;

    // Analyze task and select tools
    const primaryTool = this.toolSelector.selectTool(taskDescription, context);
    
    if (primaryTool) {
      tools.push(primaryTool);
      steps.push(`1. Use ${primaryTool.name} to ${primaryTool.description}`);
      estimatedDuration += 1000; // Base 1s per tool
    }

    // Check if additional tools are needed
    if (taskDescription.includes('and')) {
      const parts = taskDescription.split('and');
      for (let i = 1; i < parts.length; i++) {
        const tool = this.toolSelector.selectTool(parts[i].trim(), context);
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
   * Execute tool with autopilot
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
      console.log(`[MCP Autopilot] Executing tool: ${tool.name}`);
      console.log(`[MCP Autopilot] Parameters:`, parameters);

      // Simulate tool execution
      // In real implementation, this would call actual MCP tools
      await new Promise(resolve => setTimeout(resolve, 500));
      
      success = true;
      console.log(`[MCP Autopilot] ✅ Tool executed successfully`);
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[MCP Autopilot] ❌ Tool execution failed:`, error);
    }

    const duration = Date.now() - startTime;

    // Record usage
    this.toolSelector.recordToolUsage(tool.name, duration, success, parameters, context);

    return {
      taskId: `mcp_${tool.name}`,
      success,
      duration,
      error,
      timestamp: new Date(),
    };
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
    const primaryTool = this.toolSelector.selectTool(taskDescription, context);
    
    // Get alternative tools from same category
    const alternativeTools = primaryTool
      ? MCP_TOOLS.filter(t => t.category === primaryTool.category && t.name !== primaryTool.name)
      : [];

    // Calculate confidence based on tool usage history
    let confidence = 0.5; // Base confidence
    
    if (primaryTool) {
      const usage = this.toolSelector['toolUsageHistory'].get(primaryTool.name);
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
 * Tool Chain Builder - Creates sequences of tools for complex tasks
 */
export class ToolChainBuilder {
  private chains: Map<string, MCPTool[]> = new Map();

  constructor() {
    this.initializeCommonChains();
  }

  /**
   * Initialize common tool chains
   */
  private initializeCommonChains(): void {
    // Code review chain
    this.chains.set('code_review', [
      MCP_TOOLS.find(t => t.name === 'read_file')!,
      MCP_TOOLS.find(t => t.name === 'code_analysis')!,
      MCP_TOOLS.find(t => t.name === 'suggest_improvements')!,
      MCP_TOOLS.find(t => t.name === 'lint_code')!,
    ]);

    // Deploy chain
    this.chains.set('deploy', [
      MCP_TOOLS.find(t => t.name === 'run_tests')!,
      MCP_TOOLS.find(t => t.name === 'lint_code')!,
      MCP_TOOLS.find(t => t.name === 'build_project')!,
      MCP_TOOLS.find(t => t.name === 'git_status')!,
      MCP_TOOLS.find(t => t.name === 'git_commit')!,
      MCP_TOOLS.find(t => t.name === 'git_push')!,
    ]);

    // Research chain
    this.chains.set('research', [
      MCP_TOOLS.find(t => t.name === 'web_search')!,
      MCP_TOOLS.find(t => t.name === 'web_read')!,
      MCP_TOOLS.find(t => t.name === 'researcher')!,
    ]);

    // Setup project chain
    this.chains.set('setup_project', [
      MCP_TOOLS.find(t => t.name === 'list_directory')!,
      MCP_TOOLS.find(t => t.name === 'read_file')!,
      MCP_TOOLS.find(t => t.name === 'install_dependencies')!,
      MCP_TOOLS.find(t => t.name === 'build_project')!,
    ]);

    // API integration chain
    this.chains.set('api_integration', [
      MCP_TOOLS.find(t => t.name === 'api_request')!,
      MCP_TOOLS.find(t => t.name === 'parse_json')!,
      MCP_TOOLS.find(t => t.name === 'validate_data')!,
    ]);

    // Refactor code chain
    this.chains.set('refactor', [
      MCP_TOOLS.find(t => t.name === 'read_file')!,
      MCP_TOOLS.find(t => t.name === 'code_analysis')!,
      MCP_TOOLS.find(t => t.name === 'suggest_improvements')!,
      MCP_TOOLS.find(t => t.name === 'str_replace_based_edit_tool')!,
      MCP_TOOLS.find(t => t.name === 'format_code')!,
      MCP_TOOLS.find(t => t.name === 'run_tests')!,
    ]);

    // Debug chain
    this.chains.set('debug', [
      MCP_TOOLS.find(t => t.name === 'read_file')!,
      MCP_TOOLS.find(t => t.name === 'explain_code')!,
      MCP_TOOLS.find(t => t.name === 'code_analysis')!,
      MCP_TOOLS.find(t => t.name === 'run_tests')!,
    ]);

    // Content generation chain
    this.chains.set('content_generation', [
      MCP_TOOLS.find(t => t.name === 'researcher')!,
      MCP_TOOLS.find(t => t.name === 'generate_code')!,
      MCP_TOOLS.find(t => t.name === 'str_replace_based_edit_tool')!,
    ]);
  }

  /**
   * Get tool chain for task type
   */
  getChain(chainName: string): MCPTool[] {
    return this.chains.get(chainName) || [];
  }

  /**
   * Build custom chain based on task description
   */
  buildCustomChain(taskDescription: string, context: LearningContext): MCPTool[] {
    const keywords = this.extractTaskKeywords(taskDescription);
    const chain: MCPTool[] = [];

    // Start with reading/understanding
    if (keywords.includes('file') || keywords.includes('code')) {
      chain.push(MCP_TOOLS.find(t => t.name === 'read_file')!);
    }

    // Add analysis if needed
    if (keywords.includes('analyze') || keywords.includes('understand')) {
      chain.push(MCP_TOOLS.find(t => t.name === 'code_analysis')!);
    }

    // Add modification tools
    if (keywords.includes('edit') || keywords.includes('modify')) {
      chain.push(MCP_TOOLS.find(t => t.name === 'str_replace_based_edit_tool')!);
    }

    // Add testing
    if (keywords.includes('test') || keywords.includes('verify')) {
      chain.push(MCP_TOOLS.find(t => t.name === 'run_tests')!);
    }

    // Add git operations
    if (keywords.includes('commit') || keywords.includes('push')) {
      chain.push(MCP_TOOLS.find(t => t.name === 'git_status')!);
      chain.push(MCP_TOOLS.find(t => t.name === 'git_commit')!);
    }

    return chain.filter(Boolean);
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
   * Get all available chains
   */
  getAllChains(): string[] {
    return Array.from(this.chains.keys());
  }

  /**
   * Suggest chain for task
   */
  suggestChain(taskDescription: string): {
    chainName: string | null;
    tools: MCPTool[];
    confidence: number;
  } {
    const text = taskDescription.toLowerCase();
    let bestMatch: string | null = null;
    let maxScore = 0;

    // Score each chain
    for (const [chainName, tools] of this.chains.entries()) {
      let score = 0;
      
      if (text.includes(chainName.replace('_', ' '))) {
        score += 0.5;
      }

      // Check tool relevance
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
      tools: bestMatch ? this.chains.get(bestMatch)! : [],
      confidence: maxScore,
    };
  }
}

// Export singleton instances
export const mcpAutopilotActions = new MCPAutopilotActions();
export const toolChainBuilder = new ToolChainBuilder();
