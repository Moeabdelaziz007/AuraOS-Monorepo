/**
 * AuraOS Core Package
 * Exports MCP servers, learning loop, and autopilot system
 */

// MCP Servers
export { FileSystemMCPServer } from './mcp/filesystem';
export { EmulatorControlMCPServer } from './mcp/emulator';

// Learning System (Brain)
export { LearningEngine } from './learning/engine';
export { BehaviorTracker, initTracker, getTracker } from './learning/tracker';
export { learningStorage, LearningStorage } from './learning/storage';
export type {
  UserInteraction,
  InteractionContext,
  UserPattern,
  LearningInsight,
  AIModelState,
  LearningMetrics,
  SmartSuggestion,
} from './learning/types';

// Autopilot System (Body)
export { AutopilotSystem } from './autopilot/autopilot';
export type {
  AutopilotTask,
  AutopilotStep,
  AutopilotCapability,
  AutopilotContext,
  AutopilotDecision,
  AutopilotLearning,
  AutopilotMode,
  AutopilotConfig,
} from './autopilot/types';
