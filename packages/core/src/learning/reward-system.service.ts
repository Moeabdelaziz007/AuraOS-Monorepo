/**
 * Reward System Service
 * Gamified reward system with points, achievements, badges, and levels
 */

import { firestoreService } from '@auraos/firebase/services/firestore.service';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'productivity' | 'learning' | 'social' | 'mastery' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirement: {
    type: string;
    value: number;
  };
  unlockedAt?: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  earnedAt: Date;
}

export interface UserRewards {
  userId: string;
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: Date;
  achievements: Achievement[];
  badges: Badge[];
  stats: {
    totalActivities: number;
    totalSessions: number;
    totalAIInteractions: number;
    totalAppsLaunched: number;
    totalCommandsExecuted: number;
    totalFilesManaged: number;
    perfectDays: number;
    weeklyGoalsMet: number;
  };
}

export interface RewardEvent {
  type: 'activity' | 'achievement' | 'streak' | 'milestone' | 'bonus';
  points: number;
  description: string;
  achievement?: Achievement;
  badge?: Badge;
}

/**
 * Reward System Manager
 */
class RewardSystemService {
  // Points configuration
  private readonly POINTS = {
    APP_LAUNCH: 5,
    COMMAND_EXECUTION: 10,
    FILE_OPERATION: 8,
    AI_INTERACTION: 15,
    SESSION_COMPLETE: 25,
    DAILY_LOGIN: 20,
    STREAK_BONUS: 10, // per day
    ACHIEVEMENT_UNLOCK: 50,
    PATTERN_DISCOVERED: 30,
    INSIGHT_ACKNOWLEDGED: 15,
    PERFECT_DAY: 100, // All goals met
  };

  // Level configuration
  private readonly LEVEL_MULTIPLIER = 1.5;
  private readonly BASE_EXPERIENCE = 100;

  // Achievements definitions
  private readonly ACHIEVEMENTS: Omit<Achievement, 'id' | 'unlockedAt'>[] = [
    // Productivity Achievements
    {
      name: 'First Steps',
      description: 'Launch your first app',
      icon: '🚀',
      category: 'productivity',
      rarity: 'common',
      points: 50,
      requirement: { type: 'apps_launched', value: 1 },
    },
    {
      name: 'App Explorer',
      description: 'Launch 10 different apps',
      icon: '🗺️',
      category: 'productivity',
      rarity: 'common',
      points: 100,
      requirement: { type: 'apps_launched', value: 10 },
    },
    {
      name: 'Power User',
      description: 'Launch 50 different apps',
      icon: '⚡',
      category: 'productivity',
      rarity: 'rare',
      points: 250,
      requirement: { type: 'apps_launched', value: 50 },
    },
    {
      name: 'Command Master',
      description: 'Execute 100 commands',
      icon: '💻',
      category: 'productivity',
      rarity: 'rare',
      points: 200,
      requirement: { type: 'commands_executed', value: 100 },
    },
    {
      name: 'File Wizard',
      description: 'Manage 500 files',
      icon: '📁',
      category: 'productivity',
      rarity: 'epic',
      points: 300,
      requirement: { type: 'files_managed', value: 500 },
    },

    // Learning Achievements
    {
      name: 'AI Curious',
      description: 'Have your first AI interaction',
      icon: '🤖',
      category: 'learning',
      rarity: 'common',
      points: 75,
      requirement: { type: 'ai_interactions', value: 1 },
    },
    {
      name: 'AI Enthusiast',
      description: 'Have 50 AI interactions',
      icon: '🧠',
      category: 'learning',
      rarity: 'rare',
      points: 200,
      requirement: { type: 'ai_interactions', value: 50 },
    },
    {
      name: 'AI Expert',
      description: 'Have 200 AI interactions',
      icon: '🎓',
      category: 'learning',
      rarity: 'epic',
      points: 400,
      requirement: { type: 'ai_interactions', value: 200 },
    },
    {
      name: 'Pattern Seeker',
      description: 'Discover 5 behavior patterns',
      icon: '🔍',
      category: 'learning',
      rarity: 'rare',
      points: 250,
      requirement: { type: 'patterns_discovered', value: 5 },
    },
    {
      name: 'Insight Master',
      description: 'Acknowledge 25 insights',
      icon: '💡',
      category: 'learning',
      rarity: 'epic',
      points: 300,
      requirement: { type: 'insights_acknowledged', value: 25 },
    },

    // Mastery Achievements
    {
      name: 'Week Warrior',
      description: 'Complete 7 days streak',
      icon: '🔥',
      category: 'mastery',
      rarity: 'rare',
      points: 200,
      requirement: { type: 'streak', value: 7 },
    },
    {
      name: 'Month Master',
      description: 'Complete 30 days streak',
      icon: '🏆',
      category: 'mastery',
      rarity: 'epic',
      points: 500,
      requirement: { type: 'streak', value: 30 },
    },
    {
      name: 'Century Club',
      description: 'Complete 100 sessions',
      icon: '💯',
      category: 'mastery',
      rarity: 'epic',
      points: 400,
      requirement: { type: 'sessions_completed', value: 100 },
    },
    {
      name: 'Perfectionist',
      description: 'Have 10 perfect days',
      icon: '⭐',
      category: 'mastery',
      rarity: 'legendary',
      points: 1000,
      requirement: { type: 'perfect_days', value: 10 },
    },

    // Special Achievements
    {
      name: 'Early Adopter',
      description: 'Join AuraOS in its first month',
      icon: '🌟',
      category: 'special',
      rarity: 'legendary',
      points: 500,
      requirement: { type: 'early_adopter', value: 1 },
    },
    {
      name: 'Night Owl',
      description: 'Active between midnight and 4 AM',
      icon: '🦉',
      category: 'special',
      rarity: 'rare',
      points: 150,
      requirement: { type: 'night_activity', value: 10 },
    },
    {
      name: 'Early Bird',
      description: 'Active between 5 AM and 7 AM',
      icon: '🐦',
      category: 'special',
      rarity: 'rare',
      points: 150,
      requirement: { type: 'morning_activity', value: 10 },
    },
  ];

