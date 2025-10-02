/**
 * AuraOS AI Package
 * Exports AI assistants, MCP gateway, and related types
 */

// AI Assistant Factory
export {
  createAIAssistant,
  createAIAssistantFromEnv,
  getProviderFromEnv,
  validateConfig,
  getAvailableProviders,
  getProviderDisplayName,
  getProviderDescription,
  isProviderAvailable,
  type IAIAssistant,
  type AIProvider,
  type AIAssistantConfig,
  type AnthropicConfig,
  type VLLMConfig,
} from './assistant-factory';

// MCP Gateway
export { MCPGateway } from './mcp/gateway';

// MCP Types
export type {
  IMCPServer,
  ToolRequest,
  ToolResponse,
  MCPGatewayConfig,
  AuthContext,
  LogEntry,
  ServerRegistryEntry,
  Tool,
} from './mcp/types';
