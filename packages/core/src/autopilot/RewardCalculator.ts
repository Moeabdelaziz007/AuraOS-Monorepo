/**
 * Reward Calculator
 * Pure logic for calculating points, experience, and rewards
 */

import './logger'; // Initialize global logger
import { Achievement, LEVEL_TITLES, LEVEL_PERKS } from './achievements';
import { LearnedTask, TaskExecutionResult } from './types';

/**
 * Reward for accomplishment
 */
export interface Reward {
  id: string;
  type: 'achievement' | 'points' | 'level_up' | 'badge';
  title: string;
  description: string;
  points: number;
  achievement?: Achievement;
  timestamp: Date;
  celebrated: boolean;
}

/**
 * Autopilot level and experience
 */
export interface AutopilotLevel {
  level: number;
  experience: number;
  experienceToNext: number;
  title: string;
  perks: string[];
}

/**
 * Performance improvement tracking
 */
export interface PerformanceImprovement {
  metric: 'speed' | 'accuracy' | 'efficiency' | 'learning_rate';
  before: number;
  after: number;
  improvement: number; // percentage
  timestamp: Date;
}

/**
 * Reward Calculator
 * Handles all reward calculations without managing state
 */
export class RewardCalculator {
  /**
   * Calculate base rewards for task execution
   */
  calculateExecutionRewards(result: TaskExecutionResult): {
    points: number;
    experience: number;
  } {
    let points = 0;
    let experience = 0;

    // Base points for successful execution
    if (result.success) {
      points += 10;
      experience += 10;
      
      // Bonus for fast execution
      if (result.duration < 500) {
        points += 5;
        experience += 5;
      }
    }

    return { points, experience };
  }

  /**
   * Calculate speed improvement rewards
   */
  calculateSpeedReward(
    currentDuration: number,
    avgDuration: number
  ): { points: number; improvement: number; shouldReward: boolean } {
    if (avgDuration <= 0) {
      return { points: 0, improvement: 0, shouldReward: false };
    }

    const improvement = ((avgDuration - currentDuration) / avgDuration) * 100;
    
    if (improvement >= 20) {
      const points = Math.floor(improvement * 2);
      return { points, improvement, shouldReward: true };
    }

    return { points: 0, improvement, shouldReward: false };
  }

  /**
   * Calculate accuracy improvement rewards
   */
  calculateAccuracyReward(
    currentSuccessRate: number,
    previousSuccessRate: number
  ): { points: number; improvement: number; shouldReward: boolean } {
    if (currentSuccessRate <= previousSuccessRate) {
      return { points: 0, improvement: 0, shouldReward: false };
    }

    const improvement = (currentSuccessRate - previousSuccessRate) * 100;
    const points = Math.floor(improvement * 5);

    return { points, improvement, shouldReward: true };
  }

  /**
   * Calculate consistency rewards
   */
  calculateConsistencyReward(timesExecuted: number): {
    points: number;
    shouldReward: boolean;
  } {
    if (timesExecuted % 10 !== 0) {
      return { points: 0, shouldReward: false };
    }

    const points = 20 + (timesExecuted / 10) * 5;
    return { points, shouldReward: true };
  }

  /**
   * Calculate problem solving rewards
   */
  calculateProblemSolvingReward(
    previousSuccessRate: number,
    currentSuccessRate: number
  ): { points: number; improvement: number; shouldReward: boolean } {
    if (previousSuccessRate >= 0.5 || currentSuccessRate <= 0.8) {
      return { points: 0, improvement: 0, shouldReward: false };
    }

    const improvement = (currentSuccessRate - previousSuccessRate) * 100;
    const points = 200;

    return { points, improvement, shouldReward: true };
  }

  /**
   * Calculate new task learning reward
   */
  calculateNewTaskReward(): { points: number } {
    return { points: 100 };
  }

  /**
   * Calculate quick learning reward
   */
  calculateQuickLearningReward(
    confidence: number,
    executionsToLearn: number
  ): { points: number; shouldReward: boolean } {
    if (confidence >= 0.8 && executionsToLearn <= 5) {
      return { points: 150, shouldReward: true };
    }

    return { points: 0, shouldReward: false };
  }

  /**
   * Calculate required experience for next level
   */
  calculateRequiredExperience(level: number): number {
    // Exponential growth: 100 * 1.5^level
    return Math.floor(100 * Math.pow(1.5, level));
  }

  /**
   * Check if level up should occur
   */
  shouldLevelUp(currentExperience: number, currentLevel: number): boolean {
    const requiredExp = this.calculateRequiredExperience(currentLevel);
    return currentExperience >= requiredExp;
  }

  /**
   * Calculate new level and remaining experience
   */
  calculateLevelUp(currentExperience: number, currentLevel: number): {
    newLevel: number;
    remainingExperience: number;
  } {
    let level = currentLevel;
    let experience = currentExperience;

    while (this.shouldLevelUp(experience, level)) {
      const requiredExp = this.calculateRequiredExperience(level);
      experience -= requiredExp;
      level++;
    }

    return {
      newLevel: level,
      remainingExperience: experience,
    };
  }

  /**
   * Get level information
   */
  getLevelInfo(level: number, experience: number): AutopilotLevel {
    const titleIndex = Math.min(Math.floor(level / 5), LEVEL_TITLES.length - 1);
    const title = LEVEL_TITLES[titleIndex];
    const perks = this.getPerksForLevel(level);

    return {
      level,
      experience,
      experienceToNext: this.calculateRequiredExperience(level),
      title,
      perks,
    };
  }

  /**
   * Get perks unlocked at level
   */
  private getPerksForLevel(level: number): string[] {
    const perks: string[] = [];
    
    Object.entries(LEVEL_PERKS).forEach(([requiredLevel, perk]) => {
      if (level >= parseInt(requiredLevel)) {
        perks.push(perk);
      }
    });
    
    return perks;
  }

  /**
   * Generate unique reward ID
   */
  generateRewardId(type: string = 'reward'): string {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create reward object
   */
  createReward(
    type: Reward['type'],
    title: string,
    description: string,
    points: number,
    achievement?: Achievement
  ): Reward {
    return {
      id: this.generateRewardId(type),
      type,
      title,
      description,
      points,
      achievement,
      timestamp: new Date(),
      celebrated: false,
    };
  }

  /**
   * Create performance improvement record
   */
  createImprovement(
    metric: PerformanceImprovement['metric'],
    before: number,
    after: number,
    improvement: number
  ): PerformanceImprovement {
    return {
      metric,
      before,
      after,
      improvement,
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const rewardCalculator = new RewardCalculator();