  /**
   * Initialize rewards for a user
   */
  async initializeRewards(userId: string): Promise<UserRewards> {
    const existingRewards = await this.getRewards(userId);
    if (existingRewards) {
      return existingRewards;
    }

    const rewards: UserRewards = {
      userId,
      totalPoints: 0,
      level: 1,
      experience: 0,
      experienceToNextLevel: this.BASE_EXPERIENCE,
      streak: 0,
      longestStreak: 0,
      lastActiveDate: new Date(),
      achievements: [],
      badges: [],
      stats: {
        totalActivities: 0,
        totalSessions: 0,
        totalAIInteractions: 0,
        totalAppsLaunched: 0,
        totalCommandsExecuted: 0,
        totalFilesManaged: 0,
        perfectDays: 0,
        weeklyGoalsMet: 0,
      },
    };

    await firestoreService.rewards.create(userId, rewards);
    return rewards;
  }

  /**
   * Award points for an activity
   */
  async awardPoints(
    userId: string,
    activityType: keyof typeof this.POINTS,
    metadata?: Record<string, any>
  ): Promise<RewardEvent[]> {
    const rewards = await this.getRewards(userId);
    if (!rewards) {
      throw new Error('Rewards not initialized');
    }

    const events: RewardEvent[] = [];
    const basePoints = this.POINTS[activityType];
    let totalPoints = basePoints;

    // Calculate streak bonus
    const streakBonus = this.calculateStreakBonus(rewards.streak);
    totalPoints += streakBonus;

    // Update stats
    await this.updateStats(userId, activityType, metadata);

    // Add experience and points
    rewards.experience += totalPoints;
    rewards.totalPoints += totalPoints;

    // Check for level up
    const levelUpEvents = await this.checkLevelUp(userId, rewards);
    events.push(...levelUpEvents);

    // Check for achievements
    const achievementEvents = await this.checkAchievements(userId, rewards);
    events.push(...achievementEvents);

    // Save rewards
    await firestoreService.rewards.update(userId, rewards);

    // Add main event
    events.unshift({
      type: 'activity',
      points: totalPoints,
      description: this.getActivityDescription(activityType),
    });

    return events;
  }

