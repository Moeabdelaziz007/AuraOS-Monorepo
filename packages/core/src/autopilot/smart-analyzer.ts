/**
 * Smart Analyzer for Autopilot
 * Analyzes patterns, detects changes, and provides intelligent insights
 */

import { LearnedTask, TaskExecutionResult, LearningContext } from './types';

/**
 * Pattern change detection
 */
export interface PatternChange {
  type: 'new_pattern' | 'pattern_shift' | 'frequency_change' | 'time_shift';
  description: string;
  confidence: number;
  data: any;
  timestamp: Date;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  taskId: string;
  taskName: string;
  avgDuration: number;
  successRate: number;
  trend: 'improving' | 'stable' | 'declining';
  lastWeekExecutions: number;
  thisWeekExecutions: number;
  changeRate: number; // percentage
}

/**
 * User behavior insights
 */
export interface BehaviorInsight {
  id: string;
  type: 'productivity' | 'efficiency' | 'pattern' | 'suggestion';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedAction?: string;
  timestamp: Date;
}

/**
 * Smart rate data for tracking changes
 */
export interface SmartRateData {
  timestamp: Date;
  tasksCount: number;
  executionsCount: number;
  avgSuccessRate: number;
  avgConfidence: number;
  activeUsers: number;
  patterns: {
    mostUsedTask: string;
    mostSuccessfulTask: string;
    peakUsageTime: number;
    commonSequences: string[];
  };
}

/**
 * Smart Analyzer Service
 * Provides intelligent analysis of autopilot behavior and performance
 */
export class SmartAnalyzer {
  private patternChanges: PatternChange[] = [];
  private behaviorInsights: BehaviorInsight[] = [];
  private smartRateHistory: SmartRateData[] = [];
  private analysisInterval: NodeJS.Timeout | null = null;
  private executionRecords: Array<{ result: TaskExecutionResult; context: LearningContext }> = [];

  /**
   * Record a task execution for analysis
   */
  recordExecution(result: TaskExecutionResult, context: LearningContext): void {
    this.executionRecords.push({ result, context });
    
    // Keep only last 1000 records
    if (this.executionRecords.length > 1000) {
      this.executionRecords = this.executionRecords.slice(-1000);
    }
  }

