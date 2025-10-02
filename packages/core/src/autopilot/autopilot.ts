/**
 * Autopilot System
 * Autonomous agent powered by learning loop
 * Brain: Learning Engine | Body: Autopilot Executor
 */

import type {
  AutopilotTask,
  AutopilotStep,
  AutopilotCapability,
  AutopilotContext,
  AutopilotDecision,
  AutopilotLearning,
  AutopilotConfig,
} from './types';
import { LearningEngine } from '../learning/engine';
import { BehaviorTracker } from '../learning/tracker';
import { learningStorage } from '../learning/storage';

export class AutopilotSystem {
  private userId: string;
  private learningEngine: LearningEngine;
  private tracker: BehaviorTracker;
  private config: AutopilotConfig;
  private activeTasks: Map<string, AutopilotTask> = new Map();
  private capabilities: Map<string, AutopilotCapability> = new Map();
  private taskHistory: AutopilotLearning[] = [];

  constructor(userId: string, tracker: BehaviorTracker) {
    this.userId = userId;
    this.learningEngine = new LearningEngine(userId);
    this.tracker = tracker;
    this.config = {
      mode: 'assisted',
      autoApprove: false,
      maxConcurrentTasks: 3,
      learningEnabled: true,
      riskTolerance: 'medium',
      notifyOnCompletion: true,
    };

    this.initializeCapabilities();
  }

  /**
   * Initialize autopilot system
   */
  async init(): Promise<void> {
    await this.learningEngine.init();
    await this.loadTaskHistory();
    console.log('🤖 Autopilot System initialized');
  }

  /**
   * Initialize available capabilities
   */
  private initializeCapabilities(): void {
    const capabilities: AutopilotCapability[] = [
      {
        id: 'open_app',
        name: 'Open Application',
        description: 'Open any application',
        category: 'app',
        complexity: 'simple',
        successRate: 0.95,
        usageCount: 0,
        avgDuration: 500,
      },
      {
        id: 'close_app',
        name: 'Close Application',
        description: 'Close any application',
        category: 'app',
        complexity: 'simple',
        successRate: 0.98,
        usageCount: 0,
        avgDuration: 300,
      },
      {
        id: 'create_file',
        name: 'Create File',
        description: 'Create a new file',
        category: 'file',
        complexity: 'simple',
        successRate: 0.92,
        usageCount: 0,
        avgDuration: 800,
      },
      {
        id: 'read_file',
        name: 'Read File',
        description: 'Read file contents',
        category: 'file',
        complexity: 'simple',
        successRate: 0.96,
        usageCount: 0,
        avgDuration: 600,
      },
      {
        id: 'write_file',
        name: 'Write File',
        description: 'Write to a file',
        category: 'file',
        complexity: 'medium',
        successRate: 0.90,
        usageCount: 0,
        avgDuration: 1000,
      },
      {
        id: 'ai_query',
        name: 'AI Query',
        description: 'Query AI assistant',
        category: 'ai',
        complexity: 'medium',
        successRate: 0.88,
        usageCount: 0,
        avgDuration: 2000,
      },
      {
        id: 'execute_workflow',
        name: 'Execute Workflow',
        description: 'Run automation workflow',
        category: 'automation',
        complexity: 'complex',
        successRate: 0.85,
        usageCount: 0,
        avgDuration: 5000,
      },
      {
        id: 'analyze_data',
        name: 'Analyze Data',
        description: 'Analyze data patterns',
        category: 'data',
        complexity: 'complex',
        successRate: 0.82,
        usageCount: 0,
        avgDuration: 3000,
      },
    ];

    capabilities.forEach((cap) => this.capabilities.set(cap.id, cap));
  }

  /**
   * Create a new task from natural language
   */
  async createTask(description: string, priority: AutopilotTask['priority'] = 'medium'): Promise<AutopilotTask> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Use learning engine to understand the task
    const pattern = this.learningEngine.getPattern();
    const context = await this.getContext();

    // Plan the task using learned patterns
    const steps = await this.planTask(description, pattern, context);

    // Check if we've done similar tasks before
    const learnedFrom = await this.findSimilarTasks(description);

    // Calculate confidence based on past experience
    const confidence = this.calculateTaskConfidence(steps, learnedFrom);

