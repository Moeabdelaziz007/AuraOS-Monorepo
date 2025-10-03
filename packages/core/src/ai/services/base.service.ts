/**
 * Base AI Service
 * Common functionality for all AI providers
 */

import { AI_CONFIG, AIProvider } from '../config';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface AIStreamResponse {
  content: string;
  done: boolean;
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stream?: boolean;
  systemPrompt?: string;
}

/**
 * Base class for AI service implementations
 */
export abstract class BaseAIService {
  protected provider: AIProvider;
  protected apiKey: string;
  protected baseUrl: string;

  constructor(provider: AIProvider) {
    this.provider = provider;
    this.apiKey = AI_CONFIG[provider].apiKey;
    this.baseUrl = AI_CONFIG[provider].baseUrl;
  }

  /**
   * Send a chat completion request
   */
  abstract chat(
    messages: AIMessage[],
    options?: AIRequestOptions
  ): Promise<AIResponse>;

  /**
   * Send a streaming chat completion request
   */
  abstract chatStream(
    messages: AIMessage[],
    options?: AIRequestOptions,
    onChunk?: (chunk: AIStreamResponse) => void
  ): Promise<void>;

  /**
   * Generate embeddings for text
   */
  abstract embed(text: string): Promise<number[]>;

  /**
   * Retry logic with exponential backoff
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= AI_CONFIG.retry.maxAttempts) {
        throw error;
      }

      const delay =
        AI_CONFIG.retry.backoffMs *
        Math.pow(AI_CONFIG.retry.backoffMultiplier, attempt - 1);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retry(fn, attempt + 1);
    }
  }

  /**
   * Check rate limits
   */
  protected checkRateLimit(): boolean {
    // TODO: Implement rate limiting logic
    return true;
  }

  /**
   * Format error message
   */
  protected formatError(error: any): string {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unknown error occurred';
  }
}
