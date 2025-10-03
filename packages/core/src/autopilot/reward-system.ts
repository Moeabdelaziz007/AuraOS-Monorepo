/**
 * Reward System for Autopilot
 * Orchestrates achievements, rewards calculation, and progress tracking
 * 
 * This module serves as the main entry point for the reward system,
 * delegating to specialized modules for definitions, calculations, and tracking.
 */

import './logger'; // Initialize global logger

// Re-export types and interfaces
export type { AchievementType } from './achievements';
export type {
  Achievement,
  AchievementDefinition,
} from './achievements';

export type {
  Reward,
  AutopilotLevel,
  PerformanceImprovement,
} from './RewardCalculator';

// Re-export constants
export {
  ACHIEVEMENT_DEFINITIONS,
  LEVEL_TITLES,
  LEVEL_PERKS,
} from './achievements';

// Re-export classes
export {
  RewardCalculator,
  rewardCalculator,
} from './RewardCalculator';

export {
  ProgressTracker,
  progressTracker,
} from './ProgressTracker';

import { Achievement } from './achievements';
import { RewardCalculator, Reward, PerformanceImprovement } from './RewardCalculator';
import { ProgressTracker } from './ProgressTracker';
import { LearnedTask, TaskExecutionResult } from './types';

/**
 * Reward System Service
 * High-level interface for managing rewards and achievements
 */
export class RewardSystem {
  private calculator: RewardCalculator;
  private tracker: ProgressTracker;

  constructor() {
    this.calculator = new RewardCalculator();
    this.tracker = new ProgressTracker();
  }

  /**
   * Evaluate and award rewards for a task execution
   */
  evaluateRewards(result: TaskExecutionResult, context: any): {
    achievements: Achievement[];
    points: number;
    experience: number;
    levelUp: boolean;
    streaks: number;
  } {
    const achievements: Achievement[] = [];
    const previousLevel = this.tracker.getLevel();

    // Calculate base rewards
    const baseRewards = this.calculator.calculateExecutionRewards(result);
    
    // Update streak
    this.tracker.updateStreak(result.success);
    
    // Award points and experience
    this.tracker.addPoints(baseRewards.points);
    this.tracker.addExperience(baseRewards.experience);
    
    // Check for level up
    const levelUpResult = this.checkAndHandleLevelUp();
    const levelUp = this.tracker.getLevel() > previousLevel;

    // Check for streak achievements
    if (this.tracker.getCurrentStreak() >= 5) {
      const streakAchievements = this.tracker.checkAchievements(
        'streak',
        this.tracker.getCurrentStreak()
      );
      
      streakAchievements.forEach(achievement => {
        this.handleAchievementUnlock(achievement);
        achievements.push(achievement);
      });
    }

    return {
      achievements,
      points: baseRewards.points,
      experience: baseRewards.experience,
      levelUp,
      streaks: this.tracker.getCurrentStreak(),
    };
  }

