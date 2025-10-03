/**
 * Progress Tracker
 * Tracks user progress towards achievements and manages state
 */

import './logger'; // Initialize global logger
import { Achievement, AchievementType, ACHIEVEMENT_DEFINITIONS } from './achievements';
import { Reward, PerformanceImprovement } from './RewardCalculator';

/**
 * Progress Tracker
 * Manages achievement progress and user state
 */
export class ProgressTracker {
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
    ACHIEVEMENT_DEFINITIONS.forEach((def, index) => {
      const achievement: Achievement = {
        ...def,
        id: `achievement_${index}`,
        progress: 0,
      };
      this.achievements.set(achievement.id, achievement);
    });

    logger.info(`[Progress Tracker] Initialized ${this.achievements.size} achievements`);
  }

  /**
   * Update streak based on success
   */
  updateStreak(success: boolean): void {
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
   * Get current streak
   */
  getCurrentStreak(): number {
    return this.streak;
  }

  /**
   * Add points
   */
  addPoints(points: number): void {
    this.totalPoints += points;
  }

  /**
   * Add experience
   */
  addExperience(experience: number): void {
    this.experience += experience;
  }

  /**
   * Get total points
   */
  getTotalPoints(): number {
    return this.totalPoints;
  }

  /**
   * Get current level
   */
  getLevel(): number {
    return this.level;
  }

  /**
   * Set level
   */
  setLevel(level: number): void {
    this.level = level;
  }

  /**
   * Get experience
   */
  getExperience(): number {
    return this.experience;
  }

  /**
   * Set experience
   */
  setExperience(experience: number): void {
    this.experience = experience;
  }

  /**
   * Add reward
   */
  addReward(reward: Reward): void {
    this.rewards.push(reward);
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
   * Add performance improvement
   */
  addImprovement(improvement: PerformanceImprovement): void {
    this.improvements.push(improvement);
  }

  /**
   * Get improvements history
   */
  getImprovements(limit?: number): PerformanceImprovement[] {
    const improvements = [...this.improvements].reverse();
    return limit ? improvements.slice(0, limit) : improvements;
  }

  /**
   * Get all achievements
   */
  getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get achievement by ID
   */
  getAchievement(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return this.getAchievements().filter(a => a.unlockedAt);
  }

  /**
   * Get achievements by type
   */
  getAchievementsByType(type: AchievementType): Achievement[] {
    return this.getAchievements().filter(a => a.type === type);
  }

  /**
   * Get achievements by rarity
   */
  getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
    return this.getAchievements().filter(a => a.rarity === rarity);
  }

  /**
   * Check if achievement is unlocked
   */
  isAchievementUnlocked(achievementId: string): boolean {
    const achievement = this.achievements.get(achievementId);
    return achievement ? !!achievement.unlockedAt : false;
  }

  /**
   * Unlock achievement
   */
  unlockAchievement(achievementId: string): Achievement | null {
    const achievement = this.achievements.get(achievementId);
    
    if (!achievement || achievement.unlockedAt) {
      return null;
    }

    achievement.unlockedAt = new Date();
    achievement.progress = 100;
    
    logger.info(`[Progress Tracker] 🏆 Achievement unlocked: ${achievement.name}`);
    
    return achievement;
  }

  /**
   * Update achievement progress
   */
  updateAchievementProgress(achievementId: string, progress: number): void {
    const achievement = this.achievements.get(achievementId);
    if (achievement && !achievement.unlockedAt) {
      achievement.progress = Math.min(100, Math.max(0, progress));
    }
  }

  /**
   * Check achievements by type and requirement
   */
  checkAchievements(
    type: AchievementType,
    value: number,
    comparator: (requirement: number, value: number) => boolean = (req, val) => val >= req
  ): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    this.achievements.forEach(achievement => {
      if (achievement.type === type && !achievement.unlockedAt) {
        if (comparator(achievement.requirement, value)) {
          const unlocked = this.unlockAchievement(achievement.id);
          if (unlocked) {
            unlockedAchievements.push(unlocked);
          }
        }
      }
    });

    return unlockedAchievements;
  }

  /**
   * Count learned tasks from rewards
   */
  countLearnedTasks(): number {
    return this.rewards.filter(r => 
      r.description.includes('Learned new task')
    ).length;
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

  /**
   * Reset all progress (for testing)
   */
  reset(): void {
    this.achievements.clear();
    this.rewards = [];
    this.totalPoints = 0;
    this.level = 1;
    this.experience = 0;
    this.streak = 0;
    this.lastSuccessDate = null;
    this.improvements = [];
    this.initializeAchievements();
  }
}

// Export singleton instance
export const progressTracker = new ProgressTracker();
