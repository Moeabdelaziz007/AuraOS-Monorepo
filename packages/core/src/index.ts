/**
 * AuraOS Core
 * Core business logic and services
 */

export * from './ai';
export * from './learning';

// MCP servers are Node.js-only and should not be imported in browser code
// Import them separately in backend code: import { FileSystemMCPServer } from '@auraos/core/mcp'
// export * from './mcp';
