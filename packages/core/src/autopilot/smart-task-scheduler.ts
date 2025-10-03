/**
 * Smart Task Scheduler - Progressive Learning System
 * Automatically selects optimal tasks based on performance and learning rate
 */

import { RewardSystem } from './reward-system';
import { QuantumAutopilot } from './quantum-autopilot';

/**
 * Task difficulty tier
 */
export type TaskTier = 'foundation' | 'intermediate' | 'advanced';

/**
 * Learning task definition
 */
export interface LearningTask {
  id: string;
  name: string;
  description: string;
  tier: TaskTier;
  complexity: number;
  category: string;
  estimatedDuration: number;
  prerequisites?: string[];
  learningValue: number;
}

/**
 * Learning session result
 */
export interface LearningSession {
  task: LearningTask;
  success: boolean;
  quality: number;
  duration: number;
  iterationCount: number;
  timestamp: Date;
}

/**
 * Learning progress metrics
 */
export interface LearningProgress {
  totalTasks: number;
  successfulTasks: number;
  successRate: number;
  averageQuality: number;
  averageDuration: number;
  currentTier: TaskTier;
  tasksPerTier: {
    foundation: number;
    intermediate: number;
    advanced: number;
  };
  readyForNextTier: boolean;
  learningRate: number;
  streak: number;
}

/**
 * Smart Task Scheduler
 */
export class SmartTaskScheduler {
  private static instance: SmartTaskScheduler;
  private quantumAutopilot: QuantumAutopilot;
  private rewardSystem: RewardSystem;
  private sessions: LearningSession[] = [];
  private availableTasks: Map<string, LearningTask> = new Map();
  private completedTasks: Set<string> = new Set();
  private currentWeek: number = 1;

  private constructor() {
    this.quantumAutopilot = QuantumAutopilot.getInstance();
    this.rewardSystem = new RewardSystem();
    this.initializeTasks();
  }

  static getInstance(): SmartTaskScheduler {
    if (!SmartTaskScheduler.instance) {
      SmartTaskScheduler.instance = new SmartTaskScheduler();
    }
    return SmartTaskScheduler.instance;
  }

