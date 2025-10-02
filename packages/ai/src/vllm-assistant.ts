/**
 * vLLM AI Assistant
 * Connects vLLM (OpenAI-compatible) to MCP Gateway for tool execution
 */

import OpenAI from 'openai';
import { MCPGateway } from './mcp/gateway';
import { Tool, ToolRequest } from './mcp/types';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export class VLLMAIAssistant {
  private mcp: MCPGateway;
  private client: OpenAI;
  private conversationHistory: Message[] = [];
  private systemPrompt: string;
  private modelName: string;

  constructor(gateway: MCPGateway, vllmUrl: string = 'http://localhost:8000/v1', modelName?: string) {
    this.mcp = gateway;
    this.modelName = modelName || 'meta-llama/Llama-3.1-8B-Instruct';
    
    this.client = new OpenAI({
      baseURL: vllmUrl,
      apiKey: 'not-needed', // vLLM doesn't require API key
    });

    this.systemPrompt = `You are AuraOS AI Assistant, an intelligent operating system assistant with access to powerful tools.

You can:
- Read and write files using the filesystem tools
- Control and debug the 6502 CPU emulator
- Execute programs and inspect memory
- Help users with OS operations

When using tools:
1. Always explain what you're doing before using a tool
2. Use tools efficiently and in the correct order
3. Handle errors gracefully and explain issues to the user
4. Provide clear, helpful responses based on tool results

Available tools will be provided in each request. Use them to help users accomplish their tasks.`;
  }

  /**
   * Chat with the AI assistant
   * Handles multi-turn conversations with tool execution
   */
  async chat(message: string, options: ChatOptions = {}): Promise<string> {
    const {
      maxTokens = 4096,
      temperature = 0.7,
      systemPrompt = this.systemPrompt,
    } = options;

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: message,
    });

    // Get available tools from MCP gateway
    const tools = this.convertToolsToOpenAIFormat(this.mcp.getToolDefinitions());

    // Build messages array with system prompt
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...this.conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
    ];

    let continueLoop = true;
    let finalResponse = '';

    while (continueLoop) {
      try {
        // Call vLLM with tools
        const response = await this.client.chat.completions.create({
          model: this.modelName,
          messages,
          max_tokens: maxTokens,
          temperature,
          tools: tools.length > 0 ? tools : undefined,
          tool_choice: tools.length > 0 ? 'auto' : undefined,
        });

        const choice = response.choices[0];

        // Check if AI wants to use tools
        if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
          // Add assistant's message with tool calls to history
          this.conversationHistory.push({
            role: 'assistant',
            content: choice.message.content || '',
          });

          // Execute each tool call
          for (const toolCall of choice.message.tool_calls) {
            console.log(`[AI] Using tool: ${toolCall.function.name}`);
            console.log(`[AI] Input:`, toolCall.function.arguments);

            try {
              // Parse tool arguments
              const toolInput = JSON.parse(toolCall.function.arguments);

              // Execute tool through MCP gateway
              const toolRequest: ToolRequest = {
                tool: toolCall.function.name,
                input: toolInput,
              };

              const result = await this.mcp.handleRequest(toolRequest, {
                userId: 'vllm-assistant',
                sessionId: 'vllm-session',
                permissions: [],
              });

              console.log(`[AI] Tool result:`, JSON.stringify(result, null, 2));

              // Add tool result to messages for next iteration
              messages.push({
                role: 'assistant',
                content: choice.message.content || '',
                tool_calls: choice.message.tool_calls,
              } as any);

              messages.push({
                role: 'tool',
                content: JSON.stringify(result),
                tool_call_id: toolCall.id,
              } as any);
            } catch (error) {
              console.error(`[AI] Tool execution error:`, error);

              // Send error back to AI
              messages.push({
                role: 'tool',
                content: JSON.stringify({
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error',
                }),
                tool_call_id: toolCall.id,
              } as any);
            }
          }

          // Continue loop to get final response
        } else {
          // Normal completion - extract text response
          finalResponse = choice.message.content || '';
          this.conversationHistory.push({
            role: 'assistant',
            content: finalResponse,
          });
          continueLoop = false;
        }
      } catch (error) {
        console.error('[AI] Error during chat:', error);
        throw new Error(`vLLM Assistant error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return finalResponse;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): Message[] {
    return [...this.conversationHistory];
  }

  /**
   * Set custom system prompt
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /**
   * Get available tools
   */
  getAvailableTools(): Tool[] {
    return this.mcp.getToolDefinitions();
  }

  /**
   * Get MCP gateway statistics
   */
  getStats() {
    return this.mcp.getStats();
  }

  /**
   * Set model name
   */
  setModel(modelName: string): void {
    this.modelName = modelName;
  }

  /**
   * Get current model name
   */
  getModel(): string {
    return this.modelName;
  }

  // Private helper methods

  /**
   * Convert MCP tool definitions to OpenAI format
   */
  private convertToolsToOpenAIFormat(tools: Tool[]): OpenAI.Chat.ChatCompletionTool[] {
    return tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));
  }
}

/**
 * Create a pre-configured vLLM AI Assistant instance
 */
export async function createVLLMAIAssistant(
  gateway: MCPGateway,
  vllmUrl?: string,
  modelName?: string
): Promise<VLLMAIAssistant> {
  const assistant = new VLLMAIAssistant(gateway, vllmUrl, modelName);
  return assistant;
}
