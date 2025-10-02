# AI Integration Guide

## Overview

AuraOS integrates AI models (Claude, GPT, etc.) with the MCP (Model Context Protocol) infrastructure, enabling AI assistants to interact with OS components through tools. This guide shows how to use the AI integration.

## Architecture

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AIAssistant    │ ← Manages conversation & tool execution
└────────┬────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Claude    │  │ MCPGateway  │  │ Conversation│
│     API     │  │             │  │   History   │
└─────────────┘  └──────┬──────┘  └─────────────┘
                        │
                        ▼
                ┌───────────────┐
                │  MCP Servers  │
                │               │
                │ • FileSystem  │
                │ • Emulator    │
                │ • Terminal    │
                │ • ...         │
                └───────────────┘
```

## Quick Start

### 1. Setup Environment

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="your-api-key-here"

# Or create .env file
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env
```

### 2. Basic Usage

```typescript
import { MCPGateway } from '@auraos/ai/mcp/gateway';
import { AIAssistant } from '@auraos/ai/assistant';
import { FileSystemMCPServer } from '@auraos/core/mcp/filesystem';

// Create gateway and register servers
const gateway = new MCPGateway({
  maxServers: 10,
  requestTimeout: 10000,
  enableLogging: true,
});

const fsServer = new FileSystemMCPServer('/workspace');
await gateway.registerServer(fsServer);

// Create AI assistant
const assistant = new AIAssistant(gateway);

// Chat with AI
const response = await assistant.chat(
  'Create a file called hello.txt with the content "Hello, AuraOS!"'
);

console.log(response);
```

## AIAssistant API

### Constructor

```typescript
constructor(gateway: MCPGateway, apiKey?: string)
```

**Parameters:**
- `gateway` - MCP Gateway instance with registered servers
- `apiKey` - Anthropic API key (optional, defaults to `ANTHROPIC_API_KEY` env var)

### Methods

#### `chat(message: string, options?: ChatOptions): Promise<string>`

Send a message to the AI assistant and get a response.

**Parameters:**
- `message` - User message
- `options` - Optional configuration:
  - `maxTokens` - Maximum tokens in response (default: 4096)
  - `temperature` - Response randomness 0-1 (default: 1.0)
  - `systemPrompt` - Custom system prompt for this message

**Returns:** AI assistant's response as a string

**Example:**
```typescript
const response = await assistant.chat('List all files in the current directory');
console.log(response);
```

#### `clearHistory(): void`

Clear the conversation history.

**Example:**
```typescript
assistant.clearHistory();
```

#### `getHistory(): Message[]`

Get the conversation history.

**Returns:** Array of messages with roles and content

**Example:**
```typescript
const history = assistant.getHistory();
history.forEach((msg) => {
  console.log(`${msg.role}: ${msg.content}`);
});
```

#### `setSystemPrompt(prompt: string): void`

Set a custom system prompt for all future conversations.

**Example:**
```typescript
assistant.setSystemPrompt('You are a helpful OS assistant specialized in file management.');
```

#### `getAvailableTools(): Tool[]`

Get all available tools from the MCP gateway.

**Returns:** Array of tool definitions

**Example:**
```typescript
const tools = assistant.getAvailableTools();
tools.forEach((tool) => {
  console.log(`${tool.name}: ${tool.description}`);
});
```

#### `getStats()`

Get MCP gateway statistics.

**Returns:** Statistics object with request counts and performance metrics

**Example:**
```typescript
const stats = assistant.getStats();
console.log(`Total requests: ${stats.totalRequests}`);
console.log(`Success rate: ${(stats.successfulRequests / stats.totalRequests) * 100}%`);
```

## Usage Examples

### Example 1: File Operations

```typescript
import { MCPGateway } from '@auraos/ai/mcp/gateway';
import { AIAssistant } from '@auraos/ai/assistant';
import { FileSystemMCPServer } from '@auraos/core/mcp/filesystem';

async function fileOperationsExample() {
  // Setup
  const gateway = new MCPGateway();
  const fsServer = new FileSystemMCPServer('/workspace');
  await gateway.registerServer(fsServer);
  
  const assistant = new AIAssistant(gateway);

  // Create a file
  await assistant.chat('Create a file called notes.txt with "Meeting at 3pm"');

  // Read the file
  const content = await assistant.chat('Read the contents of notes.txt');
  console.log(content);

  // List files
  await assistant.chat('List all .txt files in the current directory');

  // Cleanup
  await gateway.shutdown();
}
```

