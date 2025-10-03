/**
 * Learning Integration for Telegram Bot
 */

import { EventEmitter } from 'events';
import { 
  UserSession, 
  LearningData, 
  LearningInsight,
  TaskExecution,
  UserFeedback,
  BotResponse 
} from '../types/index.js';

export class LearningIntegration extends EventEmitter {
  private learningData: Map<number, LearningData> = new Map();
  private insights: Map<number, LearningInsight[]> = new Map();
  private globalPatterns: Map<string, number> = new Map();
  private isLearning: boolean = false;

  constructor() {
    super();
    this.initializeLearning();
  }

  /**
   * Initialize Learning system
   */
  private async initializeLearning(): Promise<void> {
    try {
      logger.info('🧠 Initializing Learning Integration...');
      
      this.isLearning = true;
      logger.info('✅ Learning Integration initialized');
      
    } catch (error) {
      logger.error('❌ Learning initialization failed:', error);
      this.isLearning = false;
    }
  }

  /**
   * Learn from user interaction
   */
  async learnFromInteraction(
    userSession: UserSession, 
    input: string, 
    response: string, 
    success: boolean
  ): Promise<void> {
    try {
      const userId = userSession.userId;
      const learningData = this.getLearningData(userId);
      
      // Track command patterns
      this.trackCommandPatterns(input, learningData);
      
      // Track user preferences
      this.trackUserPreferences(input, learningData);
      
      // Track task execution
      this.trackTaskExecution(input, response, success, learningData);
      
      // Generate insights
      await this.generateInsights(userId, learningData);
      
      this.emit('learning_updated', { userId, learningData });

    } catch (error) {
      logger.error('❌ Learning error:', error);
    }
  }

  /**
   * Track command patterns
   */
  private trackCommandPatterns(input: string, learningData: LearningData): void {
    const words = input.toLowerCase().split(' ');
    
    words.forEach(word => {
      if (word.length > 3) {
        const count = learningData.commandPatterns.get(word) || 0;
        learningData.commandPatterns.set(word, count + 1);
        
        // Update global patterns
        const globalCount = this.globalPatterns.get(word) || 0;
        this.globalPatterns.set(word, globalCount + 1);
      }
    });
  }

  /**
   * Track user preferences
   */
  private trackUserPreferences(input: string, learningData: LearningData): void {
    const lowerInput = input.toLowerCase();
    
    // Language preferences
    if (lowerInput.includes('arabic') || lowerInput.includes('عربي')) {
      learningData.userPreferences.set('language', 'arabic');
    } else if (lowerInput.includes('english') || lowerInput.includes('english')) {
      learningData.userPreferences.set('language', 'english');
    }
    
    // Theme preferences
    if (lowerInput.includes('dark') || lowerInput.includes('dark mode')) {
      learningData.userPreferences.set('theme', 'dark');
    } else if (lowerInput.includes('light') || lowerInput.includes('light mode')) {
      learningData.userPreferences.set('theme', 'light');
    }
    
    // Notification preferences
    if (lowerInput.includes('notify') || lowerInput.includes('notification')) {
      learningData.userPreferences.set('notifications', true);
    } else if (lowerInput.includes('quiet') || lowerInput.includes('silent')) {
      learningData.userPreferences.set('notifications', false);
    }
  }

  /**
   * Track task execution
   */
  private trackTaskExecution(
    input: string, 
    response: string, 
    success: boolean, 
    learningData: LearningData
  ): void {
    const taskExecution: TaskExecution = {
      id: `task_${Date.now()}`,
      command: input,
      success,
      duration: 0, // Would be calculated in real implementation
      timestamp: new Date(),
      result: response,
      error: success ? undefined : 'Task failed'
    };
    
    learningData.taskHistory.push(taskExecution);
    
    // Keep only last 100 tasks
    if (learningData.taskHistory.length > 100) {
      learningData.taskHistory.splice(0, learningData.taskHistory.length - 100);
    }
  }