    const task: AutopilotTask = {
      id: taskId,
      userId: this.userId,
      description,
      status: 'pending',
      priority,
      createdAt: Date.now(),
      steps,
      currentStep: 0,
      confidence,
      learnedFrom,
    };

    this.activeTasks.set(taskId, task);

    // Track task creation
    await this.tracker.trackSuccess('task_created', description);

    return task;
  }

  /**
   * Plan task steps using AI and learned patterns
   */
  private async planTask(
    description: string,
    pattern: any,
    context: AutopilotContext
  ): Promise<AutopilotStep[]> {
    const steps: AutopilotStep[] = [];

    // Simple NLP to extract intent
    const lowerDesc = description.toLowerCase();

    // Pattern: "open [app]"
    if (lowerDesc.includes('open')) {
      const appMatch = lowerDesc.match(/open\s+(\w+)/);
      if (appMatch) {
        steps.push({
          id: `step-${Date.now()}-1`,
          action: 'open_app',
          params: { appId: appMatch[1] },
          status: 'pending',
          confidence: 0.9,
        });
      }
    }

    // Pattern: "create file [name]"
    if (lowerDesc.includes('create') && lowerDesc.includes('file')) {
      const fileMatch = lowerDesc.match(/file\s+(\S+)/);
      steps.push({
        id: `step-${Date.now()}-2`,
        action: 'create_file',
        params: { filename: fileMatch ? fileMatch[1] : 'untitled.txt' },
        status: 'pending',
        confidence: 0.85,
      });
    }

    // Pattern: "write [content] to [file]"
    if (lowerDesc.includes('write')) {
      const contentMatch = lowerDesc.match(/write\s+"([^"]+)"/);
      const fileMatch = lowerDesc.match(/to\s+(\S+)/);
      if (contentMatch && fileMatch) {
        steps.push({
          id: `step-${Date.now()}-3`,
          action: 'write_file',
          params: {
            filename: fileMatch[1],
            content: contentMatch[1],
          },
          status: 'pending',
          confidence: 0.88,
        });
      }
    }

    // Pattern: "ask AI [question]"
    if (lowerDesc.includes('ask') || lowerDesc.includes('query')) {
      const questionMatch = lowerDesc.match(/(?:ask|query)\s+(?:ai\s+)?(.+)/);
      if (questionMatch) {
        steps.push({
          id: `step-${Date.now()}-4`,
          action: 'ai_query',
          params: { query: questionMatch[1] },
          status: 'pending',
          confidence: 0.87,
        });
      }
    }

    // If no steps were generated, create a generic AI query step
    if (steps.length === 0) {
      steps.push({
        id: `step-${Date.now()}-5`,
        action: 'ai_query',
        params: { query: description },
        status: 'pending',
        confidence: 0.7,
      });
    }

    // Learn from similar past tasks to improve steps
    const similarTasks = await this.findSimilarTasks(description);
    if (similarTasks.length > 0) {
      // Boost confidence if we've done this before successfully
      steps.forEach((step) => {
        step.confidence = Math.min(0.95, step.confidence + 0.1);
      });
    }

    return steps;
  }

  /**
   * Make decision about task execution
   */
  async makeDecision(taskId: string): Promise<AutopilotDecision> {
    const task = this.activeTasks.get(taskId);
    if (!task) throw new Error('Task not found');

    const context = await this.getContext();
    const risks: string[] = [];
    const benefits: string[] = [];

    // Analyze risks based on task complexity
    const complexSteps = task.steps.filter((s) => {
      const cap = this.capabilities.get(s.action);
      return cap && cap.complexity === 'complex';
    });

    if (complexSteps.length > 0) {
      risks.push('Task contains complex operations');
    }

    if (task.confidence < 0.7) {
      risks.push('Low confidence in task execution');
    }

    if (context.systemState.activeWindows > 5) {
      risks.push('System is busy with multiple windows');
    }

    // Analyze benefits
    if (task.learnedFrom && task.learnedFrom.length > 0) {
      benefits.push('Similar tasks completed successfully before');
    }

    if (task.confidence > 0.85) {
      benefits.push('High confidence in successful execution');
    }

    // Calculate estimated duration
    const estimatedDuration = task.steps.reduce((sum, step) => {
      const cap = this.capabilities.get(step.action);
      return sum + (cap?.avgDuration || 1000);
    }, 0);

    // Make decision based on mode and risk tolerance
    let decision: AutopilotDecision['decision'] = 'ask_user';

    if (this.config.mode === 'autonomous' && this.config.autoApprove) {
      if (task.confidence > 0.8 && risks.length === 0) {
        decision = 'execute';
      } else if (task.confidence > 0.6 && this.config.riskTolerance === 'high') {
        decision = 'execute';
      }
    } else if (this.config.mode === 'assisted') {
      if (task.confidence > 0.9 && risks.length === 0) {
        decision = 'execute';
      }
    }

    return {
      taskId,
      decision,
      reason: this.getDecisionReason(decision, task, risks, benefits),
      confidence: task.confidence,
      estimatedDuration,
      risks,
      benefits,
    };
  }

  /**
   * Execute a task
   */
  async executeTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) throw new Error('Task not found');

    task.status = 'executing';
    task.startedAt = Date.now();

    const startTime = Date.now();

    try {
      for (let i = 0; i < task.steps.length; i++) {
        task.currentStep = i;
        const step = task.steps[i];

        step.status = 'executing';
        const stepStartTime = Date.now();

        try {
          // Execute the step
          const result = await this.executeStep(step);
          
          step.result = result;
          step.status = 'completed';
          step.duration = Date.now() - stepStartTime;

          // Track success
          await this.tracker.trackSuccess(step.action, task.description);

          // Update capability stats
          this.updateCapabilityStats(step.action, true, step.duration);
        } catch (error) {
          step.status = 'failed';
          step.error = error instanceof Error ? error.message : 'Unknown error';
          step.duration = Date.now() - stepStartTime;

          // Track error
          await this.tracker.trackError(step.error, step.action);

          // Update capability stats
          this.updateCapabilityStats(step.action, false, step.duration);

          throw error;
        }
      }

      task.status = 'completed';
      task.completedAt = Date.now();

      // Learn from successful execution
      await this.learnFromTask(task, true, Date.now() - startTime);

      // Notify user if configured
      if (this.config.notifyOnCompletion) {
        this.notifyUser('Task completed successfully', task.description);
      }
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = Date.now();

      // Learn from failure
      await this.learnFromTask(task, false, Date.now() - startTime);

      throw error;
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: AutopilotStep): Promise<any> {
    const capability = this.capabilities.get(step.action);
    if (!capability) {
      throw new Error(`Unknown capability: ${step.action}`);
    }

    // Simulate execution (in real implementation, this would call actual functions)
    await new Promise((resolve) => setTimeout(resolve, capability.avgDuration));

    // Return mock result based on action
    switch (step.action) {
      case 'open_app':
        return { success: true, appId: step.params.appId };
      case 'create_file':
        return { success: true, filename: step.params.filename };
      case 'write_file':
        return { success: true, bytesWritten: step.params.content.length };
      case 'ai_query':
        return { success: true, response: 'AI response to: ' + step.params.query };
      default:
        return { success: true };
    }
  }

  /**
   * Learn from task execution
   */
  private async learnFromTask(task: AutopilotTask, success: boolean, duration: number): Promise<void> {
    if (!this.config.learningEnabled) return;

    const learning: AutopilotLearning = {
      taskId: task.id,
      success,
      duration,
      stepsExecuted: task.steps.filter((s) => s.status === 'completed').length,
      improvements: [],
      patterns: [],
      timestamp: Date.now(),
    };

    // Identify improvements
    if (!success) {
      const failedStep = task.steps.find((s) => s.status === 'failed');
      if (failedStep) {
        learning.improvements.push(`Improve ${failedStep.action} reliability`);
      }
    }

    // Identify patterns
    const actionSequence = task.steps.map((s) => s.action).join(' -> ');
    learning.patterns.push(actionSequence);

    this.taskHistory.push(learning);

    // Trigger learning engine analysis
    await this.learningEngine.analyzeAndLearn();

    console.log(`📚 Learned from task: ${task.description} (${success ? 'success' : 'failure'})`);
  }

  /**
   * Find similar tasks from history
   */
  private async findSimilarTasks(description: string): Promise<string[]> {
    const similar: string[] = [];
    const lowerDesc = description.toLowerCase();

    for (const learning of this.taskHistory) {
      if (learning.success) {
        // Simple similarity check (in real implementation, use better NLP)
        const task = Array.from(this.activeTasks.values()).find((t) => t.id === learning.taskId);
        if (task && task.description.toLowerCase().includes(lowerDesc.split(' ')[0])) {
          similar.push(learning.taskId);
        }
      }
    }

    return similar;
  }

  /**
   * Calculate task confidence based on past experience
   */
  private calculateTaskConfidence(steps: AutopilotStep[], learnedFrom: string[]): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on step confidence
    const avgStepConfidence = steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length;
    confidence += avgStepConfidence * 0.3;

    // Boost confidence based on similar past tasks
    if (learnedFrom.length > 0) {
      confidence += Math.min(0.2, learnedFrom.length * 0.05);
    }

    // Boost confidence based on capability success rates
    const avgSuccessRate =
      steps.reduce((sum, s) => {
        const cap = this.capabilities.get(s.action);
        return sum + (cap?.successRate || 0.5);
      }, 0) / steps.length;
    confidence += avgSuccessRate * 0.2;

    return Math.min(0.95, confidence);
  }

  /**
   * Get current context
   */
  private async getContext(): Promise<AutopilotContext> {
    const now = new Date();
    const hour = now.getHours();

    return {
      userId: this.userId,
      sessionId: `session-${Date.now()}`,
      currentApps: [], // TODO: Get from window manager
      recentActions: [], // TODO: Get from tracker
      userPatterns: this.learningEngine.getPattern(),
      systemState: {
        memory: 0.5, // TODO: Get actual system stats
        cpu: 0.3,
        activeWindows: 2,
      },
      timeContext: {
        timeOfDay: hour >= 9 && hour < 17 ? 'working' : 'personal',
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()],
        isWorkingHours: hour >= 9 && hour < 17,
      },
    };
  }

  /**
   * Update capability statistics
   */
  private updateCapabilityStats(capabilityId: string, success: boolean, duration: number): void {
    const cap = this.capabilities.get(capabilityId);
    if (!cap) return;

    cap.usageCount++;
    cap.lastUsed = Date.now();
    cap.avgDuration = (cap.avgDuration * (cap.usageCount - 1) + duration) / cap.usageCount;

    if (success) {
      cap.successRate = (cap.successRate * (cap.usageCount - 1) + 1) / cap.usageCount;
    } else {
      cap.successRate = (cap.successRate * (cap.usageCount - 1)) / cap.usageCount;
    }
  }

  /**
   * Get decision reason
   */
  private getDecisionReason(
    decision: AutopilotDecision['decision'],
    task: AutopilotTask,
    risks: string[],
    benefits: string[]
  ): string {
    switch (decision) {
      case 'execute':
        return `High confidence (${(task.confidence * 100).toFixed(0)}%) and ${benefits.length} benefits identified`;
      case 'ask_user':
        return `Requires user approval due to ${risks.length > 0 ? risks[0] : 'safety protocols'}`;
      case 'defer':
        return 'System is busy, will retry later';
      case 'reject':
        return `Cannot execute: ${risks.join(', ')}`;
      default:
        return 'Unknown decision';
    }
  }

  /**
   * Notify user
   */
  private notifyUser(title: string, message: string): void {
    console.log(`🔔 ${title}: ${message}`);
    // TODO: Implement actual notification system
  }

  /**
   * Load task history
   */
  private async loadTaskHistory(): Promise<void> {
    // TODO: Load from storage
    this.taskHistory = [];
  }

  /**
   * Get active tasks
   */
  getActiveTasks(): AutopilotTask[] {
    return Array.from(this.activeTasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): AutopilotTask | undefined {
    return this.activeTasks.get(taskId);
  }

  /**
   * Get capabilities
   */
  getCapabilities(): AutopilotCapability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AutopilotConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): AutopilotConfig {
    return { ...this.config };
  }

  /**
   * Get learning engine (brain)
   */
  getBrain(): LearningEngine {
    return this.learningEngine;
  }

  /**
   * Get task history
   */
  getTaskHistory(): AutopilotLearning[] {
    return [...this.taskHistory];
  }
}
