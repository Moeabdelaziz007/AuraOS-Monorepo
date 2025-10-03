/**
 * Autopilot Reward System
 * Reinforcement learning system that rewards the AI for better performance
 * Tracks task quality, speed, accuracy, and user satisfaction
 */

import { firestoreService } from '@auraos/firebase/services/firestore.service';

export interface TaskPerformance {
  taskId: string;
  taskType: string;
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  success: boolean;
  quality: number; // 0-100
  accuracy: number; // 0-100
  userSatisfaction?: number; // 0-5 stars
  errorCount: number;
  retryCount: number;
  tokensUsed: number;
  costEfficiency: number; // 0-100
}

export interface AutopilotReward {
  taskId: string;
  timestamp: Date;
  
  // Performance scores (0-100)
  speedScore: number;
  qualityScore: number;
  accuracyScore: number;
  efficiencyScore: number;
  satisfactionScore: number;
  
  // Overall reward
  totalReward: number;
  
  // Bonuses
  bonuses: {
    perfectExecution: number;
    fastCompletion: number;
    zeroErrors: number;
    firstAttempt: number;
    costEffective: number;
    userDelight: number;
  };
  
  // Penalties
  penalties: {
    slowExecution: number;
    errors: number;
    retries: number;
    highCost: number;
    userDissatisfaction: number;
  };
  
  // Learning feedback
  feedback: string;
  improvements: string[];
}

export interface AutopilotMetrics {
  autopilotId: string;
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  averageReward: number;
  totalReward: number;
  
  // Performance averages
  averageSpeed: number;
  averageQuality: number;
  averageAccuracy: number;
  averageEfficiency: number;
  averageSatisfaction: number;
  
  // Improvement tracking
  rewardTrend: number; // positive = improving, negative = declining
  performanceLevel: 'novice' | 'intermediate' | 'advanced' | 'expert' | 'master';
  
  // Best performances
  bestReward: number;
  fastestTask: number;
  highestQuality: number;
  
  // Learning stats
  totalLearningIterations: number;
  lastUpdated: Date;
}

/**
 * Autopilot Reward System Service
 */
class AutopilotRewardService {
  // Reward weights
  private readonly WEIGHTS = {
    SPEED: 0.25,
    QUALITY: 0.30,
    ACCURACY: 0.25,
    EFFICIENCY: 0.10,
    SATISFACTION: 0.10,
  };

  // Bonus rewards
  private readonly BONUSES = {
    PERFECT_EXECUTION: 50,
    FAST_COMPLETION: 30,
    ZERO_ERRORS: 40,
    FIRST_ATTEMPT: 35,
    COST_EFFECTIVE: 25,
    USER_DELIGHT: 45,
  };

  // Penalty values
  private readonly PENALTIES = {
    SLOW_EXECUTION: -20,
    ERROR: -15,
    RETRY: -10,
    HIGH_COST: -25,
    USER_DISSATISFACTION: -30,
  };

  // Performance thresholds
  private readonly THRESHOLDS = {
    FAST_TASK: 5000, // 5 seconds
    SLOW_TASK: 30000, // 30 seconds
    HIGH_QUALITY: 90,
    LOW_QUALITY: 60,
    HIGH_ACCURACY: 95,
    LOW_ACCURACY: 70,
    COST_EFFECTIVE: 80,
    HIGH_COST: 40,
  };

