# Z.AI Integration Guide

Complete guide for integrating Z.AI GLM models into AuraOS.

## Overview

Z.AI provides powerful language models with a **completely FREE tier** (GLM-4.5-Flash), making it an excellent choice for development and production use in AuraOS.

### Why Z.AI?

- ✅ **FREE Tier** - GLM-4.5-Flash is completely free with no rate limits
- ✅ **200K Context** - Large context window for complex tasks
- ✅ **Excellent Coding** - Optimized for code generation and debugging
- ✅ **OpenAI Compatible** - Drop-in replacement for OpenAI SDK
- ✅ **Fast Inference** - Competitive performance
- ✅ **Multiple Models** - Choose based on your needs and budget

## Getting Started

### 1. Get API Key

1. Visit [https://z.ai/model-api](https://z.ai/model-api)
2. Sign up or log in
3. Navigate to [API Keys](https://z.ai/manage-apikey/apikey-list)
4. Create a new API key
5. Copy your key (format: `xxxxxxxx.xxxxxxxxxxxx`)

### 2. Configure Environment

Add to your `.env` file:

```bash
# AI Provider
AI_PROVIDER=zai

# Z.AI Configuration
ZAI_API_KEY=your-api-key-here
ZAI_MODEL=glm-4.5-flash  # FREE model (recommended)
```

### 3. Install Dependencies

```bash
cd packages/ai
pnpm install
```

## Usage

### Basic Usage

```typescript
import { ZAIAssistant } from '@auraos/ai';

const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash', // FREE model
});

const response = await assistant.chat('Hello, how are you?');
console.log(response);
```

### With MCP Gateway

```typescript
import { ZAIAssistant } from '@auraos/ai';
import { MCPGateway } from '@auraos/ai/mcp/gateway';

const gateway = new MCPGateway();
const assistant = new ZAIAssistant(
  {
    apiKey: process.env.ZAI_API_KEY,
    model: 'glm-4.5-flash',
  },
  gateway
);

const response = await assistant.chat(
  'Create a file called test.txt with "Hello World"'
);
```

### Using Factory Pattern

```typescript
import { createAIAssistant } from '@auraos/ai';
import { MCPGateway } from '@auraos/ai/mcp/gateway';

const gateway = new MCPGateway();

const assistant = await createAIAssistant(gateway, {
  provider: 'zai',
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

const response = await assistant.chat('Generate a TypeScript function');
```

### Auto-detect from Environment

```typescript
import { createAIAssistantFromEnv } from '@auraos/ai';
import { MCPGateway } from '@auraos/ai/mcp/gateway';

// Reads AI_PROVIDER from .env and creates appropriate assistant
const gateway = new MCPGateway();
const assistant = await createAIAssistantFromEnv(gateway);

const response = await assistant.chat('What can you do?');
```

## Available Models

### GLM-4.5-Flash (FREE) ⭐ RECOMMENDED

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});
```

- **Cost:** FREE (unlimited)
- **Context:** 200K tokens
- **Best For:** Development, testing, general use
- **Speed:** Fast

### GLM-4.6 (Premium)

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.6',
});
```

- **Cost:** $0.60 input / $2.20 output per 1M tokens
- **Context:** 200K tokens
- **Best For:** Production coding, complex tasks
- **Speed:** Fast
- **Features:** Superior coding, advanced reasoning

### GLM-4.5 (Standard)

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5',
});
```

- **Cost:** $0.60 input / $2.20 output per 1M tokens
- **Context:** 200K tokens
- **Best For:** General purpose
- **Speed:** Fast

### GLM-4.5-Air (Lightweight)

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-air',
});
```

- **Cost:** $0.20 input / $1.10 output per 1M tokens
- **Context:** 200K tokens
- **Best For:** Cost-sensitive applications
- **Speed:** Very fast

### GLM-4-32B (Budget)

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4-32b-0414-128k',
});
```

- **Cost:** $0.10 input / $0.10 output per 1M tokens
- **Context:** 128K tokens
- **Best For:** High-volume, cost-sensitive
- **Speed:** Fast

## Advanced Features

### Streaming Responses

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

console.log('Response: ');
for await (const chunk of assistant.chatStream('Explain TypeScript')) {
  process.stdout.write(chunk);
}
console.log('\n');
```

### Custom Configuration

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
  maxTokens: 2048,
  temperature: 0.7,
  baseUrl: 'https://api.z.ai/api/paas/v4', // Optional
});
```

### System Prompts

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

assistant.setSystemPrompt(
  'You are an expert TypeScript developer. Provide concise, production-ready code.'
);

const response = await assistant.chat('Create a React component');
```

### Multi-turn Conversations

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

await assistant.chat('What is React?');
await assistant.chat('What are its main benefits?');
await assistant.chat('Show me an example component');

// Get conversation history
const history = assistant.getHistory();
console.log(`Conversation has ${history.length} messages`);

// Clear history
assistant.clearHistory();
```

### Dynamic Model Switching

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

// Use free model for simple tasks
await assistant.chat('Hello!');

// Switch to premium model for complex tasks
assistant.setModel('glm-4.6');
await assistant.chat('Generate a complex React application');

// Switch back to free model
assistant.setModel('glm-4.5-flash');
```

### Usage Statistics

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

await assistant.chat('Hello!');

const stats = assistant.getStats();
console.log('Total requests:', stats.totalRequests);
console.log('Total tokens:', stats.totalTokens);
console.log('Total cost:', stats.totalCost);
console.log('Errors:', stats.errors);
console.log('Model:', stats.model);
console.log('Conversation length:', stats.conversationLength);
```

### Connection Testing

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

const isConnected = await assistant.testConnection();
if (isConnected) {
  console.log('✅ Z.AI connection successful');
} else {
  console.log('❌ Z.AI connection failed');
}
```

