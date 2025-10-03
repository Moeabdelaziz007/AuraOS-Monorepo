/**
 * Quantum Workflow Builder
 * Fluent API for building quantum-optimized workflows
 */

import {
  QuantumWorkflow,
  WorkflowStep,
  WorkflowStepType,
  QuantumConfig,
  RetryPolicy,
} from './quantum-engine';

export class QuantumWorkflowBuilder {
  private workflow: Partial<QuantumWorkflow>;
  private steps: WorkflowStep[] = [];
  private currentStep: Partial<WorkflowStep> | null = null;

  constructor(name: string, description?: string) {
    this.workflow = {
      id: this.generateId(),
      name,
      description,
      version: '1.0.0',
      quantumConfig: this.getDefaultQuantumConfig(),
    };
  }

  /**
   * Configure quantum optimization settings
   */
  quantum(config: Partial<QuantumConfig>): this {
    this.workflow.quantumConfig = {
      ...this.workflow.quantumConfig!,
      ...config,
    };
    return this;
  }

  /**
   * Add an action step
   */
  action(name: string, action: string, params: Record<string, any> = {}): this {
    this.finalizeCurrentStep();

    this.currentStep = {
      id: this.generateStepId(),
      type: WorkflowStepType.ACTION,
      name,
      action,
      params,
      dependencies: [],
    };

    return this;
  }

  /**
   * Add a decision step
   */
  decision(name: string, condition: (context: any) => boolean): this {
    this.finalizeCurrentStep();

    this.currentStep = {
      id: this.generateStepId(),
      type: WorkflowStepType.DECISION,
      name,
      action: 'decision',
      params: {},
      dependencies: [],
      condition,
    };

    return this;
  }

  /**
   * Add a parallel execution step
   */
  parallel(name: string, actions: Array<{ action: string; params: Record<string, any> }>): this {
    this.finalizeCurrentStep();

    this.currentStep = {
      id: this.generateStepId(),
      type: WorkflowStepType.PARALLEL,
      name,
      action: 'parallel',
      params: { actions },
      dependencies: [],
    };

    return this;
  }

  /**
   * Add a wait/delay step
   */
  wait(name: string, duration: number): this {
    this.finalizeCurrentStep();

    this.currentStep = {
      id: this.generateStepId(),
      type: WorkflowStepType.WAIT,
      name,
      action: 'delay',
      params: { duration },
      dependencies: [],
    };

    return this;
  }

  /**
   * Add a loop step
   */
  loop(name: string, iterations: number, action: string, params: Record<string, any> = {}): this {
    this.finalizeCurrentStep();

    this.currentStep = {
      id: this.generateStepId(),
      type: WorkflowStepType.LOOP,
      name,
      action,
      params: { ...params, iterations },
      dependencies: [],
    };

    return this;
  }

  /**
   * Add quantum gate operation (special optimization hint)
   */
  quantumGate(name: string, operation: 'optimize' | 'parallelize' | 'skip'): this {
    this.finalizeCurrentStep();

    this.currentStep = {
      id: this.generateStepId(),
      type: WorkflowStepType.QUANTUM_GATE,
      name,
      action: 'quantum_gate',
      params: { operation },
      dependencies: [],
    };

    return this;
  }

  /**
   * Set dependencies for current step
   */
  dependsOn(...stepIds: string[]): this {
    if (this.currentStep) {
      this.currentStep.dependencies = stepIds;
    }
    return this;
  }

  /**
   * Set condition for current step
   */
  when(condition: (context: any) => boolean): this {
    if (this.currentStep) {
      this.currentStep.condition = condition;
    }
    return this;
  }

  /**
   * Set retry policy for current step
   */
  retry(maxAttempts: number, backoffMultiplier: number = 2, initialDelay: number = 1000): this {
    if (this.currentStep) {
      this.currentStep.retryPolicy = {
        maxAttempts,
        backoffMultiplier,
        initialDelay,
      };
    }
    return this;
  }

