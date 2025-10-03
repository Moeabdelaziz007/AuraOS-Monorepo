/**
 * A2A (App-to-Agent) System Types
 * Type definitions for inter-agent and app-agent communication
 */

export enum MessageType {
  // Data operations
  DATA_REQUEST = 'data_request',
  DATA_RESPONSE = 'data_response',
  DATA_UPDATE = 'data_update',
  
  // Task operations
  TASK_REQUEST = 'task_request',
  TASK_RESPONSE = 'task_response',
  TASK_PROGRESS = 'task_progress',
  TASK_COMPLETE = 'task_complete',
  TASK_ERROR = 'task_error',
  
  // State operations
  STATE_UPDATE = 'state_update',
  STATE_QUERY = 'state_query',
  STATE_SYNC = 'state_sync',
  
  // Capability operations
  CAPABILITY_QUERY = 'capability_query',
  CAPABILITY_RESPONSE = 'capability_response',
  CAPABILITY_REGISTER = 'capability_register',
  
  // Collaboration
  COLLABORATION_REQUEST = 'collaboration_request',
  COLLABORATION_ACCEPT = 'collaboration_accept',
  COLLABORATION_REJECT = 'collaboration_reject',
  COLLABORATION_COMPLETE = 'collaboration_complete',
  
  // System
  HEARTBEAT = 'heartbeat',
  ERROR = 'error',
  ACK = 'ack'
}

export enum Priority {
  CRITICAL = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
  BACKGROUND = 4
}

export interface A2AMessage<T = any> {
  id: string;
  from: string;
  to: string | 'broadcast';
  type: MessageType;
  payload: T;
  priority: Priority;
  timestamp: number;
  requiresResponse: boolean;
  correlationId?: string; // For request-response pairing
  ttl?: number; // Time to live in ms
  metadata?: Record<string, any>;
}

export interface MessageHandler<T = any> {
  (message: A2AMessage<T>): Promise<void> | void;
}

export interface MessageFilter {
  type?: MessageType | MessageType[];
  from?: string | string[];
  to?: string | string[];
  priority?: Priority | Priority[];
}

export interface MessageSubscription {
  id: string;
  filter: MessageFilter;
  handler: MessageHandler;
  unsubscribe: () => void;
}

export interface MessageBusStats {
  totalMessages: number;
  messagesPerSecond: number;
  averageLatency: number;
  queueSize: number;
  activeSubscribers: number;
  errorRate: number;
}

export interface DataContract {
  dataType: string;
  schema: any; // JSON Schema
  version: string;
  accessLevel: AccessLevel;
  cachePolicy?: CachePolicy;
}

export enum AccessLevel {
  PUBLIC = 'public',
  PROTECTED = 'protected',
  PRIVATE = 'private'
}

export interface CachePolicy {
  enabled: boolean;
  ttl: number; // seconds
  maxSize: number; // bytes
  strategy: 'lru' | 'lfu' | 'fifo';
}

export interface AgentCapability {
  name: string;
  description: string;
  version: string;
  inputSchema: any;
  outputSchema: any;
  estimatedTime: number; // ms
  successRate: number; // 0-1
  cost: number; // resource cost
  tags: string[];
}

export interface CollaborationRequest {
  taskId: string;
  requiredCapability: string;
  input: any;
  deadline?: number;
  maxCost?: number;
  minSuccessRate?: number;
}

export interface CollaborationResponse {
  accepted: boolean;
  estimatedTime?: number;
  estimatedCost?: number;
  reason?: string;
}
