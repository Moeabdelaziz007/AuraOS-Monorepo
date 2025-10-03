/**
 * Task Scheduler
 * Cron-like task scheduling system for AuraOS
 */

export interface ScheduledTask {
  id: string;
  name: string;
  schedule: string; // Cron expression or interval
  callback: () => Promise<void>;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  errorCount: number;
  lastError?: string;
}

export interface TaskSchedulerConfig {
  timezone?: string;
  maxConcurrentTasks?: number;
  enableLogging?: boolean;
}

export class TaskScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private config: Required<TaskSchedulerConfig>;
  private running = false;

  constructor(config: TaskSchedulerConfig = {}) {
    this.config = {
      timezone: config.timezone || 'UTC',
      maxConcurrentTasks: config.maxConcurrentTasks || 10,
      enableLogging: config.enableLogging ?? true,
    };
  }

  /**
   * Schedule a task with cron expression or interval
   */
  schedule(
    name: string,
    schedule: string,
    callback: () => Promise<void>,
    options: { id?: string; enabled?: boolean } = {}
  ): string {
    const id = options.id || this.generateTaskId();

    if (this.tasks.has(id)) {
      throw new Error(`Task with id '${id}' already exists`);
    }

    const task: ScheduledTask = {
      id,
      name,
      schedule,
      callback,
      enabled: options.enabled ?? true,
      runCount: 0,
      errorCount: 0,
    };

    this.tasks.set(id, task);

    if (task.enabled && this.running) {
      this.startTask(task);
    }

    this.log(`Scheduled task: ${name} (${schedule})`);
    return id;
  }

  /**
   * Unschedule a task
   */
  unschedule(id: string): void {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task '${id}' not found`);
    }

    this.stopTask(id);
    this.tasks.delete(id);
    this.log(`Unscheduled task: ${task.name}`);
  }

  /**
   * Enable/disable a task
   */
  setTaskEnabled(id: string, enabled: boolean): void {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task '${id}' not found`);
    }

    task.enabled = enabled;

    if (enabled && this.running) {
      this.startTask(task);
    } else {
      this.stopTask(id);
    }

    this.log(`Task ${task.name} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.running) {
      this.log('Scheduler already running');
      return;
    }

    this.running = true;
    this.log('Starting task scheduler...');

    for (const task of this.tasks.values()) {
      if (task.enabled) {
        this.startTask(task);
      }
    }

    this.log(`Started ${this.intervals.size} scheduled tasks`);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.running) {
      this.log('Scheduler not running');
      return;
    }

    this.log('Stopping task scheduler...');

    for (const [id] of this.intervals.entries()) {
      this.stopTask(id);
    }

    this.running = false;
    this.log('Task scheduler stopped');
  }

  /**
   * Get all tasks
   */
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(id: string): ScheduledTask | null {
    return this.tasks.get(id) || null;
  }

  /**
   * Get scheduler statistics
   */
  getStats() {
    const totalTasks = this.tasks.size;
    const enabledTasks = Array.from(this.tasks.values()).filter((t) => t.enabled).length;
    const totalRuns = Array.from(this.tasks.values()).reduce((sum, t) => sum + t.runCount, 0);
    const totalErrors = Array.from(this.tasks.values()).reduce((sum, t) => sum + t.errorCount, 0);

    return {
      running: this.running,
      totalTasks,
      enabledTasks,
      activeTasks: this.intervals.size,
      totalRuns,
      totalErrors,
    };
  }

  /**
   * Run a task immediately
   */
  async runNow(id: string): Promise<void> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task '${id}' not found`);
    }

    await this.executeTask(task);
  }

  // Private methods

  private startTask(task: ScheduledTask): void {
    if (this.intervals.has(task.id)) {
      return; // Already running
    }

    const interval = this.parseSchedule(task.schedule);
    
    // Calculate next run time
    task.nextRun = new Date(Date.now() + interval);

    // Schedule the task
    const intervalId = setInterval(() => {
      this.executeTask(task);
    }, interval);

    this.intervals.set(task.id, intervalId);
    this.log(`Started task: ${task.name} (interval: ${interval}ms)`);
  }

  private stopTask(id: string): void {
    const intervalId = this.intervals.get(id);
    if (!intervalId) {
      return;
    }

    clearInterval(intervalId);
    this.intervals.delete(id);

    const task = this.tasks.get(id);
    if (task) {
      task.nextRun = undefined;
      this.log(`Stopped task: ${task.name}`);
    }
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    const startTime = Date.now();
    this.log(`Executing task: ${task.name}`);

    try {
      await task.callback();

      task.runCount++;
      task.lastRun = new Date();
      task.nextRun = new Date(Date.now() + this.parseSchedule(task.schedule));
      task.lastError = undefined;

      const duration = Date.now() - startTime;
      this.log(`Task ${task.name} completed in ${duration}ms`);
    } catch (error) {
      task.errorCount++;
      task.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      this.log(`Task ${task.name} failed: ${task.lastError}`, 'error');
    }
  }

  private parseSchedule(schedule: string): number {
    // Simple interval parsing (e.g., "5m", "1h", "30s")
    const match = schedule.match(/^(\d+)([smhd])$/);
    
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];

      switch (unit) {
        case 's':
          return value * 1000;
        case 'm':
          return value * 60 * 1000;
        case 'h':
          return value * 60 * 60 * 1000;
        case 'd':
          return value * 24 * 60 * 60 * 1000;
      }
    }

    // Default to 1 hour if parsing fails
    console.warn(`Invalid schedule format: ${schedule}, defaulting to 1h`);
    return 60 * 60 * 1000;
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(message: string, level: 'info' | 'error' = 'info'): void {
    if (!this.config.enableLogging) {
      return;
    }

    const prefix = '[TaskScheduler]';
    if (level === 'error') {
      console.error(`${prefix} ${message}`);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

// Singleton instance
let schedulerInstance: TaskScheduler | null = null;

export function getTaskScheduler(config?: TaskSchedulerConfig): TaskScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new TaskScheduler(config);
  }
  return schedulerInstance;
}

export function resetTaskScheduler(): void {
  if (schedulerInstance) {
    schedulerInstance.stop();
    schedulerInstance = null;
  }
}

// Pre-configured tasks
export function setupDefaultTasks(scheduler: TaskScheduler): void {
  // Daily backup at 2 AM (simulated with 24h interval)
  scheduler.schedule(
    'daily-backup',
    '24h',
    async () => {
      console.log('[Task] Running daily backup...');
      // Backup logic here
    },
    { enabled: true }
  );

  // Hourly health check
  scheduler.schedule(
    'hourly-health-check',
    '1h',
    async () => {
      console.log('[Task] Running health check...');
      // Health check logic here
    },
    { enabled: true }
  );

  // Every 15 minutes: cleanup
  scheduler.schedule(
    'cleanup',
    '15m',
    async () => {
      console.log('[Task] Running cleanup...');
      // Cleanup logic here
    },
    { enabled: true }
  );

  // Every 5 minutes: sync
  scheduler.schedule(
    'sync',
    '5m',
    async () => {
      console.log('[Task] Running sync...');
      // Sync logic here
    },
    { enabled: true }
  );

  console.log('[TaskScheduler] Default tasks configured');
}
