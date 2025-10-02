/**
 * AI Learning Engine
 * Analyzes user behavior and generates insights
 */

import type {
  UserInteraction,
  UserPattern,
  LearningInsight,
  SmartSuggestion,
  AIModelState,
  LearningMetrics,
} from './types';
import { learningStorage } from './storage';

export class LearningEngine {
  private userId: string;
  private modelState: AIModelState | null = null;
  private pattern: UserPattern | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Initialize the learning engine
   */
  async init(): Promise<void> {
    await learningStorage.init();
    this.modelState = await learningStorage.getModelState();
    this.pattern = await learningStorage.getPattern(this.userId);

    if (!this.modelState) {
      this.modelState = {
        version: '1.0.0',
        trainedAt: Date.now(),
        accuracy: 0,
        totalInteractions: 0,
        features: {
          appPrediction: true,
          windowOptimization: true,
          errorPrevention: true,
          smartSuggestions: true,
        },
      };
      await learningStorage.saveModelState(this.modelState);
    }
  }

  /**
   * Analyze user interactions and update patterns
   */
  async analyzeAndLearn(): Promise<void> {
    const interactions = await learningStorage.getInteractions(this.userId, 1000);
    
    if (interactions.length === 0) return;

    // Analyze patterns
    const newPattern = this.analyzePatterns(interactions);
    
    // Save updated pattern
    await learningStorage.savePattern(newPattern);
    this.pattern = newPattern;

    // Generate insights
    const insights = await this.generateInsights(newPattern, interactions);
    
    // Save insights
    for (const insight of insights) {
      await learningStorage.saveInsight(insight);
    }

    // Update model state
    if (this.modelState) {
      this.modelState.totalInteractions = interactions.length;
      this.modelState.accuracy = this.calculateAccuracy(interactions);
      this.modelState.trainedAt = Date.now();
      await learningStorage.saveModelState(this.modelState);
    }

    // Update metrics
    await this.updateMetrics(interactions);
  }