  /**
   * Evaluate task execution for rewards
   */
  evaluateExecution(
    task: LearnedTask,
    result: TaskExecutionResult,
    avgDuration: number,
    previousSuccessRate: number
  ): Reward[] {
    const rewards: Reward[] = [];

    // Update streak
    if (result.success) {
      const today = new Date().toDateString();
      const lastSuccess = this.tracker['lastSuccessDate']?.toDateString();
      
      if (lastSuccess === today) {
        this.tracker.updateStreak(true);
      } else {
        this.tracker.updateStreak(true);
      }
      
      // Check streak achievements
      const streakAchievements = this.tracker.checkAchievements(
        'streak',
        this.tracker.getCurrentStreak()
      );
      
      streakAchievements.forEach(achievement => {
        const reward = this.handleAchievementUnlock(achievement);
        if (reward) rewards.push(reward);
      });
    } else {
      this.tracker.updateStreak(false);
    }

    // Speed rewards
    if (result.success && avgDuration > 0) {
      const speedResult = this.calculator.calculateSpeedReward(result.duration, avgDuration);
      
      if (speedResult.shouldReward) {
        const reward = this.awardPoints(
          speedResult.points,
          `⚡ ${speedResult.improvement.toFixed(0)}% faster execution`
        );
        rewards.push(reward);
        
        // Track improvement
        const improvement = this.calculator.createImprovement(
          'speed',
          avgDuration,
          result.duration,
          speedResult.improvement
        );
        this.tracker.addImprovement(improvement);
        
        // Check speed achievements
        const speedAchievements = this.tracker.checkAchievements(
          'speed_demon',
          speedResult.improvement
        );
        
        speedAchievements.forEach(achievement => {
          const achievementReward = this.handleAchievementUnlock(achievement);
          if (achievementReward) rewards.push(achievementReward);
        });
      }
    }

    // Accuracy rewards
    if (result.success && task.successRate > previousSuccessRate) {
      const accuracyResult = this.calculator.calculateAccuracyReward(
        task.successRate,
        previousSuccessRate
      );
      
      if (accuracyResult.shouldReward) {
        const reward = this.awardPoints(
          accuracyResult.points,
          `🎯 Improved accuracy by ${accuracyResult.improvement.toFixed(1)}%`
        );
        rewards.push(reward);
        
        // Track improvement
        const improvement = this.calculator.createImprovement(
          'accuracy',
          previousSuccessRate,
          task.successRate,
          accuracyResult.improvement
        );
        this.tracker.addImprovement(improvement);
        
        // Check accuracy achievements
        const accuracyAchievements = this.tracker.checkAchievements(
          'perfectionist',
          task.successRate * 100
        );
        
        accuracyAchievements.forEach(achievement => {
          const achievementReward = this.handleAchievementUnlock(achievement);
          if (achievementReward) rewards.push(achievementReward);
        });
      }
    }

    // Consistency rewards
    if (result.success) {
      const consistencyResult = this.calculator.calculateConsistencyReward(task.timesExecuted);
      
      if (consistencyResult.shouldReward) {
        const reward = this.awardPoints(
          consistencyResult.points,
          `🏆 ${task.timesExecuted} successful executions`
        );
        rewards.push(reward);
        
        // Check consistency achievements
        const consistencyAchievements = this.tracker.checkAchievements(
          'consistency_king',
          task.timesExecuted
        );
        
        consistencyAchievements.forEach(achievement => {
          const achievementReward = this.handleAchievementUnlock(achievement);
          if (achievementReward) rewards.push(achievementReward);
        });
      }
    }

    // Problem solving rewards
    if (result.success) {
      const problemResult = this.calculator.calculateProblemSolvingReward(
        previousSuccessRate,
        task.successRate
      );
      
      if (problemResult.shouldReward) {
        const reward = this.awardPoints(
          problemResult.points,
          `🔧 Fixed failing task! (+${problemResult.improvement.toFixed(0)}%)`
        );
        rewards.push(reward);
        
        // Check problem solver achievements
        const problemAchievements = this.tracker.checkAchievements(
          'problem_solver',
          problemResult.improvement
        );
        
        problemAchievements.forEach(achievement => {
          const achievementReward = this.handleAchievementUnlock(achievement);
          if (achievementReward) rewards.push(achievementReward);
        });
      }
    }

    return rewards;
  }

  /**
   * Reward for learning new task
   */
  rewardNewTask(task: LearnedTask): Reward[] {
    const rewards: Reward[] = [];
    
    const { points } = this.calculator.calculateNewTaskReward();
    const reward = this.awardPoints(points, `💡 Learned new task: ${task.name}`);
    rewards.push(reward);
    
    // Check innovation achievements
    const learnedCount = this.tracker.countLearnedTasks();
    const innovationAchievements = this.tracker.checkAchievements(
      'innovator',
      learnedCount
    );
    
    innovationAchievements.forEach(achievement => {
      const achievementReward = this.handleAchievementUnlock(achievement);
      if (achievementReward) rewards.push(achievementReward);
    });
    
    return rewards;
  }

  /**
   * Reward for quick learning
   */
  rewardQuickLearning(task: LearnedTask, executionsToLearn: number): Reward[] {
    const rewards: Reward[] = [];
    
    const quickLearningResult = this.calculator.calculateQuickLearningReward(
      task.trigger.confidence,
      executionsToLearn
    );
    
    if (quickLearningResult.shouldReward) {
      const reward = this.awardPoints(
        quickLearningResult.points,
        `📚 Quick learner! Mastered in ${executionsToLearn} tries`
      );
      rewards.push(reward);
      
      // Check quick learner achievements (note: uses <= comparator)
      const quickLearnerAchievements = this.tracker.checkAchievements(
        'quick_learner',
        executionsToLearn,
        (req, val) => val <= req
      );
      
      quickLearnerAchievements.forEach(achievement => {
        const achievementReward = this.handleAchievementUnlock(achievement);
        if (achievementReward) rewards.push(achievementReward);
      });
    }
    
    return rewards;
  }

  /**
   * Award points for an action
   */
  awardPoints(points: number, reason: string): Reward {
    this.tracker.addPoints(points);
    this.tracker.addExperience(points);

    const reward = this.calculator.createReward(
      'points',
      `+${points} Points`,
      reason,
      points
    );

    this.tracker.addReward(reward);
    
    // Check for level up
    this.checkAndHandleLevelUp();

    logger.info(`[Reward System] 🎁 Awarded ${points} points: ${reason}`);
    
    return reward;
  }

