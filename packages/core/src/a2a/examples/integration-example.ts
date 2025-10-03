/**
 * A2A System Integration Example
 * Demonstrates how to use Message Bus and Task Scheduler together
 */

import { A2AMessageBus } from '../message-bus';
import { TaskScheduler, Task, TaskTier, TaskCategory, TaskResult } from '../task-scheduler';
import { MessageType, Priority, A2AMessage } from '../types';

/**
 * Example: Multi-Agent Task Processing System
 * 
 * This example shows:
 * 1. Setting up agents with different skill levels
 * 2. Creating tasks with progressive difficulty
 * 3. Using message bus for agent communication
 * 4. Task assignment and completion workflow
 * 5. Agent learning and tier advancement
 */

class Agent {
  constructor(
    public id: string,
    private messageBus: A2AMessageBus,
    private scheduler: TaskScheduler
  ) {
    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    // Handle task requests
    this.messageBus.subscribe({
      type: MessageType.TASK_REQUEST,
      to: this.id
    }, async (msg) => {
      console.log(`[${this.id}] Received task request:`, msg.payload);
      await this.processTaskRequest(msg);
    });

    // Handle collaboration requests
    this.messageBus.subscribe({
      type: MessageType.COLLABORATION_REQUEST,
      to: this.id
    }, async (msg) => {
      console.log(`[${this.id}] Received collaboration request:`, msg.payload);
      await this.handleCollaboration(msg);
    });

    // Handle state updates
    this.messageBus.subscribe({
      type: MessageType.STATE_UPDATE,
      to: 'broadcast'
    }, async (msg) => {
      console.log(`[${this.id}] System state update:`, msg.payload);
    });
  }

  private async processTaskRequest(msg: A2AMessage): Promise<void> {
    const task = this.scheduler.getNextTask(this.id);
    
    if (!task) {
      // No suitable task available
      await this.messageBus.publish({
        id: `${this.id}-resp-${Date.now()}`,
        from: this.id,
        to: msg.from,
        type: MessageType.TASK_RESPONSE,
        payload: { 
          available: false,
          reason: 'No suitable tasks available'
        },
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false,
        correlationId: msg.correlationId
      });
      return;
    }

    // Accept task
    await this.messageBus.publish({
      id: `${this.id}-resp-${Date.now()}`,
      from: this.id,
      to: msg.from,
      type: MessageType.TASK_RESPONSE,
      payload: { 
        available: true,
        taskId: task.id,
        estimatedTime: task.estimatedTime
      },
      priority: Priority.NORMAL,
      timestamp: Date.now(),
      requiresResponse: false,
      correlationId: msg.correlationId
    });

    // Execute task
    await this.executeTask(task);
  }

