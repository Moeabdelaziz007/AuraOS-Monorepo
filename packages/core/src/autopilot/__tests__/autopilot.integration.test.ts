import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutopilotService } from '../autopilot.service';
import { SmartAnalyzer } from '../smart-analyzer';
import { RewardSystem } from '../reward-system';
import { LearningLoopService } from '../../learning/learning-loop.service';

// Mock dependencies
vi.mock('@auraos/ai', () => ({
  aiService: {
    chat: vi.fn(),
    generate: vi.fn(),
    analyze: vi.fn()
  }
}));

vi.mock('@auraos/core', () => ({
  mcpCommands: {
    file: {
      read: vi.fn(),
      write: vi.fn(),
      list: vi.fn()
    },
    emulator: {
      create: vi.fn(),
      start: vi.fn(),
      execute: vi.fn()
    }
  }
}));

describe('Autopilot Integration Tests', () => {
  let autopilotService: AutopilotService;
  let smartAnalyzer: SmartAnalyzer;
  let rewardSystem: RewardSystem;
  let learningLoop: LearningLoopService;

  beforeEach(() => {
    vi.clearAllMocks();
    autopilotService = new AutopilotService();
    smartAnalyzer = new SmartAnalyzer();
    rewardSystem = new RewardSystem();
    learningLoop = new LearningLoopService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Task Execution', () => {
    it('should execute simple tasks', async () => {
      const task = {
        id: 'test-task',
        description: 'Create a new file',
        tools: ['fs_write'],
        parameters: {
          path: 'test.txt',
          content: 'Hello World'
        }
      };

      const result = await autopilotService.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.toolsUsed).toContain('fs_write');
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should execute complex multi-step tasks', async () => {
      const task = {
        id: 'complex-task',
        description: 'Create a BASIC program and run it',
        tools: ['fs_write', 'emu_create', 'emu_start', 'emu_execute'],
        parameters: {
          program: '10 PRINT "Hello World"\n20 END',
          filename: 'hello.bas'
        }
      };

      const result = await autopilotService.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.toolsUsed).toContain('fs_write');
      expect(result.toolsUsed).toContain('emu_create');
      expect(result.stepsCompleted).toBeGreaterThan(1);
    });

    it('should handle task failures gracefully', async () => {
      const task = {
        id: 'failing-task',
        description: 'Access protected file',
        tools: ['fs_read'],
        parameters: {
          path: '/etc/passwd'
        }
      };

      const result = await autopilotService.executeTask(task);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.retryCount).toBeGreaterThan(0);
    });
  });

  describe('Smart Analysis', () => {
    it('should analyze user patterns', async () => {
      const userActions = [
        { action: 'app_launch', app: 'terminal', timestamp: Date.now() },
        { action: 'command_execute', command: 'ls', timestamp: Date.now() },
        { action: 'app_launch', app: 'files', timestamp: Date.now() }
      ];

      const analysis = await smartAnalyzer.analyzePatterns(userActions);
      
      expect(analysis.patterns).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
    });

    it('should predict user needs', async () => {
      const context = {
        currentApp: 'terminal',
        recentCommands: ['ls', 'cd', 'pwd'],
        timeOfDay: 'morning'
      };

      const predictions = await smartAnalyzer.predictNeeds(context);
      
      expect(predictions.suggestedActions).toBeDefined();
      expect(predictions.confidence).toBeGreaterThan(0);
    });

    it('should learn from user feedback', async () => {
      const feedback = {
        taskId: 'test-task',
        rating: 5,
        comments: 'Great job!',
        timestamp: Date.now()
      };

      await smartAnalyzer.learnFromFeedback(feedback);
      
      const analysis = await smartAnalyzer.getAnalysis('test-task');
      expect(analysis.feedback).toContain(feedback);
    });
  });

  describe('Reward System', () => {
    it('should award points for task completion', async () => {
      const task = {
        id: 'reward-task',
        description: 'Complete a task',
        difficulty: 'medium',
        tools: ['fs_write']
      };

      const result = await autopilotService.executeTask(task);
      const rewards = await rewardSystem.calculateRewards(result);
      
      expect(rewards.points).toBeGreaterThan(0);
      expect(rewards.achievements).toBeDefined();
    });

    it('should unlock achievements', async () => {
      const achievements = [
        { id: 'first-task', name: 'First Task', points: 10 },
        { id: 'power-user', name: 'Power User', points: 100 }
      ];

      for (const achievement of achievements) {
        await rewardSystem.unlockAchievement(achievement.id);
      }

      const userRewards = await rewardSystem.getUserRewards();
      expect(userRewards.achievements).toHaveLength(2);
      expect(userRewards.totalPoints).toBe(110);
    });

    it('should track streaks', async () => {
      const tasks = Array.from({ length: 5 }, (_, i) => ({
        id: `task-${i}`,
        description: `Task ${i}`,
        tools: ['fs_write']
      }));

      for (const task of tasks) {
        await autopilotService.executeTask(task);
      }

      const streaks = await rewardSystem.getStreaks();
      expect(streaks.dailyStreak).toBe(5);
      expect(streaks.weeklyStreak).toBeGreaterThan(0);
    });
  });

  describe('Learning Loop', () => {
    it('should track user behavior', async () => {
      const behavior = {
        action: 'app_launch',
        app: 'terminal',
        timestamp: Date.now(),
        context: { previousApp: 'desktop' }
      };

      await learningLoop.trackBehavior(behavior);
      
      const patterns = await learningLoop.getPatterns();
      expect(patterns).toContain(behavior);
    });

    it('should generate insights', async () => {
      const behaviors = [
        { action: 'app_launch', app: 'terminal', timestamp: Date.now() },
        { action: 'command_execute', command: 'ls', timestamp: Date.now() },
        { action: 'app_launch', app: 'files', timestamp: Date.now() }
      ];

      for (const behavior of behaviors) {
        await learningLoop.trackBehavior(behavior);
      }

      const insights = await learningLoop.generateInsights();
      expect(insights.patterns).toBeDefined();
      expect(insights.recommendations).toBeDefined();
    });

    it('should adapt to user preferences', async () => {
      const preferences = {
        preferredApps: ['terminal', 'files'],
        workingHours: '9-17',
        automationLevel: 'high'
      };

      await learningLoop.updatePreferences(preferences);
      
      const adaptedBehavior = await learningLoop.getAdaptedBehavior();
      expect(adaptedBehavior.suggestedActions).toBeDefined();
      expect(adaptedBehavior.automationLevel).toBe('high');
    });
  });

  describe('Tool Integration', () => {
    it('should integrate with file system tools', async () => {
      const task = {
        id: 'file-task',
        description: 'Create and manage files',
        tools: ['fs_write', 'fs_read', 'fs_list'],
        parameters: {
          files: ['test1.txt', 'test2.txt'],
          content: 'Hello World'
        }
      };

      const result = await autopilotService.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.toolsUsed).toContain('fs_write');
      expect(result.toolsUsed).toContain('fs_read');
    });

    it('should integrate with emulator tools', async () => {
      const task = {
        id: 'emulator-task',
        description: 'Run BASIC program',
        tools: ['emu_create', 'emu_start', 'emu_execute'],
        parameters: {
          program: '10 PRINT "Hello"\n20 END'
        }
      };

      const result = await autopilotService.executeTask(task);
      
      expect(result.success).toBe(true);
      expect(result.toolsUsed).toContain('emu_create');
      expect(result.toolsUsed).toContain('emu_execute');
    });

    it('should handle tool failures', async () => {
      const task = {
        id: 'failing-tool-task',
        description: 'Use failing tool',
        tools: ['failing_tool'],
        parameters: {}
      };

      const result = await autopilotService.executeTask(task);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.retryCount).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent task execution', async () => {
      const tasks = Array.from({ length: 10 }, (_, i) => ({
        id: `concurrent-task-${i}`,
        description: `Task ${i}`,
        tools: ['fs_write'],
        parameters: { path: `file${i}.txt`, content: `Content ${i}` }
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        tasks.map(task => autopilotService.executeTask(task))
      );
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle large task queues', async () => {
      const largeTaskQueue = Array.from({ length: 100 }, (_, i) => ({
        id: `queue-task-${i}`,
        description: `Queued task ${i}`,
        tools: ['fs_write'],
        parameters: { path: `queue${i}.txt`, content: `Queue content ${i}` }
      }));

      const startTime = Date.now();
      const results = await autopilotService.executeTaskQueue(largeTaskQueue);
      const endTime = Date.now();

      expect(results.completed).toBe(100);
      expect(results.failed).toBe(0);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('Error Handling', () => {
    it('should handle network failures', async () => {
      const task = {
        id: 'network-task',
        description: 'Task requiring network',
        tools: ['network_tool'],
        parameters: { url: 'https://example.com' }
      };

      // Mock network failure
      vi.mocked(autopilotService.executeTask).mockRejectedValue(
        new Error('Network error')
      );

      const result = await autopilotService.executeTask(task);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle timeout errors', async () => {
      const task = {
        id: 'timeout-task',
        description: 'Long running task',
        tools: ['slow_tool'],
        parameters: {},
        timeout: 1000
      };

      const result = await autopilotService.executeTask(task);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should handle resource exhaustion', async () => {
      const task = {
        id: 'resource-task',
        description: 'Resource intensive task',
        tools: ['memory_intensive_tool'],
        parameters: { size: '1GB' }
      };

      const result = await autopilotService.executeTask(task);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('resource');
    });
  });

  describe('Data Persistence', () => {
    it('should persist user data', async () => {
      const userData = {
        userId: 'test-user',
        preferences: { theme: 'dark' },
        achievements: ['first-task'],
        totalPoints: 100
      };

      await autopilotService.saveUserData(userData);
      const savedData = await autopilotService.getUserData('test-user');
      
      expect(savedData).toEqual(userData);
    });

    it('should persist task history', async () => {
      const task = {
        id: 'history-task',
        description: 'Task for history',
        tools: ['fs_write'],
        parameters: { path: 'history.txt', content: 'History content' }
      };

      await autopilotService.executeTask(task);
      const history = await autopilotService.getTaskHistory();
      
      expect(history).toContainEqual(
        expect.objectContaining({ id: 'history-task' })
      );
    });

    it('should persist learning data', async () => {
      const learningData = {
        patterns: [{ action: 'app_launch', frequency: 10 }],
        insights: [{ type: 'preference', confidence: 0.8 }],
        adaptations: [{ behavior: 'automation', level: 'high' }]
      };

      await learningLoop.saveLearningData(learningData);
      const savedData = await learningLoop.getLearningData();
      
      expect(savedData).toEqual(learningData);
    });
  });
});