  /**
   * Initialize learning tasks library
   */
  private initializeTasks(): void {
    // Tier 1: Foundation Tasks
    this.addTask({
      id: 'json_parse',
      name: 'JSON Data Parsing',
      description: 'Parse and validate JSON data structures',
      tier: 'foundation',
      complexity: 3,
      category: 'data',
      estimatedDuration: 50,
      learningValue: 10,
    });

    this.addTask({
      id: 'json_transform',
      name: 'JSON Data Transformation',
      description: 'Transform JSON from one schema to another',
      tier: 'foundation',
      complexity: 4,
      category: 'data',
      estimatedDuration: 80,
      learningValue: 12,
    });

    this.addTask({
      id: 'string_manipulation',
      name: 'String Operations',
      description: 'Perform various string manipulations',
      tier: 'foundation',
      complexity: 4,
      category: 'text',
      estimatedDuration: 60,
      learningValue: 11,
    });

    this.addTask({
      id: 'string_search',
      name: 'String Pattern Matching',
      description: 'Search and extract patterns from text',
      tier: 'foundation',
      complexity: 5,
      category: 'text',
      estimatedDuration: 90,
      learningValue: 13,
    });

    this.addTask({
      id: 'file_read',
      name: 'File Reading',
      description: 'Read and process file contents',
      tier: 'foundation',
      complexity: 5,
      category: 'file',
      estimatedDuration: 100,
      learningValue: 14,
    });

    this.addTask({
      id: 'file_write',
      name: 'File Writing',
      description: 'Write data to files with proper formatting',
      tier: 'foundation',
      complexity: 6,
      category: 'file',
      estimatedDuration: 120,
      learningValue: 15,
    });

    // Tier 2: Intermediate Tasks
    this.addTask({
      id: 'data_filter',
      name: 'Data Filtering',
      description: 'Filter and process large datasets',
      tier: 'intermediate',
      complexity: 6,
      category: 'data',
      estimatedDuration: 200,
      prerequisites: ['json_parse', 'json_transform'],
      learningValue: 20,
    });

    this.addTask({
      id: 'data_aggregate',
      name: 'Data Aggregation',
      description: 'Aggregate and summarize data',
      tier: 'intermediate',
      complexity: 7,
      category: 'data',
      estimatedDuration: 250,
      prerequisites: ['data_filter'],
      learningValue: 22,
    });

    this.addTask({
      id: 'api_call',
      name: 'API Request',
      description: 'Make HTTP requests and handle responses',
      tier: 'intermediate',
      complexity: 7,
      category: 'network',
      estimatedDuration: 300,
      prerequisites: ['json_parse'],
      learningValue: 25,
    });

    this.addTask({
      id: 'api_error_handling',
      name: 'API Error Recovery',
      description: 'Handle API errors and implement retry logic',
      tier: 'intermediate',
      complexity: 8,
      category: 'network',
      estimatedDuration: 350,
      prerequisites: ['api_call'],
      learningValue: 28,
    });

    // Tier 3: Advanced Tasks
    this.addTask({
      id: 'workflow_multi_step',
      name: 'Multi-Step Workflow',
      description: 'Execute complex multi-step workflows',
      tier: 'advanced',
      complexity: 8,
      category: 'automation',
      estimatedDuration: 500,
      prerequisites: ['data_filter', 'api_call'],
      learningValue: 35,
    });

    this.addTask({
      id: 'workflow_state',
      name: 'Stateful Workflow Management',
      description: 'Manage workflow state and handle rollbacks',
      tier: 'advanced',
      complexity: 9,
      category: 'automation',
      estimatedDuration: 600,
      prerequisites: ['workflow_multi_step'],
      learningValue: 40,
    });

    this.addTask({
      id: 'code_analysis',
      name: 'Code Analysis',
      description: 'Analyze code quality and suggest improvements',
      tier: 'advanced',
      complexity: 9,
      category: 'code',
      estimatedDuration: 700,
      prerequisites: ['string_search', 'file_read'],
      learningValue: 45,
    });

    this.addTask({
      id: 'code_refactor',
      name: 'Code Refactoring',
      description: 'Refactor code while maintaining functionality',
      tier: 'advanced',
      complexity: 10,
      category: 'code',
      estimatedDuration: 800,
      prerequisites: ['code_analysis'],
      learningValue: 50,
    });

    logger.info(`[Smart Scheduler] Initialized ${this.availableTasks.size} learning tasks`);
  }

  /**
   * Add task to library
   */
  private addTask(task: LearningTask): void {
    this.availableTasks.set(task.id, task);
  }

  /**
   * Get next optimal task based on current progress
   */
  getNextTask(): LearningTask | null {
    const progress = this.getProgress();
    const distribution = this.getTaskDistribution();

    // Get available tasks (prerequisites met)
    const available = this.getAvailableTasks();
    if (available.length === 0) {
      return null;
    }

    // Filter by tier based on distribution
    const tierWeights = distribution;
    const random = Math.random() * 100;
    let targetTier: TaskTier;

    if (random < tierWeights.foundation) {
      targetTier = 'foundation';
    } else if (random < tierWeights.foundation + tierWeights.intermediate) {
      targetTier = 'intermediate';
    } else {
      targetTier = 'advanced';
    }

    // Get tasks from target tier
    let tierTasks = available.filter(t => t.tier === targetTier);
    
    // Fallback to any available if no tasks in target tier
    if (tierTasks.length === 0) {
      tierTasks = available;
    }

    // Select task with highest learning value that hasn't been completed recently
    const recentTasks = this.sessions.slice(-5).map(s => s.task.id);
    const freshTasks = tierTasks.filter(t => !recentTasks.includes(t.id));
    
    const candidates = freshTasks.length > 0 ? freshTasks : tierTasks;
    candidates.sort((a, b) => b.learningValue - a.learningValue);

    return candidates[0] || null;
  }

  /**
   * Get task distribution based on current week
   */
  private getTaskDistribution(): {
    foundation: number;
    intermediate: number;
    advanced: number;
  } {
    if (this.currentWeek === 1) {
      return { foundation: 80, intermediate: 20, advanced: 0 };
    } else if (this.currentWeek === 2) {
      return { foundation: 60, intermediate: 30, advanced: 10 };
    } else if (this.currentWeek === 3) {
      return { foundation: 40, intermediate: 40, advanced: 20 };
    } else {
      return { foundation: 20, intermediate: 50, advanced: 30 };
    }
  }