  /**
   * Calculate reward for a completed task
   */
  async calculateReward(performance: TaskPerformance): Promise<AutopilotReward> {
    const reward: AutopilotReward = {
      taskId: performance.taskId,
      timestamp: new Date(),
      speedScore: this.calculateSpeedScore(performance.duration),
      qualityScore: performance.quality,
      accuracyScore: performance.accuracy,
      efficiencyScore: performance.costEfficiency,
      satisfactionScore: performance.userSatisfaction 
        ? (performance.userSatisfaction / 5) * 100 
        : 75, // default neutral
      totalReward: 0,
      bonuses: {
        perfectExecution: 0,
        fastCompletion: 0,
        zeroErrors: 0,
        firstAttempt: 0,
        costEffective: 0,
        userDelight: 0,
      },
      penalties: {
        slowExecution: 0,
        errors: 0,
        retries: 0,
        highCost: 0,
        userDissatisfaction: 0,
      },
      feedback: '',
      improvements: [],
    };

    // Calculate base reward (weighted average)
    const baseReward = 
      reward.speedScore * this.WEIGHTS.SPEED +
      reward.qualityScore * this.WEIGHTS.QUALITY +
      reward.accuracyScore * this.WEIGHTS.ACCURACY +
      reward.efficiencyScore * this.WEIGHTS.EFFICIENCY +
      reward.satisfactionScore * this.WEIGHTS.SATISFACTION;

    // Apply bonuses
    if (performance.success) {
      // Perfect execution bonus
      if (reward.qualityScore >= 95 && reward.accuracyScore >= 95 && performance.errorCount === 0) {
        reward.bonuses.perfectExecution = this.BONUSES.PERFECT_EXECUTION;
      }

      // Fast completion bonus
      if (performance.duration < this.THRESHOLDS.FAST_TASK) {
        reward.bonuses.fastCompletion = this.BONUSES.FAST_COMPLETION;
      }

      // Zero errors bonus
      if (performance.errorCount === 0) {
        reward.bonuses.zeroErrors = this.BONUSES.ZERO_ERRORS;
      }

      // First attempt bonus
      if (performance.retryCount === 0) {
        reward.bonuses.firstAttempt = this.BONUSES.FIRST_ATTEMPT;
      }

      // Cost effective bonus
      if (performance.costEfficiency >= this.THRESHOLDS.COST_EFFECTIVE) {
        reward.bonuses.costEffective = this.BONUSES.COST_EFFECTIVE;
      }

      // User delight bonus
      if (performance.userSatisfaction && performance.userSatisfaction >= 4.5) {
        reward.bonuses.userDelight = this.BONUSES.USER_DELIGHT;
      }
    }

    // Apply penalties
    if (!performance.success) {
      reward.penalties.errors = this.PENALTIES.ERROR * (performance.errorCount + 1);
    }

    if (performance.duration > this.THRESHOLDS.SLOW_TASK) {
      reward.penalties.slowExecution = this.PENALTIES.SLOW_EXECUTION;
    }

    if (performance.retryCount > 0) {
      reward.penalties.retries = this.PENALTIES.RETRY * performance.retryCount;
    }

    if (performance.costEfficiency < this.THRESHOLDS.HIGH_COST) {
      reward.penalties.highCost = this.PENALTIES.HIGH_COST;
    }

    if (performance.userSatisfaction && performance.userSatisfaction < 2.5) {
      reward.penalties.userDissatisfaction = this.PENALTIES.USER_DISSATISFACTION;
    }

    // Calculate total bonuses and penalties
    const totalBonuses = Object.values(reward.bonuses).reduce((sum, val) => sum + val, 0);
    const totalPenalties = Object.values(reward.penalties).reduce((sum, val) => sum + val, 0);

    // Final reward calculation
    reward.totalReward = Math.max(0, baseReward + totalBonuses + totalPenalties);

    // Generate feedback
    reward.feedback = this.generateFeedback(reward, performance);
    reward.improvements = this.generateImprovements(reward, performance);

    // Save reward to database
    await this.saveReward(reward);

    // Update autopilot metrics
    await this.updateMetrics(performance, reward);

    return reward;
  }

  /**
   * Calculate speed score based on duration
   */
  private calculateSpeedScore(duration: number): number {
    // Exponential decay: faster = higher score
    if (duration < this.THRESHOLDS.FAST_TASK) {
      return 100;
    } else if (duration < this.THRESHOLDS.SLOW_TASK) {
      // Linear interpolation between fast and slow
      const ratio = (this.THRESHOLDS.SLOW_TASK - duration) / 
                    (this.THRESHOLDS.SLOW_TASK - this.THRESHOLDS.FAST_TASK);
      return 70 + (ratio * 30);
    } else {
      // Exponential decay for very slow tasks
      const slowFactor = Math.min(duration / this.THRESHOLDS.SLOW_TASK, 5);
      return Math.max(0, 70 - (slowFactor * 15));
    }
  }

