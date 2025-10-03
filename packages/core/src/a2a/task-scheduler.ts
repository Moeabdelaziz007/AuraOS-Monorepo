/**
 * Task Scheduler with Progressive Difficulty
 * Manages task distribution with learning-based difficulty adjustment
 */

import { A2AMessage, MessageType, Priority } from './types';

export enum TaskTier {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum TaskCategory {
  DATA_PROCESSING = 'data_processing',
  API_INTEGRATION = 'api_integration',
  UI_GENERATION = 'ui_generation',
  CODE_ANALYSIS = 'code_analysis',
  CONTENT_CREATION = 'content_creation',
  SYSTEM_OPTIMIZATION = 'system_optimization',
  DEBUGGING = 'debugging',
  TESTING = 'testing'
}

export interface Task {
  id: string;
  category: TaskCategory;
  tier: TaskTier;
  title: string;
  description: string;
  estimatedTime: number; // minutes
  learningValue: number; // 0-100
  prerequisites: string[]; // Task IDs
  skills: string[];
  priority: Priority;
  deadline?: number; // timestamp
  metadata?: Record<string, any>;
}

export interface TaskProgress {
  taskId: string;
  agentId: string;
  startTime: number;
  completionPercentage: number;
  currentStep?: string;
  estimatedCompletion?: number;
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  success: boolean;
  completionTime: number; // ms
  quality: number; // 0-100
  learningGained: number; // 0-100
  errors?: string[];
  output?: any;
}

export interface AgentProfile {
  id: string;
  skills: Map<string, number>; // skill -> proficiency (0-100)
  completedTasks: string[];
  currentTier: TaskTier;
  learningRate: number; // 0-1
  successRate: number; // 0-1
  totalExperience: number;
}

export interface TaskSchedulerConfig {
  maxConcurrentTasks: number;
  learningThreshold: number; // XP needed to advance tier
  difficultyAdjustmentRate: number; // How fast to increase difficulty
  enableAdaptiveLearning: boolean;
  taskTimeout: number; // ms
}

export class TaskScheduler {
  private tasks: Map<string, Task> = new Map();
  private agents: Map<string, AgentProfile> = new Map();
  private activeTasks: Map<string, TaskProgress> = new Map();
  private taskQueue: Task[] = [];
  private config: TaskSchedulerConfig;
  private taskHistory: TaskResult[] = [];

  constructor(config: Partial<TaskSchedulerConfig> = {}) {
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks ?? 5,
      learningThreshold: config.learningThreshold ?? 1000,
      difficultyAdjustmentRate: config.difficultyAdjustmentRate ?? 0.1,
      enableAdaptiveLearning: config.enableAdaptiveLearning ?? true,
      taskTimeout: config.taskTimeout ?? 300000 // 5 minutes
    };
  }

  /**
   * Register a new agent in the system
   */
  registerAgent(agentId: string, initialSkills: Record<string, number> = {}): void {
    const profile: AgentProfile = {
      id: agentId,
      skills: new Map(Object.entries(initialSkills)),
      completedTasks: [],
      currentTier: TaskTier.BEGINNER,
      learningRate: 1.0,
      successRate: 0,
      totalExperience: 0
    };
    this.agents.set(agentId, profile);
  }

  /**
   * Add a task to the scheduler
   */
  addTask(task: Task): void {
    this.tasks.set(task.id, task);
    this.taskQueue.push(task);
    this.sortTaskQueue();
  }

