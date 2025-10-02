/**
 * Learning Loop Types
 * Defines the data structures for the self-learning system
 */

export interface UserInteraction {
  id: string;
  userId: string;
  timestamp: number;
  type: 'app_open' | 'app_close' | 'window_move' | 'window_resize' | 'ai_query' | 'command_execute' | 'error' | 'success';
  appId?: string;
  data: Record<string, any>;
  context: InteractionContext;
}

export interface InteractionContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  sessionDuration: number;
  previousAction?: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  screenSize: { width: number; height: number };
}

export interface UserPattern {
  userId: string;
  patterns: {
    mostUsedApps: Array<{ appId: string; count: number; avgDuration: number }>;
    preferredTimes: Record<string, number>;
    commonSequences: Array<{ sequence: string[]; frequency: number }>;
    errorPatterns: Array<{ error: string; context: string; frequency: number }>;
    successPatterns: Array<{ action: string; context: string; frequency: number }>;
  };
  preferences: {
    windowPositions: Record<string, { x: number; y: number }>;
    windowSizes: Record<string, { width: number; height: number }>;
    theme: string;
    aiProvider: string;
  };
  lastUpdated: number;
}

export interface LearningInsight {
  id: string;
  userId: string;
  type: 'suggestion' | 'optimization' | 'prediction' | 'warning';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  action?: {
    type: string;
    payload: any;
  };
  createdAt: number;
  appliedAt?: number;
}

export interface AIModelState {
  version: string;
  trainedAt: number;
  accuracy: number;
  totalInteractions: number;
  features: {
    appPrediction: boolean;
    windowOptimization: boolean;
    errorPrevention: boolean;
    smartSuggestions: boolean;
  };
}

export interface LearningMetrics {
  totalInteractions: number;
  uniqueUsers: number;
  avgSessionDuration: number;
  mostUsedApps: string[];
  errorRate: number;
  successRate: number;
  improvementRate: number;
  lastUpdated: number;
}

export interface SmartSuggestion {
  id: string;
  type: 'app' | 'action' | 'optimization' | 'tip';
  title: string;
  description: string;
  confidence: number;
  relevance: number;
  action?: () => void;
  dismissed?: boolean;
}
