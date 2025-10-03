/**
 * Reward System for Autopilot
 * Gamification system that rewards the autopilot for improvements and achievements
 */

import { LearnedTask, TaskExecutionResult } from './types';

/**
 * Achievement types
 */
export type AchievementType = 
  | 'speed_demon'        // Faster execution
  | 'perfectionist'      // High success rate
  | 'innovator'          // New task learned
  | 'efficiency_master'  // Optimized workflow
  | 'consistency_king'   // Consistent performance
  | 'quick_learner'      // Fast learning
  | 'problem_solver'     // Fixed failing task
  | 'milestone'          // Reached milestone
  | 'streak'             // Consecutive successes
  | 'explorer';          // Tried new patterns

/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number; // 0-100
  requirement: number;
}

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
  celebrated: boolean; // Has user seen this?
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
 * Reward System Service
 */
export class RewardSystem {
  private achievements: Map<string, Achievement> = new Map();
  private rewards: Reward[] = [];
  private totalPoints: number = 0;
  private level: number = 1;
  private experience: number = 0;
  private streak: number = 0;
  private lastSuccessDate: Date | null = null;
  private improvements: PerformanceImprovement[] = [];

  constructor() {
    this.initializeAchievements();
  }

  /**
   * Initialize all possible achievements
   */
  private initializeAchievements(): void {
    const achievementDefinitions: Omit<Achievement, 'id' | 'unlockedAt' | 'progress'>[] = [
      // Speed achievements
      {
        type: 'speed_demon',
        name: 'Speed Demon I',
        description: 'Execute a task 20% faster than average',
        icon: '⚡',
        points: 50,
        rarity: 'common',
        requirement: 20,
      },
      {
        type: 'speed_demon',
        name: 'Speed Demon II',
        description: 'Execute a task 50% faster than average',
        icon: '⚡⚡',
        points: 100,
        rarity: 'rare',
        requirement: 50,
      },
      {
        type: 'speed_demon',
        name: 'Lightning Fast',
        description: 'Execute a task 75% faster than average',
        icon: '⚡⚡⚡',
        points: 200,
        rarity: 'epic',
        requirement: 75,
      },

      // Accuracy achievements
      {
        type: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve 95% success rate on a task',
        icon: '🎯',
        points: 100,
        rarity: 'rare',
        requirement: 95,
      },
      {
        type: 'perfectionist',
        name: 'Flawless',
        description: 'Achieve 100% success rate on 10 consecutive executions',
        icon: '💎',
        points: 250,
        rarity: 'epic',
        requirement: 10,
      },

      // Innovation achievements
      {
        type: 'innovator',
        name: 'First Steps',
        description: 'Learn your first custom task',
        icon: '🌱',
        points: 50,
        rarity: 'common',
        requirement: 1,
      },
      {
        type: 'innovator',
        name: 'Creative Mind',
        description: 'Learn 5 custom tasks',
        icon: '💡',
        points: 150,
        rarity: 'rare',
        requirement: 5,
      },
      {
        type: 'innovator',
        name: 'Innovation Master',
        description: 'Learn 20 custom tasks',
        icon: '🚀',
        points: 500,
        rarity: 'legendary',
        requirement: 20,
      },

      // Efficiency achievements
      {
        type: 'efficiency_master',
        name: 'Optimizer',
        description: 'Improve task efficiency by 30%',
        icon: '⚙️',
        points: 100,
        rarity: 'rare',
        requirement: 30,
      },
      {
        type: 'efficiency_master',
        name: 'Efficiency Expert',
        description: 'Improve task efficiency by 50%',
        icon: '⚙️⚙️',
        points: 200,
        rarity: 'epic',
        requirement: 50,
      },

      // Consistency achievements
      {
        type: 'consistency_king',
        name: 'Reliable',
        description: 'Execute 50 tasks successfully',
        icon: '🏆',
        points: 100,
        rarity: 'common',
        requirement: 50,
      },
      {
        type: 'consistency_king',
        name: 'Dependable',
        description: 'Execute 200 tasks successfully',
        icon: '🏆🏆',
        points: 300,
        rarity: 'rare',
        requirement: 200,
      },
      {
        type: 'consistency_king',
        name: 'Unstoppable',
        description: 'Execute 1000 tasks successfully',
        icon: '👑',
        points: 1000,
        rarity: 'legendary',
        requirement: 1000,
      },

      // Learning achievements
      {
        type: 'quick_learner',
        name: 'Fast Learner',
        description: 'Reach 80% confidence on a task in under 5 executions',
        icon: '📚',
        points: 150,
        rarity: 'rare',
        requirement: 5,
      },
      {
        type: 'quick_learner',
        name: 'Genius',
        description: 'Reach 90% confidence on a task in under 3 executions',
        icon: '🧠',
        points: 300,
        rarity: 'epic',
        requirement: 3,
      },

      // Problem solving achievements
      {
        type: 'problem_solver',
        name: 'Troubleshooter',
        description: 'Fix a failing task (improve from <50% to >80% success)',
        icon: '🔧',
        points: 200,
        rarity: 'rare',
        requirement: 30,
      },
      {
        type: 'problem_solver',
        name: 'Miracle Worker',
        description: 'Fix a failing task (improve from <30% to >90% success)',
        icon: '✨',
        points: 400,
        rarity: 'epic',
        requirement: 60,
      },

      // Milestone achievements
      {
        type: 'milestone',
        name: 'Getting Started',
        description: 'Reach level 5',
        icon: '🎖️',
        points: 100,
        rarity: 'common',
        requirement: 5,
      },
      {
        type: 'milestone',
        name: 'Experienced',
        description: 'Reach level 10',
        icon: '🎖️🎖️',
        points: 250,
        rarity: 'rare',
        requirement: 10,
      },
      {
        type: 'milestone',
        name: 'Master',
        description: 'Reach level 25',
        icon: '🏅',
        points: 1000,
        rarity: 'legendary',
        requirement: 25,
      },

      // Streak achievements
      {
        type: 'streak',
        name: 'On Fire',
        description: '5 successful executions in a row',
        icon: '🔥',
        points: 50,
        rarity: 'common',
        requirement: 5,
      },
      {
        type: 'streak',
        name: 'Blazing',
        description: '10 successful executions in a row',
        icon: '🔥🔥',
        points: 150,
        rarity: 'rare',
        requirement: 10,
      },
      {
        type: 'streak',
        name: 'Inferno',
        description: '25 successful executions in a row',
        icon: '🔥🔥🔥',
        points: 500,
        rarity: 'epic',
        requirement: 25,
      },

      // Explorer achievements
      {
        type: 'explorer',
        name: 'Curious',
        description: 'Try 3 different task categories',
        icon: '🔍',
        points: 75,
        rarity: 'common',
        requirement: 3,
      },
      {
        type: 'explorer',
        name: 'Adventurer',
        description: 'Try all task categories',
        icon: '🗺️',
        points: 200,
        rarity: 'rare',
        requirement: 6,
      },
    ];

    achievementDefinitions.forEach((def, index) => {
      const achievement: Achievement = {
        ...def,
        id: `achievement_${index}`,
        progress: 0,
      };
      this.achievements.set(achievement.id, achievement);
    });

    console.log(`[Reward System] Initialized ${this.achievements.size} achievements`);
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
    let points = 0;
    let experience = 0;
    const previousLevel = this.level;

    // Base points for successful execution
    if (result.success) {
      points += 10;
      experience += 10;
      this.updateStreak(true);
      
      // Bonus for fast execution
      if (result.duration < 500) {
        points += 5;
        experience += 5;
      }
    } else {
      this.updateStreak(false);
    }

    // Award points and experience
    this.totalPoints += points;
    this.experience += experience;
    
    // Check for level up
    this.checkLevelUp();
    const levelUp = this.level > previousLevel;

    // Check for streak achievements
    if (this.streak >= 5) {
      const streakAchievement = this.checkStreakAchievements();
      if (streakAchievement) {
        achievements.push(streakAchievement);
      }
    }

    return {
      achievements,
      points,
      experience,
      levelUp,
      streaks: this.streak,
    };
  }

