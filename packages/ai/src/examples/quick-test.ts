/**
 * Quick Test for AI Assistant
 * Simple script to test AI integration with MCP
 */

import { MCPGateway } from '../mcp/gateway';
import { AIAssistant } from '../assistant';
import { FileSystemMCPServer } from '../../../core/src/mcp/filesystem';

async function quickTest() {
  console.log('🚀 AuraOS AI Assistant - Quick Test\n');

  // 1. Setup MCP Gateway
  console.log('1. Setting up MCP Gateway...');
  const gateway = new MCPGateway({
    maxServers: 10,
    requestTimeout: 10000,
    enableLogging: true,
  });

  // 2. Register FileSystem server
  console.log('2. Registering FileSystem MCP Server...');
  const fsServer = new FileSystemMCPServer('/tmp/auraos-test');
  await gateway.registerServer(fsServer);

  // 3. Create AI Assistant
  console.log('3. Creating AI Assistant...');
  const assistant = new AIAssistant(gateway);

  // 4. Show available tools
  console.log('\n4. Available Tools:');
  const tools = assistant.getAvailableTools();
  tools.forEach((tool) => {
    console.log(`   - ${tool.name}: ${tool.description}`);
  });

  // 5. Test chat
  console.log('\n5. Testing AI Chat...\n');
  console.log('=' .repeat(60));

  try {
    const userMessage = 'Use the filesystem tool to list the files in the root directory.';
    console.log(`User: ${userMessage}\n`);

    const response = await assistant.chat(userMessage);
    console.log(`Assistant: ${response}\n`);

    console.log('=' .repeat(60));

    // 6. Show statistics
    console.log('\n6. Gateway Statistics:');
    const stats = gateway.getStats();
    console.log(`   Total requests: ${stats.totalRequests}`);
    console.log(`   Successful: ${stats.successfulRequests}`);
    console.log(`   Failed: ${stats.failedRequests}`);
    console.log(`   Avg response time: ${stats.averageResponseTime.toFixed(2)}ms`);

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    // Cleanup
    await gateway.shutdown();
  }
}

// Run test
if (require.main === module) {
  quickTest().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { quickTest };