  /**
   * Get available tasks (prerequisites met)
   */
  private getAvailableTasks(): LearningTask[] {
    const tasks: LearningTask[] = [];

    for (const task of this.availableTasks.values()) {
      // Check if already completed
      if (this.completedTasks.has(task.id)) {
        continue;
      }

      // Check prerequisites
      if (task.prerequisites) {
        const prereqsMet = task.prerequisites.every(prereq => 
          this.completedTasks.has(prereq)
        );
        if (!prereqsMet) {
          continue;
        }
      }

      tasks.push(task);
    }

    return tasks;
  }

  /**
   * Execute a learning task
   */
  async executeTask(task: LearningTask): Promise<LearningSession> {
    logger.info(`\n📚 Learning Task: ${task.name}`);
    logger.info(`   Tier: ${task.tier} | Complexity: ${task.complexity}/10`);
    logger.info(`   Category: ${task.category}`);

    const startTime = Date.now();

    // Execute using quantum autopilot
    const result = await this.quantumAutopilot.executeTask(
      task.description,
      {
        preferredApproach: 'balanced',
        minQuality: this.getMinQualityForTier(task.tier),
      }
    );

    const duration = Date.now() - startTime;

    const session: LearningSession = {
      task,
      success: result.success && result.quality >= this.getMinQualityForTier(task.tier),
      quality: result.quality,
      duration,
      iterationCount: result.iterationCount,
      timestamp: new Date(),
    };

    this.sessions.push(session);

    // Mark as completed if successful
    if (session.success) {
      this.completedTasks.add(task.id);
      
      // Award learning points
      this.rewardSystem.awardPoints(
        task.learningValue,
        `Completed ${task.name} (${task.tier})`
      );
    }

    logger.info(`   ${session.success ? '✅' : '❌'} Quality: ${(session.quality * 100).toFixed(1)}% | Time: ${duration}ms`);

    return session;
  }

  /**
   * Get minimum quality threshold for tier
   */
  private getMinQualityForTier(tier: TaskTier): number {
    switch (tier) {
      case 'foundation':
        return 0.70;
      case 'intermediate':
        return 0.75;
      case 'advanced':
        return 0.80;
    }
  }

