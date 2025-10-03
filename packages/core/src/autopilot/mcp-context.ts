/**
 * MCP Context Manager
 * Manages context, state, and tool usage patterns for MCP integration
 */

import './logger'; // Initialize global logger
import { MCPTool, ToolUsagePattern, MCP_TOOLS, TOOL_RECOMMENDATIONS } from './mcp-tools';
import { LearningContext } from './types';

/**
 * Tool Statistics
 */
export interface ToolStatistics {
  totalTools: number;
  mostUsedTool: string | null;
  avgSuccessRate: number;
  toolsByCategory: Record<string, number>;
}

/**
 * Intelligent Tool Selector
 * Selects appropriate tools based on task description and context
 */
export class IntelligentToolSelector {
  private toolUsageHistory: Map<string, ToolUsagePattern> = new Map();

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
    if (context.currentApp && toolText.includes(context.currentApp)) {
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

    return Array.from(new Set(keywords)); // Remove duplicates
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
      const timeOfDayStr = context.timeOfDay.toString();
      if (!existing.context.includes(timeOfDayStr)) {
        existing.context.push(timeOfDayStr);
      }
    } else {
      this.toolUsageHistory.set(toolName, {
        toolName,
        frequency: 1,
        avgDuration: duration,
        successRate: success ? 1 : 0,
        commonParameters: { ...parameters },
        lastUsed: new Date(),
        context: [context.timeOfDay.toString()],
      });
    }
  }

  /**
   * Get tool usage statistics
   */
  getToolStats(): ToolStatistics {
    const stats: ToolStatistics = {
      totalTools: this.toolUsageHistory.size,
      mostUsedTool: null,
      avgSuccessRate: 0,
      toolsByCategory: {},
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
    const toolNames = TOOL_RECOMMENDATIONS.get(taskType) || [];
    return MCP_TOOLS.filter(tool => toolNames.includes(tool.name));
  }

  /**
   * Learn tool combinations that work well together
   */
  learnToolCombination(tools: string[], success: boolean): void {
    if (tools.length < 2) return;

    const combination = tools.sort().join('->');
    logger.info(`[MCP Context] ${success ? '✅' : '❌'} Tool combination: ${combination}`);
  }

  /**
   * Get tool usage history (for testing/debugging)
   */
  getToolUsageHistory(): Map<string, ToolUsagePattern> {
    return this.toolUsageHistory;
  }

  /**
   * Clear tool usage history
   */
  clearHistory(): void {
    this.toolUsageHistory.clear();
  }
}

/**
 * MCP Context Manager
 * Manages overall context for MCP operations
 */
export class MCPContextManager {
  private toolSelector: IntelligentToolSelector;
  private activeContext: LearningContext | null = null;

  constructor() {
    this.toolSelector = new IntelligentToolSelector();
  }

  /**
   * Set active context
   */
  setContext(context: LearningContext): void {
    this.activeContext = context;
  }

  /**
   * Get active context
   */
  getContext(): LearningContext | null {
    return this.activeContext;
  }

  /**
   * Get tool selector
   */
  getToolSelector(): IntelligentToolSelector {
    return this.toolSelector;
  }

  /**
   * Update context with new information
   */
  updateContext(updates: Partial<LearningContext>): void {
    if (this.activeContext) {
      this.activeContext = {
        ...this.activeContext,
        ...updates,
      };
    }
  }

  /**
   * Get context summary
   */
  getContextSummary(): {
    hasContext: boolean;
    currentApp: string | undefined;
    timeOfDay: string;
    toolStats: ToolStatistics;
  } {
    return {
      hasContext: this.activeContext !== null,
      currentApp: this.activeContext?.currentApp,
      timeOfDay: this.activeContext?.timeOfDay.toString() || 'unknown',
      toolStats: this.toolSelector.getToolStats(),
    };
  }
}

// Export singleton instance
export const mcpContextManager = new MCPContextManager();
