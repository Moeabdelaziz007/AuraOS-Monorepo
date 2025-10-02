# @auraos/ai

AI integration package for AuraOS with Model Context Protocol (MCP) support.

## Features

- 🤖 **AI Assistant** - Natural language interface to OS tools
- 🔧 **MCP Gateway** - Central routing hub for tool execution
- 🛠️ **Tool Execution** - Execute OS operations through AI
- 📝 **Conversation Management** - Multi-turn conversations with context
- 📊 **Performance Monitoring** - Track tool usage and performance
- 🧪 **Comprehensive Testing** - Full test coverage
- 🌐 **Multiple Providers** - Anthropic Claude, Z.AI GLM, vLLM support
- 💰 **Free Tier Available** - Z.AI GLM-4.5-Flash is completely FREE

## Installation

```bash
pnpm add @auraos/ai
```

## Quick Start

```typescript
import { MCPGateway, createAIAssistantFromEnv } from '@auraos/ai';
import { FileSystemMCPServer } from '@auraos/core/mcp/filesystem';

// Setup MCP Gateway
const gateway = new MCPGateway();
const fsServer = new FileSystemMCPServer('/workspace');
await gateway.registerServer(fsServer);

// Create AI assistant (auto-detects provider from env)
const assistant = await createAIAssistantFromEnv(gateway);

// Or create with specific provider
import { ZAIAssistant } from '@auraos/ai';
const zaiAssistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash', // FREE model
}, gateway);

// Chat with AI
const response = await assistant.chat(
  'Create a file called hello.txt with "Hello, AuraOS!"'
);

console.log(response);

// Cleanup
await gateway.shutdown();
```

## Components

### AIAssistant

Connects AI models (Claude) to MCP tools for natural language OS control.

```typescript
const assistant = new AIAssistant(gateway, apiKey);

// Chat
await assistant.chat('List all files');

// Manage conversation
assistant.clearHistory();
const history = assistant.getHistory();

// Get tools
const tools = assistant.getAvailableTools();

// Get statistics
const stats = assistant.getStats();
```

### MCPGateway

Central routing hub for MCP tool requests.

```typescript
const gateway = new MCPGateway({
  maxServers: 10,
  requestTimeout: 10000,
  enableLogging: true,
});

// Register servers
await gateway.registerServer(fileSystemServer);
await gateway.registerServer(emulatorServer);

// Get tools
const tools = gateway.getToolDefinitions();

// Get statistics
const stats = gateway.getStats();
```

### MCPClient

User-friendly interface for tool execution.

```typescript
const client = new MCPClient(gateway, userId, sessionId);

// Execute tools
const result = await client.executeTool('fs_read', { path: 'file.txt' });

// Discover tools
const allTools = client.getAvailableTools();
const fileTools = client.getToolsByServer('filesystem');
const searchResults = client.searchTools('memory');
```

### BaseMCPServer

Abstract base class for creating custom MCP servers.

```typescript
class CustomServer extends BaseMCPServer {
  name = 'custom';
  version = '1.0.0';
  
  tools: Tool[] = [
    {
      name: 'my_tool',
      description: 'Does something',
      inputSchema: { /* ... */ },
    },
  ];
  
  protected async handleToolExecution(toolName: string, input: any) {
    // Implementation
  }
}
```

## Examples

### File Operations

```typescript
const assistant = new AIAssistant(gateway);

await assistant.chat('Create a directory called projects');
await assistant.chat('Create a file in projects/readme.md');
await assistant.chat('Write "# My Project" to that file');
await assistant.chat('Show me the contents');
```

### Emulator Control

```typescript
const assistant = new AIAssistant(gateway);

await assistant.chat('Create a CPU emulator and start it');
await assistant.chat('Load this program: LDA #$01, STA $0200');
await assistant.chat('Execute 5 instruction steps');
await assistant.chat('Show me the CPU registers');
```

### Interactive Chat

```typescript
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = () => {
  rl.question('You: ', async (input) => {
    if (input === 'exit') {
      await gateway.shutdown();
      rl.close();
      return;
    }
    
    const response = await assistant.chat(input);
    console.log(`Assistant: ${response}\n`);
    askQuestion();
  });
};

askQuestion();
```

## Running Examples

```bash
# Quick test
npx tsx src/examples/quick-test.ts

# Interactive demo
npx tsx src/examples/assistant-demo.ts interactive

# Specific demos
npx tsx src/examples/assistant-demo.ts 1  # File operations
npx tsx src/examples/assistant-demo.ts 2  # Emulator control
npx tsx src/examples/assistant-demo.ts 3  # Combined operations
```

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/__tests__/assistant.test.ts

# Run with coverage
pnpm test --coverage
```

## Configuration

### Environment Variables

```bash
# AI Provider Selection
AI_PROVIDER=anthropic  # Options: anthropic, vllm, zai

# Anthropic Configuration
ANTHROPIC_API_KEY=your-api-key-here

# Z.AI Configuration (FREE tier available)
ZAI_API_KEY=your-zai-api-key-here
ZAI_MODEL=glm-4.5-flash  # FREE model

# vLLM Configuration
VLLM_URL=http://localhost:8000/v1
VLLM_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

### Gateway Configuration

```typescript
const gateway = new MCPGateway({
  maxServers: 10,           // Maximum number of servers
  requestTimeout: 10000,    // Request timeout in ms
  enableLogging: true,      // Enable request logging
});
```

### Chat Options

```typescript
await assistant.chat('message', {
  maxTokens: 4096,          // Maximum response tokens
  temperature: 1.0,         // Response randomness (0-1)
  systemPrompt: 'Custom',   // Custom system prompt
});
```

## API Reference

See the [MCP Usage Guide](../../docs/MCP_USAGE_GUIDE.md) and [AI Integration Guide](../../docs/AI_INTEGRATION_GUIDE.md) for complete API documentation.

## Architecture

```
AI Assistant Factory
    ├── Anthropic Claude API
    ├── Z.AI GLM Models (FREE tier)
    ├── vLLM (Self-hosted)
    └── MCPGateway
        ├── FileSystem Server
        ├── Emulator Server
        └── Custom Servers
```

## Dependencies

- `@anthropic-ai/sdk` - Claude AI integration
- `@modelcontextprotocol/sdk` - MCP protocol support
- `zod` - Schema validation
- `node-fetch` - HTTP requests (for Z.AI and vLLM)

## License

MIT

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## Support

- GitHub Issues: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues
- Documentation: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/tree/main/docs