  /**
   * Generate feedback for the autopilot
   */
  private generateFeedback(reward: AutopilotReward, performance: TaskPerformance): string {
    const feedback: string[] = [];

    // Overall performance
    if (reward.totalReward >= 90) {
      feedback.push('🌟 Excellent performance! Keep up the great work.');
    } else if (reward.totalReward >= 75) {
      feedback.push('✅ Good job! Performance is solid.');
    } else if (reward.totalReward >= 60) {
      feedback.push('👍 Acceptable performance, but there\'s room for improvement.');
    } else {
      feedback.push('⚠️ Performance needs improvement. Review the suggestions below.');
    }

    // Specific feedback
    if (reward.bonuses.perfectExecution > 0) {
      feedback.push('🎯 Perfect execution achieved!');
    }

    if (reward.bonuses.fastCompletion > 0) {
      feedback.push('⚡ Lightning fast completion!');
    }

    if (reward.bonuses.zeroErrors > 0) {
      feedback.push('✨ Flawless execution with zero errors!');
    }

    if (reward.penalties.slowExecution < 0) {
      feedback.push('🐌 Task took longer than expected. Consider optimization.');
    }

    if (reward.penalties.errors < 0) {
      feedback.push('❌ Errors detected. Review error handling logic.');
    }

    if (reward.penalties.highCost < 0) {
      feedback.push('💰 High token usage. Optimize prompts for efficiency.');
    }

    return feedback.join(' ');
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovements(reward: AutopilotReward, performance: TaskPerformance): string[] {
    const improvements: string[] = [];

    // Speed improvements
    if (reward.speedScore < 70) {
      improvements.push('Optimize task execution time by caching common operations');
      improvements.push('Consider parallel processing for independent subtasks');
    }

    // Quality improvements
    if (reward.qualityScore < this.THRESHOLDS.HIGH_QUALITY) {
      improvements.push('Enhance output quality by adding validation steps');
      improvements.push('Use more specific prompts for better results');
    }

    // Accuracy improvements
    if (reward.accuracyScore < this.THRESHOLDS.HIGH_ACCURACY) {
      improvements.push('Implement stricter validation checks');
      improvements.push('Add verification steps before finalizing output');
    }

    // Efficiency improvements
    if (reward.efficiencyScore < this.THRESHOLDS.COST_EFFECTIVE) {
      improvements.push('Reduce token usage by optimizing prompt length');
      improvements.push('Use more efficient models for simpler tasks');
    }

    // Error handling
    if (performance.errorCount > 0) {
      improvements.push('Implement better error handling and recovery');
      improvements.push('Add fallback strategies for common failure cases');
    }

    // Retry optimization
    if (performance.retryCount > 0) {
      improvements.push('Reduce retries by improving first-attempt success rate');
      improvements.push('Analyze retry patterns to prevent common failures');
    }

    return improvements;
  }

  /**
   * Save reward to database
   */
  private async saveReward(reward: AutopilotReward): Promise<void> {
    await firestoreService.autopilotRewards.create(reward);
  }

  /**
   * Update autopilot metrics
   */
  private async updateMetrics(performance: TaskPerformance, reward: AutopilotReward): Promise<void> {
    const autopilotId = 'main'; // Can be extended for multiple autopilots
    
    let metrics = await firestoreService.autopilotMetrics.get(autopilotId);
    
    if (!metrics) {
      // Initialize metrics
      metrics = {
        autopilotId,
        totalTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
        averageReward: 0,
        totalReward: 0,
        averageSpeed: 0,
        averageQuality: 0,
        averageAccuracy: 0,
        averageEfficiency: 0,
        averageSatisfaction: 0,
        rewardTrend: 0,
        performanceLevel: 'novice',
        bestReward: 0,
        fastestTask: Infinity,
        highestQuality: 0,
        totalLearningIterations: 0,
        lastUpdated: new Date(),
      };
    }

    // Update counts
    metrics.totalTasks += 1;
    if (performance.success) {
      metrics.successfulTasks += 1;
    } else {
      metrics.failedTasks += 1;
    }

    // Update averages (running average)
    const n = metrics.totalTasks;
    metrics.averageReward = ((metrics.averageReward * (n - 1)) + reward.totalReward) / n;
    metrics.averageSpeed = ((metrics.averageSpeed * (n - 1)) + reward.speedScore) / n;
    metrics.averageQuality = ((metrics.averageQuality * (n - 1)) + reward.qualityScore) / n;
    metrics.averageAccuracy = ((metrics.averageAccuracy * (n - 1)) + reward.accuracyScore) / n;
    metrics.averageEfficiency = ((metrics.averageEfficiency * (n - 1)) + reward.efficiencyScore) / n;
    metrics.averageSatisfaction = ((metrics.averageSatisfaction * (n - 1)) + reward.satisfactionScore) / n;

    // Update totals
    metrics.totalReward += reward.totalReward;

    // Update bests
    metrics.bestReward = Math.max(metrics.bestReward, reward.totalReward);
    metrics.fastestTask = Math.min(metrics.fastestTask, performance.duration);
    metrics.highestQuality = Math.max(metrics.highestQuality, reward.qualityScore);

    // Calculate reward trend (last 10 tasks)
    const recentRewards = await this.getRecentRewards(10);
    if (recentRewards.length >= 2) {
      const oldAvg = recentRewards.slice(0, 5).reduce((sum, r) => sum + r.totalReward, 0) / 5;
      const newAvg = recentRewards.slice(-5).reduce((sum, r) => sum + r.totalReward, 0) / 5;
      metrics.rewardTrend = ((newAvg - oldAvg) / oldAvg) * 100;
    }

    // Update performance level
    metrics.performanceLevel = this.calculatePerformanceLevel(metrics);

    // Update learning iterations
    metrics.totalLearningIterations += 1;
    metrics.lastUpdated = new Date();

    // Save metrics
    await firestoreService.autopilotMetrics.update(autopilotId, metrics);
  }

  /**
   * Calculate performance level based on metrics
   */
  private calculatePerformanceLevel(metrics: AutopilotMetrics): AutopilotMetrics['performanceLevel'] {
    const avgScore = (
      metrics.averageSpeed +
      metrics.averageQuality +
      metrics.averageAccuracy +
      metrics.averageEfficiency +
      metrics.averageSatisfaction
    ) / 5;

    if (avgScore >= 95) return 'master';
    if (avgScore >= 85) return 'expert';
    if (avgScore >= 75) return 'advanced';
    if (avgScore >= 65) return 'intermediate';
    return 'novice';
  }

  /**
   * Get recent rewards for trend analysis
   */
  private async getRecentRewards(limit: number = 10): Promise<AutopilotReward[]> {
    return firestoreService.autopilotRewards.getRecent(limit);
  }

  /**
   * Get autopilot metrics
   */
  async getMetrics(autopilotId: string = 'main'): Promise<AutopilotMetrics | null> {
    return firestoreService.autopilotMetrics.get(autopilotId);
  }

  /**
   * Get performance history
   */
  async getPerformanceHistory(limit: number = 50): Promise<AutopilotReward[]> {
    return firestoreService.autopilotRewards.getRecent(limit);
  }

  /**
   * Get improvement suggestions based on recent performance
   */
  async getImprovementSuggestions(): Promise<string[]> {
    const recentRewards = await this.getRecentRewards(10);
    const suggestions: Set<string> = new Set();

    for (const reward of recentRewards) {
      reward.improvements.forEach(imp => suggestions.add(imp));
    }

    return Array.from(suggestions);
  }

  /**
   * Analyze performance trends
   */
  async analyzePerformanceTrends(): Promise<{
    improving: boolean;
    trend: number;
    recommendations: string[];
  }> {
    const metrics = await this.getMetrics();
    if (!metrics) {
      return {
        improving: false,
        trend: 0,
        recommendations: ['Start tracking performance to get insights'],
      };
    }

    const recommendations: string[] = [];

    // Speed recommendations
    if (metrics.averageSpeed < 70) {
      recommendations.push('Focus on improving task execution speed');
    }

    // Quality recommendations
    if (metrics.averageQuality < 80) {
      recommendations.push('Enhance output quality through better validation');
    }

    // Accuracy recommendations
    if (metrics.averageAccuracy < 85) {
      recommendations.push('Improve accuracy with stricter checks');
    }

    // Efficiency recommendations
    if (metrics.averageEfficiency < 75) {
      recommendations.push('Optimize token usage for better cost efficiency');
    }

    // Success rate recommendations
    const successRate = (metrics.successfulTasks / metrics.totalTasks) * 100;
    if (successRate < 90) {
      recommendations.push('Improve success rate through better error handling');
    }

    return {
      improving: metrics.rewardTrend > 0,
      trend: metrics.rewardTrend,
      recommendations,
    };
  }
}

// Export singleton instance
export const autopilotRewardService = new AutopilotRewardService();
