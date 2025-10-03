import { describe, it, expect, beforeEach } from 'vitest';
import { AutopilotService } from '../autopilot.service';
import { RewardSystem } from '../reward-system';
import { SmartAnalyzer } from '../smart-analyzer';

describe('Autopilot Service', () => {
  let autopilot: AutopilotService;

  beforeEach(() => {
    autopilot = new AutopilotService();
  });

  it('initializes with simple tasks', () => {
    const tasks = autopilot.getTasks();
    expect(tasks.length).toBeGreaterThan(0);
  });

  it('can execute a task', async () => {
    const tasks = autopilot.getTasks();
    const task = tasks[0];
    
    const result = await autopilot.executeTask(task.id);
    
    expect(result).toBeDefined();
    expect(result.taskId).toBe(task.id);
    expect(result.success).toBeDefined();
  });

  it('updates task statistics after execution', async () => {
    const tasks = autopilot.getTasks();
    const task = tasks[0];
    const initialExecutions = task.timesExecuted;
    
    await autopilot.executeTask(task.id);
    
    const updatedTask = autopilot.getTasks().find(t => t.id === task.id);
    expect(updatedTask?.timesExecuted).toBe(initialExecutions + 1);
  });

  it('can get tasks by category', () => {
    const appLaunchTasks = autopilot.getTasksByCategory('app_launch');
    expect(appLaunchTasks.length).toBeGreaterThan(0);
    expect(appLaunchTasks.every(t => t.category === 'app_launch')).toBe(true);
  });

  it('can get enabled tasks only', () => {
    const enabledTasks = autopilot.getEnabledTasks();
    expect(enabledTasks.every(t => t.enabled)).toBe(true);
  });

  it('tracks execution history', async () => {
    const tasks = autopilot.getTasks();
    const task = tasks[0];
    
    await autopilot.executeTask(task.id);
    
    const history = autopilot.getExecutionHistory();
    expect(history.length).toBeGreaterThan(0);
  });

  it('can enable and disable learning mode', () => {
    expect(autopilot.isLearningEnabled()).toBe(true);
    
    autopilot.setLearningMode(false);
    expect(autopilot.isLearningEnabled()).toBe(false);
    
    autopilot.setLearningMode(true);
    expect(autopilot.isLearningEnabled()).toBe(true);
  });
});

describe('Reward System', () => {
  let rewards: RewardSystem;

  beforeEach(() => {
    rewards = new RewardSystem();
  });

  it('initializes with achievements', () => {
    const achievements = rewards.getAchievements();
    expect(achievements.length).toBeGreaterThan(0);
  });

  it('can award points', () => {
    const initialPoints = rewards.getTotalPoints();
    
    rewards.awardPoints(100, 'Test reward');
    
    expect(rewards.getTotalPoints()).toBe(initialPoints + 100);
  });

  it('tracks level progression', () => {
    const initialLevel = rewards.getLevelInfo().level;
    
    // Award enough points to level up
    rewards.awardPoints(1000, 'Level up test');
    
    const newLevel = rewards.getLevelInfo().level;
    expect(newLevel).toBeGreaterThanOrEqual(initialLevel);
  });

  it('can get achievements by rarity', () => {
    const commonAchievements = rewards.getAchievementsByRarity('common');
    expect(commonAchievements.every(a => a.rarity === 'common')).toBe(true);
  });

  it('tracks current streak', () => {
    const streak = rewards.getCurrentStreak();
    expect(streak).toBeGreaterThanOrEqual(0);
  });

  it('provides statistics', () => {
    const stats = rewards.getStatistics();
    
    expect(stats).toHaveProperty('level');
    expect(stats).toHaveProperty('totalPoints');
    expect(stats).toHaveProperty('achievements');
    expect(stats).toHaveProperty('improvements');
  });
});

