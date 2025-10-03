/**
 * AI Completion Service
 * Handles text completion using vLLM or OpenAI
 */

import { useState, useCallback } from 'react';

interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  prompt?: string;
  stopSequences?: string[];
}

interface CompletionResponse {
  text: string;
  tokens: number;
  model: string;
}

/**
 * AI Completion Hook
 */
export function useAICompletion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCompletion = useCallback(
    async (
      text: string,
      options: CompletionOptions = {}
    ): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Try vLLM first (local, free)
        const completion = await getVLLMCompletion(text, options);
        if (completion) {
          setIsLoading(false);
          return completion.text;
        }

        // Fallback to OpenAI if vLLM unavailable
        const openaiCompletion = await getOpenAICompletion(text, options);
        setIsLoading(false);
        return openaiCompletion?.text || null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Completion failed');
        setIsLoading(false);
        return null;
      }
    },
    []
  );

  return { getCompletion, isLoading, error };
}

/**
 * Get completion from vLLM (local)
 */
async function getVLLMCompletion(
  text: string,
  options: CompletionOptions
): Promise<CompletionResponse | null> {
  try {
    const response = await fetch('http://localhost:8000/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-2-7b-chat-hf',
        prompt: options.prompt ? `${options.prompt}\n\n${text}` : text,
        max_tokens: options.maxTokens || 50,
        temperature: options.temperature || 0.7,
        stop: options.stopSequences || ['\n\n', '###'],
      }),
    });

    if (!response.ok) {
      throw new Error('vLLM request failed');
    }

    const data = await response.json();
    return {
      text: data.choices[0].text.trim(),
      tokens: data.usage.total_tokens,
      model: 'vllm-local',
    };
  } catch (error) {
    logger.warn('vLLM unavailable, will try fallback');
    return null;
  }
}

/**
 * Get completion from OpenAI (fallback)
 */
async function getOpenAICompletion(
  text: string,
  options: CompletionOptions
): Promise<CompletionResponse | null> {
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    logger.warn('OpenAI API key not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: options.prompt ? `${options.prompt}\n\n${text}` : text,
        max_tokens: options.maxTokens || 50,
        temperature: options.temperature || 0.7,
        stop: options.stopSequences || ['\n\n'],
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI request failed');
    }

    const data = await response.json();
    return {
      text: data.choices[0].text.trim(),
      tokens: data.usage.total_tokens,
      model: 'openai-gpt3.5',
    };
  } catch (error) {
    logger.error('OpenAI completion error:', error);
    return null;
  }
}

/**
 * AI Completion Service Class
 */
export class AICompletionService {
  private static instance: AICompletionService;

  static getInstance(): AICompletionService {
    if (!AICompletionService.instance) {
      AICompletionService.instance = new AICompletionService();
    }
    return AICompletionService.instance;
  }

  /**
   * Get text completion
   */
  async complete(text: string, options: CompletionOptions = {}): Promise<string> {
    // Try vLLM first
    const vllmResult = await getVLLMCompletion(text, options);
    if (vllmResult) {
      return vllmResult.text;
    }

    // Fallback to OpenAI
    const openaiResult = await getOpenAICompletion(text, options);
    if (openaiResult) {
      return openaiResult.text;
    }

    throw new Error('No AI service available');
  }

  /**
   * Get sentence completion
   */
  async completeSentence(text: string): Promise<string> {
    return this.complete(text, {
      maxTokens: 30,
      temperature: 0.7,
      stopSequences: ['.', '!', '?', '\n'],
    });
  }

  /**
   * Get paragraph completion
   */
  async completeParagraph(text: string): Promise<string> {
    return this.complete(text, {
      maxTokens: 100,
      temperature: 0.8,
      stopSequences: ['\n\n'],
    });
  }

  /**
   * Expand bullet point
   */
  async expandBulletPoint(bulletPoint: string): Promise<string> {
    return this.complete(bulletPoint, {
      maxTokens: 80,
      temperature: 0.7,
      prompt: 'Expand this bullet point into a detailed paragraph:',
    });
  }

  /**
   * Improve writing
   */
  async improveWriting(text: string): Promise<string> {
    return this.complete(text, {
      maxTokens: text.split(' ').length + 50,
      temperature: 0.5,
      prompt: 'Improve the clarity and style of this text:',
    });
  }

  /**
   * Change tone
   */
  async changeTone(
    text: string,
    tone: 'formal' | 'casual' | 'professional' | 'friendly'
  ): Promise<string> {
    return this.complete(text, {
      maxTokens: text.split(' ').length + 30,
      temperature: 0.6,
      prompt: `Rewrite this text in a ${tone} tone:`,
    });
  }

  /**
   * Fix grammar
   */
  async fixGrammar(text: string): Promise<string> {
    return this.complete(text, {
      maxTokens: text.split(' ').length + 20,
      temperature: 0.3,
      prompt: 'Fix grammar and spelling errors in this text:',
    });
  }

  /**
   * Generate title
   */
  async generateTitle(content: string): Promise<string> {
    const preview = content.substring(0, 500);
    return this.complete(preview, {
      maxTokens: 15,
      temperature: 0.7,
      prompt: 'Generate a concise title for this content:',
      stopSequences: ['\n'],
    });
  }

  /**
   * Continue writing
   */
  async continueWriting(text: string, style: 'creative' | 'technical' | 'casual' = 'casual'): Promise<string> {
    const temperatures = {
      creative: 0.9,
      technical: 0.5,
      casual: 0.7,
    };

    return this.complete(text, {
      maxTokens: 150,
      temperature: temperatures[style],
      prompt: `Continue writing in a ${style} style:`,
    });
  }
}
