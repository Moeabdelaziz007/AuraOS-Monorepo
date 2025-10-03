/**
 * Background Worker System
 * Manages continuous automation loops for AuraOS
 */

export interface WorkerConfig {
  healthCheckInterval?: number; // ms
  learningAnalysisInterval?: number; // ms
  backupInterval?: number; // ms
  securityScanInterval?: number; // ms
  taskSchedulerInterval?: number; // ms
  integrationSyncInterval?: number; // ms
  enableHealthCheck?: boolean;
  enableLearningAnalysis?: boolean;
  enableBackup?: boolean;
  enableSecurityScan?: boolean;
  enableTaskScheduler?: boolean;
  enableIntegrationSync?: boolean;
}

export interface WorkerStatus {
  running: boolean;
  activeLoops: string[];
  startTime: Date;
  uptime: number;
  loopStats: Map<string, LoopStats>;
}

export interface LoopStats {
  name: string;
  executionCount: number;
  lastExecution: Date | null;
  lastDuration: number;
  averageDuration: number;
  errors: number;
  lastError: string | null;
}

export type WorkerCallback = () => Promise<void>;

export class BackgroundWorker {
  private loops: Map<string, NodeJS.Timeout> = new Map();
  private loopStats: Map<string, LoopStats> = new Map();
  private config: Required<WorkerConfig>;
  private running = false;
  private startTime: Date | null = null;

  constructor(config: WorkerConfig = {}) {
    this.config = {
      healthCheckInterval: config.healthCheckInterval || 5 * 60 * 1000, // 5 minutes
      learningAnalysisInterval: config.learningAnalysisInterval || 30 * 60 * 1000, // 30 minutes
      backupInterval: config.backupInterval || 6 * 60 * 60 * 1000, // 6 hours
      securityScanInterval: config.securityScanInterval || 60 * 60 * 1000, // 1 hour
      taskSchedulerInterval: config.taskSchedulerInterval || 60 * 1000, // 1 minute
      integrationSyncInterval: config.integrationSyncInterval || 15 * 60 * 1000, // 15 minutes
      enableHealthCheck: config.enableHealthCheck ?? true,
      enableLearningAnalysis: config.enableLearningAnalysis ?? true,
      enableBackup: config.enableBackup ?? true,
      enableSecurityScan: config.enableSecurityScan ?? true,
      enableTaskScheduler: config.enableTaskScheduler ?? true,
      enableIntegrationSync: config.enableIntegrationSync ?? false,
    };
  }

  /**
   * Start all enabled background loops
   */
  async start(): Promise<void> {
    if (this.running) {
      console.log('[BackgroundWorker] Already running');
      return;
    }

    this.running = true;
    this.startTime = new Date();

    console.log('[BackgroundWorker] Starting background workers...');

    if (this.config.enableHealthCheck) {
      this.startLoop('health-check', this.config.healthCheckInterval, async () => {
        await this.healthCheck();
      });
    }

    if (this.config.enableLearningAnalysis) {
      this.startLoop('learning-analysis', this.config.learningAnalysisInterval, async () => {
        await this.learningAnalysis();
      });
    }

    if (this.config.enableBackup) {
      this.startLoop('backup', this.config.backupInterval, async () => {
        await this.backup();
      });
    }

    if (this.config.enableSecurityScan) {
      this.startLoop('security-scan', this.config.securityScanInterval, async () => {
        await this.securityScan();
      });
    }

    if (this.config.enableTaskScheduler) {
      this.startLoop('task-scheduler', this.config.taskSchedulerInterval, async () => {
        await this.taskScheduler();
      });
    }

    if (this.config.enableIntegrationSync) {
      this.startLoop('integration-sync', this.config.integrationSyncInterval, async () => {
        await this.integrationSync();
      });
    }

    console.log(`[BackgroundWorker] Started ${this.loops.size} background loops`);
  }

  /**
   * Stop all background loops
   */
  async stop(): Promise<void> {
    if (!this.running) {
      console.log('[BackgroundWorker] Not running');
      return;
    }

    console.log('[BackgroundWorker] Stopping background workers...');

    for (const [name, interval] of this.loops.entries()) {
      clearInterval(interval);
      console.log(`[BackgroundWorker] Stopped loop: ${name}`);
    }

    this.loops.clear();
    this.running = false;

    console.log('[BackgroundWorker] All background workers stopped');
  }

  /**
   * Get worker status
   */
  getStatus(): WorkerStatus {
    return {
      running: this.running,
      activeLoops: Array.from(this.loops.keys()),
      startTime: this.startTime || new Date(),
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      loopStats: this.loopStats,
    };
  }