  /**
   * Get next suitable task for an agent based on their profile
   */
  getNextTask(agentId: string): Task | null {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not registered`);
    }

    // Check concurrent task limit
    const agentActiveTasks = Array.from(this.activeTasks.values())
      .filter(p => p.agentId === agentId);
    
    if (agentActiveTasks.length >= this.config.maxConcurrentTasks) {
      return null;
    }

    // Find suitable task
    for (const task of this.taskQueue) {
      if (this.isTaskSuitable(task, agent)) {
        // Remove from queue
        const index = this.taskQueue.indexOf(task);
        this.taskQueue.splice(index, 1);
        
        // Mark as active
        this.activeTasks.set(task.id, {
          taskId: task.id,
          agentId,
          startTime: Date.now(),
          completionPercentage: 0
        });
        
        return task;
      }
    }

    return null;
  }

  /**
   * Check if a task is suitable for an agent
   */
  private isTaskSuitable(task: Task, agent: AgentProfile): boolean {
    // Check tier compatibility
    if (!this.isTierCompatible(task.tier, agent.currentTier)) {
      return false;
    }

    // Check prerequisites
    if (task.prerequisites.length > 0) {
      const hasPrereqs = task.prerequisites.every(prereqId =>
        agent.completedTasks.includes(prereqId)
      );
      if (!hasPrereqs) {
        return false;
      }
    }

    // Check skill match
    const skillMatch = this.calculateSkillMatch(task, agent);
    return skillMatch >= 0.3; // At least 30% skill match
  }

  /**
   * Check if task tier is compatible with agent tier
   */
  private isTierCompatible(taskTier: TaskTier, agentTier: TaskTier): boolean {
    const tierOrder = [TaskTier.BEGINNER, TaskTier.INTERMEDIATE, TaskTier.ADVANCED, TaskTier.EXPERT];
    const taskIndex = tierOrder.indexOf(taskTier);
    const agentIndex = tierOrder.indexOf(agentTier);
    
    // Agent can do tasks at their level or one level above
    return taskIndex <= agentIndex + 1;
  }

  /**
   * Calculate how well agent's skills match task requirements
   */
  private calculateSkillMatch(task: Task, agent: AgentProfile): number {
    if (task.skills.length === 0) {
      return 1.0;
    }

    let totalMatch = 0;
    for (const skill of task.skills) {
      const proficiency = agent.skills.get(skill) ?? 0;
      totalMatch += proficiency / 100;
    }

    return totalMatch / task.skills.length;
  }

  /**
   * Update task progress
   */
  updateProgress(taskId: string, progress: Partial<TaskProgress>): void {
    const current = this.activeTasks.get(taskId);
    if (!current) {
      throw new Error(`Task ${taskId} is not active`);
    }

    this.activeTasks.set(taskId, {
      ...current,
      ...progress
    });
  }

  /**
   * Complete a task and update agent profile
   */
  completeTask(result: TaskResult): void {
    const task = this.tasks.get(result.taskId);
    const agent = this.agents.get(result.agentId);
    
    if (!task || !agent) {
      throw new Error('Task or agent not found');
    }

    // Remove from active tasks
    this.activeTasks.delete(result.taskId);

    // Record result
    this.taskHistory.push(result);

    if (result.success) {
      // Update agent profile
      agent.completedTasks.push(result.taskId);
      agent.totalExperience += result.learningGained;

      // Update skills
      for (const skill of task.skills) {
        const current = agent.skills.get(skill) ?? 0;
        const improvement = result.learningGained * agent.learningRate * 0.1;
        agent.skills.set(skill, Math.min(100, current + improvement));
      }

      // Update success rate
      const totalTasks = agent.completedTasks.length;
      const successfulTasks = this.taskHistory.filter(
        r => r.agentId === result.agentId && r.success
      ).length;
      agent.successRate = successfulTasks / totalTasks;

      // Check for tier advancement
      if (this.config.enableAdaptiveLearning) {
        this.checkTierAdvancement(agent);
      }
    }
  }

  /**
   * Check if agent should advance to next tier
   */
  private checkTierAdvancement(agent: AgentProfile): void {
    const tierOrder = [TaskTier.BEGINNER, TaskTier.INTERMEDIATE, TaskTier.ADVANCED, TaskTier.EXPERT];
    const currentIndex = tierOrder.indexOf(agent.currentTier);
    
    if (currentIndex === tierOrder.length - 1) {
      return; // Already at max tier
    }

    const requiredXP = this.config.learningThreshold * (currentIndex + 1);
    const requiredSuccessRate = 0.7 + (currentIndex * 0.1);

    if (agent.totalExperience >= requiredXP && agent.successRate >= requiredSuccessRate) {
      agent.currentTier = tierOrder[currentIndex + 1];
      console.log(`Agent ${agent.id} advanced to ${agent.currentTier}`);
    }
  }

  /**
   * Calculate learning value of a task for an agent
   */
  calculateLearningValue(task: Task, agent: AgentProfile): number {
    const skillMatch = this.calculateSkillMatch(task, agent);
    const tierDiff = this.getTierDifference(task.tier, agent.currentTier);
    
    // Higher learning value for tasks slightly above current skill level
    let learningValue = task.learningValue;
    
    if (skillMatch < 0.5) {
      // Task is challenging - higher learning value
      learningValue *= 1.5;
    } else if (skillMatch > 0.9) {
      // Task is too easy - lower learning value
      learningValue *= 0.5;
    }
    
    // Bonus for tier advancement
    if (tierDiff === 1) {
      learningValue *= 1.3;
    }
    
    return Math.min(100, learningValue);
  }

  /**
   * Get difference between task tier and agent tier
   */
  private getTierDifference(taskTier: TaskTier, agentTier: TaskTier): number {
    const tierOrder = [TaskTier.BEGINNER, TaskTier.INTERMEDIATE, TaskTier.ADVANCED, TaskTier.EXPERT];
    return tierOrder.indexOf(taskTier) - tierOrder.indexOf(agentTier);
  }

  /**
   * Sort task queue by priority and learning value
   */
  private sortTaskQueue(): void {
    this.taskQueue.sort((a, b) => {
      // First by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Then by learning value
      return b.learningValue - a.learningValue;
    });
  }

  /**
   * Get agent statistics
   */
  getAgentStats(agentId: string): AgentProfile | null {
    return this.agents.get(agentId) ?? null;
  }

  /**
   * Get scheduler statistics
   */
  getStats() {
    return {
      totalTasks: this.tasks.size,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      completedTasks: this.taskHistory.filter(r => r.success).length,
      totalAgents: this.agents.size,
      averageSuccessRate: this.calculateAverageSuccessRate()
    };
  }

  /**
   * Calculate average success rate across all agents
   */
  private calculateAverageSuccessRate(): number {
    if (this.agents.size === 0) return 0;
    
    let total = 0;
    for (const agent of this.agents.values()) {
      total += agent.successRate;
    }
    
    return total / this.agents.size;
  }

  /**
   * Get recommended tasks for an agent
   */
  getRecommendedTasks(agentId: string, limit: number = 5): Task[] {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not registered`);
    }

    const suitable = this.taskQueue
      .filter(task => this.isTaskSuitable(task, agent))
      .map(task => ({
        task,
        learningValue: this.calculateLearningValue(task, agent)
      }))
      .sort((a, b) => b.learningValue - a.learningValue)
      .slice(0, limit)
      .map(item => item.task);

    return suitable;
  }

  /**
   * Cancel an active task
   */
  cancelTask(taskId: string): void {
    const progress = this.activeTasks.get(taskId);
    if (!progress) {
      throw new Error(`Task ${taskId} is not active`);
    }

    this.activeTasks.delete(taskId);
    
    // Return task to queue
    const task = this.tasks.get(taskId);
    if (task) {
      this.taskQueue.push(task);
      this.sortTaskQueue();
    }
  }

  /**
   * Clean up timed out tasks
   */
  cleanupTimedOutTasks(): void {
    const now = Date.now();
    const timedOut: string[] = [];

    for (const [taskId, progress] of this.activeTasks.entries()) {
      if (now - progress.startTime > this.config.taskTimeout) {
        timedOut.push(taskId);
      }
    }

    for (const taskId of timedOut) {
      console.warn(`Task ${taskId} timed out`);
      this.cancelTask(taskId);
    }
  }
}