  /**
   * Update success streak
   */
  private updateStreak(success: boolean): void {
    if (success) {
      const now = new Date();
      if (this.lastSuccessDate) {
        const hoursSinceLastSuccess = (now.getTime() - this.lastSuccessDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastSuccess < 24) {
          this.streak++;
        } else {
          this.streak = 1;
        }
      } else {
        this.streak = 1;
      }
      this.lastSuccessDate = now;
    } else {
      this.streak = 0;
    }
  }

  /**
   * Check for streak achievements
   */
  private checkStreakAchievements(): Achievement | null {
    for (const achievement of this.achievements.values()) {
      if (achievement.type === 'streak' && 
          !achievement.unlockedAt && 
          this.streak >= achievement.requirement) {
        achievement.unlockedAt = new Date();
        achievement.progress = 100;
        this.totalPoints += achievement.points;
        console.log(`[Reward System] 🏆 Achievement unlocked: ${achievement.name}`);
        return achievement;
      }
    }
    return null;
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
    const levelInfo = this.getLevelInfo();
    const unlockedCount = Array.from(this.achievements.values()).filter(a => a.unlockedAt).length;
    
    return {
      totalPoints: this.totalPoints,
      level: this.level,
      levelTitle: levelInfo.title,
      experience: this.experience,
      experienceToNext: levelInfo.experienceToNext,
      streak: this.streak,
      achievementsUnlocked: unlockedCount,
      totalAchievements: this.achievements.size,
    };
  }

