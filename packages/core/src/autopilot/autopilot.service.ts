/**
 * Autopilot Service
 * Simple learning system that starts with basic tasks and learns from user behavior
 */

import {
  LearnedTask,
  TaskAction,
  TaskExecutionResult,
  AutopilotSuggestion,
  LearningContext,
  TaskCategory,
} from './types';
import { SIMPLE_TASK_TEMPLATES, getLearnableTasks } from './simple-tasks';
import { IAutopilotStorage, createAutopilotStorage, AutopilotData } from './storage';

/**
 * Autopilot Learning Service
 * Starts with simple pre-defined tasks and learns patterns from user behavior
 */
export class AutopilotService {
  private learnedTasks: Map<string, LearnedTask> = new Map();
  private executionHistory: TaskExecutionResult[] = [];
  private suggestions: AutopilotSuggestion[] = [];
  private isLearning: boolean = true;
  private storage: IAutopilotStorage;
  private autoSaveEnabled: boolean = true;
  private saveDebounceTimer: NodeJS.Timeout | null = null;

  constructor(storage?: IAutopilotStorage) {
    this.storage = storage || createAutopilotStorage();
    this.initialize();
  }

  /**
   * Initialize autopilot - load saved data or start fresh
   */
  private async initialize(): Promise<void> {
    try {
      const savedData = await this.storage.load();
      
      if (savedData) {
        this.loadFromData(savedData);
        logger.info('[Autopilot] Loaded saved learning data');
      } else {
        this.initializeSimpleTasks();
      }
    } catch (error) {
      logger.error('[Autopilot] Failed to load saved data, starting fresh:', error);
      this.initializeSimpleTasks();
    }
  }

  /**
   * Load autopilot state from saved data
   */
  private loadFromData(data: AutopilotData): void {
    this.learnedTasks.clear();
    data.tasks.forEach(task => {
      this.learnedTasks.set(task.id, task);
    });
    
    this.executionHistory = data.executionHistory;
    this.suggestions = data.suggestions;
    
    logger.info(`[Autopilot] Restored ${this.learnedTasks.size} tasks and ${this.executionHistory.length} execution records`);
  }

  /**
   * Initialize with simple task templates
   */
  private initializeSimpleTasks(): void {
    const learnableTasks = getLearnableTasks();
    
    learnableTasks.forEach((template, index) => {
      const task: LearnedTask = {
        id: `task_${index}_${Date.now()}`,
        name: template.name,
        category: template.category,
        complexity: 'simple',
        trigger: {
          type: 'manual',
          pattern: template.name.toLowerCase(),
          confidence: 0.5, // Start with medium confidence
        },
        actions: template.actions,
        timesExecuted: 0,
        successRate: 0,
        createdAt: new Date(),
        enabled: true,
      };
      
      this.learnedTasks.set(task.id, task);
    });

    logger.info(`[Autopilot] Initialized with ${this.learnedTasks.size} simple tasks`);
  }

  /**
   * Get all learned tasks
   */
  getTasks(): LearnedTask[] {
    return Array.from(this.learnedTasks.values());
  }

  /**
   * Get tasks by category
   */
  getTasksByCategory(category: TaskCategory): LearnedTask[] {
    return this.getTasks().filter(task => task.category === category);
  }

  /**
   * Get enabled tasks only
   */
  getEnabledTasks(): LearnedTask[] {
    return this.getTasks().filter(task => task.enabled);
  }