  /**
   * Set timeout for current step
   */
  timeout(ms: number): this {
    if (this.currentStep) {
      this.currentStep.timeout = ms;
    }
    return this;
  }

  /**
   * Set priority for current step
   */
  priority(level: number): this {
    if (this.currentStep) {
      this.currentStep.priority = level;
    }
    return this;
  }

  /**
   * Build the workflow
   */
  build(): QuantumWorkflow {
    this.finalizeCurrentStep();

    return {
      id: this.workflow.id!,
      name: this.workflow.name!,
      description: this.workflow.description,
      version: this.workflow.version!,
      steps: this.steps,
      quantumConfig: this.workflow.quantumConfig!,
      metadata: this.workflow.metadata,
    };
  }

  /**
   * Finalize current step and add to steps array
   */
  private finalizeCurrentStep(): void {
    if (this.currentStep) {
      this.steps.push(this.currentStep as WorkflowStep);
      this.currentStep = null;
    }
  }

  /**
   * Get default quantum configuration
   */
  private getDefaultQuantumConfig(): QuantumConfig {
    return {
      enableSuperposition: true,
      enableEntanglement: true,
      enableAnnealing: true,
      enableTunneling: true,
      maxSuperpositionStates: 10,
      annealingIterations: 100,
      measurementThreshold: 0.8,
    };
  }

  /**
   * Generate unique workflow ID
   */
  private generateId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique step ID
   */
  private generateStepId(): string {
    return `step_${this.steps.length + 1}_${Math.random().toString(36).substr(2, 6)}`;
  }
}

/**
 * Create a new quantum workflow builder
 */
export function createWorkflow(name: string, description?: string): QuantumWorkflowBuilder {
  return new QuantumWorkflowBuilder(name, description);
}

// ============================================
// PRE-BUILT WORKFLOW TEMPLATES
// ============================================

/**
 * Data Processing Workflow Template
 */
export function createDataProcessingWorkflow(): QuantumWorkflow {
  return createWorkflow('Data Processing Pipeline', 'Process and transform data with quantum optimization')
    .quantum({
      enableSuperposition: true,
      enableAnnealing: true,
      maxSuperpositionStates: 5,
    })
    .action('Fetch Data', 'http_request', {
      method: 'GET',
      url: 'https://api.example.com/data',
    })
    .retry(3, 2, 1000)
    .timeout(10000)
    .action('Validate Data', 'validate', {
      schema: 'data_schema',
    })
    .action('Transform Data', 'transform', {
      operations: ['normalize', 'filter', 'aggregate'],
    })
    .parallel('Process Chunks', [
      { action: 'process_chunk', params: { chunk: 1 } },
      { action: 'process_chunk', params: { chunk: 2 } },
      { action: 'process_chunk', params: { chunk: 3 } },
    ])
    .action('Save Results', 'save', {
      destination: 'database',
    })
    .retry(2)
    .action('Send Notification', 'notify', {
      message: 'Data processing complete',
    })
    .build();
}

/**
 * Deployment Workflow Template
 */
export function createDeploymentWorkflow(): QuantumWorkflow {
  return createWorkflow('Automated Deployment', 'Deploy application with quantum-optimized steps')
    .quantum({
      enableSuperposition: true,
      enableTunneling: true,
      annealingIterations: 50,
    })
    .action('Run Tests', 'test', {
      suite: 'all',
    })
    .retry(2)
    .timeout(60000)
    .decision('Tests Passed?', (ctx) => ctx.results.get('step_1')?.success === true)
    .action('Build Application', 'build', {
      target: 'production',
    })
    .timeout(120000)
    .action('Create Backup', 'backup', {
      source: 'production',
    })
    .parallel('Deploy to Servers', [
      { action: 'deploy', params: { server: 'server1' } },
      { action: 'deploy', params: { server: 'server2' } },
      { action: 'deploy', params: { server: 'server3' } },
    ])
    .action('Health Check', 'health_check', {
      endpoints: ['server1', 'server2', 'server3'],
    })
    .retry(3, 1.5, 2000)
    .action('Update DNS', 'dns_update', {
      record: 'app.example.com',
    })
    .action('Notify Team', 'notify', {
      channel: 'slack',
      message: 'Deployment successful',
    })
    .build();
}