  /**
   * Update daily streak
   */
  async updateStreak(userId: string): Promise<RewardEvent[]> {
    const rewards = await this.getRewards(userId);
    if (!rewards) {
      throw new Error('Rewards not initialized');
    }

    const events: RewardEvent[] = [];
    const now = new Date();
    const lastActive = new Date(rewards.lastActiveDate);
    
    // Check if it's a new day
    const daysDiff = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Continue streak
      rewards.streak += 1;
      rewards.longestStreak = Math.max(rewards.longestStreak, rewards.streak);
      
      const streakPoints = this.POINTS.DAILY_LOGIN + (rewards.streak * this.POINTS.STREAK_BONUS);
      rewards.totalPoints += streakPoints;
      rewards.experience += streakPoints;

      events.push({
        type: 'streak',
        points: streakPoints,
        description: `🔥 ${rewards.streak} day streak! Keep it up!`,
      });

      // Check for streak achievements
      const achievementEvents = await this.checkAchievements(userId, rewards);
      events.push(...achievementEvents);
    } else if (daysDiff > 1) {
      // Streak broken
      if (rewards.streak > 0) {
        events.push({
          type: 'streak',
          points: 0,
          description: `Streak broken. Start a new one today!`,
        });
      }
      rewards.streak = 1;
      
      const loginPoints = this.POINTS.DAILY_LOGIN;
      rewards.totalPoints += loginPoints;
      rewards.experience += loginPoints;

      events.push({
        type: 'activity',
        points: loginPoints,
        description: 'Welcome back! Daily login bonus',
      });
    }

    rewards.lastActiveDate = now;
    await firestoreService.rewards.update(userId, rewards);