  /**
   * Award points for an action
   */
  awardPoints(points: number, reason: string): Reward {
    this.totalPoints += points;
    this.experience += points;

    const reward: Reward = {
      id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'points',
      title: `+${points} Points`,
      description: reason,
      points,
      timestamp: new Date(),
      celebrated: false,
    };

    this.rewards.push(reward);
    
    // Check for level up
    this.checkLevelUp();

    console.log(`[Reward System] 🎁 Awarded ${points} points: ${reason}`);
    
    return reward;
  }

  /**
   * Check and handle level up
   */
  private checkLevelUp(): void {
    const requiredExp = this.getRequiredExperience(this.level);
    
    if (this.experience >= requiredExp) {
      this.level++;
      this.experience -= requiredExp;
      
      const levelInfo = this.getLevelInfo();
      
      const reward: Reward = {
        id: `reward_${Date.now()}_levelup`,
        type: 'level_up',
        title: `Level Up! 🎉`,
        description: `Reached ${levelInfo.title} (Level ${this.level})`,
        points: 0,
        timestamp: new Date(),
        celebrated: false,
      };
      
      this.rewards.push(reward);
      
      console.log(`[Reward System] 🎊 LEVEL UP! Now level ${this.level}: ${levelInfo.title}`);
      
      // Check milestone achievements
      this.checkMilestoneAchievements();
    }
  }

  /**
   * Get required experience for next level
   */
  private getRequiredExperience(level: number): number {
    // Exponential growth: 100 * 1.5^level
    return Math.floor(100 * Math.pow(1.5, level));
  }

  /**
   * Get current level information
   */
  getLevelInfo(): AutopilotLevel {
    const titles = [
      'Novice',           // 1-4
      'Apprentice',       // 5-9
      'Skilled',          // 10-14
      'Expert',           // 15-19
      'Master',           // 20-24
      'Grandmaster',      // 25-29
      'Legend',           // 30+
    ];

    const titleIndex = Math.min(Math.floor(this.level / 5), titles.length - 1);
    const title = titles[titleIndex];

    const perks = this.getPerksForLevel(this.level);

    return {
      level: this.level,
      experience: this.experience,
      experienceToNext: this.getRequiredExperience(this.level),
      title,
      perks,
    };
  }

  /**
   * Get perks unlocked at level
   */
  private getPerksForLevel(level: number): string[] {
    const perks: string[] = [];
    
    if (level >= 5) perks.push('Advanced pattern recognition');
    if (level >= 10) perks.push('Predictive suggestions');
    if (level >= 15) perks.push('Complex task automation');
    if (level >= 20) perks.push('Multi-step optimization');
    if (level >= 25) perks.push('AI-powered insights');
    if (level >= 30) perks.push('Autonomous decision making');
    
    return perks;
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
      const lastSuccess = this.lastSuccessDate?.toDateString();
      
      if (lastSuccess === today) {
        this.streak++;
      } else {
        this.streak = 1;
      }
      this.lastSuccessDate = new Date();
      
      // Check streak achievements
      this.checkStreakAchievements(rewards);
    } else {
      this.streak = 0;
    }

    // Speed rewards
    if (result.success && avgDuration > 0) {
      const speedImprovement = ((avgDuration - result.duration) / avgDuration) * 100;
      
      if (speedImprovement >= 20) {
        const points = Math.floor(speedImprovement * 2);
        rewards.push(this.awardPoints(points, `⚡ ${speedImprovement.toFixed(0)}% faster execution`));
        
        // Track improvement
        this.improvements.push({
          metric: 'speed',
          before: avgDuration,
          after: result.duration,
          improvement: speedImprovement,
          timestamp: new Date(),
        });
        
        // Check speed achievements
        this.checkSpeedAchievements(speedImprovement, rewards);
      }
    }

