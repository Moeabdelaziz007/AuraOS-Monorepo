/**
 * Z.AI Assistant Implementation
 * Integrates Z.AI's GLM models with AuraOS
 */

import { IAIAssistant } from './assistant-factory';
import { MCPGateway } from './mcp/gateway';

export interface ZAIConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ZAIResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ZAIAssistant implements IAIAssistant {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private maxTokens: number;
  private temperature: number;
  private conversationHistory: Message[] = [];
  private systemPrompt: string = 'You are a helpful AI assistant.';
  private mcpGateway?: MCPGateway;
  private stats = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    errors: 0,
  };

  constructor(config: ZAIConfig, mcpGateway?: MCPGateway) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'glm-4.5-flash'; // Default to free model
    this.baseUrl = config.baseUrl || 'https://api.z.ai/api/paas/v4';
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
    this.mcpGateway = mcpGateway;

    if (!this.apiKey) {
      throw new Error('Z.AI API key is required');
    }
  }

  /**
   * Send a chat message and get a response
   */
  async chat(message: string, options?: any): Promise<string> {
    try {
      this.stats.totalRequests++;

      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      const messages: Message[] = [
        { role: 'system', content: this.systemPrompt },
        ...this.conversationHistory,
      ];

      const requestBody = {
        model: this.model,
        messages,
        max_tokens: options?.maxTokens || this.maxTokens,
        temperature: options?.temperature || this.temperature,
        stream: false,
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept-Language': 'en-US,en',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        this.stats.errors++;
        const errorText = await response.text();
        throw new Error(`Z.AI API error: ${response.status} - ${errorText}`);
      }

      const data: ZAIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from Z.AI');
      }

      const assistantMessage = data.choices[0].message.content;

      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      // Update stats
      if (data.usage) {
        this.stats.totalTokens += data.usage.total_tokens;
        this.stats.totalCost += this.calculateCost(data.usage, this.model);
      }

      return assistantMessage;
    } catch (error) {
      this.stats.errors++;
      console.error('Z.AI chat error:', error);
      throw error;
    }
  }

  /**
   * Calculate cost based on token usage and model
   */
  private calculateCost(
    usage: { prompt_tokens: number; completion_tokens: number },
    model: string
  ): number {
    // Pricing per 1M tokens
    const pricing: Record<string, { input: number; output: number }> = {
      'glm-4.5-flash': { input: 0, output: 0 }, // Free
      'glm-4.6': { input: 0.6, output: 2.2 },
      'glm-4.5': { input: 0.6, output: 2.2 },
      'glm-4.5-air': { input: 0.2, output: 1.1 },
      'glm-4-32b-0414-128k': { input: 0.1, output: 0.1 },
    };

    const modelPricing = pricing[model] || { input: 0, output: 0 };
    const inputCost = (usage.prompt_tokens / 1_000_000) * modelPricing.input;
    const outputCost = (usage.completion_tokens / 1_000_000) * modelPricing.output;

    return inputCost + outputCost;
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
   * Set system prompt
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /**
   * Get available tools from MCP gateway
   */
  getAvailableTools(): any[] {
    if (!this.mcpGateway) {
      return [];
    }
    return this.mcpGateway.getAvailableTools();
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      ...this.stats,
      model: this.model,
      conversationLength: this.conversationHistory.length,
    };
  }

  /**
   * Stream chat response (for real-time streaming)
   */
  async *chatStream(message: string, options?: any): AsyncGenerator<string> {
    try {
      this.stats.totalRequests++;

      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      const messages: Message[] = [
        { role: 'system', content: this.systemPrompt },
        ...this.conversationHistory,
      ];

      const requestBody = {
        model: this.model,
        messages,
        max_tokens: options?.maxTokens || this.maxTokens,
        temperature: options?.temperature || this.temperature,
        stream: true,
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept-Language': 'en-US,en',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        this.stats.errors++;
        const errorText = await response.text();
        throw new Error(`Z.AI API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse,
      });
    } catch (error) {
      this.stats.errors++;
      console.error('Z.AI stream error:', error);
      throw error;
    }
  }

  /**
   * Change model dynamically
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Get available models
   */
  static getAvailableModels(): string[] {
    return [
      'glm-4.5-flash', // Free
      'glm-4.6',
      'glm-4.5',
      'glm-4.5-air',
      'glm-4.5-airx',
      'glm-4-32b-0414-128k',
    ];
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.chat('Hello', { maxTokens: 10 });
      return response.length > 0;
    } catch (error) {
      console.error('Z.AI connection test failed:', error);
      return false;
    }
  }
}