## Examples

### Code Generation

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

assistant.setSystemPrompt(
  'You are an expert developer. Provide clean, well-documented code.'
);

const code = await assistant.chat(
  'Create a TypeScript function to calculate Fibonacci numbers'
);
console.log(code);
```

### Data Analysis

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

const analysis = await assistant.chat(`
  Analyze this data and provide insights:
  Sales: [100, 150, 200, 180, 220, 250]
  Months: [Jan, Feb, Mar, Apr, May, Jun]
`);
console.log(analysis);
```

### Translation

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

const translation = await assistant.chat(
  'Translate "Hello, how are you?" to French, Spanish, and Japanese'
);
console.log(translation);
```

### Content Creation

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

const content = await assistant.chat(
  'Write a blog post introduction about AI in software development (100 words)'
);
console.log(content);
```

## Integration with AuraOS

### File Operations

```typescript
import { ZAIAssistant } from '@auraos/ai';
import { MCPGateway } from '@auraos/ai/mcp/gateway';
import { FileSystemMCPServer } from '@auraos/core/mcp/filesystem';

const gateway = new MCPGateway();
const fsServer = new FileSystemMCPServer('/workspace');
await gateway.registerServer(fsServer);

const assistant = new ZAIAssistant(
  {
    apiKey: process.env.ZAI_API_KEY,
    model: 'glm-4.5-flash',
  },
  gateway
);

await assistant.chat('Create a new project structure with src, tests, and docs folders');
await assistant.chat('Create a README.md file with project description');
```

### Dashboard Integration

```typescript
// In your AuraOS dashboard
import { ZAIAssistant } from '@auraos/ai';

export function AIChat() {
  const [messages, setMessages] = useState([]);
  const assistant = new ZAIAssistant({
    apiKey: process.env.ZAI_API_KEY,
    model: 'glm-4.5-flash',
  });

  const sendMessage = async (text: string) => {
    const response = await assistant.chat(text);
    setMessages([...messages, { user: text, ai: response }]);
  };

  return <ChatInterface onSend={sendMessage} messages={messages} />;
}
```

## Cost Optimization

### Use Free Model for Development

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: isDevelopment ? 'glm-4.5-flash' : 'glm-4.6',
});
```

### Smart Model Selection

```typescript
function selectModel(taskComplexity: 'simple' | 'medium' | 'complex') {
  const models = {
    simple: 'glm-4.5-flash', // FREE
    medium: 'glm-4.5-air', // $0.20/$1.10
    complex: 'glm-4.6', // $0.60/$2.20
  };
  return models[taskComplexity];
}

const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: selectModel('simple'),
});
```

### Monitor Costs

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.6',
});

// After operations
const stats = assistant.getStats();
console.log(`Total cost: $${stats.totalCost.toFixed(4)}`);

// Alert if cost exceeds threshold
if (stats.totalCost > 1.0) {
  console.warn('⚠️ Cost threshold exceeded!');
}
```

## Comparison with Other Providers

| Feature | Z.AI GLM-4.5-Flash | Anthropic Claude | OpenAI GPT-4 |
|---------|-------------------|------------------|--------------|
| **Cost** | FREE | $3/$15 per 1M | $5/$15 per 1M |
| **Context** | 200K | 200K | 128K |
| **Coding** | Excellent | Excellent | Very Good |
| **Speed** | Fast | Fast | Medium |
| **Free Tier** | Unlimited | Limited | Limited |
| **Best For** | Development, Production | Production | General Purpose |

## Troubleshooting

### API Key Issues

```typescript
// Test your API key
const assistant = new ZAIAssistant({
  apiKey: 'your-key-here',
  model: 'glm-4.5-flash',
});

const isValid = await assistant.testConnection();
console.log('API key valid:', isValid);
```

### Rate Limiting

Z.AI's free tier (GLM-4.5-Flash) has no documented rate limits, but implement retry logic:

```typescript
async function chatWithRetry(assistant: ZAIAssistant, message: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await assistant.chat(message);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Error Handling

```typescript
const assistant = new ZAIAssistant({
  apiKey: process.env.ZAI_API_KEY,
  model: 'glm-4.5-flash',
});

try {
  const response = await assistant.chat('Hello!');
  console.log(response);
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Invalid API key');
  } else if (error.message.includes('429')) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Best Practices

1. **Use Free Model for Development**
   - GLM-4.5-Flash is perfect for testing and development
   - Switch to premium models only when needed

2. **Implement Caching**
   - Cache common responses to reduce API calls
   - Use conversation history efficiently

3. **Monitor Usage**
   - Track token usage and costs
   - Set up alerts for unusual patterns

4. **Error Handling**
   - Always wrap API calls in try-catch
   - Implement retry logic for transient failures

5. **Security**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

## Resources

- **Z.AI Website:** [https://z.ai](https://z.ai)
- **Documentation:** [https://docs.z.ai](https://docs.z.ai)
- **API Keys:** [https://z.ai/manage-apikey/apikey-list](https://z.ai/manage-apikey/apikey-list)
- **Discord:** [https://discord.gg/QR7SARHRxK](https://discord.gg/QR7SARHRxK)
- **GitHub:** [https://github.com/zai-org](https://github.com/zai-org)

## Next Steps

1. Get your Z.AI API key
2. Run the example: `node test-zai.js`
3. Try the TypeScript examples: `npx tsx packages/ai/src/examples/zai-example.ts`
4. Integrate into your AuraOS application
5. Explore advanced features

## Support

For issues or questions:
- Check [Z.AI Documentation](https://docs.z.ai)
- Join [Z.AI Discord](https://discord.gg/QR7SARHRxK)
- Open an issue on [AuraOS GitHub](https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues)