describe('Smart Analyzer', () => {
  let analyzer: SmartAnalyzer;

  beforeEach(() => {
    analyzer = new SmartAnalyzer();
  });

  it('can start and stop analysis', () => {
    analyzer.startAnalysis(1000);
    analyzer.stopAnalysis();
    // Should not throw
  });

  it('can analyze task performance', () => {
    const mockTask = {
      id: 'test-task',
      name: 'Test Task',
      category: 'app_launch' as const,
      complexity: 'simple' as const,
      trigger: { type: 'manual' as const, pattern: 'test', confidence: 0.5 },
      actions: [],
      timesExecuted: 10,
      successRate: 0.9,
      createdAt: new Date(),
      enabled: true,
    };

    const mockHistory = [
      {
        taskId: 'test-task',
        success: true,
        duration: 1000,
        timestamp: new Date(),
      },
    ];

    const metrics = analyzer.analyzeTaskPerformance(mockTask, mockHistory);
    
    expect(metrics).toHaveProperty('taskId');
    expect(metrics).toHaveProperty('avgDuration');
    expect(metrics).toHaveProperty('successRate');
    expect(metrics).toHaveProperty('trend');
  });

  it('can calculate smart rate data', () => {
    const mockTasks = [{
      id: 'test-task',
      name: 'Test Task',
      category: 'app_launch' as const,
      complexity: 'simple' as const,
      trigger: { type: 'manual' as const, pattern: 'test', confidence: 0.8 },
      actions: [],
      timesExecuted: 5,
      successRate: 0.9,
      createdAt: new Date(),
      enabled: true,
    }];

    const mockHistory = [
      {
        taskId: 'test-task',
        success: true,
        duration: 1000,
        timestamp: new Date(),
      },
    ];

    const smartRate = analyzer.calculateSmartRateData(mockTasks, mockHistory);
    
    expect(smartRate).toHaveProperty('tasksCount');
    expect(smartRate).toHaveProperty('executionsCount');
    expect(smartRate).toHaveProperty('avgSuccessRate');
    expect(smartRate).toHaveProperty('avgConfidence');
    expect(smartRate).toHaveProperty('patterns');
  });

  it('can get smart rate history', () => {
    const history = analyzer.getSmartRateHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  it('can get pattern changes', () => {
    const changes = analyzer.getPatternChanges();
    expect(Array.isArray(changes)).toBe(true);
  });

  it('can get behavior insights', () => {
    const insights = analyzer.getBehaviorInsights();
    expect(Array.isArray(insights)).toBe(true);
  });
});

describe('Autopilot Integration', () => {
  let autopilot: AutopilotService;
  let rewards: RewardSystem;
  let analyzer: SmartAnalyzer;

  beforeEach(() => {
    autopilot = new AutopilotService();
    rewards = new RewardSystem();
    analyzer = new SmartAnalyzer();
  });

  it('rewards successful task execution', async () => {
    const tasks = autopilot.getTasks();
    const task = tasks[0];
    const initialPoints = rewards.getTotalPoints();
    
    const result = await autopilot.executeTask(task.id);
    
    if (result.success) {
      rewards.awardPoints(50, 'Successful execution');
      expect(rewards.getTotalPoints()).toBeGreaterThan(initialPoints);
    }
  });

  it('analyzes performance after multiple executions', async () => {
    const tasks = autopilot.getTasks();
    const task = tasks[0];
    
    // Execute task multiple times
    for (let i = 0; i < 3; i++) {
      await autopilot.executeTask(task.id);
    }
    
    const history = autopilot.getExecutionHistory();
    const metrics = analyzer.analyzeTaskPerformance(task, history);
    
    expect(metrics.avgDuration).toBeGreaterThan(0);
  });

  it('generates insights from execution data', async () => {
    const tasks = autopilot.getTasks();
    
    // Execute some tasks
    for (let i = 0; i < 2; i++) {
      await autopilot.executeTask(tasks[0].id);
    }
    
    const history = autopilot.getExecutionHistory();
    const context = {
      currentApp: 'test',
      recentActions: [],
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      userActivity: 'active' as const,
    };
    
    const insights = analyzer.generateDetailedInsights(tasks, history, context);
    expect(Array.isArray(insights)).toBe(true);
  });
});
