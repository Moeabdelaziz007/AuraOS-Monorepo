/**
 * z.ai Service
 * Integration with z.ai API
 */

import {
  BaseAIService,
  AIMessage,
  AIResponse,
  AIStreamResponse,
  AIRequestOptions,
} from './base.service';
import { AI_CONFIG } from '../../config/ai';

interface ZAIRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ZAIResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ZAIService extends BaseAIService {
  constructor() {
    super('zai');
  }

  /**
   * Send a chat completion request
   */
  async chat(
    messages: AIMessage[],
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('z.ai API key not configured');
    }

    return this.retry(async () => {
      const request: ZAIRequest = {
        model: AI_CONFIG.zai.models.chat,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options.temperature ?? AI_CONFIG.zai.defaultParams.temperature,
        max_tokens: options.maxTokens ?? AI_CONFIG.zai.defaultParams.maxTokens,
        stream: false,
      };

      if (options.systemPrompt) {
        request.messages.unshift({
          role: 'system',
          content: options.systemPrompt,
        });
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'z.ai API request failed');
      }

      const data: ZAIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from z.ai');
      }

      const choice = data.choices[0];

      return {
        content: choice.message.content,
        model: data.model,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
        finishReason: choice.finish_reason,
      };
    });
  }

  /**
   * Send a streaming chat completion request
   */
  async chatStream(
    messages: AIMessage[],
    options: AIRequestOptions = {},
    onChunk?: (chunk: AIStreamResponse) => void
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error('z.ai API key not configured');
    }

    const request: ZAIRequest = {
      model: AI_CONFIG.zai.models.chat,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: options.temperature ?? AI_CONFIG.zai.defaultParams.temperature,
      max_tokens: options.maxTokens ?? AI_CONFIG.zai.defaultParams.maxTokens,
      stream: true,
    };

    if (options.systemPrompt) {
      request.messages.unshift({
        role: 'system',
        content: options.systemPrompt,
      });
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'z.ai API request failed');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (onChunk) {
          onChunk({ content: '', done: true });
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr.trim() === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices?.[0]?.delta?.content || '';

            if (content && onChunk) {
              onChunk({ content, done: false });
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  }

  /**
   * Generate embeddings for text
   */
  async embed(text: string): Promise<number[]> {
    if (!this.apiKey) {
      throw new Error('z.ai API key not configured');
    }

    return this.retry(async () => {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-ada-002',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'z.ai embedding request failed');
      }

      const data = await response.json();
      return data.data?.[0]?.embedding || [];
    });
  }
}

// Export singleton instance
export const zaiService = new ZAIService();
