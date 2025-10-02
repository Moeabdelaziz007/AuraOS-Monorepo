/**
 * Test Both AI Providers
 * Compare Anthropic and vLLM performance
 */

import { MCPGateway } from '../mcp/gateway';
import { createAIAssistant, AIAssistantConfig } from '../assistant-factory';
import { FileSystemMCPServer } from '../../../core/src/mcp/filesystem';

async function testProvider(config: AIAssistantConfig, testName: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${testName}`);
  console.log('='.repeat(60));

  try {
    // Setup
    const gateway = new MCPGateway({
      maxServers: 10,
      requestTimeout: 30000,
      enableLogging: false,
    });

    const fsServer = new FileSystemMCPServer('/tmp/auraos-test');
    await gateway.registerServer(fsServer);

    // Create assistant
    console.log('Creating assistant...');
    const assistant = await createAIAssistant(gateway, config);

    // Test 1: Simple query
    console.log('\n--- Test 1: Simple Query ---');
    const start1 = Date.now();
    const response1 = await assistant.chat('Hello! What can you help me with?');
    const time1 = Date.now() - start1;
    console.log(`Response (${time1}ms):`, response1.substring(0, 200));

    // Test 2: Tool usage
    console.log('\n--- Test 2: Tool Usage ---');
    const start2 = Date.now();
    const response2 = await assistant.chat('List all files in the current directory');
    const time2 = Date.now() - start2;
    console.log(`Response (${time2}ms):`, response2.substring(0, 200));

    // Test 3: Multi-turn conversation
    console.log('\n--- Test 3: Multi-turn Conversation ---');
    const start3 = Date.now();
    await assistant.chat('Create a file called test.txt with "Hello World"');
    const response3 = await assistant.chat('Now read that file back to me');
    const time3 = Date.now() - start3;
    console.log(`Response (${time3}ms):`, response3.substring(0, 200));

    // Statistics
    console.log('\n--- Statistics ---');
    const stats = gateway.getStats();
    console.log(`Total requests: ${stats.totalRequests}`);
    console.log(`Successful: ${stats.successfulRequests}`);
    console.log(`Failed: ${stats.failedRequests}`);
    console.log(`Average response time: ${stats.averageResponseTime.toFixed(2)}ms`);

    console.log(`\n✅ ${testName} tests completed successfully!`);

    // Cleanup
    await gateway.shutdown();
  } catch (error) {
    console.error(`\n❌ ${testName} tests failed:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 AuraOS AI Provider Comparison Test\n');

  // Test Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    await testProvider(
      {
        provider: 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
      'Anthropic Claude'
    );
  } else {
    console.log('⚠️  Skipping Anthropic tests (ANTHROPIC_API_KEY not set)');
  }

  // Test vLLM
  const vllmUrl = process.env.VLLM_URL || 'http://localhost:8000/v1';
  console.log(`\nChecking vLLM availability at ${vllmUrl}...`);

  try {
    const response = await fetch(`${vllmUrl}/models`);
    if (response.ok) {
      await testProvider(
        {
          provider: 'vllm',
          vllmUrl,
          modelName: process.env.VLLM_MODEL || 'meta-llama/Llama-3.1-8B-Instruct',
        },
        'vLLM (Self-Hosted)'
      );
    } else {
      console.log('⚠️  Skipping vLLM tests (server not responding)');
    }
  } catch (error) {
    console.log('⚠️  Skipping vLLM tests (server not available)');
    console.log('   Start vLLM with: docker compose -f docker-compose.vllm.yml up -d');
  }

  console.log('\n' + '='.repeat(60));
  console.log('All tests completed!');
  console.log('='.repeat(60));
}

// Run tests
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { testProvider };
