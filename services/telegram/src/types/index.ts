/**
 * TypeScript types for AuraOS Telegram Bot
 */

export interface UserSession {
  userId: number;
  chatId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  messageCount: number;
  lastActivity: Date;
  preferences: UserPreferences;
  context: UserContext;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: boolean;
  autoSave: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface UserContext {
  currentCommand?: string;
  waitingForInput?: boolean;
  lastFile?: string;
  lastDirectory?: string;
  commandHistory: string[];
  aiContext: AIContext;
}

export interface AIContext {
  conversationHistory: ConversationMessage[];
  currentTask?: string;
  learningData: LearningData;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface LearningData {
  commandPatterns: Map<string, number>;
  userPreferences: Map<string, any>;
  taskHistory: TaskExecution[];
  feedback: UserFeedback[];
}

export interface TaskExecution {
  id: string;
  command: string;
  success: boolean;
  duration: number;
  timestamp: Date;
  result?: any;
  error?: string;
}

export interface UserFeedback {
  taskId: string;
  rating: number;
  comment?: string;
  timestamp: Date;
}

export interface BotConfig {
  token: string;
  adminChatId: number;
  adminUserIds: number[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  features: {
    ai: boolean;
    mcp: boolean;
    autopilot: boolean;
    learning: boolean;
    monitoring: boolean;
  };
  security: {
    enableWhitelist: boolean;
    whitelistUsers: number[];
    enableBlacklist: boolean;
    blacklistUsers: number[];
  };
}

export interface CommandHandler {
  command: string;
  description: string;
  handler: (ctx: CommandContext) => Promise<void>;
  adminOnly?: boolean;
  rateLimit?: number;
}

export interface CommandContext {
  bot: any;
  message: any;
  user: UserSession;
  args: string[];
  isAdmin: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: MCPParameter[];
  execute: (params: Record<string, any>) => Promise<MCPResult>;
}

export interface MCPParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  defaultValue?: any;
}

export interface MCPResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AutopilotTask {
  id: string;
  name: string;
  description: string;
  trigger: TaskTrigger;
  actions: TaskAction[];
  conditions: TaskCondition[];
  status: 'active' | 'inactive' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskTrigger {
  type: 'command' | 'schedule' | 'event' | 'condition';
  pattern?: string;
  schedule?: string;
  event?: string;
  condition?: string;
}

export interface TaskAction {
  type: 'command' | 'mcp' | 'ai' | 'notification';
  target: string;
  parameters: Record<string, any>;
  delay?: number;
}

export interface TaskCondition {
  type: 'user' | 'time' | 'system' | 'custom';
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'regex';
  value: any;
}

export interface AnalyticsData {
  totalMessages: number;
  totalCommands: number;
  activeUsers: number;
  commandUsage: Map<string, number>;
  userActivity: Map<number, UserActivity>;
  systemMetrics: SystemMetrics;
  startTime: Date;
}

export interface UserActivity {
  userId: number;
  messageCount: number;
  commandCount: number;
  lastActivity: Date;
  sessionDuration: number;
}

export interface SystemMetrics {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  diskUsage: DiskUsage;
  networkStats: NetworkStats;
}

export interface DiskUsage {
  total: number;
  used: number;
  free: number;
  percentage: number;
}

export interface NetworkStats {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
}

export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  filters: NotificationFilter[];
}

export interface NotificationChannel {
  type: 'telegram' | 'email' | 'webhook';
  config: Record<string, any>;
  enabled: boolean;
}

export interface NotificationFilter {
  type: 'user' | 'command' | 'error' | 'system';
  pattern: string;
  action: 'allow' | 'block';
}

export interface LearningInsight {
  type: 'pattern' | 'preference' | 'optimization' | 'prediction';
  data: any;
  confidence: number;
  timestamp: Date;
  actionable: boolean;
}

export interface BotResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}
