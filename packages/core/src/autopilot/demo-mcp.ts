/**
 * MCP Integration Demo
 * Shows how autopilot uses MCP tools for intelligent automation
 */

import {
  MCP_TOOLS,
  mcpAutopilotActions,
  toolChainBuilder,
  IntelligentToolSelector,
} from './mcp-integration';

import {
  mcpServerManager,
  MCP_SERVERS,
} from './mcp-servers';

import { LearningContext } from './types';

logger.info('🚀 AuraOS Autopilot - MCP Integration Demo\n');
logger.info('='.repeat(70));

async function demoMCPCapabilities() {
  // Demo 1: Show available MCP tools
  logger.info('\n📦 Demo 1: Available MCP Tools');
  logger.info('='.repeat(70));
  
  logger.info(`\nBuilt-in Tools: ${MCP_TOOLS.length}`);
  logger.info('\nCategories:');
  
  const categories = new Map<string, number>();
  MCP_TOOLS.forEach(tool => {
    categories.set(tool.category, (categories.get(tool.category) || 0) + 1);
  });
  
  categories.forEach((count, category) => {
    logger.info(`  ${category}: ${count} tools`);
  });

  // Demo 2: MCP Servers
  logger.info('\n\n🌐 Demo 2: MCP Servers');
  logger.info('='.repeat(70));
  
  const serverStats = mcpServerManager.getStats();
  logger.info(`\nTotal Servers: ${serverStats.totalServers}`);
  logger.info(`Enabled Servers: ${serverStats.enabledServers}`);
  logger.info(`Total Tools: ${serverStats.totalTools}`);
  logger.info(`Free Tools: ${serverStats.freeTools}`);
  
  logger.info('\nAvailable Servers:');
  MCP_SERVERS.forEach(server => {
    const status = server.enabled ? '✅' : '❌';
    logger.info(`  ${status} ${server.name} (${server.category})`);
    logger.info(`     ${server.description}`);
    logger.info(`     Tools: ${server.tools.length}`);
  });

  // Demo 3: Content Generation Tools
  logger.info('\n\n📝 Demo 3: Content Generation Tools');
  logger.info('='.repeat(70));
  
  const contentTools = mcpServerManager.getContentGenerationTools();
  logger.info(`\nFound ${contentTools.length} content generation tools:\n`);
  
  contentTools.forEach((tool, i) => {
    logger.info(`${i + 1}. ${tool.name}`);
    logger.info(`   ${tool.description}`);
    logger.info(`   Server: ${mcpServerManager.getServerForTool(tool.name)?.name}`);
  });

  // Demo 4: Web Search Tools
  logger.info('\n\n🔍 Demo 4: Web Search Tools');
  logger.info('='.repeat(70));
  
  const searchTools = mcpServerManager.getWebSearchTools();
  logger.info(`\nFound ${searchTools.length} web search tools:\n`);
  
  searchTools.forEach((tool, i) => {
    logger.info(`${i + 1}. ${tool.name}`);
    logger.info(`   ${tool.description}`);
    logger.info(`   Server: ${mcpServerManager.getServerForTool(tool.name)?.name}`);
  });

  // Demo 5: Intelligent Tool Selection
  logger.info('\n\n🧠 Demo 5: Intelligent Tool Selection');
  logger.info('='.repeat(70));
  
  const selector = new IntelligentToolSelector();
  const context: LearningContext = {
    timeOfDay: 'afternoon',
    dayOfWeek: 'thursday',
    recentApps: ['content-generator', 'telegram'],
    systemLoad: 0.5,
  };

  const testTasks = [
    'Generate a blog post about AI technology',
    'Search the web for latest news',
    'Read and analyze code file',
    'Run tests and check results',
    'Commit changes to git',
  ];

  logger.info('\nTask → Recommended Tool:\n');
  testTasks.forEach(task => {
    const tool = selector.selectTool(task, context, MCP_TOOLS);
    logger.info(`📌 "${task}"`);
    logger.info(`   → ${tool ? tool.name : 'No tool found'}`);
    if (tool) {
      logger.info(`   → ${tool.description}`);
    }
    logger.info();
  });

  // Demo 6: Tool Chains
  logger.info('\n🔗 Demo 6: Tool Chains');
  logger.info('='.repeat(70));
  
  const availableChains = toolChainBuilder.getAllChains();
  logger.info(`\nAvailable Chains: ${availableChains.length}\n`);
  
  availableChains.forEach(chainName => {
    const chain = toolChainBuilder.getChain(chainName);
    logger.info(`📋 ${chainName}:`);
    chain.forEach((tool, i) => {
      logger.info(`   ${i + 1}. ${tool.name}`);
    });
    logger.info();
  });

  // Demo 7: Task Planning
  logger.info('\n📋 Demo 7: Intelligent Task Planning');
  logger.info('='.repeat(70));
  
  const complexTasks = [
    'Generate article about AI and publish it',
    'Search web for information and create summary',
    'Review code, suggest improvements, and run tests',
  ];

  logger.info('\nPlanning complex tasks:\n');
  for (const task of complexTasks) {
    logger.info(`📌 Task: "${task}"`);
    
    const plan = await mcpAutopilotActions.planToolExecution(task, context);
    logger.info(`   Tools needed: ${plan.tools.length}`);
    logger.info(`   Estimated time: ${plan.estimatedDuration}ms`);
    logger.info(`   Plan:`);
    logger.info(plan.plan.split('\n').map(line => `     ${line}`).join('\n'));
    logger.info();
  }

  // Demo 8: Tool Recommendations
  logger.info('\n💡 Demo 8: Tool Recommendations');
  logger.info('='.repeat(70));
  
  const arabicTasks = [
    'اكتب مقال عن الذكاء الاصطناعي',
    'ابحث في الإنترنت عن معلومات',
    'ولد محتوى لوسائل التواصل الاجتماعي',
  ];

  logger.info('\nArabic Task Support:\n');
  arabicTasks.forEach(task => {
    logger.info(`📌 "${task}"`);
    const recommendations = mcpServerManager.recommendTools(task);
    
    if (recommendations.contentGeneration.length > 0) {
      logger.info(`   Content Generation: ${recommendations.contentGeneration[0].name}`);
    }
    if (recommendations.webSearch.length > 0) {
      logger.info(`   Web Search: ${recommendations.webSearch[0].name}`);
    }
    logger.info();
  });

  // Demo 9: Free Tools Only
  logger.info('\n💰 Demo 9: Free Tools (No API Keys Required)');
  logger.info('='.repeat(70));
  
  const freeTools = mcpServerManager.getFreeTools();
  logger.info(`\nFound ${freeTools.length} free tools:\n`);
  
  const freeByCategory = new Map<string, number>();
  freeTools.forEach(tool => {
    freeByCategory.set(tool.category, (freeByCategory.get(tool.category) || 0) + 1);
  });
  
  freeByCategory.forEach((count, category) => {
    logger.info(`  ${category}: ${count} tools`);
  });

  // Demo 10: Tool Suggestions
  logger.info('\n\n🎯 Demo 10: Smart Tool Suggestions');
  logger.info('='.repeat(70));
  
  const userTasks = [
    'I want to write a blog post',
    'Need to search for information online',
    'Generate social media content',
  ];

  logger.info('\nUser Task → Suggested Tools:\n');
  userTasks.forEach(task => {
    logger.info(`📌 "${task}"`);
    const suggestion = mcpAutopilotActions.suggestToolsForTask(task, context);
    
    if (suggestion.primaryTool) {
      logger.info(`   Primary: ${suggestion.primaryTool.name}`);
      logger.info(`   Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`);
    }
    
    if (suggestion.alternativeTools.length > 0) {
      logger.info(`   Alternatives: ${suggestion.alternativeTools.slice(0, 2).map(t => t.name).join(', ')}`);
    }
    logger.info();
  });

  // Final Summary
  logger.info('\n' + '='.repeat(70));
  logger.info('✅ MCP Integration Demo Complete!');
  logger.info('='.repeat(70));
  
  logger.info('\n📊 Summary:');
  logger.info(`   Built-in Tools: ${MCP_TOOLS.length}`);
  logger.info(`   MCP Servers: ${serverStats.totalServers}`);
  logger.info(`   Total Tools Available: ${serverStats.totalTools}`);
  logger.info(`   Free Tools: ${serverStats.freeTools}`);
  logger.info(`   Tool Chains: ${availableChains.length}`);
  
  logger.info('\n🎯 Key Features:');
  logger.info('   ✓ 40+ built-in tools across 6 categories');
  logger.info('   ✓ 5 MCP server integrations');
  logger.info('   ✓ Intelligent tool selection');
  logger.info('   ✓ Pre-built tool chains');
  logger.info('   ✓ Content generation (Arabic & English)');
  logger.info('   ✓ Web search & scraping');
  logger.info('   ✓ Free tier available');
  logger.info('   ✓ Smart task planning');
  
  logger.info('\n🌟 Recommended Free Setup:');
  logger.info('   1. viaSocket MCP - Content generation & web search');
  logger.info('   2. MCPKit - Open source tools');
  logger.info('   3. MCP Toolbox - Unified interface');
  logger.info('   4. AuraOS Built-in - Local content generator');
  
  logger.info('\n🚀 Ready for production use!');
  logger.info('='.repeat(70) + '\n');
}

// Run demo
demoMCPCapabilities().catch(error => {
  logger.error('❌ Demo failed:', error);
  process.exit(1);
});
