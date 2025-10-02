/**
 * Learning Loop & Autopilot Demo
 * Demonstrates the self-learning and autonomous system
 */

import {
  initTracker,
  LearningEngine,
  AutopilotSystem,
  learningStorage,
} from '../index';

async function main() {
  console.log('🚀 AuraOS Learning Loop & Autopilot Demo\n');

  // 1. Initialize storage
  console.log('📦 Initializing storage...');
  await learningStorage.init();
  console.log('✅ Storage initialized\n');

  // 2. Initialize tracker
  console.log('📊 Initializing behavior tracker...');
  const tracker = initTracker('demo-user');
  console.log('✅ Tracker initialized\n');

  // 3. Simulate user interactions
  console.log('👤 Simulating user interactions...');
  
  // Morning routine
  await tracker.trackAppOpen('ai-notes', { x: 200, y: 150 });
  await new Promise(resolve => setTimeout(resolve, 100));
  await tracker.trackAppClose('ai-notes', 5000);
  
  await tracker.trackAppOpen('ai-code-editor', { x: 300, y: 200 });
  await new Promise(resolve => setTimeout(resolve, 100));
  await tracker.trackAIQuery('How to create a React component?', 'Here is an example...', 2000);
  await tracker.trackSuccess('code_generated', 'React component');
  await tracker.trackAppClose('ai-code-editor', 10000);

  // Afternoon routine
  await tracker.trackAppOpen('ai-terminal', { x: 100, y: 100 });
  await new Promise(resolve => setTimeout(resolve, 100));
  await tracker.trackCommandExecute('npm install', true, 3000);
  await tracker.trackSuccess('package_installed', 'npm');
  await tracker.trackAppClose('ai-terminal', 8000);

  // Error scenario
  await tracker.trackAppOpen('ai-file-manager', { x: 150, y: 150 });
  await new Promise(resolve => setTimeout(resolve, 100));
  await tracker.trackError('File not found', 'reading config.json');
  await tracker.trackAppClose('ai-file-manager', 2000);

  console.log('✅ Simulated 10+ interactions\n');

  // 4. Initialize learning engine
  console.log('🧠 Initializing learning engine...');
  const engine = new LearningEngine('demo-user');
  await engine.init();
  console.log('✅ Learning engine initialized\n');

  // 5. Analyze and learn
  console.log('📚 Analyzing patterns and learning...');
  await engine.analyzeAndLearn();
  console.log('✅ Analysis complete\n');

  // 6. Show learned patterns
  console.log('🔍 Learned Patterns:');
  const pattern = engine.getPattern();
  
  if (pattern) {
    console.log('\n  📱 Most Used Apps:');
    pattern.patterns.mostUsedApps.slice(0, 3).forEach((app, i) => {
      console.log(`    ${i + 1}. ${app.appId} (${app.count} times, avg ${(app.avgDuration / 1000).toFixed(1)}s)`);
    });

    console.log('\n  ⏰ Preferred Times:');
    Object.entries(pattern.patterns.preferredTimes).forEach(([time, count]) => {
      console.log(`    ${time}: ${count} interactions`);
    });

    console.log('\n  🔗 Common Sequences:');
    pattern.patterns.commonSequences.slice(0, 2).forEach((seq, i) => {
      console.log(`    ${i + 1}. ${seq.sequence.join(' → ')} (${seq.frequency}x)`);
    });

    if (pattern.patterns.errorPatterns.length > 0) {
      console.log('\n  ⚠️  Error Patterns:');
      pattern.patterns.errorPatterns.forEach((err, i) => {
        console.log(`    ${i + 1}. ${err.error} (${err.frequency}x)`);
      });
    }
  }

  // 7. Get smart suggestions
  console.log('\n💡 Smart Suggestions:');
  const suggestions = await engine.getSmartSuggestions();
  suggestions.forEach((sug, i) => {
    console.log(`  ${i + 1}. [${sug.type}] ${sug.title}`);
    console.log(`     ${sug.description}`);
    console.log(`     Confidence: ${(sug.confidence * 100).toFixed(0)}%, Relevance: ${(sug.relevance * 100).toFixed(0)}%`);
  });

  // 8. Initialize autopilot
  console.log('\n🤖 Initializing autopilot system...');
  const autopilot = new AutopilotSystem('demo-user', tracker);
  await autopilot.init();
  console.log('✅ Autopilot initialized\n');

  // 9. Create and execute tasks
  console.log('📋 Creating autopilot tasks...\n');

  // Task 1: Simple app opening
  console.log('  Task 1: Open AI Notes');
  const task1 = await autopilot.createTask('Open AI Notes', 'medium');
  console.log(`    ✓ Created (confidence: ${(task1.confidence * 100).toFixed(0)}%)`);
  console.log(`    ✓ Steps: ${task1.steps.length}`);
  
  const decision1 = await autopilot.makeDecision(task1.id);
  console.log(`    ✓ Decision: ${decision1.decision}`);
  console.log(`    ✓ Reason: ${decision1.reason}`);

  if (decision1.decision === 'execute') {
    try {
      await autopilot.executeTask(task1.id);
      console.log(`    ✅ Task completed successfully!\n`);
    } catch (error) {
      console.log(`    ❌ Task failed: ${error}\n`);
    }
  }

  // Task 2: File creation
  console.log('  Task 2: Create file notes.txt');
  const task2 = await autopilot.createTask('Create file notes.txt', 'medium');
  console.log(`    ✓ Created (confidence: ${(task2.confidence * 100).toFixed(0)}%)`);
  console.log(`    ✓ Steps: ${task2.steps.length}`);
  
  const decision2 = await autopilot.makeDecision(task2.id);
  console.log(`    ✓ Decision: ${decision2.decision}`);

  if (decision2.decision === 'execute') {
    try {
      await autopilot.executeTask(task2.id);
      console.log(`    ✅ Task completed successfully!\n`);
    } catch (error) {
      console.log(`    ❌ Task failed: ${error}\n`);
    }
  }

  // Task 3: AI query
  console.log('  Task 3: Ask AI about TypeScript');
  const task3 = await autopilot.createTask('Ask AI what is TypeScript', 'low');
  console.log(`    ✓ Created (confidence: ${(task3.confidence * 100).toFixed(0)}%)`);
  console.log(`    ✓ Steps: ${task3.steps.length}`);
  
  const decision3 = await autopilot.makeDecision(task3.id);
  console.log(`    ✓ Decision: ${decision3.decision}`);

  if (decision3.decision === 'execute') {
    try {
      await autopilot.executeTask(task3.id);
      console.log(`    ✅ Task completed successfully!\n`);
    } catch (error) {
      console.log(`    ❌ Task failed: ${error}\n`);
    }
  }

  // 10. Show capabilities
  console.log('🛠️  Available Capabilities:');
  const capabilities = autopilot.getCapabilities();
  capabilities.slice(0, 5).forEach((cap, i) => {
    console.log(`  ${i + 1}. ${cap.name} (${cap.category})`);
    console.log(`     Success Rate: ${(cap.successRate * 100).toFixed(0)}%`);
    console.log(`     Usage: ${cap.usageCount} times`);
    console.log(`     Avg Duration: ${cap.avgDuration}ms`);
  });

  // 11. Show task history
  console.log('\n📜 Task History:');
  const history = autopilot.getTaskHistory();
  history.forEach((learning, i) => {
    console.log(`  ${i + 1}. Task ${learning.taskId.substring(0, 12)}...`);
    console.log(`     Success: ${learning.success ? '✅' : '❌'}`);
    console.log(`     Duration: ${learning.duration}ms`);
    console.log(`     Steps: ${learning.stepsExecuted}`);
  });

  // 12. Show metrics
  console.log('\n📊 Learning Metrics:');
  const metrics = await learningStorage.getMetrics();
  if (metrics) {
    console.log(`  Total Interactions: ${metrics.totalInteractions}`);
    console.log(`  Unique Users: ${metrics.uniqueUsers}`);
    console.log(`  Avg Session: ${(metrics.avgSessionDuration / 1000).toFixed(0)}s`);
    console.log(`  Error Rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
    console.log(`  Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
    console.log(`  Improvement: ${(metrics.improvementRate * 100).toFixed(1)}%`);
  }

  // 13. Show model state
  console.log('\n🧠 AI Model State:');
  const modelState = engine.getModelState();
  if (modelState) {
    console.log(`  Version: ${modelState.version}`);
    console.log(`  Accuracy: ${(modelState.accuracy * 100).toFixed(1)}%`);
    console.log(`  Total Interactions: ${modelState.totalInteractions}`);
    console.log(`  Features:`);
    Object.entries(modelState.features).forEach(([feature, enabled]) => {
      console.log(`    ${enabled ? '✅' : '❌'} ${feature}`);
    });
  }

  console.log('\n✨ Demo completed! The system is now smarter! ✨\n');
  console.log('💡 Key Takeaways:');
  console.log('  1. Every interaction is tracked and learned from');
  console.log('  2. Patterns emerge from repeated behaviors');
  console.log('  3. Autopilot uses learned knowledge to execute tasks');
  console.log('  4. The system gets smarter with every use');
  console.log('  5. Brain (Learning) + Body (Autopilot) = Intelligent OS\n');
}

// Run demo
if (require.main === module) {
  main().catch(console.error);
}

export { main };
