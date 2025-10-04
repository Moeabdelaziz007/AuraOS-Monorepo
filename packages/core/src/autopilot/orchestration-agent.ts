/**
 * Intelligent Orchestration Agent
 * Enhanced Autopilot that can route tasks to any app and use appropriate MCP tools
 */

import { AutopilotService } from './autopilot.service';
import { MCPGateway } from '@auraos/ai/src/mcp/gateway';
import { MCPClient } from '@auraos/ai/src/mcp/client';
import { aiService } from '../ai/services';
import { learningLoopService } from '../learning/learning-loop.service';
import { RewardSystem, RewardCalculator, ProgressTracker } from './reward-system';
import { SmartAnalyzer } from './smart-analyzer';

export interface AppCapability {
  appId: string;
  appName: string;
  capabilities: string[];
  mcpTools: string[];
  priority: number;
  isActive: boolean;
}

export interface TaskContext {
  userId: string;
  sessionId: string;
  intent: string;
  entities: Record<string, any>;
  userPreferences: Record<string, any>;
  currentApp?: string;
  availableApps: AppCapability[];
  mcpTools: string[];
}

export interface OrchestrationDecision {
  targetApp: string;
  mcpTools: string[];
  workflow: string[];
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    app: string;
    tools: string[];
    confidence: number;
  }>;
}

export interface ExecutionPlan {
  id: string;
  taskId: string;
  userId: string;
  steps: ExecutionStep[];
  estimatedDuration: number;
  requiredPermissions: string[];
  fallbackPlan?: ExecutionPlan;
}

export interface ExecutionStep {
  id: string;
  type: 'mcp_tool' | 'app_action' | 'ai_processing' | 'user_interaction';
  tool?: string;
  app?: string;
  action?: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  dependencies: string[];
  timeout: number;
  retryPolicy: {
    maxAttempts: number;
    backoffMs: number;
  };
}

export interface PerformanceMetrics {
  taskId: string;
  appId: string;
  totalExecutions: number;
  successfulExecutions: number;
  averageExecutionTime: number;
  bestExecutionTime: number;
  worstExecutionTime: number;
  successRate: number;
  improvementRate: number;
  lastExecution: Date;
  rewards: Array<{
    type: string;
    points: number;
    timestamp: Date;
  }>;
  learningInsights: Array<{
    insight: string;
    confidence: number;
    timestamp: Date;
  }>;
}