    return events;
  }

  /**
   * Check for level up
   */
  private async checkLevelUp(userId: string, rewards: UserRewards): Promise<RewardEvent[]> {
    const events: RewardEvent[] = [];

    while (rewards.experience >= rewards.experienceToNextLevel) {
      rewards.experience -= rewards.experienceToNextLevel;
      rewards.level += 1;
      
      // Calculate next level requirement
      rewards.experienceToNextLevel = Math.floor(
        this.BASE_EXPERIENCE * Math.pow(this.LEVEL_MULTIPLIER, rewards.level - 1)
      );

      // Award level up bonus
      const levelBonus = rewards.level * 50;
      rewards.totalPoints += levelBonus;

      events.push({
        type: 'milestone',
        points: levelBonus,
        description: `🎉 Level ${rewards.level} reached! +${levelBonus} bonus points`,
      });

      // Award badge for every 5 levels
      if (rewards.level % 5 === 0) {
        const badge: Badge = {
          id: `level_${rewards.level}`,
          name: `Level ${rewards.level} Master`,
          description: `Reached level ${rewards.level}`,
          icon: this.getLevelIcon(rewards.level),
          level: rewards.level,
          earnedAt: new Date(),
        };
        
        rewards.badges.push(badge);
        
        events.push({
          type: 'achievement',
          points: 100,
          description: `🏅 New badge earned: ${badge.name}`,
          badge,
        });
      }
    }

    return events;
  }

  /**
   * Check for achievements
   */
  private async checkAchievements(userId: string, rewards: UserRewards): Promise<RewardEvent[]> {
    const events: RewardEvent[] = [];
    const unlockedIds = new Set(rewards.achievements.map(a => a.id));

    for (const achievementDef of this.ACHIEVEMENTS) {
      const achievementId = this.generateAchievementId(achievementDef);
      
      if (unlockedIds.has(achievementId)) {
        continue; // Already unlocked
      }

      // Check if requirement is met
      const isMet = await this.checkAchievementRequirement(
        rewards,
        achievementDef.requirement
      );

      if (isMet) {
        const achievement: Achievement = {
          ...achievementDef,
          id: achievementId,
          unlockedAt: new Date(),
        };

        rewards.achievements.push(achievement);
        rewards.totalPoints += achievement.points + this.POINTS.ACHIEVEMENT_UNLOCK;
        rewards.experience += achievement.points;

        events.push({
          type: 'achievement',
          points: achievement.points + this.POINTS.ACHIEVEMENT_UNLOCK,
          description: `🏆 Achievement unlocked: ${achievement.name}`,
          achievement,
        });
      }
    }

    return events;
  }

  /**
   * Check if achievement requirement is met
   */
  private async checkAchievementRequirement(
    rewards: UserRewards,
    requirement: { type: string; value: number }
  ): Promise<boolean> {
    const { type, value } = requirement;

    switch (type) {
      case 'apps_launched':
        return rewards.stats.totalAppsLaunched >= value;
      case 'commands_executed':
        return rewards.stats.totalCommandsExecuted >= value;
      case 'files_managed':
        return rewards.stats.totalFilesManaged >= value;
      case 'ai_interactions':
        return rewards.stats.totalAIInteractions >= value;
      case 'sessions_completed':
        return rewards.stats.totalSessions >= value;
      case 'streak':
        return rewards.streak >= value;
      case 'perfect_days':
        return rewards.stats.perfectDays >= value;
      case 'patterns_discovered':
      case 'insights_acknowledged':
      case 'early_adopter':
      case 'night_activity':
      case 'morning_activity':
        // These require additional tracking
        return false;
      default:
        return false;
    }
  }

  /**
   * Update user stats
   */
  private async updateStats(
    userId: string,
    activityType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const updates: Partial<UserRewards['stats']> = {
      totalActivities: 1,
    };

    switch (activityType) {
      case 'APP_LAUNCH':
        updates.totalAppsLaunched = 1;
        break;
      case 'COMMAND_EXECUTION':
        updates.totalCommandsExecuted = 1;
        break;
      case 'FILE_OPERATION':
        updates.totalFilesManaged = 1;
        break;
      case 'AI_INTERACTION':
        updates.totalAIInteractions = 1;
        break;
      case 'SESSION_COMPLETE':
        updates.totalSessions = 1;
        break;
    }

    await firestoreService.rewards.incrementStats(userId, updates);
  }

  /**
   * Calculate streak bonus
   */
  private calculateStreakBonus(streak: number): number {
    if (streak < 3) return 0;
    if (streak < 7) return 5;
    if (streak < 14) return 10;
    if (streak < 30) return 20;
    return 30;
  }

  /**
   * Get activity description
   */
  private getActivityDescription(activityType: string): string {
    const descriptions: Record<string, string> = {
      APP_LAUNCH: 'App launched',
      COMMAND_EXECUTION: 'Command executed',
      FILE_OPERATION: 'File managed',
      AI_INTERACTION: 'AI interaction',
      SESSION_COMPLETE: 'Session completed',
      DAILY_LOGIN: 'Daily login',
      PATTERN_DISCOVERED: 'Pattern discovered',
      INSIGHT_ACKNOWLEDGED: 'Insight acknowledged',
    };

    return descriptions[activityType] || 'Activity completed';
  }

  /**
   * Get level icon
   */
  private getLevelIcon(level: number): string {
    if (level >= 50) return '👑';
    if (level >= 40) return '💎';
    if (level >= 30) return '🏆';
    if (level >= 20) return '🥇';
    if (level >= 10) return '🥈';
    return '🥉';
  }

  /**
   * Generate achievement ID
   */
  private generateAchievementId(achievement: Omit<Achievement, 'id' | 'unlockedAt'>): string {
    return achievement.name.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Get user rewards
   */
  async getRewards(userId: string): Promise<UserRewards | null> {
    return firestoreService.rewards.get(userId);
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<UserRewards[]> {
    return firestoreService.rewards.getLeaderboard(limit);
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: Achievement['category']): Omit<Achievement, 'id' | 'unlockedAt'>[] {
    return this.ACHIEVEMENTS.filter(a => a.category === category);
  }

  /**
   * Get all available achievements
   */
  getAllAchievements(): Omit<Achievement, 'id' | 'unlockedAt'>[] {
    return [...this.ACHIEVEMENTS];
  }
}

// Export singleton instance
export const rewardSystemService = new RewardSystemService();
