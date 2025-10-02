/**
 * AI Assistant Demo
 * Example usage of AIAssistant with MCP tools
 */

import { MCPGateway } from '../mcp/gateway';
import { AIAssistant } from '../assistant';
import { FileSystemMCPServer } from '../../../core/src/mcp/filesystem';
import { EmulatorControlMCPServer } from '../../../core/src/mcp/emulator';

/**
 * Demo 1: Basic conversation with file operations
 */
async function demo1_FileOperations() {
  console.log('\n=== Demo 1: File Operations ===\n');

  // Setup
  const gateway = new MCPGateway({
    maxServers: 10,
    requestTimeout: 10000,
    enableLogging: true,
  });

  const fsServer = new FileSystemMCPServer('/tmp/auraos-demo');
  await gateway.registerServer(fsServer);

  const assistant = new AIAssistant(gateway);

  // Test conversation
  try {
    console.log('User: Create a file called hello.txt with the content "Hello from AuraOS!"');
    const response1 = await assistant.chat(
      'Create a file called hello.txt with the content "Hello from AuraOS!"'
    );
    console.log('Assistant:', response1);

    console.log('\n---\n');

    console.log('User: Now read that file back to me');
    const response2 = await assistant.chat('Now read that file back to me');
    console.log('Assistant:', response2);

    console.log('\n---\n');

    console.log('User: List all files in the current directory');
    const response3 = await assistant.chat('List all files in the current directory');
    console.log('Assistant:', response3);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await gateway.shutdown();
  }
}

/**
 * Demo 2: Emulator control
 */
async function demo2_EmulatorControl() {
  console.log('\n=== Demo 2: Emulator Control ===\n');

  // Setup
  const gateway = new MCPGateway({
    maxServers: 10,
    requestTimeout: 10000,
    enableLogging: true,
  });

  const emuServer = new EmulatorControlMCPServer();
  await gateway.registerServer(emuServer);

  const assistant = new AIAssistant(gateway);

  // Test conversation
  try {
    console.log('User: Create a new CPU emulator and start it');
    const response1 = await assistant.chat('Create a new CPU emulator and start it');
    console.log('Assistant:', response1);

    console.log('\n---\n');

    console.log('User: Show me the current state of the emulator');
    const response2 = await assistant.chat('Show me the current state of the emulator');
    console.log('Assistant:', response2);

    console.log('\n---\n');

    console.log('User: List all running emulators');
    const response3 = await assistant.chat('List all running emulators');
    console.log('Assistant:', response3);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await gateway.shutdown();
  }
}

/**
 * Demo 3: Combined operations
 */
