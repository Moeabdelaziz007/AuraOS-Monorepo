/**
 * Task Scheduler Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskScheduler, TaskTier, TaskCategory, Task, TaskResult } from '../task-scheduler';
import { Priority } from '../types';

describe('Task Scheduler', () => {
  let scheduler: TaskScheduler;

  beforeEach(() => {
    scheduler = new TaskScheduler({
      maxConcurrentTasks: 3,
      learningThreshold: 500,
      enableAdaptiveLearning: true
    });
  });

  describe('Agent Registration', () => {
    it('should register a new agent', () => {
      scheduler.registerAgent('agent-1', {
        'javascript': 50,
        'typescript': 40
      });

      const stats = scheduler.getAgentStats('agent-1');
      expect(stats).toBeDefined();
      expect(stats?.id).toBe('agent-1');
      expect(stats?.currentTier).toBe(TaskTier.BEGINNER);
      expect(stats?.skills.get('javascript')).toBe(50);
    });

    it('should initialize agent with default values', () => {
      scheduler.registerAgent('agent-2');

      const stats = scheduler.getAgentStats('agent-2');
      expect(stats).toBeDefined();
      expect(stats?.skills.size).toBe(0);
      expect(stats?.totalExperience).toBe(0);
      expect(stats?.successRate).toBe(0);
    });
  });

  describe('Task Management', () => {
    it('should add a task to the scheduler', () => {
      const task: Task = {
        id: 'task-1',
        category: TaskCategory.DATA_PROCESSING,
        tier: TaskTier.BEGINNER,
        title: 'Process CSV Data',
        description: 'Parse and validate CSV file',
        estimatedTime: 15,
        learningValue: 30,
        prerequisites: [],
        skills: ['data-processing', 'csv'],
        priority: Priority.NORMAL
      };

      scheduler.addTask(task);

      const stats = scheduler.getStats();
      expect(stats.totalTasks).toBe(1);
      expect(stats.queuedTasks).toBe(1);
    });

    it('should sort tasks by priority', () => {
      scheduler.registerAgent('agent-1');

      const lowPriorityTask: Task = {
        id: 'task-low',
        category: TaskCategory.DATA_PROCESSING,
        tier: TaskTier.BEGINNER,
        title: 'Low Priority Task',
        description: 'Test',
        estimatedTime: 10,
        learningValue: 20,
        prerequisites: [],
        skills: [],
        priority: Priority.LOW
      };

      const highPriorityTask: Task = {
        id: 'task-high',
        category: TaskCategory.DATA_PROCESSING,
        tier: TaskTier.BEGINNER,
        title: 'High Priority Task',
        description: 'Test',
        estimatedTime: 10,
        learningValue: 20,
        prerequisites: [],
        skills: [],
        priority: Priority.HIGH
      };

      scheduler.addTask(lowPriorityTask);
      scheduler.addTask(highPriorityTask);

      const nextTask = scheduler.getNextTask('agent-1');
      expect(nextTask?.id).toBe('task-high');
    });
  });

  describe('Task Assignment', () => {
    beforeEach(() => {
      scheduler.registerAgent('agent-1', {
        'javascript': 60,
        'api': 50
      });
    });

    it('should assign suitable task to agent', () => {
      const task: Task = {
        id: 'task-1',
        category: TaskCategory.API_INTEGRATION,
        tier: TaskTier.BEGINNER,
        title: 'API Integration',
        description: 'Integrate REST API',
        estimatedTime: 20,
        learningValue: 40,
        prerequisites: [],
        skills: ['javascript', 'api'],
        priority: Priority.NORMAL
      };

      scheduler.addTask(task);

      const assignedTask = scheduler.getNextTask('agent-1');
      expect(assignedTask).toBeDefined();
      expect(assignedTask?.id).toBe('task-1');
    });

    it('should not assign task above agent tier limit', () => {
      const task: Task = {
        id: 'task-expert',
        category: TaskCategory.SYSTEM_OPTIMIZATION,
        tier: TaskTier.EXPERT,
        title: 'System Optimization',
        description: 'Optimize system performance',
        estimatedTime: 60,
        learningValue: 90,
        prerequisites: [],
        skills: ['optimization'],
        priority: Priority.NORMAL
      };

      scheduler.addTask(task);

      const assignedTask = scheduler.getNextTask('agent-1');
      expect(assignedTask).toBeNull();
    });

    it('should respect concurrent task limit', () => {
      scheduler.registerAgent('agent-2');

      for (let i = 0; i < 5; i++) {
        scheduler.addTask({
          id: `task-${i}`,
          category: TaskCategory.DATA_PROCESSING,
          tier: TaskTier.BEGINNER,
          title: `Task ${i}`,
          description: 'Test task',
          estimatedTime: 10,
          learningValue: 20,
          prerequisites: [],
          skills: [],
          priority: Priority.NORMAL
        });
      }

      // Get 3 tasks (max concurrent)
      const task1 = scheduler.getNextTask('agent-2');
      const task2 = scheduler.getNextTask('agent-2');
      const task3 = scheduler.getNextTask('agent-2');
      const task4 = scheduler.getNextTask('agent-2');

      expect(task1).toBeDefined();
      expect(task2).toBeDefined();
      expect(task3).toBeDefined();
      expect(task4).toBeNull(); // Should hit limit
    });

    it('should check prerequisites', () => {
      scheduler.registerAgent('agent-3');

      const task1: Task = {
        id: 'task-1',
        category: TaskCategory.DATA_PROCESSING,
        tier: TaskTier.BEGINNER,
        title: 'Task 1',
        description: 'First task',
        estimatedTime: 10,
        learningValue: 20,
        prerequisites: [],
        skills: [],
        priority: Priority.NORMAL
      };

      const task2: Task = {
        id: 'task-2',
        category: TaskCategory.DATA_PROCESSING,
        tier: TaskTier.BEGINNER,
        title: 'Task 2',
        description: 'Second task',
        estimatedTime: 10,
        learningValue: 20,
        prerequisites: ['task-1'],
        skills: [],
        priority: Priority.NORMAL
      };

      scheduler.addTask(task2);
      scheduler.addTask(task1);

      // Should get task-1 first (no prerequisites)
      const firstTask = scheduler.getNextTask('agent-3');
      expect(firstTask?.id).toBe('task-1');

      // task-2 should not be available yet
      const secondTask = scheduler.getNextTask('agent-3');
      expect(secondTask).toBeNull();
    });
  });

  describe('Task Completion', () => {
    beforeEach(() => {
      scheduler.registerAgent('agent-1', {
        'javascript': 50
      });
    });

    it('should update agent profile on successful completion', () => {
      const task: Task = {
        id: 'task-1',
        category: TaskCategory.CODE_ANALYSIS,
        tier: TaskTier.BEGINNER,
        title: 'Code Analysis',
        description: 'Analyze code quality',
        estimatedTime: 15,
        learningValue: 40,
        prerequisites: [],
        skills: ['javascript', 'analysis'],
        priority: Priority.NORMAL
      };

      scheduler.addTask(task);
      scheduler.getNextTask('agent-1');

      const result: TaskResult = {
        taskId: 'task-1',
        agentId: 'agent-1',
        success: true,
        completionTime: 15000,
        quality: 85,
        learningGained: 40
      };

      scheduler.completeTask(result);

      const stats = scheduler.getAgentStats('agent-1');
      expect(stats?.completedTasks).toContain('task-1');
      expect(stats?.totalExperience).toBe(40);
      expect(stats?.successRate).toBe(1);
    });

    it('should improve agent skills on completion', () => {
      const task: Task = {
        id: 'task-1',
        category: TaskCategory.CODE_ANALYSIS,
        tier: TaskTier.BEGINNER,
        title: 'Code Analysis',
        description: 'Analyze code',
        estimatedTime: 15,
        learningValue: 50,
        prerequisites: [],
        skills: ['javascript'],
        priority: Priority.NORMAL
      };

      scheduler.addTask(task);
      scheduler.getNextTask('agent-1');

      const initialSkill = scheduler.getAgentStats('agent-1')?.skills.get('javascript');

      const result: TaskResult = {
        taskId: 'task-1',
        agentId: 'agent-1',
        success: true,
        completionTime: 15000,
        quality: 90,
        learningGained: 50
      };

      scheduler.completeTask(result);

      const newSkill = scheduler.getAgentStats('agent-1')?.skills.get('javascript');
      expect(newSkill).toBeGreaterThan(initialSkill!);
    });

    it('should not update profile on failed completion', () => {
      const task: Task = {
        id: 'task-1',
        category: TaskCategory.CODE_ANALYSIS,
        tier: TaskTier.BEGINNER,
        title: 'Code Analysis',
        description: 'Analyze code',
        estimatedTime: 15,
        learningValue: 40,
        prerequisites: [],
        skills: ['javascript'],
        priority: Priority.NORMAL
      };

      scheduler.addTask(task);
      scheduler.getNextTask('agent-1');

      const result: TaskResult = {
        taskId: 'task-1',
        agentId: 'agent-1',
        success: false,
        completionTime: 15000,
        quality: 0,
        learningGained: 0,
        errors: ['Failed to complete']
      };

      scheduler.completeTask(result);

      const stats = scheduler.getAgentStats('agent-1');
      expect(stats?.totalExperience).toBe(0);
      expect(stats?.completedTasks).not.toContain('task-1');
    });
  });

  describe('Tier Advancement', () => {
    it('should advance agent tier with sufficient experience', () => {
      scheduler.registerAgent('agent-1');

      const task: Task = {
        id: 'task-1',
        category: TaskCategory.DATA_PROCESSING,
        tier: TaskTier.BEGINNER,
        title: 'Data Processing',
        description: 'Process data',
        estimatedTime: 10,
        learningValue: 100,
        prerequisites: [],
        skills: ['data'],
        priority: Priority.NORMAL
      };

      // Complete multiple tasks to gain experience
      for (let i = 0; i < 6; i++) {
        const taskCopy = { ...task, id: `task-${i}` };
        scheduler.addTask(taskCopy);
        scheduler.getNextTask('agent-1');

        scheduler.completeTask({
          taskId: `task-${i}`,
          agentId: 'agent-1',
          success: true,
          completionTime: 10000,
          quality: 90,
          learningGained: 100
        });
      }

      const stats = scheduler.getAgentStats('agent-1');
      expect(stats?.currentTier).toBe(TaskTier.INTERMEDIATE);
    });
  });

  describe('Learning Value Calculation', () => {
    beforeEach(() => {
      scheduler.registerAgent('agent-1', {
        'javascript': 80
      });
    });

    it('should calculate higher learning value for challenging tasks', () => {
      const easyTask: Task = {
        id: 'easy',
        category: TaskCategory.DATA_PROCESSING,
        tier: TaskTier.BEGINNER,
        title: 'Easy Task',
        description: 'Easy',
        estimatedTime: 5,
        learningValue: 20,
        prerequisites: [],
        skills: ['javascript'],
        priority: Priority.NORMAL
      };

      const hardTask: Task = {
        id: 'hard',
        category: TaskCategory.SYSTEM_OPTIMIZATION,
        tier: TaskTier.BEGINNER,
        title: 'Hard Task',
        description: 'Hard',
        estimatedTime: 30,
        learningValue: 20,
        prerequisites: [],
        skills: ['optimization', 'performance'],
        priority: Priority.NORMAL
      };

      const agent = scheduler.getAgentStats('agent-1')!;
      const easyValue = scheduler.calculateLearningValue(easyTask, agent);
      const hardValue = scheduler.calculateLearningValue(hardTask, agent);

      expect(hardValue).toBeGreaterThan(easyValue);
    });
  });

  describe('Task Recommendations', () => {
    beforeEach(() => {
      scheduler.registerAgent('agent-1', {
        'javascript': 60,
        'api': 50
      });
    });

    it('should recommend suitable tasks', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          category: TaskCategory.API_INTEGRATION,
          tier: TaskTier.BEGINNER,
          title: 'API Task',
          description: 'API work',
          estimatedTime: 20,
          learningValue: 40,
          prerequisites: [],
          skills: ['api', 'javascript'],
          priority: Priority.NORMAL
        },
        {
          id: 'task-2',
          category: TaskCategory.SYSTEM_OPTIMIZATION,
          tier: TaskTier.EXPERT,
          title: 'Expert Task',
          description: 'Expert work',
          estimatedTime: 60,
          learningValue: 90,
          prerequisites: [],
          skills: ['optimization'],
          priority: Priority.NORMAL
        },
        {
          id: 'task-3',
          category: TaskCategory.DATA_PROCESSING,
          tier: TaskTier.BEGINNER,
          title: 'Data Task',
          description: 'Data work',
          estimatedTime: 15,
          learningValue: 30,
          prerequisites: [],
          skills: ['data'],
          priority: Priority.NORMAL
        }
      ];

      tasks.forEach(task => scheduler.addTask(task));

      const recommendations = scheduler.getRecommendedTasks('agent-1', 3);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(3);
      // Should not include expert task
      expect(recommendations.find(t => t.id === 'task-2')).toBeUndefined();
    });
  });

  describe('Task Cancellation', () => {
    beforeEach(() => {
      scheduler.registerAgent('agent-1');
    });

    it('should cancel active task and return to queue', () => {
      const task: Task = {
        id: 'task-1',
        category: TaskCategory.DATA_PROCESSING,
        tier: TaskTier.BEGINNER,
        title: 'Task',
        description: 'Test',
        estimatedTime: 10,
        learningValue: 20,
        prerequisites: [],
        skills: [],
        priority: Priority.NORMAL
      };

      scheduler.addTask(task);
      scheduler.getNextTask('agent-1');

      let stats = scheduler.getStats();
      expect(stats.activeTasks).toBe(1);
      expect(stats.queuedTasks).toBe(0);

      scheduler.cancelTask('task-1');

      stats = scheduler.getStats();
      expect(stats.activeTasks).toBe(0);
      expect(stats.queuedTasks).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should track scheduler statistics', () => {
      scheduler.registerAgent('agent-1');
      scheduler.registerAgent('agent-2');

      const task: Task = {
        id: 'task-1',
        category: TaskCategory.DATA_PROCESSING,
        tier: TaskTier.BEGINNER,
        title: 'Task',
        description: 'Test',
        estimatedTime: 10,
        learningValue: 20,
        prerequisites: [],
        skills: [],
        priority: Priority.NORMAL
      };

      scheduler.addTask(task);
      scheduler.getNextTask('agent-1');

      const stats = scheduler.getStats();

      expect(stats.totalTasks).toBe(1);
      expect(stats.activeTasks).toBe(1);
      expect(stats.totalAgents).toBe(2);
    });
  });
});
