/**
 * Autopilot Integration for Content Generator
 * Learns from content generation patterns and optimizes workflows
 */

import { 
  AutopilotService, 
  SmartAnalyzer, 
  RewardSystem,
  TaskAction,
  LearningContext,
  TaskExecutionResult
} from '@auraos/core/autopilot';

export class ContentGeneratorAutopilot {
  private autopilot: AutopilotService;
  private analyzer: SmartAnalyzer;
  private rewards: RewardSystem;
  private userPatterns: Map<string, UserContentPattern> = new Map();

  constructor() {
    this.autopilot = new AutopilotService();
    this.analyzer = new SmartAnalyzer();
    this.rewards = new RewardSystem();
    
    // Enable auto-save
    this.autopilot.setAutoSave(true);
    
    // Start continuous analysis
    this.analyzer.startAnalysis(60000);
    
    console.log('[Content Generator Autopilot] Initialized');
  }

  /**
   * Learn from content generation request
   */
  async learnFromGeneration(
    userId: string,
    type: string,
    topic: string,
    options: Record<string, any>,
    generationTime: number,
    success: boolean
  ): Promise<void> {
    const pattern = this.getOrCreatePattern(userId);
    
    // Record generation
    pattern.generationHistory.push({
      type,
      topic,
      options,
      generationTime,
      success,
      timestamp: new Date(),
    });

    // Build action sequence
    const actions: TaskAction[] = [
      { type: 'open', target: 'content-generator' },
      { type: 'click', target: `type-${type}` },
      { type: 'type', value: topic },
    ];

    // Add option actions
    Object.entries(options).forEach(([key, value]) => {
      if (value) {
        actions.push({ type: 'click', target: `option-${key}` });
      }
    });

    actions.push({ type: 'click', target: 'generate-button' });
    actions.push({ type: 'wait', delay: generationTime });

    // Get context
    const context = this.getContext(userId);

    // Learn from actions
    this.autopilot.learnFromUserActions(actions, context);

    // Analyze patterns
    await this.analyzeContentPatterns(userId);

    // Record execution for analysis
    const result: TaskExecutionResult = {
      taskId: `content_gen_${type}`,
      success,
      duration: generationTime,
      timestamp: new Date(),
    };

    this.analyzer.recordExecution(result, context);

    // Evaluate rewards
    const rewardResult = this.rewards.evaluateRewards(result, context);

    if (rewardResult.achievements.length > 0) {
      console.log(`[Content Generator Autopilot] 🏆 User ${userId} unlocked achievements:`);
      rewardResult.achievements.forEach(a => {
        console.log(`  ${a.icon} ${a.name}`);
      });
    }
  }

  /**
   * Analyze content generation patterns
   */
  private async analyzeContentPatterns(userId: string): Promise<void> {
    const pattern = this.getOrCreatePattern(userId);
    const recent = pattern.generationHistory.slice(-10);

    // Detect favorite content type
    const typeCounts = new Map<string, number>();
    recent.forEach(gen => {
      typeCounts.set(gen.type, (typeCounts.get(gen.type) || 0) + 1);
    });

    let favoriteType: string | null = null;
    let maxCount = 0;
    for (const [type, count] of typeCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        favoriteType = type;
      }
    }

    if (favoriteType && maxCount >= 5) {
      console.log(`[Content Generator Autopilot] User ${userId} frequently generates: ${favoriteType}`);
      pattern.favoriteType = favoriteType;
    }

    // Detect common options
    const optionCounts = new Map<string, number>();
    recent.forEach(gen => {
      Object.entries(gen.options).forEach(([key, value]) => {
        if (value) {
          optionCounts.set(key, (optionCounts.get(key) || 0) + 1);
        }
      });
    });

    pattern.commonOptions = Array.from(optionCounts.entries())
      .filter(([_, count]) => count >= 5)
      .map(([option, _]) => option);

