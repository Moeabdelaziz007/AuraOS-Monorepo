# MCP Usage Guide

## Overview

The Model Context Protocol (MCP) is the core architecture of AuraOS, providing a standardized way for AI agents to interact with OS components through tools. This guide covers how to use the MCP infrastructure in AuraOS.

## Architecture

```
┌─────────────┐
│ MCPClient   │ ← User-facing API
└──────┬──────┘
       │
┌──────▼──────┐
│ MCPGateway  │ ← Central routing hub
└──────┬──────┘
       │
       ├─────────┬─────────┬─────────┐
       │         │         │         │
┌──────▼──────┐ │         │         │
│ FileSystem  │ │         │         │
│ MCP Server  │ │         │         │
└─────────────┘ │         │         │
       ┌────────▼──────┐  │         │
       │ Emulator      │  │         │
       │ MCP Server    │  │         │
       └───────────────┘  │         │
              ┌───────────▼──────┐  │
              │ Custom           │  │
              │ MCP Server       │  │
              └──────────────────┘  │
                     ┌──────────────▼──────┐
                     │ More Servers...     │
                     └─────────────────────┘
```

## Core Components

### 1. MCPGateway

The gateway is the central routing hub that manages all MCP servers and routes tool requests.

```typescript
import { MCPGateway } from '@auraos/ai/mcp/gateway';

// Create gateway
const gateway = new MCPGateway({
  maxServers: 10,
  requestTimeout: 5000,
  enableLogging: true,
});

// Register servers
await gateway.registerServer(fileSystemServer);
await gateway.registerServer(emulatorServer);

// Get statistics
const stats = gateway.getStats();
console.log(`Total requests: ${stats.totalRequests}`);
console.log(`Success rate: ${(stats.successfulRequests / stats.totalRequests) * 100}%`);
```

### 2. MCPClient

The client provides a user-friendly interface for executing tools.

```typescript
import { MCPClient } from '@auraos/ai/mcp/client';

// Create client
const client = new MCPClient(gateway, 'user-123', 'session-456');

// Execute a tool
const response = await client.executeTool('fs_read', {
  path: '/home/user/document.txt',
});

if (response.success) {
  console.log('File content:', response.data.content);
} else {
  console.error('Error:', response.error);
}

// Discover tools
const allTools = client.getAvailableTools();
const fileTools = client.getToolsByServer('filesystem');
const searchResults = client.searchTools('memory');
```

### 3. BaseMCPServer

Abstract base class for creating custom MCP servers.

```typescript
import { BaseMCPServer } from '@auraos/ai/mcp/server';
import { Tool } from '@auraos/ai/mcp/types';

class CustomMCPServer extends BaseMCPServer {
  name = 'custom-server';
  version = '1.0.0';
  description = 'My custom MCP server';

  tools: Tool[] = [
    {
      name: 'my_tool',
      description: 'Does something useful',
      inputSchema: {
        type: 'object',
        properties: {
          input: { type: 'string' },
        },
        required: ['input'],
      },
    },
  ];

  protected async handleToolExecution(
    toolName: string,
    input: Record<string, any>
  ): Promise<any> {
    switch (toolName) {
      case 'my_tool':
        return { result: `Processed: ${input.input}` };
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  protected async onInitialize(): Promise<void> {
    // Custom initialization logic
    console.log('Custom server initialized');
  }

  protected async onShutdown(): Promise<void> {
    // Custom cleanup logic
    console.log('Custom server shutdown');
  }
}
```

## Built-in MCP Servers

### FileSystem MCP Server

Provides file system operations.

**Available Tools:**

- `fs_read` - Read file contents
- `fs_write` - Write to a file
- `fs_list` - List directory contents
- `fs_delete` - Delete files/directories
- `fs_mkdir` - Create directories
- `fs_stat` - Get file information
- `fs_copy` - Copy files
- `fs_move` - Move/rename files
- `fs_search` - Search files by name or content
- `fs_watch` - Watch for file changes

**Example Usage:**