  private async executeTask(task: Task): Promise<void> {
    console.log(`[${this.id}] Starting task: ${task.title}`);
    
    const startTime = Date.now();

    // Simulate task execution with progress updates
    for (let progress = 0; progress <= 100; progress += 25) {
      this.scheduler.updateProgress(task.id, {
        taskId: task.id,
        agentId: this.id,
        startTime,
        completionPercentage: progress,
        currentStep: `Step ${progress / 25 + 1}`
      });

      // Broadcast progress
      await this.messageBus.publish({
        id: `${this.id}-progress-${Date.now()}`,
        from: this.id,
        to: 'broadcast',
        type: MessageType.TASK_PROGRESS,
        payload: {
          taskId: task.id,
          progress,
          currentStep: `Step ${progress / 25 + 1}`
        },
        priority: Priority.LOW,
        timestamp: Date.now(),
        requiresResponse: false
      });

      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Complete task
    const completionTime = Date.now() - startTime;
    const quality = 70 + Math.random() * 30; // 70-100
    const success = quality > 60;

    const result: TaskResult = {
      taskId: task.id,
      agentId: this.id,
      success,
      completionTime,
      quality,
      learningGained: success ? task.learningValue : 0
    };

    this.scheduler.completeTask(result);

    // Broadcast completion
    await this.messageBus.publish({
      id: `${this.id}-complete-${Date.now()}`,
      from: this.id,
      to: 'broadcast',
      type: MessageType.TASK_COMPLETE,
      payload: {
        taskId: task.id,
        success,
        quality,
        completionTime
      },
      priority: Priority.NORMAL,
      timestamp: Date.now(),
      requiresResponse: false
    });

    console.log(`[${this.id}] Completed task: ${task.title} (Quality: ${quality.toFixed(1)})`);

    // Check for tier advancement
    const stats = this.scheduler.getAgentStats(this.id);
    if (stats) {
      console.log(`[${this.id}] Stats - Tier: ${stats.currentTier}, XP: ${stats.totalExperience}, Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
    }
  }

  private async handleCollaboration(msg: A2AMessage): Promise<void> {
    const request = msg.payload;
    const stats = this.scheduler.getAgentStats(this.id);
    
    if (!stats) return;

    // Check if agent has required capability
    const hasCapability = stats.skills.has(request.requiredCapability);
    const proficiency = stats.skills.get(request.requiredCapability) ?? 0;

    const accepted = hasCapability && proficiency >= 50;

    await this.messageBus.publish({
      id: `${this.id}-collab-resp-${Date.now()}`,
      from: this.id,
      to: msg.from,
      type: accepted ? MessageType.COLLABORATION_ACCEPT : MessageType.COLLABORATION_REJECT,
      payload: {
        accepted,
        estimatedTime: accepted ? 15 : undefined,
        reason: accepted ? undefined : 'Insufficient capability'
      },
      priority: Priority.HIGH,
      timestamp: Date.now(),
      requiresResponse: false,
      correlationId: msg.correlationId
    });
  }

  async requestTask(): Promise<void> {
    await this.messageBus.publish({
      id: `${this.id}-req-${Date.now()}`,
      from: this.id,
      to: 'coordinator',
      type: MessageType.TASK_REQUEST,
      payload: { agentId: this.id },
      priority: Priority.NORMAL,
      timestamp: Date.now(),
      requiresResponse: true
    });
  }
}

class TaskCoordinator {
  constructor(
    private messageBus: A2AMessageBus,
    private scheduler: TaskScheduler
  ) {
    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    this.messageBus.subscribe({
      type: MessageType.TASK_REQUEST,
      to: 'coordinator'
    }, async (msg) => {
      console.log('[Coordinator] Received task request from:', msg.from);
      
      // Forward to agent's own handler
      await this.messageBus.publish({
        id: `coord-fwd-${Date.now()}`,
        from: 'coordinator',
        to: msg.from,
        type: MessageType.TASK_REQUEST,
        payload: msg.payload,
        priority: Priority.NORMAL,
        timestamp: Date.now(),
        requiresResponse: false,
        correlationId: msg.correlationId
      });
    });
  }

  async broadcastSystemState(state: any): Promise<void> {
    await this.messageBus.publish({
      id: `coord-state-${Date.now()}`,
      from: 'coordinator',
      to: 'broadcast',
      type: MessageType.STATE_UPDATE,
      payload: state,
      priority: Priority.LOW,
      timestamp: Date.now(),
      requiresResponse: false
    });
  }
}

/**
 * Run the integration example
 */
export async function runIntegrationExample(): Promise<void> {
  console.log('=== A2A System Integration Example ===\n');

  // Initialize systems
  const messageBus = new A2AMessageBus();
  const scheduler = new TaskScheduler({
    maxConcurrentTasks: 2,
    learningThreshold: 300,
    enableAdaptiveLearning: true
  });

  // Create coordinator
  const coordinator = new TaskCoordinator(messageBus, scheduler);

  // Register agents with different skill levels
  scheduler.registerAgent('agent-junior', {
    'javascript': 40,
    'data-processing': 35
  });

  scheduler.registerAgent('agent-mid', {
    'javascript': 70,
    'api': 65,
    'data-processing': 60
  });

  scheduler.registerAgent('agent-senior', {
    'javascript': 90,
    'api': 85,
    'optimization': 80,
    'data-processing': 85
  });

  // Create agent instances
  const juniorAgent = new Agent('agent-junior', messageBus, scheduler);
  const midAgent = new Agent('agent-mid', messageBus, scheduler);
  const seniorAgent = new Agent('agent-senior', messageBus, scheduler);

  // Create tasks with progressive difficulty
  const tasks: Task[] = [
    {
      id: 'task-1',
      category: TaskCategory.DATA_PROCESSING,
      tier: TaskTier.BEGINNER,
      title: 'Parse CSV File',
      description: 'Parse and validate CSV data',
      estimatedTime: 10,
      learningValue: 30,
      prerequisites: [],
      skills: ['data-processing'],
      priority: Priority.NORMAL
    },
    {
      id: 'task-2',
      category: TaskCategory.API_INTEGRATION,
      tier: TaskTier.INTERMEDIATE,
      title: 'REST API Integration',
      description: 'Integrate with external REST API',
      estimatedTime: 20,
      learningValue: 50,
      prerequisites: [],
      skills: ['javascript', 'api'],
      priority: Priority.HIGH
    },
    {
      id: 'task-3',
      category: TaskCategory.SYSTEM_OPTIMIZATION,
      tier: TaskTier.ADVANCED,
      title: 'Performance Optimization',
      description: 'Optimize system performance',
      estimatedTime: 30,
      learningValue: 70,
      prerequisites: [],
      skills: ['optimization', 'javascript'],
      priority: Priority.NORMAL
    },
    {
      id: 'task-4',
      category: TaskCategory.CODE_ANALYSIS,
      tier: TaskTier.BEGINNER,
      title: 'Code Review',
      description: 'Review code quality',
      estimatedTime: 15,
      learningValue: 35,
      prerequisites: [],
      skills: ['javascript'],
      priority: Priority.LOW
    }
  ];

  // Add tasks to scheduler
  tasks.forEach(task => scheduler.addTask(task));

  console.log(`Added ${tasks.length} tasks to scheduler\n`);

  // Broadcast system state
  await coordinator.broadcastSystemState({
    status: 'active',
    tasksAvailable: tasks.length,
    agentsOnline: 3
  });

  // Agents request tasks
  console.log('--- Agents requesting tasks ---\n');
  await juniorAgent.requestTask();
  await midAgent.requestTask();
  await seniorAgent.requestTask();

  // Wait for tasks to complete
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Print final statistics
  console.log('\n=== Final Statistics ===\n');

  const schedulerStats = scheduler.getStats();
  console.log('Scheduler Stats:');
  console.log(`  Total Tasks: ${schedulerStats.totalTasks}`);
  console.log(`  Completed: ${schedulerStats.completedTasks}`);
  console.log(`  Active: ${schedulerStats.activeTasks}`);
  console.log(`  Queued: ${schedulerStats.queuedTasks}`);
  console.log(`  Average Success Rate: ${(schedulerStats.averageSuccessRate * 100).toFixed(1)}%\n`);

  const messageBusStats = messageBus.getStats();
  console.log('Message Bus Stats:');
  console.log(`  Total Messages: ${messageBusStats.totalMessages}`);
  console.log(`  Active Subscribers: ${messageBusStats.activeSubscribers}`);
  console.log(`  Queue Size: ${messageBusStats.queueSize}\n`);

  ['agent-junior', 'agent-mid', 'agent-senior'].forEach(agentId => {
    const stats = scheduler.getAgentStats(agentId);
    if (stats) {
      console.log(`${agentId}:`);
      console.log(`  Tier: ${stats.currentTier}`);
      console.log(`  Total XP: ${stats.totalExperience}`);
      console.log(`  Completed Tasks: ${stats.completedTasks.length}`);
      console.log(`  Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
      console.log(`  Skills:`, Object.fromEntries(stats.skills));
      console.log();
    }
  });

  // Cleanup
  messageBus.shutdown();

  console.log('=== Example Complete ===');
}

// Run if executed directly
if (require.main === module) {
  runIntegrationExample().catch(console.error);
}
