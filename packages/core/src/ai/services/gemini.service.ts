/**
 * Gemini AI Service
 * Integration with Google's Gemini API
 */

import {
  BaseAIService,
  AIMessage,
  AIResponse,
  AIStreamResponse,
  AIRequestOptions,
} from './base.service';
import { AI_CONFIG } from '../config';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
    safetyRatings: any[];
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiService extends BaseAIService {
  constructor() {
    super('gemini');
  }

  /**
   * Convert our message format to Gemini format
   */
  private convertMessages(messages: AIMessage[]): GeminiMessage[] {
    return messages
      .filter(msg => msg.role !== 'system') // Gemini doesn't support system messages directly
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
  }

  /**
   * Build system prompt into first user message if provided
   */
  private buildMessagesWithSystem(
    messages: AIMessage[],
    systemPrompt?: string
  ): AIMessage[] {
    if (!systemPrompt) return messages;

    const firstUserMsg = messages.find(m => m.role === 'user');
    if (!firstUserMsg) return messages;

    return messages.map(msg => {
      if (msg === firstUserMsg) {
        return {
          ...msg,
          content: `${systemPrompt}\n\n${msg.content}`,
        };
      }
      return msg;
    });
  }

  /**
   * Send a chat completion request
   */
  async chat(
    messages: AIMessage[],
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    return this.retry(async () => {
      const processedMessages = this.buildMessagesWithSystem(
        messages,
        options.systemPrompt
      );

      const request: GeminiRequest = {
        contents: this.convertMessages(processedMessages),
        generationConfig: {
          temperature: options.temperature ?? AI_CONFIG.gemini.defaultParams.temperature,
          topK: options.topK ?? AI_CONFIG.gemini.defaultParams.topK,
          topP: options.topP ?? AI_CONFIG.gemini.defaultParams.topP,
          maxOutputTokens: options.maxTokens ?? AI_CONFIG.gemini.defaultParams.maxOutputTokens,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      };

      const url = `${this.baseUrl}/models/${AI_CONFIG.gemini.models.chat}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Gemini API request failed');
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini');
      }

      const candidate = data.candidates[0];
      const content = candidate.content.parts[0]?.text || '';

      return {
        content,
        model: AI_CONFIG.gemini.models.chat,
        usage: data.usageMetadata
          ? {
              promptTokens: data.usageMetadata.promptTokenCount,
              completionTokens: data.usageMetadata.candidatesTokenCount,
              totalTokens: data.usageMetadata.totalTokenCount,
            }
          : undefined,
        finishReason: candidate.finishReason,
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
    const processedMessages = this.buildMessagesWithSystem(
      messages,
      options.systemPrompt
    );

    const request: GeminiRequest = {
      contents: this.convertMessages(processedMessages),
      generationConfig: {
        temperature: options.temperature ?? AI_CONFIG.gemini.defaultParams.temperature,
        topK: options.topK ?? AI_CONFIG.gemini.defaultParams.topK,
        topP: options.topP ?? AI_CONFIG.gemini.defaultParams.topP,
        maxOutputTokens: options.maxTokens ?? AI_CONFIG.gemini.defaultParams.maxOutputTokens,
      },
    };

    const url = `${this.baseUrl}/models/${AI_CONFIG.gemini.models.chat}:streamGenerateContent?key=${this.apiKey}&alt=sse`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API request failed');
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
            const data: GeminiResponse = JSON.parse(jsonStr);
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (content && onChunk) {
              onChunk({ content, done: false });
            }
          } catch (e) {
            logger.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  }

  /**
   * Generate embeddings for text
   */
  async embed(text: string): Promise<number[]> {
    return this.retry(async () => {
      const url = `${this.baseUrl}/models/${AI_CONFIG.gemini.models.embedding}:embedContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }],
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Gemini embedding request failed');
      }

      const data = await response.json();
      return data.embedding?.values || [];
    });
  }

  /**
   * Analyze image with Gemini Pro Vision
   */
  async analyzeImage(
    imageData: string,
    prompt: string,
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    return this.retry(async () => {
      const request = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageData,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? AI_CONFIG.gemini.defaultParams.temperature,
          topK: options.topK ?? AI_CONFIG.gemini.defaultParams.topK,
          topP: options.topP ?? AI_CONFIG.gemini.defaultParams.topP,
          maxOutputTokens: options.maxTokens ?? AI_CONFIG.gemini.defaultParams.maxOutputTokens,
        },
      };

      const url = `${this.baseUrl}/models/${AI_CONFIG.gemini.models.vision}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Gemini vision request failed');
      }

      const data: GeminiResponse = await response.json();
      const candidate = data.candidates[0];
      const content = candidate.content.parts[0]?.text || '';

      return {
        content,
        model: AI_CONFIG.gemini.models.vision,
        finishReason: candidate.finishReason,
      };
    });
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