```typescript
import { FileSystemMCPServer } from '@auraos/core/mcp/filesystem';

// Create server with custom root path
const fsServer = new FileSystemMCPServer('/home/user/workspace');
await gateway.registerServer(fsServer);

// Read a file
const readResult = await client.executeTool('fs_read', {
  path: 'document.txt',
  encoding: 'utf-8',
});

// Write a file
const writeResult = await client.executeTool('fs_write', {
  path: 'output.txt',
  content: 'Hello, AuraOS!',
  append: false,
});

// List directory
const listResult = await client.executeTool('fs_list', {
  path: 'projects',
  recursive: true,
  pattern: '*.ts',
});

// Search files
const searchResult = await client.executeTool('fs_search', {
  path: 'src',
  query: 'TODO',
  searchContent: true,
  maxResults: 50,
});
```

### Emulator Control MCP Server

Provides emulator control and debugging capabilities.

**Available Tools:**

- `emu_create` - Create emulator instance
- `emu_start` - Start emulator
- `emu_stop` - Stop emulator
- `emu_pause` - Pause execution
- `emu_resume` - Resume execution
- `emu_reset` - Reset to initial state
- `emu_step` - Execute single instruction
- `emu_get_state` - Get current state
- `emu_read_memory` - Read from memory
- `emu_write_memory` - Write to memory
- `emu_set_breakpoint` - Set breakpoint
- `emu_remove_breakpoint` - Remove breakpoint
- `emu_list_breakpoints` - List all breakpoints
- `emu_load_program` - Load program into memory
- `emu_get_performance` - Get performance metrics
- `emu_list` - List all emulators

**Example Usage:**

```typescript
import { EmulatorControlMCPServer } from '@auraos/core/mcp/emulator';

const emuServer = new EmulatorControlMCPServer();
await gateway.registerServer(emuServer);

// Create and start emulator
const createResult = await client.executeTool('emu_create', {
  type: 'cpu',
});
const emulatorId = createResult.data.id;

await client.executeTool('emu_start', { id: emulatorId });

// Load a program
const program = [0xa9, 0x01, 0x8d, 0x00, 0x02]; // LDA #$01, STA $0200
await client.executeTool('emu_load_program', {
  id: emulatorId,
  program,
  address: 0x8000,
});

// Set breakpoint
await client.executeTool('emu_set_breakpoint', {
  id: emulatorId,
  address: 0x8000,
});

// Step through instructions
const stepResult = await client.executeTool('emu_step', {
  id: emulatorId,
  steps: 1,
});

// Read memory
const memResult = await client.executeTool('emu_read_memory', {
  id: emulatorId,
  address: 0x0200,
  length: 1,
});

// Get performance metrics
const perfResult = await client.executeTool('emu_get_performance', {
  id: emulatorId,
});
```

## Complete Example

Here's a complete example showing how to set up and use the MCP infrastructure:

```typescript
import { MCPGateway } from '@auraos/ai/mcp/gateway';
import { MCPClient } from '@auraos/ai/mcp/client';
import { FileSystemMCPServer } from '@auraos/core/mcp/filesystem';
import { EmulatorControlMCPServer } from '@auraos/core/mcp/emulator';

async function main() {
  // 1. Create gateway
  const gateway = new MCPGateway({
    maxServers: 10,
    requestTimeout: 5000,
    enableLogging: true,
  });

  // 2. Create and register servers
  const fsServer = new FileSystemMCPServer('/workspace');
  const emuServer = new EmulatorControlMCPServer();

  await gateway.registerServer(fsServer);
  await gateway.registerServer(emuServer);

  // 3. Create client
  const client = new MCPClient(gateway, 'user-123');

  // 4. Discover available tools
  console.log('Available tools:');
  const tools = client.getAvailableTools();
  tools.forEach((tool) => {
    console.log(`  - ${tool.name}: ${tool.description}`);
  });

  // 5. Execute file operations
  await client.executeTool('fs_write', {
    path: 'hello.txt',
    content: 'Hello from AuraOS!',
  });

  const readResult = await client.executeTool('fs_read', {
    path: 'hello.txt',
  });
  console.log('File content:', readResult.data.content);

  // 6. Execute emulator operations
  const createResult = await client.executeTool('emu_create', {
    type: 'cpu',
  });
  const emulatorId = createResult.data.id;

  await client.executeTool('emu_start', { id: emulatorId });
  console.log('Emulator started');

  // 7. Get statistics
  const stats = gateway.getStats();
  console.log('Gateway statistics:', stats);

  // 8. Cleanup
  await gateway.shutdown();
}

main().catch(console.error);
```

