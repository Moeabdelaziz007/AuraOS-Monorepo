/**
 * Autopilot Reward System Tests
 * 
 * Tests the reward calculation and distribution system for autonomous task execution.
 * Covers various performance scenarios and edge cases.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock types based on the reward system
interface TaskMetrics {
  taskId: string;
  executionTime: number;
  successRate: number;
  resourceUsage: number;
  complexity: number;
  timestamp: Date;
}

interface RewardCalculation {
  baseReward: number;
  performanceBonus: number;
  efficiencyBonus: number;
  qualityBonus: number;
  totalReward: number;
  metrics: {
    speedScore: number;
    efficiencyScore: number;
    qualityScore: number;
  };
}

// Mock reward calculator (will be replaced with actual implementation)
class AutopilotRewardCalculator {
  private readonly BASE_REWARD = 100;
  private readonly MAX_BONUS = 200;
  
  calculateReward(metrics: TaskMetrics): RewardCalculation {
    const speedScore = this.calculateSpeedScore(metrics.executionTime, metrics.complexity);
    const efficiencyScore = this.calculateEfficiencyScore(metrics.resourceUsage);
    const qualityScore = metrics.successRate;
    
    const baseReward = this.BASE_REWARD;
    const performanceBonus = speedScore * 50;
    const efficiencyBonus = efficiencyScore * 50;
    const qualityBonus = qualityScore * 100;
    
    const totalReward = Math.min(
      baseReward + performanceBonus + efficiencyBonus + qualityBonus,
      this.BASE_REWARD + this.MAX_BONUS
    );
    
    return {
      baseReward,
      performanceBonus,
      efficiencyBonus,
      qualityBonus,
      totalReward,
      metrics: {
        speedScore,
        efficiencyScore,
        qualityScore
      }
    };
  }
  
  private calculateSpeedScore(executionTime: number, complexity: number): number {
    const expectedTime = complexity * 1000; // 1 second per complexity point
    const ratio = expectedTime / executionTime;
    return Math.max(0, Math.min(1, ratio));
  }
  
  private calculateEfficiencyScore(resourceUsage: number): number {
    // Lower resource usage = higher score
    return Math.max(0, Math.min(1, 1 - resourceUsage));
  }
}

describe('Autopilot Reward System', () => {
  let calculator: AutopilotRewardCalculator;
  
  beforeEach(() => {
    calculator = new AutopilotRewardCalculator();
  });
  
  describe('Perfect Performance Scenario', () => {
    it('should award maximum rewards for perfect execution', () => {
      const metrics: TaskMetrics = {
        taskId: 'task-001',
        executionTime: 1000, // Fast execution
        successRate: 1.0, // 100% success
        resourceUsage: 0.1, // Low resource usage
        complexity: 5,
        timestamp: new Date()
      };
      
      const reward = calculator.calculateReward(metrics);
      
      expect(reward.totalReward).toBeGreaterThan(250);
      expect(reward.metrics.speedScore).toBeGreaterThan(0.8);
      expect(reward.metrics.efficiencyScore).toBeGreaterThan(0.8);
      expect(reward.metrics.qualityScore).toBe(1.0);
    });
  });
  
  describe('Average Performance Scenario', () => {
    it('should award moderate rewards for average execution', () => {
      const metrics: TaskMetrics = {
        taskId: 'task-002',
        executionTime: 5000, // Average execution
        successRate: 0.8, // 80% success
        resourceUsage: 0.5, // Moderate resource usage
        complexity: 5,
        timestamp: new Date()
      };
      
      const reward = calculator.calculateReward(metrics);
      
      expect(reward.totalReward).toBeGreaterThan(150);
      expect(reward.totalReward).toBeLessThan(250);
      expect(reward.metrics.qualityScore).toBe(0.8);
    });
  });
  
  describe('Poor Performance Scenario', () => {
    it('should award minimal rewards for poor execution', () => {
      const metrics: TaskMetrics = {
        taskId: 'task-003',
        executionTime: 10000, // Slow execution
        successRate: 0.5, // 50% success
        resourceUsage: 0.9, // High resource usage
        complexity: 5,
        timestamp: new Date()
      };
      
      const reward = calculator.calculateReward(metrics);
      
      expect(reward.totalReward).toBeLessThan(200);
      expect(reward.metrics.speedScore).toBeLessThan(0.6);
      expect(reward.metrics.efficiencyScore).toBeLessThan(0.2);
    });
  });
  
  describe('High Complexity Tasks', () => {
    it('should adjust expectations for complex tasks', () => {
      const metrics: TaskMetrics = {
        taskId: 'task-004',
        executionTime: 10000, // 10 seconds
        successRate: 0.9,
        resourceUsage: 0.3,
        complexity: 10, // High complexity
        timestamp: new Date()
      };
      
      const reward = calculator.calculateReward(metrics);
      
      // Should still get good rewards despite longer execution time
      expect(reward.totalReward).toBeGreaterThan(200);
      expect(reward.metrics.speedScore).toBeGreaterThan(0.8);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle zero execution time gracefully', () => {
      const metrics: TaskMetrics = {
        taskId: 'task-005',
        executionTime: 0,
        successRate: 1.0,
        resourceUsage: 0.1,
        complexity: 1,
        timestamp: new Date()
      };
      
      const reward = calculator.calculateReward(metrics);
      
      expect(reward.totalReward).toBeGreaterThan(0);
      expect(reward.totalReward).toBeLessThanOrEqual(300);
    });
    
    it('should cap rewards at maximum threshold', () => {
      const metrics: TaskMetrics = {
        taskId: 'task-006',
        executionTime: 100, // Extremely fast
        successRate: 1.0,
        resourceUsage: 0.01, // Minimal resources
        complexity: 10,
        timestamp: new Date()
      };
      
      const reward = calculator.calculateReward(metrics);
      
      expect(reward.totalReward).toBeLessThanOrEqual(300);
    });
    
    it('should handle failed tasks appropriately', () => {
      const metrics: TaskMetrics = {
        taskId: 'task-007',
        executionTime: 5000,
        successRate: 0.0, // Complete failure
        resourceUsage: 0.5,
        complexity: 5,
        timestamp: new Date()
      };
      
      const reward = calculator.calculateReward(metrics);
      
      expect(reward.metrics.qualityScore).toBe(0);
      expect(reward.qualityBonus).toBe(0);
    });
  });
  
  describe('Reward Components', () => {
    it('should properly calculate all reward components', () => {
      const metrics: TaskMetrics = {
        taskId: 'task-008',
        executionTime: 3000,
        successRate: 0.85,
        resourceUsage: 0.4,
        complexity: 5,
        timestamp: new Date()
      };
      
      const reward = calculator.calculateReward(metrics);
      
      expect(reward.baseReward).toBe(100);
      expect(reward.performanceBonus).toBeGreaterThanOrEqual(0);
      expect(reward.efficiencyBonus).toBeGreaterThanOrEqual(0);
      expect(reward.qualityBonus).toBeGreaterThanOrEqual(0);
      expect(reward.totalReward).toBe(
        Math.min(
          reward.baseReward + 
          reward.performanceBonus + 
          reward.efficiencyBonus + 
          reward.qualityBonus,
          300
        )
      );
    });
  });
  
  describe('Consistency Tests', () => {
    it('should produce consistent results for identical metrics', () => {
      const metrics: TaskMetrics = {
        taskId: 'task-009',
        executionTime: 4000,
        successRate: 0.75,
        resourceUsage: 0.6,
        complexity: 5,
        timestamp: new Date()
      };
      
      const reward1 = calculator.calculateReward(metrics);
      const reward2 = calculator.calculateReward(metrics);
      
      expect(reward1.totalReward).toBe(reward2.totalReward);
      expect(reward1.metrics.speedScore).toBe(reward2.metrics.speedScore);
      expect(reward1.metrics.efficiencyScore).toBe(reward2.metrics.efficiencyScore);
    });
  });
  
  describe('Performance Trends', () => {
    it('should show increasing rewards for improving performance', () => {
      const baseMetrics: TaskMetrics = {
        taskId: 'task-010',
        executionTime: 5000,
        successRate: 0.7,
        resourceUsage: 0.6,
        complexity: 5,
        timestamp: new Date()
      };
      
      const improvedMetrics: TaskMetrics = {
        ...baseMetrics,
        executionTime: 3000,
        successRate: 0.9,
        resourceUsage: 0.3
      };
      
      const baseReward = calculator.calculateReward(baseMetrics);
      const improvedReward = calculator.calculateReward(improvedMetrics);
      
      expect(improvedReward.totalReward).toBeGreaterThan(baseReward.totalReward);
      expect(improvedReward.metrics.speedScore).toBeGreaterThan(baseReward.metrics.speedScore);
      expect(improvedReward.metrics.efficiencyScore).toBeGreaterThan(baseReward.metrics.efficiencyScore);
    });
  });
});

describe('Reward Distribution System', () => {
  describe('Batch Processing', () => {
    it('should handle multiple task rewards efficiently', () => {
      const calculator = new AutopilotRewardCalculator();
      const tasks: TaskMetrics[] = Array.from({ length: 100 }, (_, i) => ({
        taskId: `task-${i}`,
        executionTime: Math.random() * 10000,
        successRate: Math.random(),
        resourceUsage: Math.random(),
        complexity: Math.floor(Math.random() * 10) + 1,
        timestamp: new Date()
      }));
      
      const rewards = tasks.map(task => calculator.calculateReward(task));
      
      expect(rewards).toHaveLength(100);
      rewards.forEach(reward => {
        expect(reward.totalReward).toBeGreaterThanOrEqual(0);
        expect(reward.totalReward).toBeLessThanOrEqual(300);
      });
    });
  });
  
  describe('Aggregate Statistics', () => {
    it('should calculate aggregate performance metrics', () => {
      const calculator = new AutopilotRewardCalculator();
      const tasks: TaskMetrics[] = [
        {
          taskId: 'task-1',
          executionTime: 2000,
          successRate: 0.9,
          resourceUsage: 0.2,
          complexity: 5,
          timestamp: new Date()
        },
        {
          taskId: 'task-2',
          executionTime: 3000,
          successRate: 0.85,
          resourceUsage: 0.3,
          complexity: 5,
          timestamp: new Date()
        },
        {
          taskId: 'task-3',
          executionTime: 4000,
          successRate: 0.8,
          resourceUsage: 0.4,
          complexity: 5,
          timestamp: new Date()
        }
      ];
      
      const rewards = tasks.map(task => calculator.calculateReward(task));
      const avgReward = rewards.reduce((sum, r) => sum + r.totalReward, 0) / rewards.length;
      const avgQuality = rewards.reduce((sum, r) => sum + r.metrics.qualityScore, 0) / rewards.length;
      
      expect(avgReward).toBeGreaterThan(0);
      expect(avgQuality).toBeGreaterThan(0.8);
    });
  });
});

export { AutopilotRewardCalculator, TaskMetrics, RewardCalculation };