  /**
   * Run learning session (execute multiple tasks)
   */
  async runLearningSession(taskCount: number = 5): Promise<LearningSession[]> {
    logger.info(`\n🎓 Starting Learning Session (${taskCount} tasks)`);
    logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const sessions: LearningSession[] = [];

    for (let i = 0; i < taskCount; i++) {
      const task = this.getNextTask();
      
      if (!task) {
        logger.info(`\n⚠️  No more available tasks`);
        break;
      }

      const session = await this.executeTask(task);
      sessions.push(session);

      // Small delay between tasks
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Print session summary
    this.printSessionSummary(sessions);

    return sessions;
  }

  /**
   * Print session summary
   */
  private printSessionSummary(sessions: LearningSession[]): void {
    logger.info(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    logger.info(`📊 Session Summary`);
    logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const successful = sessions.filter(s => s.success).length;
    const avgQuality = sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length;
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;

    logger.info(`Tasks Completed:  ${sessions.length}`);
    logger.info(`Successful:       ${successful} (${((successful / sessions.length) * 100).toFixed(0)}%)`);
    logger.info(`Avg Quality:      ${(avgQuality * 100).toFixed(1)}%`);
    logger.info(`Avg Duration:     ${Math.round(avgDuration)}ms`);
    logger.info('');

    // Progress update
    const progress = this.getProgress();
    logger.info(`Current Progress:`);
    logger.info(`  Total Tasks:    ${progress.totalTasks}`);
    logger.info(`  Success Rate:   ${(progress.successRate * 100).toFixed(1)}%`);
    logger.info(`  Current Tier:   ${progress.currentTier}`);
    logger.info(`  Learning Rate:  ${progress.learningRate.toFixed(2)}`);
    logger.info(`  Streak:         ${progress.streak} 🔥`);
    
    if (progress.readyForNextTier) {
      logger.info(`\n🎉 Ready to advance to next tier!`);
    }
  }

  /**
   * Get learning progress
   */
  getProgress(): LearningProgress {
    const totalTasks = this.sessions.length;
    const successfulTasks = this.sessions.filter(s => s.success).length;
    const successRate = totalTasks > 0 ? successfulTasks / totalTasks : 0;

    const recentSessions = this.sessions.slice(-10);
    const avgQuality = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.quality, 0) / recentSessions.length
      : 0;
    const avgDuration = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length
      : 0;

    // Count tasks per tier
    const tasksPerTier = {
      foundation: this.sessions.filter(s => s.task.tier === 'foundation' && s.success).length,
      intermediate: this.sessions.filter(s => s.task.tier === 'intermediate' && s.success).length,
      advanced: this.sessions.filter(s => s.task.tier === 'advanced' && s.success).length,
    };

    // Determine current tier
    let currentTier: TaskTier = 'foundation';
    if (tasksPerTier.intermediate >= 10) {
      currentTier = 'advanced';
    } else if (tasksPerTier.foundation >= 10) {
      currentTier = 'intermediate';
    }

    // Check if ready for next tier
    let readyForNextTier = false;
    if (currentTier === 'foundation' && tasksPerTier.foundation >= 10 && successRate >= 0.8) {
      readyForNextTier = true;
    } else if (currentTier === 'intermediate' && tasksPerTier.intermediate >= 10 && successRate >= 0.75) {
      readyForNextTier = true;
    }

    // Calculate learning rate (improvement over time)
    const learningRate = this.calculateLearningRate();

    // Calculate streak
    let streak = 0;
    for (let i = this.sessions.length - 1; i >= 0; i--) {
      if (this.sessions[i].success) {
        streak++;
      } else {
        break;
      }
    }

    return {
      totalTasks,
      successfulTasks,
      successRate,
      averageQuality: avgQuality,
      averageDuration: avgDuration,
      currentTier,
      tasksPerTier,
      readyForNextTier,
      learningRate,
      streak,
    };
  }

  /**
   * Calculate learning rate (quality improvement over time)
   */
  private calculateLearningRate(): number {
    if (this.sessions.length < 10) {
      return 0;
    }

    const firstHalf = this.sessions.slice(0, Math.floor(this.sessions.length / 2));
    const secondHalf = this.sessions.slice(Math.floor(this.sessions.length / 2));

    const firstAvg = firstHalf.reduce((sum, s) => sum + s.quality, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.quality, 0) / secondHalf.length;

    return secondAvg - firstAvg;
  }

  /**
   * Advance to next week
   */
  advanceWeek(): void {
    this.currentWeek++;
    logger.info(`\n📅 Advanced to Week ${this.currentWeek}`);
    
    const distribution = this.getTaskDistribution();
    logger.info(`   Task Distribution:`);
    logger.info(`   - Foundation:   ${distribution.foundation}%`);
    logger.info(`   - Intermediate: ${distribution.intermediate}%`);
    logger.info(`   - Advanced:     ${distribution.advanced}%`);
  }

  /**
   * Get detailed statistics
   */
  getDetailedStats(): {
    progress: LearningProgress;
    tasksByCategory: Map<string, number>;
    tasksByTier: Map<TaskTier, number>;
    averageQualityByTier: Map<TaskTier, number>;
    completionRate: number;
  } {
    const progress = this.getProgress();

    // Tasks by category
    const tasksByCategory = new Map<string, number>();
    this.sessions.forEach(s => {
      const count = tasksByCategory.get(s.task.category) || 0;
      tasksByCategory.set(s.task.category, count + 1);
    });

    // Tasks by tier
    const tasksByTier = new Map<TaskTier, number>();
    this.sessions.forEach(s => {
      const count = tasksByTier.get(s.task.tier) || 0;
      tasksByTier.set(s.task.tier, count + 1);
    });

    // Average quality by tier
    const averageQualityByTier = new Map<TaskTier, number>();
    ['foundation', 'intermediate', 'advanced'].forEach(tier => {
      const tierSessions = this.sessions.filter(s => s.task.tier === tier);
      if (tierSessions.length > 0) {
        const avg = tierSessions.reduce((sum, s) => sum + s.quality, 0) / tierSessions.length;
        averageQualityByTier.set(tier as TaskTier, avg);
      }
    });

    // Completion rate
    const completionRate = this.completedTasks.size / this.availableTasks.size;

    return {
      progress,
      tasksByCategory,
      tasksByTier,
      averageQualityByTier,
      completionRate,
    };
  }
}
