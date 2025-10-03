/**
 * Autopilot Integration for Telegram Bot
 * Learns from user interactions and automates repetitive tasks
 */

import { 
  AutopilotService, 
  SmartAnalyzer, 
  RewardSystem,
  TaskAction,
  LearningContext,
  TaskExecutionResult
} from '@auraos/core/autopilot';

export class TelegramAutopilot {
  private autopilot: AutopilotService;
  private analyzer: SmartAnalyzer;
  private rewards: RewardSystem;
  private userSessions: Map<string, UserSession> = new Map();

  constructor() {
    this.autopilot = new AutopilotService();
    this.analyzer = new SmartAnalyzer();
    this.rewards = new RewardSystem();
    
    // Enable auto-save
    this.autopilot.setAutoSave(true);
    
    // Start continuous analysis
    this.analyzer.startAnalysis(60000);
    
    console.log('[Telegram Autopilot] Initialized');
  }

  /**
   * Learn from user command patterns
   */
  async learnFromCommand(userId: string, command: string, args: string[]): Promise<void> {
    const session = this.getOrCreateSession(userId);
    
    // Record command
    session.commandHistory.push({
      command,
      args,
      timestamp: new Date(),
    });

    // Build action sequence
    const actions: TaskAction[] = [
      { type: 'open', target: 'telegram' },
      { type: 'type', value: `/${command} ${args.join(' ')}` },
    ];

    // Get context
    const context = this.getContext(userId);

    // Learn from actions
    this.autopilot.learnFromUserActions(actions, context);

    // Check for patterns
    await this.detectCommandPatterns(userId);
  }

  /**
   * Detect common command patterns
   */
  private async detectCommandPatterns(userId: string): Promise<void> {
    const session = this.getOrCreateSession(userId);
    const recentCommands = session.commandHistory.slice(-5);

    // Detect repeated commands
    const commandCounts = new Map<string, number>();
    recentCommands.forEach(cmd => {
      commandCounts.set(cmd.command, (commandCounts.get(cmd.command) || 0) + 1);
    });

    // Find frequently used commands
    for (const [command, count] of commandCounts.entries()) {
      if (count >= 3) {
        console.log(`[Telegram Autopilot] Detected frequent command: /${command} (${count} times)`);
        
        // Create suggestion
        const suggestions = this.autopilot.getSuggestions();
        const existing = suggestions.find(s => s.taskName.includes(command));
        
        if (!existing) {
          console.log(`[Telegram Autopilot] Suggesting automation for /${command}`);
        }
      }
    }
  }

  /**
   * Execute automated task
   */
  async executeAutomatedTask(taskId: string, userId: string): Promise<TaskExecutionResult> {
    const context = this.getContext(userId);
    
    // Execute task
    const result = await this.autopilot.executeTask(taskId);
    
    // Record for analysis
    this.analyzer.recordExecution(result, context);
    
    // Evaluate rewards
    const rewardResult = this.rewards.evaluateRewards(result, context);
    
    // Notify user of achievements
    if (rewardResult.achievements.length > 0) {
      console.log(`[Telegram Autopilot] 🏆 Achievements unlocked for user ${userId}:`);
      rewardResult.achievements.forEach(a => {
        console.log(`  ${a.icon} ${a.name}: ${a.description}`);
      });
    }

    if (rewardResult.levelUp) {
      const stats = this.rewards.getStats();
      console.log(`[Telegram Autopilot] 🎉 User ${userId} leveled up to ${stats.level} (${stats.levelTitle})`);
    }

    return result;
  }

  /**
   * Get automation suggestions for user
   */
  getSuggestionsForUser(userId: string): string[] {
    const suggestions = this.autopilot.getSuggestions();
    const session = this.getOrCreateSession(userId);
    
    return suggestions.map(s => 
      `💡 I noticed you often use: ${s.taskName}. Would you like me to automate it?`
    );
  }

  /**
   * Get user statistics
   */
  getUserStats(userId: string): {
    autopilot: any;
    rewards: any;
    smartRate: number;
    insights: any[];
    commandStats: {
      totalCommands: number;
      uniqueCommands: number;
      mostUsedCommand: string | null;
    };
  } {
    const session = this.getOrCreateSession(userId);
    const context = this.getContext(userId);

    // Calculate command stats
    const commandCounts = new Map<string, number>();
    session.commandHistory.forEach(cmd => {
      commandCounts.set(cmd.command, (commandCounts.get(cmd.command) || 0) + 1);
    });

    let mostUsedCommand: string | null = null;
    let maxCount = 0;
    for (const [command, count] of commandCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostUsedCommand = command;
      }
    }

    return {
      autopilot: this.autopilot.getStats(),
      rewards: this.rewards.getStats(),
      smartRate: this.analyzer.calculateSmartRate(context),
      insights: this.analyzer.generateInsights(context),
      commandStats: {
        totalCommands: session.commandHistory.length,
        uniqueCommands: commandCounts.size,
        mostUsedCommand,
      },
    };
  }

  /**
   * Get or create user session
   */
  private getOrCreateSession(userId: string): UserSession {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        userId,
        commandHistory: [],
        lastActivity: new Date(),
        preferences: {},
      });
    }
    
    const session = this.userSessions.get(userId)!;
    session.lastActivity = new Date();
    return session;
  }

  /**
   * Get learning context for user
   */
  private getContext(userId: string): LearningContext {
    const session = this.getOrCreateSession(userId);
    const hour = new Date().getHours();
    
    const timeOfDay = hour < 6 ? 'night' 
      : hour < 12 ? 'morning'
      : hour < 18 ? 'afternoon'
      : hour < 22 ? 'evening'
      : 'night';

    const recentCommands = session.commandHistory
      .slice(-5)
      .map(c => c.command);

    return {
      timeOfDay,
      dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      recentApps: ['telegram', ...recentCommands],
      systemLoad: 0.5, // Default
    };
  }

  /**
   * Accept automation suggestion
   */
  acceptSuggestion(suggestionId: string): void {
    this.autopilot.acceptSuggestion(suggestionId);
    console.log(`[Telegram Autopilot] Suggestion ${suggestionId} accepted`);
  }

  /**
   * Reject automation suggestion
   */
  rejectSuggestion(suggestionId: string): void {
    this.autopilot.rejectSuggestion(suggestionId);
    console.log(`[Telegram Autopilot] Suggestion ${suggestionId} rejected`);
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
    console.log('[Telegram Autopilot] Data imported successfully');
  }
}

interface UserSession {
  userId: string;
  commandHistory: Array<{
    command: string;
    args: string[];
    timestamp: Date;
  }>;
  lastActivity: Date;
  preferences: Record<string, any>;
}

// Export singleton instance
export const telegramAutopilot = new TelegramAutopilot();