### Example 2: Emulator Control

```typescript
import { MCPGateway } from '@auraos/ai/mcp/gateway';
import { AIAssistant } from '@auraos/ai/assistant';
import { EmulatorControlMCPServer } from '@auraos/core/mcp/emulator';

async function emulatorExample() {
  // Setup
  const gateway = new MCPGateway();
  const emuServer = new EmulatorControlMCPServer();
  await gateway.registerServer(emuServer);
  
  const assistant = new AIAssistant(gateway);

  // Create and start emulator
  await assistant.chat('Create a new CPU emulator and start it');

  // Load a program
  await assistant.chat(
    'Load this 6502 program into the emulator: LDA #$01, STA $0200'
  );

  // Step through execution
  await assistant.chat('Execute 2 instruction steps and show me the CPU state');

  // Cleanup
  await gateway.shutdown();
}
```

### Example 3: Multi-Turn Conversation

```typescript
async function conversationExample() {
  const gateway = new MCPGateway();
  const fsServer = new FileSystemMCPServer('/workspace');
  await gateway.registerServer(fsServer);
  
  const assistant = new AIAssistant(gateway);

  // Multi-turn conversation with context
  await assistant.chat('Create a directory called projects');
  await assistant.chat('Now create a file in that directory called readme.md');
  await assistant.chat('Write "# My Project" to that file');
  await assistant.chat('Show me the contents of the file you just created');

  // The assistant maintains context throughout the conversation
  
  await gateway.shutdown();
}
```

### Example 4: Custom System Prompt

```typescript
async function customPromptExample() {
  const gateway = new MCPGateway();
  const fsServer = new FileSystemMCPServer('/workspace');
  await gateway.registerServer(fsServer);
  
  const assistant = new AIAssistant(gateway);

  // Set custom system prompt
  assistant.setSystemPrompt(`
    You are a code review assistant. When users ask you to review code:
    1. Read the file using filesystem tools
    2. Analyze the code for issues
    3. Provide specific, actionable feedback
    4. Suggest improvements
  `);

  const review = await assistant.chat('Review the code in main.ts');
  console.log(review);

  await gateway.shutdown();
}
```

### Example 5: Error Handling

```typescript
async function errorHandlingExample() {
  const gateway = new MCPGateway();
  const fsServer = new FileSystemMCPServer('/workspace');
  await gateway.registerServer(fsServer);
  
  const assistant = new AIAssistant(gateway);

  try {
    // AI will handle tool errors gracefully
    const response = await assistant.chat('Read a file that does not exist');
    console.log(response); // AI explains the file doesn't exist
  } catch (error) {
    console.error('Assistant error:', error);
  }

  await gateway.shutdown();
}
```

### Example 6: Interactive Chat Loop

```typescript
import * as readline from 'readline';

async function interactiveChatExample() {
  const gateway = new MCPGateway();
  const fsServer = new FileSystemMCPServer('/workspace');
  const emuServer = new EmulatorControlMCPServer();
  
  await gateway.registerServer(fsServer);
  await gateway.registerServer(emuServer);
  
  const assistant = new AIAssistant(gateway);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('AuraOS AI Assistant (type "exit" to quit)\n');

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        await gateway.shutdown();
        rl.close();
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
```

## Tool Execution Flow

When you send a message to the AI assistant, here's what happens:

1. **User sends message** → `assistant.chat("Create a file")`

2. **AI analyzes message** → Claude determines it needs to use tools

3. **AI requests tools** → Returns `tool_use` with tool name and parameters

4. **Assistant executes tools** → Calls `gateway.handleRequest()` for each tool

5. **Tools return results** → FileSystem server executes and returns data

6. **Results sent to AI** → Tool results added to conversation

7. **AI generates response** → Claude creates natural language response

8. **User receives response** → Final answer returned to user

## Advanced Features

### Custom Chat Options

