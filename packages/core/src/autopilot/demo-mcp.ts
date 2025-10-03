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

console.log('🚀 AuraOS Autopilot - MCP Integration Demo\n');
console.log('='.repeat(70));

async function demoMCPCapabilities() {
  // Demo 1: Show available MCP tools
  console.log('\n📦 Demo 1: Available MCP Tools');
  console.log('='.repeat(70));
  
  console.log(`\nBuilt-in Tools: ${MCP_TOOLS.length}`);
  console.log('\nCategories:');
  
  const categories = new Map<string, number>();
  MCP_TOOLS.forEach(tool => {
    categories.set(tool.category, (categories.get(tool.category) || 0) + 1);
  });
  
  categories.forEach((count, category) => {
    console.log(`  ${category}: ${count} tools`);
  });

  // Demo 2: MCP Servers
  console.log('\n\n🌐 Demo 2: MCP Servers');
  console.log('='.repeat(70));
  
  const serverStats = mcpServerManager.getStats();
  console.log(`\nTotal Servers: ${serverStats.totalServers}`);
  console.log(`Enabled Servers: ${serverStats.enabledServers}`);
  console.log(`Total Tools: ${serverStats.totalTools}`);
  console.log(`Free Tools: ${serverStats.freeTools}`);
  
  console.log('\nAvailable Servers:');
  MCP_SERVERS.forEach(server => {
    const status = server.enabled ? '✅' : '❌';
    console.log(`  ${status} ${server.name} (${server.category})`);
    console.log(`     ${server.description}`);
    console.log(`     Tools: ${server.tools.length}`);
  });

  // Demo 3: Content Generation Tools
  console.log('\n\n📝 Demo 3: Content Generation Tools');
  console.log('='.repeat(70));
  
  const contentTools = mcpServerManager.getContentGenerationTools();
  console.log(`\nFound ${contentTools.length} content generation tools:\n`);
  
  contentTools.forEach((tool, i) => {
    console.log(`${i + 1}. ${tool.name}`);
    console.log(`   ${tool.description}`);
    console.log(`   Server: ${mcpServerManager.getServerForTool(tool.name)?.name}`);
  });

  // Demo 4: Web Search Tools
  console.log('\n\n🔍 Demo 4: Web Search Tools');
  console.log('='.repeat(70));
  
  const searchTools = mcpServerManager.getWebSearchTools();
  console.log(`\nFound ${searchTools.length} web search tools:\n`);
  
  searchTools.forEach((tool, i) => {
    console.log(`${i + 1}. ${tool.name}`);
    console.log(`   ${tool.description}`);
    console.log(`   Server: ${mcpServerManager.getServerForTool(tool.name)?.name}`);
  });

  // Demo 5: Intelligent Tool Selection
  console.log('\n\n🧠 Demo 5: Intelligent Tool Selection');
  console.log('='.repeat(70));
  
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

  console.log('\nTask → Recommended Tool:\n');
  testTasks.forEach(task => {
    const tool = selector.selectTool(task, context, MCP_TOOLS);
    console.log(`📌 "${task}"`);
    console.log(`   → ${tool ? tool.name : 'No tool found'}`);
    if (tool) {
      console.log(`   → ${tool.description}`);
    }
    console.log();
  });

  // Demo 6: Tool Chains
  console.log('\n🔗 Demo 6: Tool Chains');
  console.log('='.repeat(70));
  
  const availableChains = toolChainBuilder.getAllChains();
  console.log(`\nAvailable Chains: ${availableChains.length}\n`);
  
  availableChains.forEach(chainName => {
    const chain = toolChainBuilder.getChain(chainName);
    console.log(`📋 ${chainName}:`);
    chain.forEach((tool, i) => {
      console.log(`   ${i + 1}. ${tool.name}`);
    });
    console.log();
  });

  // Demo 7: Task Planning
  console.log('\n📋 Demo 7: Intelligent Task Planning');
  console.log('='.repeat(70));
  
  const complexTasks = [
    'Generate article about AI and publish it',
    'Search web for information and create summary',
    'Review code, suggest improvements, and run tests',
  ];

  console.log('\nPlanning complex tasks:\n');
  for (const task of complexTasks) {
    console.log(`📌 Task: "${task}"`);
    
    const plan = await mcpAutopilotActions.planToolExecution(task, context);
    console.log(`   Tools needed: ${plan.tools.length}`);
    console.log(`   Estimated time: ${plan.estimatedDuration}ms`);
    console.log(`   Plan:`);
    console.log(plan.plan.split('\n').map(line => `     ${line}`).join('\n'));
    console.log();
  }

  // Demo 8: Tool Recommendations
  console.log('\n💡 Demo 8: Tool Recommendations');
  console.log('='.repeat(70));
  
  const arabicTasks = [
    'اكتب مقال عن الذكاء الاصطناعي',
    'ابحث في الإنترنت عن معلومات',
    'ولد محتوى لوسائل التواصل الاجتماعي',
  ];

  console.log('\nArabic Task Support:\n');
  arabicTasks.forEach(task => {
    console.log(`📌 "${task}"`);
    const recommendations = mcpServerManager.recommendTools(task);
    
    if (recommendations.contentGeneration.length > 0) {
      console.log(`   Content Generation: ${recommendations.contentGeneration[0].name}`);
    }
    if (recommendations.webSearch.length > 0) {
      console.log(`   Web Search: ${recommendations.webSearch[0].name}`);
    }
    console.log();
  });

  // Demo 9: Free Tools Only
  console.log('\n💰 Demo 9: Free Tools (No API Keys Required)');
  console.log('='.repeat(70));
  
  const freeTools = mcpServerManager.getFreeTools();
  console.log(`\nFound ${freeTools.length} free tools:\n`);
  
  const freeByCategory = new Map<string, number>();
  freeTools.forEach(tool => {
    freeByCategory.set(tool.category, (freeByCategory.get(tool.category) || 0) + 1);
  });
  
  freeByCategory.forEach((count, category) => {
    console.log(`  ${category}: ${count} tools`);
  });

  // Demo 10: Tool Suggestions
  console.log('\n\n🎯 Demo 10: Smart Tool Suggestions');
  console.log('='.repeat(70));
  
  const userTasks = [
    'I want to write a blog post',
    'Need to search for information online',
    'Generate social media content',
  ];

  console.log('\nUser Task → Suggested Tools:\n');
  userTasks.forEach(task => {
    console.log(`📌 "${task}"`);
    const suggestion = mcpAutopilotActions.suggestToolsForTask(task, context);
    
    if (suggestion.primaryTool) {
      console.log(`   Primary: ${suggestion.primaryTool.name}`);
      console.log(`   Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`);
    }
    
    if (suggestion.alternativeTools.length > 0) {
      console.log(`   Alternatives: ${suggestion.alternativeTools.slice(0, 2).map(t => t.name).join(', ')}`);
    }
    console.log();
  });

  // Final Summary
  console.log('\n' + '='.repeat(70));
  console.log('✅ MCP Integration Demo Complete!');
  console.log('='.repeat(70));
  
  console.log('\n📊 Summary:');
  console.log(`   Built-in Tools: ${MCP_TOOLS.length}`);
  console.log(`   MCP Servers: ${serverStats.totalServers}`);
  console.log(`   Total Tools Available: ${serverStats.totalTools}`);
  console.log(`   Free Tools: ${serverStats.freeTools}`);
  console.log(`   Tool Chains: ${availableChains.length}`);
  
  console.log('\n🎯 Key Features:');
  console.log('   ✓ 40+ built-in tools across 6 categories');
  console.log('   ✓ 5 MCP server integrations');
  console.log('   ✓ Intelligent tool selection');
  console.log('   ✓ Pre-built tool chains');
  console.log('   ✓ Content generation (Arabic & English)');
  console.log('   ✓ Web search & scraping');
  console.log('   ✓ Free tier available');
  console.log('   ✓ Smart task planning');
  
  console.log('\n🌟 Recommended Free Setup:');
  console.log('   1. viaSocket MCP - Content generation & web search');
  console.log('   2. MCPKit - Open source tools');
  console.log('   3. MCP Toolbox - Unified interface');
  console.log('   4. AuraOS Built-in - Local content generator');
  
  console.log('\n🚀 Ready for production use!');
  console.log('='.repeat(70) + '\n');
}

// Run demo
demoMCPCapabilities().catch(error => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});
