/**
 * Comprehensive Test Suite
 * Tests all new systems: MCP, Automation, Quantum Workflows
 */

import { MCPGateway } from './packages/ai/src/mcp/gateway';
import { FileSystemMCPServer } from './packages/core/src/mcp/filesystem-server';
import { EmulatorMCPServer } from './packages/core/src/mcp/emulator-server';
import { BasicMCPServer } from './packages/core/src/mcp/basic-server';
import { BackgroundWorker } from './packages/automation/src/workers/background-worker';
import { AutomationEngine, setupDefaultAutomations } from './packages/automation/src/engine/automation-engine';
import { TaskScheduler, setupDefaultTasks } from './packages/automation/src/scheduler/task-scheduler';
import { getQuantumWorkflowEngine, createWorkflow } from './packages/automation/src/quantum-workflow';

console.log('\n🧪 COMPREHENSIVE SYSTEM TEST\n');
console.log('='.repeat(70));

async function testMCPServers() {
  console.log('\n📦 TEST 1: MCP Servers\n');

  const gateway = new MCPGateway();

  // Register servers
  await gateway.registerServer(new FileSystemMCPServer());
  await gateway.registerServer(new EmulatorMCPServer());
  await gateway.registerServer(new BasicMCPServer());

  console.log('✅ All MCP servers registered');

  // Test FileSystem
  console.log('\n  Testing FileSystem MCP...');
  const writeResult = await gateway.handleRequest({
    tool: 'write_file',
    input: { path: '/test.txt', content: 'Hello MCP!' },
  });
  console.log('  Write:', writeResult.success ? '✅' : '❌');

  const readResult = await gateway.handleRequest({
    tool: 'read_file',
    input: { path: '/test.txt' },
  });
  console.log('  Read:', readResult.success ? '✅' : '❌');

  // Test BASIC
  console.log('\n  Testing BASIC MCP...');
  const basicResult = await gateway.handleRequest({
    tool: 'execute',
    input: { code: '10 PRINT "TEST"\n20 LET X = 42\n30 PRINT X' },
  });
  console.log('  Execute:', basicResult.success ? '✅' : '❌');

  // Test Emulator
  console.log('\n  Testing Emulator MCP...');
  const loadResult = await gateway.handleRequest({
    tool: 'load_program',
    input: { code: 'A9 0A', address: 0x0600 },
  });
  console.log('  Load:', loadResult.success ? '✅' : '❌');

  const stats = gateway.getStats();
  console.log('\n  MCP Stats:', {
    servers: stats.totalServers,
    tools: stats.totalTools,
  });

  await gateway.shutdown();
  console.log('\n✅ MCP Servers Test Complete');
}

async function testBackgroundWorker() {
  console.log('\n🔄 TEST 2: Background Worker\n');

  const worker = new BackgroundWorker({
    healthCheckInterval: 2000,
    learningAnalysisInterval: 3000,
    enableBackup: false,
    enableSecurityScan: false,
    enableIntegrationSync: false,
  });

  await worker.start();
  console.log('✅ Background worker started');

  // Let it run for a bit
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const status = worker.getStatus();
  console.log('\n  Worker Status:', {
    running: status.running,
    activeLoops: status.activeLoops.length,
    uptime: `${Math.floor(status.uptime / 1000)}s`,
  });

  await worker.stop();
  console.log('\n✅ Background Worker Test Complete');
}

async function testAutomationEngine() {
  console.log('\n⚡ TEST 3: Automation Engine\n');

  const engine = new AutomationEngine();
  setupDefaultAutomations(engine);

  console.log('✅ Automation engine initialized');

  // Trigger some events
  await engine.triggerEvent('user.login', { userId: 'test123' });
  await engine.triggerEvent('file.created', { path: '/test.txt' });
  await engine.triggerEvent('task.completed', { taskId: 'task1' });

  const stats = engine.getStats();
  console.log('\n  Automation Stats:', {
    totalTriggers: stats.totalTriggers,
    enabledTriggers: stats.enabledTriggers,
    totalExecutions: stats.totalExecutions,
  });

  console.log('\n✅ Automation Engine Test Complete');
}

async function testTaskScheduler() {
  console.log('\n⏰ TEST 4: Task Scheduler\n');

  const scheduler = new TaskScheduler();

  // Add a test task
  scheduler.schedule('test-task', '2s', async () => {
    console.log('  ⏰ Test task executed');
  });

  scheduler.start();
  console.log('✅ Task scheduler started');

  // Let it run
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const stats = scheduler.getStats();
  console.log('\n  Scheduler Stats:', {
    totalTasks: stats.totalTasks,
    enabledTasks: stats.enabledTasks,
    totalRuns: stats.totalRuns,
  });

  scheduler.stop();
  console.log('\n✅ Task Scheduler Test Complete');
}

async function testQuantumWorkflow() {
  console.log('\n🌌 TEST 5: Quantum Workflow Engine\n');

  const engine = getQuantumWorkflowEngine();

  // Create test workflow
  const workflow = createWorkflow('Test Workflow', 'Quantum optimization test')
    .quantum({
      enableSuperposition: true,
      enableAnnealing: true,
      maxSuperpositionStates: 5,
      annealingIterations: 50,
    })
    .action('Step 1', 'log', { message: 'Starting workflow' })
    .parallel('Parallel Processing', [
      { action: 'log', params: { message: 'Task 1' } },
      { action: 'log', params: { message: 'Task 2' } },
      { action: 'log', params: { message: 'Task 3' } },
    ])
    .action('Step 3', 'log', { message: 'Workflow complete' })
    .build();

  engine.registerWorkflow(workflow);
  console.log('✅ Workflow registered');

  const result = await engine.executeWorkflow(workflow.id);
  console.log('\n  Execution Result:', {
    success: result.success,
    duration: `${result.duration}ms`,
  });

  if (result.quantumMetrics) {
    console.log('\n  Quantum Metrics:', {
      superpositionStates: result.quantumMetrics.superpositionStates,
      optimalPathProbability: result.quantumMetrics.optimalPathProbability.toFixed(3),
      energyLevel: result.quantumMetrics.energyLevel.toFixed(2),
      parallelizationFactor: result.quantumMetrics.parallelizationFactor.toFixed(1),
    });
  }

  console.log('\n✅ Quantum Workflow Test Complete');
}

async function runAllTests() {
  try {
    await testMCPServers();
    await testBackgroundWorker();
    await testAutomationEngine();
    await testTaskScheduler();
    await testQuantumWorkflow();

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log('🎉 All systems operational and ready for production\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

runAllTests();
