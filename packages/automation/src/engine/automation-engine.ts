/**
 * Event-Driven Automation Engine
 * Manages triggers and automated actions for AuraOS
 */

import { EventEmitter } from 'events';

export interface AutomationAction {
  type: string;
  params: Record<string, any>;
  condition?: (data: any) => boolean;
}

export interface AutomationTrigger {
  id: string;
  event: string;
  actions: AutomationAction[];
  enabled: boolean;
  description?: string;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AutomationExecutionResult {
  triggerId: string;
  event: string;
  actionsExecuted: number;
  actionsFailed: number;
  duration: number;
  timestamp: Date;
  errors: string[];
}

export type ActionHandler = (params: Record<string, any>, eventData: any) => Promise<void>;

export class AutomationEngine extends EventEmitter {
  private triggers: Map<string, AutomationTrigger> = new Map();
  private actionHandlers: Map<string, ActionHandler> = new Map();
  private executionHistory: AutomationExecutionResult[] = [];
  private maxHistorySize = 1000;

  constructor() {
    super();
    this.registerDefaultHandlers();
  }

  /**
   * Register a trigger with actions
   */
  registerTrigger(
    event: string,
    actions: AutomationAction[],
    options: {
      id?: string;
      description?: string;
      enabled?: boolean;
    } = {}
  ): string {
    const id = options.id || this.generateTriggerId();

    if (this.triggers.has(id)) {
      throw new Error(`Trigger with id '${id}' already exists`);
    }

    const trigger: AutomationTrigger = {
      id,
      event,
      actions,
      enabled: options.enabled ?? true,
      description: options.description,
      createdAt: new Date(),
      triggerCount: 0,
    };

    this.triggers.set(id, trigger);

    // Listen for the event
    this.on(event, (data) => this.handleEvent(event, data));

    console.log(`[AutomationEngine] Registered trigger: ${id} for event: ${event}`);
    return id;
  }

  /**
   * Unregister a trigger
   */
  unregisterTrigger(id: string): void {
    const trigger = this.triggers.get(id);
    if (!trigger) {
      throw new Error(`Trigger '${id}' not found`);
    }

    this.triggers.delete(id);
    console.log(`[AutomationEngine] Unregistered trigger: ${id}`);
  }