    // Accuracy rewards
    if (result.success && task.successRate > previousSuccessRate) {
      const improvement = (task.successRate - previousSuccessRate) * 100;
      const points = Math.floor(improvement * 5);
      rewards.push(this.awardPoints(points, `🎯 Improved accuracy by ${improvement.toFixed(1)}%`));
      
      // Track improvement
      this.improvements.push({
        metric: 'accuracy',
        before: previousSuccessRate,
        after: task.successRate,
        improvement,
        timestamp: new Date(),
      });
      
      // Check accuracy achievements
      this.checkAccuracyAchievements(task.successRate, rewards);
    }

    // Consistency rewards
    if (result.success && task.timesExecuted % 10 === 0) {
      const points = 20 + (task.timesExecuted / 10) * 5;
      rewards.push(this.awardPoints(points, `🏆 ${task.timesExecuted} successful executions`));
      
      // Check consistency achievements
      this.checkConsistencyAchievements(task.timesExecuted, rewards);
    }

    // Problem solving rewards
    if (result.success && previousSuccessRate < 0.5 && task.successRate > 0.8) {
      const improvement = (task.successRate - previousSuccessRate) * 100;
      const points = 200;
      rewards.push(this.awardPoints(points, `🔧 Fixed failing task! (+${improvement.toFixed(0)}%)`));
      
      // Check problem solver achievements
      this.checkProblemSolverAchievements(improvement, rewards);
    }

