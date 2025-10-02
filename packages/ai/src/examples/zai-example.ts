/**
 * Z.AI Assistant Example
 * Demonstrates how to use Z.AI GLM models in AuraOS
 */

import { ZAIAssistant } from '../zai-assistant';
import { MCPGateway } from '../mcp/gateway';

async function main() {
  console.log('🚀 Z.AI Assistant Example\n');

  // Initialize MCP Gateway (optional)
  const mcpGateway = new MCPGateway({
    maxServers: 10,
    requestTimeout: 30000,
    enableLogging: true,
  });

  // Example 1: Using the FREE GLM-4.5-Flash model
  console.log('📝 Example 1: Free Model (GLM-4.5-Flash)');
  const freeAssistant = new ZAIAssistant(
    {
      apiKey: process.env.ZAI_API_KEY || 'your-api-key-here',
      model: 'glm-4.5-flash', // FREE model
    },
    mcpGateway
  );

  try {
    const response1 = await freeAssistant.chat(
      'Write a simple hello world function in TypeScript'
    );
    console.log('Response:', response1);
    console.log('Stats:', freeAssistant.getStats());
    console.log('');
  } catch (error) {
    console.error('Error:', error);
  }

  // Example 2: Using GLM-4.6 (Premium model for coding)
  console.log('📝 Example 2: Premium Model (GLM-4.6)');
  const premiumAssistant = new ZAIAssistant(
    {
      apiKey: process.env.ZAI_API_KEY || 'your-api-key-here',
      model: 'glm-4.6', // Premium model
      maxTokens: 2048,
      temperature: 0.7,
    },
    mcpGateway
  );

  premiumAssistant.setSystemPrompt(
    'You are an expert TypeScript developer. Provide concise, production-ready code.'
  );

  try {
    const response2 = await premiumAssistant.chat(
      'Create a React component for a todo list with TypeScript'
    );
    console.log('Response:', response2);
    console.log('Stats:', premiumAssistant.getStats());
    console.log('');
  } catch (error) {
    console.error('Error:', error);
  }

  // Example 3: Streaming response
  console.log('📝 Example 3: Streaming Response');
  const streamAssistant = new ZAIAssistant(
    {
      apiKey: process.env.ZAI_API_KEY || 'your-api-key-here',
      model: 'glm-4.5-flash',
    },
    mcpGateway
  );

  try {
    console.log('Streaming response:');
    process.stdout.write('> ');
    
    for await (const chunk of streamAssistant.chatStream(
      'Explain what TypeScript is in one sentence'
    )) {
      process.stdout.write(chunk);
    }
    
    console.log('\n');
    console.log('Stats:', streamAssistant.getStats());
    console.log('');
  } catch (error) {
    console.error('Error:', error);
  }

  // Example 4: Multi-turn conversation
  console.log('📝 Example 4: Multi-turn Conversation');
  const conversationAssistant = new ZAIAssistant(
    {
      apiKey: process.env.ZAI_API_KEY || 'your-api-key-here',
      model: 'glm-4.5-flash',
    },
    mcpGateway
  );

  try {
    const msg1 = await conversationAssistant.chat('What is React?');
    console.log('Q: What is React?');
    console.log('A:', msg1.substring(0, 100) + '...\n');

    const msg2 = await conversationAssistant.chat('What are its main benefits?');
    console.log('Q: What are its main benefits?');
    console.log('A:', msg2.substring(0, 100) + '...\n');

    console.log('Conversation history length:', conversationAssistant.getHistory().length);
    console.log('Stats:', conversationAssistant.getStats());
    console.log('');
  } catch (error) {
    console.error('Error:', error);
  }

  // Example 5: Testing connection
  console.log('📝 Example 5: Connection Test');
  const testAssistant = new ZAIAssistant(
    {
      apiKey: process.env.ZAI_API_KEY || 'your-api-key-here',
      model: 'glm-4.5-flash',
    },
    mcpGateway
  );

  const isConnected = await testAssistant.testConnection();
  console.log('Connection test:', isConnected ? '✅ Success' : '❌ Failed');
  console.log('');

  // Example 6: Available models
  console.log('📝 Example 6: Available Models');
  const models = ZAIAssistant.getAvailableModels();
  console.log('Available Z.AI models:');
  models.forEach((model) => {
    console.log(`  - ${model}`);
  });
  console.log('');

  // Example 7: Dynamic model switching
  console.log('📝 Example 7: Dynamic Model Switching');
  const dynamicAssistant = new ZAIAssistant(
    {
      apiKey: process.env.ZAI_API_KEY || 'your-api-key-here',
      model: 'glm-4.5-flash',
    },
    mcpGateway
  );

  console.log('Current model:', dynamicAssistant.getModel());
  
  try {
    const response = await dynamicAssistant.chat('Hello!');
    console.log('Response with glm-4.5-flash:', response.substring(0, 50) + '...');
    
    // Switch to a different model
    dynamicAssistant.setModel('glm-4.5-air');
    console.log('Switched to:', dynamicAssistant.getModel());
    
    const response2 = await dynamicAssistant.chat('How are you?');
    console.log('Response with glm-4.5-air:', response2.substring(0, 50) + '...');
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n✅ All examples completed!');
}

// Run examples
if (require.main === module) {
  main().catch(console.error);
}

export { main };
