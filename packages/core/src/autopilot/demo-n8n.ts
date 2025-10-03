/**
 * n8n Integration Demo
 * Shows how AuraOS Autopilot integrates with your n8n instance
 * Repository: https://github.com/Moeabdelaziz007/n8n
 */

import { n8nIntegration } from './n8n-integration';
import { TaskAction, LearningContext } from './types';

console.log('🚀 AuraOS Autopilot - n8n Integration Demo\n');
console.log('Repository: https://github.com/Moeabdelaziz007/n8n');
console.log('='.repeat(70));

async function demoN8nIntegration() {
  // Demo 1: Initialize n8n connection
  console.log('\n📡 Demo 1: Connecting to n8n Instance');
  console.log('='.repeat(70));
  
  await n8nIntegration.initialize();

  // Demo 2: List available workflows
  console.log('\n\n📋 Demo 2: Available Workflows');
  console.log('='.repeat(70));
  
  const workflows = n8nIntegration.getWorkflows();
  console.log(`\nFound ${workflows.length} workflows:\n`);
  
  workflows.forEach((workflow, i) => {
    console.log(`${i + 1}. ${workflow.name}`);
    console.log(`   ID: ${workflow.id}`);
    console.log(`   Status: ${workflow.active ? '✅ Active' : '❌ Inactive'}`);
    console.log(`   Nodes: ${workflow.nodes.length}`);
    console.log(`   Tags: ${workflow.tags?.join(', ') || 'None'}`);
    console.log();
  });

  // Demo 3: Execute workflow
  console.log('\n⚡ Demo 3: Execute Workflow');
  console.log('='.repeat(70));
  
  const contentWorkflow = workflows.find(w => w.id === 'workflow_content_generation');
  if (contentWorkflow) {
    console.log(`\nExecuting: ${contentWorkflow.name}`);
    console.log('Input data: { topic: "AI Technology", language: "ar" }');
    
    const result = await n8nIntegration.executeWorkflow(
      contentWorkflow.id,
      { topic: 'AI Technology', language: 'ar' }
    );
    
    console.log(`\n✅ Execution completed:`);
    console.log(`   Execution ID: ${result.id}`);
    console.log(`   Started: ${result.startedAt.toISOString()}`);
    console.log(`   Finished: ${result.finished ? 'Yes' : 'No'}`);
    console.log(`   Duration: ${result.stoppedAt ? 
      (result.stoppedAt.getTime() - result.startedAt.getTime()) + 'ms' : 'N/A'}`);
  }

  // Demo 4: Trigger webhook
  console.log('\n\n🔗 Demo 4: Webhook Trigger');
  console.log('='.repeat(70));
  
  console.log('\nTriggering webhook: /webhook/generate-content');
  const webhookResult = await n8nIntegration.triggerWebhook(
    'generate-content',
    {
      topic: 'الذكاء الاصطناعي',
      type: 'blog',
      language: 'ar',
    }
  );
  
  console.log('✅ Webhook triggered successfully');
  console.log(`   Response:`, webhookResult);

  // Demo 5: Search workflows
  console.log('\n\n🔍 Demo 5: Search Workflows');
  console.log('='.repeat(70));
  
  const searchQueries = ['content', 'telegram', 'automation'];
  
  searchQueries.forEach(query => {
    const results = n8nIntegration.searchWorkflows(query);
    console.log(`\nSearch: "${query}" → ${results.length} result(s)`);
    results.forEach(w => {
      console.log(`   - ${w.name}`);
    });
  });

  // Demo 6: Get workflows by tag
  console.log('\n\n🏷️  Demo 6: Filter by Tags');
  console.log('='.repeat(70));
  
  const tags = ['content', 'telegram', 'data'];
  
  tags.forEach(tag => {
    const tagged = n8nIntegration.getWorkflowsByTag(tag);
    console.log(`\nTag: "${tag}" → ${tagged.length} workflow(s)`);
    tagged.forEach(w => {
      console.log(`   - ${w.name}`);
    });
  });

  // Demo 7: Create workflow from autopilot task
  console.log('\n\n🔧 Demo 7: Create Workflow from Autopilot Task');
  console.log('='.repeat(70));
  
  const taskActions: TaskAction[] = [
    { type: 'open', target: 'https://api.example.com/data' },
    { type: 'wait', delay: 1000 },
    { type: 'type', value: 'process data' },
    { type: 'exec', value: 'npm run build' },
  ];
  
  const context: LearningContext = {
    timeOfDay: 'afternoon',
    dayOfWeek: 'thursday',
    recentApps: ['terminal', 'browser'],
    systemLoad: 0.5,
  };
  
  console.log('\nCreating workflow from task: "Automated Data Processing"');
  console.log(`Actions: ${taskActions.length}`);
  
  const newWorkflow = await n8nIntegration.createWorkflowFromTask(
    'Automated Data Processing',
    taskActions,
    context
  );
  
  console.log(`\n✅ Workflow created:`);
  console.log(`   ID: ${newWorkflow.id}`);
  console.log(`   Name: ${newWorkflow.name}`);
  console.log(`   Nodes: ${newWorkflow.nodes.length}`);
  console.log(`   Tags: ${newWorkflow.tags?.join(', ')}`);
  
  console.log('\n   Workflow structure:');
  newWorkflow.nodes.forEach((node, i) => {
    console.log(`   ${i + 1}. ${node.name} (${node.type})`);
  });

  // Demo 8: Workflow statistics
  console.log('\n\n📊 Demo 8: Workflow Statistics');
  console.log('='.repeat(70));
  
  const stats = n8nIntegration.getStats();
  
  console.log(`\nTotal Workflows: ${stats.totalWorkflows}`);
  console.log(`Active Workflows: ${stats.activeWorkflows}`);
  
  console.log('\nWorkflows by Tag:');
  Object.entries(stats.workflowsByTag).forEach(([tag, count]) => {
    console.log(`   ${tag}: ${count}`);
  });
  
  console.log('\nNode Types Used:');
  Object.entries(stats.nodeTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([type, count]) => {
      const shortType = type.replace('n8n-nodes-base.', '');
      console.log(`   ${shortType}: ${count}`);
    });

  // Demo 9: Integration with Content Generation
  console.log('\n\n📝 Demo 9: Content Generation Workflow');
  console.log('='.repeat(70));
  
  console.log('\nScenario: Generate Arabic blog post about AI');
  console.log('\nWorkflow steps:');
  console.log('   1. Trigger webhook with topic');
  console.log('   2. Search web for latest AI news');
  console.log('   3. Generate article using AI');
  console.log('   4. Save to database');
  console.log('   5. Send notification');
  
  const contentGenWorkflow = workflows.find(w => w.id === 'workflow_content_generation');
  if (contentGenWorkflow) {
    console.log(`\n✅ Using workflow: ${contentGenWorkflow.name}`);
    console.log(`   Nodes: ${contentGenWorkflow.nodes.map(n => n.name).join(' → ')}`);
  }

  // Demo 10: Integration with Telegram Bot
  console.log('\n\n💬 Demo 10: Telegram Bot Workflow');
  console.log('='.repeat(70));
  
  console.log('\nScenario: Automated Telegram responses');
  console.log('\nWorkflow steps:');
  console.log('   1. Receive message from Telegram');
  console.log('   2. Process message with AI');
  console.log('   3. Generate response');
  console.log('   4. Send back to user');
  console.log('   5. Log interaction');
  
  const telegramWorkflow = workflows.find(w => w.id === 'workflow_telegram_bot');
  if (telegramWorkflow) {
    console.log(`\n✅ Using workflow: ${telegramWorkflow.name}`);
    console.log(`   Nodes: ${telegramWorkflow.nodes.map(n => n.name).join(' → ')}`);
  }

  // Final Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ n8n Integration Demo Complete!');
  console.log('='.repeat(70));
  
  console.log('\n📊 Summary:');
  console.log(`   Workflows Available: ${stats.totalWorkflows}`);
  console.log(`   Active Workflows: ${stats.activeWorkflows}`);
  console.log(`   Total Nodes: ${Object.values(stats.nodeTypes).reduce((a, b) => a + b, 0)}`);
  console.log(`   Unique Node Types: ${Object.keys(stats.nodeTypes).length}`);
  
  console.log('\n🎯 Key Capabilities:');
  console.log('   ✓ Execute workflows programmatically');
  console.log('   ✓ Trigger webhooks for automation');
  console.log('   ✓ Create workflows from autopilot tasks');
  console.log('   ✓ Search and filter workflows');
  console.log('   ✓ Monitor workflow statistics');
  console.log('   ✓ Integrate with content generation');
  console.log('   ✓ Integrate with Telegram bot');
  console.log('   ✓ Support for 400+ n8n integrations');
  
  console.log('\n🔗 Your n8n Repository:');
  console.log('   https://github.com/Moeabdelaziz007/n8n');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Deploy your n8n instance');
  console.log('   2. Configure API credentials');
  console.log('   3. Create custom workflows');
  console.log('   4. Connect with autopilot');
  console.log('   5. Automate everything!');
  
  console.log('\n' + '='.repeat(70) + '\n');
}

// Run demo
demoN8nIntegration().catch(error => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});
