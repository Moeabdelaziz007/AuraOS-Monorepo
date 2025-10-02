/**
 * Autopilot System Types
 * Defines the autonomous agent system powered by learning loop
 */

export interface AutopilotTask {
  id: string;
  userId: string;
  description: string;
  status: 'pending' | 'planning' | 'executing' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  steps: AutopilotStep[];
  currentStep: number;
  result?: any;
  error?: string;
  confidence: number;
  learnedFrom?: string[]; // IDs of similar past tasks
}

export interface AutopilotStep {
  id: string;
  action: string;
  params: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  duration?: number;
  confidence: number;
  alternatives?: AutopilotStep[];
}

export interface AutopilotCapability {
  id: string;
  name: string;
  description: string;
  category: 'file' | 'app' | 'system' | 'ai' | 'automation' | 'data';
  complexity: 'simple' | 'medium' | 'complex';
  successRate: number;
  usageCount: number;
  avgDuration: number;
  lastUsed?: number;
}

export interface AutopilotContext {
  userId: string;
  sessionId: string;
  currentApps: string[];
  recentActions: string[];
  userPatterns: any;
  systemState: {
    memory: number;
    cpu: number;
    activeWindows: number;
  };
  timeContext: {
    timeOfDay: string;
    dayOfWeek: string;
    isWorkingHours: boolean;
  };
}

export interface AutopilotDecision {
  taskId: string;
  decision: 'execute' | 'ask_user' | 'defer' | 'reject';
  reason: string;
  confidence: number;
  estimatedDuration: number;
  risks: string[];
  benefits: string[];
  alternatives?: Array<{
    description: string;
    confidence: number;
  }>;
}

export interface AutopilotLearning {
  taskId: string;
  success: boolean;
  duration: number;
  stepsExecuted: number;
  userFeedback?: 'positive' | 'negative' | 'neutral';
  improvements: string[];
  patterns: string[];
  timestamp: number;
}

export type AutopilotMode = 'manual' | 'assisted' | 'autonomous';

export interface AutopilotConfig {
  mode: AutopilotMode;
  autoApprove: boolean;
  maxConcurrentTasks: number;
  learningEnabled: boolean;
  riskTolerance: 'low' | 'medium' | 'high';
  notifyOnCompletion: boolean;
}