  /**
   * Start continuous analysis
   */
  startAnalysis(intervalMs: number = 60000): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }

    this.analysisInterval = setInterval(() => {
      this.performAnalysis();
    }, intervalMs);

    console.log('[Smart Analyzer] Started continuous analysis');
  }

  /**
   * Stop analysis
   */
  stopAnalysis(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    console.log('[Smart Analyzer] Stopped analysis');
  }

  /**
   * Perform comprehensive analysis
   */
  private performAnalysis(): void {
    console.log('[Smart Analyzer] Performing analysis...');
    // This will be called periodically to analyze patterns
  }

  /**
   * Analyze task performance and detect trends
   */
  analyzeTaskPerformance(
    task: LearnedTask,
    executionHistory: TaskExecutionResult[]
  ): PerformanceMetrics {
    const taskExecutions = executionHistory.filter(e => e.taskId === task.id);
    
    if (taskExecutions.length === 0) {
      return {
        taskId: task.id,
        taskName: task.name,
        avgDuration: 0,
        successRate: 0,
        trend: 'stable',
        lastWeekExecutions: 0,
        thisWeekExecutions: 0,
        changeRate: 0,
      };
    }

    // Calculate average duration
    const avgDuration = taskExecutions.reduce((sum, e) => sum + e.duration, 0) / taskExecutions.length;

    // Calculate success rate
    const successful = taskExecutions.filter(e => e.success).length;
    const successRate = successful / taskExecutions.length;

    // Analyze trend (last 10 vs previous 10)
    const recent = taskExecutions.slice(-10);
    const previous = taskExecutions.slice(-20, -10);
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    
    if (previous.length > 0 && recent.length > 0) {
      const recentSuccess = recent.filter(e => e.success).length / recent.length;
      const previousSuccess = previous.filter(e => e.success).length / previous.length;
      
      if (recentSuccess > previousSuccess + 0.1) {
        trend = 'improving';
      } else if (recentSuccess < previousSuccess - 0.1) {
        trend = 'declining';
      }
    }

    // Calculate weekly execution counts
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const twoWeeks = 2 * oneWeek;

    const thisWeekExecutions = taskExecutions.filter(
      e => now - e.timestamp.getTime() < oneWeek
    ).length;

    const lastWeekExecutions = taskExecutions.filter(
      e => {
        const age = now - e.timestamp.getTime();
        return age >= oneWeek && age < twoWeeks;
      }
    ).length;

    // Calculate change rate
    const changeRate = lastWeekExecutions > 0
      ? ((thisWeekExecutions - lastWeekExecutions) / lastWeekExecutions) * 100
      : 0;

    return {
      taskId: task.id,
      taskName: task.name,
      avgDuration: Math.round(avgDuration),
      successRate: Math.round(successRate * 100) / 100,
      trend,
      lastWeekExecutions,
      thisWeekExecutions,
      changeRate: Math.round(changeRate),
    };
  }

  /**
   * Detect pattern changes in user behavior
   */
  detectPatternChanges(
    tasks: LearnedTask[],
    executionHistory: TaskExecutionResult[],
    context: LearningContext
  ): PatternChange[] {
    const changes: PatternChange[] = [];

    // Detect new patterns (tasks with increasing usage)
    tasks.forEach(task => {
      const metrics = this.analyzeTaskPerformance(task, executionHistory);
      
      if (metrics.changeRate > 50 && metrics.thisWeekExecutions >= 3) {
        changes.push({
          type: 'frequency_change',
          description: `Task "${task.name}" usage increased by ${metrics.changeRate}%`,
          confidence: Math.min(0.9, metrics.changeRate / 100),
          data: { task, metrics },
          timestamp: new Date(),
        });
      }
    });

    // Detect time-based pattern shifts
    const hourlyDistribution = this.analyzeHourlyDistribution(executionHistory);
    const peakHour = this.findPeakHour(hourlyDistribution);
    
    if (peakHour !== context.timeOfDay && hourlyDistribution[peakHour] > 5) {
      changes.push({
        type: 'time_shift',
        description: `Peak usage shifted to ${peakHour}:00`,
        confidence: 0.7,
        data: { peakHour, currentHour: context.timeOfDay },
        timestamp: new Date(),
      });
    }

    // Detect new action sequences
    const recentSequences = this.extractRecentSequences(executionHistory, 7);
    const newSequences = this.findNewSequences(recentSequences);
    
    if (newSequences.length > 0) {
      changes.push({
        type: 'new_pattern',
        description: `Detected ${newSequences.length} new task sequences`,
        confidence: 0.6,
        data: { sequences: newSequences },
        timestamp: new Date(),
      });
    }

    this.patternChanges.push(...changes);
    return changes;
  }

  /**
   * Analyze hourly distribution of task executions
   */
  private analyzeHourlyDistribution(executionHistory: TaskExecutionResult[]): number[] {
    const distribution = new Array(24).fill(0);
    
    executionHistory.forEach(execution => {
      const hour = execution.timestamp.getHours();
      distribution[hour]++;
    });
    
    return distribution;
  }

  /**
   * Find peak usage hour
   */
  private findPeakHour(distribution: number[]): number {
    let maxCount = 0;
    let peakHour = 0;
    
    distribution.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = hour;
      }
    });
    
    return peakHour;
  }

  /**
   * Extract recent task sequences
   */
  private extractRecentSequences(
    executionHistory: TaskExecutionResult[],
    days: number
  ): string[][] {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recent = executionHistory.filter(e => e.timestamp.getTime() > cutoff);
    
    // Group by time windows (5 minutes)
    const sequences: string[][] = [];
    let currentSequence: string[] = [];
    let lastTime = 0;
    
    recent.forEach(execution => {
      const time = execution.timestamp.getTime();
      
      if (lastTime > 0 && time - lastTime > 5 * 60 * 1000) {
        if (currentSequence.length > 1) {
          sequences.push([...currentSequence]);
        }
        currentSequence = [];
      }
      
      currentSequence.push(execution.taskId);
      lastTime = time;
    });
    
    if (currentSequence.length > 1) {
      sequences.push(currentSequence);
    }
    
    return sequences;
  }

  /**
   * Find new sequences that haven't been seen before
   */
  private findNewSequences(sequences: string[][]): string[][] {
    // Simple implementation: sequences that appear only once
    const sequenceMap = new Map<string, number>();
    
    sequences.forEach(seq => {
      const key = seq.join('->');
      sequenceMap.set(key, (sequenceMap.get(key) || 0) + 1);
    });
    
    return sequences.filter(seq => {
      const key = seq.join('->');
      return sequenceMap.get(key) === 1;
    });
  }

  /**
   * Generate behavior insights (simplified version for context only)
   */
  generateInsights(context: LearningContext): BehaviorInsight[] {
    const insights: BehaviorInsight[] = [];

    if (this.executionRecords.length > 10) {
      const successRate = this.executionRecords.filter(r => r.result.success).length / this.executionRecords.length;
      
      if (successRate > 0.9) {
        insights.push({
          id: `insight_${Date.now()}_1`,
          type: 'productivity',
          title: 'Excellent Performance',
          description: `Your automation success rate is ${Math.round(successRate * 100)}%`,
          impact: 'high',
          actionable: false,
          timestamp: new Date(),
        });
      }
    }

    return insights;
  }

  /**
   * Generate behavior insights (full version)
   */
  generateDetailedInsights(
    tasks: LearnedTask[],
    executionHistory: TaskExecutionResult[],
    context: LearningContext
  ): BehaviorInsight[] {
    const insights: BehaviorInsight[] = [];

    // Productivity insights
    const totalExecutions = executionHistory.length;
    const successfulExecutions = executionHistory.filter(e => e.success).length;
    const overallSuccessRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    if (overallSuccessRate > 0.9 && totalExecutions > 10) {
      insights.push({
        id: `insight_${Date.now()}_1`,
        type: 'productivity',
        title: 'Excellent Automation Success',
        description: `Your automated tasks have a ${Math.round(overallSuccessRate * 100)}% success rate. Great job!`,
        impact: 'high',
        actionable: false,
        timestamp: new Date(),
      });
    }

    // Efficiency insights
    const avgDuration = executionHistory.reduce((sum, e) => sum + e.duration, 0) / totalExecutions;
    const fastTasks = tasks.filter(t => {
      const taskExecs = executionHistory.filter(e => e.taskId === t.id);
      const taskAvg = taskExecs.reduce((sum, e) => sum + e.duration, 0) / taskExecs.length;
      return taskAvg < avgDuration * 0.5;
    });

    if (fastTasks.length > 0) {
      insights.push({
        id: `insight_${Date.now()}_2`,
        type: 'efficiency',
        title: 'Fast Tasks Identified',
        description: `${fastTasks.length} tasks execute significantly faster than average. Consider using them more often.`,
        impact: 'medium',
        actionable: true,
        suggestedAction: `Focus on: ${fastTasks.slice(0, 3).map(t => t.name).join(', ')}`,
        timestamp: new Date(),
      });
    }

    // Pattern insights
    const patternChanges = this.detectPatternChanges(tasks, executionHistory, context);
    if (patternChanges.length > 0) {
      insights.push({
        id: `insight_${Date.now()}_3`,
        type: 'pattern',
        title: 'Behavior Pattern Changes Detected',
        description: `Detected ${patternChanges.length} changes in your usage patterns.`,
        impact: 'medium',
        actionable: true,
        suggestedAction: 'Review pattern changes to optimize your workflow',
        timestamp: new Date(),
      });
    }

    // Suggestion insights
    const underutilizedTasks = tasks.filter(t => 
      t.enabled && 
      t.successRate > 0.8 && 
      t.timesExecuted < 5
    );

    if (underutilizedTasks.length > 0) {
      insights.push({
        id: `insight_${Date.now()}_4`,
        type: 'suggestion',
        title: 'Underutilized Tasks',
        description: `You have ${underutilizedTasks.length} reliable tasks that could save you more time.`,
        impact: 'medium',
        actionable: true,
        suggestedAction: `Try: ${underutilizedTasks.slice(0, 2).map(t => t.name).join(', ')}`,
        timestamp: new Date(),
      });
    }

    this.behaviorInsights.push(...insights);
    return insights;
  }

  /**
   * Calculate smart rate (0-100) based on current context
   */
  calculateSmartRate(context: LearningContext): number {
    if (this.executionRecords.length === 0) {
      return 50; // Default neutral rate
    }

    // Calculate various metrics
    const recentRecords = this.executionRecords.slice(-20);
    const successRate = recentRecords.filter(r => r.result.success).length / recentRecords.length;
    const avgDuration = recentRecords.reduce((sum, r) => sum + r.result.duration, 0) / recentRecords.length;
    
    // Weighted scoring
    const successScore = successRate * 40; // 40% weight
    const speedScore = Math.max(0, 30 - (avgDuration / 100)) * 30 / 30; // 30% weight (faster is better)
    const volumeScore = Math.min(30, (this.executionRecords.length / 10) * 30); // 30% weight
    
    return Math.min(100, Math.round(successScore + speedScore + volumeScore));
  }

  /**
   * Calculate smart rate data
   */
  calculateSmartRateData(
    tasks: LearnedTask[],
    executionHistory: TaskExecutionResult[]
  ): SmartRateData {
    const enabledTasks = tasks.filter(t => t.enabled);
    
    // Calculate averages
    const avgSuccessRate = enabledTasks.length > 0
      ? enabledTasks.reduce((sum, t) => sum + t.successRate, 0) / enabledTasks.length
      : 0;

    const avgConfidence = enabledTasks.length > 0
      ? enabledTasks.reduce((sum, t) => sum + t.trigger.confidence, 0) / enabledTasks.length
      : 0;

    // Find most used task
    const taskUsage = new Map<string, number>();
    executionHistory.forEach(e => {
      taskUsage.set(e.taskId, (taskUsage.get(e.taskId) || 0) + 1);
    });

    let mostUsedTaskId = '';
    let maxUsage = 0;
    taskUsage.forEach((count, taskId) => {
      if (count > maxUsage) {
        maxUsage = count;
        mostUsedTaskId = taskId;
      }
    });

    const mostUsedTask = tasks.find(t => t.id === mostUsedTaskId)?.name || 'None';

    // Find most successful task
    const mostSuccessfulTask = tasks
      .filter(t => t.timesExecuted > 0)
      .sort((a, b) => b.successRate - a.successRate)[0]?.name || 'None';

    // Find peak usage time
    const hourlyDist = this.analyzeHourlyDistribution(executionHistory);
    const peakUsageTime = this.findPeakHour(hourlyDist);

    // Extract common sequences
    const sequences = this.extractRecentSequences(executionHistory, 30);
    const sequenceCounts = new Map<string, number>();
    
    sequences.forEach(seq => {
      const key = seq.join('->');
      sequenceCounts.set(key, (sequenceCounts.get(key) || 0) + 1);
    });

    const commonSequences = Array.from(sequenceCounts.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([seq, _]) => seq);

    const smartRate: SmartRateData = {
      timestamp: new Date(),
      tasksCount: enabledTasks.length,
      executionsCount: executionHistory.length,
      avgSuccessRate: Math.round(avgSuccessRate * 100) / 100,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      activeUsers: 1, // Single user for now
      patterns: {
        mostUsedTask,
        mostSuccessfulTask,
        peakUsageTime,
        commonSequences,
      },
    };

    this.smartRateHistory.push(smartRate);
    
    // Keep only last 100 entries
    if (this.smartRateHistory.length > 100) {
      this.smartRateHistory = this.smartRateHistory.slice(-100);
    }

    return smartRate;
  }

  /**
   * Get smart rate history
   */
  getSmartRateHistory(limit: number = 30): SmartRateData[] {
    return this.smartRateHistory.slice(-limit);
  }

  /**
   * Get recent pattern changes
   */
  getPatternChanges(limit: number = 10): PatternChange[] {
    return this.patternChanges.slice(-limit);
  }

  /**
   * Get recent behavior insights
   */
  getBehaviorInsights(limit: number = 10): BehaviorInsight[] {
    return this.behaviorInsights.slice(-limit);
  }

  /**
   * Compare two time periods
   */
  compareTimePeriods(
    tasks: LearnedTask[],
    executionHistory: TaskExecutionResult[],
    daysAgo: number
  ): {
    period1: SmartRateData;
    period2: SmartRateData;
    changes: {
      tasksChange: number;
      executionsChange: number;
      successRateChange: number;
      confidenceChange: number;
    };
  } {
    const now = Date.now();
    const periodLength = daysAgo * 24 * 60 * 60 * 1000;
    const cutoff = now - periodLength;
    const previousCutoff = now - (2 * periodLength);

    // Period 1 (recent)
    const period1Executions = executionHistory.filter(
      e => e.timestamp.getTime() >= cutoff
    );

    // Period 2 (previous)
    const period2Executions = executionHistory.filter(
      e => e.timestamp.getTime() >= previousCutoff && e.timestamp.getTime() < cutoff
    );

    const period1Data = this.calculateSmartRate(tasks, period1Executions);
    const period2Data = this.calculateSmartRate(tasks, period2Executions);

    const changes = {
      tasksChange: period1Data.tasksCount - period2Data.tasksCount,
      executionsChange: period1Data.executionsCount - period2Data.executionsCount,
      successRateChange: Math.round((period1Data.avgSuccessRate - period2Data.avgSuccessRate) * 100) / 100,
      confidenceChange: Math.round((period1Data.avgConfidence - period2Data.avgConfidence) * 100) / 100,
    };

    return {
      period1: period1Data,
      period2: period2Data,
      changes,
    };
  }

  /**
   * Get learning velocity (how fast the system is learning)
   */
  getLearningVelocity(tasks: LearnedTask[]): {
    newTasksLastWeek: number;
    avgConfidenceGrowth: number;
    learningRate: 'fast' | 'moderate' | 'slow';
  } {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const newTasksLastWeek = tasks.filter(
      t => now - t.createdAt.getTime() < oneWeek
    ).length;

    // Calculate average confidence growth
    const tasksWithHistory = tasks.filter(t => t.timesExecuted > 5);
    const avgConfidenceGrowth = tasksWithHistory.length > 0
      ? tasksWithHistory.reduce((sum, t) => sum + t.trigger.confidence, 0) / tasksWithHistory.length
      : 0;

    let learningRate: 'fast' | 'moderate' | 'slow' = 'slow';
    if (newTasksLastWeek > 5 || avgConfidenceGrowth > 0.8) {
      learningRate = 'fast';
    } else if (newTasksLastWeek > 2 || avgConfidenceGrowth > 0.6) {
      learningRate = 'moderate';
    }

    return {
      newTasksLastWeek,
      avgConfidenceGrowth: Math.round(avgConfidenceGrowth * 100) / 100,
      learningRate,
    };
  }

  /**
   * Clear old data
   */
  clearOldData(daysToKeep: number = 30): void {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    this.patternChanges = this.patternChanges.filter(
      c => c.timestamp.getTime() > cutoff
    );
    
    this.behaviorInsights = this.behaviorInsights.filter(
      i => i.timestamp.getTime() > cutoff
    );
    
    this.smartRateHistory = this.smartRateHistory.filter(
      s => s.timestamp.getTime() > cutoff
    );

    console.log('[Smart Analyzer] Cleared old data');
  }
}

// Export singleton instance
export const smartAnalyzer = new SmartAnalyzer();