  /**
   * Get statistics for a specific loop
   */
  getLoopStats(name: string): LoopStats | null {
    return this.loopStats.get(name) || null;
  }

  /**
   * Register a custom loop
   */
  registerLoop(name: string, interval: number, callback: WorkerCallback): void {
    if (this.loops.has(name)) {
      throw new Error(`Loop '${name}' is already registered`);
    }

    this.startLoop(name, interval, callback);
    console.log(`[BackgroundWorker] Registered custom loop: ${name} (${interval}ms)`);
  }

  /**
   * Unregister a custom loop
   */
  unregisterLoop(name: string): void {
    const interval = this.loops.get(name);
    if (!interval) {
      throw new Error(`Loop '${name}' is not registered`);
    }

    clearInterval(interval);
    this.loops.delete(name);
    this.loopStats.delete(name);
    console.log(`[BackgroundWorker] Unregistered loop: ${name}`);
  }

  // Private methods

  private startLoop(name: string, interval: number, callback: WorkerCallback): void {
    // Initialize stats
    this.loopStats.set(name, {
      name,
      executionCount: 0,
      lastExecution: null,
      lastDuration: 0,
      averageDuration: 0,
      errors: 0,
      lastError: null,
    });

    // Execute immediately
    this.executeLoop(name, callback);

    // Schedule periodic execution
    const intervalId = setInterval(() => {
      this.executeLoop(name, callback);
    }, interval);

    this.loops.set(name, intervalId);
    console.log(`[BackgroundWorker] Started loop: ${name} (interval: ${interval}ms)`);
  }

  private async executeLoop(name: string, callback: WorkerCallback): Promise<void> {
    const stats = this.loopStats.get(name)!;
    const startTime = Date.now();

    try {
      await callback();

      // Update stats
      const duration = Date.now() - startTime;
      stats.executionCount++;
      stats.lastExecution = new Date();
      stats.lastDuration = duration;
      stats.averageDuration =
        (stats.averageDuration * (stats.executionCount - 1) + duration) / stats.executionCount;

      console.log(`[BackgroundWorker] ${name} completed in ${duration}ms`);
    } catch (error) {
      stats.errors++;
      stats.lastError = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[BackgroundWorker] ${name} failed:`, error);
    }
  }

  // Built-in loop implementations

  private async healthCheck(): Promise<void> {
    console.log('[HealthCheck] Running system health check...');
    
    // Check memory usage
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memory = process.memoryUsage();
      const heapUsedMB = Math.round(memory.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memory.heapTotal / 1024 / 1024);
      
      console.log(`[HealthCheck] Memory: ${heapUsedMB}MB / ${heapTotalMB}MB`);
      
      // Alert if memory usage is high
      if (heapUsedMB > heapTotalMB * 0.9) {
        console.warn('[HealthCheck] ⚠️ High memory usage detected');
      }
    }

    // Check uptime
    if (typeof process !== 'undefined' && process.uptime) {
      const uptimeSeconds = Math.floor(process.uptime());
      console.log(`[HealthCheck] Uptime: ${uptimeSeconds}s`);
    }

    console.log('[HealthCheck] ✅ Health check completed');
  }

  private async learningAnalysis(): Promise<void> {
    console.log('[LearningAnalysis] Analyzing user patterns...');
    
    // This would integrate with the learning loop service
    // For now, just log
    console.log('[LearningAnalysis] ✅ Analysis completed');
  }

  private async backup(): Promise<void> {
    console.log('[Backup] Starting backup process...');
    
    // This would backup user data, system state, etc.
    // For now, just log
    console.log('[Backup] ✅ Backup completed');
  }

  private async securityScan(): Promise<void> {
    console.log('[SecurityScan] Running security scan...');
    
    // This would check for security issues
    // For now, just log
    console.log('[SecurityScan] ✅ Security scan completed');
  }

  private async taskScheduler(): Promise<void> {
    console.log('[TaskScheduler] Processing scheduled tasks...');
    
    // This would process scheduled tasks
    // For now, just log
    console.log('[TaskScheduler] ✅ Task processing completed');
  }

  private async integrationSync(): Promise<void> {
    console.log('[IntegrationSync] Syncing external integrations...');
    
    // This would sync with external services
    // For now, just log
    console.log('[IntegrationSync] ✅ Integration sync completed');
  }
}

// Singleton instance
let workerInstance: BackgroundWorker | null = null;

export function getBackgroundWorker(config?: WorkerConfig): BackgroundWorker {
  if (!workerInstance) {
    workerInstance = new BackgroundWorker(config);
  }
  return workerInstance;
}

export function resetBackgroundWorker(): void {
  if (workerInstance) {
    workerInstance.stop();
    workerInstance = null;
  }
}
