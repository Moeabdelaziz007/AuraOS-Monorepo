/**
 * Quantum Workflow Examples
 * Practical examples demonstrating quantum workflow capabilities
 */

import { getQuantumWorkflowEngine } from './quantum-engine';
import { createWorkflow } from './workflow-builder';

/**
 * Example 1: Simple Sequential Workflow
 */
export async function exampleSimpleWorkflow() {
  console.log('\n=== Example 1: Simple Sequential Workflow ===\n');

  const engine = getQuantumWorkflowEngine();

  // Build workflow
  const workflow = createWorkflow('Simple Task', 'Execute tasks in sequence')
    .quantum({
      enableSuperposition: false, // Disable for simple sequential
      enableAnnealing: false,
    })
    .action('Step 1', 'log', { message: 'Starting workflow' })
    .action('Step 2', 'delay', { duration: 1000 })
    .action('Step 3', 'log', { message: 'Workflow complete' })
    .build();

  engine.registerWorkflow(workflow);

  // Execute
  const result = await engine.executeWorkflow(workflow.id);
  console.log('Result:', result);

  return result;
}

/**
 * Example 2: Quantum-Optimized Parallel Workflow
 */
export async function exampleQuantumParallelWorkflow() {
  console.log('\n=== Example 2: Quantum-Optimized Parallel Workflow ===\n');

  const engine = getQuantumWorkflowEngine();

  // Build workflow with quantum optimization
  const workflow = createWorkflow('Parallel Processing', 'Process multiple tasks with quantum optimization')
    .quantum({
      enableSuperposition: true,
      enableAnnealing: true,
      maxSuperpositionStates: 5,
      annealingIterations: 50,
    })
    .action('Initialize', 'log', { message: 'Starting parallel processing' })
    .parallel('Process Data', [
      { action: 'log', params: { message: 'Processing chunk 1' } },
      { action: 'log', params: { message: 'Processing chunk 2' } },
      { action: 'log', params: { message: 'Processing chunk 3' } },
    ])
    .action('Aggregate Results', 'log', { message: 'Aggregating results' })
    .action('Complete', 'log', { message: 'All processing complete' })
    .build();

  engine.registerWorkflow(workflow);

  // Execute
  const result = await engine.executeWorkflow(workflow.id);
  console.log('Result:', result);
  console.log('Quantum Metrics:', result.quantumMetrics);

  return result;
}

/**
 * Example 3: Conditional Workflow with Decision Points
 */
export async function exampleConditionalWorkflow() {
  console.log('\n=== Example 3: Conditional Workflow ===\n');

  const engine = getQuantumWorkflowEngine();

  const workflow = createWorkflow('Conditional Processing', 'Execute different paths based on conditions')
    .quantum({
      enableSuperposition: true,
      enableTunneling: true,
    })
    .action('Check Status', 'log', { message: 'Checking system status' })
    .decision('Is Healthy?', (ctx) => {
      // Simulate health check
      return Math.random() > 0.3;
    })
    .action('Process Normally', 'log', { message: 'System healthy, processing normally' })
    .when((ctx) => ctx.results.get('step_2') === true)
    .action('Recovery Mode', 'log', { message: 'System unhealthy, entering recovery' })
    .when((ctx) => ctx.results.get('step_2') === false)
    .action('Complete', 'log', { message: 'Workflow complete' })
    .build();

  engine.registerWorkflow(workflow);

  const result = await engine.executeWorkflow(workflow.id);
  console.log('Result:', result);

  return result;
}

/**
 * Example 4: Retry and Error Handling
 */
export async function exampleRetryWorkflow() {
  console.log('\n=== Example 4: Retry and Error Handling ===\n');

  const engine = getQuantumWorkflowEngine();

  // Register a custom action that might fail
  let attemptCount = 0;
  engine.registerActionHandler('flaky_operation', async (params) => {
    attemptCount++;
    console.log(`  Attempt ${attemptCount}...`);
    
    if (attemptCount < 3) {
      throw new Error('Operation failed, will retry');
    }
    
    return { success: true, attempts: attemptCount };
  });

  const workflow = createWorkflow('Retry Example', 'Demonstrate retry mechanism')
    .action('Flaky Operation', 'flaky_operation', {})
    .retry(5, 1.5, 500) // Max 5 attempts, 1.5x backoff, 500ms initial delay
    .timeout(10000)
    .action('Success', 'log', { message: 'Operation succeeded after retries' })
    .build();

  engine.registerWorkflow(workflow);

  const result = await engine.executeWorkflow(workflow.id);
  console.log('Result:', result);

  return result;
}

/**
 * Example 5: Complex Multi-Stage Workflow
 */
