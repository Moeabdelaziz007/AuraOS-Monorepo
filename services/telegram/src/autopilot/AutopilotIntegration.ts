/**
 * Autopilot Integration for Telegram Bot
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { 
  UserSession, 
  AutopilotTask, 
  TaskTrigger, 
  TaskAction, 
  TaskCondition,
  BotResponse 
} from '../types/index.js';

export class AutopilotIntegration extends EventEmitter {
  private tasks: Map<string, AutopilotTask> = new Map();
  private userTasks: Map<number, string[]> = new Map();
  private taskHistory: Map<string, any[]> = new Map();
  private isActive: boolean = false;

  constructor() {
    super();
    this.initializeAutopilot();
  }

  /**
   * Initialize Autopilot system
   */
  private async initializeAutopilot(): Promise<void> {
    try {
      logger.info('🤖 Initializing Autopilot Integration...');
      
      // Register default tasks
      await this.registerDefaultTasks();
      
      this.isActive = true;
      logger.info('✅ Autopilot Integration initialized');
      
    } catch (error) {
      logger.error('❌ Autopilot initialization failed:', error);
      this.isActive = false;
    }
  }

  /**
   * Register default autopilot tasks
   */
  private async registerDefaultTasks(): Promise<void> {
    // System monitoring task
    this.registerTask({
      id: 'system_monitor',
      name: 'System Monitoring',
      description: 'Monitor system health and performance',
      trigger: {
        type: 'schedule',
        schedule: '*/5 * * * *' // Every 5 minutes
      },
      actions: [
        {
          type: 'command',
          target: 'system_info',
          parameters: {}
        }
      ],
      conditions: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // User activity tracking
    this.registerTask({
      id: 'user_activity_track',
      name: 'User Activity Tracking',
      description: 'Track user interactions and patterns',
      trigger: {
        type: 'event',
        event: 'user_message'
      },
      actions: [
        {
          type: 'ai',
          target: 'analyze_user_behavior',
          parameters: {}
        }
      ],
      conditions: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Learning insights generation
    this.registerTask({
      id: 'learning_insights',
      name: 'Learning Insights Generation',
      description: 'Generate insights from user interactions',
      trigger: {
        type: 'schedule',
        schedule: '0 */6 * * *' // Every 6 hours
      },
      actions: [
        {
          type: 'ai',
          target: 'generate_insights',
          parameters: {}
        }
      ],
      conditions: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  /**
   * Register a new autopilot task
   */
  registerTask(task: AutopilotTask): void {
    this.tasks.set(task.id, task);
    logger.info(`🤖 Registered autopilot task: ${task.name}`);
    this.emit('task_registered', task);
  }

  /**
   * Execute autopilot task
   */
  async executeTask(taskId: string, userSession?: UserSession): Promise<BotResponse> {
    try {
      const task = this.tasks.get(taskId);
      if (!task) {
        return {
          success: false,
          error: `Task '${taskId}' not found`,
          message: `❌ Autopilot task '${taskId}' not found.`
        };
      }

      if (task.status !== 'active') {
        return {
          success: false,
          error: `Task '${taskId}' is not active`,
          message: `❌ Task '${taskId}' is currently ${task.status}.`
        };
      }

      // Execute task actions
      const results = [];
      for (const action of task.actions) {
        const result = await this.executeAction(action, userSession);
        results.push(result);
      }

      // Store in history
      this.addToTaskHistory(taskId, {
        timestamp: new Date(),
        user: userSession?.userId,
        results,
        success: results.every(r => r.success)
      });

      this.emit('task_executed', { taskId, results, user: userSession });

      return {
        success: true,
        message: `✅ Autopilot task '${task.name}' executed successfully`,
        data: results,
        metadata: {
          taskId,
          timestamp: new Date()
        }
      };

    } catch (error) {
      logger.error(`❌ Autopilot task execution error (${taskId}):`, error);
      return {
        success: false,
        error: 'Task execution failed',
        message: `❌ Failed to execute autopilot task: ${error}`
      };
    }
  }

  /**
   * Execute task action
   */
  private async executeAction(action: TaskAction, userSession?: UserSession): Promise<any> {
    try {
      switch (action.type) {
        case 'command':
          return await this.executeCommandAction(action, userSession);
        
        case 'mcp':
          return await this.executeMCPAction(action, userSession);
        
        case 'ai':
          return await this.executeAIAction(action, userSession);
        
        case 'notification':
          return await this.executeNotificationAction(action, userSession);
        
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: `Action execution failed: ${error}`
      };
    }
  }

  /**
   * Execute command action
   */
  private async executeCommandAction(action: TaskAction, userSession?: UserSession): Promise<any> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout, stderr } = await execAsync(action.target, action.parameters);
      
      return {
        success: true,
        data: stdout || stderr,
        type: 'command',
        target: action.target
      };
    } catch (error) {
      return {
        success: false,
        error: `Command execution failed: ${error}`,
        type: 'command',
        target: action.target
      };
    }
  }

  /**
   * Execute MCP action
   */
  private async executeMCPAction(action: TaskAction, userSession?: UserSession): Promise<any> {
    try {
      // This would integrate with MCP tools
      return {
        success: true,
        data: `MCP action executed: ${action.target}`,
        type: 'mcp',
        target: action.target
      };
    } catch (error) {
      return {
        success: false,
        error: `MCP action failed: ${error}`,
        type: 'mcp',
        target: action.target
      };
    }
  }

  /**
   * Execute AI action
   */
  private async executeAIAction(action: TaskAction, userSession?: UserSession): Promise<any> {
    try {
      // This would integrate with AI services
      return {
        success: true,
        data: `AI action executed: ${action.target}`,
        type: 'ai',
        target: action.target
      };
    } catch (error) {
      return {
        success: false,
        error: `AI action failed: ${error}`,
        type: 'ai',
        target: action.target
      };
    }
  }

  /**
   * Execute notification action
   */
  private async executeNotificationAction(action: TaskAction, userSession?: UserSession): Promise<any> {
    try {
      // This would send notifications
      return {
        success: true,
        data: `Notification sent: ${action.target}`,
        type: 'notification',
        target: action.target
      };
    } catch (error) {
      return {
        success: false,
        error: `Notification failed: ${error}`,
        type: 'notification',
        target: action.target
      };
    }
  }

  /**
   * Create user-specific task
   */
  async createUserTask(userSession: UserSession, taskData: Partial<AutopilotTask>): Promise<BotResponse> {
    try {
      const taskId = `user_${userSession.userId}_${Date.now()}`;
      
      const task: AutopilotTask = {
        id: taskId,
        name: taskData.name || 'User Task',
        description: taskData.description || 'User-created task',
        trigger: taskData.trigger || {
          type: 'command',
          pattern: '/task'
        },
        actions: taskData.actions || [],
        conditions: taskData.conditions || [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.registerTask(task);
      
      // Add to user tasks
      const userTasks = this.userTasks.get(userSession.userId) || [];
      userTasks.push(taskId);
      this.userTasks.set(userSession.userId, userTasks);

      return {
        success: true,
        message: `✅ Created autopilot task: ${task.name}`,
        data: task,
        metadata: {
          taskId,
          userId: userSession.userId
        }
      };

    } catch (error) {
      logger.error('❌ User task creation error:', error);
      return {
        success: false,
        error: 'Task creation failed',
        message: `❌ Failed to create autopilot task: ${error}`
      };
    }
  }

  /**
   * Get user tasks
   */
  getUserTasks(userId: number): AutopilotTask[] {
    const userTaskIds = this.userTasks.get(userId) || [];
    return userTaskIds
      .map(id => this.tasks.get(id))
      .filter(task => task !== undefined) as AutopilotTask[];
  }

  /**
   * Get all tasks
   */
  getAllTasks(): AutopilotTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): AutopilotTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: 'active' | 'inactive' | 'paused'): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
      this.emit('task_updated', task);
      return true;
    }
    return false;
  }

  /**
   * Delete task
   */
  deleteTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task) {
      this.tasks.delete(taskId);
      this.emit('task_deleted', { taskId, task });
      return true;
    }
    return false;
  }

  /**
   * Add to task history
   */
  private addToTaskHistory(taskId: string, execution: any): void {
    const history = this.taskHistory.get(taskId) || [];
    history.push(execution);
    
    // Keep only last 100 executions
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.taskHistory.set(taskId, history);
  }

  /**
   * Get task history
   */
  getTaskHistory(taskId: string): any[] {
    return this.taskHistory.get(taskId) || [];
  }

  /**
   * Get autopilot status
   */
  getAutopilotStatus(): any {
    return {
      active: this.isActive,
      tasksCount: this.tasks.size,
      activeTasks: Array.from(this.tasks.values()).filter(t => t.status === 'active').length,
      totalExecutions: Array.from(this.taskHistory.values())
        .reduce((sum, history) => sum + history.length, 0)
    };
  }

  /**
   * Check if autopilot is active
   */
  isAutopilotActive(): boolean {
    return this.isActive;
  }
}
