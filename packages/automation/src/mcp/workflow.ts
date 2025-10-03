import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as admin from 'firebase-admin';
import { canCreateWorkflow, canExecuteWorkflow, isProUser } from '@auraos/billing';
import type { UserSubscription } from '@auraos/billing';

/**
 * WorkflowMCP Server with subscription-based feature gating
 */
export class WorkflowMCP {
  private server: Server;
  private firestore: admin.firestore.Firestore;

  constructor() {
    this.server = new Server(
      {
        name: 'workflow-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Firestore
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    this.firestore = admin.firestore();

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_workflow',
          description: 'Create a new automation workflow (Pro: unlimited, Free: max 3)',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'User ID',
              },
              name: {
                type: 'string',
                description: 'Workflow name',
              },
              description: {
                type: 'string',
                description: 'Workflow description',
              },
              trigger: {
                type: 'object',
                description: 'Workflow trigger configuration',
              },
              actions: {
                type: 'array',
                description: 'Workflow actions',
              },
            },
            required: ['userId', 'name', 'trigger', 'actions'],
          },
        },
        {
          name: 'execute_workflow',
          description: 'Execute a workflow (Pro: unlimited, Free: 100/month)',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'User ID',
              },
              workflowId: {
                type: 'string',
                description: 'Workflow ID to execute',
              },
            },
            required: ['userId', 'workflowId'],
          },
        },
        {
          name: 'list_workflows',
          description: 'List user workflows',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'User ID',
              },
            },
            required: ['userId'],
          },
        },
        {
          name: 'delete_workflow',
          description: 'Delete a workflow',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'User ID',
              },
              workflowId: {
                type: 'string',
                description: 'Workflow ID to delete',
              },
            },
            required: ['userId', 'workflowId'],
          },
        },
        {
          name: 'get_subscription_status',
          description: 'Get user subscription status and limits',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'User ID',
              },
            },
            required: ['userId'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'create_workflow':
          return await this.createWorkflow(args);
        case 'execute_workflow':
          return await this.executeWorkflow(args);
        case 'list_workflows':
          return await this.listWorkflows(args);
        case 'delete_workflow':
          return await this.deleteWorkflow(args);
        case 'get_subscription_status':
          return await this.getSubscriptionStatus(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  /**
   * Get user subscription from Firestore
   */
  private async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const userDoc = await this.firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }

    return userDoc.data()?.subscription || null;
  }

  /**
   * Get user's current workflow count
   */
  private async getWorkflowCount(userId: string): Promise<number> {
    const workflowsSnapshot = await this.firestore
      .collection('workflows')
      .where('owner', '==', userId)
      .where('enabled', '==', true)
      .get();

    return workflowsSnapshot.size;
  }

  /**
   * Get user's executions this month
   */
  private async getExecutionsThisMonth(userId: string): Promise<number> {
    const userDoc = await this.firestore.collection('users').doc(userId).get();
    return userDoc.data()?.usage?.executionsThisMonth || 0;
  }

  /**
   * Create a new workflow with feature gating
   */
  private async createWorkflow(args: any) {
    const { userId, name, description, trigger, actions } = args;

    // Get user subscription
    const subscription = await this.getUserSubscription(userId);
    const currentCount = await this.getWorkflowCount(userId);

    // Check if user can create more workflows
    const { allowed, reason } = canCreateWorkflow(subscription, currentCount);

    if (!allowed) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: reason,
              upgradeRequired: true,
              currentTier: subscription?.tier || 'free',
              currentCount,
              limit: 3,
            }),
          },
        ],
      };
    }

    // Create workflow
    const workflowRef = this.firestore.collection('workflows').doc();
    const workflow = {
      id: workflowRef.id,
      name,
      description: description || '',
      owner: userId,
      trigger,
      actions,
      enabled: true,
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await workflowRef.set(workflow);

    // Update user's workflow count
    await this.firestore.collection('users').doc(userId).set(
      {
        usage: {
          workflowCount: admin.firestore.FieldValue.increment(1),
        },
      },
      { merge: true }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            workflow: {
              id: workflowRef.id,
              name,
              description,
            },
            message: 'Workflow created successfully',
          }),
        },
      ],
    };
  }

  /**
   * Execute a workflow with feature gating
   */
  private async executeWorkflow(args: any) {
    const { userId, workflowId } = args;

    // Get user subscription
    const subscription = await this.getUserSubscription(userId);
    const executionsThisMonth = await this.getExecutionsThisMonth(userId);

    // Check if user can execute more workflows
    const { allowed, reason } = canExecuteWorkflow(subscription, executionsThisMonth);

    if (!allowed) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: reason,
              upgradeRequired: true,
              currentTier: subscription?.tier || 'free',
              executionsThisMonth,
              limit: 100,
            }),
          },
        ],
      };
    }

    // Get workflow
    const workflowDoc = await this.firestore.collection('workflows').doc(workflowId).get();

    if (!workflowDoc.exists) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Workflow not found',
            }),
          },
        ],
      };
    }

    const workflow = workflowDoc.data();

    // Verify ownership
    if (workflow?.owner !== userId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Unauthorized: You do not own this workflow',
            }),
          },
        ],
      };
    }

    // Create execution record
    const executionRef = this.firestore.collection('workflow_executions').doc();
    const execution = {
      id: executionRef.id,
      workflowId,
      userId,
      status: 'running',
      startedAt: Date.now(),
      logs: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await executionRef.set(execution);

    // Execute workflow (simplified - actual execution would be more complex)
    try {
      // Simulate workflow execution
      const result = {
        success: true,
        output: 'Workflow executed successfully',
      };

      // Update execution record
      await executionRef.update({
        status: 'success',
        completedAt: Date.now(),
        duration: 1000,
        result,
      });

      // Update workflow stats
      await workflowDoc.ref.update({
        'stats.totalRuns': admin.firestore.FieldValue.increment(1),
        'stats.successfulRuns': admin.firestore.FieldValue.increment(1),
        'stats.lastRunStatus': 'success',
        lastRun: Date.now(),
      });

      // Update user's execution count
      await this.firestore.collection('users').doc(userId).set(
        {
          usage: {
            executionsThisMonth: admin.firestore.FieldValue.increment(1),
          },
        },
        { merge: true }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              executionId: executionRef.id,
              result,
              message: 'Workflow executed successfully',
            }),
          },
        ],
      };
    } catch (error) {
      // Update execution record with error
      await executionRef.update({
        status: 'failed',
        completedAt: Date.now(),
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      // Update workflow stats
      await workflowDoc.ref.update({
        'stats.totalRuns': admin.firestore.FieldValue.increment(1),
        'stats.failedRuns': admin.firestore.FieldValue.increment(1),
        'stats.lastRunStatus': 'failed',
        lastRun: Date.now(),
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
          },
        ],
      };
    }
  }

  /**
   * List user workflows
   */
  private async listWorkflows(args: any) {
    const { userId } = args;

    const workflowsSnapshot = await this.firestore
      .collection('workflows')
      .where('owner', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const workflows = workflowsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            workflows,
            count: workflows.length,
          }),
        },
      ],
    };
  }

  /**
   * Delete a workflow
   */
  private async deleteWorkflow(args: any) {
    const { userId, workflowId } = args;

    const workflowDoc = await this.firestore.collection('workflows').doc(workflowId).get();

    if (!workflowDoc.exists) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Workflow not found',
            }),
          },
        ],
      };
    }

    const workflow = workflowDoc.data();

    // Verify ownership
    if (workflow?.owner !== userId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Unauthorized: You do not own this workflow',
            }),
          },
        ],
      };
    }

    // Delete workflow
    await workflowDoc.ref.delete();

    // Update user's workflow count
    await this.firestore.collection('users').doc(userId).set(
      {
        usage: {
          workflowCount: admin.firestore.FieldValue.increment(-1),
        },
      },
      { merge: true }
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Workflow deleted successfully',
          }),
        },
      ],
    };
  }

  /**
   * Get subscription status and limits
   */
  private async getSubscriptionStatus(args: any) {
    const { userId } = args;

    const subscription = await this.getUserSubscription(userId);
    const workflowCount = await this.getWorkflowCount(userId);
    const executionsThisMonth = await this.getExecutionsThisMonth(userId);

    const isPro = isProUser(subscription);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            subscription: {
              tier: subscription?.tier || 'free',
              status: subscription?.status || 'active',
              isPro,
            },
            usage: {
              workflows: {
                current: workflowCount,
                limit: isPro ? 'unlimited' : 3,
                percentage: isPro ? 0 : (workflowCount / 3) * 100,
              },
              executions: {
                current: executionsThisMonth,
                limit: isPro ? 'unlimited' : 100,
                percentage: isPro ? 0 : (executionsThisMonth / 100) * 100,
              },
            },
            limits: {
              maxWorkflows: isPro ? -1 : 3,
              maxExecutionsPerMonth: isPro ? -1 : 100,
              advancedFeatures: isPro,
              prioritySupport: isPro,
            },
          }),
        },
      ],
    };
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('WorkflowMCP server started');
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new WorkflowMCP();
  server.start().catch(console.error);
}