    // Detect time patterns
    const avgTime = recent.reduce((sum, gen) => sum + gen.generationTime, 0) / recent.length;
    pattern.avgGenerationTime = avgTime;

    // Success rate
    const successCount = recent.filter(gen => gen.success).length;
    pattern.successRate = successCount / recent.length;
  }

  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions(userId: string): string[] {
    const pattern = this.getOrCreatePattern(userId);
    const suggestions: string[] = [];

    // Suggest based on favorite type
    if (pattern.favoriteType) {
      suggestions.push(
        `💡 You often generate ${pattern.favoriteType}. I can create a quick template for you.`
      );
    }

    // Suggest based on common options
    if (pattern.commonOptions.length > 0) {
      suggestions.push(
        `⚡ You always use these options: ${pattern.commonOptions.join(', ')}. I can pre-select them for you.`
      );
    }

    // Suggest based on generation time
    if (pattern.avgGenerationTime > 5000) {
      suggestions.push(
        `🚀 Your average generation time is ${Math.round(pattern.avgGenerationTime / 1000)}s. I can optimize this.`
      );
    }

    // Suggest based on success rate
    if (pattern.successRate < 0.8) {
      suggestions.push(
        `📈 Your success rate is ${Math.round(pattern.successRate * 100)}%. Let me help improve it.`
      );
    }

    // Add autopilot suggestions
    const autopilotSuggestions = this.autopilot.getSuggestions();
    autopilotSuggestions.forEach(s => {
      suggestions.push(`🤖 ${s.taskName}: ${s.reason}`);
    });

    return suggestions;
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: string): {
    autopilot: any;
    rewards: any;
    smartRate: number;
    insights: any[];
    contentStats: {
      totalGenerations: number;
      favoriteType: string | null;
      avgGenerationTime: number;
      successRate: number;
      commonOptions: string[];
    };
  } {
    const pattern = this.getOrCreatePattern(userId);
    const context = this.getContext(userId);

    return {
      autopilot: this.autopilot.getStats(),
      rewards: this.rewards.getStats(),
      smartRate: this.analyzer.calculateSmartRate(context),
      insights: this.analyzer.generateInsights(context),
      contentStats: {
        totalGenerations: pattern.generationHistory.length,
        favoriteType: pattern.favoriteType,
        avgGenerationTime: pattern.avgGenerationTime,
        successRate: pattern.successRate,
        commonOptions: pattern.commonOptions,
      },
    };
  }

  /**
   * Create automated workflow
   */
  async createWorkflow(
    userId: string,
    name: string,
    type: string,
    defaultOptions: Record<string, any>
  ): Promise<string> {
    const actions: TaskAction[] = [
      { type: 'open', target: 'content-generator' },
      { type: 'click', target: `type-${type}` },
    ];

    // Add default options
    Object.entries(defaultOptions).forEach(([key, value]) => {
      if (value) {
        actions.push({ type: 'click', target: `option-${key}` });
      }
    });

    actions.push({ type: 'click', target: 'generate-button' });

    const context = this.getContext(userId);
    this.autopilot.learnFromUserActions(actions, context);

    console.log(`[Content Generator Autopilot] Created workflow: ${name}`);
    
    return `workflow_${Date.now()}`;
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId: string, userId: string): Promise<TaskExecutionResult> {
    const context = this.getContext(userId);
    
    // Find matching task
    const tasks = this.autopilot.getTasks();
    const task = tasks.find(t => t.id === workflowId);

    if (!task) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Execute task
    const result = await this.autopilot.executeTask(task.id);
    
    // Record for analysis
    this.analyzer.recordExecution(result, context);
    
    // Evaluate rewards
    const rewardResult = this.rewards.evaluateRewards(result, context);
    
    if (rewardResult.levelUp) {
      const stats = this.rewards.getStats();
      console.log(`[Content Generator Autopilot] 🎉 User ${userId} reached level ${stats.level}!`);
    }

    return result;
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights(userId: string): {
    speedImprovement: number;
    qualityScore: number;
    efficiencyRating: string;
    recommendations: string[];
  } {
    const pattern = this.getOrCreatePattern(userId);
    const context = this.getContext(userId);
    const smartRate = this.analyzer.calculateSmartRate(context);

    // Calculate speed improvement
    const recent = pattern.generationHistory.slice(-10);
    const older = pattern.generationHistory.slice(-20, -10);
    
    let speedImprovement = 0;
    if (older.length > 0 && recent.length > 0) {
      const recentAvg = recent.reduce((sum, g) => sum + g.generationTime, 0) / recent.length;
      const olderAvg = older.reduce((sum, g) => sum + g.generationTime, 0) / older.length;
      speedImprovement = ((olderAvg - recentAvg) / olderAvg) * 100;
    }

    // Quality score based on success rate and smart rate
    const qualityScore = (pattern.successRate * 50) + (smartRate / 2);

    // Efficiency rating
    let efficiencyRating = 'Beginner';
    if (smartRate >= 80) efficiencyRating = 'Expert';
    else if (smartRate >= 60) efficiencyRating = 'Advanced';
    else if (smartRate >= 40) efficiencyRating = 'Intermediate';

    // Recommendations
    const recommendations: string[] = [];
    
    if (pattern.successRate < 0.9) {
      recommendations.push('Review failed generations to improve success rate');
    }
    
    if (pattern.avgGenerationTime > 5000) {
      recommendations.push('Use templates to reduce generation time');
    }
    
    if (pattern.commonOptions.length > 0) {
      recommendations.push('Create presets with your common options');
    }

    const insights = this.analyzer.generateInsights(context);
    insights.forEach(insight => {
      if (insight.suggestedAction) {
        recommendations.push(insight.suggestedAction);
      }
    });

    return {
      speedImprovement,
      qualityScore,
      efficiencyRating,
      recommendations,
    };
  }

  /**
   * Get or create user pattern
   */
  private getOrCreatePattern(userId: string): UserContentPattern {
    if (!this.userPatterns.has(userId)) {
      this.userPatterns.set(userId, {
        userId,
        generationHistory: [],
        favoriteType: null,
        commonOptions: [],
        avgGenerationTime: 0,
        successRate: 1.0,
        lastActivity: new Date(),
      });
    }
    
    const pattern = this.userPatterns.get(userId)!;
    pattern.lastActivity = new Date();
    return pattern;
  }

  /**
   * Get learning context
   */
  private getContext(userId: string): LearningContext {
    const pattern = this.getOrCreatePattern(userId);
    const hour = new Date().getHours();
    
    const timeOfDay = hour < 6 ? 'night' 
      : hour < 12 ? 'morning'
      : hour < 18 ? 'afternoon'
      : hour < 22 ? 'evening'
      : 'night';

    const recentTypes = pattern.generationHistory
      .slice(-5)
      .map(g => g.type);

    return {
      timeOfDay,
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      recentApps: ['content-generator', ...recentTypes],
      systemLoad: 0.5,
    };
  }

  /**
   * Export learning data
   */
  async exportData(): Promise<string> {
    return await this.autopilot.exportData();
  }

  /**
   * Import learning data
   */
  async importData(jsonData: string): Promise<void> {
    await this.autopilot.importData(jsonData);
    console.log('[Content Generator Autopilot] Data imported successfully');
  }
}

interface UserContentPattern {
  userId: string;
  generationHistory: Array<{
    type: string;
    topic: string;
    options: Record<string, any>;
    generationTime: number;
    success: boolean;
    timestamp: Date;
  }>;
  favoriteType: string | null;
  commonOptions: string[];
  avgGenerationTime: number;
  successRate: number;
  lastActivity: Date;
}

// Export singleton instance
export const contentGeneratorAutopilot = new ContentGeneratorAutopilot();