/**
 * AI Training Workflow Template
 */
export function createAITrainingWorkflow(): QuantumWorkflow {
  return createWorkflow('AI Model Training', 'Train AI model with quantum-optimized hyperparameter search')
    .quantum({
      enableSuperposition: true,
      enableAnnealing: true,
      maxSuperpositionStates: 20,
      annealingIterations: 200,
    })
    .action('Load Dataset', 'load_data', {
      source: 'training_data',
    })
    .action('Preprocess Data', 'preprocess', {
      operations: ['normalize', 'augment', 'split'],
    })
    .quantumGate('Optimize Hyperparameters', 'optimize')
    .parallel('Train Models', [
      { action: 'train', params: { model: 'model_a', lr: 0.001 } },
      { action: 'train', params: { model: 'model_b', lr: 0.01 } },
      { action: 'train', params: { model: 'model_c', lr: 0.1 } },
    ])
    .action('Evaluate Models', 'evaluate', {
      metrics: ['accuracy', 'f1', 'loss'],
    })
    .action('Select Best Model', 'select_best', {
      criterion: 'accuracy',
    })
    .action('Save Model', 'save_model', {
      destination: 'model_registry',
    })
    .action('Deploy Model', 'deploy_model', {
      environment: 'production',
    })
    .build();
}

/**
 * Backup and Recovery Workflow Template
 */
export function createBackupWorkflow(): QuantumWorkflow {
  return createWorkflow('Backup and Recovery', 'Automated backup with quantum optimization')
    .quantum({
      enableSuperposition: true,
      enableParallelization: true,
    })
    .action('Check Disk Space', 'check_space', {
      threshold: 0.8,
    })
    .decision('Enough Space?', (ctx) => ctx.results.get('step_1')?.available > 0.2)
    .parallel('Backup Databases', [
      { action: 'backup_db', params: { database: 'users' } },
      { action: 'backup_db', params: { database: 'products' } },
      { action: 'backup_db', params: { database: 'orders' } },
    ])
    .action('Compress Backups', 'compress', {
      algorithm: 'gzip',
    })
    .action('Upload to Cloud', 'upload', {
      destination: 's3://backups',
    })
    .retry(3, 2, 5000)
    .action('Verify Backup', 'verify', {
      checksum: true,
    })
    .action('Clean Old Backups', 'cleanup', {
      retention: 30,
    })
    .action('Send Report', 'notify', {
      message: 'Backup completed successfully',
    })
    .build();
}

/**
 * Content Generation Workflow Template
 */
export function createContentGenerationWorkflow(): QuantumWorkflow {
  return createWorkflow('AI Content Generation', 'Generate content with quantum-optimized AI')
    .quantum({
      enableSuperposition: true,
      enableAnnealing: true,
      maxSuperpositionStates: 15,
    })
    .action('Analyze Topic', 'analyze', {
      topic: 'input_topic',
    })
    .action('Generate Outline', 'generate_outline', {
      sections: 5,
    })
    .quantumGate('Optimize Content Strategy', 'optimize')
    .parallel('Generate Sections', [
      { action: 'generate_content', params: { section: 1 } },
      { action: 'generate_content', params: { section: 2 } },
      { action: 'generate_content', params: { section: 3 } },
      { action: 'generate_content', params: { section: 4 } },
      { action: 'generate_content', params: { section: 5 } },
    ])
    .action('Combine Content', 'combine', {
      format: 'markdown',
    })
    .action('Review Quality', 'quality_check', {
      criteria: ['grammar', 'coherence', 'relevance'],
    })
    .action('Optimize SEO', 'seo_optimize', {
      keywords: 'auto',
    })
    .action('Publish Content', 'publish', {
      platform: 'cms',
    })
    .build();
}
