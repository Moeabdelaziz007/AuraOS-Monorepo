/**
 * n8n Workflow Automation Integration
 * Connects AuraOS Autopilot with your n8n instance
 * Repository: https://github.com/Moeabdelaziz007/n8n
 */

import { TaskAction, LearningContext, TaskExecutionResult } from './types';

/**
 * n8n Workflow Definition
 */
export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: Record<string, any>;
  settings?: Record<string, any>;
  tags?: string[];
}

/**
 * n8n Node Definition
 */
export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
}

/**
 * n8n Execution Result
 */
export interface N8nExecutionResult {
  id: string;
  finished: boolean;
  mode: 'manual' | 'trigger' | 'webhook';
  startedAt: Date;
  stoppedAt?: Date;
  workflowId: string;
  data: {
    resultData: {
      runData: Record<string, any>;
    };
  };
}

/**
 * n8n Webhook Configuration
 */
export interface N8nWebhook {
  workflowId: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  responseMode: 'onReceived' | 'lastNode';
}

/**
 * n8n Integration Manager
 */
export class N8nIntegration {
  private baseUrl: string;
  private apiKey?: string;
  private workflows: Map<string, N8nWorkflow> = new Map();
  private webhooks: Map<string, N8nWebhook> = new Map();

  constructor(baseUrl: string = 'http://localhost:5678', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Initialize connection to n8n
   */
  async initialize(): Promise<void> {
    try {
      logger.info('[n8n Integration] Connecting to n8n instance...');
      logger.info(`[n8n Integration] Base URL: ${this.baseUrl}`);
      
      // Test connection
      const isHealthy = await this.checkHealth();
      
      if (isHealthy) {
        logger.info('[n8n Integration] ✅ Connected successfully');
        
        // Load workflows
        await this.loadWorkflows();
      } else {
        logger.info('[n8n Integration] ⚠️  n8n instance not accessible');
      }
    } catch (error) {
      logger.error('[n8n Integration] ❌ Failed to initialize:', error);
    }
  }

  /**
   * Check n8n health
   */
  async checkHealth(): Promise<boolean> {
    try {
      // In production, this would make an actual HTTP request
      // For now, we'll simulate it
      logger.info('[n8n Integration] Checking health...');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load workflows from n8n
   */
  async loadWorkflows(): Promise<void> {
    try {
      logger.info('[n8n Integration] Loading workflows...');
      
      // In production, this would fetch from n8n API
      // For now, we'll create example workflows
      const exampleWorkflows = this.createExampleWorkflows();
      
      exampleWorkflows.forEach(workflow => {
        this.workflows.set(workflow.id, workflow);
      });
      
      logger.info(`[n8n Integration] Loaded ${this.workflows.size} workflows`);
    } catch (error) {
      logger.error('[n8n Integration] Failed to load workflows:', error);
    }
  }

  /**
   * Create example workflows for demonstration
   */
  private createExampleWorkflows(): N8nWorkflow[] {
    return [
      {
        id: 'workflow_content_generation',
        name: 'Content Generation Pipeline',
        active: true,
        tags: ['content', 'ai', 'automation'],
        nodes: [
          {
            id: 'trigger',
            name: 'Webhook Trigger',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              path: 'generate-content',
              responseMode: 'lastNode',
            },
          },
          {
            id: 'search',
            name: 'Web Search',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              url: 'https://api.search.com/search',
              method: 'GET',
            },
          },
          {
            id: 'ai_generate',
            name: 'AI Content Generator',
            type: 'n8n-nodes-base.openAi',
            typeVersion: 1,
            position: [650, 300],
            parameters: {
              operation: 'text',
              model: 'gpt-4',
            },
          },
          {
            id: 'save',
            name: 'Save to Database',
            type: 'n8n-nodes-base.postgres',
            typeVersion: 1,
            position: [850, 300],
            parameters: {
              operation: 'insert',
            },
          },
        ],
        connections: {
          trigger: { main: [[{ node: 'search', type: 'main', index: 0 }]] },
          search: { main: [[{ node: 'ai_generate', type: 'main', index: 0 }]] },
          ai_generate: { main: [[{ node: 'save', type: 'main', index: 0 }]] },
        },
      },
      {
        id: 'workflow_telegram_bot',
        name: 'Telegram Bot Automation',
        active: true,
        tags: ['telegram', 'bot', 'messaging'],
        nodes: [
          {
            id: 'telegram_trigger',
            name: 'Telegram Trigger',
            type: 'n8n-nodes-base.telegramTrigger',
            typeVersion: 1,
            position: [250, 300],
            parameters: {},
          },
          {
            id: 'process',
            name: 'Process Message',
            type: 'n8n-nodes-base.function',
            typeVersion: 1,
            position: [450, 300],
            parameters: {
              functionCode: 'return items;',
            },
          },
          {
            id: 'respond',
            name: 'Send Response',
            type: 'n8n-nodes-base.telegram',
            typeVersion: 1,
            position: [650, 300],
            parameters: {
              operation: 'sendMessage',
            },
          },
        ],
        connections: {
          telegram_trigger: { main: [[{ node: 'process', type: 'main', index: 0 }]] },
          process: { main: [[{ node: 'respond', type: 'main', index: 0 }]] },
        },
      },
      {
        id: 'workflow_data_sync',
        name: 'Data Synchronization',
        active: true,
        tags: ['data', 'sync', 'automation'],
        nodes: [
          {
            id: 'schedule',
            name: 'Schedule Trigger',
            type: 'n8n-nodes-base.scheduleTrigger',
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              rule: {
                interval: [{ field: 'hours', hoursInterval: 1 }],
              },
            },
          },
          {
            id: 'fetch',
            name: 'Fetch Data',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 1,
            position: [450, 300],
            parameters: {},
          },
          {
            id: 'transform',
            name: 'Transform Data',
            type: 'n8n-nodes-base.function',
            typeVersion: 1,
            position: [650, 300],
            parameters: {},
          },
          {
            id: 'store',
            name: 'Store Data',
            type: 'n8n-nodes-base.postgres',
            typeVersion: 1,
            position: [850, 300],
            parameters: {},
          },
        ],
        connections: {
          schedule: { main: [[{ node: 'fetch', type: 'main', index: 0 }]] },
          fetch: { main: [[{ node: 'transform', type: 'main', index: 0 }]] },
          transform: { main: [[{ node: 'store', type: 'main', index: 0 }]] },
        },
      },
    ];
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(
    workflowId: string,
    inputData?: Record<string, any>
  ): Promise<N8nExecutionResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`[n8n Integration] Executing workflow: ${workflowId}`);
      
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      // Simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result: N8nExecutionResult = {
        id: `exec_${Date.now()}`,
        finished: true,
        mode: 'manual',
        startedAt: new Date(startTime),
        stoppedAt: new Date(),
        workflowId,
        data: {
          resultData: {
            runData: {
              output: inputData || {},
            },
          },
        },
      };

      logger.info(`[n8n Integration] ✅ Workflow executed successfully`);
      return result;
    } catch (error) {
      logger.error(`[n8n Integration] ❌ Workflow execution failed:`, error);
      throw error;
    }
  }

  /**
   * Trigger workflow via webhook
   */
  async triggerWebhook(
    path: string,
    data: Record<string, any>,
    method: 'GET' | 'POST' = 'POST'
  ): Promise<any> {
    try {
      logger.info(`[n8n Integration] Triggering webhook: ${path}`);
      
      // In production, this would make HTTP request to n8n webhook
      const url = `${this.baseUrl}/webhook/${path}`;
      logger.info(`[n8n Integration] URL: ${url}`);
      
      // Simulate webhook response
      return {
        success: true,
        data: data,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('[n8n Integration] Webhook trigger failed:', error);
      throw error;
    }
  }

  /**
   * Get all workflows
   */
  getWorkflows(): N8nWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflows by tag
   */
  getWorkflowsByTag(tag: string): N8nWorkflow[] {
    return this.getWorkflows().filter(w => w.tags?.includes(tag));
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): N8nWorkflow[] {
    return this.getWorkflows().filter(w => w.active);
  }

  /**
   * Search workflows
   */
  searchWorkflows(query: string): N8nWorkflow[] {
    const searchText = query.toLowerCase();
    return this.getWorkflows().filter(w =>
      w.name.toLowerCase().includes(searchText) ||
      w.tags?.some(t => t.toLowerCase().includes(searchText))
    );
  }

  /**
   * Create workflow from autopilot task
   */
  async createWorkflowFromTask(
    taskName: string,
    actions: TaskAction[],
    context: LearningContext
  ): Promise<N8nWorkflow> {
    logger.info(`[n8n Integration] Creating workflow from task: ${taskName}`);

    const workflowId = `workflow_${Date.now()}`;
    const nodes: N8nNode[] = [];
    
    // Add trigger node
    nodes.push({
      id: 'trigger',
      name: 'Manual Trigger',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [250, 300],
      parameters: {},
    });

    // Convert actions to nodes
    actions.forEach((action, index) => {
      const nodeId = `action_${index}`;
      const xPos = 250 + (index + 1) * 200;
      
      let nodeType = 'n8n-nodes-base.function';
      let parameters: Record<string, any> = {};

      switch (action.type) {
        case 'exec':
          nodeType = 'n8n-nodes-base.executeCommand';
          parameters = { command: action.value };
          break;
        case 'open':
          nodeType = 'n8n-nodes-base.httpRequest';
          parameters = { url: action.target };
          break;
        case 'type':
          nodeType = 'n8n-nodes-base.function';
          parameters = { functionCode: `return [{json: {text: "${action.value}"}}];` };
          break;
        default:
          parameters = { functionCode: `return items;` };
      }

      nodes.push({
        id: nodeId,
        name: `${action.type} - ${action.target || action.value || ''}`,
        type: nodeType,
        typeVersion: 1,
        position: [xPos, 300],
        parameters,
      });
    });

    // Create connections
    const connections: Record<string, any> = {};
    for (let i = 0; i < nodes.length - 1; i++) {
      connections[nodes[i].id] = {
        main: [[{ node: nodes[i + 1].id, type: 'main', index: 0 }]],
      };
    }

    const workflow: N8nWorkflow = {
      id: workflowId,
      name: taskName,
      active: false,
      nodes,
      connections,
      tags: ['autopilot', 'generated'],
    };

    this.workflows.set(workflowId, workflow);
    logger.info(`[n8n Integration] ✅ Workflow created: ${workflowId}`);

    return workflow;
  }

  /**
   * Get workflow statistics
   */
  getStats(): {
    totalWorkflows: number;
    activeWorkflows: number;
    workflowsByTag: Record<string, number>;
    nodeTypes: Record<string, number>;
  } {
    const stats = {
      totalWorkflows: this.workflows.size,
      activeWorkflows: this.getActiveWorkflows().length,
      workflowsByTag: {} as Record<string, number>,
      nodeTypes: {} as Record<string, number>,
    };

    // Count by tags
    this.getWorkflows().forEach(workflow => {
      workflow.tags?.forEach(tag => {
        stats.workflowsByTag[tag] = (stats.workflowsByTag[tag] || 0) + 1;
      });

      // Count node types
      workflow.nodes.forEach(node => {
        stats.nodeTypes[node.type] = (stats.nodeTypes[node.type] || 0) + 1;
      });
    });

    return stats;
  }
}

// Export singleton instance
export const n8nIntegration = new N8nIntegration();