async function demo3_CombinedOperations() {
  console.log('\n=== Demo 3: Combined Operations ===\n');

  // Setup
  const gateway = new MCPGateway({
    maxServers: 10,
    requestTimeout: 10000,
    enableLogging: true,
  });

  const fsServer = new FileSystemMCPServer('/tmp/auraos-demo');
  const emuServer = new EmulatorControlMCPServer();

  await gateway.registerServer(fsServer);
  await gateway.registerServer(emuServer);

  const assistant = new AIAssistant(gateway);

  // Test conversation
  try {
    console.log(
      'User: Create a file called program.asm with a simple 6502 assembly program, then create an emulator and load it'
    );
    const response = await assistant.chat(
      'Create a file called program.asm with a simple 6502 assembly program (just a few instructions like LDA #$01, STA $0200), then create an emulator and tell me about both operations'
    );
    console.log('Assistant:', response);

    // Show statistics
    console.log('\n--- Gateway Statistics ---');
    const stats = gateway.getStats();
    console.log(`Total requests: ${stats.totalRequests}`);
    console.log(`Successful: ${stats.successfulRequests}`);
    console.log(`Failed: ${stats.failedRequests}`);
    console.log(`Average response time: ${stats.averageResponseTime.toFixed(2)}ms`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await gateway.shutdown();
  }
}

/**
 * Demo 4: Error handling
 */
async function demo4_ErrorHandling() {
  console.log('\n=== Demo 4: Error Handling ===\n');

  // Setup
  const gateway = new MCPGateway({
    maxServers: 10,
    requestTimeout: 10000,
    enableLogging: true,
  });

  const fsServer = new FileSystemMCPServer('/tmp/auraos-demo');
  await gateway.registerServer(fsServer);

  const assistant = new AIAssistant(gateway);

  // Test error handling
  try {
    console.log('User: Read a file that does not exist called nonexistent.txt');
    const response = await assistant.chat('Read a file that does not exist called nonexistent.txt');
    console.log('Assistant:', response);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await gateway.shutdown();
  }
}

/**
 * Demo 5: Tool discovery
 */
async function demo5_ToolDiscovery() {
  console.log('\n=== Demo 5: Tool Discovery ===\n');

  // Setup
  const gateway = new MCPGateway({
    maxServers: 10,
    requestTimeout: 10000,
    enableLogging: true,
  });

  const fsServer = new FileSystemMCPServer('/tmp/auraos-demo');
  const emuServer = new EmulatorControlMCPServer();

  await gateway.registerServer(fsServer);
  await gateway.registerServer(emuServer);

  const assistant = new AIAssistant(gateway);

  // Test tool discovery
  try {
    console.log('User: What tools do you have available?');
    const response = await assistant.chat('What tools do you have available? List them all.');
    console.log('Assistant:', response);

    console.log('\n--- Available Tools ---');
    const tools = assistant.getAvailableTools();
    console.log(`Total tools: ${tools.length}`);
    tools.forEach((tool) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await gateway.shutdown();
  }
}

/**
 * Interactive demo
 */
async function interactiveDemo() {
  console.log('\n=== Interactive Demo ===\n');
  console.log('Type your messages and press Enter. Type "exit" to quit.\n');

  // Setup
  const gateway = new MCPGateway({
    maxServers: 10,
    requestTimeout: 10000,
    enableLogging: true,
  });

  const fsServer = new FileSystemMCPServer('/tmp/auraos-demo');
  const emuServer = new EmulatorControlMCPServer();

  await gateway.registerServer(fsServer);
  await gateway.registerServer(emuServer);

  const assistant = new AIAssistant(gateway);

  // Interactive loop
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question('You: ', async (input: string) => {
      if (input.toLowerCase() === 'exit') {
        console.log('\nGoodbye!');
        await gateway.shutdown();
        rl.close();
        return;
      }

      if (input.toLowerCase() === 'clear') {
        assistant.clearHistory();
        console.log('Conversation history cleared.\n');
        askQuestion();
        return;
      }

      if (input.toLowerCase() === 'stats') {
        const stats = gateway.getStats();
        console.log('\n--- Statistics ---');
        console.log(`Total requests: ${stats.totalRequests}`);
        console.log(`Successful: ${stats.successfulRequests}`);
        console.log(`Failed: ${stats.failedRequests}`);
        console.log(`Average response time: ${stats.averageResponseTime.toFixed(2)}ms\n`);
        askQuestion();
        return;
      }

      try {
        const response = await assistant.chat(input);
        console.log(`\nAssistant: ${response}\n`);
      } catch (error) {
        console.error('Error:', error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

/**
 * Main function - run all demos
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('AI Assistant Demo');
    console.log('================\n');
    console.log('Usage: node assistant-demo.js [demo-number]');
    console.log('\nAvailable demos:');
    console.log('  1 - File Operations');
    console.log('  2 - Emulator Control');
    console.log('  3 - Combined Operations');
    console.log('  4 - Error Handling');
    console.log('  5 - Tool Discovery');
    console.log('  interactive - Interactive chat mode');
    console.log('\nExample: node assistant-demo.js 1');
    return;
  }

  const demo = args[0];

  switch (demo) {
    case '1':
      await demo1_FileOperations();
      break;
    case '2':
      await demo2_EmulatorControl();
      break;
    case '3':
      await demo3_CombinedOperations();
      break;
    case '4':
      await demo4_ErrorHandling();
      break;
    case '5':
      await demo5_ToolDiscovery();
      break;
    case 'interactive':
      await interactiveDemo();
      break;
    default:
      console.log(`Unknown demo: ${demo}`);
      console.log('Run without arguments to see available demos.');
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  demo1_FileOperations,
  demo2_EmulatorControl,
  demo3_CombinedOperations,
  demo4_ErrorHandling,
  demo5_ToolDiscovery,
  interactiveDemo,
};
