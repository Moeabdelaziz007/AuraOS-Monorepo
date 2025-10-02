/**
 * AI Assistant Factory
 * Creates AI assistant instances based on provider configuration
 */

import { MCPGateway } from './mcp/gateway';
import { AnthropicAIAssistant } from './anthropic-assistant';
import { VLLMAIAssistant } from './vllm-assistant';

/**
 * AI Provider types
 */
export type AIProvider = 'anthropic' | 'vllm';

/**
 * Base AI Assistant interface
 * All assistant implementations must conform to this interface
 */
export interface IAIAssistant {
  chat(message: string, options?: any): Promise<string>;
  clearHistory(): void;
  getHistory(): any[];
  setSystemPrompt(prompt: string): void;
  getAvailableTools(): any[];
  getStats(): any;
}

/**
 * Configuration for Anthropic provider
 */
export interface AnthropicConfig {
  provider: 'anthropic';
  apiKey?: string;
}

/**
 * Configuration for vLLM provider
 */
export interface VLLMConfig {
  provider: 'vllm';
  vllmUrl?: string;
  modelName?: string;
}

/**
 * Union type for all provider configurations
 */
export type AIAssistantConfig = AnthropicConfig | VLLMConfig;

/**
 * Factory function to create AI assistant based on provider
 */
export async function createAIAssistant(
  gateway: MCPGateway,
  config: AIAssistantConfig
): Promise<IAIAssistant> {
  switch (config.provider) {
    case 'anthropic':
      return new AnthropicAIAssistant(gateway, config.apiKey);

    case 'vllm':
      return new VLLMAIAssistant(
        gateway,
        config.vllmUrl || 'http://localhost:8000/v1',
        config.modelName
      );

    default:
      throw new Error(`Unknown AI provider: ${(config as any).provider}`);
  }
}

/**
 * Get provider from environment variables
 */
export function getProviderFromEnv(): AIAssistantConfig {
  const provider = (process.env.AI_PROVIDER || 'anthropic') as AIProvider;

  switch (provider) {
    case 'anthropic':
      return {
        provider: 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY,
      };

    case 'vllm':
      return {
        provider: 'vllm',
        vllmUrl: process.env.VLLM_URL || 'http://localhost:8000/v1',
        modelName: process.env.VLLM_MODEL || 'meta-llama/Llama-3.1-8B-Instruct',
      };

    default:
      throw new Error(`Unknown AI provider in environment: ${provider}`);
  }
}

/**
 * Create AI assistant from environment configuration
 */
export async function createAIAssistantFromEnv(gateway: MCPGateway): Promise<IAIAssistant> {
  const config = getProviderFromEnv();
  return createAIAssistant(gateway, config);
}

/**
 * Validate provider configuration
 */
export function validateConfig(config: AIAssistantConfig): { valid: boolean; error?: string } {
  switch (config.provider) {
    case 'anthropic':
      if (!config.apiKey && !process.env.ANTHROPIC_API_KEY) {
        return {
          valid: false,
          error: 'Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable or provide apiKey in config.',
        };
      }
      return { valid: true };

    case 'vllm':
      // vLLM doesn't require API key, just validate URL format
      const url = config.vllmUrl || 'http://localhost:8000/v1';
      try {
        new URL(url);
        return { valid: true };
      } catch {
        return {
          valid: false,
          error: `Invalid vLLM URL: ${url}`,
        };
      }

    default:
      return {
        valid: false,
        error: `Unknown provider: ${(config as any).provider}`,
      };
  }
}

/**
 * Get available providers
 */
export function getAvailableProviders(): AIProvider[] {
  return ['anthropic', 'vllm'];
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: AIProvider): string {
  switch (provider) {
    case 'anthropic':
      return 'Anthropic Claude';
    case 'vllm':
      return 'vLLM (Self-Hosted)';
    default:
      return provider;
  }
}

/**
 * Get provider description
 */
export function getProviderDescription(provider: AIProvider): string {
  switch (provider) {
    case 'anthropic':
      return 'Cloud-based AI using Anthropic Claude models. Requires API key and internet connection.';
    case 'vllm':
      return 'Self-hosted open-source models using vLLM. No API key required, works offline.';
    default:
      return '';
  }
}

/**
 * Check if provider is available
 */
export async function isProviderAvailable(provider: AIProvider): Promise<boolean> {
  switch (provider) {
    case 'anthropic':
      return !!(process.env.ANTHROPIC_API_KEY);

    case 'vllm':
      // Try to ping vLLM server
      try {
        const url = process.env.VLLM_URL || 'http://localhost:8000/v1';
        const response = await fetch(`${url}/models`, { method: 'GET' });
        return response.ok;
      } catch {
        return false;
      }

    default:
      return false;
  }
}
