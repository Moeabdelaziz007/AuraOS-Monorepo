#!/usr/bin/env node

/**
 * AuraOS Debugger MCP Test
 * Test the debugger tool with MCP integration
 */

const { mcpCommands } = require('./packages/core/dist/ai/mcp-commands');

async function testDebuggerMCP() {
  console.log('🚀 AuraOS Debugger MCP Test');
  console.log('============================\n');

  try {
    // Initialize MCP
    console.log('1. Initializing MCP...');
    await mcpCommands.initialize();
    console.log('✅ MCP initialized successfully\n');

    // Test file operations
    console.log('2. Testing file operations...');
    
    // List current directory
    const files = await mcpCommands.file.list('.');
    console.log('📁 Current directory contents:');
    console.log(files);
    console.log('');

    // Test file search
    console.log('3. Testing file search...');
    const searchResults = await mcpCommands.file.search('package.json');
    console.log('🔍 Search results for package.json:');
    console.log(searchResults);
    console.log('');

    // Test AI code analysis
    console.log('4. Testing AI code analysis...');
    const testCode = `
10 PRINT "Hello, AuraOS!"
20 FOR I = 1 TO 10
30 PRINT "Count: "; I
40 NEXT I
50 END
    `;
    
    const analysis = await mcpCommands.ai.analyzeCode(testCode, 'BASIC');
    console.log('🤖 AI Code Analysis:');
    console.log(analysis);
    console.log('');

    // Test emulator
    console.log('5. Testing BASIC emulator...');
    const emulatorResult = await mcpCommands.emulator.run(testCode);
    console.log('💻 Emulator Output:');
    console.log('Success:', emulatorResult.success);
    console.log('Output:', emulatorResult.output);
    if (emulatorResult.explanation) {
      console.log('Explanation:', emulatorResult.explanation);
    }
    console.log('');

    // Test AI chat
    console.log('6. Testing AI chat...');
    const chatResponse = await mcpCommands.ai.chat('Explain what this BASIC program does');
    console.log('💬 AI Chat Response:');
    console.log(chatResponse);
    console.log('');

    console.log('🎉 All MCP tests completed successfully!');
    console.log('\nAvailable MCP Tools:');
    const tools = mcpCommands.getAvailableTools();
    tools.forEach(tool => console.log(`  - ${tool}`));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    await mcpCommands.shutdown();
    console.log('✅ MCP shutdown complete');
  }
}

// Run the test
if (require.main === module) {
  testDebuggerMCP().catch(console.error);
}

module.exports = { testDebuggerMCP };
