/**
 * n8n Integration Demo
 * Shows how AuraOS Autopilot integrates with your n8n instance
 * Repository: https://github.com/Moeabdelaziz007/n8n
 */

import { n8nIntegration } from './n8n-integration';
import { TaskAction, LearningContext } from './types';

logger.info('🚀 AuraOS Autopilot - n8n Integration Demo\n');
logger.info('Repository: https://github.com/Moeabdelaziz007/n8n');
logger.info('='.repeat(70));

async function demoN8nIntegration() {
  // Demo 1: Initialize n8n connection
  logger.info('\n📡 Demo 1: Connecting to n8n Instance');
  logger.info('='.repeat(70));
  
  await n8nIntegration.initialize();

  // Demo 2: List available workflows
  logger.info('\n\n📋 Demo 2: Available Workflows');
  logger.info('='.repeat(70));
  
  const workflows = n8nIntegration.getWorkflows();
  logger.info(`\nFound ${workflows.length} workflows:\n`);
  
  workflows.forEach((workflow, i) => {
    logger.info(`${i + 1}. ${workflow.name}`);
    logger.info(`   ID: ${workflow.id}`);
    logger.info(`   Status: ${workflow.active ? '✅ Active' : '❌ Inactive'}`);
    logger.info(`   Nodes: ${workflow.nodes.length}`);
    logger.info(`   Tags: ${workflow.tags?.join(', ') || 'None'}`);
    logger.info();
  });

  // Demo 3: Execute workflow
  logger.info('\n⚡ Demo 3: Execute Workflow');
  logger.info('='.repeat(70));
  
  const contentWorkflow = workflows.find(w => w.id === 'workflow_content_generation');
  if (contentWorkflow) {
    logger.info(`\nExecuting: ${contentWorkflow.name}`);
    logger.info('Input data: { topic: "AI Technology", language: "ar" }');
    
    const result = await n8nIntegration.executeWorkflow(
      contentWorkflow.id,
      { topic: 'AI Technology', language: 'ar' }
    );
    
    logger.info(`\n✅ Execution completed:`);
    logger.info(`   Execution ID: ${result.id}`);
    logger.info(`   Started: ${result.startedAt.toISOString()}`);
    logger.info(`   Finished: ${result.finished ? 'Yes' : 'No'}`);
    logger.info(`   Duration: ${result.stoppedAt ? 
      (result.stoppedAt.getTime() - result.startedAt.getTime()) + 'ms' : 'N/A'}`);
  }

  // Demo 4: Trigger webhook
  logger.info('\n\n🔗 Demo 4: Webhook Trigger');
  logger.info('='.repeat(70));
  
  logger.info('\nTriggering webhook: /webhook/generate-content');
  const webhookResult = await n8nIntegration.triggerWebhook(
    'generate-content',
    {
      topic: 'الذكاء الاصطناعي',
      type: 'blog',
      language: 'ar',
    }
  );
  
  logger.info('✅ Webhook triggered successfully');
  logger.info(`   Response:`, webhookResult);

  // Demo 5: Search workflows
  logger.info('\n\n🔍 Demo 5: Search Workflows');
  logger.info('='.repeat(70));
  
  const searchQueries = ['content', 'telegram', 'automation'];
  
  searchQueries.forEach(query => {
    const results = n8nIntegration.searchWorkflows(query);
    logger.info(`\nSearch: "${query}" → ${results.length} result(s)`);
    results.forEach(w => {
      logger.info(`   - ${w.name}`);
    });
  });

  // Demo 6: Get workflows by tag
  logger.info('\n\n🏷️  Demo 6: Filter by Tags');
  logger.info('='.repeat(70));
  
  const tags = ['content', 'telegram', 'data'];
  
  tags.forEach(tag => {
    const tagged = n8nIntegration.getWorkflowsByTag(tag);
    logger.info(`\nTag: "${tag}" → ${tagged.length} workflow(s)`);
    tagged.forEach(w => {
      logger.info(`   - ${w.name}`);
    });
  });

  // Demo 7: Create workflow from autopilot task
  logger.info('\n\n🔧 Demo 7: Create Workflow from Autopilot Task');
  logger.info('='.repeat(70));
  
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
  
  logger.info('\nCreating workflow from task: "Automated Data Processing"');
  logger.info(`Actions: ${taskActions.length}`);
  
  const newWorkflow = await n8nIntegration.createWorkflowFromTask(
    'Automated Data Processing',
    taskActions,
    context
  );
  
  logger.info(`\n✅ Workflow created:`);
  logger.info(`   ID: ${newWorkflow.id}`);
  logger.info(`   Name: ${newWorkflow.name}`);
  logger.info(`   Nodes: ${newWorkflow.nodes.length}`);
  logger.info(`   Tags: ${newWorkflow.tags?.join(', ')}`);
  
  logger.info('\n   Workflow structure:');
  newWorkflow.nodes.forEach((node, i) => {
    logger.info(`   ${i + 1}. ${node.name} (${node.type})`);
  });

  // Demo 8: Workflow statistics
  logger.info('\n\n📊 Demo 8: Workflow Statistics');
  logger.info('='.repeat(70));
  
  const stats = n8nIntegration.getStats();
  
  logger.info(`\nTotal Workflows: ${stats.totalWorkflows}`);
  logger.info(`Active Workflows: ${stats.activeWorkflows}`);
  
  logger.info('\nWorkflows by Tag:');
  Object.entries(stats.workflowsByTag).forEach(([tag, count]) => {
    logger.info(`   ${tag}: ${count}`);
  });
  
  logger.info('\nNode Types Used:');
  Object.entries(stats.nodeTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([type, count]) => {
      const shortType = type.replace('n8n-nodes-base.', '');
      logger.info(`   ${shortType}: ${count}`);
    });

  // Demo 9: Integration with Content Generation
  logger.info('\n\n📝 Demo 9: Content Generation Workflow');
  logger.info('='.repeat(70));
  
  logger.info('\nScenario: Generate Arabic blog post about AI');
  logger.info('\nWorkflow steps:');
  logger.info('   1. Trigger webhook with topic');
  logger.info('   2. Search web for latest AI news');
  logger.info('   3. Generate article using AI');
  logger.info('   4. Save to database');
  logger.info('   5. Send notification');
  
  const contentGenWorkflow = workflows.find(w => w.id === 'workflow_content_generation');
  if (contentGenWorkflow) {
    logger.info(`\n✅ Using workflow: ${contentGenWorkflow.name}`);
    logger.info(`   Nodes: ${contentGenWorkflow.nodes.map(n => n.name).join(' → ')}`);
  }

  // Demo 10: Integration with Telegram Bot
  logger.info('\n\n💬 Demo 10: Telegram Bot Workflow');
  logger.info('='.repeat(70));
  
  logger.info('\nScenario: Automated Telegram responses');
  logger.info('\nWorkflow steps:');
  logger.info('   1. Receive message from Telegram');
  logger.info('   2. Process message with AI');
  logger.info('   3. Generate response');
  logger.info('   4. Send back to user');
  logger.info('   5. Log interaction');
  
  const telegramWorkflow = workflows.find(w => w.id === 'workflow_telegram_bot');
  if (telegramWorkflow) {
    logger.info(`\n✅ Using workflow: ${telegramWorkflow.name}`);
    logger.info(`   Nodes: ${telegramWorkflow.nodes.map(n => n.name).join(' → ')}`);
  }

  // Final Summary
  logger.info('\n\n' + '='.repeat(70));
  logger.info('✅ n8n Integration Demo Complete!');
  logger.info('='.repeat(70));
  
  logger.info('\n📊 Summary:');
  logger.info(`   Workflows Available: ${stats.totalWorkflows}`);
  logger.info(`   Active Workflows: ${stats.activeWorkflows}`);
  logger.info(`   Total Nodes: ${Object.values(stats.nodeTypes).reduce((a, b) => a + b, 0)}`);
  logger.info(`   Unique Node Types: ${Object.keys(stats.nodeTypes).length}`);
  
  logger.info('\n🎯 Key Capabilities:');
  logger.info('   ✓ Execute workflows programmatically');
  logger.info('   ✓ Trigger webhooks for automation');
  logger.info('   ✓ Create workflows from autopilot tasks');
  logger.info('   ✓ Search and filter workflows');
  logger.info('   ✓ Monitor workflow statistics');
  logger.info('   ✓ Integrate with content generation');
  logger.info('   ✓ Integrate with Telegram bot');
  logger.info('   ✓ Support for 400+ n8n integrations');
  
  logger.info('\n🔗 Your n8n Repository:');
  logger.info('   https://github.com/Moeabdelaziz007/n8n');
  
  logger.info('\n🚀 Next Steps:');
  logger.info('   1. Deploy your n8n instance');
  logger.info('   2. Configure API credentials');
  logger.info('   3. Create custom workflows');
  logger.info('   4. Connect with autopilot');
  logger.info('   5. Automate everything!');
  
  logger.info('\n' + '='.repeat(70) + '\n');
}

// Run demo
demoN8nIntegration().catch(error => {
  logger.error('❌ Demo failed:', error);
  process.exit(1);
});
