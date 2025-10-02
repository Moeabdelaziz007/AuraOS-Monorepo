/**
 * AI Assistant
 * Connects AI models to MCP Gateway for tool execution
 */

import Anthropic from '@anthropic-ai/sdk';
import { MCPGateway } from './mcp/gateway';
import { Tool, ToolRequest } from './mcp/types';

interface Message {
  role: 'user' | 'assistant';
  content: string | MessageContent[];
}

interface MessageContent {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  input?: any;
  tool_use_id?: string;
  content?: string;
}

interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export class AIAssistant {
  private mcp: MCPGateway;
  private claude: Anthropic;
  private conversationHistory: Message[] = [];
  private systemPrompt: string;

  constructor(gateway: MCPGateway, apiKey?: string) {
    this.mcp = gateway;
    this.claude = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
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
      temperature = 1.0,
      systemPrompt = this.systemPrompt,
    } = options;

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: message,
    });

    // Get available tools from MCP gateway
    const tools = this.convertToolsToAnthropicFormat(this.mcp.getToolDefinitions());

    let continueLoop = true;
    let finalResponse = '';

    while (continueLoop) {
      try {
        // Call Claude with tools
        const response = await this.claude.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          tools,
          messages: this.conversationHistory as any,
        });

        // Check stop reason
        if (response.stop_reason === 'end_turn') {
          // Normal completion - extract text response
          finalResponse = this.extractTextFromResponse(response.content);
          this.conversationHistory.push({
            role: 'assistant',
            content: response.content as any,
          });
          continueLoop = false;
        } else if (response.stop_reason === 'tool_use') {
          // AI wants to use tools
          const toolResults: MessageContent[] = [];

          // Add assistant's response (including tool use) to history
          this.conversationHistory.push({
            role: 'assistant',
            content: response.content as any,
          });

          // Execute each tool request
          for (const block of response.content) {
            if (block.type === 'tool_use') {
              console.log(`[AI] Using tool: ${block.name}`);
              console.log(`[AI] Input:`, JSON.stringify(block.input, null, 2));

              try {
                // Execute tool through MCP gateway
                const toolRequest: ToolRequest = {
                  tool: block.name,
                  input: block.input as Record<string, any>,
                };

                const result = await this.mcp.handleRequest(toolRequest, {
                  userId: 'ai-assistant',
                  sessionId: 'ai-session',
                  permissions: [],
                });

                console.log(`[AI] Tool result:`, JSON.stringify(result, null, 2));

                // Format result for Claude
                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify(result),
                });
              } catch (error) {
                console.error(`[AI] Tool execution error:`, error);

                // Send error back to Claude
                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  }),
                });
              }
            }
          }

          // Add tool results to conversation
          this.conversationHistory.push({
            role: 'user',
            content: toolResults,
          });

          // Continue loop to get final response
        } else if (response.stop_reason === 'max_tokens') {
          // Hit token limit
          finalResponse = this.extractTextFromResponse(response.content) + '\n\n[Response truncated due to length]';
          this.conversationHistory.push({
            role: 'assistant',
            content: response.content as any,
          });
          continueLoop = false;
        } else {
          // Other stop reasons
          finalResponse = this.extractTextFromResponse(response.content);
          this.conversationHistory.push({
            role: 'assistant',
            content: response.content as any,
          });
          continueLoop = false;
        }
      } catch (error) {
        console.error('[AI] Error during chat:', error);
        throw new Error(`AI Assistant error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Private helper methods

  /**
   * Convert MCP tool definitions to Anthropic format
   */
  private convertToolsToAnthropicFormat(tools: Tool[]): any[] {
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));
  }

  /**
   * Extract text content from Claude response
   */
  private extractTextFromResponse(content: any[]): string {
    const textBlocks = content.filter((block) => block.type === 'text');
    return textBlocks.map((block) => block.text).join('\n');
  }
}

/**
 * Create a pre-configured AI Assistant instance
 */
export async function createAIAssistant(gateway: MCPGateway, apiKey?: string): Promise<AIAssistant> {
  const assistant = new AIAssistant(gateway, apiKey);
  return assistant;
}