  /**
   * Enable/disable a trigger
   */
  setTriggerEnabled(id: string, enabled: boolean): void {
    const trigger = this.triggers.get(id);
    if (!trigger) {
      throw new Error(`Trigger '${id}' not found`);
    }

    trigger.enabled = enabled;
    console.log(`[AutomationEngine] Trigger ${id} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Register an action handler
   */
  registerActionHandler(type: string, handler: ActionHandler): void {
    if (this.actionHandlers.has(type)) {
      throw new Error(`Action handler '${type}' already registered`);
    }

    this.actionHandlers.set(type, handler);
    console.log(`[AutomationEngine] Registered action handler: ${type}`);
  }

  /**
   * Trigger an event manually
   */
  async triggerEvent(event: string, data: any = {}): Promise<void> {
    console.log(`[AutomationEngine] Triggering event: ${event}`);
    this.emit(event, data);
  }

  /**
   * Get all triggers
   */
  getTriggers(): AutomationTrigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Get trigger by ID
   */
  getTrigger(id: string): AutomationTrigger | null {
    return this.triggers.get(id) || null;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 100): AutomationExecutionResult[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
  }

  /**
   * Get statistics
   */
  getStats() {
    const totalTriggers = this.triggers.size;
    const enabledTriggers = Array.from(this.triggers.values()).filter((t) => t.enabled).length;
    const totalExecutions = this.executionHistory.length;
    const totalErrors = this.executionHistory.reduce((sum, r) => sum + r.actionsFailed, 0);

    return {
      totalTriggers,
      enabledTriggers,
      totalExecutions,
      totalErrors,
      actionHandlers: this.actionHandlers.size,
    };
  }

  // Private methods

  private async handleEvent(event: string, data: any): Promise<void> {
    const startTime = Date.now();
    const matchingTriggers = Array.from(this.triggers.values()).filter(
      (t) => t.event === event && t.enabled
    );

    if (matchingTriggers.length === 0) {
      return;
    }

    console.log(`[AutomationEngine] Event '${event}' triggered ${matchingTriggers.length} automation(s)`);

    for (const trigger of matchingTriggers) {
      const result: AutomationExecutionResult = {
        triggerId: trigger.id,
        event,
        actionsExecuted: 0,
        actionsFailed: 0,
        duration: 0,
        timestamp: new Date(),
        errors: [],
      };

      trigger.triggerCount++;
      trigger.lastTriggered = new Date();

      for (const action of trigger.actions) {
        try {
          // Check condition if present
          if (action.condition && !action.condition(data)) {
            console.log(`[AutomationEngine] Action condition not met, skipping`);
            continue;
          }

          // Execute action
          await this.executeAction(action, data);
          result.actionsExecuted++;
        } catch (error) {
          result.actionsFailed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(errorMsg);
          console.error(`[AutomationEngine] Action failed:`, error);
        }
      }

      result.duration = Date.now() - startTime;
      this.addToHistory(result);
    }
  }

  private async executeAction(action: AutomationAction, eventData: any): Promise<void> {
    const handler = this.actionHandlers.get(action.type);
    
    if (!handler) {
      throw new Error(`No handler registered for action type: ${action.type}`);
    }

    console.log(`[AutomationEngine] Executing action: ${action.type}`);
    await handler(action.params, eventData);
  }

  private addToHistory(result: AutomationExecutionResult): void {
    this.executionHistory.push(result);

    // Keep history size limited
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-this.maxHistorySize);
    }
  }

  private generateTriggerId(): string {
    return `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private registerDefaultHandlers(): void {
    // Log action
    this.registerActionHandler('log', async (params) => {
      console.log(`[Automation] ${params.message}`);
    });

    // Notify action (placeholder)
    this.registerActionHandler('notify', async (params) => {
      console.log(`[Automation] Notification: ${params.message}`);
    });

    // Execute command (placeholder)
    this.registerActionHandler('execute_command', async (params) => {
      console.log(`[Automation] Execute command: ${params.command}`);
    });

    // Send webhook (placeholder)
    this.registerActionHandler('webhook', async (params) => {
      console.log(`[Automation] Webhook to: ${params.url}`);
    });
  }
}

// Singleton instance
let engineInstance: AutomationEngine | null = null;

export function getAutomationEngine(): AutomationEngine {
  if (!engineInstance) {
    engineInstance = new AutomationEngine();
  }
  return engineInstance;
}

export function resetAutomationEngine(): void {
  if (engineInstance) {
    engineInstance.removeAllListeners();
    engineInstance = null;
  }
}

// Example usage and pre-configured automations
export function setupDefaultAutomations(engine: AutomationEngine): void {
  // User login automation
  engine.registerTrigger(
    'user.login',
    [
      {
        type: 'log',
        params: { message: 'User logged in' },
      },
      {
        type: 'notify',
        params: { message: 'Welcome back!' },
      },
    ],
    {
      description: 'Actions to perform when user logs in',
    }
  );

  // Code error automation
  engine.registerTrigger(
    'code.error',
    [
      {
        type: 'log',
        params: { message: 'Code error detected' },
      },
      {
        type: 'notify',
        params: { message: 'Error detected, analyzing...' },
      },
    ],
    {
      description: 'Handle code errors automatically',
    }
  );

  // File created automation
  engine.registerTrigger(
    'file.created',
    [
      {
        type: 'log',
        params: { message: 'New file created' },
      },
    ],
    {
      description: 'Track file creation',
    }
  );

  // System low memory automation
  engine.registerTrigger(
    'system.low_memory',
    [
      {
        type: 'log',
        params: { message: 'Low memory detected' },
      },
      {
        type: 'notify',
        params: { message: 'System memory is low' },
      },
      {
        type: 'execute_command',
        params: { command: 'cleanup' },
      },
    ],
    {
      description: 'Handle low memory situations',
    }
  );

  // Task completed automation
  engine.registerTrigger(
    'task.completed',
    [
      {
        type: 'log',
        params: { message: 'Task completed' },
      },
      {
        type: 'notify',
        params: { message: 'Task completed successfully!' },
      },
    ],
    {
      description: 'Celebrate task completion',
    }
  );

  console.log('[AutomationEngine] Default automations configured');
}