  /**
   * Analyze patterns from interactions
   */
  private analyzePatterns(interactions: UserInteraction[]): UserPattern {
    // Most used apps
    const appUsage = new Map<string, { count: number; totalDuration: number }>();
    const appOpenTimes = new Map<string, number>();

    interactions.forEach((interaction) => {
      if (interaction.type === 'app_open' && interaction.appId) {
        const current = appUsage.get(interaction.appId) || { count: 0, totalDuration: 0 };
        appUsage.set(interaction.appId, {
          count: current.count + 1,
          totalDuration: current.totalDuration,
        });
        appOpenTimes.set(interaction.appId, interaction.timestamp);
      } else if (interaction.type === 'app_close' && interaction.appId) {
        const openTime = appOpenTimes.get(interaction.appId);
        if (openTime) {
          const duration = interaction.timestamp - openTime;
          const current = appUsage.get(interaction.appId) || { count: 0, totalDuration: 0 };
          appUsage.set(interaction.appId, {
            count: current.count,
            totalDuration: current.totalDuration + duration,
          });
        }
      }
    });

    const mostUsedApps = Array.from(appUsage.entries())
      .map(([appId, data]) => ({
        appId,
        count: data.count,
        avgDuration: data.count > 0 ? data.totalDuration / data.count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Preferred times
    const preferredTimes: Record<string, number> = {};
    interactions.forEach((interaction) => {
      const timeOfDay = interaction.context.timeOfDay;
      preferredTimes[timeOfDay] = (preferredTimes[timeOfDay] || 0) + 1;
    });

    // Common sequences
    const sequences = this.findCommonSequences(interactions);

    // Error patterns
    const errorPatterns = interactions
      .filter((i) => i.type === 'error')
      .reduce((acc, interaction) => {
        const key = `${interaction.data.error}-${interaction.data.context}`;
        const existing = acc.find((p) => p.error === interaction.data.error);
        if (existing) {
          existing.frequency++;
        } else {
          acc.push({
            error: interaction.data.error,
            context: interaction.data.context,
            frequency: 1,
          });
        }
        return acc;
      }, [] as Array<{ error: string; context: string; frequency: number }>);

    // Success patterns
    const successPatterns = interactions
      .filter((i) => i.type === 'success')
      .reduce((acc, interaction) => {
        const existing = acc.find((p) => p.action === interaction.data.action);
        if (existing) {
          existing.frequency++;
        } else {
          acc.push({
            action: interaction.data.action,
            context: interaction.data.context,
            frequency: 1,
          });
        }
        return acc;
      }, [] as Array<{ action: string; context: string; frequency: number }>);

    // Window preferences
    const windowPositions: Record<string, { x: number; y: number }> = {};
    const windowSizes: Record<string, { width: number; height: number }> = {};

    interactions.forEach((interaction) => {
      if (interaction.type === 'window_move' && interaction.appId) {
        windowPositions[interaction.appId] = interaction.data.position;
      } else if (interaction.type === 'window_resize' && interaction.appId) {
        windowSizes[interaction.appId] = interaction.data.size;
      }
    });

    return {
      userId: this.userId,
      patterns: {
        mostUsedApps,
        preferredTimes,
        commonSequences: sequences,
        errorPatterns,
        successPatterns,
      },
      preferences: {
        windowPositions,
        windowSizes,
        theme: 'dark', // TODO: Track theme preference
        aiProvider: 'zai', // TODO: Track AI provider preference
      },
      lastUpdated: Date.now(),
    };
  }

  /**
   * Find common action sequences
   */
  private findCommonSequences(interactions: UserInteraction[]): Array<{ sequence: string[]; frequency: number }> {
    const sequences = new Map<string, number>();
    const windowSize = 3;

    for (let i = 0; i <= interactions.length - windowSize; i++) {
      const sequence = interactions
        .slice(i, i + windowSize)
        .map((interaction) => `${interaction.type}:${interaction.appId || 'system'}`)
        .join('->');
      
      sequences.set(sequence, (sequences.get(sequence) || 0) + 1);
    }

    return Array.from(sequences.entries())
      .map(([seq, freq]) => ({
        sequence: seq.split('->'),
        frequency: freq,
      }))
      .filter((s) => s.frequency > 2)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  /**
   * Generate insights from patterns
   */
  private async generateInsights(
    pattern: UserPattern,
    interactions: UserInteraction[]
  ): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // App usage insights
    if (pattern.patterns.mostUsedApps.length > 0) {
      const topApp = pattern.patterns.mostUsedApps[0];
      insights.push({
        id: `insight-${Date.now()}-1`,
        userId: this.userId,
        type: 'suggestion',
        title: 'Frequently Used App',
        description: `You use ${topApp.appId} most often. Consider pinning it to your taskbar for quick access.`,
        confidence: 0.9,
        actionable: true,
        action: {
          type: 'pin_app',
          payload: { appId: topApp.appId },
        },
        createdAt: Date.now(),
      });
    }

    // Time-based insights
    const preferredTime = Object.entries(pattern.patterns.preferredTimes).sort(
      ([, a], [, b]) => b - a
    )[0];
    
    if (preferredTime) {
      insights.push({
        id: `insight-${Date.now()}-2`,
        userId: this.userId,
        type: 'prediction',
        title: 'Peak Usage Time',
        description: `You're most active during ${preferredTime[0]}. System performance is optimized for this time.`,
        confidence: 0.85,
        actionable: false,
        createdAt: Date.now(),
      });
    }

    // Error prevention insights
    if (pattern.patterns.errorPatterns.length > 0) {
      const topError = pattern.patterns.errorPatterns[0];
      insights.push({
        id: `insight-${Date.now()}-3`,
        userId: this.userId,
        type: 'warning',
        title: 'Common Error Detected',
        description: `You've encountered "${topError.error}" ${topError.frequency} times. We're working on preventing this.`,
        confidence: 0.95,
        actionable: true,
        action: {
          type: 'show_help',
          payload: { error: topError.error },
        },
        createdAt: Date.now(),
      });
    }

    // Window optimization insights
    const windowMoves = interactions.filter((i) => i.type === 'window_move').length;
    if (windowMoves > 10) {
      insights.push({
        id: `insight-${Date.now()}-4`,
        userId: this.userId,
        type: 'optimization',
        title: 'Window Position Learning',
        description: `We've learned your preferred window positions and will remember them for next time.`,
        confidence: 0.8,
        actionable: false,
        createdAt: Date.now(),
      });
    }

    return insights;
  }

  /**
   * Generate smart suggestions
   */
  async getSmartSuggestions(): Promise<SmartSuggestion[]> {
    if (!this.pattern) return [];

    const suggestions: SmartSuggestion[] = [];
    const now = new Date();
    const hour = now.getHours();

    // Time-based app suggestions
    const currentTimeOfDay = 
      hour >= 5 && hour < 12 ? 'morning' :
      hour >= 12 && hour < 17 ? 'afternoon' :
      hour >= 17 && hour < 21 ? 'evening' : 'night';

    const recentInteractions = await learningStorage.getRecentInteractions(50);
    const appsUsedAtThisTime = recentInteractions
      .filter((i) => i.context.timeOfDay === currentTimeOfDay && i.type === 'app_open')
      .map((i) => i.appId)
      .filter((id): id is string => id !== undefined);

    if (appsUsedAtThisTime.length > 0) {
      const mostCommon = appsUsedAtThisTime[0];
      suggestions.push({
        id: `suggestion-${Date.now()}-1`,
        type: 'app',
        title: `Open ${mostCommon}?`,
        description: `You usually use this app during ${currentTimeOfDay}`,
        confidence: 0.8,
        relevance: 0.9,
      });
    }

    // Sequence-based suggestions
    if (this.pattern.patterns.commonSequences.length > 0) {
      const lastAction = recentInteractions[0];
      if (lastAction) {
        const matchingSequence = this.pattern.patterns.commonSequences.find((seq) =>
          seq.sequence[0] === `${lastAction.type}:${lastAction.appId || 'system'}`
        );

        if (matchingSequence && matchingSequence.sequence.length > 1) {
          const nextAction = matchingSequence.sequence[1].split(':');
          suggestions.push({
            id: `suggestion-${Date.now()}-2`,
            type: 'action',
            title: 'Next Action Prediction',
            description: `Based on your pattern, you might want to ${nextAction[0]} ${nextAction[1]}`,
            confidence: 0.7,
            relevance: 0.8,
          });
        }
      }
    }

    // Optimization suggestions
    if (this.pattern.patterns.errorPatterns.length > 0) {
      suggestions.push({
        id: `suggestion-${Date.now()}-3`,
        type: 'optimization',
        title: 'Reduce Errors',
        description: 'We can help you avoid common errors. Click to learn more.',
        confidence: 0.85,
        relevance: 0.9,
      });
    }

    return suggestions.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  /**
   * Calculate model accuracy
   */
  private calculateAccuracy(interactions: UserInteraction[]): number {
    const successCount = interactions.filter((i) => i.type === 'success').length;
    const errorCount = interactions.filter((i) => i.type === 'error').length;
    const total = successCount + errorCount;

    return total > 0 ? successCount / total : 0;
  }

  /**
   * Update metrics
   */
  private async updateMetrics(interactions: UserInteraction[]): Promise<void> {
    const uniqueUsers = new Set(interactions.map((i) => i.userId)).size;
    const totalDuration = interactions.reduce((sum, i) => sum + i.context.sessionDuration, 0);
    const avgSessionDuration = interactions.length > 0 ? totalDuration / interactions.length : 0;

    const appCounts = new Map<string, number>();
    interactions.forEach((i) => {
      if (i.appId) {
        appCounts.set(i.appId, (appCounts.get(i.appId) || 0) + 1);
      }
    });

    const mostUsedApps = Array.from(appCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([appId]) => appId);

    const errorCount = interactions.filter((i) => i.type === 'error').length;
    const successCount = interactions.filter((i) => i.type === 'success').length;
    const total = interactions.length;

    const errorRate = total > 0 ? errorCount / total : 0;
    const successRate = total > 0 ? successCount / total : 0;

    // Calculate improvement rate (compare with previous metrics)
    const previousMetrics = await learningStorage.getMetrics();
    const improvementRate = previousMetrics
      ? (successRate - previousMetrics.successRate) / (previousMetrics.successRate || 1)
      : 0;

    const metrics: LearningMetrics = {
      totalInteractions: interactions.length,
      uniqueUsers,
      avgSessionDuration,
      mostUsedApps,
      errorRate,
      successRate,
      improvementRate,
      lastUpdated: Date.now(),
    };

    await learningStorage.saveMetrics(metrics);
  }

  /**
   * Get current pattern
   */
  getPattern(): UserPattern | null {
    return this.pattern;
  }

  /**
   * Get model state
   */
  getModelState(): AIModelState | null {
    return this.modelState;
  }
}