  /**
   * Check and handle level up
   */
  private checkAndHandleLevelUp(): boolean {
    const currentLevel = this.tracker.getLevel();
    const currentExperience = this.tracker.getExperience();
    
    if (this.calculator.shouldLevelUp(currentExperience, currentLevel)) {
      const levelUpResult = this.calculator.calculateLevelUp(currentExperience, currentLevel);
      
      this.tracker.setLevel(levelUpResult.newLevel);
      this.tracker.setExperience(levelUpResult.remainingExperience);
      
      const levelInfo = this.calculator.getLevelInfo(
        levelUpResult.newLevel,
        levelUpResult.remainingExperience
      );
      
      const reward = this.calculator.createReward(
        'level_up',
        `Level Up! 🎉`,
        `Reached ${levelInfo.title} (Level ${levelUpResult.newLevel})`,
        0
      );
      
      this.tracker.addReward(reward);
      
      logger.info(`[Reward System] 🎊 LEVEL UP! Now level ${levelUpResult.newLevel}: ${levelInfo.title}`);
      
      // Check milestone achievements
      const milestoneAchievements = this.tracker.checkAchievements(
        'milestone',
        levelUpResult.newLevel
      );
      
      milestoneAchievements.forEach(achievement => {
        this.handleAchievementUnlock(achievement);
      });
      
      return true;
    }
    
    return false;
  }

  /**
   * Handle achievement unlock
   */
  private handleAchievementUnlock(achievement: Achievement): Reward | null {
    const reward = this.calculator.createReward(
      'achievement',
      `🏆 Achievement Unlocked!`,
      `${achievement.icon} ${achievement.name}: ${achievement.description}`,
      achievement.points,
      achievement
    );
    
    this.tracker.addReward(reward);
    this.tracker.addPoints(achievement.points);
    this.tracker.addExperience(achievement.points);
    
    logger.info(`[Reward System] 🏆 ACHIEVEMENT UNLOCKED: ${achievement.name} (+${achievement.points} points)`);
    
    // Check for level up after achievement
    this.checkAndHandleLevelUp();
    
    return reward;
  }

  /**
   * Get reward system statistics
   */
  getStats(): {
    totalPoints: number;
    level: number;
    levelTitle: string;
    experience: number;
    experienceToNext: number;
    streak: number;
    achievementsUnlocked: number;
    totalAchievements: number;
  } {
    const levelInfo = this.calculator.getLevelInfo(
      this.tracker.getLevel(),
      this.tracker.getExperience()
    );
    const unlockedCount = this.tracker.getUnlockedAchievements().length;
    const totalCount = this.tracker.getAchievements().length;
    
    return {
      totalPoints: this.tracker.getTotalPoints(),
      level: this.tracker.getLevel(),
      levelTitle: levelInfo.title,
      experience: this.tracker.getExperience(),
      experienceToNext: levelInfo.experienceToNext,
      streak: this.tracker.getCurrentStreak(),
      achievementsUnlocked: unlockedCount,
      totalAchievements: totalCount,
    };
  }

  /**
   * Get current level information
   */
  getLevelInfo() {
    return this.calculator.getLevelInfo(
      this.tracker.getLevel(),
      this.tracker.getExperience()
    );
  }

  /**
   * Get all rewards
   */
  getRewards(limit?: number): Reward[] {
    return this.tracker.getRewards(limit);
  }

  /**
   * Get uncelebrated rewards
   */
  getUncelebratedRewards(): Reward[] {
    return this.tracker.getUncelebratedRewards();
  }

  /**
   * Mark reward as celebrated
   */
  celebrateReward(rewardId: string): void {
    this.tracker.celebrateReward(rewardId);
  }

  /**
   * Get all achievements
   */
  getAchievements(): Achievement[] {
    return this.tracker.getAchievements();
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return this.tracker.getUnlockedAchievements();
  }

  /**
   * Get achievements by rarity
   */
  getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
    return this.tracker.getAchievementsByRarity(rarity);
  }

  /**
   * Get total points
   */
  getTotalPoints(): number {
    return this.tracker.getTotalPoints();
  }

  /**
   * Get current streak
   */
  getCurrentStreak(): number {
    return this.tracker.getCurrentStreak();
  }

  /**
   * Get improvements history
   */
  getImprovements(limit?: number): PerformanceImprovement[] {
    return this.tracker.getImprovements(limit);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return this.tracker.getStatistics();
  }
}

// Export singleton instance
export const rewardSystem = new RewardSystem();