export async function exampleComplexWorkflow() {
  console.log('\n=== Example 5: Complex Multi-Stage Workflow ===\n');

  const engine = getQuantumWorkflowEngine();

  const workflow = createWorkflow('Complex Pipeline', 'Multi-stage data processing pipeline')
    .quantum({
      enableSuperposition: true,
      enableEntanglement: true,
      enableAnnealing: true,
      enableTunneling: true,
      maxSuperpositionStates: 10,
      annealingIterations: 100,
    })
    // Stage 1: Data Acquisition
    .action('Fetch Data', 'log', { message: 'Fetching data from sources' })
    .retry(3)
    .timeout(5000)
    
    // Stage 2: Validation
    .action('Validate Data', 'log', { message: 'Validating data integrity' })
    .dependsOn('step_1')
    
    // Stage 3: Parallel Processing
    .parallel('Transform Data', [
      { action: 'log', params: { message: 'Normalizing data' } },
      { action: 'log', params: { message: 'Enriching data' } },
      { action: 'log', params: { message: 'Filtering data' } },
    ])
    .dependsOn('step_2')
    
    // Stage 4: Quantum Optimization
    .quantumGate('Optimize Processing', 'optimize')
    
    // Stage 5: Analysis
    .action('Analyze Results', 'log', { message: 'Analyzing processed data' })
    .dependsOn('step_3', 'step_4')
    
    // Stage 6: Storage
    .action('Save Results', 'log', { message: 'Saving results to database' })
    .retry(2)
    
    // Stage 7: Notification
    .action('Send Notification', 'log', { message: 'Notifying stakeholders' })
    .build();

  engine.registerWorkflow(workflow);

  const result = await engine.executeWorkflow(workflow.id);
  console.log('Result:', result);
  console.log('Quantum Metrics:', result.quantumMetrics);

  return result;
}

/**
 * Example 6: Real-World E-commerce Order Processing
 */
export async function exampleEcommerceWorkflow() {
  console.log('\n=== Example 6: E-commerce Order Processing ===\n');

  const engine = getQuantumWorkflowEngine();

  const workflow = createWorkflow('Order Processing', 'Process e-commerce order with quantum optimization')
    .quantum({
      enableSuperposition: true,
      enableAnnealing: true,
      maxSuperpositionStates: 8,
    })
    .action('Validate Order', 'log', { message: 'Validating order details' })
    .retry(2)
    
    .action('Check Inventory', 'log', { message: 'Checking product availability' })
    .dependsOn('step_1')
    
    .decision('Items Available?', (ctx) => Math.random() > 0.1)
    
    .action('Reserve Items', 'log', { message: 'Reserving items from inventory' })
    .when((ctx) => ctx.results.get('step_3') === true)
    
    .action('Process Payment', 'log', { message: 'Processing payment' })
    .retry(3, 2, 1000)
    .timeout(30000)
    .dependsOn('step_4')
    
    .parallel('Fulfill Order', [
      { action: 'log', params: { message: 'Generating invoice' } },
      { action: 'log', params: { message: 'Creating shipping label' } },
      { action: 'log', params: { message: 'Updating inventory' } },
    ])
    .dependsOn('step_5')
    
    .action('Send Confirmation', 'log', { message: 'Sending order confirmation email' })
    
    .action('Notify Warehouse', 'log', { message: 'Notifying warehouse for shipment' })
    
    .build();

  engine.registerWorkflow(workflow);

  const result = await engine.executeWorkflow(workflow.id, {
    orderId: 'ORD-12345',
    customerId: 'CUST-67890',
    items: [
      { sku: 'PROD-001', quantity: 2 },
      { sku: 'PROD-002', quantity: 1 },
    ],
  });

  console.log('Result:', result);
  console.log('Quantum Metrics:', result.quantumMetrics);

  return result;
}

/**
 * Example 7: AI Model Training Pipeline
 */
export async function exampleAITrainingWorkflow() {
  console.log('\n=== Example 7: AI Model Training Pipeline ===\n');

  const engine = getQuantumWorkflowEngine();

  const workflow = createWorkflow('AI Training', 'Train and deploy AI model with quantum optimization')
    .quantum({
      enableSuperposition: true,
      enableAnnealing: true,
      maxSuperpositionStates: 15,
      annealingIterations: 200,
    })
    .action('Load Training Data', 'log', { message: 'Loading training dataset' })
    .timeout(60000)
    
    .action('Preprocess Data', 'log', { message: 'Preprocessing and augmenting data' })
    
    .quantumGate('Optimize Hyperparameters', 'optimize')
    
    .parallel('Train Models', [
      { action: 'log', params: { message: 'Training model variant A' } },
      { action: 'log', params: { message: 'Training model variant B' } },
      { action: 'log', params: { message: 'Training model variant C' } },
      { action: 'log', params: { message: 'Training model variant D' } },
    ])
    .timeout(300000) // 5 minutes per model
    
    .action('Evaluate Models', 'log', { message: 'Evaluating model performance' })
    
    .action('Select Best Model', 'log', { message: 'Selecting best performing model' })
    
    .action('Deploy Model', 'log', { message: 'Deploying model to production' })
    .retry(2)
    
    .action('Monitor Performance', 'log', { message: 'Setting up performance monitoring' })
    
    .build();

  engine.registerWorkflow(workflow);

  const result = await engine.executeWorkflow(workflow.id, {
    modelType: 'neural_network',
    dataset: 'training_v2',
    targetMetric: 'accuracy',
  });

  console.log('Result:', result);
  console.log('Quantum Metrics:', result.quantumMetrics);

  return result;
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('\n🚀 Running Quantum Workflow Examples\n');
  console.log('='.repeat(60));

  try {
    await exampleSimpleWorkflow();
    await exampleQuantumParallelWorkflow();
    await exampleConditionalWorkflow();
    await exampleRetryWorkflow();
    await exampleComplexWorkflow();
    await exampleEcommerceWorkflow();
    await exampleAITrainingWorkflow();

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ All examples completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Example failed:', error);
  }
}
