/**
 * AI Configuration
 * API keys and settings for AI services (z.ai and Gemini)
 */

export const AI_CONFIG = {
  // Gemini API Configuration
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: {
      chat: 'gemini-pro',
      vision: 'gemini-pro-vision',
      embedding: 'embedding-001',
    },
    defaultParams: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  },

  // z.ai API Configuration
  zai: {
    apiKey: import.meta.env.VITE_ZAI_API_KEY || '',
    baseUrl: 'https://api.z.ai/v1',
    models: {
      chat: 'z-chat-v1',
      completion: 'z-complete-v1',
    },
    defaultParams: {
      temperature: 0.7,
      maxTokens: 2048,
    },
  },

  // Feature flags for AI capabilities
  features: {
    aiChat: true,
    aiNotes: true,
    aiAutomation: true,
    learningLoop: true,
    autopilot: true,
    mcpTools: true,
    telegramBot: true,
    codeAssistant: true,
    imageGeneration: false, // Gemini Pro Vision for analysis only
  },

  // Default AI provider for different features
  providers: {
    chat: 'gemini', // 'gemini' | 'zai'
    notes: 'gemini',
    automation: 'zai',
    learningLoop: 'gemini',
    autopilot: 'zai',
    mcpTools: 'gemini',
    telegramBot: 'gemini',
  },

  // Rate limiting
  rateLimits: {
    gemini: {
      requestsPerMinute: 60,
      requestsPerDay: 1500,
    },
    zai: {
      requestsPerMinute: 100,
      requestsPerDay: 10000,
    },
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    backoffMs: 1000,
    backoffMultiplier: 2,
  },
} as const;

export type AIProvider = 'gemini' | 'zai';
export type AIFeature = keyof typeof AI_CONFIG.features;
export type AIModel = string;

/**
 * Get API key for a provider
 */
export function getApiKey(provider: AIProvider): string {
  return AI_CONFIG[provider].apiKey;
}

/**
 * Get base URL for a provider
 */
export function getBaseUrl(provider: AIProvider): string {
  return AI_CONFIG[provider].baseUrl;
}

/**
 * Get default provider for a feature
 */
export function getProviderForFeature(feature: keyof typeof AI_CONFIG.providers): AIProvider {
  return AI_CONFIG.providers[feature];
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: AIFeature): boolean {
  return AI_CONFIG.features[feature];
}

/**
 * Get model for a provider and type
 */
export function getModel(provider: AIProvider, type: string): string {
  const models = AI_CONFIG[provider].models as Record<string, string>;
  return models[type] || models.chat || '';
}