export class OrchestrationAgent {
  private autopilot: AutopilotService;
  private mcpGateway: MCPGateway;
  private mcpClient: MCPClient;
  private rewardSystem: RewardSystem;
  private rewardCalculator: RewardCalculator;
  private progressTracker: ProgressTracker;
  private smartAnalyzer: SmartAnalyzer;
  private appRegistry: Map<string, AppCapability> = new Map();
  private executionHistory: Map<string, ExecutionPlan> = new Map();
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.autopilot = new AutopilotService();
    this.mcpGateway = new MCPGateway({
      enableAuth: true,
      enableLogging: true,
      maxConcurrentRequests: 100,
      timeout: 30000,
    });
    this.mcpClient = new MCPClient(this.mcpGateway, 'orchestration-agent');
    this.rewardSystem = new RewardSystem();
    this.rewardCalculator = new RewardCalculator();
    this.progressTracker = new ProgressTracker();
    this.smartAnalyzer = new SmartAnalyzer();
  }

  /**
   * Initialize the orchestration agent
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    logger.info('[Orchestration Agent] Initializing...');

    // Initialize MCP Gateway with all available servers
    await this.initializeMCPServers();

    // Register available apps and their capabilities
    await this.registerApps();

    // Start learning from user behavior
    await this.autopilot.initialize();

    this.isInitialized = true;
    logger.info('[Orchestration Agent] ✅ Initialized successfully');
  }

  /**
   * Initialize MCP servers
   */
  private async initializeMCPServers(): Promise<void> {
    try {
      // Import and register all available MCP servers
      const { FileSystemMCPServer } = await import('../mcp/filesystem');
      const { EmulatorControlMCPServer } = await import('../mcp/emulator');
      const { NotesMCPServer } = await import('../mcp/notes');
      const { WebMCPServer } = await import('../mcp/web');

      // Register servers
      await this.mcpGateway.registerServer(new FileSystemMCPServer());
      await this.mcpGateway.registerServer(new EmulatorControlMCPServer());
      await this.mcpGateway.registerServer(new NotesMCPServer());
      await this.mcpGateway.registerServer(new WebMCPServer());

      logger.info('[Orchestration Agent] ✅ MCP servers registered');
    } catch (error) {
      logger.error('[Orchestration Agent] Failed to initialize MCP servers:', error);
      throw error;
    }
  }

  /**
   * Register available apps and their capabilities
   */
  private async registerApps(): Promise<void> {
    const apps: AppCapability[] = [
      {
        appId: 'notes',
        appName: 'Notes App',
        capabilities: ['create_note', 'edit_note', 'search_notes', 'organize_notes'],
        mcpTools: ['notes.createNote', 'notes.updateNote', 'notes.searchNotes', 'notes.deleteNote'],
        priority: 10,
        isActive: true,
      },
      {
        appId: 'terminal',
        appName: 'Terminal',
        capabilities: ['execute_command', 'file_operations', 'system_control'],
        mcpTools: ['fs_read', 'fs_write', 'fs_list', 'fs_delete', 'fs_search'],
        priority: 9,
        isActive: true,
      },
      {
        appId: 'debugger',
        appName: 'Debugger',
        capabilities: ['debug_code', 'step_through', 'inspect_variables'],
        mcpTools: ['emu_step', 'emu_get_state', 'emu_set_breakpoint'],
        priority: 8,
        isActive: true,
      },
      {
        appId: 'web',
        appName: 'Web Tools',
        capabilities: ['fetch_content', 'summarize_web', 'extract_data'],
        mcpTools: ['web.fetchAndCleanContent', 'web.extractTextFromHtml'],
        priority: 7,
        isActive: true,
      },
    ];

    for (const app of apps) {
      this.appRegistry.set(app.appId, app);
    }

    logger.info(`[Orchestration Agent] ✅ Registered ${apps.length} apps`);
  }

  /**
   * Analyze user intent and create execution plan
   */
  async analyzeIntent(
    userId: string,
    sessionId: string,
    userInput: string,
    context?: Record<string, any>
  ): Promise<OrchestrationDecision> {
    await this.initialize();

    logger.info(`[Orchestration Agent] Analyzing intent: "${userInput}"`);

    // Create task context
    const taskContext: TaskContext = {
      userId,
      sessionId,
      intent: userInput,
      entities: await this.extractEntities(userInput),
      userPreferences: await this.getUserPreferences(userId),
      availableApps: Array.from(this.appRegistry.values()),
      mcpTools: this.mcpGateway.getToolDefinitions().map(t => t.name),
    };

    // Use AI to analyze intent and determine best approach
    const aiAnalysis = await this.analyzeWithAI(taskContext);

    // Create orchestration decision
    const decision: OrchestrationDecision = {
      targetApp: aiAnalysis.targetApp,
      mcpTools: aiAnalysis.requiredTools,
      workflow: aiAnalysis.workflow,
      confidence: aiAnalysis.confidence,
      reasoning: aiAnalysis.reasoning,
      alternatives: aiAnalysis.alternatives,
    };

    // Learn from this decision
    await this.learnFromDecision(userId, taskContext, decision);

    logger.info(`[Orchestration Agent] Decision: ${decision.targetApp} (confidence: ${decision.confidence})`);

    return decision;
  }

  /**
   * Execute a task using the orchestration decision
   */
  async executeTask(
    userId: string,
    sessionId: string,
    decision: OrchestrationDecision,
    inputs: Record<string, any>
  ): Promise<{
    success: boolean;
    result: any;
    executionTime: number;
    steps: Array<{
      step: string;
      success: boolean;
      duration: number;
      result?: any;
      error?: string;
    }>;
  }> {
    const startTime = Date.now();
    const executionSteps: Array<{
      step: string;
      success: boolean;
      duration: number;
      result?: any;
      error?: string;
    }> = [];

    try {
      logger.info(`[Orchestration Agent] Executing task on ${decision.targetApp}`);

      // Create execution plan
      const plan = await this.createExecutionPlan(decision, inputs);

      // Execute each step in the plan
      for (const step of plan.steps) {
        const stepStartTime = Date.now();
        
        try {
          const result = await this.executeStep(step, inputs);
          const stepDuration = Date.now() - stepStartTime;

          executionSteps.push({
            step: step.id,
            success: true,
            duration: stepDuration,
            result,
          });

          // Update inputs with step output
          if (result && step.output) {
            Object.assign(inputs, result);
          }

        } catch (error) {
          const stepDuration = Date.now() - stepStartTime;
          
          executionSteps.push({
            step: step.id,
            success: false,
            duration: stepDuration,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          // Try fallback if available
          if (plan.fallbackPlan) {
            logger.warn(`[Orchestration Agent] Step failed, trying fallback: ${step.id}`);
            // Implement fallback logic here
          } else {
            throw error;
          }
        }
      }

      const executionTime = Date.now() - startTime;
      const success = executionSteps.every(step => step.success);

      // Track execution in learning loop
      await learningLoopService.trackActivity(
        'task_execution',
        {
          taskId: plan.id,
          appId: decision.targetApp,
          success,
          executionTime,
          stepsCount: executionSteps.length,
        },
        { success }
      );

      // Update performance metrics and learn from execution
      await this.updatePerformanceMetrics(plan.id, decision.targetApp, {
        success,
        executionTime,
        steps: executionSteps,
        confidence: decision.confidence,
      });

      // Calculate and award rewards for performance improvements
      await this.calculateRewards(userId, plan.id, decision.targetApp, {
        success,
        executionTime,
        previousMetrics: this.performanceMetrics.get(plan.id),
      });

      // Generate learning insights
      await this.generateLearningInsights(plan.id, decision, executionSteps);

      return {
        success,
        result: inputs,
        executionTime,
        steps: executionSteps,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      logger.error('[Orchestration Agent] Task execution failed:', error);

      return {
        success: false,
        result: null,
        executionTime,
        steps: executionSteps,
      };
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: ExecutionStep, inputs: Record<string, any>): Promise<any> {
    switch (step.type) {
      case 'mcp_tool':
        return this.executeMCPTool(step.tool!, step.input);
      
      case 'app_action':
        return this.executeAppAction(step.app!, step.action!, step.input);
      
      case 'ai_processing':
        return this.executeAIProcessing(step.input);
      
      case 'user_interaction':
        return this.executeUserInteraction(step.input);
      
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute MCP tool
   */
  private async executeMCPTool(toolName: string, input: Record<string, any>): Promise<any> {
    const result = await this.mcpClient.executeTool(toolName, input);
    
    if (!result.success) {
      throw new Error(`MCP tool ${toolName} failed: ${result.error}`);
    }
    
    return result.data;
  }

  /**
   * Execute app action
   */
  private async executeAppAction(appId: string, action: string, input: Record<string, any>): Promise<any> {
    // This would integrate with the actual app
    // For now, return a mock response
    logger.info(`[Orchestration Agent] Executing ${action} on ${appId}`);
    
    return {
      appId,
      action,
      success: true,
      data: input,
    };
  }

  /**
   * Execute AI processing
   */
  private async executeAIProcessing(input: Record<string, any>): Promise<any> {
    const { prompt, context } = input;
    
    const response = await aiService.chat([
      { role: 'system', content: 'You are an AI assistant helping with task execution.' },
      { role: 'user', content: `${prompt}\n\nContext: ${JSON.stringify(context)}` }
    ]);
    
    return {
      result: response.content,
      model: response.model,
    };
  }

  /**
   * Execute user interaction
   */
  private async executeUserInteraction(input: Record<string, any>): Promise<any> {
    // This would handle user interactions
    // For now, return the input as-is
    return input;
  }

  /**
   * Analyze intent with AI
   */
  private async analyzeWithAI(context: TaskContext): Promise<{
    targetApp: string;
    requiredTools: string[];
    workflow: string[];
    confidence: number;
    reasoning: string;
    alternatives: Array<{
      app: string;
      tools: string[];
      confidence: number;
    }>;
  }> {
    const prompt = `Analyze this user intent and determine the best app and tools to use:

User Input: "${context.intent}"
Available Apps: ${context.availableApps.map(app => `${app.appName} (${app.appId}): ${app.capabilities.join(', ')}`).join('\n')}
Available MCP Tools: ${context.mcpTools.join(', ')}

Return a JSON response with:
- targetApp: best app to use
- requiredTools: array of MCP tools needed
- workflow: array of steps to execute
- confidence: confidence score (0-100)
- reasoning: explanation of the decision
- alternatives: array of alternative approaches

Context: ${JSON.stringify(context.entities)}`;

    const response = await aiService.chat([
      { role: 'system', content: 'You are an intelligent orchestration agent that routes tasks to the best apps and tools.' },
      { role: 'user', content: prompt }
    ]);

    try {
      const analysis = JSON.parse(response.content);
      return analysis;
    } catch (error) {
      // Fallback to simple analysis
      return this.fallbackAnalysis(context);
    }
  }

  /**
   * Fallback analysis when AI parsing fails
   */
  private fallbackAnalysis(context: TaskContext): any {
    const intent = context.intent.toLowerCase();
    
    // Simple keyword-based routing
    if (intent.includes('note') || intent.includes('write') || intent.includes('save')) {
      return {
        targetApp: 'notes',
        requiredTools: ['notes.createNote'],
        workflow: ['create_note'],
        confidence: 80,
        reasoning: 'Intent suggests note creation',
        alternatives: [],
      };
    }
    
    if (intent.includes('file') || intent.includes('read') || intent.includes('open')) {
      return {
        targetApp: 'terminal',
        requiredTools: ['fs_read', 'fs_list'],
        workflow: ['read_file'],
        confidence: 75,
        reasoning: 'Intent suggests file operations',
        alternatives: [],
      };
    }
    
    if (intent.includes('web') || intent.includes('url') || intent.includes('summarize')) {
      return {
        targetApp: 'web',
        requiredTools: ['web.fetchAndCleanContent'],
        workflow: ['fetch_content', 'summarize'],
        confidence: 85,
        reasoning: 'Intent suggests web content processing',
        alternatives: [],
      };
    }
    
    // Default to notes app
    return {
      targetApp: 'notes',
      requiredTools: ['notes.createNote'],
      workflow: ['create_note'],
      confidence: 50,
      reasoning: 'Default fallback to notes app',
      alternatives: [],
    };
  }

  /**
   * Extract entities from user input
   */
  private async extractEntities(input: string): Promise<Record<string, any>> {
    // Simple entity extraction - could be enhanced with NLP
    const entities: Record<string, any> = {};
    
    // Extract URLs
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = input.match(urlRegex);
    if (urls) {
      entities.urls = urls;
    }
    
    // Extract file paths
    const filePathRegex = /[\/\\][^\s]*\.[a-zA-Z0-9]+/g;
    const filePaths = input.match(filePathRegex);
    if (filePaths) {
      entities.filePaths = filePaths;
    }
    
    // Extract commands
    const commandRegex = /(?:create|read|write|delete|update|search|find|open|close|save|load)/gi;
    const commands = input.match(commandRegex);
    if (commands) {
      entities.commands = commands;
    }
    
    return entities;
  }

  /**
   * Get user preferences
   */
  private async getUserPreferences(userId: string): Promise<Record<string, any>> {
    // This would fetch from user profile
    return {
      preferredApps: ['notes', 'terminal'],
      automationLevel: 'high',
      aiAssistance: true,
    };
  }

  /**
   * Create execution plan
   */
  private async createExecutionPlan(decision: OrchestrationDecision, inputs: Record<string, any>): Promise<ExecutionPlan> {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const steps: ExecutionStep[] = decision.workflow.map((workflowStep, index) => ({
      id: `step_${index + 1}`,
      type: this.determineStepType(workflowStep),
      tool: this.getToolForStep(workflowStep),
      app: decision.targetApp,
      action: workflowStep,
      input: this.prepareStepInput(workflowStep, inputs),
      dependencies: index > 0 ? [`step_${index}`] : [],
      timeout: 30000,
      retryPolicy: {
        maxAttempts: 3,
        backoffMs: 1000,
      },
    }));

    return {
      id: planId,
      taskId: planId,
      userId: inputs.userId || 'anonymous',
      steps,
      estimatedDuration: steps.length * 5000, // 5 seconds per step
      requiredPermissions: decision.mcpTools,
    };
  }

  /**
   * Determine step type from workflow step
   */
  private determineStepType(workflowStep: string): 'mcp_tool' | 'app_action' | 'ai_processing' | 'user_interaction' {
    if (workflowStep.includes('.')) {
      return 'mcp_tool';
    }
    if (workflowStep.includes('ai_') || workflowStep.includes('process_')) {
      return 'ai_processing';
    }
    if (workflowStep.includes('user_') || workflowStep.includes('interact_')) {
      return 'user_interaction';
    }
    return 'app_action';
  }

  /**
   * Get tool for step
   */
  private getToolForStep(workflowStep: string): string | undefined {
    if (workflowStep.includes('.')) {
      return workflowStep;
    }
    return undefined;
  }

  /**
   * Prepare step input
   */
  private prepareStepInput(workflowStep: string, inputs: Record<string, any>): Record<string, any> {
    return {
      ...inputs,
      workflowStep,
    };
  }

  /**
   * Learn from decision
   */
  private async learnFromDecision(
    userId: string,
    context: TaskContext,
    decision: OrchestrationDecision
  ): Promise<void> {
    // Track the decision in learning loop
    await learningLoopService.trackActivity(
      'orchestration_decision',
      {
        intent: context.intent,
        targetApp: decision.targetApp,
        confidence: decision.confidence,
        toolsUsed: decision.mcpTools,
      },
      { success: true }
    );
  }

  /**
   * Update performance metrics and learn from execution
   */
  private async updatePerformanceMetrics(
    taskId: string,
    appId: string,
    execution: {
      success: boolean;
      executionTime: number;
      steps: Array<{
        step: string;
        success: boolean;
        duration: number;
        result?: any;
        error?: string;
      }>;
      confidence: number;
    }
  ): Promise<void> {
    const existingMetrics = this.performanceMetrics.get(taskId);
    const now = new Date();

    if (existingMetrics) {
      // Update existing metrics
      existingMetrics.totalExecutions++;
      if (execution.success) {
        existingMetrics.successfulExecutions++;
      }
      
      // Update execution times
      existingMetrics.averageExecutionTime = 
        (existingMetrics.averageExecutionTime * (existingMetrics.totalExecutions - 1) + execution.executionTime) / 
        existingMetrics.totalExecutions;
      
      if (execution.executionTime < existingMetrics.bestExecutionTime) {
        existingMetrics.bestExecutionTime = execution.executionTime;
      }
      
      if (execution.executionTime > existingMetrics.worstExecutionTime) {
        existingMetrics.worstExecutionTime = execution.executionTime;
      }
      
      existingMetrics.successRate = existingMetrics.successfulExecutions / existingMetrics.totalExecutions;
      existingMetrics.lastExecution = now;
      
      // Calculate improvement rate
      const timeImprovement = existingMetrics.bestExecutionTime < existingMetrics.averageExecutionTime;
      existingMetrics.improvementRate = timeImprovement ? 0.1 : -0.05;
      
    } else {
      // Create new metrics
      const newMetrics: PerformanceMetrics = {
        taskId,
        appId,
        totalExecutions: 1,
        successfulExecutions: execution.success ? 1 : 0,
        averageExecutionTime: execution.executionTime,
        bestExecutionTime: execution.executionTime,
        worstExecutionTime: execution.executionTime,
        successRate: execution.success ? 1 : 0,
        improvementRate: 0,
        lastExecution: now,
        rewards: [],
        learningInsights: [],
      };
      
      this.performanceMetrics.set(taskId, newMetrics);
    }

    // Track in smart analyzer for pattern detection
    await this.smartAnalyzer.recordExecution({
      taskId,
      appId,
      executionTime: execution.executionTime,
      success: execution.success,
      confidence: execution.confidence,
      timestamp: now,
    });
  }

  /**
   * Calculate and award rewards for performance improvements
   */
  private async calculateRewards(
    userId: string,
    taskId: string,
    appId: string,
    execution: {
      success: boolean;
      executionTime: number;
      previousMetrics?: PerformanceMetrics;
    }
  ): Promise<void> {
    const metrics = this.performanceMetrics.get(taskId);
    if (!metrics) return;

    const rewards: Array<{ type: string; points: number; reason: string }> = [];

    // Speed improvement rewards
    if (execution.previousMetrics && execution.executionTime < execution.previousMetrics.bestExecutionTime) {
      const improvement = (execution.previousMetrics.bestExecutionTime - execution.executionTime) / execution.previousMetrics.bestExecutionTime;
      const speedReward = Math.floor(improvement * 100);
      rewards.push({
        type: 'speed_improvement',
        points: speedReward,
        reason: `Executed ${Math.round(improvement * 100)}% faster than previous best`,
      });
    }

    // Success streak rewards
    if (execution.success && metrics.successfulExecutions > 1) {
      const streakReward = Math.min(metrics.successfulExecutions * 5, 50);
      rewards.push({
        type: 'success_streak',
        points: streakReward,
        reason: `${metrics.successfulExecutions} successful executions in a row`,
      });
    }

    // Efficiency rewards (fast execution with high success rate)
    if (execution.success && metrics.successRate > 0.8 && execution.executionTime < metrics.averageExecutionTime) {
      const efficiencyReward = Math.floor((metrics.successRate * 50) + (execution.executionTime / metrics.averageExecutionTime * 25));
      rewards.push({
        type: 'efficiency_master',
        points: efficiencyReward,
        reason: `High success rate (${Math.round(metrics.successRate * 100)}%) with fast execution`,
      });
    }

    // Learning rewards (first successful execution)
    if (execution.success && metrics.totalExecutions === 1) {
      rewards.push({
        type: 'first_success',
        points: 25,
        reason: 'First successful execution of this task',
      });
    }

    // Award rewards
    for (const reward of rewards) {
      await this.rewardSystem.awardReward(userId, {
        type: reward.type,
        points: reward.points,
        description: reward.reason,
        metadata: {
          taskId,
          appId,
          executionTime: execution.executionTime,
          success: execution.success,
        },
      });

      // Add to metrics
      metrics.rewards.push({
        type: reward.type,
        points: reward.points,
        timestamp: new Date(),
      });
    }

    // Update progress tracker
    await this.progressTracker.recordProgress(userId, {
      taskId,
      appId,
      executionTime: execution.executionTime,
      success: execution.success,
      rewards: rewards.map(r => r.points).reduce((a, b) => a + b, 0),
    });
  }

  /**
   * Generate learning insights from execution
   */
  private async generateLearningInsights(
    taskId: string,
    decision: OrchestrationDecision,
    executionSteps: Array<{
      step: string;
      success: boolean;
      duration: number;
      result?: any;
      error?: string;
    }>
  ): Promise<void> {
    const metrics = this.performanceMetrics.get(taskId);
    if (!metrics) return;

    const insights: Array<{ insight: string; confidence: number }> = [];

    // Analyze step performance
    const successfulSteps = executionSteps.filter(step => step.success);
    const failedSteps = executionSteps.filter(step => !step.success);
    
    if (successfulSteps.length === executionSteps.length) {
      insights.push({
        insight: `All ${executionSteps.length} steps executed successfully`,
        confidence: 0.9,
      });
    }

    // Analyze execution time patterns
    const avgStepTime = executionSteps.reduce((sum, step) => sum + step.duration, 0) / executionSteps.length;
    const slowestStep = executionSteps.reduce((slowest, step) => 
      step.duration > slowest.duration ? step : slowest
    );

    if (slowestStep.duration > avgStepTime * 2) {
      insights.push({
        insight: `Step '${slowestStep.step}' is taking ${Math.round(slowestStep.duration / avgStepTime)}x longer than average`,
        confidence: 0.8,
      });
    }

    // Analyze app selection confidence
    if (decision.confidence > 0.9) {
      insights.push({
        insight: `High confidence (${Math.round(decision.confidence * 100)}%) in app selection for ${decision.targetApp}`,
        confidence: 0.85,
      });
    } else if (decision.confidence < 0.6) {
      insights.push({
        insight: `Low confidence (${Math.round(decision.confidence * 100)}%) in app selection - consider alternatives`,
        confidence: 0.7,
      });
    }

    // Analyze tool usage patterns
    const toolUsage = decision.mcpTools.length;
    if (toolUsage > 3) {
      insights.push({
        insight: `Using ${toolUsage} MCP tools - consider simplifying workflow`,
        confidence: 0.6,
      });
    }

    // Store insights
    for (const insight of insights) {
      metrics.learningInsights.push({
        insight: insight.insight,
        confidence: insight.confidence,
        timestamp: new Date(),
      });
    }

    // Use smart analyzer to detect patterns
    await this.smartAnalyzer.analyzePatterns(taskId, {
      decision,
      executionSteps,
      metrics,
    });
  }

  /**
   * Get orchestration statistics with learning insights
   */
  async getStats(): Promise<{
    totalDecisions: number;
    successRate: number;
    averageConfidence: number;
    mostUsedApps: Array<{ app: string; count: number }>;
    mostUsedTools: Array<{ tool: string; count: number }>;
    performanceInsights: Array<{
      taskId: string;
      appId: string;
      improvementRate: number;
      totalRewards: number;
      recentInsights: string[];
    }>;
    learningProgress: {
      totalRewards: number;
      level: number;
      achievements: number;
      improvementTrend: 'up' | 'down' | 'stable';
    };
  }> {
    // Get basic stats from learning loop
    const basicStats = await learningLoopService.getInsights('system', 100);
    
    // Calculate performance insights
    const performanceInsights = Array.from(this.performanceMetrics.values()).map(metrics => ({
      taskId: metrics.taskId,
      appId: metrics.appId,
      improvementRate: metrics.improvementRate,
      totalRewards: metrics.rewards.reduce((sum, reward) => sum + reward.points, 0),
      recentInsights: metrics.learningInsights.slice(-3).map(insight => insight.insight),
    }));

    // Get learning progress from reward system
    const userProgress = await this.progressTracker.getUserProgress('system');
    const totalRewards = Array.from(this.performanceMetrics.values())
      .reduce((sum, metrics) => sum + metrics.rewards.reduce((s, r) => s + r.points, 0), 0);

    return {
      totalDecisions: basicStats.length,
      successRate: performanceInsights.reduce((sum, p) => sum + (p.improvementRate > 0 ? 1 : 0), 0) / performanceInsights.length || 0,
      averageConfidence: 0.8, // This would be calculated from actual data
      mostUsedApps: [], // This would be calculated from actual data
      mostUsedTools: [], // This would be calculated from actual data
      performanceInsights,
      learningProgress: {
        totalRewards,
        level: userProgress?.level || 1,
        achievements: userProgress?.achievements || 0,
        improvementTrend: performanceInsights.some(p => p.improvementRate > 0) ? 'up' : 'stable',
      },
    };
  }
}

// Export singleton instance
export const orchestrationAgent = new OrchestrationAgent();