  /**
   * Generate learning insights
   */
  private async generateInsights(userId: number, learningData: LearningData): Promise<void> {
    const insights = this.insights.get(userId) || [];
    
    // Pattern recognition insight
    const topPatterns = Array.from(learningData.commandPatterns.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    if (topPatterns.length > 0) {
      insights.push({
        type: 'pattern',
        data: { topPatterns },
        confidence: 0.8,
        timestamp: new Date(),
        actionable: true
      });
    }
    
    // Success rate insight
    const successRate = learningData.taskHistory.length > 0 
      ? learningData.taskHistory.filter(t => t.success).length / learningData.taskHistory.length
      : 0;
    
    if (successRate < 0.5) {
      insights.push({
        type: 'optimization',
        data: { successRate, recommendation: 'Consider simplifying commands' },
        confidence: 0.9,
        timestamp: new Date(),
        actionable: true
      });
    }
    
    // Preference insight
    if (learningData.userPreferences.size > 0) {
      insights.push({
        type: 'preference',
        data: { preferences: Object.fromEntries(learningData.userPreferences) },
        confidence: 0.7,
        timestamp: new Date(),
        actionable: true
      });
    }
    
    // Prediction insight
    const recentTasks = learningData.taskHistory.slice(-10);
    if (recentTasks.length >= 5) {
      const commonPattern = this.findCommonPattern(recentTasks);
      if (commonPattern) {
        insights.push({
          type: 'prediction',
          data: { pattern: commonPattern, nextLikely: this.predictNextTask(recentTasks) },
          confidence: 0.6,
          timestamp: new Date(),
          actionable: true
        });
      }
    }
    
    this.insights.set(userId, insights);
    this.emit('insights_generated', { userId, insights });
  }

  /**
   * Find common pattern in tasks
   */
  private findCommonPattern(tasks: TaskExecution[]): string | null {
    const commands = tasks.map(t => t.command.toLowerCase());
    const words = commands.flatMap(c => c.split(' '));
    
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 3) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });
    
    const sortedWords = Array.from(wordCount.entries())
      .sort(([,a], [,b]) => b - a);
    
    return sortedWords.length > 0 ? sortedWords[0][0] : null;
  }

  /**
   * Predict next task
   */
  private predictNextTask(tasks: TaskExecution[]): string {
    const recentCommands = tasks.map(t => t.command);
    const lastCommand = recentCommands[recentCommands.length - 1];
    
    // Simple prediction based on patterns
    if (lastCommand.includes('status')) {
      return 'system_info';
    } else if (lastCommand.includes('help')) {
      return 'command_list';
    } else if (lastCommand.includes('file')) {
      return 'file_operation';
    }
    
    return 'general_assistance';
  }

  /**
   * Add user feedback
   */
  async addFeedback(userId: number, taskId: string, rating: number, comment?: string): Promise<void> {
    try {
      const learningData = this.getLearningData(userId);
      
      const feedback: UserFeedback = {
        taskId,
        rating,
        comment,
        timestamp: new Date()
      };
      
      learningData.feedback.push(feedback);
      
      // Keep only last 50 feedback entries
      if (learningData.feedback.length > 50) {
        learningData.feedback.splice(0, learningData.feedback.length - 50);
      }
      
      this.emit('feedback_added', { userId, feedback });

    } catch (error) {
      logger.error('❌ Feedback error:', error);
    }
  }

  /**
   * Get learning data for user
   */
  getLearningData(userId: number): LearningData {
    if (!this.learningData.has(userId)) {
      this.learningData.set(userId, {
        commandPatterns: new Map(),
        userPreferences: new Map(),
        taskHistory: [],
        feedback: []
      });
    }
    return this.learningData.get(userId)!;
  }

  /**
   * Get user insights
   */
  getUserInsights(userId: number): LearningInsight[] {
    return this.insights.get(userId) || [];
  }

  /**
   * Get global patterns
   */
  getGlobalPatterns(): Map<string, number> {
    return new Map(this.globalPatterns);
  }

  /**
   * Get learning recommendations
   */
  getLearningRecommendations(userId: number): string[] {
    const learningData = this.getLearningData(userId);
    const insights = this.getUserInsights(userId);
    const recommendations: string[] = [];
    
    // Pattern-based recommendations
    const topPatterns = Array.from(learningData.commandPatterns.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    if (topPatterns.length > 0) {
      recommendations.push(`You frequently use: ${topPatterns.map(([word]) => word).join(', ')}`);
    }
    
    // Success rate recommendations
    const successRate = learningData.taskHistory.length > 0 
      ? learningData.taskHistory.filter(t => t.success).length / learningData.taskHistory.length
      : 0;
    
    if (successRate < 0.7) {
      recommendations.push('Consider using simpler commands for better success rate');
    }
    
    // Preference recommendations
    if (learningData.userPreferences.has('language')) {
      const language = learningData.userPreferences.get('language');
      recommendations.push(`I notice you prefer ${language} language`);
    }
    
    return recommendations;
  }

  /**
   * Export learning data
   */
  exportLearningData(userId: number): any {
    return {
      learningData: this.getLearningData(userId),
      insights: this.getUserInsights(userId),
      recommendations: this.getLearningRecommendations(userId),
      globalPatterns: Object.fromEntries(this.getGlobalPatterns())
    };
  }

  /**
   * Clear learning data
   */
  clearLearningData(userId: number): void {
    this.learningData.delete(userId);
    this.insights.delete(userId);
    this.emit('learning_cleared', { userId });
  }

  /**
   * Get learning status
   */
  getLearningStatus(): any {
    return {
      active: this.isLearning,
      usersCount: this.learningData.size,
      totalInsights: Array.from(this.insights.values())
        .reduce((sum, insights) => sum + insights.length, 0),
      globalPatternsCount: this.globalPatterns.size
    };
  }

  /**
   * Check if learning is active
   */
  isLearningActive(): boolean {
    return this.isLearning;
  }
}