  /**
   * Execute a learned task
   */
  async executeTask(taskId: string): Promise<TaskExecutionResult> {
    const task = this.learnedTasks.get(taskId);
    
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (!task.enabled) {
      throw new Error(`Task is disabled: ${task.name}`);
    }

    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      logger.info(`[Autopilot] Executing task: ${task.name}`);
      
      // Execute each action in sequence
      for (const action of task.actions) {
        await this.executeAction(action);
      }
      
      success = true;
      logger.info(`[Autopilot] Task completed: ${task.name}`);
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`[Autopilot] Task failed: ${task.name}`, error);
    }

    const duration = Date.now() - startTime;
    
    // Record execution result
    const result: TaskExecutionResult = {
      taskId,
      success,
      duration,
      error,
      timestamp: new Date(),
    };
    
    this.executionHistory.push(result);
    
    // Update task statistics
    this.updateTaskStats(taskId, success);
    
    // Auto-save after execution
    this.scheduleAutoSave();
    
    return result;
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: TaskAction): Promise<void> {
    logger.info(`[Autopilot] Action: ${action.type}`, action.target || action.value);
    
    // Simulate action execution
    // In real implementation, this would interact with the UI
    switch (action.type) {
      case 'wait':
        await new Promise(resolve => setTimeout(resolve, action.delay || 0));
        break;
      
      case 'click':
        // Simulate click
        logger.info(`  → Click: ${action.target}`);
        break;
      
      case 'type':
        // Simulate typing
        logger.info(`  → Type: ${action.value}`);
        break;
      
      case 'open':
        // Simulate opening app
        logger.info(`  → Open: ${action.target}`);
        break;
      
      case 'close':
        // Simulate closing
        logger.info(`  → Close: ${action.target}`);
        break;
      
      case 'navigate':
        // Simulate navigation
        logger.info(`  → Navigate: ${action.target}`);
        break;
    }
    
    // Small delay between actions
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Update task statistics after execution
   */
  private updateTaskStats(taskId: string, success: boolean): void {
    const task = this.learnedTasks.get(taskId);
    if (!task) return;

    task.timesExecuted++;
    task.lastExecuted = new Date();
    
    // Update success rate (exponential moving average)
    const alpha = 0.2; // Learning rate
    const newSuccess = success ? 1 : 0;
    task.successRate = task.successRate * (1 - alpha) + newSuccess * alpha;
    
    // Increase confidence if successful
    if (success && task.trigger.confidence < 0.95) {
      task.trigger.confidence = Math.min(0.95, task.trigger.confidence + 0.05);
    }
    
    logger.info(`[Autopilot] Task stats updated: ${task.name}`, {
      executed: task.timesExecuted,
      successRate: task.successRate.toFixed(2),
      confidence: task.trigger.confidence.toFixed(2),
    });
  }

  /**
   * Learn from user action sequence
   */
  learnFromUserActions(actions: TaskAction[], context: LearningContext): void {
    if (!this.isLearning) return;

    logger.info('[Autopilot] Learning from user actions:', actions.length);
    
    // Simple pattern recognition
    // Check if actions match any existing task
    const matchingTask = this.findMatchingTask(actions);
    
    if (matchingTask) {
      // Reinforce existing task
      logger.info(`[Autopilot] Reinforcing task: ${matchingTask.name}`);
      matchingTask.trigger.confidence = Math.min(0.95, matchingTask.trigger.confidence + 0.1);
    } else if (actions.length >= 2 && actions.length <= 5) {
      // Create new task if sequence is reasonable length
      this.createNewTask(actions, context);
    }
  }

  /**
   * Find task that matches action sequence
   */
  private findMatchingTask(actions: TaskAction[]): LearnedTask | undefined {
    for (const task of this.learnedTasks.values()) {
      if (this.actionsMatch(task.actions, actions)) {
        return task;
      }
    }
    return undefined;
  }

  /**
   * Check if two action sequences match
   */
  private actionsMatch(actions1: TaskAction[], actions2: TaskAction[]): boolean {
    if (actions1.length !== actions2.length) return false;
    
    return actions1.every((action, index) => {
      const other = actions2[index];
      return action.type === other.type && action.target === other.target;
    });
  }

  /**
   * Create new learned task from user actions
   */
  private createNewTask(actions: TaskAction[], context: LearningContext): void {
    const taskId = `learned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const taskName = this.generateTaskName(actions, context);
    
    const newTask: LearnedTask = {
      id: taskId,
      name: taskName,
      category: this.inferCategory(actions),
      complexity: actions.length <= 3 ? 'simple' : 'medium',
      trigger: {
        type: 'sequence',
        pattern: actions.map(a => a.type).join('->'),
        confidence: 0.3, // Start with low confidence for new tasks
      },
      actions,
      timesExecuted: 1, // User just did it
      successRate: 1.0,
      createdAt: new Date(),
      lastExecuted: new Date(),
      enabled: false, // Disabled until user approves
    };
    
    this.learnedTasks.set(taskId, newTask);
    
    logger.info(`[Autopilot] New task learned: ${taskName}`);
    
    // Create suggestion for user
    this.createSuggestion(newTask);
    
    // Auto-save after learning
    this.scheduleAutoSave();
  }

  /**
   * Generate task name from actions
   */
  private generateTaskName(actions: TaskAction[], context: LearningContext): string {
    const firstAction = actions[0];
    const lastAction = actions[actions.length - 1];
    
    if (firstAction.type === 'open' && firstAction.target) {
      return `Open ${firstAction.target}`;
    }
    
    if (actions.some(a => a.type === 'type')) {
      return 'Custom Text Input';
    }
    
    return `Custom Task (${actions.length} steps)`;
  }

  /**
   * Infer task category from actions
   */
  private inferCategory(actions: TaskAction[]): TaskCategory {
    const types = actions.map(a => a.type);
    
    if (types.includes('open')) return 'app_launch';
    if (types.includes('type')) return 'text_input';
    if (types.includes('navigate')) return 'navigation';
    
    return 'system_action';
  }

  /**
   * Create suggestion for user
   */
  private createSuggestion(task: LearnedTask): void {
    const suggestion: AutopilotSuggestion = {
      id: `suggestion_${Date.now()}`,
      taskId: task.id,
      taskName: task.name,
      reason: 'I noticed you performed this sequence. Would you like me to remember it?',
      confidence: task.trigger.confidence,
      timestamp: new Date(),
    };
    
    this.suggestions.push(suggestion);
  }

  /**
   * Get pending suggestions
   */
  getSuggestions(): AutopilotSuggestion[] {
    return this.suggestions.filter(s => s.accepted === undefined);
  }

  /**
   * Accept a suggestion
   */
  acceptSuggestion(suggestionId: string): void {
    const suggestion = this.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    suggestion.accepted = true;
    
    const task = this.learnedTasks.get(suggestion.taskId);
    if (task) {
      task.enabled = true;
      task.trigger.confidence = Math.min(0.8, task.trigger.confidence + 0.2);
      logger.info(`[Autopilot] Task enabled: ${task.name}`);
    }
  }

  /**
   * Reject a suggestion
   */
  rejectSuggestion(suggestionId: string): void {
    const suggestion = this.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    suggestion.accepted = false;
    
    const task = this.learnedTasks.get(suggestion.taskId);
    if (task) {
      // Remove the task
      this.learnedTasks.delete(suggestion.taskId);
      logger.info(`[Autopilot] Task rejected and removed: ${task.name}`);
    }
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 10): TaskExecutionResult[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Get task statistics
   */
  getTaskStats(taskId: string) {
    const task = this.learnedTasks.get(taskId);
    if (!task) return null;
    
    const executions = this.executionHistory.filter(e => e.taskId === taskId);
    const successful = executions.filter(e => e.success).length;
    const failed = executions.length - successful;
    const avgDuration = executions.length > 0
      ? executions.reduce((sum, e) => sum + e.duration, 0) / executions.length
      : 0;
    
    return {
      task,
      executions: executions.length,
      successful,
      failed,
      avgDuration: Math.round(avgDuration),
      lastExecution: executions[executions.length - 1],
    };
  }

  /**
   * Enable/disable learning mode
   */
  setLearningMode(enabled: boolean): void {
    this.isLearning = enabled;
    logger.info(`[Autopilot] Learning mode: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Get overall autopilot statistics
   */
  getStats(): AutopilotStats {
    const tasks = Array.from(this.learnedTasks.values());
    const totalExecutions = this.executionHistory.length;
    const successfulExecutions = this.executionHistory.filter(e => e.success).length;
    
    return {
      totalTasks: tasks.length,
      enabledTasks: tasks.filter(t => t.enabled).length,
      totalExecutions,
      successfulExecutions,
      failedExecutions: totalExecutions - successfulExecutions,
      averageSuccessRate: totalExecutions > 0 ? successfulExecutions / totalExecutions : 0,
      learningEnabled: this.isLearning,
    };
  }

  /**
   * Save current state to storage
   */
  async saveState(): Promise<void> {
    try {
      const data: AutopilotData = {
        tasks: Array.from(this.learnedTasks.values()),
        executionHistory: this.executionHistory,
        suggestions: this.suggestions,
        stats: this.getStats(),
        lastUpdated: new Date(),
      };

      await this.storage.save(data);
      logger.info('[Autopilot] State saved successfully');
    } catch (error) {
      logger.error('[Autopilot] Failed to save state:', error);
      throw error;
    }
  }

  /**
   * Auto-save with debouncing to avoid excessive writes
   */
  private scheduleAutoSave(): void {
    if (!this.autoSaveEnabled) return;

    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = setTimeout(() => {
      this.saveState().catch(error => {
        logger.error('[Autopilot] Auto-save failed:', error);
      });
    }, 2000); // Save 2 seconds after last change
  }

  /**
   * Enable/disable auto-save
   */
  setAutoSave(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
    logger.info(`[Autopilot] Auto-save: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Export learning data
   */
  async exportData(): Promise<string> {
    return await this.storage.exportData();
  }

  /**
   * Import learning data
   */
  async importData(jsonData: string): Promise<void> {
    await this.storage.importData(jsonData);
    const data = await this.storage.load();
    if (data) {
      this.loadFromData(data);
    }
  }

  /**
   * Clear all learning data
   */
  async clearAllData(): Promise<void> {
    await this.storage.clear();
    this.learnedTasks.clear();
    this.executionHistory = [];
    this.suggestions = [];
    this.initializeSimpleTasks();
    logger.info('[Autopilot] All data cleared, reinitialized with simple tasks');
  }

  /**
   * Get learning status
   */
  isLearningEnabled(): boolean {
    return this.isLearning;
  }

  /**
   * Clear all learned tasks (keep simple templates)
   */
  resetLearning(): void {
    const simpleTasks = this.getTasks().filter(t => t.complexity === 'simple');
    this.learnedTasks.clear();
    
    simpleTasks.forEach(task => {
      this.learnedTasks.set(task.id, task);
    });
    
    this.executionHistory = [];
    this.suggestions = [];
    
    logger.info('[Autopilot] Learning reset to simple tasks');
  }
}

// Export singleton instance
export const autopilotService = new AutopilotService();
