/**
 * Achievement Definitions
 * Contains all possible achievements in the reward system
 */

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
 * Achievement definition template (without runtime fields)
 */
export type AchievementDefinition = Omit<Achievement, 'id' | 'unlockedAt' | 'progress'>;

/**
 * All achievement definitions
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
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

/**
 * Level titles by level range
 */
export const LEVEL_TITLES = [
  'Novice',           // 1-4
  'Apprentice',       // 5-9
  'Skilled',          // 10-14
  'Expert',           // 15-19
  'Master',           // 20-24
  'Grandmaster',      // 25-29
  'Legend',           // 30+
];

/**
 * Perks unlocked at specific levels
 */
export const LEVEL_PERKS: Record<number, string> = {
  5: 'Advanced pattern recognition',
  10: 'Predictive suggestions',
  15: 'Complex task automation',
  20: 'Multi-step optimization',
  25: 'AI-powered insights',
  30: 'Autonomous decision making',
};
