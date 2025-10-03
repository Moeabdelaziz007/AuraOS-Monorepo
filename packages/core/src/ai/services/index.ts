/**
 * AI Service Factory
 * Provides unified interface to all AI providers
 */

import { geminiService } from './gemini.service';
import { zaiService } from './zai.service';
import { AIProvider, getProviderForFeature } from '../config';
import { BaseAIService, AIMessage, AIResponse, AIRequestOptions } from './base.service';

/**
 * Get AI service instance for a provider
 */
export function getAIService(provider: AIProvider): BaseAIService {
  switch (provider) {
    case 'gemini':
      return geminiService;
    case 'zai':
      return zaiService;
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * Get AI service for a specific feature
 */
export function getAIServiceForFeature(
  feature: 'chat' | 'notes' | 'automation' | 'learningLoop' | 'autopilot' | 'mcpTools' | 'telegramBot'
): BaseAIService {
  const provider = getProviderForFeature(feature);
  return getAIService(provider);
}

/**
 * Unified AI interface for the application
 */
export const aiService = {
  /**
   * Chat with AI (uses default chat provider)
   */
  async chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    const service = getAIServiceForFeature('chat');
    return service.chat(messages, options);
  },

  /**
   * Stream chat with AI
   */
  async chatStream(
    messages: AIMessage[],
    options: AIRequestOptions,
    onChunk: (chunk: { content: string; done: boolean }) => void
  ): Promise<void> {
    const service = getAIServiceForFeature('chat');
    return service.chatStream(messages, options, onChunk);
  },

  /**
   * Generate embeddings
   */
  async embed(text: string, provider?: AIProvider): Promise<number[]> {
    const service = provider ? getAIService(provider) : getAIServiceForFeature('chat');
    return service.embed(text);
  },

  /**
   * AI for notes enhancement
   */
  async enhanceNote(content: string, instruction: string): Promise<string> {
    const service = getAIServiceForFeature('notes');
    const response = await service.chat([
      {
        role: 'system',
        content: 'You are a helpful assistant that enhances notes and documents.',
      },
      {
        role: 'user',
        content: `${instruction}\n\nContent:\n${content}`,
      },
    ]);
    return response.content;
  },

  /**
   * AI for automation tasks
   */
  async generateAutomation(description: string): Promise<string> {
    const service = getAIServiceForFeature('automation');
    const response = await service.chat([
      {
        role: 'system',
        content: 'You are an automation expert. Generate automation scripts based on user descriptions.',
      },
      {
        role: 'user',
        content: description,
      },
    ]);
    return response.content;
  },

  /**
   * AI for learning loop analysis
   */
  async analyzeLearningPattern(data: any): Promise<string> {
    const service = getAIServiceForFeature('learningLoop');
    const response = await service.chat([
      {
        role: 'system',
        content: 'You are a learning analytics expert. Analyze user behavior patterns and provide insights.',
      },
      {
        role: 'user',
        content: `Analyze this user activity data and provide insights:\n${JSON.stringify(data, null, 2)}`,
      },
    ]);
    return response.content;
  },

  /**
   * AI for autopilot suggestions
   */
  async getAutopilotSuggestion(context: any): Promise<string> {
    const service = getAIServiceForFeature('autopilot');
    const response = await service.chat([
      {
        role: 'system',
        content: 'You are an intelligent autopilot assistant. Suggest next actions based on user context.',
      },
      {
        role: 'user',
        content: `Based on this context, suggest the next action:\n${JSON.stringify(context, null, 2)}`,
      },
    ]);
    return response.content;
  },

  /**
   * AI for MCP tools
   * 
   * BUG FIX: Added proper error handling for JSON.parse
   * Previous implementation would crash if AI returned non-JSON response
   * Now provides clear error message with context
   */
  async executeMCPTool(toolName: string, params: any): Promise<any> {
    const service = getAIServiceForFeature('mcpTools');
    const response = await service.chat([
      {
        role: 'system',
        content: 'You are an MCP (Model Context Protocol) tool executor. Always respond with valid JSON.',
      },
      {
        role: 'user',
        content: `Execute tool: ${toolName}\nParameters: ${JSON.stringify(params, null, 2)}`,
      },
    ]);
    
    try {
      return JSON.parse(response.content);
    } catch (error) {
      throw new Error(
        `Failed to parse MCP tool response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
        `Response content: ${response.content.substring(0, 200)}...`
      );
    }
  },
};

// Export services
export { geminiService } from './gemini.service';
export { zaiService } from './zai.service';
export * from './base.service';
