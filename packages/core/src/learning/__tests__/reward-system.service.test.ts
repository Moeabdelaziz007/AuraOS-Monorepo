/**
 * Reward System Service Tests
 */

import { describe, it, expect, vi } from 'vitest';

// Mock the firebase module
vi.mock('@auraos/firebase/services/firestore.service', () => ({
  firestoreService: {
    rewards: {
      create: vi.fn(),
      update: vi.fn(),
      get: vi.fn(),
      getLeaderboard: vi.fn(),
      incrementStats: vi.fn(),
    },
  },
}));

// Use dynamic import to ensure mock is applied
const { rewardSystemService } = await import('../reward-system.service');

describe('RewardSystemService', () => {
  describe('generateAchievementId', () => {
    it('should convert achievement name to lowercase snake_case ID', () => {
      // Access the private method through type assertion for testing
      const service = rewardSystemService as any;
      
      const achievement = {
        name: 'First Steps',
        description: 'Launch your first app',
        icon: '🚀',
        category: 'productivity' as const,
        rarity: 'common' as const,
        points: 50,
        requirement: { type: 'apps_launched', value: 1 },
      };
      
      expect(service.generateAchievementId(achievement)).toBe('first_steps');
    });

    it('should handle multiple spaces in achievement name', () => {
      const service = rewardSystemService as any;
      
      const achievement = {
        name: 'Power   User   Master',
        description: 'Test achievement',
        icon: '⚡',
        category: 'productivity' as const,
        rarity: 'rare' as const,
        points: 100,
        requirement: { type: 'test', value: 1 },
      };
      
      expect(service.generateAchievementId(achievement)).toBe('power_user_master');
    });

    it('should handle single word achievement names', () => {
      const service = rewardSystemService as any;
      
      const achievement = {
        name: 'Perfectionist',
        description: 'Test achievement',
        icon: '⭐',
        category: 'mastery' as const,
        rarity: 'legendary' as const,
        points: 1000,
        requirement: { type: 'test', value: 1 },
      };
      
      expect(service.generateAchievementId(achievement)).toBe('perfectionist');
    });

    it('should handle achievement names with special characters', () => {
      const service = rewardSystemService as any;
      
      const achievement = {
        name: 'AI Expert',
        description: 'Test achievement',
        icon: '🎓',
        category: 'learning' as const,
        rarity: 'epic' as const,
        points: 400,
        requirement: { type: 'test', value: 1 },
      };
      
      expect(service.generateAchievementId(achievement)).toBe('ai_expert');
    });
  });
});