## Error Handling

All tool executions return a `ToolResponse` object with a `success` field:

```typescript
const response = await client.executeTool('fs_read', {
  path: 'nonexistent.txt',
});

if (response.success) {
  console.log('Success:', response.data);
} else {
  console.error('Error:', response.error);
  console.error('Metadata:', response.metadata);
}
```

## Best Practices

### 1. Always Check Response Success

```typescript
const response = await client.executeTool('tool_name', input);
if (!response.success) {
  // Handle error
  console.error(response.error);
  return;
}
// Use response.data
```

### 2. Use Type-Safe Input

```typescript
interface FsReadInput {
  path: string;
  encoding?: 'utf-8' | 'ascii' | 'base64' | 'hex';
}

const input: FsReadInput = {
  path: 'file.txt',
  encoding: 'utf-8',
};

const response = await client.executeTool('fs_read', input);
```

### 3. Handle Timeouts

```typescript
const gateway = new MCPGateway({
  requestTimeout: 10000, // 10 seconds
});

// For long-running operations, increase timeout
```

### 4. Monitor Performance

```typescript
// Periodically check gateway statistics
setInterval(() => {
  const stats = gateway.getStats();
  console.log(`Success rate: ${(stats.successfulRequests / stats.totalRequests) * 100}%`);
  console.log(`Avg response time: ${stats.averageResponseTime}ms`);
}, 60000);
```

### 5. Cleanup Resources

```typescript
// Always shutdown gateway when done
process.on('SIGINT', async () => {
  await gateway.shutdown();
  process.exit(0);
});
```

## Testing

Run the MCP integration tests:

```bash
# Test AI package (gateway, client, base server)
cd packages/ai
pnpm test

# Test core package (filesystem, emulator servers)
cd packages/core
pnpm test
```

## Advanced Topics

### Custom Authentication

```typescript
const gateway = new MCPGateway({
  // ... config
});

// Implement custom auth middleware
gateway.use(async (request, auth, next) => {
  if (!auth.userId || auth.userId === 'anonymous') {
    throw new Error('Authentication required');
  }
  return next();
});
```

### Tool Chaining

```typescript
// Execute multiple tools in sequence
const file = await client.executeTool('fs_read', { path: 'input.txt' });
const processed = processContent(file.data.content);
await client.executeTool('fs_write', {
  path: 'output.txt',
  content: processed,
});
```

### Parallel Execution

```typescript
// Execute multiple tools in parallel
const results = await Promise.all([
  client.executeTool('fs_read', { path: 'file1.txt' }),
  client.executeTool('fs_read', { path: 'file2.txt' }),
  client.executeTool('fs_read', { path: 'file3.txt' }),
]);
```

## Troubleshooting

### Tool Not Found

```
Error: No server found for tool 'tool_name'
```

**Solution:** Ensure the server providing the tool is registered with the gateway.

### Timeout Errors

```
Error: Request timeout after 5000ms
```

**Solution:** Increase the `requestTimeout` in gateway config or optimize the tool implementation.

### Validation Errors

```
Error: Invalid input: Missing required field: path
```

**Solution:** Check the tool's `inputSchema` and provide all required fields.

## Next Steps

- Explore the [MCP Integration Strategy](../MCP_INTEGRATION_STRATEGY.md) for planned servers
- Check the [API Reference](./API_REFERENCE.md) for detailed type definitions
- See [Examples](../examples/mcp/) for more usage patterns

## Support

For issues or questions:
- GitHub Issues: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues
- Documentation: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/tree/main/docs