    return rewards;
  }

  /**
   * Reward for learning new task
   */
  rewardNewTask(task: LearnedTask): Reward[] {
    const rewards: Reward[] = [];
    
    const points = 100;
    rewards.push(this.awardPoints(points, `💡 Learned new task: ${task.name}`));
    
    // Check innovation achievements
    this.checkInnovationAchievements(rewards);
    
    return rewards;
  }

  /**
   * Reward for quick learning
   */
  rewardQuickLearning(task: LearnedTask, executionsToLearn: number): Reward[] {
    const rewards: Reward[] = [];
    
    if (task.trigger.confidence >= 0.8 && executionsToLearn <= 5) {
      const points = 150;
      rewards.push(this.awardPoints(points, `📚 Quick learner! Mastered in ${executionsToLearn} tries`));
      
      // Check quick learner achievements
      this.checkQuickLearnerAchievements(executionsToLearn, rewards);
    }
    
    return rewards;
  }

  /**
   * Check speed achievements
   */
  private checkSpeedAchievements(improvement: number, rewards: Reward[]): void {
    this.achievements.forEach(achievement => {
      if (achievement.type === 'speed_demon' && !achievement.unlockedAt) {
        if (improvement >= achievement.requirement) {
          this.unlockAchievement(achievement, rewards);
        }
      }
    });
  }

  /**
   * Check accuracy achievements
   */
  private checkAccuracyAchievements(successRate: number, rewards: Reward[]): void {
    this.achievements.forEach(achievement => {
      if (achievement.type === 'perfectionist' && !achievement.unlockedAt) {
        const percentage = successRate * 100;
        if (percentage >= achievement.requirement) {
          this.unlockAchievement(achievement, rewards);
        }
      }
    });
  }

  /**
   * Check consistency achievements
   */
  private checkConsistencyAchievements(executions: number, rewards: Reward[]): void {
    this.achievements.forEach(achievement => {
      if (achievement.type === 'consistency_king' && !achievement.unlockedAt) {
        if (executions >= achievement.requirement) {
          this.unlockAchievement(achievement, rewards);
        }
      }
    });
  }

  /**
   * Check innovation achievements
   */
  private checkInnovationAchievements(rewards: Reward[]): void {
    // Count learned tasks
    const learnedCount = this.rewards.filter(r => 
      r.description.includes('Learned new task')
    ).length;
    
    this.achievements.forEach(achievement => {
      if (achievement.type === 'innovator' && !achievement.unlockedAt) {
        if (learnedCount >= achievement.requirement) {
          this.unlockAchievement(achievement, rewards);
        }
      }
    });
  }

  /**
   * Check quick learner achievements
   */
  private checkQuickLearnerAchievements(executions: number, rewards: Reward[]): void {
    this.achievements.forEach(achievement => {
      if (achievement.type === 'quick_learner' && !achievement.unlockedAt) {
        if (executions <= achievement.requirement) {
          this.unlockAchievement(achievement, rewards);
        }
      }
    });
  }

  /**
   * Check problem solver achievements
   */
  private checkProblemSolverAchievements(improvement: number, rewards: Reward[]): void {
    this.achievements.forEach(achievement => {
      if (achievement.type === 'problem_solver' && !achievement.unlockedAt) {
        if (improvement >= achievement.requirement) {
          this.unlockAchievement(achievement, rewards);
        }
      }
    });
  }

  /**
   * Check streak achievements
   */
  private checkStreakAchievements(rewards: Reward[]): void {
    this.achievements.forEach(achievement => {
      if (achievement.type === 'streak' && !achievement.unlockedAt) {
        if (this.streak >= achievement.requirement) {
          this.unlockAchievement(achievement, rewards);
        }
      }
    });
  }

  /**
   * Check milestone achievements
   */
  private checkMilestoneAchievements(): void {
    const rewards: Reward[] = [];
    
    this.achievements.forEach(achievement => {
      if (achievement.type === 'milestone' && !achievement.unlockedAt) {
        if (this.level >= achievement.requirement) {
          this.unlockAchievement(achievement, rewards);
        }
      }
    });
  }

  /**
   * Unlock an achievement
   */
  private unlockAchievement(achievement: Achievement, rewards: Reward[]): void {
    achievement.unlockedAt = new Date();
    achievement.progress = 100;
    
    const reward: Reward = {
      id: `reward_${Date.now()}_achievement`,
      type: 'achievement',
      title: `🏆 Achievement Unlocked!`,
      description: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
      points: achievement.points,
      achievement,
      timestamp: new Date(),
      celebrated: false,
    };
    
    this.rewards.push(reward);
    rewards.push(reward);
    this.totalPoints += achievement.points;
    this.experience += achievement.points;
    
    console.log(`[Reward System] 🏆 ACHIEVEMENT UNLOCKED: ${achievement.name} (+${achievement.points} points)`);
    
    // Check for level up after achievement
    this.checkLevelUp();
  }

  /**
   * Get all rewards
   */
  getRewards(limit?: number): Reward[] {
    const rewards = [...this.rewards].reverse();
    return limit ? rewards.slice(0, limit) : rewards;
  }

  /**
   * Get uncelebrated rewards
   */
  getUncelebratedRewards(): Reward[] {
    return this.rewards.filter(r => !r.celebrated);
  }

  /**
   * Mark reward as celebrated
   */
  celebrateReward(rewardId: string): void {
    const reward = this.rewards.find(r => r.id === rewardId);
    if (reward) {
      reward.celebrated = true;
    }
  }

  /**
   * Get all achievements
   */
  getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return this.getAchievements().filter(a => a.unlockedAt);
  }

  /**
   * Get achievements by rarity
   */
  getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
    return this.getAchievements().filter(a => a.rarity === rarity);
  }

  /**
   * Get total points
   */
  getTotalPoints(): number {
    return this.totalPoints;
  }

  /**
   * Get current streak
   */
  getCurrentStreak(): number {
    return this.streak;
  }

  /**
   * Get improvements history
   */
  getImprovements(limit?: number): PerformanceImprovement[] {
    const improvements = [...this.improvements].reverse();
    return limit ? improvements.slice(0, limit) : improvements;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const achievements = this.getAchievements();
    const unlocked = this.getUnlockedAchievements();
    
    return {
      level: this.level,
      experience: this.experience,
      totalPoints: this.totalPoints,
      streak: this.streak,
      achievements: {
        total: achievements.length,
        unlocked: unlocked.length,
        percentage: Math.round((unlocked.length / achievements.length) * 100),
        byRarity: {
          common: unlocked.filter(a => a.rarity === 'common').length,
          rare: unlocked.filter(a => a.rarity === 'rare').length,
          epic: unlocked.filter(a => a.rarity === 'epic').length,
          legendary: unlocked.filter(a => a.rarity === 'legendary').length,
        },
      },
      improvements: {
        total: this.improvements.length,
        speed: this.improvements.filter(i => i.metric === 'speed').length,
        accuracy: this.improvements.filter(i => i.metric === 'accuracy').length,
        efficiency: this.improvements.filter(i => i.metric === 'efficiency').length,
      },
    };
  }
}

// Export singleton instance
export const rewardSystem = new RewardSystem();