```typescript
const response = await assistant.chat('Complex task', {
  maxTokens: 8000,        // Longer responses
  temperature: 0.3,       // More focused/deterministic
  systemPrompt: 'Custom instructions for this specific task',
});
```

### Monitoring Performance

```typescript
// Get statistics after operations
const stats = assistant.getStats();

console.log('Performance Metrics:');
console.log(`- Total requests: ${stats.totalRequests}`);
console.log(`- Success rate: ${(stats.successfulRequests / stats.totalRequests * 100).toFixed(2)}%`);
console.log(`- Average response time: ${stats.averageResponseTime.toFixed(2)}ms`);

// Per-server statistics
stats.serverStats.forEach((serverStat, serverName) => {
  console.log(`\n${serverName}:`);
  console.log(`  - Requests: ${serverStat.requestCount}`);
  console.log(`  - Avg time: ${serverStat.averageResponseTime.toFixed(2)}ms`);
});
```

### Conversation Management

```typescript
// Save conversation history
const history = assistant.getHistory();
localStorage.setItem('chat_history', JSON.stringify(history));

// Restore conversation history
const savedHistory = JSON.parse(localStorage.getItem('chat_history'));
// Note: You'll need to manually restore by replaying messages

// Clear history for new conversation
assistant.clearHistory();
```

## Testing

### Running Tests

```bash
# Test AI assistant
cd packages/ai
pnpm test src/__tests__/assistant.test.ts

# Run all MCP tests
pnpm test
```

### Running Examples

```bash
# Quick test
cd packages/ai
npx tsx src/examples/quick-test.ts

# Interactive demo
npx tsx src/examples/assistant-demo.ts interactive

# Specific demo
npx tsx src/examples/assistant-demo.ts 1  # File operations
npx tsx src/examples/assistant-demo.ts 2  # Emulator control
npx tsx src/examples/assistant-demo.ts 3  # Combined operations
```

## Best Practices

### 1. Always Cleanup

```typescript
try {
  const assistant = new AIAssistant(gateway);
  await assistant.chat('Do something');
} finally {
  await gateway.shutdown();
}
```

### 2. Handle Errors Gracefully

```typescript
try {
  const response = await assistant.chat(userInput);
  console.log(response);
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('Please set ANTHROPIC_API_KEY environment variable');
  } else {
    console.error('Assistant error:', error);
  }
}
```

### 3. Use Appropriate Timeouts

```typescript
const gateway = new MCPGateway({
  requestTimeout: 30000, // 30 seconds for complex operations
});
```

### 4. Monitor Token Usage

```typescript
// Use lower max_tokens for simple queries
await assistant.chat('Quick question', { maxTokens: 1000 });

// Use higher max_tokens for complex tasks
await assistant.chat('Analyze this code', { maxTokens: 8000 });
```

### 5. Provide Clear Instructions

```typescript
// ❌ Vague
await assistant.chat('Do something with files');

// ✅ Clear
await assistant.chat('Create a file called config.json with {"debug": true}');
```

## Troubleshooting

### API Key Issues

```
Error: Missing API key
```

**Solution:**
```bash
export ANTHROPIC_API_KEY="your-key-here"
# or
const assistant = new AIAssistant(gateway, 'your-key-here');
```

### Tool Not Found

```
Error: No server found for tool 'tool_name'
```

**Solution:** Ensure the server providing the tool is registered:
```typescript
await gateway.registerServer(yourServer);
```

### Timeout Errors

```
Error: Request timeout after 10000ms
```

**Solution:** Increase timeout or optimize tool implementation:
```typescript
const gateway = new MCPGateway({
  requestTimeout: 30000, // Increase timeout
});
```

### Rate Limiting

If you hit API rate limits, implement retry logic:
```typescript
async function chatWithRetry(assistant, message, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await assistant.chat(message);
    } catch (error) {
      if (error.message.includes('rate limit') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

## Next Steps

- Explore [MCP Usage Guide](./MCP_USAGE_GUIDE.md) for more on MCP servers
- Check [MCP Integration Strategy](../MCP_INTEGRATION_STRATEGY.md) for planned features
- See [Examples](../packages/ai/src/examples/) for more code samples

## Support

For issues or questions:
- GitHub Issues: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues
- Documentation: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/tree/main/docs
